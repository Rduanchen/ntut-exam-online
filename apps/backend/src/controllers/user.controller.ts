import { Request, Response } from "express";
import fsp from "node:fs/promises";
import {
  V2_API_URL,
  ADMIN_TOKEN,
  EXAM_ZIP_PATH,
} from "../constant/config.js";
import { appendLog } from "../services/logger.service.js";
import { redactHiddenOutput } from "../utils/redact.js";

export async function getQuestions(_req: Request, res: Response) {
  try {
    const configRes = await fetch(`${V2_API_URL}/admin/config`, {
      headers: { "x-admin-token": ADMIN_TOKEN }
    });
    if (!configRes.ok) {
      const hint = configRes.status === 404
        ? 'Check V2_API_URL points to the host admin port, not the student port.'
        : configRes.status === 401
          ? 'Check ADMIN_TOKEN matches the running host backend.'
          : 'Check the host backend is configured and available.';
      console.error(`GET ${V2_API_URL}/admin/config returned ${configRes.status}. ${hint}`);
      res.status(502).json({ error: `Failed to load questions from host (${configRes.status}). ${hint}` });
      return;
    }
    const config = await configRes.json();
    const questions = [];
    for (const section of config.sections || []) {
      for (const puzzle of section.puzzles || []) {
        questions.push({
          id: puzzle.id,
          name: puzzle.title,
          language: puzzle.language,
        });
      }
    }
    res.json(questions);
  } catch (error: any) {
    console.error("getQuestions error:", error);
    res.status(500).json({ error: "Failed to load questions from V2 API" });
  }
}

export async function uploadFile(req: Request, res: Response) {
  const { studentId, questionId } = req.body;

  if (!studentId || !questionId) {
    if (req.file) await fsp.unlink(req.file.path).catch(() => { });
    res.status(400).json({ error: "studentId and questionId are required" });
    return;
  }

  if (!req.file) {
    res.status(400).json({ error: "file is required" });
    return;
  }

  try {
    // Read the uploaded file
    const codeContent = await fsp.readFile(req.file.path, 'utf8');

    // Get language from config
    const configRes = await fetch(`${V2_API_URL}/admin/config`, {
      headers: { "x-admin-token": ADMIN_TOKEN }
    });
    if (!configRes.ok) {
      throw new Error(`Failed to fetch host exam config: ${configRes.status}`);
    }
    const config = await configRes.json();
    const puzzle = (config.sections || [])
      .flatMap((section: { puzzles?: Array<{ id: string; language: string }> }) => section.puzzles || [])
      .find((entry: { id: string }) => entry.id === questionId);
    if (!puzzle) {
      res.status(400).json({ error: `Invalid questionId '${questionId}'` });
      return;
    }

    const payload = {
      questionId,
      language: puzzle.language,
      codeContent
    };

    const uploadRes = await fetch(`${V2_API_URL}/admin/submissions/${studentId}/code`, {
      method: "POST",
      headers: {
        "x-admin-token": ADMIN_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!uploadRes.ok) {
      const text = await uploadRes.text();
      throw new Error(`Upload to V2 failed: ${uploadRes.status} ${text}`);
    }

    await appendLog(
      "UPLOAD",
      `studentId=${studentId} questionId=${questionId} ip=${req.ip}`
    );

    res.json({ message: "File uploaded successfully" });
  } catch (error: any) {
    console.error("uploadFile error:", error);
    res.status(500).json({ error: "Failed to upload file to V2 API" });
  } finally {
    if (req.file) {
      await fsp.unlink(req.file.path).catch(() => { });
    }
  }
}

export async function judge(req: Request, res: Response) {
  const { studentId } = req.body;

  if (!studentId) {
    res.status(400).json({ error: "studentId is required" });
    return;
  }

  try {
    const judgeRes = await fetch(`${V2_API_URL}/admin/judger/judge/${studentId}`, {
      method: "POST",
      headers: {
        "x-admin-token": ADMIN_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    });

    if (!judgeRes.ok) {
      throw new Error(`Judge via V2 failed: ${judgeRes.statusText}`);
    }

    const resultData = await judgeRes.json();

    if (judgeRes.status === 202) {
      if (typeof resultData.jobId !== "string" || !resultData.jobId) {
        throw new Error("V2 accepted judging without a jobId");
      }
      await appendLog("JUDGE", `studentId=${studentId} jobId=${resultData.jobId}`);
      res.status(202).json({ jobId: resultData.jobId });
      return;
    }
    
    await appendLog("JUDGE", `studentId=${studentId}`);

    // Compatibility with hosts that still return synchronous results.
    res.json(redactHiddenOutput(resultData.results));
  } catch (error: any) {
    console.error("judge error:", error);
    res.status(500).json({ error: "Failed to judge via V2 API" });
  }
}

export async function getJudgeJob(req: Request, res: Response) {
  const { studentId } = req.query;
  if (typeof studentId !== "string" || !studentId) {
    res.status(400).json({ error: "studentId is required" });
    return;
  }

  try {
    const jobRes = await fetch(`${V2_API_URL}/admin/judger/jobs/${encodeURIComponent(String(req.params.jobId))}`, {
      headers: { "x-admin-token": ADMIN_TOKEN },
      signal: AbortSignal.timeout(30_000),
    });
    if (!jobRes.ok) throw new Error(`V2 job query failed: ${jobRes.status}`);
    const job = await jobRes.json();
    if (job.testId !== studentId) {
      res.status(404).json({ error: "Judging job not found for student" });
      return;
    }
    if (job.state === "waiting" || job.state === "running") {
      res.status(202).json({ jobId: req.params.jobId, state: job.state });
      return;
    }
    if (job.state !== "finished" || !job.outcome || job.outcome.systemFailures !== 0) {
      throw new Error("V2 judging did not finish successfully");
    }

    const scoresRes = await fetch(`${V2_API_URL}/admin/scores`, {
      headers: { "x-admin-token": ADMIN_TOKEN },
      signal: AbortSignal.timeout(30_000),
    });
    if (!scoresRes.ok) throw new Error(`V2 scores query failed: ${scoresRes.status}`);
    const scores = await scoresRes.json();
    const score = scores.find((entry: { testId: string }) => entry.testId === studentId);
    if (!score) throw new Error("V2 returned no scoreboard for student");
    res.json(redactHiddenOutput(score.puzzleResults));
  } catch (error) {
    console.error("getJudgeJob error:", error);
    res.status(502).json({ error: "Failed to retrieve judging results from V2 API" });
  }
}

export async function getPdf(_req: Request, res: Response) {
  try {
    await fsp.access(EXAM_ZIP_PATH);
  } catch {
    res.status(404).json({ error: "exam.zip not found" });
    return;
  }
  res.sendFile(EXAM_ZIP_PATH, { headers: { 'Content-Type': 'application/zip', 'Content-Disposition': 'attachment; filename="exam.zip"' } });
}
