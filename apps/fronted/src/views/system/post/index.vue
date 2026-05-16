<template>
  <div class="page-container">
    <div class="search-bar">
      <el-input v-model="queryParams.name" placeholder="Post Name" style="width: 200px" clearable @clear="loadData" />
      <el-select v-model="queryParams.status" placeholder="Status" style="width: 120px" clearable @clear="loadData">
        <el-option label="Enabled" :value="1" />
        <el-option label="Disabled" :value="0" />
      </el-select>
      <el-button type="primary" :icon="Search" @click="loadData">Search</el-button>
      <el-button :icon="Refresh" @click="resetQuery">Reset</el-button>
    </div>

    <div class="toolbar">
      <el-button type="primary" :icon="Plus" @click="handleCreate">Add Post</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" row-key="id">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="Post Name" />
      <el-table-column prop="code" label="Post Code" />
      <el-table-column prop="sort" label="Sort" width="100" />
      <el-table-column prop="status" label="Status" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? 'Enabled' : 'Disabled' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="Created" width="180" />
      <el-table-column label="Actions" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" :icon="Edit" @click="handleEdit(row)">Edit</el-button>
          <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(row)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination v-model:current-page="queryParams.page" v-model:page-size="queryParams.limit" :total="total" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next" @size-change="loadData" @current-change="loadData" style="margin-top: 16px" />

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="Post Name" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="Post Code" prop="code">
          <el-input v-model="form.code" />
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
        <el-form-item label="Remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
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
import { postApi } from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete, Search, Refresh } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';

const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const queryParams = reactive({ name: '', status: undefined as number | undefined, page: 1, limit: 10 });
const dialogVisible = ref(false);
const dialogTitle = ref('Add Post');
const formRef = ref<FormInstance>();
const form = reactive<any>({ id: undefined, name: '', code: '', sort: 0, status: 1, remark: '' });
const rules = {
  name: [{ required: true, message: 'Please enter post name', trigger: 'blur' }],
  code: [{ required: true, message: 'Please enter post code', trigger: 'blur' }],
};

const loadData = async () => {
  loading.value = true;
  try {
    const res: any = await postApi.list(queryParams);
    tableData.value = res.items;
    total.value = res.total;
  } catch (e) { ElMessage.error('Failed to load data'); }
  finally { loading.value = false; }
};

const resetQuery = () => { queryParams.name = ''; queryParams.status = undefined; loadData(); };

const handleCreate = () => {
  Object.assign(form, { id: undefined, name: '', code: '', sort: 0, status: 1, remark: '' });
  dialogTitle.value = 'Add Post';
  dialogVisible.value = true;
};

const handleEdit = (row: any) => {
  Object.assign(form, { id: row.id, name: row.name, code: row.code, sort: row.sort, status: row.status, remark: row.remark });
  dialogTitle.value = 'Edit Post';
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      if (form.id) { await postApi.update(form); ElMessage.success('Updated successfully'); }
      else { await postApi.create(form); ElMessage.success('Created successfully'); }
      dialogVisible.value = false;
      loadData();
    } catch (e: any) { ElMessage.error(e.message || 'Operation failed'); }
  });
};

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(`Delete post "${row.name}"?`, 'Confirm', { type: 'warning' });
  await postApi.delete(row.id);
  ElMessage.success('Deleted successfully');
  loadData();
};

onMounted(() => loadData());
</script>

<style scoped>
.page-container { background: #fff; padding: 20px; border-radius: 8px; }
.search-bar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.toolbar { margin-bottom: 16px; }
</style>