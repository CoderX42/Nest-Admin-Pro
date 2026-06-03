<template>
  <div class="space-y-4">
    <!-- Server info + memory side by side -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="card bg-base-100 shadow-sm border border-base-300">
        <div class="card-body p-4">
          <h3 class="card-title text-sm font-semibold mb-4">{{ t('monitor.server.serverInfo') }}</h3>
          <div v-if="info" class="space-y-3">
            <div class="flex justify-between py-2 border-b border-base-300 text-sm">
              <span class="text-base-content/60">{{ t('monitor.server.os') }}</span>
              <span class="font-medium">{{ info.os }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-base-300 text-sm">
              <span class="text-base-content/60">{{ t('monitor.server.hostname') }}</span>
              <span class="font-medium">{{ info.hostname }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-base-300 text-sm">
              <span class="text-base-content/60">{{ t('monitor.server.cpuCores') }}</span>
              <span class="font-medium">{{ info.cpuCount }}</span>
            </div>
            <div class="flex justify-between py-2 text-sm">
              <span class="text-base-content/60">{{ t('monitor.server.uptime') }}</span>
              <span class="font-medium">{{ info.uptime }}</span>
            </div>
          </div>
          <div v-else class="space-y-3">
            <div class="h-5 bg-base-300 rounded animate-pulse w-3/4"></div>
            <div class="h-5 bg-base-300 rounded animate-pulse w-1/2"></div>
            <div class="h-5 bg-base-300 rounded animate-pulse w-2/3"></div>
            <div class="h-5 bg-base-300 rounded animate-pulse w-1/2"></div>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 shadow-sm border border-base-300">
        <div class="card-body p-4">
          <h3 class="card-title text-sm font-semibold mb-4">{{ t('monitor.server.memoryUsage') }}</h3>
          <div v-if="info?.mem" class="space-y-3">
            <div class="flex justify-between py-2 border-b border-base-300 text-sm">
              <span class="text-base-content/60">{{ t('monitor.server.total') }}</span>
              <span class="font-medium">{{ info.mem.total }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-base-300 text-sm">
              <span class="text-base-content/60">{{ t('monitor.server.used') }}</span>
              <span class="font-medium">{{ info.mem.used }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-base-300 text-sm">
              <span class="text-base-content/60">{{ t('monitor.server.free') }}</span>
              <span class="font-medium">{{ info.mem.free }}</span>
            </div>
            <div class="flex justify-between py-2 items-center text-sm">
              <span class="text-base-content/60">{{ t('monitor.server.usage') }}</span>
              <div class="w-48">
                <progress class="progress" :class="getMemColorClass(parseFloat(info.mem.usage))" :value="parseFloat(info.mem.usage)" max="100"></progress>
                <span class="text-xs text-base-content/60">{{ info.mem.usage }}</span>
              </div>
            </div>
          </div>
          <div v-else class="space-y-3">
            <div class="h-5 bg-base-300 rounded animate-pulse w-3/4"></div>
            <div class="h-5 bg-base-300 rounded animate-pulse w-1/2"></div>
            <div class="h-5 bg-base-300 rounded animate-pulse w-2/3"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- CPU usage -->
    <div class="card bg-base-100 shadow-sm border border-base-300">
      <div class="card-body p-4">
        <h3 class="card-title text-sm font-semibold mb-4">{{ t('monitor.server.cpuUsage') }}</h3>
        <div v-if="info" class="flex items-center gap-4">
          <div class="flex-1">
            <progress class="progress progress-primary w-full" :value="parseFloat(info.cpuUsage)" max="100"></progress>
          </div>
          <span class="font-bold text-lg w-20 text-right">{{ info.cpuUsage }}</span>
        </div>
        <div v-else class="h-5 bg-base-300 rounded animate-pulse w-1/2"></div>
      </div>
    </div>

    <button class="btn btn-primary" @click="loadData">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
      {{ t('common.action.refresh') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { serverApi } from '@/api/monitor/server';
import { ElMessage } from 'element-plus';

const { t } = useI18n();
const info = ref<any>(null);

const getMemColorClass = (p: number) => p > 80 ? 'progress-error' : p > 50 ? 'progress-warning' : 'progress-success';

const loadData = async () => {
  try { info.value = await serverApi.info(); }
  catch { ElMessage.error(t('common.message.loadFailed')); }
};

onMounted(() => loadData());
</script>
