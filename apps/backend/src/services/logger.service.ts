import fs from 'node:fs/promises';
import path from 'node:path';

const LOG_FILE = path.resolve('app.log');

export async function appendLog(action: string, detail: string): Promise<void> {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] [${action}] ${detail}\n`;
    await fs.appendFile(LOG_FILE, line, 'utf-8');
}

export async function readLogs(): Promise<string> {
    try {
        return await fs.readFile(LOG_FILE, 'utf-8');
    } catch {
        return '';
    }
}
