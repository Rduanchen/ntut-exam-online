<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { ScoreBoardFormat } from '@my-project/types';
import { fetchQuestions, uploadFile, judgeSubmission, type Question } from '../services/api';
import JudgeResult from '../components/JudgeResult.vue';

const { t } = useI18n();
const router = useRouter();

const languageAcceptMap: Record<string, string> = {
    python: '.py',
    c: '.c',
    cpp: '.cpp',
    java: '.java',
    javascript: '.js',
};

const studentId = ref(sessionStorage.getItem('studentId') || '');
const questions = ref<Question[]>([]);
const selectedFiles = ref<Record<number, File | null>>({});
const uploadStatus = ref<Record<number, string>>({});
const judgeResult = ref<ScoreBoardFormat | null>(null);
const isJudging = ref(false);
const judgeError = ref('');

onMounted(async () => {
    if (!studentId.value) {
        router.push({ name: 'login' });
        return;
    }
    questions.value = await fetchQuestions();
});

function processSelectedFile(questionId: number, file: File | null, language: string, inputElement?: HTMLInputElement) {
    const ext = languageAcceptMap[language];
    if (file && ext && !file.name.endsWith(ext)) {
        uploadStatus.value[questionId] = t('exam.wrongFileType', { ext });
        if (inputElement) inputElement.value = '';
        selectedFiles.value[questionId] = null;
        return;
    }
    uploadStatus.value[questionId] = '';
    selectedFiles.value[questionId] = file;
}

function onFileChange(questionId: number, event: Event, language: string) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    processSelectedFile(questionId, file, language, input);
}

function onDropFile(questionId: number, event: DragEvent, language: string) {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0] ?? null;
    processSelectedFile(questionId, file, language);
}

const dragOverStates = ref<Record<number, boolean>>({});

function handleDragOver(questionId: number, event: DragEvent) {
    event.preventDefault();
    dragOverStates.value[questionId] = true;
}

function handleDragLeave(questionId: number, event: DragEvent) {
    event.preventDefault();
    dragOverStates.value[questionId] = false;
}

async function handleUpload(questionId: number) {
    const file = selectedFiles.value[questionId];
    if (!file) return;
    try {
        await uploadFile(studentId.value, questionId, file);
        uploadStatus.value[questionId] = t('exam.uploadSuccess');
    } catch {
        uploadStatus.value[questionId] = t('exam.uploadFail');
    }
}

async function handleJudge() {
    isJudging.value = true;
    judgeError.value = '';
    judgeResult.value = null;
    try {
        judgeResult.value = await judgeSubmission(studentId.value);
    } catch {
        judgeError.value = t('exam.judgeFail');
    } finally {
        isJudging.value = false;
    }
}

function handleLogout() {
    sessionStorage.removeItem('studentId');
    router.push({ name: 'login' });
}
</script>

<template>
    <div class="min-h-screen bg-gray-50 p-6">
        <div class="max-w-3xl mx-auto">
            <!-- Header -->
            <div class="flex justify-between items-center mb-6">
                <h1 class="text-2xl font-bold">{{ t('exam.title') }}</h1>
                <div class="flex items-center gap-4">
                    <span class="text-gray-600" data-testid="student-id-display">{{ studentId }}</span>
                    <button @click="handleLogout"
                        class="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 transition"
                        data-testid="logout-button">
                        {{ t('exam.logout') }}
                    </button>
                </div>
            </div>
            <!-- Question list -->
            <div class="space-y-4 mb-6">
                <div v-for="q in questions" :key="q.id"
                    class="bg-white rounded-lg shadow p-4" :data-testid="`question-${q.id}`">
                    <div class="flex items-center justify-between mb-2">
                        <div>
                            <span class="font-semibold">{{ t('exam.question') }}: {{ q.name }}</span>
                            <span class="ml-3 text-sm text-gray-500">{{ t('exam.language') }}: {{ q.language }}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <input type="file" :accept="languageAcceptMap[q.language]" @change="onFileChange(q.id, $event, q.language)"
                            class="text-sm" :data-testid="`file-input-${q.id}`" />
                        <button @click="handleUpload(q.id)"
                            class="px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition disabled:opacity-50"
                            :disabled="!selectedFiles[q.id]"
                            :data-testid="`upload-button-${q.id}`">
                            {{ t('exam.upload') }}
                        </button>
                        <span v-if="uploadStatus[q.id]" class="text-sm"
                            :class="uploadStatus[q.id] === t('exam.uploadSuccess') ? 'text-green-600' : 'text-red-600'"
                            :data-testid="`upload-status-${q.id}`">
                            {{ uploadStatus[q.id] }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Judge button -->
            <div class="mb-6">
                <button @click="handleJudge" :disabled="isJudging"
                    class="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    data-testid="judge-button">
                    {{ isJudging ? t('exam.judging') : t('exam.judge') }}
                </button>
                <p v-if="judgeError" class="text-red-500 text-sm mt-2" data-testid="judge-error">{{ judgeError }}</p>
            </div>

            <!-- Judge result -->
            <div v-if="judgeResult">
                <h2 class="text-xl font-bold mb-3">{{ t('exam.result') }}</h2>
                <JudgeResult :result="judgeResult" />
            </div>
        </div>
    </div>
</template>
