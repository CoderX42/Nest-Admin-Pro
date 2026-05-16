<template>
  <div class="page-container">
    <div class="search-bar">
      <el-input v-model="queryParams.name" placeholder="Department Name" style="width: 220px" clearable @clear="loadData" />
      <el-select v-model="queryParams.status" placeholder="Status" style="width: 140px" clearable @clear="loadData">
        <el-option label="Enabled" :value="1" />
        <el-option label="Disabled" :value="0" />
      </el-select>
      <el-button type="primary" :icon="Search" @click="loadData">Search</el-button>
      <el-button :icon="Refresh" @click="resetQuery">Reset</el-button>
    </div>

    <div class="toolbar">
      <el-button type="primary" :icon="Plus" @click="handleCreate">Add Department</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" row-key="id" default-expand-all>
      <el-table-column prop="name" label="Department Name" />
      <el-table-column prop="sort" label="Sort" width="100" />
      <el-table-column prop="status" label="Status" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? 'Enabled' : 'Disabled' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" :icon="Edit" @click="handleEdit(row)">Edit</el-button>
          <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(row)" :disabled="row.children?.length > 0">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="Parent">
          <el-tree-select
            v-model="form.parentId"
            :data="deptTree"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            check-strictly
            clearable
            placeholder="Root department"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="Sort">
          <el-input-number v-model="form.sort" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="Status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">Enabled</el-radio>
            <el-radio :label="0">Disabled</el-radio>
          </el-radio-group>
        </el-form-item>
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
import { deptApi } from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete, Search, Refresh } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';

const loading = ref(false);
const tableData = ref<any[]>([]);
const deptTree = ref<any[]>([]);
const dialogVisible = ref(false);
const dialogTitle = ref('Add Department');
const formRef = ref<FormInstance>();
const queryParams = reactive({ name: '', status: undefined as number | undefined });

const form = reactive<any>({ id: undefined, parentId: 0, name: '', sort: 0, status: 1 });
const rules = { name: [{ required: true, message: 'Please enter department name', trigger: 'blur' }] };

const loadData = async () => {
  loading.value = true;
  try {
    const res: any = await deptApi.list(queryParams);
    tableData.value = res;
    deptTree.value = [{ id: 0, name: 'Root', children: res }];
  } catch (e) {
    ElMessage.error('Failed to load data');
  } finally {
    loading.value = false;
  }
};

const resetQuery = () => {
  queryParams.name = '';
  queryParams.status = undefined;
  loadData();
};

const handleCreate = () => {
  Object.assign(form, { id: undefined, parentId: 0, name: '', sort: 0, status: 1 });
  dialogTitle.value = 'Add Department';
  dialogVisible.value = true;
};

const handleEdit = (row: any) => {
  Object.assign(form, { id: row.id, parentId: row.parentId, name: row.name, sort: row.sort, status: row.status });
  dialogTitle.value = 'Edit Department';
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      if (form.id) { await deptApi.update(form); ElMessage.success('Updated successfully'); }
      else { await deptApi.create(form); ElMessage.success('Created successfully'); }
      dialogVisible.value = false;
      loadData();
    } catch (e: any) { ElMessage.error(e.message || 'Operation failed'); }
  });
};

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(`Delete department "${row.name}"?`, 'Confirm', { type: 'warning' });
  await deptApi.delete(row.id);
  ElMessage.success('Deleted successfully');
  loadData();
};

onMounted(() => loadData());
</script>

<style scoped>
.search-bar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.toolbar { margin-bottom: 16px; }
</style>
