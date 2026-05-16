<template>
  <div class="page-container">
    <div class="search-bar">
      <el-input v-model="keyPattern" placeholder="Key pattern (e.g. config:*)" style="width: 300px" clearable />
      <el-button type="primary" :icon="Search" @click="loadKeys">Search Keys</el-button>
      <el-button type="success" :icon="Refresh" @click="loadInfo">Refresh Info</el-button>
      <el-button type="danger" :icon="Delete" @click="handleClear">Clear All Cache</el-button>
    </div>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card header="Redis Info">
          <div class="info-grid" v-if="info">
            <div class="info-item" v-for="(v, k) in info" :key="k">
              <span class="label">{{ k }}:</span>
              <span class="value">{{ v }}</span>
            </div>
          </div>
          <el-skeleton v-else :rows="5" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card header="Cache Keys">
          <template #header>
            <span>Keys ({{ keys.length }})</span>
          </template>
          <el-table :data="keyRows" size="small" max-height="400" style="width: 100%">
            <el-table-column prop="key" label="Key" show-overflow-tooltip />
            <el-table-column label="Actions" width="160">
              <template #default="{ row }">
                <el-button size="small" text type="primary" @click="handleViewValue(row)">View</el-button>
                <el-button size="small" text type="danger" @click="handleDeleteKey(row)">Delete</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="valueDialogVisible" title="Cache Value" width="600px">
      <el-input v-model="cacheValue" type="textarea" :rows="10" readonly />
      <template #footer>
        <el-button @click="valueDialogVisible = false">Close</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { cacheApi } from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Refresh, Delete } from '@element-plus/icons-vue';

const info = ref<any>(null);
const keys = ref<string[]>([]);
const keyPattern = ref('*');
const valueDialogVisible = ref(false);
const cacheValue = ref('');
const keyRows = computed(() => keys.value.map((key) => ({ key })));

const loadInfo = async () => {
  try { info.value = await cacheApi.info(); }
  catch { ElMessage.error('Failed to load cache info'); }
};

const loadKeys = async () => {
  try { keys.value = await cacheApi.keys(keyPattern.value); }
  catch { ElMessage.error('Failed to load keys'); }
};

const handleViewValue = async (row: { key: string }) => {
  const res: any = await cacheApi.value(row.key);
  cacheValue.value = typeof res === 'object' ? JSON.stringify(res, null, 2) : String(res);
  valueDialogVisible.value = true;
};

const handleDeleteKey = async (row: { key: string }) => {
  await ElMessageBox.confirm(`Delete key "${row.key}"?`, 'Confirm', { type: 'warning' });
  await cacheApi.delete(row.key);
  ElMessage.success('Deleted');
  loadKeys();
};

const handleClear = async () => {
  await ElMessageBox.confirm('Clear all cache? This will affect system performance.', 'Confirm', { type: 'warning' });
  await cacheApi.clear();
  ElMessage.success('Cache cleared');
  loadKeys();
};

onMounted(() => { loadInfo(); loadKeys(); });
</script>

<style scoped>
.search-bar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.info-item { font-size: 13px; }
.label { color: #666; }
.value { color: #333; word-break: break-all; }
</style>
