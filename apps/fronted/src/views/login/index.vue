<template>
  <div class="login-container">
    <div class="login-preferences">
      <el-select v-model="currentTheme" size="small" style="width: 112px" :aria-label="t('common.theme')" @change="handleThemeChange">
        <el-option v-for="theme in themeOptions" :key="theme" :label="t(`theme.${theme}`)" :value="theme" />
      </el-select>
      <el-select v-model="currentLocale" size="small" style="width: 104px" :aria-label="t('common.language')" @change="handleLocaleChange">
        <el-option label="中文" value="zh-CN" />
        <el-option label="English" value="en-US" />
      </el-select>
    </div>

    <div class="login-box">
      <div class="login-header">
        <h1>{{ t('login.title') }}</h1>
        <p>{{ t('login.subtitle') }}</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            :placeholder="t('login.username')"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            :placeholder="t('login.password')"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item prop="captcha">
          <el-input
            v-model="form.captcha"
            :placeholder="t('login.captcha')"
            size="large"
            :prefix-icon="CircleCheck"
            style="width: 60%"
          />
          <div class="captcha-img" @click="refreshCaptcha">
            <img v-if="captchaData.img" :src="captchaData.img" alt="captcha" />
            <span v-else>{{ t('login.loadCaptcha') }}</span>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            style="width: 100%"
            @click="handleLogin"
          >
            {{ t('login.submit') }}
          </el-button>
        </el-form-item>

        <div class="login-tips">
          <span>{{ t('login.defaultUsername') }}</span>
          <span>{{ t('login.defaultPassword') }}</span>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../store/modules/user';
import { authApi } from '@/api';
import { ElMessage } from 'element-plus';
import { User, Lock, CircleCheck } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { setLocale, type Locale } from '@/i18n';
import { applyTheme, initTheme, themeOptions, type ThemeName } from '@/utils/appearance';

const router = useRouter();
const userStore = useUserStore();
const { t, locale } = useI18n();
const formRef = ref<FormInstance>();
const loading = ref(false);
const currentTheme = ref<ThemeName>(initTheme());
const currentLocale = ref<Locale>(locale.value as Locale);

const form = reactive({
  username: 'admin',
  password: 'admin123',
  captcha: '',
  captchaKey: '',
});

const captchaData = reactive({
  key: '',
  img: '',
});

const rules = computed(() => ({
  username: [{ required: true, message: t('login.usernameRequired'), trigger: 'blur' }],
  password: [{ required: true, message: t('login.passwordRequired'), trigger: 'blur' }],
  captcha: [{ required: true, message: t('login.captchaRequired'), trigger: 'blur' }],
}));

const refreshCaptcha = async () => {
  try {
    const res: any = await authApi.captcha();
    captchaData.key = res.key;
    captchaData.img = 'data:image/svg+xml;utf-8,' + encodeURIComponent(res.img);
    form.captchaKey = res.key;
  } catch (e) {
    ElMessage.error(t('login.captchaFailed'));
  }
};

const handleLogin = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    loading.value = true;
    try {
      await userStore.login(form.username, form.password);
      ElMessage.success(t('login.success'));
      router.push('/');
    } catch (e: any) {
      ElMessage.error(e.message || t('login.failed'));
      refreshCaptcha();
    } finally {
      loading.value = false;
    }
  });
};

const handleThemeChange = (theme: ThemeName) => {
  applyTheme(theme);
};

const handleLocaleChange = (value: Locale) => {
  setLocale(value);
  currentLocale.value = value;
};

onMounted(() => {
  refreshCaptcha();
});
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--primary), transparent 8%) 0%, var(--app-bg) 100%);
  position: relative;
}

.login-preferences {
  position: fixed;
  top: 18px;
  right: 18px;
  display: flex;
  gap: 10px;
  z-index: 10;
}

.login-box {
  width: 400px;
  padding: 40px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: var(--shadow-md);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  font-size: 28px;
  color: var(--text);
  margin-bottom: 8px;
}

.login-header p {
  font-size: 14px;
  color: var(--muted);
}

.login-form {
  margin-top: 20px;
}

.captcha-img {
  width: 35%;
  height: 40px;
  margin-left: 10px;
  cursor: pointer;
  border: 1px solid var(--border);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--muted);
  overflow: hidden;
}

.captcha-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.login-tips {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--muted);
  margin-top: 10px;
}
</style>
