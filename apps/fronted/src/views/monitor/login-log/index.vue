<template>
  <div class="page-container">
    <el-card class="filter-form">
      <el-form :inline="true" :model="queryParams">
        <el-form-item :label="t('monitor.loginLog.username')">
          <el-input v-model="queryParams.username" :placeholder="t('monitor.loginLog.placeholderUsername')" clearable @keyup.enter="loadData" />
        </el-form-item>
        <el-form-item :label="t('monitor.loginLog.status')">
          <el-select v-model="queryParams.status" clearable class="filter-select">
            <el-option :label="t('common.status.success')" :value="1" />
            <el-option :label="t('common.status.failed')" :value="0" />
          </el-select>
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
        <el-table-column prop="username" :label="t('monitor.loginLog.username')" min-width="120" />
        <el-table-column prop="ip" :label="t('monitor.loginLog.ip')" min-width="140" />
        <el-table-column prop="location" :label="t('monitor.loginLog.location')" min-width="160" />
        <el-table-column prop="os" :label="t('monitor.loginLog.os')" min-width="120" />
        <el-table-column prop="browser" :label="t('monitor.loginLog.browser')" min-width="160" />
        <el-table-column :label="t('monitor.loginLog.status')" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" effect="plain">
              {{ row.status === 1 ? t('common.status.success') : t('common.status.failed') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="msg" :label="t('monitor.loginLog.message')" min-width="220" show-overflow-tooltip />
        <el-table-column prop="createTime" :label="t('monitor.loginLog.time')" min-width="180" />
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
import { loginLogApi } from '@/api/monitor/login-log';
import { ElMessage, ElMessageBox } from 'element-plus';

const { t } = useI18n();
const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const queryParams = reactive({ username: '', status: undefined as number | undefined, page: 1, limit: 10 });

const loadData = async () => {
  loading.value = true;
  try {
    const res: any = await loginLogApi.list(queryParams);
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
  queryParams.status = undefined;
  queryParams.page = 1;
  loadData();
};

const handleClean = async () => {
  await ElMessageBox.confirm(t('common.message.confirmClean'), t('common.action.confirm'), { type: 'warning' });
  await loginLogApi.clean();
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

.filter-select {
  width: 140px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
