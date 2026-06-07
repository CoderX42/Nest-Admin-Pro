<template>
  <div class="page-container">
    <el-card class="summary-card">
      <div class="summary-card__content">
        <div>
          <div class="summary-card__title">{{ t('monitor.online.title') || '在线用户' }}</div>
          <div class="summary-card__desc">实时查看当前在线的用户会话</div>
        </div>
        <el-tag type="primary" effect="plain">{{ tableData.length }} 在线</el-tag>
      </div>
    </el-card>

    <el-card class="table-wrap">
      <el-table :data="tableData" v-loading="loading" border row-key="token">
        <el-table-column prop="id" :label="t('common.field.id')" min-width="90" />
        <el-table-column prop="username" :label="t('monitor.online.username')" min-width="140" />
        <el-table-column prop="nickname" :label="t('monitor.online.nickname')" min-width="140" />
        <el-table-column prop="email" :label="t('monitor.online.email')" min-width="180" />
        <el-table-column prop="phone" :label="t('monitor.online.phone')" min-width="140" />
        <el-table-column :label="t('common.field.actions')" width="160" fixed="right">
          <template #default="{ row }">
            <el-button text type="danger" size="small" :icon="Delete" @click="handleForceLogout(row.token)">
              {{ t('common.action.forceLogout') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Delete } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { onlineApi } from '@/api/monitor/online';
import { ElMessage, ElMessageBox } from 'element-plus';

const { t } = useI18n();
const loading = ref(false);
const tableData = ref<any[]>([]);

const loadData = async () => {
  loading.value = true;
  try {
    tableData.value = await onlineApi.list();
  } catch {
    ElMessage.error(t('common.message.loadFailed'));
  } finally {
    loading.value = false;
  }
};

const handleForceLogout = async (token: string) => {
  await ElMessageBox.confirm(t('common.message.confirmForceLogout'), t('common.action.confirm'), { type: 'warning' });
  await onlineApi.forceLogout(token);
  ElMessage.success(t('common.message.success'));
  loadData();
};

onMounted(() => loadData());
</script>

<style scoped>
.page-container {
  padding: 16px;
}

.summary-card,
.table-wrap {
  margin-bottom: 16px;
}

.summary-card__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.summary-card__title {
  margin-bottom: 4px;
  font-size: 16px;
  font-weight: 600;
}

.summary-card__desc {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>
