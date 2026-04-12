import { createI18n } from 'vue-i18n';

const messages = {
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
    'zh-TW': {
        dashboard: {
            title: 'TA 管理介面',
            submissions: '提交紀錄',
            logs: '系統日誌',
            search: '搜尋提交...',
            noSubmissions: '查無提交紀錄',
            noLogs: '暫無日誌',
            refresh: '重新整理',
            files: '個檔案',
        },
        modal: {
            title: '移動檔案',
            filename: '來源',
            newFileName: '新檔案名稱',
            placeholder: '請輸入新的檔案名稱',
            cancel: '取消',
            confirm: '移動',
            moving: '移動中...',
            success: '檔案移動成功',
            error: '檔案移動失敗',
            required: '請輸入新的檔案名稱',
        },
    },
};

export const i18n = createI18n({
    legacy: false,
    locale: 'zh-TW',
    fallbackLocale: 'en',
    messages,
});
