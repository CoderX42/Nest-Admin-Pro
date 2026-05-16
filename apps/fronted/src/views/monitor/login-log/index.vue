<template>
  <div class="page-container">
    <div class="search-bar">
      <el-input v-model="queryParams.username" placeholder="Username" style="width: 200px" clearable @clear="loadData" />
      <el-select v-model="queryParams.status" placeholder="Status" style="width: 120px" clearable>
        <el-option label="Success" :value="1" />
        <el-option label="Failed" :value="0" />
      </el-select>
      <el-button type="primary" :icon="Search" @click="loadData">Search</el-button>
      <el-button :icon="Refresh" @click="resetQuery">Reset</el-button>
      <el-button type="danger" :icon="Delete" @click="handleClean">Clean All</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" row-key="id">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="Username" width="120" />
      <el-table-column prop="ip" label="IP" width="140" />
      <el-table-column prop="location" label="Location" width="150" />
      <el-table-column prop="os" label="OS" width="120" />
      <el-table-column prop="browser" label="Browser" width="150" />
      <el-table-column prop="status" label="Status" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? 'Success' : 'Failed' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="msg" label="Message" show-overflow-tooltip />
      <el-table-column prop="createTime" label="Time" width="180" />
    </el-table>

    <el-pagination v-model:current-page="queryParams.page" v-model:page-size="queryParams.limit" :total="total" layout="total, sizes, prev, pager, next" @size-change="loadData" @current-change="loadData" style="margin-top: 16px" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { loginLogApi } from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Refresh, Delete } from '@element-plus/icons-vue';

const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const queryParams = reactive({ username: '', status: undefined as number | undefined, page: 1, limit: 10 });

const loadData = async () => {
  loading.value = true;
  try { const res: any = await loginLogApi.list(queryParams); tableData.value = res.items; total.value = res.total; }
  catch { ElMessage.error('Failed to load'); }
  finally { loading.value = false; }
};

const resetQuery = () => { queryParams.username = ''; queryParams.status = undefined; loadData(); };

const handleClean = async () => {
  await ElMessageBox.confirm('Clean all login logs?', 'Confirm', { type: 'warning' });
  await loginLogApi.clean();
  ElMessage.success('Cleaned');
  loadData();
};

onMounted(() => loadData());
</script>

<style scoped>
.page-container { background: #fff; padding: 20px; border-radius: 8px; }
.search-bar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
</style>