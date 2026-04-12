import { describe, it, expect } from 'vitest';
import { redactHiddenOutput } from '../src/utils/redact.js';
import type { ScoreBoardFormat } from '@my-project/types';

describe('redactHiddenOutput', () => {
    const scoreboard: ScoreBoardFormat = {
        Q1: {
            subtasks: [
                {
                    visible: [
                        { status: 'AC', userOutput: 'visible-out', expectedOutput: 'expected', time: '10ms' },
                    ],
                    hidden: [
                        { status: 'AC', userOutput: 'secret-out', expectedOutput: 'secret-expected', time: '5ms' },
                        { status: 'WA', userOutput: 'wrong-out', expectedOutput: 'correct-expected', time: '8ms' },
                    ],
                },
            ],
        },
    };

    it('should redact userOutput and expectedOutput in hidden test cases', () => {
        const result = redactHiddenOutput(scoreboard);
        const hidden = result.Q1.subtasks[0].hidden;

        for (const tc of hidden) {
            expect(tc.userOutput).toBe('hidden');
            expect(tc.expectedOutput).toBe('hidden');
        }
    });

    it('should preserve visible test case outputs', () => {
        const result = redactHiddenOutput(scoreboard);
        const visible = result.Q1.subtasks[0].visible;

        expect(visible[0].userOutput).toBe('visible-out');
        expect(visible[0].expectedOutput).toBe('expected');
    });

    it('should preserve other fields in hidden test cases', () => {
        const result = redactHiddenOutput(scoreboard);
        const hidden = result.Q1.subtasks[0].hidden;

        expect(hidden[0].status).toBe('AC');
        expect(hidden[0].time).toBe('5ms');
        expect(hidden[1].status).toBe('WA');
    });

    it('should not mutate the original scoreboard', () => {
        redactHiddenOutput(scoreboard);
        expect(scoreboard.Q1.subtasks[0].hidden[0].userOutput).toBe('secret-out');
    });
});
