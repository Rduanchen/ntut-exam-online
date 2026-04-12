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
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
        <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h1 class="text-2xl font-bold text-center mb-6">{{ t('login.title') }}</h1>
            <form @submit.prevent="handleLogin" class="space-y-4">
                <div>
                    <input v-model="studentId" type="text" :placeholder="t('login.placeholder')"
                        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="student-id-input" />
                    <p v-if="error" class="text-red-500 text-sm mt-1" data-testid="error-message">{{ error }}</p>
                </div>
                <button type="submit"
                    class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                    data-testid="login-button">
                    {{ t('login.submit') }}
                </button>
            </form>
        </div>
    </div>
</template>
