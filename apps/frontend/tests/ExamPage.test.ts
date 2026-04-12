import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ExamPage from '../src/pages/ExamPage.vue';
import { createTestI18n, createTestRouter } from './helpers';
import * as api from '../src/services/api';

vi.mock('../src/services/api');

describe('ExamPage', () => {
    let router: ReturnType<typeof createTestRouter>;

    const mockQuestions: api.Question[] = [
        { id: 0, name: 'Q1', language: 'c' },
        { id: 1, name: 'Q2', language: 'python' },
    ];

    beforeEach(() => {
        sessionStorage.clear();
        sessionStorage.setItem('studentId', 'stu001');
        router = createTestRouter();
        vi.mocked(api.fetchQuestions).mockResolvedValue(mockQuestions);
    });

    afterEach(() => {
        sessionStorage.clear();
    });

    async function mountExam() {
        router.push('/exam');
        await router.isReady();
        const wrapper = mount(ExamPage, {
            global: {
                plugins: [createTestI18n(), router],
            },
        });
        await flushPromises();
        return wrapper;
    }

    it('should fetch and display questions on mount', async () => {
        const wrapper = await mountExam();
        expect(api.fetchQuestions).toHaveBeenCalled();
        expect(wrapper.find('[data-testid="question-0"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="question-1"]').exists()).toBe(true);
        expect(wrapper.text()).toContain('Q1');
        expect(wrapper.text()).toContain('Q2');
    });

    it('should display the student ID', async () => {
        const wrapper = await mountExam();
        expect(wrapper.find('[data-testid="student-id-display"]').text()).toBe('stu001');
    });

    it('should have upload buttons for each question', async () => {
        const wrapper = await mountExam();
        expect(wrapper.find('[data-testid="upload-button-0"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="upload-button-1"]').exists()).toBe(true);
    });

    it('should call uploadFile on upload click', async () => {
        vi.mocked(api.uploadFile).mockResolvedValue({ message: 'ok', path: '/upload/test' });
        const wrapper = await mountExam();

        // Simulate selecting a file
        const file = new File(['code'], 'main.c', { type: 'text/plain' });
        const input = wrapper.find('[data-testid="file-input-0"]');
        // Manually set the file on the component's reactive state
        const vm = wrapper.vm as unknown as { selectedFiles: Record<number, File | null> };
        vm.selectedFiles[0] = file;
        await flushPromises();

        await wrapper.find('[data-testid="upload-button-0"]').trigger('click');
        await flushPromises();

        expect(api.uploadFile).toHaveBeenCalledWith('stu001', 0, file);
        expect(wrapper.find('[data-testid="upload-status-0"]').text()).toBe('Uploaded successfully');
    });

    it('should show upload failure message', async () => {
        vi.mocked(api.uploadFile).mockRejectedValue(new Error('fail'));
        const wrapper = await mountExam();

        const file = new File(['code'], 'main.c', { type: 'text/plain' });
        const vm = wrapper.vm as unknown as { selectedFiles: Record<number, File | null> };
        vm.selectedFiles[0] = file;
        await flushPromises();

        await wrapper.find('[data-testid="upload-button-0"]').trigger('click');
        await flushPromises();

        expect(wrapper.find('[data-testid="upload-status-0"]').text()).toBe('Upload failed');
    });

    it('should have a judge button', async () => {
        const wrapper = await mountExam();
        expect(wrapper.find('[data-testid="judge-button"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="judge-button"]').text()).toBe('Judge');
    });

    it('should call judgeSubmission and display result', async () => {
        vi.mocked(api.judgeSubmission).mockResolvedValue({
            Q1: {
                subtasks: [{
                    visible: [{ status: 'AC', userOutput: 'out', expectedOutput: 'out', time: '10ms' }],
                    hidden: [{ status: 'WA', userOutput: 'hidden', expectedOutput: 'hidden', time: '5ms' }],
                }],
            },
        });

        const wrapper = await mountExam();
        await wrapper.find('[data-testid="judge-button"]').trigger('click');
        await flushPromises();

        expect(api.judgeSubmission).toHaveBeenCalledWith('stu001');
        expect(wrapper.find('[data-testid="judge-result"]').exists()).toBe(true);
        expect(wrapper.text()).toContain('AC');
        expect(wrapper.text()).toContain('WA');
    });

    it('should show judge error on failure', async () => {
        vi.mocked(api.judgeSubmission).mockRejectedValue(new Error('server error'));

        const wrapper = await mountExam();
        await wrapper.find('[data-testid="judge-button"]').trigger('click');
        await flushPromises();

        expect(wrapper.find('[data-testid="judge-error"]').text()).toBe('Judge failed');
    });

    it('should logout and redirect to login', async () => {
        const wrapper = await mountExam();
        const pushSpy = vi.spyOn(router, 'push');

        await wrapper.find('[data-testid="logout-button"]').trigger('click');

        expect(sessionStorage.getItem('studentId')).toBeNull();
        expect(pushSpy).toHaveBeenCalledWith({ name: 'login' });
    });
});
