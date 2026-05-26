<template>
  <div class="min-h-screen bg-base-200 flex items-center justify-center px-4">
    <!-- Preferences -->
    <div class="fixed top-4 right-4 flex gap-2 z-10">
      <select class="select select-sm select-bordered w-28" v-model="currentTheme" @change="handleThemeChange">
        <option v-for="theme in themeOptions" :key="theme" :value="theme">{{ t(`theme.${theme}`) }}</option>
      </select>
      <select class="select select-sm select-bordered w-24" v-model="currentLocale" @change="handleLocaleChange">
        <option value="zh-CN">中文</option>
        <option value="en-US">EN</option>
      </select>
    </div>

    <!-- Login card -->
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="text-center mb-6">
          <h1 class="text-3xl font-bold text-primary">{{ t('login.title') }}</h1>
          <p class="text-sm text-base-content/60 mt-1">{{ t('login.subtitle') }}</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Username -->
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('login.username') }}</span></div>
            <input v-model="form.username" type="text" :placeholder="t('login.username')" class="input input-bordered w-full" autocomplete="username" />
          </label>

          <!-- Password -->
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('login.password') }}</span></div>
            <input v-model="form.password" type="password" :placeholder="t('login.password')" class="input input-bordered w-full" autocomplete="current-password" />
          </label>

          <!-- Captcha -->
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('login.captcha') }}</span></div>
            <div class="flex gap-3">
              <input v-model="form.captcha" type="text" :placeholder="t('login.captcha')" class="input input-bordered flex-1" autocomplete="off" />
              <div class="captcha-btn self-center" @click="refreshCaptcha" role="button" tabindex="0">
                <img v-if="captchaData.img" :src="captchaData.img" alt="captcha" class="h-10 rounded-lg" />
                <span v-else class="text-xs text-base-content/40">{{ t('login.loadCaptcha') }}</span>
              </div>
            </div>
          </label>

          <!-- Submit -->
          <button type="submit" class="btn btn-primary w-full" :class="{ loading: loading }">
            <span v-if="!loading">{{ t('login.submit') }}</span>
          </button>
        </form>

        <!-- Default credentials hint -->
        <div class="mt-4 text-sm text-base-content/50 flex justify-between">
          <span>{{ t('login.defaultUsername') }}</span>
          <span>{{ t('login.defaultPassword') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../store/modules/user';
import { authApi } from '@/api';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { setLocale, type Locale } from '@/i18n';
import { themeOptions, type ThemeName } from '@/utils/appearance';

const router = useRouter();
const userStore = useUserStore();
const { t, locale } = useI18n();

const loading = ref(false);
const currentTheme = ref<ThemeName>('emerald');
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

const refreshCaptcha = async () => {
  try {
    const res: any = await authApi.captcha();
    captchaData.key = res.key;
    captchaData.img = 'data:image/svg+xml;utf-8,' + encodeURIComponent(res.img);
    form.captchaKey = res.key;
  } catch {
    ElMessage.error(t('login.captchaFailed'));
  }
};

const handleLogin = async () => {
  if (!form.username || !form.password) {
    ElMessage.warning(t('login.usernameRequired'));
    return;
  }

  loading.value = true;
  try {
    await userStore.login({
      username: form.username,
      password: form.password,
      captchaKey: form.captchaKey,
      captchaText: form.captcha,
    });
    ElMessage.success(t('login.success'));
    router.push('/');
  } catch (e: any) {
    ElMessage.error(e.message || t('login.failed'));
    refreshCaptcha();
  } finally {
    loading.value = false;
  }
};

const handleThemeChange = () => {
  document.documentElement.dataset.theme = currentTheme.value;
  localStorage.setItem('theme', currentTheme.value);
};

const handleLocaleChange = () => {
  setLocale(currentLocale.value);
};

onMounted(() => {
  refreshCaptcha();
});
</script>

<style scoped>
.captcha-btn {
  width: 100px;
  height: 40px;
  border: 1px solid oklch(from var(--color-base-300) l c h / 0.5);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s;
}

.captcha-btn:hover {
  border-color: var(--color-primary);
}

.captcha-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>