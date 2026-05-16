<template>
  <div class="page-container">
    <div class="search-bar">
      <el-input v-model="queryParams.username" placeholder="Username" style="width: 200px" clearable @clear="loadData" />
      <el-input v-model="queryParams.module" placeholder="Module" style="width: 200px" clearable @clear="loadData" />
      <el-button type="primary" :icon="Search" @click="loadData">Search</el-button>
      <el-button :icon="Refresh" @click="resetQuery">Reset</el-button>
      <el-button type="danger" :icon="Delete" @click="handleClean">Clean All</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" row-key="id">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="Username" width="120" />
      <el-table-column prop="module" label="Module" width="150" />
      <el-table-column prop="method" label="Method" width="100" />
      <el-table-column prop="reqUrl" label="URL" show-overflow-tooltip />
      <el-table-column prop="status" label="Status" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? 'Success' : 'Failed' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="duration" label="Duration (ms)" width="120" />
      <el-table-column prop="ip" label="IP" width="140" />
      <el-table-column prop="createTime" label="Time" width="180" />
    </el-table>

    <el-pagination v-model:current-page="queryParams.page" v-model:page-size="queryParams.limit" :total="total" layout="total, sizes, prev, pager, next" @size-change="loadData" @current-change="loadData" style="margin-top: 16px" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { operLogApi } from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Refresh, Delete } from '@element-plus/icons-vue';

const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const queryParams = reactive({ username: '', module: '', page: 1, limit: 10 });

const loadData = async () => {
  loading.value = true;
  try { const res: any = await operLogApi.list(queryParams); tableData.value = res.items; total.value = res.total; }
  catch { ElMessage.error('Failed to load'); }
  finally { loading.value = false; }
};

const resetQuery = () => { queryParams.username = ''; queryParams.module = ''; loadData(); };

const handleClean = async () => {
  await ElMessageBox.confirm('Clean all operation logs?', 'Confirm', { type: 'warning' });
  await operLogApi.clean();
  ElMessage.success('Cleaned');
  loadData();
};

onMounted(() => loadData());
</script>

<style scoped>
.page-container { background: #fff; padding: 20px; border-radius: 8px; }
.search-bar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
</style>