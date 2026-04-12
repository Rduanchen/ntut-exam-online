import { Request, Response } from 'express';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { UPLOAD_DIR, TO_JUDGE_DIR, TARGET_FOLDER } from '../constant/config.js';
import { appendLog, readLogs } from '../services/logger.service.js';
import { zipDirectory, zipFile } from '../services/file-transfer.service.js';

function safePath(base: string, userInput: string): string {
    const resolved = path.resolve(base, userInput);
    if (!resolved.startsWith(base + path.sep) && resolved !== base) {
        throw new Error('Invalid path');
    }
    return resolved;
}

export async function getLogs(_req: Request, res: Response) {
    const logs = await readLogs();
    res.type('text/plain').send(logs);
}

export async function getFileList(_req: Request, res: Response) {
    try {
        const entries = await fsp.readdir(UPLOAD_DIR);
        const result: Record<string, string[]> = {};

        for (const entry of entries) {
            if (entry === '.tmp') continue;
            const entryPath = path.join(UPLOAD_DIR, entry);
            const stat = await fsp.stat(entryPath);
            if (stat.isDirectory()) {
                result[entry] = await fsp.readdir(entryPath);
            }
        }

        res.json(result);
    } catch {
        res.json({});
    }
}

export async function moveFile(req: Request, res: Response) {
    const { filename, newFileName } = req.body;

    if (!filename || !newFileName) {
        res.status(400).json({ error: 'filename and newFileName are required' });
        return;
    }

    let sourcePath: string;
    try {
        sourcePath = safePath(UPLOAD_DIR, filename);
    } catch {
        res.status(400).json({ error: 'Invalid filename' });
        return;
    }

    try {
        await fsp.access(sourcePath);
    } catch {
        res.status(404).json({ error: 'Source file/directory not found' });
        return;
    }

    const zipName = `${newFileName}.zip`;
    const toJudgePath = path.join(TO_JUDGE_DIR, zipName);

    const stat = await fsp.stat(sourcePath);
    if (stat.isDirectory()) {
        await zipDirectory(sourcePath, toJudgePath);
    } else {
        await zipFile(sourcePath, toJudgePath);
    }

    const targetPath = path.join(TARGET_FOLDER, zipName);
    await fsp.copyFile(toJudgePath, targetPath);

    await appendLog('MOVE', `filename=${filename} newFileName=${newFileName} targetPath=${targetPath}`);

    res.json({ message: 'File moved successfully', toJudgePath, targetPath });
}
