import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import MoveFileModal from '../src/components/MoveFileModal.vue';
import { createTestI18n } from './helpers';
import * as api from '../src/services/api';

vi.mock('../src/services/api');

describe('MoveFileModal', () => {
    function mountModal(filename = 'test_dir') {
        return mount(MoveFileModal, {
            props: { filename },
            global: { plugins: [createTestI18n()] },
        });
    }

    it('should render modal with source filename', () => {
        const wrapper = mountModal('127_0_0_1_stu001');
        expect(wrapper.find('[data-testid="modal-source"]').text()).toBe('127_0_0_1_stu001');
    });

    it('should show error when new filename is empty', async () => {
        const wrapper = mountModal();
        await wrapper.find('[data-testid="modal-confirm"]').trigger('click');
        expect(wrapper.find('[data-testid="modal-error"]').text()).toBe('New file name is required');
    });

    it('should call moveFile API with correct args', async () => {
        vi.mocked(api.moveFile).mockResolvedValue({ message: 'ok' });
        const wrapper = mountModal('test_dir');

        await wrapper.find('[data-testid="new-filename-input"]').setValue('renamed');
        await wrapper.find('[data-testid="modal-confirm"]').trigger('click');
        await flushPromises();

        expect(api.moveFile).toHaveBeenCalledWith('test_dir', 'renamed');
    });

    it('should show success message after move', async () => {
        vi.mocked(api.moveFile).mockResolvedValue({ message: 'ok' });
        const wrapper = mountModal();

        await wrapper.find('[data-testid="new-filename-input"]').setValue('new_name');
        await wrapper.find('[data-testid="modal-confirm"]').trigger('click');
        await flushPromises();

        expect(wrapper.find('[data-testid="modal-success"]').text()).toBe('File moved successfully');
    });

    it('should show error message on API failure', async () => {
        vi.mocked(api.moveFile).mockRejectedValue(new Error('fail'));
        const wrapper = mountModal();

        await wrapper.find('[data-testid="new-filename-input"]').setValue('new_name');
        await wrapper.find('[data-testid="modal-confirm"]').trigger('click');
        await flushPromises();

        expect(wrapper.find('[data-testid="modal-error"]').text()).toBe('Failed to move file');
    });

    it('should emit close when cancel is clicked', async () => {
        const wrapper = mountModal();
        await wrapper.find('[data-testid="modal-cancel"]').trigger('click');
        expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('should emit close when clicking overlay', async () => {
        const wrapper = mountModal();
        await wrapper.find('[data-testid="modal-overlay"]').trigger('click');
        expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('should trim whitespace from new filename', async () => {
        vi.mocked(api.moveFile).mockResolvedValue({ message: 'ok' });
        const wrapper = mountModal('dir');

        await wrapper.find('[data-testid="new-filename-input"]').setValue('  spaced  ');
        await wrapper.find('[data-testid="modal-confirm"]').trigger('click');
        await flushPromises();

        expect(api.moveFile).toHaveBeenCalledWith('dir', 'spaced');
    });
});
