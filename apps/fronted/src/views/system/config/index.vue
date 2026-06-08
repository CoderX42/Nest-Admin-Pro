<template>
  <div class="page-container">
    <el-card class="filter-form">
      <el-form :inline="true" :model="queryParams">
        <el-form-item :label="t('system.config.configKey')">
          <el-input v-model="queryParams.configKey" :placeholder="t('system.config.configKey')" clearable @keyup.enter="loadData" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="loadData">{{ t('common.action.search') }}</el-button>
          <el-button :icon="Refresh" @click="handleRefresh">{{ t('common.action.refresh') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-wrap">
      <template #header>
        <div class="action-bar">
          <el-button type="primary" :icon="Plus" @click="handleCreate">{{ t('system.config.addConfig') }}</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="id" :label="t('common.field.id')" min-width="90" />
        <el-table-column prop="name" :label="t('system.config.configName')" min-width="160" />
        <el-table-column prop="configKey" :label="t('system.config.configKey')" min-width="180" />
        <el-table-column prop="configValue" :label="t('system.config.configValue')" min-width="220" show-overflow-tooltip />
        <el-table-column prop="valueType" :label="t('common.field.type')" width="120">
          <template #default="{ row }">
            <el-tag effect="plain">{{ row.valueType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('common.field.status')" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" effect="plain">
              {{ row.status === 1 ? t('common.status.enabled') : t('common.status.disabled') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('common.field.actions')" width="180" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" size="small" :icon="Edit" @click="handleEdit(row)">
              {{ t('common.action.edit') }}
            </el-button>
            <el-button text type="danger" size="small" :icon="Delete" @click="handleDelete(row)">
              {{ t('common.action.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="form.id ? t('system.config.editConfig') : t('system.config.addConfig')" width="620px">
      <el-form :model="form" label-width="110px">
        <el-form-item :label="t('system.config.configName')">
          <el-input v-model="form.configName" />
        </el-form-item>
        <el-form-item :label="t('system.config.configKey')">
          <el-input v-model="form.configKey" :disabled="!!form.id" />
        </el-form-item>
        <el-form-item :label="t('system.config.configValue')">
          <el-input v-model="form.configValue" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item :label="t('common.field.type')">
          <el-select v-model="form.configType">
            <el-option :label="t('system.config.typeString')" value="string" />
            <el-option :label="t('system.config.typeNumber')" value="number" />
            <el-option :label="t('system.config.typeBoolean')" value="boolean" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('common.field.status')">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">{{ t('common.status.enabled') }}</el-radio>
            <el-radio :value="0">{{ t('common.status.disabled') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('common.field.remark')">
          <el-input v-model="form.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('common.action.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit">{{ t('common.action.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { Delete, Edit, Plus, Refresh, Search } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { configApi } from '@/api/system/config';
import { ElMessage, ElMessageBox } from 'element-plus';

const { t } = useI18n();
const loading = ref(false);
const tableData = ref<any[]>([]);
const dialogVisible = ref(false);
const queryParams = reactive({ configKey: '' });
const form = reactive<any>({ id: undefined, configName: '', configKey: '', configValue: '', configType: 'string', status: 1, remark: '' });

const loadData = async () => {
  loading.value = true;
  try {
    const res: any = await configApi.list(queryParams);
    tableData.value = res.items || res;
  } catch {
    ElMessage.error(t('common.message.loadFailed'));
  } finally {
    loading.value = false;
  }
};

const handleCreate = () => {
  Object.assign(form, { id: undefined, configName: '', configKey: '', configValue: '', configType: 'string', status: 1, remark: '' });
  dialogVisible.value = true;
};
const handleEdit = (row: any) => {
  Object.assign(form, {
    id: row.id,
    configName: row.configName ?? row.name,
    configKey: row.configKey,
    configValue: row.configValue,
    configType: row.configType ?? row.valueType,
    status: row.status,
    remark: row.remark,
  });
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  try {
    if (form.id) {
      await configApi.update({ id: form.id, configName: form.configName, configValue: form.configValue, configType: form.configType, status: form.status, remark: form.remark });
      ElMessage.success(t('common.message.updateSuccess'));
    } else {
      await configApi.create({ configName: form.configName, configKey: form.configKey, configValue: form.configValue, configType: form.configType, status: form.status, remark: form.remark });
      ElMessage.success(t('common.message.addSuccess'));
    }
    dialogVisible.value = false;
    loadData();
  } catch (e: any) {
    ElMessage.error(e.message);
  }
};

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(t('common.message.confirmDelete', { name: row.name }), t('common.action.confirm'), { type: 'warning' });
  await configApi.delete(row.id);
  ElMessage.success(t('common.message.deleteSuccess'));
  loadData();
};

const handleRefresh = async () => {
  await configApi.refresh();
  ElMessage.success(t('common.message.success'));
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

.action-bar {
  display: flex;
  gap: 12px;
}
</style>
