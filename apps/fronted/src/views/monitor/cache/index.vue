<template>
  <div class="page-container">
    <el-card class="filter-form">
      <el-form :inline="true">
        <el-form-item :label="t('monitor.cache.key')">
          <el-input v-model="keyPattern" :placeholder="t('monitor.cache.placeholderKey')" clearable @keyup.enter="loadKeys" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="loadKeys">{{ t('common.action.search') }}</el-button>
          <el-button :icon="Refresh" @click="loadInfo">{{ t('common.action.refresh') }}</el-button>
          <el-button type="danger" :icon="Delete" @click="handleClear">{{ t('common.action.clean') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="16">
      <el-col :xs="24" :lg="10">
        <el-card class="panel-card">
          <template #header>
            <span>{{ t('monitor.cache.cacheInfo') }}</span>
          </template>

          <el-descriptions v-if="info" :column="1" border>
            <el-descriptions-item
              v-for="(value, key) in info"
              :key="String(key)"
              :label="String(key)"
            >
              {{ value }}
            </el-descriptions-item>
          </el-descriptions>
          <el-skeleton v-else :rows="4" animated />
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="14">
        <el-card class="panel-card">
          <template #header>
            <span>{{ t('monitor.cache.cacheKeys') }} ({{ keys.length }})</span>
          </template>

          <el-table :data="keys.map((key) => ({ key }))" border>
            <el-table-column prop="key" :label="t('monitor.cache.key')" min-width="260" show-overflow-tooltip />
            <el-table-column :label="t('common.field.actions')" width="160" fixed="right">
              <template #default="{ row }">
                <el-button text type="primary" size="small" :icon="View" @click="handleViewValue(row.key)">
                  {{ t('common.action.view') }}
                </el-button>
                <el-button text type="danger" size="small" :icon="Delete" @click="handleDeleteKey(row.key)">
                  {{ t('common.action.delete') }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="valueDialogVisible" :title="t('monitor.cache.value')" width="720px">
      <el-input :model-value="cacheValue" type="textarea" :rows="12" readonly />
      <template #footer>
        <el-button @click="valueDialogVisible = false">{{ t('common.action.cancel') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Delete, Refresh, Search, View } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { cacheApi } from '@/api/monitor/cache';
import { ElMessage, ElMessageBox } from 'element-plus';

const { t } = useI18n();
const info = ref<any>(null);
const keys = ref<string[]>([]);
const keyPattern = ref('*');
const valueDialogVisible = ref(false);
const cacheValue = ref('');

const loadInfo = async () => {
  try {
    info.value = await cacheApi.info();
  } catch {
    ElMessage.error(t('common.message.loadFailed'));
  }
};
const loadKeys = async () => {
  try {
    keys.value = await cacheApi.keys(keyPattern.value);
  } catch {
    ElMessage.error(t('common.message.loadFailed'));
  }
};

const handleViewValue = async (key: string) => {
  try {
    const res: any = await cacheApi.value(key);
    cacheValue.value = typeof res === 'object' ? JSON.stringify(res, null, 2) : String(res);
    valueDialogVisible.value = true;
  } catch {
    ElMessage.error(t('common.message.loadFailed'));
  }
};

const handleDeleteKey = async (key: string) => {
  await ElMessageBox.confirm(t('common.message.confirmDelete', { name: key }), t('common.action.confirm'), { type: 'warning' });
  await cacheApi.delete(key);
  ElMessage.success(t('common.message.deleteSuccess'));
  loadKeys();
};

const handleClear = async () => {
  await ElMessageBox.confirm(t('common.message.confirmClean'), t('common.action.confirm'), { type: 'warning' });
  await cacheApi.clear();
  ElMessage.success(t('common.message.cleanSuccess'));
  loadKeys();
};

onMounted(() => {
  loadInfo();
  loadKeys();
});
</script>

<style scoped>
.page-container {
  padding: 16px;
}

.filter-form,
.panel-card {
  margin-bottom: 16px;
}
</style>
