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
    <div class="space-y-4" data-testid="judge-result">
        <div v-for="(payload, problemId) in props.result" :key="problemId"
            class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-shadow hover:shadow-md">
            
            <!-- Accordion Header -->
            <button @click="toggle(String(problemId))"
                class="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 focus:outline-none transition-colors cursor-pointer text-left">
                <div class="flex items-center gap-4 flex-wrap">
                    <h3 class="font-semibold text-lg text-gray-800 tracking-tight">{{ problemId }}</h3>
                    
                    <!-- Header Indicator & Badge -->
                    <div class="flex items-center gap-2">
                        <span class="relative flex h-3 w-3">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" 
                                  :class="getStats(payload).isAC ? 'bg-green-400' : 'bg-red-400'"></span>
                            <span class="relative inline-flex rounded-full h-3 w-3 shadow-inner" 
                                  :class="getStats(payload).isAC ? 'bg-green-500' : 'bg-red-500'"></span>
                        </span>
                        <span class="text-sm font-bold tracking-wide mr-2" :class="getStats(payload).isAC ? 'text-green-600' : 'text-red-500'">
                            {{ getStats(payload).isAC ? 'AC' : 'FAIL' }}
                        </span>
                        
                        <!-- Badges -->
                        <span class="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full border border-gray-200 whitespace-nowrap">
                            Tests: {{ getStats(payload).testPassed }} / {{ getStats(payload).testTotal }}
                        </span>
                        <span v-if="getStats(payload).specialTotal > 0" class="text-xs font-medium px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-100 whitespace-nowrap">
                            Rules: {{ getStats(payload).specialPassed }} / {{ getStats(payload).specialTotal }}
                        </span>
                    </div>
                </div>
                
                <!-- Chevron -->
                <div class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-400 transition-colors">
                    <svg class="w-5 h-5 transform transition-transform duration-300" 
                        :class="expanded[problemId] ? 'rotate-180 text-blue-500' : ''" 
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            <!-- Accordion Body -->
            <div v-show="expanded[problemId]" class="border-t border-gray-100 bg-gray-50/30">
                <div class="p-4 space-y-6">
                    <div v-for="(subtask, sIdx) in payload.subtasks" :key="sIdx" class="bg-white border border-gray-100 rounded-lg p-5 shadow-sm">
                        <h4 class="text-sm font-bold text-gray-700 mb-3 border-b pb-2 flex items-center gap-2 uppercase tracking-wide">
                            <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                            {{ $t('exam.subtask') }} {{ sIdx + 1 }}
                        </h4>

                        <!-- Visible Cases -->
                        <div v-if="subtask.visible.length" class="mb-5">
                            <p class="text-xs font-semibold text-green-600 mb-2 uppercase tracking-wider flex items-center gap-1">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                {{ $t('exam.visible') }}
                            </p>
                            <div class="overflow-x-auto rounded-lg border border-gray-200">
                                <table class="w-full text-sm">
                                    <thead class="bg-gray-100/80 border-b border-gray-200">
                                        <tr>
                                            <th class="px-4 py-2.5 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">{{ $t('exam.status') }}</th>
                                            <th class="px-4 py-2.5 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">{{ $t('exam.time') }}</th>
                                            <th class="px-4 py-2.5 text-left font-medium text-gray-500 uppercase tracking-wider text-xs w-1/3">{{ $t('exam.output') }}</th>
                                            <th class="px-4 py-2.5 text-left font-medium text-gray-500 uppercase tracking-wider text-xs w-1/3">{{ $t('exam.expectedOutput') }}</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-100">
                                        <tr v-for="(tc, i) in subtask.visible" :key="i" class="hover:bg-gray-50/50 transition-colors">
                                            <td class="px-4 py-3 whitespace-nowrap">
                                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold"
                                                      :class="tc.status === 'AC' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                                                    {{ tc.status }}
                                                </span>
                                            </td>
                                            <td class="px-4 py-3 text-gray-500 font-mono text-xs whitespace-nowrap">{{ tc.time }}</td>
                                            <td class="px-4 py-3 font-mono text-xs text-gray-700 bg-gray-50/50 m-1 rounded-md whitespace-pre-wrap break-all">{{ tc.userOutput }}</td>
                                            <td class="px-4 py-3 font-mono text-xs text-gray-500 bg-gray-50/50 m-1 rounded-md whitespace-pre-wrap break-all">{{ tc.expectedOutput }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Hidden Cases -->
                        <div v-if="subtask.hidden.length">
                            <p class="text-xs font-semibold text-orange-500 mb-2 uppercase tracking-wider flex items-center gap-1">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                                {{ $t('exam.hidden') }}
                            </p>
                            <div class="overflow-x-auto rounded-lg border border-gray-200">
                                <table class="w-full text-sm">
                                    <thead class="bg-gray-100/80 border-b border-gray-200">
                                        <tr>
                                            <th class="px-4 py-2.5 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">{{ $t('exam.status') }}</th>
                                            <th class="px-4 py-2.5 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">{{ $t('exam.time') }}</th>
                                            <th class="px-4 py-2.5 text-left font-medium text-gray-500 uppercase tracking-wider text-xs w-1/3">{{ $t('exam.output') }}</th>
                                            <th class="px-4 py-2.5 text-left font-medium text-gray-500 uppercase tracking-wider text-xs w-1/3">{{ $t('exam.expectedOutput') }}</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-100">
                                        <tr v-for="(tc, i) in subtask.hidden" :key="i" class="hover:bg-gray-50/50 transition-colors">
                                            <td class="px-4 py-3 whitespace-nowrap">
                                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold"
                                                      :class="tc.status === 'AC' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                                                    {{ tc.status }}
                                                </span>
                                            </td>
                                            <td class="px-4 py-3 text-gray-500 font-mono text-xs whitespace-nowrap">{{ tc.time }}</td>
                                            <td class="px-4 py-3 font-mono text-xs text-gray-700 bg-gray-50/50 m-1 rounded-md whitespace-pre-wrap break-all">{{ tc.userOutput }}</td>
                                            <td class="px-4 py-3 font-mono text-xs text-gray-500 bg-gray-50/50 m-1 rounded-md whitespace-pre-wrap break-all">{{ tc.expectedOutput }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Special Rule Results -->
                    <div v-if="payload.specialRuleResults?.length" class="bg-white border border-gray-100 rounded-lg p-5 shadow-sm mt-4">
                        <h4 class="text-sm font-bold text-purple-600 mb-3 border-b pb-2 flex items-center gap-2 uppercase tracking-wide">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                            {{ $t('exam.specialRules') }}
                        </h4>
                        <div class="overflow-x-auto rounded-lg border border-gray-200">
                            <table class="w-full text-sm">
                                <thead class="bg-gray-100/80 border-b border-gray-200">
                                    <tr>
                                        <th class="px-4 py-2.5 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">{{ $t('exam.ruleId') }}</th>
                                        <th class="px-4 py-2.5 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">{{ $t('exam.passed') }}</th>
                                        <th class="px-4 py-2.5 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">{{ $t('exam.message') }}</th>
                                        <th class="px-4 py-2.5 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">{{ $t('exam.reason') }}</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100">
                                    <tr v-for="(rule, i) in payload.specialRuleResults" :key="i" class="hover:bg-gray-50/50 transition-colors">
                                        <td class="px-4 py-3 font-medium text-gray-700 whitespace-nowrap">{{ rule.ruleId }}</td>
                                        <td class="px-4 py-3 whitespace-nowrap">
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold"
                                                  :class="rule.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                                                {{ rule.passed ? '✓ PASSED' : '✗ FAILED' }}
                                            </span>
                                        </td>
                                        <td class="px-4 py-3 text-gray-600">{{ rule.message }}</td>
                                        <td class="px-4 py-3 text-gray-500 italic">{{ rule.reason || '-' }}</td>
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
