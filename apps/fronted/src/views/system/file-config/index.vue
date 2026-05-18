<template>
  <div class="page-container file-config-page">
    <div class="page-heading">
      <div>
        <h1>{{ t('system.fileConfig.title') }}</h1>
        <p>{{ t('system.fileConfig.subtitle') }}</p>
      </div>
      <el-button :icon="Refresh" @click="loadConfig">{{ t('common.action.refresh') }}</el-button>
    </div>

    <div class="status-strip">
      <div class="status-item">
        <el-icon><Folder /></el-icon>
        <div>
          <span>{{ t('system.fileConfig.currentStorage') }}</span>
          <strong>{{ storageLabel }}</strong>
        </div>
      </div>
      <div class="status-item">
        <el-icon><UploadFilled /></el-icon>
        <div>
          <span>{{ t('system.fileConfig.maxFileSize') }}</span>
          <strong>{{ formatSize(form.maxFileSize) }}</strong>
        </div>
      </div>
      <div class="status-item">
        <el-icon><Picture /></el-icon>
        <div>
          <span>{{ t('system.fileConfig.maxImageSize') }}</span>
          <strong>{{ formatSize(form.maxImageSize) }}</strong>
        </div>
      </div>
    </div>

    <el-form
      ref="formRef"
      v-loading="loading"
      :model="form"
      :rules="rules"
      label-position="top"
      class="config-form"
    >
      <section class="config-section">
        <div class="section-title">
          <el-icon><Switch /></el-icon>
          <span>{{ t('system.fileConfig.storageMode') }}</span>
        </div>
        <el-form-item prop="storage">
          <el-radio-group v-model="form.storage" class="storage-switch">
            <el-radio-button
              v-for="option in storageOptions"
              :key="option.value"
              :label="option.value"
            >
              {{ option.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </section>

      <section class="config-section" v-if="form.storage === 'local'">
        <div class="section-title">
          <el-icon><Folder /></el-icon>
          <span>{{ t('system.fileConfig.localConfig') }}</span>
        </div>
        <el-form-item :label="t('system.fileConfig.uploadDir')" prop="uploadDir">
          <el-input v-model="form.uploadDir" placeholder="./uploads" />
        </el-form-item>
      </section>

      <section class="config-section">
        <div class="section-title">
          <el-icon><UploadFilled /></el-icon>
          <span>{{ t('system.fileConfig.uploadLimit') }}</span>
        </div>
        <div class="form-grid two">
          <el-form-item :label="t('system.fileConfig.maxFileSize')" prop="maxFileSizeMb">
            <el-input-number v-model="form.maxFileSizeMb" :min="1" :max="1024" controls-position="right" />
          </el-form-item>
          <el-form-item :label="t('system.fileConfig.maxImageSize')" prop="maxImageSizeMb">
            <el-input-number v-model="form.maxImageSizeMb" :min="1" :max="100" controls-position="right" />
          </el-form-item>
        </div>
      </section>

      <section class="config-section" v-if="form.storage !== 'local'">
        <div class="section-title">
          <el-icon><Connection /></el-icon>
          <span>{{ t('system.fileConfig.cloudConfig') }}</span>
        </div>
        <div class="form-grid two">
          <el-form-item :label="regionLabel" prop="region">
            <el-input v-model="form.region" :placeholder="regionPlaceholder" />
          </el-form-item>
          <el-form-item label="Bucket" prop="bucket">
            <el-input v-model="form.bucket" placeholder="your-bucket" />
          </el-form-item>
          <el-form-item :label="accessKeyIdLabel" prop="accessKeyId">
            <el-input v-model="form.accessKeyId" />
          </el-form-item>
          <el-form-item :label="accessKeySecretLabel" prop="accessKeySecret">
            <el-input
              v-model="form.accessKeySecret"
              type="password"
              show-password
              :placeholder="form.hasAccessKeySecret ? t('system.fileConfig.secretPlaceholder') : ''"
            />
          </el-form-item>
          <el-form-item :label="endpointLabel" :prop="form.storage === 'huawei-obs' ? 'endpoint' : ''">
            <el-input v-model="form.endpoint" :placeholder="endpointPlaceholder" />
          </el-form-item>
          <el-form-item :label="t('system.fileConfig.objectPrefix')">
            <el-input v-model="form.prefix" placeholder="uploads" />
          </el-form-item>
        </div>
        <el-form-item :label="t('system.fileConfig.publicUrl')" prop="publicUrl">
          <el-input v-model="form.publicUrl" placeholder="https://cdn.example.com">
            <template #prefix>
              <el-icon><Link /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="form.secure">{{ t('system.fileConfig.httpsUpload') }}</el-checkbox>
        </el-form-item>
      </section>

      <div class="form-actions">
        <el-button :icon="Refresh" @click="loadConfig">{{ t('common.action.reset') }}</el-button>
        <el-button type="primary" :icon="Check" :loading="saving" @click="handleSave">
          {{ t('common.action.save') }}
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { Check, Connection, Folder, Link, Picture, Refresh, Switch, UploadFilled } from '@element-plus/icons-vue';
import { fileConfigApi } from '@/api';

const MB = 1024 * 1024;
const { t } = useI18n();
const loading = ref(false);
const saving = ref(false);
const formRef = ref<FormInstance>();

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
const storageLabel = computed(() => storageOptions.value.find((item) => item.value === form.storage)?.label || form.storage);
const regionLabel = computed(() => (form.storage === 'qiniu-kodo' ? t('system.fileConfig.zone') : 'Region'));
const regionPlaceholder = computed(() => {
  const placeholders: Record<string, string> = {
    'aliyun-oss': 'oss-cn-hangzhou',
    'tencent-cos': 'ap-shanghai',
    'qiniu-kodo': 'z0 / z1 / z2 / na0 / as0',
    'huawei-obs': 'cn-east-3',
  };
  return placeholders[form.storage] || '';
});
const endpointLabel = computed(() => (form.storage === 'huawei-obs' ? 'Endpoint / Server' : 'Endpoint'));
const endpointPlaceholder = computed(() => {
  const placeholders: Record<string, string> = {
    'aliyun-oss': 'https://oss-cn-hangzhou.aliyuncs.com',
    'huawei-obs': 'https://obs.cn-east-3.myhuaweicloud.com',
  };
  return placeholders[form.storage] || t('system.fileConfig.optional');
});
const accessKeyIdLabel = computed(() => (form.storage === 'tencent-cos' ? 'SecretId' : 'AccessKey ID'));
const accessKeySecretLabel = computed(() => (form.storage === 'tencent-cos' ? 'SecretKey' : t('system.fileConfig.accessKeySecret')));

const requiredWhenOss = (_rule: any, value: string, callback: (error?: Error) => void) => {
  if (form.storage !== 'local' && !value) {
    callback(new Error(t('system.fileConfig.required')));
    return;
  }
  callback();
};

const requiredEndpoint = (_rule: any, value: string, callback: (error?: Error) => void) => {
  if (form.storage === 'huawei-obs' && !value) {
    callback(new Error(t('system.fileConfig.required')));
    return;
  }
  callback();
};

const requiredSecret = (_rule: any, value: string, callback: (error?: Error) => void) => {
  if (form.storage !== 'local' && !form.hasAccessKeySecret && !value) {
    callback(new Error(t('system.fileConfig.required')));
    return;
  }
  callback();
};

const rules: FormRules = {
  storage: [{ required: true, message: t('system.fileConfig.required') }],
  uploadDir: [{ required: true, message: t('system.fileConfig.required') }],
  region: [{ validator: requiredWhenOss }],
  bucket: [{ validator: requiredWhenOss }],
  accessKeyId: [{ validator: requiredWhenOss }],
  accessKeySecret: [{ validator: requiredSecret }],
  endpoint: [{ validator: requiredEndpoint }],
  publicUrl: [{ validator: requiredWhenOss }],
};

const formatSize = (bytes: number) => `${(Number(bytes || 0) / MB).toFixed(0)} MB`;

const applyConfig = (config: any) => {
  Object.assign(form, {
    ...config,
    region: config.region ?? config.ossRegion ?? '',
    bucket: config.bucket ?? config.ossBucket ?? '',
    accessKeyId: config.accessKeyId ?? config.ossAccessKeyId ?? '',
    accessKeySecret: '',
    hasAccessKeySecret: config.hasAccessKeySecret ?? config.hasOssAccessKeySecret ?? false,
    endpoint: config.endpoint ?? config.ossEndpoint ?? '',
    prefix: config.prefix ?? config.ossPrefix ?? 'uploads',
    publicUrl: config.publicUrl ?? config.ossPublicUrl ?? '',
    secure: config.secure ?? config.ossSecure ?? true,
    maxFileSizeMb: Math.max(1, Math.round(Number(config.maxFileSize || 104857600) / MB)),
    maxImageSizeMb: Math.max(1, Math.round(Number(config.maxImageSize || 2097152) / MB)),
  });
};

const loadConfig = async () => {
  loading.value = true;
  try {
    const res = await fileConfigApi.get();
    applyConfig(res);
  } catch {
    ElMessage.error(t('common.message.loadFailed'));
  } finally {
    loading.value = false;
  }
};

const handleSave = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    saving.value = true;
    try {
      const payload = {
        ...form,
        maxFileSize: Number(form.maxFileSizeMb) * MB,
        maxImageSize: Number(form.maxImageSizeMb) * MB,
      };
      const res = await fileConfigApi.update(payload);
      applyConfig(res);
      ElMessage.success(t('common.message.updateSuccess'));
    } catch (e: any) {
      ElMessage.error(e.message || t('common.message.failed'));
    } finally {
      saving.value = false;
    }
  });
};

loadConfig();
</script>

<style scoped>
.file-config-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.page-heading h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
}

.page-heading p {
  margin: 6px 0 0;
  color: var(--muted);
}

.status-strip,
.config-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
}

.status-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  overflow: hidden;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px;
  background: var(--soft-surface);
}

.status-item .el-icon {
  color: var(--primary);
  font-size: 22px;
}

.status-item span {
  display: block;
  color: var(--muted);
  font-size: 13px;
}

.status-item strong {
  display: block;
  margin-top: 4px;
  color: var(--text);
  font-size: 18px;
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-section {
  padding: 18px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: var(--text);
  font-weight: 700;
}

.section-title .el-icon {
  color: var(--primary);
}

.storage-switch {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.storage-switch :deep(.el-radio-button__inner) {
  border-radius: 8px;
  border-left: var(--el-border);
}

.form-grid {
  display: grid;
  gap: 16px;
}

.form-grid.two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 760px) {
  .page-heading,
  .form-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .status-strip,
  .form-grid.two {
    grid-template-columns: 1fr;
  }
}
</style>
