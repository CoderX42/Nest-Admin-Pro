<template>
  <div class="page-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="18"><User /></el-icon>
          <span>{{ t('common.profile') }}</span>
        </div>
      </template>
      <div class="profile-info">
        <el-avatar :size="64" :src="userInfo?.avatar || ''">
          {{ userInfo?.nickname?.charAt(0) || 'U' }}
        </el-avatar>
        <div class="profile-meta">
          <h3>{{ userInfo?.nickname || t('common.userFallback') }}</h3>
          <p class="muted">{{ userInfo?.email || '-' }}</p>
        </div>
      </div>
    </el-card>

    <el-card class="edit-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="18"><EditPen /></el-icon>
          <span>{{ t('profile.editProfile') }}</span>
        </div>
      </template>
      <el-form :model="form" label-width="100px" class="profile-form">
        <div class="avatar-upload">
          <el-avatar :size="80" :src="form.avatar || ''">
            {{ form.nickname?.charAt(0) || 'U' }}
          </el-avatar>
          <el-upload
            class="avatar-uploader"
            action=""
            :http-request="handleAvatarUpload"
            :show-file-list="false"
            accept="image/*"
          >
            <el-button type="primary" text>{{ t('profile.uploadAvatar') }}</el-button>
          </el-upload>
        </div>
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
          <el-input v-model="form.remark" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item :label="t('profile.department')">
          <el-input :model-value="profileData.deptName || '-'" disabled />
        </el-form-item>
        <el-form-item :label="t('profile.roles')">
          <el-input :model-value="profileData.roles?.map((r: any) => r.name).join(', ') || '-'" disabled />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave">{{ t('common.action.save') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="password-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="18"><Lock /></el-icon>
          <span>{{ t('profile.changePassword') }}</span>
        </div>
      </template>
      <el-form :model="pwdForm" :rules="pwdRules" ref="pwdFormRef" label-width="120px" class="profile-form">
        <el-form-item :label="t('profile.oldPassword')" prop="oldPassword">
          <el-input v-model="pwdForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item :label="t('profile.newPassword')" prop="newPassword">
          <el-input v-model="pwdForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item :label="t('profile.confirmPassword')" prop="confirmPassword">
          <el-input v-model="pwdForm.confirmPassword" type="password" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleChangePassword">{{ t('common.action.submit') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="appearance-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="18"><Brush /></el-icon>
          <span>{{ t('common.theme') }}</span>
        </div>
      </template>
      <div class="theme-grid">
        <div
          v-for="theme in themeOptions"
          :key="theme"
          class="theme-card"
          :class="{ active: themeStore.currentTheme === theme }"
          @click="themeStore.setTheme(theme)"
        >
          <div class="theme-preview" :style="{ background: getThemeGradient(theme) }">
            <div class="theme-dots">
              <span
                v-for="(color, idx) in getThemeColors(theme)"
                :key="idx"
                class="dot"
                :style="{ background: color }"
              />
            </div>
          </div>
          <div class="theme-name">{{ t(`theme.${theme}`) }}</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/store/modules/user';
import { useThemeStore } from '@/store/theme';
import { profileApi, fileApi } from '@/api';
import { themeOptions, themeMetas, type ThemeName } from '@/utils/appearance';
import { User, Brush, EditPen, Lock } from '@element-plus/icons-vue';

const { t } = useI18n();
const userStore = useUserStore();
const themeStore = useThemeStore();

const userInfo = computed(() => userStore.userInfo);

const form = reactive({
  username: '',
  nickname: '',
  email: '',
  phone: '',
  avatar: '',
  remark: '',
});

const profileData = ref<any>({});

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
  } catch (e) {
    ElMessage.error(t('common.message.loadFailed'));
  }
};

onMounted(() => {
  loadProfile();
});

const handleAvatarUpload = async (options: any) => {
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
      userStore.userInfo.email = form.email;
      userStore.userInfo.phone = form.phone;
      userStore.userInfo.remark = form.remark;
    }
    ElMessage.success(t('profile.saveSuccess'));
  } catch {
    ElMessage.error(t('common.message.failed'));
  }
};

const pwdFormRef = ref<any>(null);
const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const pwdRules = {
  oldPassword: [{ required: true, message: () => t('login.passwordRequired'), trigger: 'blur' }],
  newPassword: [{ required: true, min: 6, message: () => t('login.passwordRequired'), trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: () => t('login.passwordRequired'), trigger: 'blur' },
    {
      validator: (_rule: any, value: string, callback: any) => {
        if (value !== pwdForm.newPassword) {
          callback(new Error(t('profile.passwordMismatch')));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
};

const handleChangePassword = async () => {
  if (!pwdFormRef.value) return;
  await pwdFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return;
    try {
      await profileApi.updatePassword({
        oldPassword: pwdForm.oldPassword,
        newPassword: pwdForm.newPassword,
      });
      ElMessage.success(t('profile.passwordUpdateSuccess'));
      pwdForm.oldPassword = '';
      pwdForm.newPassword = '';
      pwdForm.confirmPassword = '';
      pwdFormRef.value.resetFields();
    } catch {
      // error handled by interceptor
    }
  });
};

const getThemeColors = (theme: ThemeName) => {
  const meta = themeMetas.find((m) => m.name === theme);
  return meta?.colors || ['#4f46e5', '#e0e7ff', '#1e293b'];
};

const getThemeGradient = (theme: ThemeName) => {
  const colors = getThemeColors(theme);
  return `linear-gradient(135deg, ${colors[1]} 0%, ${colors[0]} 100%)`;
};
</script>

<style scoped>
.page-container {
  padding: 24px;
  height: auto;
  display: block;
}

.profile-card,
.edit-card,
.password-card,
.appearance-card {
  margin-bottom: 24px;
}

.profile-card :deep(.el-card__body),
.edit-card :deep(.el-card__body),
.password-card :deep(.el-card__body),
.appearance-card :deep(.el-card__body) {
  padding: 28px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  padding: 8px 0;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 0;
}

.profile-meta h3 {
  margin: 0 0 6px;
  font-size: 20px;
  color: var(--text);
}

.profile-meta .muted {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
}

.profile-form {
  max-width: 520px;
}

.profile-form :deep(.el-form-item) {
  margin-bottom: 22px;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
  padding: 16px 0;
}

.avatar-uploader {
  display: inline-block;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 768px) {
  .theme-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .theme-grid {
    grid-template-columns: 1fr;
  }
}

.theme-card {
  cursor: pointer;
  border-radius: var(--glass-radius);
  border: 2px solid transparent;
  overflow: hidden;
  transition: border-color 0.2s ease, transform 0.2s ease;
  background: var(--surface);
}

.theme-card:hover {
  transform: translateY(-2px);
}

.theme-card.active {
  border-color: var(--primary);
}

.theme-preview {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.theme-dots {
  display: flex;
  gap: 8px;
  z-index: 1;
}

.dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.theme-name {
  padding: 12px;
  text-align: center;
  font-weight: 600;
  color: var(--text);
  font-size: 14px;
}
</style>