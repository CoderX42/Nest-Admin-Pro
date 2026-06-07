<template>
  <div class="page-container">
    <el-card class="config-card">
      <template #header>
        <div class="config-card__header">
          <div>
            <div class="config-card__title">{{ t('system.fileConfig.title') }}</div>
            <div class="config-card__desc">{{ t('system.fileConfig.subtitle') }}</div>
          </div>
          <el-button :icon="Refresh" @click="loadConfig">{{ t('common.action.refresh') }}</el-button>
        </div>
      </template>

      <el-row :gutter="16" class="summary-row">
        <el-col :xs="24" :md="8">
          <el-card shadow="never" class="summary-item">
            <div class="summary-item__label">{{ t('system.fileConfig.currentStorage') }}</div>
            <div class="summary-item__value">{{ storageLabel }}</div>
          </el-card>
        </el-col>
        <el-col :xs="24" :md="8">
          <el-card shadow="never" class="summary-item">
            <div class="summary-item__label">{{ t('system.fileConfig.maxFileSize') }}</div>
            <div class="summary-item__value">{{ formatSize(form.maxFileSize) }}</div>
          </el-card>
        </el-col>
        <el-col :xs="24" :md="8">
          <el-card shadow="never" class="summary-item">
            <div class="summary-item__label">{{ t('system.fileConfig.maxImageSize') }}</div>
            <div class="summary-item__value">{{ formatSize(form.maxImageSize) }}</div>
          </el-card>
        </el-col>
      </el-row>

      <el-form label-width="140px" class="config-form">
        <el-card shadow="never" class="section-card">
          <template #header>
            <span>{{ t('system.fileConfig.storageMode') }}</span>
          </template>
          <el-radio-group v-model="form.storage">
            <el-radio-button v-for="opt in storageOptions" :key="opt.value" :label="opt.value">
              {{ opt.label }}
            </el-radio-button>
          </el-radio-group>
        </el-card>

        <el-card v-if="form.storage === 'local'" shadow="never" class="section-card">
          <template #header>
            <span>{{ t('system.fileConfig.localConfig') }}</span>
          </template>
          <el-form-item :label="t('system.fileConfig.uploadDir')">
            <el-input v-model="form.uploadDir" placeholder="./uploads" />
          </el-form-item>
        </el-card>

        <el-card shadow="never" class="section-card">
          <template #header>
            <span>{{ t('system.fileConfig.uploadLimit') }}</span>
          </template>
          <el-row :gutter="16">
            <el-col :xs="24" :md="12">
              <el-form-item :label="t('system.fileConfig.maxFileSize')">
                <el-input-number v-model="form.maxFileSizeMb" :min="1" :max="1024" />
                <span class="unit-text">MB</span>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item :label="t('system.fileConfig.maxImageSize')">
                <el-input-number v-model="form.maxImageSizeMb" :min="1" :max="100" />
                <span class="unit-text">MB</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <el-card v-if="form.storage !== 'local'" shadow="never" class="section-card">
          <template #header>
            <span>{{ t('system.fileConfig.cloudConfig') }}</span>
          </template>
          <el-row :gutter="16">
            <el-col :xs="24" :md="12">
              <el-form-item :label="regionLabel">
                <el-input v-model="form.region" :placeholder="regionPlaceholder" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="Bucket">
                <el-input v-model="form.bucket" placeholder="your-bucket" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item :label="accessKeyIdLabel">
                <el-input v-model="form.accessKeyId" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item :label="accessKeySecretLabel">
                <el-input
                  v-model="form.accessKeySecret"
                  type="password"
                  show-password
                  :placeholder="form.hasAccessKeySecret ? t('system.fileConfig.secretPlaceholder') : ''"
                />
              </el-form-item>
            </el-col>
            <el-col v-if="form.storage === 'huawei-obs'" :xs="24" :md="12">
              <el-form-item label="Endpoint">
                <el-input v-model="form.endpoint" :placeholder="endpointPlaceholder" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item :label="t('system.fileConfig.objectPrefix')">
                <el-input v-model="form.prefix" placeholder="uploads" />
              </el-form-item>
            </el-col>
            <el-col :xs="24">
              <el-form-item :label="t('system.fileConfig.publicUrl')">
                <el-input v-model="form.publicUrl" placeholder="https://cdn.example.com" />
              </el-form-item>
            </el-col>
            <el-col :xs="24">
              <el-form-item :label="t('system.fileConfig.httpsUpload')">
                <el-switch v-model="form.secure" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <div class="form-actions">
          <el-button @click="loadConfig">{{ t('common.action.reset') }}</el-button>
          <el-button type="primary" :loading="saving" @click="handleSave">{{ t('common.action.save') }}</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { Refresh } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { fileConfigApi } from '@/api/system/file';

const MB = 1024 * 1024;
const { t } = useI18n();
const saving = ref(false);
type StorageType = 'local' | 'aliyun-oss' | 'tencent-cos' | 'qiniu-kodo' | 'huawei-obs';

const form = reactive<any>({
  storage: 'local',
  uploadDir: './uploads',
  maxFileSize: 104857600,
  maxImageSize: 2097152,
  maxFileSizeMb: 100,
  maxImageSizeMb: 2,
  region: '',
  bucket: '',
  accessKeyId: '',
  accessKeySecret: '',
  hasAccessKeySecret: false,
  endpoint: '',
  prefix: 'uploads',
  publicUrl: '',
  secure: true,
});

const storageOptions = computed(() => [
  { value: 'local', label: t('system.fileConfig.localStorage') },
  { value: 'aliyun-oss', label: t('system.fileConfig.aliyunOss') },
  { value: 'tencent-cos', label: t('system.fileConfig.tencentCos') },
  { value: 'qiniu-kodo', label: t('system.fileConfig.qiniuKodo') },
  { value: 'huawei-obs', label: t('system.fileConfig.huaweiObs') },
]);
const storageLabel = computed(() => storageOptions.value.find((i) => i.value === form.storage)?.label || form.storage);
const regionLabel = computed(() => (form.storage === 'qiniu-kodo' ? t('system.fileConfig.zone') : 'Region'));
const currentStorage = computed(() => form.storage as StorageType);
const regionPlaceholder = computed(
  () =>
    ({
      'aliyun-oss': 'oss-cn-hangzhou',
      'tencent-cos': 'ap-shanghai',
      'qiniu-kodo': 'z0 / z1 / z2',
      'huawei-obs': 'cn-east-3',
    } as Partial<Record<StorageType, string>>)[currentStorage.value] || '',
);
const endpointPlaceholder = computed(
  () =>
    ({
      'aliyun-oss': 'https://oss-cn-hangzhou.aliyuncs.com',
      'huawei-obs': 'https://obs.cn-east-3.myhuaweicloud.com',
    } as Partial<Record<StorageType, string>>)[currentStorage.value] || t('system.fileConfig.optional'),
);
const accessKeyIdLabel = computed(() => (form.storage === 'tencent-cos' ? 'SecretId' : 'AccessKey ID'));
const accessKeySecretLabel = computed(() => (form.storage === 'tencent-cos' ? 'SecretKey' : t('system.fileConfig.accessKeySecret')));

const formatSize = (bytes: number) => `${(Number(bytes || 0) / MB).toFixed(0)} MB`;

const applyConfig = (config: any) => {
  Object.assign(form, {
    ...config,
    region: config.region ?? config.ossRegion ?? '',
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
  try {
    const res = await fileConfigApi.get();
    applyConfig(res);
  } catch {
    ElMessage.error(t('common.message.loadFailed'));
  }
};

const handleSave = async () => {
  saving.value = true;
  try {
    const payload = { ...form, maxFileSize: Number(form.maxFileSizeMb) * MB, maxImageSize: Number(form.maxImageSizeMb) * MB };
    const res = await fileConfigApi.update(payload);
    applyConfig(res);
    ElMessage.success(t('common.message.updateSuccess'));
  } catch (e: any) {
    ElMessage.error(e.message || t('common.message.failed'));
  } finally {
    saving.value = false;
  }
};

loadConfig();
</script>

<style scoped>
.page-container {
  padding: 16px;
}

.config-card {
  margin-bottom: 16px;
}

.config-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.config-card__title {
  margin-bottom: 4px;
  font-size: 18px;
  font-weight: 600;
}

.config-card__desc,
.summary-item__label {
  color: var(--el-text-color-secondary);
}

.summary-row {
  margin-bottom: 16px;
}

.summary-item {
  text-align: center;
}

.summary-item__value {
  margin-top: 8px;
  font-size: 22px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.section-card {
  margin-bottom: 16px;
}

.unit-text {
  margin-left: 8px;
  color: var(--el-text-color-secondary);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
