<template>
  <div class="space-y-4">
    <div class="card bg-base-100 shadow-sm border border-base-300">
      <div class="card-body p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-bold">{{ t('system.fileConfig.title') }}</h2>
            <p class="text-sm text-base-content/60 mt-1">{{ t('system.fileConfig.subtitle') }}</p>
          </div>
          <button class="btn btn-sm" @click="loadConfig">{{ t('common.action.refresh') }}</button>
        </div>

        <!-- Status strip -->
        <div class="stats stats-vertical sm:stats-horizontal shadow-sm border border-base-300 mb-6 w-full">
          <div class="stat py-4">
            <div class="stat-title text-xs">{{ t('system.fileConfig.currentStorage') }}</div>
            <div class="stat-value text-primary text-lg">{{ storageLabel }}</div>
          </div>
          <div class="stat py-4">
            <div class="stat-title text-xs">{{ t('system.fileConfig.maxFileSize') }}</div>
            <div class="stat-value text-lg">{{ formatSize(form.maxFileSize) }}</div>
          </div>
          <div class="stat py-4">
            <div class="stat-title text-xs">{{ t('system.fileConfig.maxImageSize') }}</div>
            <div class="stat-value text-lg">{{ formatSize(form.maxImageSize) }}</div>
          </div>
        </div>

        <form @submit.prevent="handleSave" class="space-y-6">
          <!-- Storage mode -->
          <div class="border border-base-300 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-4 font-semibold">
              <span>💾</span><span>{{ t('system.fileConfig.storageMode') }}</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <button v-for="opt in storageOptions" :key="opt.value" type="button" class="btn btn-sm" :class="form.storage === opt.value ? 'btn-primary' : 'btn-ghost'" @click="form.storage = opt.value">
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Local config -->
          <div v-if="form.storage === 'local'" class="border border-base-300 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-4 font-semibold"><span>📁</span><span>{{ t('system.fileConfig.localConfig') }}</span></div>
            <label class="form-control">
              <div class="label"><span class="label-text">{{ t('system.fileConfig.uploadDir') }}</span></div>
              <input v-model="form.uploadDir" class="input input-bordered" placeholder="./uploads" />
            </label>
          </div>

          <!-- Upload limits -->
          <div class="border border-base-300 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-4 font-semibold"><span>📏</span><span>{{ t('system.fileConfig.uploadLimit') }}</span></div>
            <div class="grid grid-cols-2 gap-4">
              <label class="form-control">
                <div class="label"><span class="label-text">{{ t('system.fileConfig.maxFileSize') }}</span></div>
                <div class="join">
                  <input v-model.number="form.maxFileSizeMb" type="number" min="1" max="1024" class="input input-bordered join-item flex-1" />
                  <span class="btn btn-ghost join-item no-animation">MB</span>
                </div>
              </label>
              <label class="form-control">
                <div class="label"><span class="label-text">{{ t('system.fileConfig.maxImageSize') }}</span></div>
                <div class="join">
                  <input v-model.number="form.maxImageSizeMb" type="number" min="1" max="100" class="input input-bordered join-item flex-1" />
                  <span class="btn btn-ghost join-item no-animation">MB</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Cloud config -->
          <div v-if="form.storage !== 'local'" class="border border-base-300 rounded-lg p-4 space-y-4">
            <div class="flex items-center gap-2 mb-4 font-semibold"><span>☁️</span><span>{{ t('system.fileConfig.cloudConfig') }}</span></div>
            <div class="grid grid-cols-2 gap-4">
              <label class="form-control">
                <div class="label"><span class="label-text">{{ regionLabel }}</span></div>
                <input v-model="form.region" class="input input-bordered" :placeholder="regionPlaceholder" />
              </label>
              <label class="form-control">
                <div class="label"><span class="label-text">Bucket</span></div>
                <input v-model="form.bucket" class="input input-bordered" placeholder="your-bucket" />
              </label>
              <label class="form-control">
                <div class="label"><span class="label-text">{{ accessKeyIdLabel }}</span></div>
                <input v-model="form.accessKeyId" class="input input-bordered" />
              </label>
              <label class="form-control">
                <div class="label"><span class="label-text">{{ accessKeySecretLabel }}</span></div>
                <input v-model="form.accessKeySecret" type="password" class="input input-bordered" :placeholder="form.hasAccessKeySecret ? t('system.fileConfig.secretPlaceholder') : ''" />
              </label>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <label v-if="form.storage === 'huawei-obs'" class="form-control">
                <div class="label"><span class="label-text">Endpoint</span></div>
                <input v-model="form.endpoint" class="input input-bordered" :placeholder="endpointPlaceholder" />
              </label>
              <label class="form-control">
                <div class="label"><span class="label-text">{{ t('system.fileConfig.objectPrefix') }}</span></div>
                <input v-model="form.prefix" class="input input-bordered" placeholder="uploads" />
              </label>
            </div>
            <label class="form-control">
              <div class="label"><span class="label-text">{{ t('system.fileConfig.publicUrl') }}</span></div>
              <input v-model="form.publicUrl" class="input input-bordered" placeholder="https://cdn.example.com" />
            </label>
            <label class="label cursor-pointer gap-2">
              <input type="checkbox" v-model="form.secure" class="checkbox checkbox-sm checkbox-primary" />
              <span class="label-text text-sm">{{ t('system.fileConfig.httpsUpload') }}</span>
            </label>
          </div>

          <div class="flex justify-end gap-2">
            <button type="reset" class="btn" @click="loadConfig">{{ t('common.action.reset') }}</button>
            <button type="submit" class="btn btn-primary" :class="{ loading: saving }">{{ t('common.action.save') }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { fileConfigApi } from '@/api/system/file';

const MB = 1024 * 1024;
const { t } = useI18n();
const saving = ref(false);
type StorageType = 'local' | 'aliyun-oss' | 'tencent-cos' | 'qiniu-kodo' | 'huawei-obs';

const form = reactive<any>({
  storage: 'local', uploadDir: './uploads',
  maxFileSize: 104857600, maxImageSize: 2097152, maxFileSizeMb: 100, maxImageSizeMb: 2,
  region: '', bucket: '', accessKeyId: '', accessKeySecret: '', hasAccessKeySecret: false,
  endpoint: '', prefix: 'uploads', publicUrl: '', secure: true,
});

const storageOptions = computed(() => [
  { value: 'local', label: t('system.fileConfig.localStorage') },
  { value: 'aliyun-oss', label: t('system.fileConfig.aliyunOss') },
  { value: 'tencent-cos', label: t('system.fileConfig.tencentCos') },
  { value: 'qiniu-kodo', label: t('system.fileConfig.qiniuKodo') },
  { value: 'huawei-obs', label: t('system.fileConfig.huaweiObs') },
]);
const storageLabel = computed(() => storageOptions.value.find((i) => i.value === form.storage)?.label || form.storage);
const regionLabel = computed(() => form.storage === 'qiniu-kodo' ? t('system.fileConfig.zone') : 'Region');
const currentStorage = computed(() => form.storage as StorageType);
const regionPlaceholder = computed(() => ({ 'aliyun-oss': 'oss-cn-hangzhou', 'tencent-cos': 'ap-shanghai', 'qiniu-kodo': 'z0 / z1 / z2', 'huawei-obs': 'cn-east-3' } as Partial<Record<StorageType, string>>)[currentStorage.value] || '');
const endpointPlaceholder = computed(() => ({ 'aliyun-oss': 'https://oss-cn-hangzhou.aliyuncs.com', 'huawei-obs': 'https://obs.cn-east-3.myhuaweicloud.com' } as Partial<Record<StorageType, string>>)[currentStorage.value] || t('system.fileConfig.optional'));
const accessKeyIdLabel = computed(() => form.storage === 'tencent-cos' ? 'SecretId' : 'AccessKey ID');
const accessKeySecretLabel = computed(() => form.storage === 'tencent-cos' ? 'SecretKey' : t('system.fileConfig.accessKeySecret'));

const formatSize = (bytes: number) => `${(Number(bytes || 0) / MB).toFixed(0)} MB`;

const applyConfig = (config: any) => {
  Object.assign(form, {
    ...config, region: config.region ?? config.ossRegion ?? '',
    bucket: config.bucket ?? config.ossBucket ?? '',
    accessKeyId: config.accessKeyId ?? config.ossAccessKeyId ?? '',
    accessKeySecret: '',
    hasAccessKeySecret: config.hasAccessKeySecret ?? false,
    endpoint: config.endpoint ?? config.ossEndpoint ?? '',
    prefix: config.prefix ?? 'uploads',
    publicUrl: config.publicUrl ?? config.ossPublicUrl ?? '',
    secure: config.secure ?? true,
    maxFileSizeMb: Math.max(1, Math.round(Number(config.maxFileSize || 104857600) / MB)),
    maxImageSizeMb: Math.max(1, Math.round(Number(config.maxImageSize || 2097152) / MB)),
  });
};

const loadConfig = async () => {
  try { const res = await fileConfigApi.get(); applyConfig(res); }
  catch { ElMessage.error(t('common.message.loadFailed')); }
};

const handleSave = async () => {
  saving.value = true;
  try {
    const payload = { ...form, maxFileSize: Number(form.maxFileSizeMb) * MB, maxImageSize: Number(form.maxImageSizeMb) * MB };
    const res = await fileConfigApi.update(payload);
    applyConfig(res);
    ElMessage.success(t('common.message.updateSuccess'));
  } catch (e: any) { ElMessage.error(e.message || t('common.message.failed')); }
  finally { saving.value = false; }
};

loadConfig();
</script>
