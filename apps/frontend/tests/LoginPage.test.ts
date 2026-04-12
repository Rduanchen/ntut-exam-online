import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import LoginPage from '../src/pages/LoginPage.vue';
import { createTestI18n, createTestRouter } from './helpers';

describe('LoginPage', () => {
    let router: ReturnType<typeof createTestRouter>;

    beforeEach(() => {
        sessionStorage.clear();
        router = createTestRouter();
    });

    afterEach(() => {
        sessionStorage.clear();
    });

    function mountLogin() {
        return mount(LoginPage, {
            global: {
                plugins: [createTestI18n(), router],
            },
        });
    }

    it('should render the login form', () => {
        const wrapper = mountLogin();
        expect(wrapper.find('[data-testid="student-id-input"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="login-button"]').exists()).toBe(true);
        expect(wrapper.text()).toContain('Online Exam System');
    });

    it('should show error if student ID is empty', async () => {
        const wrapper = mountLogin();
        await wrapper.find('form').trigger('submit');
        expect(wrapper.find('[data-testid="error-message"]').text()).toBe('Student ID is required');
    });

    it('should store studentId and navigate on valid submit', async () => {
        const wrapper = mountLogin();
        const pushSpy = vi.spyOn(router, 'push');

        await wrapper.find('[data-testid="student-id-input"]').setValue('12345');
        await wrapper.find('form').trigger('submit');

        expect(sessionStorage.getItem('studentId')).toBe('12345');
        expect(pushSpy).toHaveBeenCalledWith({ name: 'exam' });
    });

    it('should trim whitespace from student ID', async () => {
        const wrapper = mountLogin();
        await wrapper.find('[data-testid="student-id-input"]').setValue('  67890  ');
        await wrapper.find('form').trigger('submit');
        expect(sessionStorage.getItem('studentId')).toBe('67890');
    });
});
