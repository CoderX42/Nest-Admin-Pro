<template>
  <div class="page-container">
    <div class="search-bar">
      <el-input v-model="queryParams.key" :placeholder="t('system.config.configKey')" style="width: 200px" clearable @clear="loadData" />
      <el-button type="primary" :icon="Search" @click="loadData">{{ t('common.action.search') }}</el-button>
      <el-button type="success" :icon="Refresh" @click="handleRefresh">{{ t('common.action.refresh') }}</el-button>
    </div>

    <div class="toolbar">
      <el-button type="primary" :icon="Plus" @click="handleCreate">{{ t('system.config.addConfig') }}</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" row-key="id">
      <el-table-column prop="id" :label="t('common.field.id')" width="80" />
      <el-table-column prop="name" :label="t('system.config.configName')" />
      <el-table-column prop="key" :label="t('system.config.configKey')" />
      <el-table-column prop="value" :label="t('system.config.configValue')" show-overflow-tooltip />
      <el-table-column prop="type" :label="t('common.field.type')" width="100" />
      <el-table-column prop="status" :label="t('common.field.status')" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? t('common.status.enabled') : t('common.status.disabled') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('common.field.actions')" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" :icon="Edit" @click="handleEdit(row)">{{ t('common.action.edit') }}</el-button>
          <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(row)">{{ t('common.action.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="form.id ? t('system.config.editConfig') : t('system.config.addConfig')" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item :label="t('system.config.configName')" prop="name"><el-input v-model="form.name" /></el-form-item>
        <el-form-item :label="t('system.config.configKey')" prop="key"><el-input v-model="form.key" :disabled="!!form.id" /></el-form-item>
        <el-form-item :label="t('system.config.configValue')" prop="value"><el-input v-model="form.value" type="textarea" :rows="3" /></el-form-item>
        <el-form-item :label="t('common.field.type')">
          <el-select v-model="form.type" style="width: 100%">
            <el-option :label="t('system.config.typeString')" value="string" />
            <el-option :label="t('system.config.typeNumber')" value="number" />
            <el-option :label="t('system.config.typeBoolean')" value="boolean" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('common.field.status')">
          <el-radio-group v-model="form.status"><el-radio :label="1">{{ t('common.status.enabled') }}</el-radio><el-radio :label="0">{{ t('common.status.disabled') }}</el-radio></el-radio-group>
        </el-form-item>
        <el-form-item :label="t('common.field.remark')"><el-input v-model="form.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('common.action.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit">{{ t('common.action.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { configApi } from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete, Search, Refresh } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';

const { t } = useI18n();

const loading = ref(false);
const tableData = ref<any[]>([]);
const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const queryParams = reactive({ key: '' });
const form = reactive<any>({ id: undefined, name: '', key: '', value: '', type: 'string', status: 1, remark: '' });
const rules = { name: [{ required: true }], key: [{ required: true }], value: [{ required: true }] };

const loadData = async () => {
  loading.value = true;
  try { const res: any = await configApi.list(queryParams); tableData.value = res; }
  catch { ElMessage.error(t('common.message.loadFailed')); }
  finally { loading.value = false; }
};

const handleCreate = () => { Object.assign(form, { id: undefined, name: '', key: '', value: '', type: 'string', status: 1, remark: '' }); dialogVisible.value = true; };
const handleEdit = (row: any) => { Object.assign(form, row); dialogVisible.value = true; };

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      if (form.id) {
        await configApi.update({ id: form.id, name: form.name, value: form.value, type: form.type, status: form.status, remark: form.remark });
        ElMessage.success(t('common.message.updateSuccess'));
      }
      else {
        await configApi.create({ name: form.name, key: form.key, value: form.value, type: form.type, status: form.status, remark: form.remark });
        ElMessage.success(t('common.message.addSuccess'));
      }
      dialogVisible.value = false;
      loadData();
    } catch (e: any) { ElMessage.error(e.message); }
  });
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
.search-bar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.toolbar { margin-bottom: 16px; }
</style>