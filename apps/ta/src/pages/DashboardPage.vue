<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { fetchFileList, fetchLogs, type FileList } from '../services/api';
import MoveFileModal from '../components/MoveFileModal.vue';

const { t } = useI18n();

const fileList = ref<FileList>({});
const logs = ref('');
const searchQuery = ref('');
const activeTab = ref<'submissions' | 'logs'>('submissions');
const selectedFile = ref<string | null>(null);

const filteredFileList = computed(() => {
    const q = searchQuery.value.toLowerCase();
    if (!q) return fileList.value;
    const result: FileList = {};
    for (const [dir, files] of Object.entries(fileList.value)) {
        if (dir.toLowerCase().includes(q)) {
            result[dir] = files;
        } else {
            const matched = files.filter((f) => f.toLowerCase().includes(q));
            if (matched.length) result[dir] = matched;
        }
    }
    return result;
});

async function loadFiles() {
    fileList.value = await fetchFileList();
}

async function loadLogs() {
    logs.value = await fetchLogs();
}

function openModal(dirname: string) {
    selectedFile.value = dirname;
}

function onMoved() {
    selectedFile.value = null;
    loadFiles();
}

onMounted(() => {
    loadFiles();
    loadLogs();
});
</script>

<template>
    <div class="min-h-[calc(100vh-64px)] bg-gray-50 p-6">
        <div class="w-full max-w-7xl mx-auto">
            <h1 class="text-3xl font-bold tracking-tight mb-8" style="color: black;">{{ t('dashboard.title') }}</h1>

            <!-- Material Design Tabs -->
            <div class="flex gap-8 mb-6 border-b border-gray-200">
                <button @click="activeTab = 'submissions'"
                    class="pb-3 px-2 text-base font-medium transition-all relative outline-none flex items-center gap-2"
                    :class="activeTab === 'submissions' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/50 rounded-t-md'"
                    data-testid="tab-submissions">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    {{ t('dashboard.submissions') }}
                    <span v-if="activeTab === 'submissions'" class="absolute bottom-[-1px] left-0 w-full h-[3px] bg-indigo-600 rounded-t-full"></span>
                </button>
                <button @click="activeTab = 'logs'; loadLogs()"
                    class="pb-3 px-2 text-base font-medium transition-all relative outline-none flex items-center gap-2"
                    :class="activeTab === 'logs' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/50 rounded-t-md'"
                    data-testid="tab-logs">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                    {{ t('dashboard.logs') }}
                    <span v-if="activeTab === 'logs'" class="absolute bottom-[-1px] left-0 w-full h-[3px] bg-indigo-600 rounded-t-full"></span>
                </button>
            </div>

            <!-- Submissions tab -->
            <div v-if="activeTab === 'submissions'" class="animate-in fade-in duration-300">
                <div class="flex flex-col sm:flex-row gap-4 mb-6">
                    <div class="relative flex-1 group">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <input v-model="searchQuery" type="text" :placeholder="t('dashboard.search') + ' user or filename...'"
                            class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow shadow-sm sm:text-sm"
                            data-testid="search-input" />
                    </div>
                    <button @click="loadFiles"
                        class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-indigo-700 bg-indigo-50 hover:bg-indigo-100 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        data-testid="refresh-button">
                        <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        {{ t('dashboard.refresh') }}
                    </button>
                </div>

                <div v-if="Object.keys(filteredFileList).length === 0"
                    class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center" data-testid="no-submissions">
                    <svg class="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                    <h3 class="text-lg font-medium text-gray-900">{{ t('dashboard.noSubmissions') }}</h3>
                </div>

                <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div v-for="(files, dirname) in filteredFileList" :key="dirname"
                        class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-md hover:border-indigo-300 active:scale-[0.99] transition-all group flex flex-col h-full"
                        :data-testid="`submission-${dirname}`"
                        @click="openModal(dirname)">
                        <div class="flex justify-between items-start mb-4">
                            <div class="flex items-center gap-3">
                                <div class="bg-indigo-100 text-indigo-600 p-2.5 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                </div>
                                <div>
                                    <h3 class="font-bold text-gray-900 text-lg group-hover:text-indigo-700 transition-colors">{{ dirname }}</h3>
                                    <p class="text-sm text-gray-500 font-medium">{{ files.length }} {{ t('dashboard.files') }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="mt-auto flex flex-wrap gap-2 pt-4 border-t border-gray-50">
                            <span v-for="file in files" :key="file"
                                class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 truncate max-w-full"
                                :title="file">
                                <svg class="mr-1 h-3 w-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path></svg>
                                {{ file }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Logs tab -->
            <div v-if="activeTab === 'logs'" class="animate-in fade-in duration-300">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        System Logs
                    </h2>
                    <button @click="loadLogs"
                        class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        data-testid="refresh-logs-button">
                        <svg class="mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        {{ t('dashboard.refresh') }}
                    </button>
                </div>
                
                <div class="rounded-xl overflow-hidden shadow-2xl border border-gray-800 bg-[#0f172a]">
                    <!-- Terminal Header/Titlebar -->
                    <div class="bg-gray-900 px-4 py-3 flex items-center border-b border-gray-800">
                        <div class="flex space-x-2">
                            <div class="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
                            <div class="w-3 h-3 rounded-full bg-yellow-500 shadow-sm"></div>
                            <div class="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
                        </div>
                        <div class="mx-auto text-xs font-mono text-gray-400 tracking-wider">
                            ta-server ~ tail -f /var/log/system.log
                        </div>
                    </div>
                    
                    <!-- Terminal Output content -->
                    <div class="p-5 overflow-auto max-h-[650px] CustomScrollbar">
                        <pre v-if="logs"
                            class="font-mono text-[13px] leading-relaxed text-gray-300 whitespace-pre-wrap break-all"
                            data-testid="logs-content">{{ logs }}</pre>
                        <p v-else class="text-gray-500 text-center py-12 font-mono text-sm" data-testid="no-logs">
                            > {{ t('dashboard.noLogs') }}<span class="animate-pulse">_</span>
                        </p>
                    </div>
                </div>
            </div>

            <!-- Move file modal -->
            <MoveFileModal v-if="selectedFile" :filename="selectedFile"
                @close="selectedFile = null" @moved="onMoved" />
        </div>
    </div>
</template>

<style scoped>
/* Optional: Make terminal scrollbar prettier */
.CustomScrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.CustomScrollbar::-webkit-scrollbar-track {
  background: #0f172a; 
}
.CustomScrollbar::-webkit-scrollbar-thumb {
  background: #334155; 
  border-radius: 4px;
}
.CustomScrollbar::-webkit-scrollbar-thumb:hover {
  background: #475569; 
}
</style>
