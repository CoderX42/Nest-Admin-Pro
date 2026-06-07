<template>
  <div class="page-container">
    <el-row :gutter="16" class="stat-row">
      <el-col v-for="card in statCards" :key="card.key" :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card__content">
            <div class="stat-card__icon" :style="{ backgroundColor: card.tint }">
              <el-icon :color="card.color" :size="24">
                <component :is="card.icon" />
              </el-icon>
            </div>
            <div class="stat-card__meta">
              <div class="stat-card__label">{{ card.label }}</div>
              <el-statistic :value="card.value" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :xs="24" :lg="10">
        <el-card class="panel-card" v-loading="!serverInfo">
          <template #header>
            <div class="panel-card__header">
              <span>{{ t('dashboard.serverInfo') }}</span>
              <el-tag v-if="serverInfo" type="success" effect="plain">Online</el-tag>
            </div>
          </template>

          <el-descriptions v-if="serverInfo" :column="1" border>
            <el-descriptions-item :label="t('dashboard.os')">{{ serverInfo.os }}</el-descriptions-item>
            <el-descriptions-item :label="t('dashboard.cpu')">{{ serverInfo.cpuUsage }}</el-descriptions-item>
            <el-descriptions-item :label="t('dashboard.memory')">{{ serverInfo.mem?.usage }}</el-descriptions-item>
            <el-descriptions-item :label="t('dashboard.uptime')">{{ serverInfo.uptime }}</el-descriptions-item>
          </el-descriptions>

          <el-skeleton v-else :rows="4" animated />
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="14">
        <el-card class="panel-card">
          <template #header>
            <span>{{ t('dashboard.recentLoginLogs') }}</span>
          </template>

          <el-table :data="recentLogs" border>
            <el-table-column prop="username" :label="t('dashboard.user')" min-width="120" />
            <el-table-column prop="ip" :label="t('dashboard.ip')" min-width="140" />
            <el-table-column :label="t('dashboard.status')" width="110">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'" effect="plain">
                  {{ row.status === 1 ? t('dashboard.success') : t('dashboard.failed') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" :label="t('dashboard.time')" min-width="180" />
          </el-table>

          <el-empty v-if="!recentLogs.length" :description="'No data'" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Cpu, DataBoard, Files, Monitor, User } from '@element-plus/icons-vue';
import { loginLogApi } from '@/api/monitor/login-log';
import { onlineApi } from '@/api/monitor/online';
import { serverApi } from '@/api/monitor/server';
import { noticeApi } from '@/api/system/notice';
import { roleApi } from '@/api/system/role';
import { userApi } from '@/api/system/user';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const stats = ref({ totalUsers: 0, totalRoles: 0, onlineUsers: 0, totalNotices: 0 });
const serverInfo = ref<any>(null);
const recentLogs = ref<any[]>([]);

const statCards = computed(() => [
  {
    key: 'users',
    label: t('dashboard.totalUsers'),
    value: stats.value.totalUsers,
    icon: User,
    color: '#409eff',
    tint: 'rgba(64, 158, 255, 0.12)',
  },
  {
    key: 'roles',
    label: t('dashboard.totalRoles'),
    value: stats.value.totalRoles,
    icon: Monitor,
    color: '#67c23a',
    tint: 'rgba(103, 194, 58, 0.12)',
  },
  {
    key: 'online',
    label: t('dashboard.onlineUsers'),
    value: stats.value.onlineUsers,
    icon: DataBoard,
    color: '#e6a23c',
    tint: 'rgba(230, 162, 60, 0.12)',
  },
  {
    key: 'notice',
    label: t('dashboard.notices'),
    value: stats.value.totalNotices,
    icon: Files,
    color: '#f56c6c',
    tint: 'rgba(245, 108, 108, 0.12)',
  },
]);

function getPageRows<T>(result: { items?: T[] } | { list?: T[] }) {
  const page = result as { items?: T[]; list?: T[] };
  return page.items || page.list || [];
}

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
    recentLogs.value = getPageRows(logRes);
  } catch (e) {
    console.error('Failed to load dashboard data', e);
  }
});
</script>

<style scoped>
.page-container {
  padding: 16px;
}

.stat-row {
  margin-bottom: 16px;
}

.stat-card {
  margin-bottom: 16px;
}

.stat-card__content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
}

.stat-card__meta {
  flex: 1;
}

.stat-card__label {
  margin-bottom: 8px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.panel-card {
  margin-bottom: 16px;
}

.panel-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
