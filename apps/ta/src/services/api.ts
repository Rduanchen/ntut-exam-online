import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

export type FileList = Record<string, string[]>;

export async function fetchFileList(): Promise<FileList> {
    const { data } = await api.get<FileList>('/file-list');
    return data;
}

export async function fetchLogs(): Promise<string> {
    const { data } = await api.get<string>('/log');
    return data;
}

export async function moveFile(filename: string, newFileName: string): Promise<{ message: string }> {
    const { data } = await api.put<{ message: string }>('/move-file', { filename, newFileName });
    return data;
}
