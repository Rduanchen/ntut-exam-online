import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// Resolve the backend's env file consistently from src/ and dist/, regardless of cwd.
dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)), quiet: true });

export interface QuestionConfig {
    name: string;
    language: string;
}

export const JUDGER_URL = process.env.JUDGER_URL || 'http://localhost:3002/code/judge-from-file';

export const V2_API_URL = process.env.V2_API_URL || 'http://localhost:3000';
// The host rejects empty/default credentials. Configure the same non-default
// token on both services instead of silently sending an unusable placeholder.
export const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

export const TARGET_FOLDER = process.env.TARGET_FOLDER || path.resolve('target');
export const USER_PORT = Number(process.env.USER_PORT) || 3003;
export const ADMIN_PORT = Number(process.env.ADMIN_PORT) || 3004;

export const FRONTEND_DIST_DIR = process.env.FRONTEND_DIST_DIR || path.resolve('..', 'frontend', 'dist');
export const TA_DIST_DIR = process.env.TA_DIST_DIR || path.resolve('..', 'ta', 'dist');

export const UPLOAD_DIR = path.resolve('upload');
export const TO_JUDGE_DIR = path.resolve('to-judge');
export const EXAM_ZIP_PATH = path.resolve('exam.zip');

export const LANGUAGE_EXTENSION_MAP: Record<string, string> = {
    c: '.c',
    cpp: '.cpp',
    'c++': '.cpp',
    java: '.java',
    python: '.py',
    javascript: '.js',
    typescript: '.ts',
};
