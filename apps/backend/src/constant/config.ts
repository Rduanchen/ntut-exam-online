import path from 'node:path';

export interface QuestionConfig {
    name: string;
    language: string;
}

export const JUDGER_URL = process.env.JUDGER_URL || 'http://localhost:3002/code/judge-from-file';

export const questionConfig: QuestionConfig[] = [
    { name: 'Q1', language: 'c' },
    { name: 'Q2', language: 'c' },
    { name: 'Q3', language: 'c' },
    { name: 'Q4', language: 'python' },
];

export const TARGET_FOLDER = process.env.TARGET_FOLDER || path.resolve('target');
export const USER_PORT = Number(process.env.USER_PORT) || 3003;
export const ADMIN_PORT = Number(process.env.ADMIN_PORT) || 3004;

export const UPLOAD_DIR = path.resolve('upload');
export const TO_JUDGE_DIR = path.resolve('to-judge');

export const LANGUAGE_EXTENSION_MAP: Record<string, string> = {
    c: '.c',
    cpp: '.cpp',
    'c++': '.cpp',
    java: '.java',
    python: '.py',
    javascript: '.js',
    typescript: '.ts',
};
