import { afterEach, expect, it, vi } from 'vitest';
const api = vi.hoisted(() => ({ post: vi.fn(), get: vi.fn() }));
vi.mock('axios', () => ({ default: { create: () => api } }));
import { judgeSubmission } from '../src/services/api';

afterEach(() => { vi.useRealTimers(); vi.resetAllMocks(); });

it('polls the accepted job until its redacted results are ready', async () => {
  vi.useFakeTimers();
  const results = { Q1: { subtasks: [] } };
  api.post.mockResolvedValue({ status: 202, data: { jobId: 'job-1' } });
  api.get.mockResolvedValueOnce({ status: 202, data: { state: 'running' } })
    .mockResolvedValueOnce({ status: 200, data: results });
  const pending = judgeSubmission('111');
  await vi.advanceTimersByTimeAsync(2000);
  expect(await pending).toEqual(results);
  expect(api.post).toHaveBeenCalledTimes(1);
  expect(api.get).toHaveBeenCalledTimes(2);
  expect(api.get).toHaveBeenCalledWith('/judge/jobs/job-1', { params: { studentId: '111' }, timeout: 35_000 });
});

it('accepts results from synchronous hosts without polling', async () => {
  const results = { Q1: { subtasks: [] } };
  api.post.mockResolvedValue({ status: 200, data: results });
  expect(await judgeSubmission('111')).toEqual(results);
  expect(api.get).not.toHaveBeenCalled();
});

it('propagates job failures so the page can exit the judging state', async () => {
  vi.useFakeTimers();
  api.post.mockResolvedValue({ status: 202, data: { jobId: 'job-1' } });
  api.get.mockRejectedValue(new Error('System error'));
  const assertion = expect(judgeSubmission('111')).rejects.toThrow('System error');
  await vi.advanceTimersByTimeAsync(1000);
  await assertion;
});
