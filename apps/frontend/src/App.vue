<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

function toggleLocale() {
  locale.value = locale.value === 'zh-TW' ? 'en' : 'zh-TW';
}
</script>

<template>
  <div class="app-shell">
    <header class="app-bar">
      <div class="app-bar-inner">
        <div class="app-bar-left">
          <svg class="app-logo" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          <span class="app-title">NTUT Exam System</span>
        </div>
        <p class="developer-name">developed by 阿端 and VerechoTJI </p>
        <button class="locale-btn" @click="toggleLocale">
          <svg class="locale-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
          {{ locale === 'zh-TW' ? 'EN' : '中文' }}
        </button>
      </div>
    </header>

    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.app-bar {
  background: #2563eb;
  color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  z-index: 10;
  position: sticky;
  top: 0;
}

.app-bar-inner {
  width: 100%;
  padding: 0 16px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@media (min-width: 640px) {
  .app-bar-inner { padding: 0 24px; }
}

@media (min-width: 1024px) {
  .app-bar-inner { padding: 0 32px; }
}

.app-bar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-logo {
  width: 32px;
  height: 32px;
  color: #fff;
}

.app-title {
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: 0.025em;
}

.developer-name {
  display: flex;
  margin-left: auto;
  margin-right: 16px;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

.locale-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 6px;
  background: rgba(29, 78, 216, 0.5);
  padding: 8px 16px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #fff;
  border: none;
  transition: background-color 0.2s;
}

.locale-btn:hover {
  background: #1d4ed8;
}

.locale-icon {
  width: 16px;
  height: 16px;
}

.app-main {
  flex-grow: 1;
}
</style>
