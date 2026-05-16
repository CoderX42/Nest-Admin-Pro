<template>
  <div class="dashboard space-y-5">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-primary">
            <el-icon :size="32"><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalUsers }}</div>
            <div class="stat-label">{{ t('dashboard.totalUsers') }}</div>
          </div>
        </div>
      </div>
      <div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-success">
            <el-icon :size="32"><Key /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalRoles }}</div>
            <div class="stat-label">{{ t('dashboard.totalRoles') }}</div>
          </div>
        </div>
      </div>
      <div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-warning">
            <el-icon :size="32"><Connection /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.onlineUsers }}</div>
            <div class="stat-label">{{ t('dashboard.onlineUsers') }}</div>
          </div>
        </div>
      </div>
      <div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-danger">
            <el-icon :size="32"><Bell /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalNotices }}</div>
            <div class="stat-label">{{ t('dashboard.notices') }}</div>
          </div>
        </div>
      </div>
    </div>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card :header="t('dashboard.serverInfo')">
          <div class="server-info" v-if="serverInfo">
            <div class="info-item">
              <span class="label">{{ t('dashboard.os') }}:</span>
              <span class="value">{{ serverInfo.os }}</span>
            </div>
            <div class="info-item">
              <span class="label">{{ t('dashboard.cpu') }}:</span>
              <span class="value">{{ serverInfo.cpuUsage }}</span>
            </div>
            <div class="info-item">
              <span class="label">{{ t('dashboard.memory') }}:</span>
              <span class="value">{{ serverInfo.mem?.usage }}</span>
            </div>
            <div class="info-item">
              <span class="label">{{ t('dashboard.uptime') }}:</span>
              <span class="value">{{ serverInfo.uptime }}</span>
            </div>
          </div>
          <el-skeleton v-else :rows="4" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card :header="t('dashboard.recentLoginLogs')">
          <el-table :data="recentLogs" style="width: 100%">
            <el-table-column prop="username" :label="t('dashboard.user')" width="120" />
            <el-table-column prop="ip" :label="t('dashboard.ip')" width="140" />
            <el-table-column prop="status" :label="t('dashboard.status')" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                  {{ row.status === 1 ? t('dashboard.success') : t('dashboard.failed') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" :label="t('dashboard.time')" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { userApi, roleApi, onlineApi, noticeApi, serverApi, loginLogApi } from '@/api';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const stats = ref({
  totalUsers: 0,
  totalRoles: 0,
  onlineUsers: 0,
  totalNotices: 0,
});

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

<style scoped>
.dashboard {
  padding: 0;
}

.stat-card {
  display: flex;
  align-items: center;
  background: var(--surface);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  padding: 20px;
  border-radius: var(--glass-radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-right: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.stat-icon-primary {
  background: linear-gradient(135deg, var(--primary), #6366f1);
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.35);
}
.stat-icon-success {
  background: linear-gradient(135deg, var(--success), #34d399);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.35);
}
.stat-icon-warning {
  background: linear-gradient(135deg, var(--warning), #fbbf24);
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.35);
}
.stat-icon-danger {
  background: linear-gradient(135deg, var(--danger), #f87171);
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.35);
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: var(--text);
}

.stat-label {
  font-size: 14px;
  color: var(--muted);
  margin-top: 4px;
}

.server-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  gap: 12px;
}

.info-item .label {
  color: var(--muted);
  width: 80px;
}

.info-item .value {
  color: var(--text);
  font-weight: 500;
}
</style>
