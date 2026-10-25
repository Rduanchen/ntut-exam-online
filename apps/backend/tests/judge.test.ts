import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { judge, getJudgeJob } from '../src/controllers/user.controller.js';

vi.mock('../src/services/logger.service.js', () => ({ appendLog: vi.fn() }));

const scoreboard = {
  Q1: { subtasks: [{ visible: [{ status: 'AC', userOutput: 'public', expectedOutput: 'public', time: '1ms' }],
    hidden: [{ status: 'AC', userOutput: 'secret', expectedOutput: 'secret', time: '1ms' }] }] },
};

function response() {
  return { status: vi.fn().mockReturnThis(), json: vi.fn() };
}
function mockFetch(...responses: Array<[number, unknown]>) {
  const fetch = vi.fn();
  for (const [status, body] of responses) {
    fetch.mockResolvedValueOnce({ ok: status < 400, status, json: async () => body });
  }
  vi.stubGlobal('fetch', fetch);
  return fetch;
}
async function query() {
  const res = response();
  await getJudgeJob({ params: { jobId: 'job-1' }, query: { studentId: '111' } } as unknown as Request, res as unknown as Response);
  return res;
}
afterEach(() => vi.unstubAllGlobals());

describe('V2 judging protocol', () => {
  it('returns the accepted job without attempting to redact absent results', async () => {
    mockFetch([202, { jobId: 'job-1', testId: '111', state: 'running' }]);
    const res = response();
    await judge({ body: { studentId: '111' } } as Request, res as unknown as Response);
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith({ jobId: 'job-1' });
  });
  it('still redacts synchronous host results', async () => {
    mockFetch([200, { results: scoreboard }]);
    const res = response();
    await judge({ body: { studentId: '111' } } as Request, res as unknown as Response);
    expect(JSON.stringify(res.json.mock.calls)).not.toContain('secret');
    expect(res.json.mock.calls[0][0].Q1.subtasks[0].visible[0].userOutput).toBe('public');
  });
  it.each(['waiting', 'running'])('keeps %s jobs pending without reading old scores', async state => {
    const fetch = mockFetch([200, { testId: '111', state }]);
    const res = await query();
    expect(res.status).toHaveBeenCalledWith(202);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('returns only the requested student and redacts hidden output after completion', async () => {
    const fetch = mockFetch(
      [200, { testId: '111', state: 'finished', outcome: { graded: 1, systemFailures: 0 } }],
      [200, [{ testId: '222', puzzleResults: { private: 'other student' } }, { testId: '111', puzzleResults: scoreboard }]],
    );
    const res = await query();
    expect(fetch.mock.calls[0][0]).toContain('/admin/judger/jobs/job-1');
    expect(fetch.mock.calls[1][0]).toContain('/admin/scores');
    expect(res.json.mock.calls[0][0].Q1.subtasks[0].hidden[0].userOutput).toBe('result is hidden');
    expect(JSON.stringify(res.json.mock.calls)).not.toMatch(/secret|other student/);
  });
  it('rejects a job belonging to another student', async () => {
    const fetch = mockFetch([200, { testId: '222', state: 'finished' }]);
    expect((await query()).status).toHaveBeenCalledWith(404);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it.each([
    { state: 'failed' },
    { state: 'finished', outcome: { graded: 0, systemFailures: 1 } },
    { state: 'finished' },
  ])('does not return stale scores on unsuccessful jobs: %j', async job => {
    const fetch = mockFetch([200, { testId: '111', ...job }]);
    expect((await query()).status).toHaveBeenCalledWith(502);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('rejects a missing scoreboard instead of reporting empty success', async () => {
    mockFetch([200, { testId: '111', state: 'finished', outcome: { graded: 1, systemFailures: 0 } }], [200, []]);
    expect((await query()).status).toHaveBeenCalledWith(502);
  });
});
