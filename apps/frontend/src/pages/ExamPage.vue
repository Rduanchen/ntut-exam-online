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
        <div class="w-full flex flex-col lg:flex-row gap-8">
            
            <!-- Left Panel: Questions & Uploads -->
            <div class="w-full lg:w-[30%] bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col h-full">
                <!-- Header part -->
                <div class="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                    <h1 class="text-2xl font-bold text-gray-800">{{ t('exam.title') }}</h1>
                    <div class="flex items-center gap-4">
                        <span class="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full" data-testid="student-id-display">
                            User: {{ studentId }}
                        </span>
                        <button @click="handleLogout"
                            class="px-4 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            data-testid="logout-button">
                            {{ t('exam.logout') }}
                        </button>
                    </div>
                </div>

                <!-- Settings/Questions area -->
                <div class="flex-1 overflow-y-auto space-y-6">
                    <div v-if="questions.length === 0" class="text-center text-gray-500 py-10">
                        Loading questions...
                    </div>
                    
                    <div v-for="q in questions" :key="q.id"
                        class="border border-gray-200 rounded-lg p-5 bg-gray-50 transition hover:shadow-sm" 
                        :data-testid="`question-${q.id}`">
                        <div class="flex items-center justify-between mb-4">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800">{{ t('exam.question') }}: {{ q.name }}</h3>
                                <div class="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                        {{ q.language }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Drag and Drop Upload Box -->
                        <div 
                            @dragover="handleDragOver(q.id, $event)"
                            @dragleave="handleDragLeave(q.id, $event)"
                            @drop="dragOverStates[q.id] = false; onDropFile(q.id, $event, q.language)"
                            :class="[
                                'relative border-2 border-dashed rounded-lg p-6 text-center transition-colors',
                                dragOverStates[q.id] ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-white'
                            ]"
                        >
                            <input 
                                type="file" 
                                :id="`file-input-${q.id}`"
                                :accept="languageAcceptMap[q.language]" 
                                @change="onFileChange(q.id, $event, q.language)"
                                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                :data-testid="`file-input-${q.id}`" 
                            />
                            
                            <div class="space-y-2 pointer-events-none">
                                <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <div class="text-sm text-gray-600">
                                    <span class="font-medium text-blue-600 hover:text-blue-500">Upload a file</span> or drag and drop
                                </div>
                                <p class="text-xs text-gray-500">
                                    Only {{ languageAcceptMap[q.language] }} files are allowed
                                </p>
                            </div>
                        </div>

                        <!-- Upload status and button -->
                        <div class="mt-4 flex items-center justify-between">
                            <div class="flex items-center gap-2 flex-1 overflow-hidden">
                                <svg v-if="selectedFiles[q.id]" class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                <span v-if="selectedFiles[q.id]" class="text-sm text-gray-700 truncate font-medium">
                                    {{ selectedFiles[q.id]?.name }}
                                </span>
                                <span v-else class="text-sm text-gray-400 italic">No file selected</span>
                            </div>
                            
                            <div class="flex items-center gap-3">
                                <span v-if="uploadStatus[q.id]" class="text-sm font-medium"
                                    :class="uploadStatus[q.id] === t('exam.uploadSuccess') ? 'text-green-600' : 'text-red-600'"
                                    :data-testid="`upload-status-${q.id}`">
                                    {{ uploadStatus[q.id] }}
                                </span>
                                <button @click="handleUpload(q.id)"
                                    class="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    :disabled="!selectedFiles[q.id]"
                                    :data-testid="`upload-button-${q.id}`">
                                    {{ t('exam.upload') }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Panel: Results & Actions -->
            <div class="w-full lg:w-[70%] flex flex-col gap-6">
                <!-- Action Card -->
                <div class="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <h2 class="text-lg font-semibold text-gray-800 mb-4">{{ t('exam.judge') }} {{ t('exam.result') }}</h2>
                    <button @click="handleJudge" :disabled="isJudging"
                        class="w-full py-3 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all shadow-md flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        data-testid="judge-button">
                        <svg v-if="isJudging" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {{ isJudging ? t('exam.judging') : t('exam.judge') }}
                    </button>
                    <p v-if="judgeError" class="text-red-500 text-sm mt-3 flex items-center gap-1 bg-red-50 p-2 rounded" data-testid="judge-error">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {{ judgeError }}
                    </p>
                </div>

                <!-- Result Card -->
                <div class="bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex-1 overflow-y-auto min-h-[400px]">
                    <div v-if="judgeResult">
                        <JudgeResult :result="judgeResult" />
                    </div>
                    <div v-else class="h-full flex flex-col items-center justify-center text-gray-400">
                        <svg class="w-16 h-16 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                        <p>No results yet.</p>
                        <p class="text-sm mt-1">Submit your solutions and click Judge to see results.</p>
                    </div>
                </div>
            </div>
              :data-testid="`file-input-${q.id}`" 
                            />
                            
                            <div class="space-y-2 pointer-events-none">
                                <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <div class="text-sm text-gray-600">
                                    <span class="font-medium text-blue-600 hover:text-blue-500">Upload a file</span> or drag and drop
                                </div>
                                <p class="text-xs text-gray-500">
                                    Only {{ languageAcceptMap[q.language] }} files are allowed
                                </p>
                            </div>
                        </div>

                        <!-- Upload status and button -->
                        <div class="mt-4 flex items-center justify-between">
                            <div class="flex items-center gap-2 flex-1 overflow-hidden">
                                <svg v-if="selectedFiles[q.id]" class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                <span v-if="selectedFiles[q.id]" class="text-sm text-gray-700 truncate font-medium">
                                    {{ selectedFiles[q.id]?.name }}
                                </span>
                                <span v-else class="text-sm text-gray-400 italic">No file selected</span>
                            </div>
                            
                            <div class="flex items-center gap-3">
                                <span v-if="uploadStatus[q.id]" class="text-sm font-medium"
                                    :class="uploadStatus[q.id] === t('exam.uploadSuccess') ? 'text-green-600' : 'text-red-600'"
                                    :data-testid="`upload-status-${q.id}`">
                                    {{ uploadStatus[q.id] }}
                                </span>
                                <button @click="handleUpload(q.id)"
                                    class="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    :disabled="!selectedFiles[q.id]"
                                    :data-testid="`upload-button-${q.id}`">
                                    {{ t('exam.upload') }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Panel: Results & Actions -->
            <div class="w-full lg:w-[70%] flex flex-col gap-6">
                <!-- Action Card -->
                <div class="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <h2 class="text-lg font-semibold text-gray-800 mb-4">{{ t('exam.judge') }} {{ t('exam.result') }}</h2>
                    <button @click="handleJudge" :disabled="isJudging"
                        class="w-full py-3 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all shadow-md flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        data-testid="judge-button">
                        <svg v-if="isJudging" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {{ isJudging ? t('exam.judging') : t('exam.judge') }}
                    </button>
                    <p v-if="judgeError" class="text-red-500 text-sm mt-3 flex items-center gap-1 bg-red-50 p-2 rounded" data-testid="judge-error">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {{ judgeError }}
                    </p>
                </div>

                <!-- Result Card -->
                <div class="bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex-1 overflow-y-auto min-h-[400px]">
                    <div v-if="judgeResult">
                        <JudgeResult :result="judgeResult" />
                    </div>
                    <div v-else class="h-full flex flex-col items-center justify-center text-gray-400">
                        <svg class="w-16 h-16 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                        <p>No results yet.</p>
                        <p class="text-sm mt-1">Submit your solutions and click Judge to see results.</p>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>
