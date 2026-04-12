import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import DashboardPage from '../src/pages/DashboardPage.vue';
import { createTestI18n } from './helpers';
import * as api from '../src/services/api';

vi.mock('../src/services/api');

describe('DashboardPage', () => {
    const mockFiles: api.FileList = {
        '127_0_0_1_stu001': ['0.c', '1.py'],
        '127_0_0_1_stu002': ['0.c'],
    };

    beforeEach(() => {
        vi.mocked(api.fetchFileList).mockResolvedValue(mockFiles);
        vi.mocked(api.fetchLogs).mockResolvedValue('[2026-04-12] [UPLOAD] stu001 uploaded');
    });

    async function mountDashboard() {
        const wrapper = mount(DashboardPage, {
            global: { plugins: [createTestI18n()] },
        });
        await flushPromises();
        return wrapper;
    }

    it('should render the dashboard title', async () => {
        const wrapper = await mountDashboard();
        expect(wrapper.text()).toContain('TA Dashboard');
    });

    it('should fetch and display submissions', async () => {
        const wrapper = await mountDashboard();
        expect(api.fetchFileList).toHaveBeenCalled();
        expect(wrapper.find('[data-testid="submission-127_0_0_1_stu001"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="submission-127_0_0_1_stu002"]').exists()).toBe(true);
    });

    it('should display file count per submission', async () => {
        const wrapper = await mountDashboard();
        const stu001 = wrapper.find('[data-testid="submission-127_0_0_1_stu001"]');
        expect(stu001.text()).toContain('2 files');
    });

    it('should display individual filenames', async () => {
        const wrapper = await mountDashboard();
        expect(wrapper.text()).toContain('0.c');
        expect(wrapper.text()).toContain('1.py');
    });

    it('should filter submissions by search query', async () => {
        const wrapper = await mountDashboard();
        await wrapper.find('[data-testid="search-input"]').setValue('stu001');
        expect(wrapper.find('[data-testid="submission-127_0_0_1_stu001"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="submission-127_0_0_1_stu002"]').exists()).toBe(false);
    });

    it('should show no submissions message when search has no match', async () => {
        const wrapper = await mountDashboard();
        await wrapper.find('[data-testid="search-input"]').setValue('nonexistent');
        expect(wrapper.find('[data-testid="no-submissions"]').exists()).toBe(true);
    });

    it('should filter by filename inside submission', async () => {
        const wrapper = await mountDashboard();
        await wrapper.find('[data-testid="search-input"]').setValue('1.py');
        // Only stu001 has 1.py
        expect(wrapper.find('[data-testid="submission-127_0_0_1_stu001"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="submission-127_0_0_1_stu002"]').exists()).toBe(false);
    });

    it('should open modal when clicking a submission', async () => {
        const wrapper = await mountDashboard();
        await wrapper.find('[data-testid="submission-127_0_0_1_stu001"]').trigger('click');
        expect(wrapper.find('[data-testid="move-file-modal"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="modal-source"]').text()).toBe('127_0_0_1_stu001');
    });

    it('should switch to logs tab and display logs', async () => {
        const wrapper = await mountDashboard();
        await wrapper.find('[data-testid="tab-logs"]').trigger('click');
        await flushPromises();
        expect(wrapper.find('[data-testid="logs-content"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="logs-content"]').text()).toContain('UPLOAD');
    });

    it('should show no logs message when empty', async () => {
        vi.mocked(api.fetchLogs).mockResolvedValue('');
        const wrapper = await mountDashboard();
        await wrapper.find('[data-testid="tab-logs"]').trigger('click');
        await flushPromises();
        expect(wrapper.find('[data-testid="no-logs"]').exists()).toBe(true);
    });

    it('should refresh file list when refresh button is clicked', async () => {
        const wrapper = await mountDashboard();
        vi.mocked(api.fetchFileList).mockClear();
        await wrapper.find('[data-testid="refresh-button"]').trigger('click');
        expect(api.fetchFileList).toHaveBeenCalled();
    });
});
