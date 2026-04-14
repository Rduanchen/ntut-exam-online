<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

function toggleLocale() {
  locale.value = locale.value === 'zh-TW' ? 'en' : 'zh-TW';
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans">
    <!-- Material Design App Bar -->
    <header class="bg-blue-600 text-white shadow-md z-10 sticky top-0">
      <div class="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- Material Icon placeholder (could add an SVG logo here) -->
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          <span class="text-xl font-medium tracking-wide">NTUT Exam System</span>
        </div>
        
        <button
          class="flex items-center gap-1 rounded-md bg-blue-700/50 hover:bg-blue-700 px-4 py-2 text-sm font-medium transition-colors duration-200"
          @click="toggleLocale"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
          {{ locale === 'zh-TW' ? 'EN' : '中文' }}
        </button>
      </div>
    </header>

    <main class="flex-grow">
      <router-view />
    </main>
  </div>
</template>
