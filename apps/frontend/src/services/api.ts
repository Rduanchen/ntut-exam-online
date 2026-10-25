import axios from 'axios';
import type { ScoreBoardFormat } from '@my-project/types';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

export interface Question {
    id: string;
    name: string;
    language: string;
}

export async function fetchQuestions(): Promise<Question[]> {
    const { data } = await api.get<Question[]>('/questions');
    return data;
}

export async function uploadFile(studentId: string, questionId: string, file: File): Promise<{ message: string; path: string }> {
    const form = new FormData();
    form.append('studentId', studentId);
    form.append('questionId', questionId);
    form.append('file', file);
    const { data } = await api.post<{ message: string; path: string }>('/upload-file', form);
    return data;
}

export async function judgeSubmission(studentId: string): Promise<ScoreBoardFormat> {
    const response = await api.post<ScoreBoardFormat | { jobId: string }>('/judge', { studentId });
    if (response.status !== 202) return response.data as ScoreBoardFormat;

    const { jobId } = response.data as { jobId: string };
    if (typeof jobId !== 'string' || !jobId) throw new Error('Missing judging job ID');
    const deadline = Date.now() + 15 * 60_000;
    while (Date.now() < deadline) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const result = await api.get<ScoreBoardFormat>(`/judge/jobs/${encodeURIComponent(jobId)}`, {
            params: { studentId },
            timeout: 35_000,
        });
        if (result.status !== 202) return result.data;
    }
    throw new Error('Timed out waiting for judging results');
}

export async function checkPdfExists(): Promise<boolean> {
    try {
        await api.head('/pdf');
        return true;
    } catch {
        return false;
    }
}

export function getPdfUrl(): string {
    return (import.meta.env.VITE_API_BASE_URL || '/api') + '/pdf';
}
