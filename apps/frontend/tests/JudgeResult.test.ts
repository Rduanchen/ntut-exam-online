import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import JudgeResult from '../src/components/JudgeResult.vue';
import type { ScoreBoardFormat } from '@my-project/types';
import { createTestI18n } from './helpers';

describe('JudgeResult', () => {
    const mockResult: ScoreBoardFormat = {
        Q1: {
            subtasks: [{
                visible: [
                    { status: 'AC', userOutput: 'hello', expectedOutput: 'hello', time: '10ms' },
                ],
                hidden: [
                    { status: 'WA', userOutput: 'hidden', expectedOutput: 'hidden', time: '5ms' },
                ],
            }],
            specialRuleResults: [
                { ruleId: 'no-goto', passed: true, message: 'No goto used', reason: '', checkedAt: '2026-01-01T00:00:00Z' },
                { ruleId: 'no-global', passed: false, message: 'Global variable found', reason: 'line 5', checkedAt: '2026-01-01T00:00:00Z' },
            ],
        },
        Q2: {
            subtasks: [{
                visible: [],
                hidden: [
                    { status: 'AC', userOutput: 'hidden', expectedOutput: 'hidden', time: '3ms' },
                ],
            }],
        },
    };

    function mountResult(result: ScoreBoardFormat = mockResult) {
        return mount(JudgeResult, {
            props: { result },
            global: {
                plugins: [createTestI18n()],
            },
        });
    }

    it('should render problem IDs', () => {
        const wrapper = mountResult();
        expect(wrapper.text()).toContain('Q1');
        expect(wrapper.text()).toContain('Q2');
    });

    it('should render visible test cases with status and time', () => {
        const wrapper = mountResult();
        expect(wrapper.text()).toContain('AC');
        expect(wrapper.text()).toContain('10ms');
    });

    it('should render output columns for visible test cases', () => {
        const wrapper = mountResult();
        expect(wrapper.text()).toContain('hello');
    });

    it('should render hidden test cases', () => {
        const wrapper = mountResult();
        expect(wrapper.text()).toContain('WA');
        expect(wrapper.text()).toContain('5ms');
    });

    it('should render subtask labels', () => {
        const wrapper = mountResult();
        expect(wrapper.text()).toContain('Subtask 1');
    });

    it('should render section headers', () => {
        const wrapper = mountResult();
        expect(wrapper.text()).toContain('Visible');
        expect(wrapper.text()).toContain('Hidden');
    });

    it('should render special rule results', () => {
        const wrapper = mountResult();
        expect(wrapper.text()).toContain('no-goto');
        expect(wrapper.text()).toContain('No goto used');
        expect(wrapper.text()).toContain('✓');
        expect(wrapper.text()).toContain('no-global');
        expect(wrapper.text()).toContain('Global variable found');
        expect(wrapper.text()).toContain('✗');
        expect(wrapper.text()).toContain('line 5');
    });

    it('should not render special rules section when absent', () => {
        const wrapper = mountResult({
            Q3: {
                subtasks: [{ visible: [{ status: 'AC', userOutput: 'ok', expectedOutput: 'ok', time: '1ms' }], hidden: [] }],
            },
        });
        expect(wrapper.text()).not.toContain('Special Rules');
    });
});
