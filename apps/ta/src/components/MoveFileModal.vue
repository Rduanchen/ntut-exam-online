<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { moveFile } from '../services/api';

const props = defineProps<{
    filename: string;
}>();

const emit = defineEmits<{
    close: [];
    moved: [];
}>();

const { t } = useI18n();

const newFileName = ref('');
const error = ref('');
const isMoving = ref(false);
const successMsg = ref('');

async function handleMove() {
    if (!newFileName.value.trim()) {
        error.value = t('modal.required');
        return;
    }
    error.value = '';
    isMoving.value = true;
    try {
        await moveFile(props.filename, newFileName.value.trim());
        successMsg.value = t('modal.success');
        setTimeout(() => {
            emit('moved');
            emit('close');
        }, 800);
    } catch {
        error.value = t('modal.error');
    } finally {
        isMoving.value = false;
    }
}
</script>

<template>
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-testid="modal-overlay"
        @click.self="emit('close')">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" data-testid="move-file-modal">
            <h2 class="text-xl font-bold mb-4">{{ t('modal.title') }}</h2>

            <div class="mb-3">
                <label class="block text-sm font-medium text-gray-600 mb-1">{{ t('modal.filename') }}</label>
                <p class="text-sm bg-gray-100 px-3 py-2 rounded" data-testid="modal-source">{{ filename }}</p>
            </div>

            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-600 mb-1">{{ t('modal.newFileName') }}</label>
                <input v-model="newFileName" type="text" :placeholder="t('modal.placeholder')"
                    class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="new-filename-input" />
                <p v-if="error" class="text-red-500 text-sm mt-1" data-testid="modal-error">{{ error }}</p>
                <p v-if="successMsg" class="text-green-600 text-sm mt-1" data-testid="modal-success">{{ successMsg }}</p>
            </div>

            <div class="flex justify-end gap-3">
                <button @click="emit('close')"
                    class="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300 transition"
                    data-testid="modal-cancel">
                    {{ t('modal.cancel') }}
                </button>
                <button @click="handleMove" :disabled="isMoving"
                    class="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                    data-testid="modal-confirm">
                    {{ isMoving ? t('modal.moving') : t('modal.confirm') }}
                </button>
            </div>
        </div>
    </div>
</template>
