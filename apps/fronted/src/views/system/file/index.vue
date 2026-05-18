<template>
  <div class="page-container file-page">
    <div class="upload-test">
      <div class="upload-copy">
        <h2>{{ t('system.file.uploadTest') }}</h2>
        <p>{{ t('system.file.uploadTestDesc') }}</p>
      </div>
      <div class="upload-actions">
        <el-upload :show-file-list="false" :http-request="handleFileUpload">
          <el-button type="primary" :icon="Upload" :loading="uploadingFile">
            {{ t('system.file.uploadFile') }}
          </el-button>
        </el-upload>
        <el-upload :show-file-list="false" accept="image/*" :http-request="handleImageUpload">
          <el-button type="success" :icon="Picture" :loading="uploadingImage">
            {{ t('system.file.uploadImage') }}
          </el-button>
        </el-upload>
      </div>
    </div>

    <div class="search-bar">
      <el-input
        v-model="queryParams.originalName"
        :placeholder="t('system.file.placeholderName')"
        style="width: 220px"
        clearable
        @clear="loadData"
      />
      <el-select v-model="queryParams.storage" :placeholder="t('system.file.storage')" style="width: 180px" clearable>
        <el-option label="Local" value="local" />
        <el-option label="Aliyun OSS" value="aliyun-oss" />
        <el-option label="Tencent COS" value="tencent-cos" />
        <el-option label="Qiniu Kodo" value="qiniu-kodo" />
        <el-option label="Huawei OBS" value="huawei-obs" />
      </el-select>
      <el-button type="primary" :icon="Search" @click="loadData">{{ t('common.action.search') }}</el-button>
      <el-button :icon="Refresh" @click="handleReset">{{ t('common.action.reset') }}</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" row-key="id">
      <el-table-column prop="id" :label="t('common.field.id')" width="80" />
      <el-table-column :label="t('system.file.file')" min-width="260">
        <template #default="{ row }">
          <div class="file-cell">
            <el-icon><Document /></el-icon>
            <div>
              <strong>{{ row.originalName }}</strong>
              <span>{{ row.mimeType || '-' }}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="storage" :label="t('system.file.storage')" width="130">
        <template #default="{ row }">
          <el-tag>{{ row.storage }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="size" :label="t('system.file.size')" width="120">
        <template #default="{ row }">{{ formatSize(row.size) }}</template>
      </el-table-column>
      <el-table-column prop="uploaderName" :label="t('system.file.uploader')" width="140" />
      <el-table-column prop="createTime" :label="t('common.field.createTime')" width="180">
        <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
      </el-table-column>
      <el-table-column :label="t('common.field.actions')" width="220" fixed="right">
        <template #default="{ row }">
          <el-button size="small" :icon="View" @click="handlePreview(row)">{{ t('common.action.view') }}</el-button>
          <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(row)">
            {{ t('common.action.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.limit"
        background
        layout="total, sizes, prev, pager, next"
        :total="total"
        @current-change="loadData"
        @size-change="loadData"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { UploadRequestOptions } from 'element-plus';
import { Delete, Document, Picture, Refresh, Search, Upload, View } from '@element-plus/icons-vue';
import { fileApi, fileManageApi } from '@/api';

const { t } = useI18n();
const loading = ref(false);
const uploadingFile = ref(false);
const uploadingImage = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const queryParams = reactive({
  page: 1,
  limit: 10,
  originalName: '',
  storage: '',
});

const formatSize = (size: number | string) => {
  const bytes = Number(size || 0);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const formatTime = (value: string) => value ? new Date(value).toLocaleString() : '-';

const uploadByApi = async (options: UploadRequestOptions, type: 'file' | 'image') => {
  const formData = new FormData();
  formData.append('file', options.file);
  const loadingRef = type === 'image' ? uploadingImage : uploadingFile;
  loadingRef.value = true;
  try {
    const res = type === 'image' ? await fileApi.uploadImage(formData) : await fileApi.upload(formData);
    options.onSuccess?.(res);
    ElMessage.success(t('system.file.uploadSuccess'));
    queryParams.page = 1;
    loadData();
  } catch (error: any) {
    options.onError?.(error);
    ElMessage.error(error.message || t('common.message.failed'));
  } finally {
    loadingRef.value = false;
  }
};

const handleFileUpload = (options: UploadRequestOptions) => uploadByApi(options, 'file');
const handleImageUpload = (options: UploadRequestOptions) => uploadByApi(options, 'image');

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

const handlePreview = (row: any) => {
  window.open(row.url, '_blank');
};

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(t('common.message.confirmDelete', { name: row.originalName }), t('common.action.confirm'), {
    type: 'warning',
  });
  await fileManageApi.delete(row.id);
  ElMessage.success(t('common.message.deleteSuccess'));
  loadData();
};

loadData();
</script>

<style scoped>
.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.upload-test {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 18px;
  margin-bottom: 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
}

.upload-copy h2 {
  margin: 0;
  color: var(--text);
  font-size: 18px;
}

.upload-copy p {
  margin: 6px 0 0;
  color: var(--muted);
}

.upload-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.file-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-cell .el-icon {
  color: var(--primary);
  font-size: 22px;
}

.file-cell strong {
  display: block;
  color: var(--text);
  font-weight: 600;
}

.file-cell span {
  display: block;
  margin-top: 2px;
  color: var(--muted);
  font-size: 12px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

@media (max-width: 760px) {
  .upload-test {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
