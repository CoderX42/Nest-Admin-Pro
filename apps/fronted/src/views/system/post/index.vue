<template>
  <div class="page-container">
    <div class="search-bar">
      <el-input v-model="queryParams.name" :placeholder="t('system.post.placeholderName')" style="width: 200px" clearable @clear="loadData" />
      <el-select v-model="queryParams.status" :placeholder="t('common.field.status')" style="width: 120px" clearable @clear="loadData"
      >
        <el-option :label="t('common.status.enabled')" :value="1" />
        <el-option :label="t('common.status.disabled')" :value="0" />
      </el-select>
      <el-button type="primary" :icon="Search" @click="loadData"
      >{{ t('common.action.search') }}</el-button
      >
      <el-button :icon="Refresh" @click="resetQuery"
      >{{ t('common.action.reset') }}</el-button
      >
    </div>

    <div class="toolbar">
      <el-button type="primary" :icon="Plus" @click="handleCreate"
      >{{ t('system.post.addPost') }}</el-button
      >
    </div>

    <el-table :data="tableData" v-loading="loading" row-key="id">
      <el-table-column prop="id" :label="t('common.field.id')" width="80" />
      <el-table-column prop="name" :label="t('system.post.postName')" />
      <el-table-column prop="code" :label="t('system.post.postCode')" />
      <el-table-column prop="sort" :label="t('common.field.sort')" width="100" />
      <el-table-column prop="status" :label="t('common.field.status')" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'"
          >{{ row.status === 1 ? t('common.status.enabled') : t('common.status.disabled') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" :label="t('common.field.createTime')" width="180" />
      <el-table-column :label="t('common.field.actions')" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" :icon="Edit" @click="handleEdit(row)"
          >{{ t('common.action.edit') }}</el-button
          >
          <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(row)"
          >{{ t('common.action.delete') }}</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-pagination v-model:current-page="queryParams.page" v-model:page-size="queryParams.limit" :total="total" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next" @size-change="loadData" @current-change="loadData" style="margin-top: 16px" />

    <el-dialog v-model="dialogVisible" :title="form.id ? t('system.post.editPost') : t('system.post.addPost')" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item :label="t('system.post.postName')" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item :label="t('system.post.postCode')" prop="code">
          <el-input v-model="form.code" :disabled="!!form.id" />
        </el-form-item>
        <el-form-item :label="t('common.field.sort')">
          <el-input-number v-model="form.sort" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item :label="t('common.field.status')">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">{{ t('common.status.enabled') }}</el-radio>
            <el-radio :label="0">{{ t('common.status.disabled') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('common.field.remark')">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
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
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { postApi } from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete, Search, Refresh } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';

const { t } = useI18n();

const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const queryParams = reactive({ name: '', status: undefined as number | undefined, page: 1, limit: 10 });
const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const form = reactive<any>({ id: undefined, name: '', code: '', sort: 0, status: 1, remark: '' });
const rules = {
  name: [{ required: true, message: t('system.post.placeholderName'), trigger: 'blur' }],
  code: [{ required: true, message: 'Please enter post code', trigger: 'blur' }],
};

const loadData = async () => {
  loading.value = true;
  try {
    const res: any = await postApi.list(queryParams);
    tableData.value = res.items;
    total.value = res.total;
  } catch (e) { ElMessage.error(t('common.message.loadFailed')); }
  finally { loading.value = false; }
};

const resetQuery = () => { queryParams.name = ''; queryParams.status = undefined; loadData(); };

const handleCreate = () => {
  Object.assign(form, { id: undefined, name: '', code: '', sort: 0, status: 1, remark: '' });
  dialogVisible.value = true;
};

const handleEdit = (row: any) => {
  Object.assign(form, { id: row.id, name: row.name, code: row.code, sort: row.sort, status: row.status, remark: row.remark });
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      if (form.id) {
        await postApi.update({ id: form.id, name: form.name, sort: form.sort, status: form.status, remark: form.remark });
        ElMessage.success(t('common.message.updateSuccess'));
      }
      else {
        await postApi.create({ name: form.name, code: form.code, sort: form.sort, status: form.status, remark: form.remark });
        ElMessage.success(t('common.message.addSuccess'));
      }
      dialogVisible.value = false;
      loadData();
    } catch (e: any) { ElMessage.error(e.message || t('common.message.failed')); }
  });
};

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(t('common.message.confirmDelete', { name: row.name }), t('common.action.confirm'), { type: 'warning' });
  await postApi.delete(row.id);
  ElMessage.success(t('common.message.deleteSuccess'));
  loadData();
};

onMounted(() => loadData());
</script>

<style scoped>
.search-bar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.toolbar { margin-bottom: 16px; }
</style>