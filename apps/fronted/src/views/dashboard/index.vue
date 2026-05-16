<template>
  <div class="dashboard">
    <el-row :gutter="16">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #409eff">
            <el-icon :size="32"><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalUsers }}</div>
            <div class="stat-label">Total Users</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #67c23a">
            <el-icon :size="32"><Key /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalRoles }}</div>
            <div class="stat-label">Total Roles</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #e6a23c">
            <el-icon :size="32"><Connection /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.onlineUsers }}</div>
            <div class="stat-label">Online Users</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #f56c6c">
            <el-icon :size="32"><Bell /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalNotices }}</div>
            <div class="stat-label">Notices</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 20px">
      <el-col :span="12">
        <el-card header="Server Info">
          <div class="server-info" v-if="serverInfo">
            <div class="info-item">
              <span class="label">OS:</span>
              <span class="value">{{ serverInfo.os }}</span>
            </div>
            <div class="info-item">
              <span class="label">CPU:</span>
              <span class="value">{{ serverInfo.cpuUsage }}</span>
            </div>
            <div class="info-item">
              <span class="label">Memory:</span>
              <span class="value">{{ serverInfo.mem?.usage }}</span>
            </div>
            <div class="info-item">
              <span class="label">Uptime:</span>
              <span class="value">{{ serverInfo.uptime }}</span>
            </div>
          </div>
          <el-skeleton v-else :rows="4" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card header="Recent Login Logs">
          <el-table :data="recentLogs" style="width: 100%">
            <el-table-column prop="username" label="User" width="120" />
            <el-table-column prop="ip" label="IP" width="140" />
            <el-table-column prop="status" label="Status" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                  {{ row.status === 1 ? 'Success' : 'Failed' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="Time" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { userApi, roleApi, onlineApi, noticeApi, serverApi, loginLogApi } from '@/api';

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
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-right: 16px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #999;
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
  color: #666;
  width: 80px;
}

.info-item .value {
  color: #333;
  font-weight: 500;
}
</style>