<script setup lang="ts">
import { ref } from 'vue';
import type { ScoreBoardFormat, PuzzleResultPayload, TestCaseRecord } from '@my-project/types';

const props = defineProps<{
    result: ScoreBoardFormat;
}>();

const expanded = ref<Record<string, boolean>>({});

function toggle(problemId: string) {
    expanded.value[problemId] = !expanded.value[problemId];
}

function getStats(payload: PuzzleResultPayload) {
    let testTotal = 0;
    let testPassed = 0;
    
    payload.subtasks?.forEach(sub => {
        testTotal += (sub.visible?.length || 0) + (sub.hidden?.length || 0);
        
        const countPassed = (tcs: TestCaseRecord[]) => 
            tcs?.reduce((acc, tc) => tc.status === 'AC' ? acc + 1 : acc, 0) || 0;
            
        testPassed += countPassed(sub.visible) + countPassed(sub.hidden);
    });
    
    let specialTotal = 0;
    let specialPassed = 0;
    if (payload.specialRuleResults) {
        specialTotal = payload.specialRuleResults.length;
        specialPassed = payload.specialRuleResults.filter(r => r.passed).length;
    }
    
    const total = testTotal + specialTotal;
    const passed = testPassed + specialPassed;
    
    return {
        testTotal,
        testPassed,
        specialTotal,
        specialPassed,
        total,
        passed,
        isAC: total > 0 && passed === total
    };
}
</script>

<template>
    <div class="judge-result" data-testid="judge-result">
        <div v-for="(payload, problemId) in props.result" :key="problemId" class="problem-card">
            
            <!-- Accordion Header -->
            <button @click="toggle(String(problemId))" class="accordion-header">
                <div class="accordion-left">
                    <h3 class="problem-title">{{ problemId }}</h3>
                    
                    <div class="badge-group">
                        <span class="status-dot-wrapper">
                            <span class="status-dot" :class="getStats(payload).isAC ? 'dot-green' : 'dot-red'"></span>
                        </span>
                        <span class="status-label" :class="getStats(payload).isAC ? 'label-green' : 'label-red'">
                            {{ getStats(payload).isAC ? 'AC' : 'FAIL' }}
                        </span>
                        
                        <span class="info-badge">
                            Tests: {{ getStats(payload).testPassed }} / {{ getStats(payload).testTotal }}
                        </span>
                        <span v-if="getStats(payload).specialTotal > 0" class="info-badge badge-purple">
                            Rules: {{ getStats(payload).specialPassed }} / {{ getStats(payload).specialTotal }}
                        </span>
                    </div>
                </div>
                
                <!-- Chevron -->
                <div class="chevron-wrap">
                    <svg class="chevron-icon" :class="{ 'chevron-open': expanded[problemId] }" 
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            <!-- Accordion Body -->
            <div v-show="expanded[problemId]" class="accordion-body">
                <div class="accordion-body-inner">
                    <div v-for="(subtask, sIdx) in payload.subtasks" :key="sIdx" class="subtask-card">
                        <h4 class="subtask-title">
                            <svg class="subtask-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                            {{ $t('exam.subtask') }} {{ sIdx + 1 }}
                        </h4>

                        <!-- Visible Cases -->
                        <div v-if="subtask.visible.length" class="cases-section">
                            <p class="cases-label cases-label-visible">
                                <svg class="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                {{ $t('exam.visible') }}
                            </p>
                            <div class="table-wrap">
                                <table class="data-table">
                                    <thead>
                                        <tr>
                                            <th>{{ $t('exam.status') }}</th>
                                            <th>{{ $t('exam.time') }}</th>
                                            <th class="col-wide">{{ $t('exam.output') }}</th>
                                            <th class="col-wide">{{ $t('exam.expectedOutput') }}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(tc, i) in subtask.visible" :key="i">
                                            <td>
                                                <span class="tc-status" :class="tc.status === 'AC' ? 'tc-ac' : 'tc-fail'">
                                                    {{ tc.status }}
                                                </span>
                                            </td>
                                            <td class="td-mono">{{ tc.time }}</td>
                                            <td class="td-output">{{ tc.userOutput }}</td>
                                            <td class="td-output td-expected">{{ tc.expectedOutput }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Hidden Cases -->
                        <div v-if="subtask.hidden.length" class="cases-section">
                            <p class="cases-label cases-label-hidden">
                                <svg class="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                                {{ $t('exam.hidden') }}
                            </p>
                            <div class="table-wrap">
                                <table class="data-table">
                                    <thead>
                                        <tr>
                                            <th>{{ $t('exam.status') }}</th>
                                            <th>{{ $t('exam.time') }}</th>
                                            <th class="col-wide">{{ $t('exam.output') }}</th>
                                            <th class="col-wide">{{ $t('exam.expectedOutput') }}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(tc, i) in subtask.hidden" :key="i">
                                            <td>
                                                <span class="tc-status" :class="tc.status === 'AC' ? 'tc-ac' : 'tc-fail'">
                                                    {{ tc.status }}
                                                </span>
                                            </td>
                                            <td class="td-mono">{{ tc.time }}</td>
                                            <td class="td-output">{{ tc.userOutput }}</td>
                                            <td class="td-output td-expected">{{ tc.expectedOutput }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Special Rule Results -->
                    <div v-if="payload.specialRuleResults?.length" class="subtask-card rules-card">
                        <h4 class="subtask-title rules-title">
                            <svg class="subtask-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                            {{ $t('exam.specialRules') }}
                        </h4>
                        <div class="table-wrap">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>{{ $t('exam.ruleId') }}</th>
                                        <th>{{ $t('exam.passed') }}</th>
                                        <th>{{ $t('exam.message') }}</th>
                                        <th>{{ $t('exam.reason') }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(rule, i) in payload.specialRuleResults" :key="i">
                                        <td class="td-rule-id">{{ rule.ruleId }}</td>
                                        <td>
                                            <span class="tc-status" :class="rule.passed ? 'tc-ac' : 'tc-fail'">
                                                {{ rule.passed ? '✓ PASSED' : '✗ FAILED' }}
                                            </span>
                                        </td>
                                        <td>{{ rule.message }}</td>
                                        <td class="td-reason">{{ rule.reason || '-' }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.judge-result {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.problem-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.problem-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
}

/* Accordion Header */
.accordion-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #fff;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s;
}

.accordion-header:hover {
  background: #f9fafb;
}

.accordion-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.problem-title {
  font-weight: 600;
  font-size: 1.125rem;
  color: #1f2937;
  letter-spacing: -0.01em;
}

.badge-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot-wrapper {
  position: relative;
  display: flex;
  width: 12px;
  height: 12px;
}

.status-dot {
  position: relative;
  display: inline-flex;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.dot-green { background: #22c55e; }
.dot-red { background: #ef4444; }

.status-label {
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.025em;
  margin-right: 8px;
}

.label-green { color: #16a34a; }
.label-red { color: #ef4444; }

.info-badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 4px 10px;
  background: #f3f4f6;
  color: #4b5563;
  border-radius: 9999px;
  border: 1px solid #e5e7eb;
  white-space: nowrap;
}

.badge-purple {
  background: #faf5ff;
  color: #7c3aed;
  border-color: #ede9fe;
}

.chevron-wrap {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #9ca3af;
  transition: background-color 0.2s;
}

.chevron-wrap:hover {
  background: #e5e7eb;
}

.chevron-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s;
}

.chevron-open {
  transform: rotate(180deg);
  color: #3b82f6;
}

/* Accordion Body */
.accordion-body {
  border-top: 1px solid #f3f4f6;
  background: rgba(249, 250, 251, 0.3);
}

.accordion-body-inner {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.subtask-card {
  background: #fff;
  border: 1px solid #f3f4f6;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.subtask-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.subtask-icon {
  width: 16px;
  height: 16px;
  color: #3b82f6;
}

.rules-card {
  margin-top: 16px;
}

.rules-title {
  color: #7c3aed;
}

/* Cases sections */
.cases-section {
  margin-bottom: 20px;
}

.cases-section:last-child {
  margin-bottom: 0;
}

.cases-label {
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 4px;
}

.cases-label-visible { color: #16a34a; }
.cases-label-hidden { color: #f97316; }

.label-icon {
  width: 14px;
  height: 14px;
}

/* Table */
.table-wrap {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.data-table {
  width: 100%;
  font-size: 0.875rem;
}

.data-table thead {
  background: rgba(243, 244, 246, 0.8);
  border-bottom: 1px solid #e5e7eb;
}

.data-table th {
  padding: 10px 16px;
  text-align: left;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.75rem;
}

.col-wide { width: 33%; }

.data-table tbody tr {
  transition: background-color 0.2s;
}

.data-table tbody tr:hover {
  background: rgba(249, 250, 251, 0.5);
}

.data-table tbody tr + tr {
  border-top: 1px solid #f3f4f6;
}

.data-table td {
  padding: 12px 16px;
}

.tc-status {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
}

.tc-ac {
  background: #dcfce7;
  color: #15803d;
}

.tc-fail {
  background: #fee2e2;
  color: #b91c1c;
}

.td-mono {
  color: #6b7280;
  font-family: monospace;
  font-size: 0.75rem;
  white-space: nowrap;
}

.td-output {
  font-family: monospace;
  font-size: 0.75rem;
  color: #374151;
  background: rgba(249, 250, 251, 0.5);
  border-radius: 6px;
  white-space: pre-wrap;
  word-break: break-all;
}

.td-expected {
  color: #6b7280;
}

.td-rule-id {
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
}

.td-reason {
  color: #6b7280;
  font-style: italic;
}
</style>
