import { createI18n } from 'vue-i18n';

export function createTestI18n() {
    return createI18n({
        legacy: false,
        locale: 'en',
        messages: {
            en: {
                dashboard: {
                    title: 'TA Dashboard',
                    submissions: 'Submissions',
                    logs: 'Logs',
                    search: 'Search submissions...',
                    noSubmissions: 'No submissions found',
                    noLogs: 'No logs available',
                    refresh: 'Refresh',
                    files: 'files',
                },
                modal: {
                    title: 'Move File',
                    filename: 'Source',
                    newFileName: 'New File Name',
                    placeholder: 'Enter new file name',
                    cancel: 'Cancel',
                    confirm: 'Move',
                    moving: 'Moving...',
                    success: 'File moved successfully',
                    error: 'Failed to move file',
                    required: 'New file name is required',
                },
            },
        },
    });
}
