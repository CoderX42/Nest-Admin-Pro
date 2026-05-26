<template>
  <div class="space-y-4">
    <!-- Stats grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="stat bg-base-100 shadow-sm border border-base-300 rounded-xl p-4 cursor-default transition-all hover:shadow-md hover:-translate-y-0.5">
        <div class="flex items-center gap-4">
          <div class="stat-figure text-primary">
            <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="stat-title text-xs text-base-content/50 font-medium uppercase tracking-wider">{{ t('dashboard.totalUsers') }}</div>
            <div class="stat-value text-2xl font-bold text-primary mt-1">{{ stats.totalUsers }}</div>
          </div>
        </div>
      </div>

      <div class="stat bg-base-100 shadow-sm border border-base-300 rounded-xl p-4 cursor-default transition-all hover:shadow-md hover:-translate-y-0.5">
        <div class="flex items-center gap-4">
          <div class="stat-figure text-success">
            <div class="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="stat-title text-xs text-base-content/50 font-medium uppercase tracking-wider">{{ t('dashboard.totalRoles') }}</div>
            <div class="stat-value text-2xl font-bold text-success mt-1">{{ stats.totalRoles }}</div>
          </div>
        </div>
      </div>

      <div class="stat bg-base-100 shadow-sm border border-base-300 rounded-xl p-4 cursor-default transition-all hover:shadow-md hover:-translate-y-0.5">
        <div class="flex items-center gap-4">
          <div class="stat-figure text-warning">
            <div class="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
              </svg>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="stat-title text-xs text-base-content/50 font-medium uppercase tracking-wider">{{ t('dashboard.onlineUsers') }}</div>
            <div class="stat-value text-2xl font-bold text-warning mt-1">{{ stats.onlineUsers }}</div>
          </div>
        </div>
      </div>

      <div class="stat bg-base-100 shadow-sm border border-base-300 rounded-xl p-4 cursor-default transition-all hover:shadow-md hover:-translate-y-0.5">
        <div class="flex items-center gap-4">
          <div class="stat-figure text-error">
            <div class="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="stat-title text-xs text-base-content/50 font-medium uppercase tracking-wider">{{ t('dashboard.notices') }}</div>
            <div class="stat-value text-2xl font-bold text-error mt-1">{{ stats.totalNotices }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Info cards row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Server info -->
      <div class="card bg-base-100 shadow-sm border border-base-300 rounded-xl overflow-hidden">
        <div class="card-body p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title text-sm font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary inline-block mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
              </svg>
              {{ t('dashboard.serverInfo') }}
            </h2>
            <span v-if="serverInfo" class="badge badge-success badge-sm gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-success"></span>
              Online
            </span>
          </div>
          <div v-if="serverInfo" class="space-y-2.5">
            <div class="flex items-center justify-between py-2 border-b border-base-200 text-sm">
              <span class="text-base-content/50">{{ t('dashboard.os') }}</span>
              <span class="font-medium font-mono text-xs">{{ serverInfo.os }}</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-base-200 text-sm">
              <span class="text-base-content/50">{{ t('dashboard.cpu') }}</span>
              <span class="font-medium font-mono text-xs">{{ serverInfo.cpuUsage }}</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-base-200 text-sm">
              <span class="text-base-content/50">{{ t('dashboard.memory') }}</span>
              <span class="font-medium font-mono text-xs">{{ serverInfo.mem?.usage }}</span>
            </div>
            <div class="flex items-center justify-between py-2 text-sm">
              <span class="text-base-content/50">{{ t('dashboard.uptime') }}</span>
              <span class="font-medium font-mono text-xs">{{ serverInfo.uptime }}</span>
            </div>
          </div>
          <div v-else class="space-y-3">
            <div class="h-5 bg-base-200 rounded animate-pulse"></div>
            <div class="h-5 bg-base-200 rounded animate-pulse w-3/4"></div>
            <div class="h-5 bg-base-200 rounded animate-pulse w-1/2"></div>
            <div class="h-5 bg-base-200 rounded animate-pulse w-2/3"></div>
          </div>
        </div>
      </div>

      <!-- Recent login logs -->
      <div class="card bg-base-100 shadow-sm border border-base-300 rounded-xl overflow-hidden">
        <div class="card-body p-5">
          <h2 class="card-title text-sm font-semibold mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary inline-block mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ t('dashboard.recentLoginLogs') }}
          </h2>
          <div class="overflow-x-auto">
            <table class="table table-sm text-xs">
              <thead>
                <tr class="text-xs uppercase tracking-wider text-base-content/50 font-semibold border-b border-base-200">
                  <th class="font-medium">{{ t('dashboard.user') }}</th>
                  <th class="font-medium">{{ t('dashboard.ip') }}</th>
                  <th class="font-medium">{{ t('dashboard.status') }}</th>
                  <th class="font-medium">{{ t('dashboard.time') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-base-200">
                <tr v-for="log in recentLogs" :key="log.id" class="hover:bg-base-200/50 transition-colors">
                  <td class="font-medium">{{ log.username }}</td>
                  <td class="font-mono text-base-content/60">{{ log.ip }}</td>
                  <td>
                    <span class="badge badge-sm font-medium" :class="log.status === 1 ? 'badge-success' : 'badge-error'">
                      {{ log.status === 1 ? t('dashboard.success') : t('dashboard.failed') }}
                    </span>
                  </td>
                  <td class="text-base-content/50">{{ log.createTime }}</td>
                </tr>
                <tr v-if="!recentLogs.length">
                  <td colspan="4" class="text-center py-8 text-base-content/40">No data</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { userApi, roleApi, onlineApi, noticeApi, serverApi, loginLogApi } from '@/api';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const stats = ref({ totalUsers: 0, totalRoles: 0, onlineUsers: 0, totalNotices: 0 });
const serverInfo = ref<any>(null);
const recentLogs = ref<any[]>([]);

onMounted(async () => {
  try {
    const [userRes, roleRes, onlineRes, noticeRes, serverRes, logRes] = await Promise.all([
      userApi.list({ page: 1, limit: 1 }),
      roleApi.list({ page: 1, limit: 1 }),
      onlineApi.list(),
      noticeApi.list({ page: 1, limit: 1 }),
      serverApi.info(),
      loginLogApi.list({ page: 1, limit: 5 }),
    ]);
    stats.value = {
      totalUsers: userRes.total || 0,
      totalRoles: roleRes.total || 0,
      onlineUsers: onlineRes.length || 0,
      totalNotices: noticeRes.total || 0,
    };
    serverInfo.value = serverRes;
    recentLogs.value = logRes.items || [];
  } catch (e) {
    console.error('Failed to load dashboard data', e);
  }
});
</script>