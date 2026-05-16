<template>
  <div class="page-container">
    <div class="toolbar">
      <el-button type="danger" :icon="Delete" @click="handleClean">Clean Invalid Records</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" row-key="token">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="Username" />
      <el-table-column prop="nickname" label="Nickname" />
      <el-table-column prop="email" label="Email" />
      <el-table-column prop="phone" label="Phone" />
      <el-table-column label="Actions" width="120">
        <template #default="{ row }">
          <el-button size="small" type="danger" :icon="Delete" @click="handleForceLogout(row.token)">Force Logout</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onlineApi } from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete } from '@element-plus/icons-vue';

const loading = ref(false);
const tableData = ref<any[]>([]);

const loadData = async () => {
  loading.value = true;
  try { tableData.value = await onlineApi.list(); }
  catch { ElMessage.error('Failed to load'); }
  finally { loading.value = false; }
};

const handleForceLogout = async (token: string) => {
  await ElMessageBox.confirm('Force this user to logout?', 'Confirm', { type: 'warning' });
  await onlineApi.forceLogout(token);
  ElMessage.success('Forced logout');
  loadData();
};

const handleClean = () => loadData();

onMounted(() => loadData());
</script>

<style scoped>
.toolbar { margin-bottom: 16px; }
</style>