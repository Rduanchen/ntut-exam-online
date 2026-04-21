import { Request, Response } from "express";
import fsp from "node:fs/promises";
import path from "node:path";
import {
  questionConfig,
  UPLOAD_DIR,
  TO_JUDGE_DIR,
  LANGUAGE_EXTENSION_MAP,
  QUESTION_PDF_PATH,
} from "../constant/config.js";
import { appendLog } from "../services/logger.service.js";
import { zipDirectory } from "../services/file-transfer.service.js";
import { submitToJudger } from "../services/judge.service.js";
import { redactHiddenOutput } from "../utils/redact.js";

export function getQuestions(_req: Request, res: Response) {
  const questions = questionConfig.map((q, index) => ({
    id: index,
    name: q.name,
    language: q.language,
  }));
  res.json(questions);
}

export async function uploadFile(req: Request, res: Response) {
  const { studentId, questionId } = req.body;

  if (!studentId || questionId === undefined) {
    if (req.file) await fsp.unlink(req.file.path).catch(() => { });
    res.status(400).json({ error: "studentId and questionId are required" });
    return;
  }

  const question = questionConfig[Number(questionId)];
  if (!question) {
    if (req.file) await fsp.unlink(req.file.path).catch(() => { });
    res.status(400).json({ error: "Invalid questionId" });
    return;
  }

  const ip = (req.ip || "unknown").replace(/[.:]/g, "_");
  const ext = LANGUAGE_EXTENSION_MAP[question.language] || ".txt";
  const destDir = path.join(UPLOAD_DIR, `${ip}_${studentId}`);
  await fsp.mkdir(destDir, { recursive: true });

  const destPath = path.join(destDir, `${questionId}${ext}`);
  await fsp.rename(req.file!.path, destPath);

  await appendLog(
    "UPLOAD",
    `studentId=${studentId} questionId=${questionId} ip=${req.ip} file=${questionId}${ext}`,
  );

  res.json({ message: "File uploaded successfully", path: destPath });
}

export async function judge(req: Request, res: Response) {
  const { studentId } = req.body;

  if (!studentId) {
    res.status(400).json({ error: "studentId is required" });
    return;
  }

  const entries = await fsp.readdir(UPLOAD_DIR);
  const studentDir = entries.find((e) => e.endsWith(`_${studentId}`));
  if (!studentDir) {
    res.status(404).json({ error: "No submission found for this student" });
    return;
  }

  const studentPath = path.join(UPLOAD_DIR, studentDir);
  const zipName = `${studentDir}.zip`;
  const zipPath = path.join(TO_JUDGE_DIR, zipName);

  await zipDirectory(studentPath, zipPath);
  await appendLog("JUDGE", `studentId=${studentId} zipPath=${zipPath}`);

  const result = await submitToJudger(zipPath);
  res.json(redactHiddenOutput(result));
}

export async function getPdf(_req: Request, res: Response) {
  try {
    await fsp.access(QUESTION_PDF_PATH);
  } catch {
    res.status(404).json({ error: "question.pdf not found" });
    return;
  }
  res.sendFile(QUESTION_PDF_PATH, { headers: { 'Content-Type': 'application/pdf' } });
}
