<template>
  <div class="page-container">
    <el-row :gutter="16">
      <el-col :span="12">
        <el-card header="Server Info">
          <div class="info-grid" v-if="info">
            <div class="info-item"><span class="label">OS:</span><span class="value">{{ info.os }}</span></div>
            <div class="info-item"><span class="label">Hostname:</span><span class="value">{{ info.hostname }}</span></div>
            <div class="info-item"><span class="label">CPU Cores:</span><span class="value">{{ info.cpuCount }}</span></div>
            <div class="info-item"><span class="label">Uptime:</span><span class="value">{{ info.uptime }}</span></div>
          </div>
          <el-skeleton v-else :rows="4" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card header="Memory Usage">
          <div class="info-grid" v-if="info?.mem">
            <div class="info-item"><span class="label">Total:</span><span class="value">{{ info.mem.total }}</span></div>
            <div class="info-item"><span class="label">Used:</span><span class="value">{{ info.mem.used }}</span></div>
            <div class="info-item"><span class="label">Free:</span><span class="value">{{ info.mem.free }}</span></div>
            <div class="info-item"><span class="label">Usage:</span>
              <el-progress :percentage="parseFloat(info.mem.usage)" :color="getMemColor(parseFloat(info.mem.usage))" style="width: 200px" />
            </div>
          </div>
          <el-skeleton v-else :rows="4" />
        </el-card>
      </el-col>
    </el-row>

    <el-card header="CPU Usage" style="margin-top: 16px">
      <div class="info-grid" v-if="info">
        <div class="info-item"><span class="label">CPU Usage:</span>
          <el-progress :percentage="parseFloat(info.cpuUsage)" :color="getCpuColor(parseFloat(info.cpuUsage))" style="width: 300px" />
        </div>
      </div>
      <el-skeleton v-else :rows="3" />
    </el-card>

    <el-button type="primary" :icon="Refresh" style="margin-top: 16px" @click="loadData">Refresh</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { serverApi } from '@/api';
import { ElMessage } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';

const info = ref<any>(null);

const loadData = async () => {
  try { info.value = await serverApi.info(); }
  catch { ElMessage.error('Failed to load server info'); }
};

const getCpuColor = (p: number) => p > 80 ? '#f56c6c' : p > 50 ? '#e6a23c' : '#67c23a';
const getMemColor = (p: number) => p > 80 ? '#f56c6c' : p > 50 ? '#e6a23c' : '#67c23a';

onMounted(() => loadData());
</script>

<style scoped>

.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.info-item { display: flex; align-items: center; gap: 8px; }
.label { color: #666; min-width: 100px; }
.value { color: #333; font-weight: 500; }
</style>