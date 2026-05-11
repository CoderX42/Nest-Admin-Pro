<template>
  <div class="page-container">
    <div class="search-bar">
      <el-input v-model="queryParams.key" placeholder="Config Key" style="width: 200px" clearable @clear="loadData" />
      <el-button type="primary" :icon="Search" @click="loadData">Search</el-button>
      <el-button type="success" :icon="Refresh" @click="handleRefresh">Refresh Cache</el-button>
    </div>

    <div class="toolbar">
      <el-button type="primary" :icon="Plus" @click="handleCreate">Add Config</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" row-key="id">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="Name" />
      <el-table-column prop="key" label="Key" />
      <el-table-column prop="value" label="Value" show-overflow-tooltip />
      <el-table-column prop="type" label="Type" width="100" />
      <el-table-column prop="status" label="Status" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? 'Enabled' : 'Disabled' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" :icon="Edit" @click="handleEdit(row)">Edit</el-button>
          <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(row)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="Name" prop="name"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="Key" prop="key"><el-input v-model="form.key" :disabled="!!form.id" /></el-form-item>
        <el-form-item label="Value" prop="value"><el-input v-model="form.value" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="Type">
          <el-select v-model="form.type" style="width: 100%">
            <el-option label="String" value="string" />
            <el-option label="Number" value="number" />
            <el-option label="Boolean" value="boolean" />
          </el-select>
        </el-form-item>
        <el-form-item label="Status">
          <el-radio-group v-model="form.status"><el-radio :label="1">Enabled</el-radio><el-radio :label="0">Disabled</el-radio></el-radio-group>
        </el-form-item>
        <el-form-item label="Remark"><el-input v-model="form.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleSubmit">Confirm</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { configApi } from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete, Search, Refresh } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';

const loading = ref(false);
const tableData = ref<any[]>([]);
const dialogVisible = ref(false);
const dialogTitle = ref('Add Config');
const formRef = ref<FormInstance>();
const queryParams = reactive({ key: '' });
const form = reactive<any>({ id: undefined, name: '', key: '', value: '', type: 'string', status: 1, remark: '' });
const rules = { name: [{ required: true }], key: [{ required: true }], value: [{ required: true }] };

const loadData = async () => {
  loading.value = true;
  try { const res: any = await configApi.list(queryParams); tableData.value = res; }
  catch { ElMessage.error('Failed to load'); }
  finally { loading.value = false; }
};

const handleCreate = () => { Object.assign(form, { id: undefined, name: '', key: '', value: '', type: 'string', status: 1, remark: '' }); dialogTitle.value = 'Add Config'; dialogVisible.value = true; };
const handleEdit = (row: any) => { Object.assign(form, row); dialogTitle.value = 'Edit Config'; dialogVisible.value = true; };

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      if (form.id) { await configApi.update(form); ElMessage.success('Updated'); }
      else { await configApi.create(form); ElMessage.success('Created'); }
      dialogVisible.value = false;
      loadData();
    } catch (e: any) { ElMessage.error(e.message); }
  });
};

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(`Delete "${row.name}"?`, 'Confirm', { type: 'warning' });
  await configApi.delete(row.id);
  ElMessage.success('Deleted');
  loadData();
};

const handleRefresh = async () => {
  await configApi.refresh();
  ElMessage.success('Cache refreshed');
};

onMounted(() => loadData());
</script>

<style scoped>
.page-container { background: #fff; padding: 20px; border-radius: 8px; }
.search-bar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.toolbar { margin-bottom: 16px; }
</style>