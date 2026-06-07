<template>
  <div class="page-container">
    <el-card class="filter-form">
      <el-form :inline="true" :model="queryParams">
        <el-form-item :label="t('monitor.operLog.username')">
          <el-input v-model="queryParams.username" :placeholder="t('monitor.operLog.placeholderUsername')" clearable @keyup.enter="loadData" />
        </el-form-item>
        <el-form-item :label="t('monitor.operLog.module')">
          <el-input v-model="queryParams.module" :placeholder="t('monitor.operLog.module')" clearable @keyup.enter="loadData" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="loadData">{{ t('common.action.search') }}</el-button>
          <el-button :icon="Refresh" @click="resetQuery">{{ t('common.action.reset') }}</el-button>
          <el-button type="danger" :icon="Delete" @click="handleClean">{{ t('common.action.clean') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-wrap">
      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="id" :label="t('common.field.id')" min-width="90" />
        <el-table-column prop="username" :label="t('monitor.operLog.username')" min-width="120" />
        <el-table-column prop="module" :label="t('monitor.operLog.module')" min-width="150" />
        <el-table-column prop="method" :label="t('monitor.operLog.method')" width="110" />
        <el-table-column :label="t('monitor.operLog.url')" min-width="240" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.reqUrl || row.url }}
          </template>
        </el-table-column>
        <el-table-column :label="t('monitor.operLog.status')" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" effect="plain">
              {{ row.status === 1 ? t('common.status.success') : t('common.status.failed') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Duration" width="110">
          <template #default="{ row }">{{ row.duration }}ms</template>
        </el-table-column>
        <el-table-column prop="ip" :label="t('monitor.operLog.ip')" min-width="140" />
        <el-table-column prop="createTime" :label="t('monitor.operLog.time')" min-width="180" />
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.limit"
          :total="total"
          :page-sizes="[10, 20]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { Delete, Refresh, Search } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { operLogApi } from '@/api/monitor/oper-log';
import { ElMessage, ElMessageBox } from 'element-plus';

const { t } = useI18n();
const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const queryParams = reactive({ username: '', module: '', page: 1, limit: 10 });

const loadData = async () => {
  loading.value = true;
  try {
    const res: any = await operLogApi.list(queryParams);
    tableData.value = res.items || [];
    total.value = res.total || 0;
  } catch {
    ElMessage.error(t('common.message.loadFailed'));
  } finally {
    loading.value = false;
  }
};

const resetQuery = () => {
  queryParams.username = '';
  queryParams.module = '';
  queryParams.page = 1;
  loadData();
};

const handleClean = async () => {
  await ElMessageBox.confirm(t('common.message.confirmClean'), t('common.action.confirm'), { type: 'warning' });
  await operLogApi.clean();
  ElMessage.success(t('common.message.cleanSuccess'));
  loadData();
};

onMounted(() => loadData());
</script>

<style scoped>
.page-container {
  padding: 16px;
}

.filter-form,
.table-wrap {
  margin-bottom: 16px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
