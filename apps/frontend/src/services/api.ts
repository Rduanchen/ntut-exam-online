import axios from 'axios';
import type { ScoreBoardFormat } from '@my-project/types';

const api = axios.create({
    baseURL: '/api',
});

export interface Question {
    id: number;
    name: string;
    language: string;
}

export async function fetchQuestions(): Promise<Question[]> {
    const { data } = await api.get<Question[]>('/questions');
    return data;
}

export async function uploadFile(studentId: string, questionId: number, file: File): Promise<{ message: string; path: string }> {
    const form = new FormData();
    form.append('studentId', studentId);
    form.append('questionId', String(questionId));
    form.append('file', file);
    const { data } = await api.post<{ message: string; path: string }>('/upload-file', form);
    return data;
}

export async function judgeSubmission(studentId: string): Promise<ScoreBoardFormat> {
    const { data } = await api.post<ScoreBoardFormat>('/judge', { studentId });
    return data;
}
