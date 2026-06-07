<template>
  <div class="page-container">
    <el-card class="filter-form">
      <el-form :inline="true" :model="queryParams">
        <el-form-item :label="t('system.notice.title')">
          <el-input v-model="queryParams.title" :placeholder="t('system.notice.placeholderTitle')" clearable @keyup.enter="loadData" />
        </el-form-item>
        <el-form-item :label="t('common.field.type')">
          <el-select v-model="queryParams.type" clearable class="filter-select">
            <el-option :label="t('system.notice.typeNotice')" :value="1" />
            <el-option :label="t('system.notice.typeAnnouncement')" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('common.field.status')">
          <el-select v-model="queryParams.status" clearable class="filter-select">
            <el-option :label="t('common.status.normal')" :value="1" />
            <el-option :label="t('common.status.closed')" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="loadData">{{ t('common.action.search') }}</el-button>
          <el-button :icon="Refresh" @click="resetQuery">{{ t('common.action.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-wrap">
      <template #header>
        <div class="action-bar">
          <el-button type="primary" :icon="Plus" @click="handleCreate">{{ t('system.notice.addNotice') }}</el-button>
          <el-button :icon="Refresh" @click="loadData">{{ t('common.action.refresh') }}</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="id" :label="t('common.field.id')" min-width="90" />
        <el-table-column prop="title" :label="t('system.notice.title')" min-width="220" show-overflow-tooltip />
        <el-table-column :label="t('common.field.type')" width="130">
          <template #default="{ row }">
            <el-tag :type="row.type === 1 ? 'success' : 'warning'" effect="plain">
              {{ row.type === 1 ? t('system.notice.typeNotice') : t('system.notice.typeAnnouncement') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('common.field.status')" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" effect="plain">
              {{ row.status === 1 ? t('common.status.normal') : t('common.status.closed') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" :label="t('system.notice.publishTime')" min-width="180" />
        <el-table-column prop="createTime" :label="t('common.field.createTime')" min-width="180" />
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

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.limit"
          :total="total"
          :page-sizes="[10, 20]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="form.id ? t('system.notice.editNotice') : t('system.notice.addNotice')" width="720px">
      <el-form :model="form" label-width="100px">
        <el-form-item :label="t('system.notice.title')">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item :label="t('system.notice.type')">
          <el-radio-group v-model="form.type">
            <el-radio :value="1">{{ t('system.notice.typeNotice') }}</el-radio>
            <el-radio :value="2">{{ t('system.notice.typeAnnouncement') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('system.notice.content')">
          <el-input v-model="form.content" type="textarea" :rows="6" />
        </el-form-item>
        <el-form-item :label="t('common.field.status')">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">{{ t('common.status.normal') }}</el-radio>
            <el-radio :value="0">{{ t('common.status.closed') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('system.notice.publishTime')">
          <el-date-picker v-model="form.publishTime" type="datetime" placeholder="Select datetime" class="date-picker" />
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
import { noticeApi } from '@/api/system/notice';
import { ElMessage, ElMessageBox } from 'element-plus';

const { t } = useI18n();
const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const queryParams = reactive({ title: '', type: undefined as number | undefined, status: undefined as number | undefined, page: 1, limit: 10 });
const dialogVisible = ref(false);
const form = reactive<any>({ id: undefined, title: '', content: '', type: 1, status: 1, publishTime: '' });

const loadData = async () => {
  loading.value = true;
  try {
    const res: any = await noticeApi.list(queryParams);
    tableData.value = res.items || [];
    total.value = res.total || 0;
  } catch {
    ElMessage.error(t('common.message.loadFailed'));
  } finally {
    loading.value = false;
  }
};

const resetQuery = () => {
  queryParams.title = '';
  queryParams.type = undefined;
  queryParams.status = undefined;
  queryParams.page = 1;
  loadData();
};
const handleCreate = () => {
  Object.assign(form, { id: undefined, title: '', content: '', type: 1, status: 1, publishTime: '' });
  dialogVisible.value = true;
};
const handleEdit = (row: any) => {
  Object.assign(form, { id: row.id, title: row.title, content: row.content, type: row.type, status: row.status, publishTime: row.publishTime || '' });
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  try {
    const payload = { id: form.id, title: form.title, content: form.content, type: form.type, status: form.status, publishTime: form.publishTime || undefined };
    if (form.id) {
      await noticeApi.update(payload);
      ElMessage.success(t('common.message.updateSuccess'));
    } else {
      const cp: any = { ...payload };
      delete cp.id;
      await noticeApi.create(cp);
      ElMessage.success(t('common.message.addSuccess'));
    }
    dialogVisible.value = false;
    loadData();
  } catch (e: any) {
    ElMessage.error(e.message);
  }
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
.page-container {
  padding: 16px;
}

.filter-form,
.table-wrap {
  margin-bottom: 16px;
}

.filter-select {
  width: 140px;
}

.action-bar {
  display: flex;
  gap: 12px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.date-picker {
  width: 100%;
}
</style>
