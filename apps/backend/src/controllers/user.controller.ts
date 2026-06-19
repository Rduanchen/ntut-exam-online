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
      throw new Error(`Failed to fetch config from V2: ${configRes.statusText}`);
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
    let language = 'C'; // fallback
    if (configRes.ok) {
      const config = await configRes.json();
      for (const section of config.sections || []) {
        for (const puzzle of section.puzzles || []) {
          if (puzzle.id === questionId) {
            language = puzzle.language;
            break;
          }
        }
      }
    }

    const payload = {
      questionId,
      language,
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
    
    await appendLog("JUDGE", `studentId=${studentId}`);

    // V2 API returns { message, testId, results }
    // We extract results and redact hidden outputs
    res.json(redactHiddenOutput(resultData.results));
  } catch (error: any) {
    console.error("judge error:", error);
    res.status(500).json({ error: "Failed to judge via V2 API" });
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
