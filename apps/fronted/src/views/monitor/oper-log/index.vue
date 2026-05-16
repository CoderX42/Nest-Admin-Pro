<template>
  <div class="page-container">
    <div class="search-bar">
      <el-input v-model="queryParams.username" :placeholder="t('monitor.operLog.placeholderUsername')" style="width: 200px" clearable @clear="loadData" />
      <el-input v-model="queryParams.module" :placeholder="t('monitor.operLog.module')" style="width: 200px" clearable @clear="loadData" />
      <el-button type="primary" :icon="Search" @click="loadData"
      >{{ t('common.action.search') }}</el-button>
      <el-button :icon="Refresh" @click="resetQuery"
      >{{ t('common.action.reset') }}</el-button>
      <el-button type="danger" :icon="Delete" @click="handleClean"
      >{{ t('common.action.clean') }}</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" row-key="id">
      <el-table-column prop="id" :label="t('common.field.id')" width="80" />
      <el-table-column prop="username" :label="t('monitor.operLog.username')" width="120" />
      <el-table-column prop="module" :label="t('monitor.operLog.module')" width="150" />
      <el-table-column prop="method" :label="t('monitor.operLog.method')" width="100" />
      <el-table-column prop="reqUrl" :label="t('monitor.operLog.url')" show-overflow-tooltip />
      <el-table-column prop="status" :label="t('monitor.operLog.status')" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'"
          >{{ row.status === 1 ? t('common.status.success') : t('common.status.failed') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="duration" label="Duration (ms)" width="120" />
      <el-table-column prop="ip" :label="t('monitor.operLog.ip')" width="140" />
      <el-table-column prop="createTime" :label="t('monitor.operLog.time')" width="180" />
    </el-table>

    <el-pagination v-model:current-page="queryParams.page" v-model:page-size="queryParams.limit" :total="total" layout="total, sizes, prev, pager, next" @size-change="loadData" @current-change="loadData" style="margin-top: 16px" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { operLogApi } from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Refresh, Delete } from '@element-plus/icons-vue';

const { t } = useI18n();

const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const queryParams = reactive({ username: '', module: '', page: 1, limit: 10 });

const loadData = async () => {
  loading.value = true;
  try { const res: any = await operLogApi.list(queryParams); tableData.value = res.items; total.value = res.total; }
  catch { ElMessage.error(t('common.message.loadFailed')); }
  finally { loading.value = false; }
};

const resetQuery = () => { queryParams.username = ''; queryParams.module = ''; loadData(); };

const handleClean = async () => {
  await ElMessageBox.confirm(t('common.message.confirmClean'), t('common.action.confirm'), { type: 'warning' });
  await operLogApi.clean();
  ElMessage.success(t('common.message.cleanSuccess'));
  loadData();
};

onMounted(() => loadData());
</script>

<style scoped>
.search-bar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
</style>