<template>
  <div class="page-container profile-page">
    <el-row :gutter="16">
      <el-col :xs="24" :lg="8">
        <el-card class="profile-summary">
          <div class="profile-summary__body">
            <el-avatar :size="72">{{ userInfo?.nickname?.charAt(0) || 'U' }}</el-avatar>
            <div class="profile-summary__meta">
              <div class="profile-summary__name">{{ userInfo?.nickname || t('common.userFallback') }}</div>
              <div class="profile-summary__email">{{ userInfo?.email || '-' }}</div>
            </div>
          </div>
        </el-card>

        <el-card class="theme-card">
          <template #header>
            <span>{{ t('common.theme') }}</span>
          </template>
          <el-radio-group :model-value="themeStore.currentTheme" @change="handleThemeChange">
            <el-radio-button label="light">{{ t('theme.light') }}</el-radio-button>
            <el-radio-button label="dark">{{ t('theme.dark') }}</el-radio-button>
          </el-radio-group>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="16">
        <el-card class="form-card">
          <template #header>
            <span>{{ t('profile.editProfile') }}</span>
          </template>

          <el-form :model="form" label-width="100px" class="profile-form">
            <el-form-item :label="t('profile.avatar')">
              <div class="avatar-upload">
                <el-avatar :size="64">{{ form.nickname?.charAt(0) || 'U' }}</el-avatar>
                <el-upload :show-file-list="false" :http-request="handleAvatarUpload">
                  <el-button type="primary">{{ t('profile.uploadAvatar') }}</el-button>
                </el-upload>
              </div>
            </el-form-item>
            <el-form-item :label="t('system.user.username')">
              <el-input v-model="form.username" disabled />
            </el-form-item>
            <el-form-item :label="t('profile.nickname')">
              <el-input v-model="form.nickname" />
            </el-form-item>
            <el-form-item :label="t('profile.email')">
              <el-input v-model="form.email" />
            </el-form-item>
            <el-form-item :label="t('profile.phone')">
              <el-input v-model="form.phone" />
            </el-form-item>
            <el-form-item :label="t('profile.remark')">
              <el-input v-model="form.remark" type="textarea" :rows="3" />
            </el-form-item>
            <el-form-item :label="t('profile.department')">
              <el-input :model-value="profileData.deptName || '-'" disabled />
            </el-form-item>
            <el-form-item :label="t('profile.roles')">
              <el-input :model-value="roleNames" disabled />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSave">{{ t('common.action.save') }}</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card class="form-card">
          <template #header>
            <span>{{ t('profile.changePassword') }}</span>
          </template>

          <el-form :model="pwdForm" label-width="120px" class="profile-form">
            <el-form-item :label="t('profile.oldPassword')">
              <el-input v-model="pwdForm.oldPassword" type="password" show-password autocomplete="current-password" />
            </el-form-item>
            <el-form-item :label="t('profile.newPassword')">
              <el-input v-model="pwdForm.newPassword" type="password" show-password autocomplete="new-password" />
            </el-form-item>
            <el-form-item :label="t('profile.confirmPassword')" :error="passwordError">
              <el-input
                v-model="pwdForm.confirmPassword"
                type="password"
                show-password
                autocomplete="new-password"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleChangePassword">{{ t('common.action.submit') }}</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/store/modules/user';
import { useThemeStore } from '@/store/theme';
import type { ThemeName } from '@/utils/appearance';
import { profileApi } from '@/api/profile';
import { fileApi } from '@/api/system/file';
import type { UploadRequestOptions } from 'element-plus';

const { t } = useI18n();
const userStore = useUserStore();
const themeStore = useThemeStore();
const userInfo = computed(() => userStore.userInfo);

const form = reactive({ username: '', nickname: '', email: '', phone: '', avatar: '', remark: '' });
const profileData = ref<any>({});

const roleNames = computed(() => (profileData.value.roles || []).map((r: any) => r.name).join(', ') || '-');
const passwordError = computed(() =>
  pwdForm.confirmPassword && pwdForm.newPassword !== pwdForm.confirmPassword
    ? t('profile.passwordMismatch')
    : '',
);

const loadProfile = async () => {
  try {
    const res: any = await profileApi.getProfile();
    profileData.value = res;
    Object.assign(form, {
      username: res.username,
      nickname: res.nickname,
      email: res.email || '',
      phone: res.phone || '',
      avatar: res.avatar || '',
      remark: res.remark || '',
    });
  } catch {
    ElMessage.error(t('common.message.loadFailed'));
  }
};

const handleAvatarUpload = async (options: UploadRequestOptions) => {
  const fd = new FormData();
  fd.append('file', options.file);
  try {
    const res: any = await fileApi.upload(fd);
    form.avatar = res.url;
    ElMessage.success(t('common.message.success'));
  } catch {
    ElMessage.error(t('common.message.failed'));
  }
};

const handleSave = async () => {
  try {
    await profileApi.updateProfile({
      nickname: form.nickname,
      email: form.email || undefined,
      phone: form.phone || undefined,
      avatar: form.avatar,
      remark: form.remark || undefined,
    });
    if (userStore.userInfo) {
      userStore.userInfo.nickname = form.nickname;
      userStore.userInfo.avatar = form.avatar;
    }
    ElMessage.success(t('profile.saveSuccess'));
  } catch {
    ElMessage.error(t('common.message.failed'));
  }
};

const pwdForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' });

const handleChangePassword = async () => {
  if (pwdForm.newPassword !== pwdForm.confirmPassword) {
    ElMessage.error(t('profile.passwordMismatch'));
    return;
  }
  try {
    await profileApi.updatePassword({ oldPassword: pwdForm.oldPassword, newPassword: pwdForm.newPassword });
    ElMessage.success(t('profile.passwordUpdateSuccess'));
    pwdForm.oldPassword = '';
    pwdForm.newPassword = '';
    pwdForm.confirmPassword = '';
  } catch {
    // interceptor handles
  }
};

const handleThemeChange = (theme: string | number | boolean | undefined) => {
  if (theme === undefined) return;
  themeStore.setTheme(String(theme) as ThemeName);
};

onMounted(() => loadProfile());
</script>

<style scoped>
.page-container {
  padding: 16px;
}

.profile-page :deep(.el-card) {
  margin-bottom: 16px;
}

.profile-summary__body {
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-summary__name {
  margin-bottom: 8px;
  font-size: 22px;
  font-weight: 600;
}

.profile-summary__email {
  color: var(--el-text-color-secondary);
}

.avatar-upload {
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-form {
  max-width: 640px;
}
</style>
