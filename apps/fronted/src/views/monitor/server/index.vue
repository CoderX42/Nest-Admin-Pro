<template>
  <div class="page-container">
    <el-row :gutter="16">
      <el-col :xs="24" :lg="12">
        <el-card class="panel-card" v-loading="!info">
          <template #header>
            <span>{{ t('monitor.server.serverInfo') }}</span>
          </template>

          <el-descriptions v-if="info" :column="1" border>
            <el-descriptions-item :label="t('monitor.server.os')">{{ info.os }}</el-descriptions-item>
            <el-descriptions-item :label="t('monitor.server.hostname')">{{ info.hostname }}</el-descriptions-item>
            <el-descriptions-item :label="t('monitor.server.cpuCores')">{{ info.cpuCount }}</el-descriptions-item>
            <el-descriptions-item :label="t('monitor.server.uptime')">{{ info.uptime }}</el-descriptions-item>
          </el-descriptions>
          <el-skeleton v-else :rows="4" animated />
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card class="panel-card" v-loading="!info?.mem">
          <template #header>
            <span>{{ t('monitor.server.memoryUsage') }}</span>
          </template>

          <el-descriptions v-if="info?.mem" :column="1" border>
            <el-descriptions-item :label="t('monitor.server.total')">{{ info.mem.total }}</el-descriptions-item>
            <el-descriptions-item :label="t('monitor.server.used')">{{ info.mem.used }}</el-descriptions-item>
            <el-descriptions-item :label="t('monitor.server.free')">{{ info.mem.free }}</el-descriptions-item>
            <el-descriptions-item :label="t('monitor.server.usage')">
              <div class="usage-cell">
                <el-progress :percentage="parseFloat(info.mem.usage)" :status="getMemStatus(parseFloat(info.mem.usage))" />
                <span>{{ info.mem.usage }}</span>
              </div>
            </el-descriptions-item>
          </el-descriptions>
          <el-skeleton v-else :rows="4" animated />
        </el-card>
      </el-col>
    </el-row>

    <el-card class="panel-card" v-loading="!info">
      <template #header>
        <div class="server-header">
          <span>{{ t('monitor.server.cpuUsage') }}</span>
          <el-button :icon="Refresh" @click="loadData">{{ t('common.action.refresh') }}</el-button>
        </div>
      </template>

      <div v-if="info" class="cpu-panel">
        <el-progress :percentage="parseFloat(info.cpuUsage)" :stroke-width="18" />
        <div class="cpu-value">{{ info.cpuUsage }}</div>
      </div>
      <el-skeleton v-else :rows="1" animated />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Refresh } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { serverApi } from '@/api/monitor/server';
import { ElMessage } from 'element-plus';

const { t } = useI18n();
const info = ref<any>(null);

const getMemStatus = (percentage: number) => (percentage > 80 ? 'exception' : percentage > 50 ? 'warning' : 'success');

const loadData = async () => {
  try {
    info.value = await serverApi.info();
  } catch {
    ElMessage.error(t('common.message.loadFailed'));
  }
};

onMounted(() => loadData());
</script>

<style scoped>
.page-container {
  padding: 16px;
}

.panel-card {
  margin-bottom: 16px;
}

.usage-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.server-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cpu-panel {
  display: flex;
  align-items: center;
  gap: 16px;
}

.cpu-value {
  min-width: 80px;
  font-size: 22px;
  font-weight: 600;
  text-align: right;
}
</style>
