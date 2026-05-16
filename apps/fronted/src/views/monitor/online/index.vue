<template>
  <div class="page-container">
    <div class="toolbar">
      <el-button type="danger" :icon="Delete" @click="handleClean"
      >{{ t('common.action.clean') }}</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" row-key="token">
      <el-table-column prop="id" :label="t('common.field.id')" width="80" />
      <el-table-column prop="username" :label="t('monitor.online.username')" />
      <el-table-column prop="nickname" :label="t('monitor.online.nickname')" />
      <el-table-column prop="email" :label="t('monitor.online.email')" />
      <el-table-column prop="phone" :label="t('monitor.online.phone')" />
      <el-table-column :label="t('common.field.actions')" width="120">
        <template #default="{ row }">
          <el-button size="small" type="danger" :icon="Delete" @click="handleForceLogout(row.token)"
          >{{ t('common.action.forceLogout') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { onlineApi } from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete } from '@element-plus/icons-vue';

const { t } = useI18n();

const loading = ref(false);
const tableData = ref<any[]>([]);

const loadData = async () => {
  loading.value = true;
  try { tableData.value = await onlineApi.list(); }
  catch { ElMessage.error(t('common.message.loadFailed')); }
  finally { loading.value = false; }
};

const handleForceLogout = async (token: string) => {
  await ElMessageBox.confirm(t('common.message.confirmForceLogout'), t('common.action.confirm'), { type: 'warning' });
  await onlineApi.forceLogout(token);
  ElMessage.success(t('common.message.success'));
  loadData();
};

const handleClean = () => loadData();

onMounted(() => loadData());
</script>

<style scoped>
.toolbar { margin-bottom: 16px; }
</style>