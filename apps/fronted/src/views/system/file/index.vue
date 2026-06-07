<template>
  <div class="page-container">
    <el-card class="upload-card">
      <template #header>
        <div class="upload-card__header">
          <div>
            <div class="upload-card__title">{{ t('system.file.uploadTest') }}</div>
            <div class="upload-card__desc">{{ t('system.file.uploadTestDesc') }}</div>
          </div>
          <div class="upload-card__actions">
            <el-upload :show-file-list="false" :http-request="(opts: UploadRequestOptions) => handleUpload(opts, 'file')">
              <el-button type="primary" :loading="uploadingFile" :icon="Upload">{{ t('system.file.uploadFile') }}</el-button>
            </el-upload>
            <el-upload :show-file-list="false" accept="image/*" :http-request="(opts: UploadRequestOptions) => handleUpload(opts, 'image')">
              <el-button type="success" :loading="uploadingImage" :icon="Picture">{{ t('system.file.uploadImage') }}</el-button>
            </el-upload>
          </div>
        </div>
      </template>
    </el-card>

    <el-card class="filter-form">
      <el-form :inline="true" :model="queryParams">
        <el-form-item :label="t('system.file.file')">
          <el-input v-model="queryParams.originalName" :placeholder="t('system.file.placeholderName')" clearable @keyup.enter="loadData" />
        </el-form-item>
        <el-form-item :label="t('system.file.storage')">
          <el-select v-model="queryParams.storage" clearable class="filter-select">
            <el-option label="Local" value="local" />
            <el-option label="Aliyun OSS" value="aliyun-oss" />
            <el-option label="Tencent COS" value="tencent-cos" />
            <el-option label="Qiniu Kodo" value="qiniu-kodo" />
            <el-option label="Huawei OBS" value="huawei-obs" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="loadData">{{ t('common.action.search') }}</el-button>
          <el-button :icon="Refresh" @click="handleReset">{{ t('common.action.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-wrap">
      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="id" :label="t('common.field.id')" min-width="90" />
        <el-table-column :label="t('system.file.file')" min-width="260">
          <template #default="{ row }">
            <div class="file-cell">
              <el-icon size="18"><Document /></el-icon>
              <div>
                <div class="file-cell__name">{{ row.originalName }}</div>
                <div class="file-cell__meta">{{ row.mimeType || '-' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="storage" :label="t('system.file.storage')" min-width="140">
          <template #default="{ row }">
            <el-tag effect="plain">{{ row.storage }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('system.file.size')" width="120">
          <template #default="{ row }">{{ formatSize(row.size) }}</template>
        </el-table-column>
        <el-table-column prop="uploaderName" :label="t('system.file.uploader')" min-width="140" />
        <el-table-column prop="createTime" :label="t('common.field.createTime')" min-width="180" />
        <el-table-column :label="t('common.field.actions')" width="170" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" size="small" :icon="View">
              <a :href="row.url" target="_blank" class="link-button">{{ t('common.action.view') }}</a>
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
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { Delete, Document, Picture, Refresh, Search, Upload, View } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { UploadRequestOptions } from 'element-plus';
import { fileApi, fileManageApi } from '@/api/system/file';

const { t } = useI18n();
const loading = ref(false);
const uploadingFile = ref(false);
const uploadingImage = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const queryParams = reactive({ page: 1, limit: 10, originalName: '', storage: '' });

const formatSize = (size: number | string) => {
  const b = Number(size || 0);
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
};

const uploadByApi = async (options: UploadRequestOptions, type: 'file' | 'image') => {
  const fd = new FormData();
  fd.append('file', options.file);
  const lr = type === 'image' ? uploadingImage : uploadingFile;
  lr.value = true;
  try {
    const res = type === 'image' ? await fileApi.uploadImage(fd) : await fileApi.upload(fd);
    options.onSuccess?.(res);
    ElMessage.success(t('system.file.uploadSuccess'));
    queryParams.page = 1;
    loadData();
  } catch (error: any) {
    options.onError?.(error);
    ElMessage.error(error.message || t('common.message.failed'));
  } finally {
    lr.value = false;
  }
};

const handleUpload = (opts: UploadRequestOptions, type: 'file' | 'image') => uploadByApi(opts, type);

const loadData = async () => {
  loading.value = true;
  try {
    const res: any = await fileManageApi.list(queryParams);
    tableData.value = res.items || [];
    total.value = res.total || 0;
  } catch {
    ElMessage.error(t('common.message.loadFailed'));
  } finally {
    loading.value = false;
  }
};

const handleReset = () => {
  Object.assign(queryParams, { page: 1, limit: 10, originalName: '', storage: '' });
  loadData();
};

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(t('common.message.confirmDelete', { name: row.originalName }), t('common.action.confirm'), { type: 'warning' });
  await fileManageApi.delete(row.id);
  ElMessage.success(t('common.message.deleteSuccess'));
  loadData();
};

loadData();
</script>

<style scoped>
.page-container {
  padding: 16px;
}

.upload-card,
.filter-form,
.table-wrap {
  margin-bottom: 16px;
}

.upload-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.upload-card__title {
  margin-bottom: 4px;
  font-size: 16px;
  font-weight: 600;
}

.upload-card__desc,
.file-cell__meta {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.upload-card__actions {
  display: flex;
  gap: 12px;
}

.filter-select {
  width: 160px;
}

.file-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-cell__name {
  font-weight: 500;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.link-button {
  color: inherit;
  text-decoration: none;
}
</style>
