<script setup lang="ts">
import DashboardPage from './pages/DashboardPage.vue'
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

function toggleLocale() {
  locale.value = locale.value === 'zh-TW' ? 'en' : 'zh-TW';
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans">
    <!-- Material Design App Bar (TA Version) -->
    <header class="bg-indigo-700 text-white shadow-md z-10 sticky top-0">
      <div class="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- Shield/Admin Icon -->
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
          </svg>
          <span class="text-xl font-medium tracking-wide">NTUT TA Dashboard</span>
        </div>
        
        <button
          class="flex items-center gap-1 rounded-md bg-indigo-800/50 hover:bg-indigo-800 px-4 py-2 text-sm font-medium transition-colors duration-200"
          @click="toggleLocale"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
          </svg>
          {{ locale === 'zh-TW' ? 'EN' : '中文' }}
        </button>
      </div>
    </header>

    <main class="flex-grow">
      <DashboardPage />
    </main>
  </div>
</template>
