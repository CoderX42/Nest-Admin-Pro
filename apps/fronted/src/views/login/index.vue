<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="login-logo">
          <el-icon :size="32"><Box /></el-icon>
        </div>
        <h1 class="login-title">{{ t('login.title') }}</h1>
        <p class="login-subtitle">{{ t('login.subtitle') }}</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        size="large"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            :placeholder="t('login.username')"
            :prefix-icon="User"
            autocomplete="username"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            :placeholder="t('login.password')"
            :prefix-icon="Lock"
            show-password
            autocomplete="current-password"
          />
        </el-form-item>

        <el-form-item prop="captcha">
          <div class="captcha-row">
            <el-input
              v-model="form.captcha"
              :placeholder="t('login.captcha')"
              :prefix-icon="Key"
              autocomplete="off"
              class="captcha-input"
            />
            <div
              class="captcha-img"
              role="button"
              tabindex="0"
              :title="t('login.refreshCaptcha')"
              @click="refreshCaptcha"
            >
              <img v-if="captchaData.img" :src="captchaData.img" :alt="t('login.captcha')" />
              <span v-else class="captcha-loading">{{ t('login.loadCaptcha') }}</span>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="form.rememberMe">{{ t('login.rememberMe') }}</el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            class="login-submit"
            :loading="loading"
            @click="handleLogin"
          >
            {{ t('login.submit') }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-tips">
        <span>{{ t('login.defaultUsername') }}</span>
        <span class="login-tips-divider">/</span>
        <span>{{ t('login.defaultPassword') }}</span>
      </div>
    </div>

    <div class="login-actions">
      <el-tooltip
        :content="currentTheme === 'light' ? t('theme.dark') : t('theme.light')"
        placement="bottom"
      >
        <el-icon :size="18" class="login-icon" @click="toggleTheme">
          <Moon v-if="currentTheme === 'light'" />
          <Sunny v-else />
        </el-icon>
      </el-tooltip>

      <el-dropdown trigger="click" @command="handleLocaleChange">
        <span class="login-action">
          <el-icon :size="18"><Position /></el-icon>
          <span>{{ currentLocale === 'zh-CN' ? '中文' : 'EN' }}</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="zh-CN" :disabled="currentLocale === 'zh-CN'">中文</el-dropdown-item>
            <el-dropdown-item command="en-US" :disabled="currentLocale === 'en-US'">English</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStorage } from '@vueuse/core';
import { useUserStore } from '@/store/modules/user';
import { authApi } from '@/api/auth';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { setLocale, type Locale } from '@/i18n';
import { initTheme, type ThemeName } from '@/utils/appearance';
import { User, Lock, Key, Box, Moon, Sunny, Position } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const { t, locale } = useI18n();

const formRef = ref<FormInstance>();
const loading = ref(false);
const currentTheme = ref<ThemeName>(initTheme() as ThemeName);
const currentLocale = ref<Locale>(locale.value as Locale);
const rememberedUsername = useStorage('nap_login_username', 'admin');

const form = reactive({
  username: rememberedUsername.value || 'admin',
  password: 'admin123',
  captcha: '',
  captchaKey: '',
  rememberMe: Boolean(rememberedUsername.value),
});
const captchaData = reactive({ key: '', img: '' });

const rules = computed<FormRules>(() => ({
  username: [{ required: true, message: t('login.usernameRequired'), trigger: 'blur' }],
  password: [{ required: true, message: t('login.passwordRequired'), trigger: 'blur' }],
  captcha: [{ required: true, message: t('login.captchaRequired'), trigger: 'blur' }],
}));

const refreshCaptcha = async () => {
  try {
    const res = await authApi.captcha();
    const svg = (res as { img?: string; svg?: string }).img ?? (res as { svg?: string }).svg ?? '';
    captchaData.key = res.key;
    captchaData.img = svg.startsWith('data:') ? svg : `data:image/svg+xml;utf-8,${encodeURIComponent(svg)}`;
    form.captchaKey = res.key;
    form.captcha = '';
  } catch {
    ElMessage.error(t('login.captchaFailed'));
  }
};

function getErrorCode(error: unknown) {
  if (typeof error !== 'object' || error === null) return undefined;
  const data = 'data' in error ? (error as { data?: unknown }).data : 'response' in error ? (error as { response?: unknown }).response : undefined;
  if (typeof data !== 'object' || data === null) return undefined;
  if ('code' in data && typeof (data as { code?: unknown }).code === 'number') return (data as { code: number }).code;
  if ('data' in data) {
    const inner = (data as { data?: unknown }).data;
    if (typeof inner === 'object' && inner && 'code' in inner) {
      const code = (inner as { code?: unknown }).code;
      return typeof code === 'number' ? code : undefined;
    }
  }
  return undefined;
}

function getErrorMessage(error: unknown) {
  if (typeof error !== 'object' || error === null) return t('login.failed');
  if ('message' in error && typeof (error as { message?: unknown }).message === 'string') return (error as { message: string }).message;
  const data = 'data' in error ? (error as { data?: unknown }).data : undefined;
  if (typeof data === 'object' && data && 'message' in data && typeof (data as { message?: unknown }).message === 'string') {
    return (data as { message: string }).message;
  }
  return t('login.failed');
}

function shouldRefreshCaptcha(error: unknown) {
  const code = getErrorCode(error);
  if (code === 1001 || code === 1002 || code === 1003) return true;
  return getErrorMessage(error).toLowerCase().includes('captcha');
}

const handleLogin = async () => {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    await userStore.login(
      {
        username: form.username,
        password: form.password,
        captchaKey: form.captchaKey,
        captchaText: form.captcha,
      },
      router,
    );
    rememberedUsername.value = form.rememberMe ? form.username : '';
    ElMessage.success(t('login.success'));
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/';
    await router.push(redirect);
  } catch (error) {
    ElMessage.error(getErrorMessage(error));
    if (shouldRefreshCaptcha(error)) {
      await refreshCaptcha();
    }
  } finally {
    loading.value = false;
  }
};

const toggleTheme = () => {
  const next: ThemeName = currentTheme.value === 'light' ? 'dark' : 'light';
  currentTheme.value = next;
  document.documentElement.dataset.theme = next;
  localStorage.setItem('theme', next);
};

const handleLocaleChange = (val: Locale) => {
  setLocale(val);
  currentLocale.value = val;
};

onMounted(() => refreshCaptcha());
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2c3e50 0%, #4a6b8a 100%);
  padding: 20px;
  position: relative;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 12px;
  padding: 40px 36px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-logo {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 6px;
}

.login-subtitle {
  font-size: 13px;
  color: #909399;
  margin: 0;
}

.captcha-row {
  display: flex;
  gap: 12px;
  width: 100%;
}

.captcha-input {
  flex: 1;
}

.captcha-img {
  width: 120px;
  height: 40px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  flex-shrink: 0;
  background: #f5f7fa;
  transition: border-color 0.2s;
}

.captcha-img:hover {
  border-color: var(--el-color-primary);
}

.captcha-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.captcha-loading {
  font-size: 12px;
  color: #909399;
}

.login-submit {
  width: 100%;
  height: 42px;
  font-size: 15px;
}

.login-tips {
  margin-top: 24px;
  text-align: center;
  font-size: 12px;
  color: #909399;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.login-tips-divider {
  color: #c0c4cc;
}

.login-actions {
  position: fixed;
  top: 20px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: #fff;
}

.login-icon {
  cursor: pointer;
  opacity: 0.85;
  transition: opacity 0.2s;
}

.login-icon:hover {
  opacity: 1;
}

.login-action {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  opacity: 0.85;
  font-size: 13px;
  outline: none;
}

.login-action:hover {
  opacity: 1;
}
</style>
