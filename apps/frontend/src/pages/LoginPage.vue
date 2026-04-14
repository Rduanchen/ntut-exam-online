<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const router = useRouter();

const studentId = ref('');
const error = ref('');

function handleLogin() {
    if (!studentId.value.trim()) {
        error.value = t('login.required');
        return;
    }
    sessionStorage.setItem('studentId', studentId.value.trim());
    router.push({ name: 'exam' });
}
</script>

<template>
    <div class="login-page">
        <div class="login-card">
            <h1 class="login-title">{{ t('login.title') }}</h1>
            <form @submit.prevent="handleLogin" class="login-form">
                <div>
                    <input v-model="studentId" type="text" :placeholder="t('login.placeholder')"
                        class="login-input"
                        data-testid="student-id-input" />
                    <p v-if="error" class="login-error" data-testid="error-message">{{ error }}</p>
                </div>
                <button type="submit" class="login-btn" data-testid="login-button">
                    {{ t('login.submit') }}
                </button>
            </form>
        </div>
    </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
}

.login-card {
  background: #fff;
  padding: 32px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  width: 100%;
  max-width: 28rem;
}

.login-title {
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 24px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-input {
  width: 100%;
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  box-sizing: border-box;
}

.login-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.3);
}

.login-error {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 4px;
}

.login-btn {
  width: 100%;
  background: #2563eb;
  color: #fff;
  padding: 8px 0;
  border-radius: 6px;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.login-btn:hover {
  background: #1d4ed8;
}
</style>
