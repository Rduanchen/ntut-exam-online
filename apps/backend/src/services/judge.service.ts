import pLimit from 'p-limit';
import axios from 'axios';
import { JUDGER_URL } from '../constant/config.js';
import type { ScoreBoardFormat } from '@my-project/types';

const limit = pLimit(10);

export async function submitToJudger(zipFilePath: string): Promise<ScoreBoardFormat> {
    return limit(async () => {
        const response = await axios.post<{ data: { result: ScoreBoardFormat } }>(JUDGER_URL, {
            filePath: zipFilePath,
        });
        return response.data.data.result;
    });
}
