import { createI18n } from 'vue-i18n';
import { createRouter, createMemoryHistory } from 'vue-router';
import LoginPage from '../src/pages/LoginPage.vue';
import ExamPage from '../src/pages/ExamPage.vue';

export function createTestI18n() {
    return createI18n({
        legacy: false,
        locale: 'en',
        messages: {
            en: {
                login: {
                    title: 'Online Exam System',
                    placeholder: 'Enter your Student ID',
                    submit: 'Enter',
                    required: 'Student ID is required',
                },
                exam: {
                    title: 'Exam Questions',
                    question: 'Question',
                    language: 'Language',
                    upload: 'Upload',
                    selectFile: 'Select File',
                    noFile: 'No file selected',
                    uploadSuccess: 'Uploaded successfully',
                    uploadFail: 'Upload failed',
                    judge: 'Judge',
                    judging: 'Judging...',
                    judgeFail: 'Judge failed',
                    result: 'Judge Result',
                    status: 'Status',
                    time: 'Time',
                    visible: 'Visible',
                    hidden: 'Hidden',
                    subtask: 'Subtask',
                    noResult: 'No result yet',
                    logout: 'Logout',
                    output: 'Output',
                    expectedOutput: 'Expected Output',
                    specialRules: 'Special Rules',
                    ruleId: 'Rule',
                    passed: 'Passed',
                    message: 'Message',
                    reason: 'Reason',
                },
            },
        },
    });
}

export function createTestRouter() {
    return createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: '/', name: 'login', component: LoginPage },
            { path: '/exam', name: 'exam', component: ExamPage },
        ],
    });
}
