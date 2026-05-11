<template>
  <div class="page-container">
    <div class="search-bar">
      <el-input v-model="queryParams.title" placeholder="Title" style="width: 200px" clearable @clear="loadData" />
      <el-select v-model="queryParams.type" placeholder="Type" style="width: 120px" clearable>
        <el-option label="Notice" :value="1" />
        <el-option label="Announcement" :value="2" />
      </el-select>
      <el-select v-model="queryParams.status" placeholder="Status" style="width: 120px" clearable>
        <el-option label="Normal" :value="1" />
        <el-option label="Closed" :value="0" />
      </el-select>
      <el-button type="primary" :icon="Search" @click="loadData">Search</el-button>
      <el-button :icon="Refresh" @click="resetQuery">Reset</el-button>
    </div>

    <div class="toolbar">
      <el-button type="primary" :icon="Plus" @click="handleCreate">Add Notice</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" row-key="id">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="Title" show-overflow-tooltip />
      <el-table-column prop="type" label="Type" width="120">
        <template #default="{ row }">
          <el-tag :type="row.type === 1 ? 'success' : 'warning'">{{ row.type === 1 ? 'Notice' : 'Announcement' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="Status" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? 'Normal' : 'Closed' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="publishTime" label="Publish Time" width="180" />
      <el-table-column prop="createTime" label="Created" width="180" />
      <el-table-column label="Actions" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" :icon="Edit" @click="handleEdit(row)">Edit</el-button>
          <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(row)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination v-model:current-page="queryParams.page" v-model:page-size="queryParams.limit" :total="total" layout="total, sizes, prev, pager, next" @size-change="loadData" @current-change="loadData" style="margin-top: 16px" />

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="Title" prop="title"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="Type">
          <el-radio-group v-model="form.type"><el-radio :label="1">Notice</el-radio><el-radio :label="2">Announcement</el-radio></el-radio-group>
        </el-form-item>
        <el-form-item label="Content" prop="content"><el-input v-model="form.content" type="textarea" :rows="6" /></el-form-item>
        <el-form-item label="Status">
          <el-radio-group v-model="form.status"><el-radio :label="1">Normal</el-radio><el-radio :label="0">Closed</el-radio></el-radio-group>
        </el-form-item>
        <el-form-item label="Publish Time">
          <el-date-picker v-model="form.publishTime" type="datetime" placeholder="Select datetime" style="width: 100%" />
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
import { noticeApi } from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete, Search, Refresh } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';

const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const queryParams = reactive({ title: '', type: undefined as number | undefined, status: undefined as number | undefined, page: 1, limit: 10 });
const dialogVisible = ref(false);
const dialogTitle = ref('Add Notice');
const formRef = ref<FormInstance>();
const form = reactive<any>({ id: undefined, title: '', content: '', type: 1, status: 1, publishTime: '' });
const rules = { title: [{ required: true }], content: [{ required: true }] };

const loadData = async () => {
  loading.value = true;
  try { const res: any = await noticeApi.list(queryParams); tableData.value = res.items; total.value = res.total; }
  catch { ElMessage.error('Failed to load'); }
  finally { loading.value = false; }
};

const resetQuery = () => { queryParams.title = ''; queryParams.type = undefined; queryParams.status = undefined; loadData(); };
const handleCreate = () => { Object.assign(form, { id: undefined, title: '', content: '', type: 1, status: 1, publishTime: '' }); dialogTitle.value = 'Add Notice'; dialogVisible.value = true; };
const handleEdit = (row: any) => { Object.assign(form, row); dialogTitle.value = 'Edit Notice'; dialogVisible.value = true; };

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      if (form.id) { await noticeApi.update(form); ElMessage.success('Updated'); }
      else { await noticeApi.create(form); ElMessage.success('Created'); }
      dialogVisible.value = false;
      loadData();
    } catch (e: any) { ElMessage.error(e.message); }
  });
};

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(`Delete "${row.title}"?`, 'Confirm', { type: 'warning' });
  await noticeApi.delete(row.id);
  ElMessage.success('Deleted');
  loadData();
};

onMounted(() => loadData());
</script>

<style scoped>
.page-container { background: #fff; padding: 20px; border-radius: 8px; }
.search-bar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.toolbar { margin-bottom: 16px; }
</style>