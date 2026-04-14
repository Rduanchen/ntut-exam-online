<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import type { ScoreBoardFormat } from "@my-project/types";
import {
  fetchQuestions,
  uploadFile,
  judgeSubmission,
  type Question,
} from "../services/api";
import JudgeResult from "../components/JudgeResult.vue";

const { t } = useI18n();
const router = useRouter();

const languageAcceptMap: Record<string, string> = {
  python: ".py",
  c: ".c",
  cpp: ".cpp",
  java: ".java",
  javascript: ".js",
};

const studentId = ref(sessionStorage.getItem("studentId") || "");
const questions = ref<Question[]>([]);
const selectedFiles = ref<Record<number, File | null>>({});
const uploadStatus = ref<Record<number, string>>({});
const judgeResult = ref<ScoreBoardFormat | null>(null);
const isJudging = ref(false);
const judgeError = ref("");
const dragOverStates = ref<Record<number, boolean>>({});

onMounted(async () => {
  if (!studentId.value) {
    router.push({ name: "login" });
    return;
  }
  questions.value = await fetchQuestions();
});

function processSelectedFile(
  questionId: number,
  file: File | null,
  language: string,
  inputElement?: HTMLInputElement,
) {
  const ext = languageAcceptMap[language];
  if (file && ext && !file.name.endsWith(ext)) {
    uploadStatus.value[questionId] = t("exam.wrongFileType", { ext });
    if (inputElement) inputElement.value = "";
    selectedFiles.value[questionId] = null;
    return;
  }
  uploadStatus.value[questionId] = "";
  selectedFiles.value[questionId] = file;
}

function handleDragOver(questionId: number, event: DragEvent) {
  event.preventDefault();
  dragOverStates.value[questionId] = true;
}

function handleDragLeave(questionId: number, event: DragEvent) {
  event.preventDefault();
  dragOverStates.value[questionId] = false;
}

function onDropFile(questionId: number, event: DragEvent, language: string) {
  event.preventDefault();
  dragOverStates.value[questionId] = false;
  const file = event.dataTransfer?.files?.[0] ?? null;
  processSelectedFile(questionId, file, language);
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
    uploadStatus.value[questionId] = t("exam.uploadSuccess");
  } catch {
    uploadStatus.value[questionId] = t("exam.uploadFail");
  }
}

async function handleJudge() {
  isJudging.value = true;
  judgeError.value = "";
  judgeResult.value = null;
  try {
    judgeResult.value = await judgeSubmission(studentId.value);
  } catch {
    judgeError.value = t("exam.judgeFail");
  } finally {
    isJudging.value = false;
  }
}

function handleLogout() {
  sessionStorage.removeItem("studentId");
  router.push({ name: "login" });
}
</script>

<template>
  <div class="exam-page">
    <div class="exam-layout">
      <!-- Left Panel: Questions & Uploads -->
      <div class="panel-left">
        <!-- Header part -->
        <div class="panel-header">
          <h1 class="panel-title">
            {{ t("exam.title") }}
          </h1>
          <div class="header-actions">
            <span class="student-badge" data-testid="student-id-display">
              User: {{ studentId }}
            </span>
            <button
              @click="handleLogout"
              class="logout-btn"
              data-testid="logout-button"
            >
              {{ t("exam.logout") }}
            </button>
          </div>
        </div>

        <!-- Questions area -->
        <div class="questions-list">
          <div
            v-if="questions.length === 0"
            class="loading-text"
          >
            Loading questions...
          </div>

          <div
            v-for="q in questions"
            :key="q.id"
            class="question-card"
            :data-testid="`question-${q.id}`"
          >
            <div class="question-header">
              <div>
                <h3 class="question-name">
                  {{ t("exam.question") }}: {{ q.name }}
                </h3>
                <div class="question-meta">
                  <span class="lang-badge">
                    {{ q.language }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Drag and Drop Upload Box -->
            <div
              @dragover="handleDragOver(q.id, $event)"
              @dragleave="handleDragLeave(q.id, $event)"
              @drop="
                dragOverStates[q.id] = false;
                onDropFile(q.id, $event, q.language);
              "
              class="dropzone"
              :class="{ 'dropzone-active': dragOverStates[q.id] }"
            >
              <input
                type="file"
                :id="`file-input-${q.id}`"
                :accept="languageAcceptMap[q.language]"
                @change="onFileChange(q.id, $event, q.language)"
                class="dropzone-input"
                :data-testid="`file-input-${q.id}`"
              />

              <div class="dropzone-content">
                <svg
                  class="dropzone-icon"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <div class="dropzone-text">
                  <span class="dropzone-link">Upload a file</span>
                  or drag and drop
                </div>
                <p class="dropzone-hint">
                  Only {{ languageAcceptMap[q.language] }} files are allowed
                </p>
              </div>
            </div>

            <!-- Upload status and button -->
            <div class="upload-row">
              <div class="file-info">
                <svg
                  v-if="selectedFiles[q.id]"
                  class="icon-sm icon-gray"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  ></path>
                </svg>
                <span v-if="selectedFiles[q.id]" class="file-name">
                  {{ selectedFiles[q.id]?.name }}
                </span>
                <span v-else class="no-file">No file selected</span>
              </div>

              <div class="upload-actions">
                <span
                  v-if="uploadStatus[q.id]"
                  class="upload-status"
                  :class="
                    uploadStatus[q.id] === t('exam.uploadSuccess')
                      ? 'status-success'
                      : 'status-error'
                  "
                  :data-testid="`upload-status-${q.id}`"
                >
                  {{ uploadStatus[q.id] }}
                </span>
                <button
                  @click="handleUpload(q.id)"
                  class="upload-btn"
                  :disabled="!selectedFiles[q.id]"
                  :data-testid="`upload-button-${q.id}`"
                >
                  {{ t("exam.upload") }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Results & Actions -->
      <div class="panel-right">
        <!-- Action Card -->
        <div class="action-card">
          <h2 class="action-title">
            {{ t("exam.judge") }} {{ t("exam.result") }}
          </h2>
          <button
            @click="handleJudge"
            :disabled="isJudging"
            class="judge-btn"
            data-testid="judge-button"
          >
            <svg
              v-if="isJudging"
              class="spinner"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="spinner-track"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="spinner-head"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <svg
              v-else
              class="icon-sm"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              ></path>
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            {{ isJudging ? t("exam.judging") : t("exam.judge") }}
          </button>
          <p
            v-if="judgeError"
            class="judge-error"
            data-testid="judge-error"
          >
            <svg
              class="icon-xs"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            {{ judgeError }}
          </p>
        </div>

        <!-- Result Card -->
        <div class="result-card">
          <div v-if="judgeResult">
            <JudgeResult :result="judgeResult" />
          </div>
          <div v-else class="result-empty">
            <svg
              class="result-empty-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              ></path>
            </svg>
            <p>No results yet.</p>
            <p class="result-empty-hint">
              Submit your solutions and click Judge to see results.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.exam-page {
  min-height: 100vh;
  background: #f9fafb;
  padding: 24px;
}

.exam-layout {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

@media (min-width: 1024px) {
  .exam-layout {
    flex-direction: row;
  }
}

/* Left Panel */
.panel-left {
  width: 100%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  border: 1px solid #f3f4f6;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

@media (min-width: 1024px) {
  .panel-left { width: 30%; }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.panel-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.student-badge {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  background: #f3f4f6;
  padding: 4px 12px;
  border-radius: 9999px;
}

.logout-btn {
  padding: 6px 16px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  background: #f3f4f6;
  border-radius: 6px;
  border: none;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background: #e5e7eb;
}

/* Questions */
.questions-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.loading-text {
  text-align: center;
  color: #6b7280;
  padding: 40px 0;
}

.question-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  background: #f9fafb;
  transition: box-shadow 0.2s;
}

.question-card:hover {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.question-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.question-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.question-meta {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.lang-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  background: #dbeafe;
  color: #1e40af;
}

/* Dropzone */
.dropzone {
  position: relative;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  transition: border-color 0.2s, background-color 0.2s;
  background: #fff;
}

.dropzone:hover {
  border-color: #9ca3af;
}

.dropzone-active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.dropzone-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.dropzone-content {
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.dropzone-icon {
  width: 48px;
  height: 48px;
  color: #9ca3af;
  margin: 0 auto;
}

.dropzone-text {
  font-size: 0.875rem;
  color: #4b5563;
}

.dropzone-link {
  font-weight: 500;
  color: #2563eb;
}

.dropzone-hint {
  font-size: 0.75rem;
  color: #6b7280;
}

/* Upload row */
.upload-row {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  overflow: hidden;
}

.file-name {
  font-size: 0.875rem;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.no-file {
  font-size: 0.875rem;
  color: #9ca3af;
  font-style: italic;
}

.upload-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.upload-status {
  font-size: 0.875rem;
  font-weight: 500;
}

.status-success {
  color: #16a34a;
}

.status-error {
  color: #dc2626;
}

.upload-btn {
  padding: 8px 20px;
  background: #2563eb;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  border: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s;
}

.upload-btn:hover {
  background: #1d4ed8;
}

.upload-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Right Panel */
.panel-right {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (min-width: 1024px) {
  .panel-right { width: 70%; }
}

.action-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  border: 1px solid #f3f4f6;
  padding: 24px;
}

.action-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
}

.judge-btn {
  width: 100%;
  padding: 12px 16px;
  background: #16a34a;
  color: #fff;
  font-weight: 500;
  border-radius: 8px;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
  font-size: 1rem;
}

.judge-btn:hover {
  background: #15803d;
}

.judge-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.judge-error {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fef2f2;
  padding: 8px;
  border-radius: 4px;
}

.result-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  border: 1px solid #f3f4f6;
  padding: 24px;
  flex: 1;
  overflow-y: auto;
  min-height: 400px;
}

.result-empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.result-empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  color: #e5e7eb;
}

.result-empty-hint {
  font-size: 0.875rem;
  margin-top: 4px;
}

/* Icons */
.icon-sm {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.icon-xs {
  width: 16px;
  height: 16px;
}

.icon-gray {
  color: #9ca3af;
}

.spinner {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

.spinner-track {
  opacity: 0.25;
}

.spinner-head {
  opacity: 0.75;
}
</style>
