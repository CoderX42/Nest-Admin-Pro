<template>
  <div class="space-y-4">
    <!-- Upload test bar -->
    <div class="card bg-base-100 shadow-sm border border-base-300 p-4">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 class="font-semibold">{{ t('system.file.uploadTest') }}</h3>
          <p class="text-xs text-base-content/60 mt-0.5">{{ t('system.file.uploadTestDesc') }}</p>
        </div>
        <div class="flex gap-2 flex-wrap">
          <el-upload :show-file-list="false" :http-request="(opts: any) => handleUpload(opts, 'file')">
            <button class="btn btn-sm btn-primary" :class="{ loading: uploadingFile }">{{ uploadingFile ? '' : t('system.file.uploadFile') }}</button>
          </el-upload>
          <el-upload :show-file-list="false" accept="image/*" :http-request="(opts: any) => handleUpload(opts, 'image')">
            <button class="btn btn-sm btn-success" :class="{ loading: uploadingImage }">{{ uploadingImage ? '' : t('system.file.uploadImage') }}</button>
          </el-upload>
        </div>
      </div>
    </div>

    <!-- Search -->
    <div class="card bg-base-100 shadow-sm border border-base-300 p-4">
      <div class="flex flex-wrap gap-3 items-end">
        <div class="form-control flex-1 min-w-48">
          <label class="label py-0"><span class="label-text text-xs">{{ t('system.file.file') }}</span></label>
          <input v-model="queryParams.originalName" :placeholder="t('system.file.placeholderName')" class="input input-bordered input-sm w-full" @keyup.enter="loadData" />
        </div>
        <div class="form-control min-w-36">
          <label class="label py-0"><span class="label-text text-xs">{{ t('system.file.storage') }}</span></label>
          <select v-model="queryParams.storage" class="select select-bordered select-sm w-full">
            <option value="">—</option>
            <option value="local">Local</option>
            <option value="aliyun-oss">Aliyun OSS</option>
            <option value="tencent-cos">Tencent COS</option>
            <option value="qiniu-kodo">Qiniu Kodo</option>
            <option value="huawei-obs">Huawei OBS</option>
          </select>
        </div>
        <button class="btn btn-sm btn-primary" @click="loadData">{{ t('common.action.search') }}</button>
        <button class="btn btn-sm" @click="handleReset">{{ t('common.action.reset') }}</button>
      </div>
    </div>

    <!-- Table -->
    <div class="card bg-base-100 shadow-sm border border-base-300 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr class="bg-base-200 text-xs">
              <th class="w-16">{{ t('common.field.id') }}</th>
              <th>{{ t('system.file.file') }}</th>
              <th class="w-28">{{ t('system.file.storage') }}</th>
              <th class="w-24">{{ t('system.file.size') }}</th>
              <th class="w-32">{{ t('system.file.uploader') }}</th>
              <th class="w-40">{{ t('common.field.createTime') }}</th>
              <th class="w-40">{{ t('common.field.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="7" class="text-center py-8"><span class="loading loading-spinner loading-sm text-primary"></span></td></tr>
            <tr v-else-if="!tableData.length"><td colspan="7" class="text-center text-base-content/40 py-8">No data</td></tr>
            <tr v-for="row in tableData" :key="row.id" class="hover:bg-base-200/50">
              <td class="text-xs">{{ row.id }}</td>
              <td>
                <div class="flex items-center gap-2">
                  <span class="text-lg">📄</span>
                  <div>
                    <div class="text-sm font-medium truncate max-w-xs">{{ row.originalName }}</div>
                    <div class="text-xs text-base-content/50">{{ row.mimeType || '-' }}</div>
                  </div>
                </div>
              </td>
              <td><span class="badge badge-sm badge-ghost">{{ row.storage }}</span></td>
              <td class="text-xs">{{ formatSize(row.size) }}</td>
              <td class="text-xs">{{ row.uploaderName }}</td>
              <td class="text-xs text-base-content/60">{{ row.createTime }}</td>
              <td>
                <div class="flex gap-1">
                  <a :href="row.url" target="_blank" class="btn btn-xs btn-ghost">🔗</a>
                  <button class="btn btn-xs btn-error" @click="handleDelete(row)">{{ t('common.action.delete') }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex items-center justify-between p-4 border-t border-base-300">
        <span class="text-sm text-base-content/60">共 {{ total }} 条</span>
        <div class="join">
          <button class="join-item btn btn-sm" :disabled="queryParams.page <= 1" @click="queryParams.page--; loadData()">«</button>
          <button class="join-item btn btn-sm btn-active" disabled>{{ queryParams.page }}</button>
          <button class="join-item btn btn-sm" :disabled="queryParams.page * queryParams.limit >= total" @click="queryParams.page++; loadData()">»</button>
          <select class="join-item btn btn-sm" v-model="queryParams.limit" @change="loadData"><option :value="10">10/页</option><option :value="20">20/页</option></select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
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

const formatSize = (size: number | string) => { const b = Number(size || 0); if (b < 1024) return `${b} B`; if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`; return `${(b / 1048576).toFixed(1)} MB`; };

const uploadByApi = async (options: UploadRequestOptions, type: 'file' | 'image') => {
  const fd = new FormData(); fd.append('file', options.file);
  const lr = type === 'image' ? uploadingImage : uploadingFile;
  lr.value = true;
  try {
    const res = type === 'image' ? await fileApi.uploadImage(fd) : await fileApi.upload(fd);
    options.onSuccess?.(res);
    ElMessage.success(t('system.file.uploadSuccess'));
    queryParams.page = 1; loadData();
  } catch (error: any) { options.onError?.(error); ElMessage.error(error.message || t('common.message.failed')); }
  finally { lr.value = false; }
};

const handleUpload = (opts: UploadRequestOptions, type: 'file' | 'image') => uploadByApi(opts, type);

const loadData = async () => {
  loading.value = true;
  try { const res: any = await fileManageApi.list(queryParams); tableData.value = res.items || []; total.value = res.total || 0; }
  catch { ElMessage.error(t('common.message.loadFailed')); }
  finally { loading.value = false; }
};

const handleReset = () => { Object.assign(queryParams, { page: 1, limit: 10, originalName: '', storage: '' }); loadData(); };

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(t('common.message.confirmDelete', { name: row.originalName }), t('common.action.confirm'), { type: 'warning' });
  await fileManageApi.delete(row.id); ElMessage.success(t('common.message.deleteSuccess')); loadData();
};

loadData();
</script>
