<template>
  <div class="page-container">
    <div class="search-bar">
      <el-input v-model="queryParams.title" :placeholder="t('system.notice.placeholderTitle')" style="width: 200px" clearable @clear="loadData" />
      <el-select v-model="queryParams.type" :placeholder="t('common.field.type')" style="width: 120px" clearable>
        <el-option :label="t('system.notice.typeNotice')" :value="1" />
        <el-option :label="t('system.notice.typeAnnouncement')" :value="2" />
      </el-select>
      <el-select v-model="queryParams.status" :placeholder="t('common.field.status')" style="width: 120px" clearable>
        <el-option :label="t('common.status.normal')" :value="1" />
        <el-option :label="t('common.status.closed')" :value="0" />
      </el-select>
      <el-button type="primary" :icon="Search" @click="loadData">{{ t('common.action.search') }}</el-button>
      <el-button :icon="Refresh" @click="resetQuery">{{ t('common.action.reset') }}</el-button>
    </div>

    <div class="toolbar">
      <el-button type="primary" :icon="Plus" @click="handleCreate">{{ t('system.notice.addNotice') }}</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" row-key="id">
      <el-table-column prop="id" :label="t('common.field.id')" width="80" />
      <el-table-column prop="title" :label="t('system.notice.title')" show-overflow-tooltip />
      <el-table-column prop="type" :label="t('system.notice.type')" width="120">
        <template #default="{ row }">
          <el-tag :type="row.type === 1 ? 'success' : 'warning'">{{ row.type === 1 ? t('system.notice.typeNotice') : t('system.notice.typeAnnouncement') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="t('common.field.status')" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? t('common.status.normal') : t('common.status.closed') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="publishTime" :label="t('system.notice.publishTime')" width="180" />
      <el-table-column prop="createTime" :label="t('common.field.createTime')" width="180" />
      <el-table-column :label="t('common.field.actions')" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" :icon="Edit" @click="handleEdit(row)">{{ t('common.action.edit') }}</el-button>
          <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(row)">{{ t('common.action.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination v-model:current-page="queryParams.page" v-model:page-size="queryParams.limit" :total="total" layout="total, sizes, prev, pager, next" @size-change="loadData" @current-change="loadData" style="margin-top: 16px" />

    <el-dialog v-model="dialogVisible" :title="form.id ? t('system.notice.editNotice') : t('system.notice.addNotice')" width="700px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item :label="t('system.notice.title')" prop="title"><el-input v-model="form.title" /></el-form-item>
        <el-form-item :label="t('system.notice.type')">
          <el-radio-group v-model="form.type"><el-radio :label="1">{{ t('system.notice.typeNotice') }}</el-radio><el-radio :label="2">{{ t('system.notice.typeAnnouncement') }}</el-radio></el-radio-group>
        </el-form-item>
        <el-form-item :label="t('system.notice.content')" prop="content"><el-input v-model="form.content" type="textarea" :rows="6" /></el-form-item>
        <el-form-item :label="t('common.field.status')">
          <el-radio-group v-model="form.status"><el-radio :label="1">{{ t('common.status.normal') }}</el-radio><el-radio :label="0">{{ t('common.status.closed') }}</el-radio></el-radio-group>
        </el-form-item>
        <el-form-item :label="t('system.notice.publishTime')">
          <el-date-picker v-model="form.publishTime" type="datetime" placeholder="Select datetime" style="width: 100%" />
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
import { noticeApi } from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete, Search, Refresh } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';

const { t } = useI18n();

const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const queryParams = reactive({ title: '', type: undefined as number | undefined, status: undefined as number | undefined, page: 1, limit: 10 });
const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const form = reactive<any>({ id: undefined, title: '', content: '', type: 1, status: 1, publishTime: '' });
const rules = { title: [{ required: true }], content: [{ required: true }] };

const loadData = async () => {
  loading.value = true;
  try { const res: any = await noticeApi.list(queryParams); tableData.value = res.items; total.value = res.total; }
  catch { ElMessage.error(t('common.message.loadFailed')); }
  finally { loading.value = false; }
};

const resetQuery = () => { queryParams.title = ''; queryParams.type = undefined; queryParams.status = undefined; loadData(); };
const handleCreate = () => { Object.assign(form, { id: undefined, title: '', content: '', type: 1, status: 1, publishTime: '' }); dialogVisible.value = true; };
const handleEdit = (row: any) => {
  Object.assign(form, {
    id: row.id,
    title: row.title,
    content: row.content,
    type: row.type,
    status: row.status,
    publishTime: row.publishTime || '',
  });
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      const payload = {
        id: form.id,
        title: form.title,
        content: form.content,
        type: form.type,
        status: form.status,
        publishTime: form.publishTime || undefined,
      };
      if (form.id) { await noticeApi.update(payload); ElMessage.success(t('common.message.updateSuccess')); }
      else {
        const createPayload: any = { ...payload };
        delete createPayload.id;
        await noticeApi.create(createPayload);
        ElMessage.success(t('common.message.addSuccess'));
      }
      dialogVisible.value = false;
      loadData();
    } catch (e: any) { ElMessage.error(e.message); }
  });
};

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(t('common.message.confirmDelete', { name: row.title }), t('common.action.confirm'), { type: 'warning' });
  await noticeApi.delete(row.id);
  ElMessage.success(t('common.message.deleteSuccess'));
  loadData();
};

onMounted(() => loadData());
</script>

<style scoped>
.search-bar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.toolbar { margin-bottom: 16px; }
</style>