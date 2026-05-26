<template>
  <div class="space-y-6">
    <!-- Stats grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <div class="stat bg-base-100 shadow-sm rounded-xl border border-base-300">
        <div class="stat-figure text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div class="stat-title text-base-content/60">{{ t('dashboard.totalUsers') }}</div>
        <div class="stat-value text-primary">{{ stats.totalUsers }}</div>
        <div class="stat-desc text-base-content/50">users total</div>
      </div>

      <div class="stat bg-base-100 shadow-sm rounded-xl border border-base-300">
        <div class="stat-figure text-success">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <div class="stat-title text-base-content/60">{{ t('dashboard.totalRoles') }}</div>
        <div class="stat-value text-success">{{ stats.totalRoles }}</div>
        <div class="stat-desc text-base-content/50">roles total</div>
      </div>

      <div class="stat bg-base-100 shadow-sm rounded-xl border border-base-300">
        <div class="stat-figure text-warning">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
          </svg>
        </div>
        <div class="stat-title text-base-content/60">{{ t('dashboard.onlineUsers') }}</div>
        <div class="stat-value text-warning">{{ stats.onlineUsers }}</div>
        <div class="stat-desc text-base-content/50">currently online</div>
      </div>

      <div class="stat bg-base-100 shadow-sm rounded-xl border border-base-300">
        <div class="stat-figure text-error">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div class="stat-title text-base-content/60">{{ t('dashboard.notices') }}</div>
        <div class="stat-value text-error">{{ stats.totalNotices }}</div>
        <div class="stat-desc text-base-content/50">notices published</div>
      </div>
    </div>

    <!-- Info cards row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Server info -->
      <div class="card bg-base-100 shadow-sm border border-base-300">
        <div class="card-body">
          <h2 class="card-title text-base">{{ t('dashboard.serverInfo') }}</h2>
          <div v-if="serverInfo" class="mt-3 space-y-2 text-sm">
            <div class="flex justify-between py-2 border-b border-base-300">
              <span class="text-base-content/60">{{ t('dashboard.os') }}</span>
              <span class="font-medium">{{ serverInfo.os }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-base-300">
              <span class="text-base-content/60">{{ t('dashboard.cpu') }}</span>
              <span class="font-medium">{{ serverInfo.cpuUsage }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-base-300">
              <span class="text-base-content/60">{{ t('dashboard.memory') }}</span>
              <span class="font-medium">{{ serverInfo.mem?.usage }}</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-base-content/60">{{ t('dashboard.uptime') }}</span>
              <span class="font-medium">{{ serverInfo.uptime }}</span>
            </div>
          </div>
          <div v-else class="mt-3 space-y-2">
            <div class="h-4 bg-base-300 rounded animate-pulse w-3/4"></div>
            <div class="h-4 bg-base-300 rounded animate-pulse w-1/2"></div>
            <div class="h-4 bg-base-300 rounded animate-pulse w-2/3"></div>
          </div>
        </div>
      </div>

      <!-- Recent login logs -->
      <div class="card bg-base-100 shadow-sm border border-base-300">
        <div class="card-body">
          <h2 class="card-title text-base">{{ t('dashboard.recentLoginLogs') }}</h2>
          <div class="overflow-x-auto mt-3">
            <table class="table table-sm table-zebra">
              <thead>
                <tr>
                  <th class="text-xs">{{ t('dashboard.user') }}</th>
                  <th class="text-xs">{{ t('dashboard.ip') }}</th>
                  <th class="text-xs">{{ t('dashboard.status') }}</th>
                  <th class="text-xs">{{ t('dashboard.time') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in recentLogs" :key="log.id">
                  <td class="text-xs">{{ log.username }}</td>
                  <td class="text-xs">{{ log.ip }}</td>
                  <td>
                    <span class="badge badge-sm" :class="log.status === 1 ? 'badge-success' : 'badge-error'">
                      {{ log.status === 1 ? t('dashboard.success') : t('dashboard.failed') }}
                    </span>
                  </td>
                  <td class="text-xs text-base-content/60">{{ log.createTime }}</td>
                </tr>
                <tr v-if="!recentLogs.length">
                  <td colspan="4" class="text-center text-base-content/40 py-4 text-sm">No data</td>
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