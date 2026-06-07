<template>
  <div class="min-h-screen bg-base-200 flex items-center justify-center px-4 py-8">
    <!-- Preferences -->
    <div class="fixed top-4 right-4 flex gap-2 z-10">
      <button
        class="btn btn-sm btn-ghost btn-square"
        @click="toggleTheme"
        :title="currentTheme === 'light' ? t('theme.dark') : t('theme.light')"
      >
        <svg v-if="currentTheme === 'light'" xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </button>
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-sm btn-ghost gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A8.001 8.001 0 0116.953 9H15m2 4h.01M21 12a9 9 0 00-2.636-6.364M12 12V3" /></svg>
          <span class="text-xs">{{ currentLocale === 'zh-CN' ? '中文' : 'EN' }}</span>
        </div>
        <ul tabindex="0" class="dropdown-content z-[1] menu menu-sm p-1 shadow-lg bg-base-100 rounded-box w-28 border border-base-300 mt-1">
          <li><a :class="{ 'active': currentLocale === 'zh-CN' }" @click="handleLocaleChange('zh-CN')" class="rounded-lg text-sm">中文</a></li>
          <li><a :class="{ 'active': currentLocale === 'en-US' }" @click="handleLocaleChange('en-US')" class="rounded-lg text-sm">English</a></li>
        </ul>
      </div>
    </div>

    <!-- Login card -->
    <div class="card w-full max-w-md bg-base-100 shadow-xl border border-base-300 rounded-2xl overflow-hidden">
      <!-- Header band -->
      <div class="h-1.5 bg-gradient-to-r from-primary via-secondary to-accent"></div>
      <div class="card-body p-8">
        <!-- Logo & title -->
        <div class="text-center mb-8">
          <div class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">🌼</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight">{{ t('login.title') }}</h1>
          <p class="text-sm text-base-content/50 mt-1.5">{{ t('login.subtitle') }}</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Username -->
          <div class="form-control">
            <label class="label py-1.5"><span class="label-text text-xs font-medium text-base-content/60">{{ t('login.username') }}</span></label>
            <div class="relative">
              <input
                v-model="form.username"
                type="text"
                :placeholder="t('login.username')"
                class="input input-bordered w-full pl-10 h-11 text-sm"
                autocomplete="username"
                required
              />
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
          </div>

          <!-- Password -->
          <div class="form-control">
            <label class="label py-1.5"><span class="label-text text-xs font-medium text-base-content/60">{{ t('login.password') }}</span></label>
            <div class="relative">
              <input
                v-model="form.password"
                type="password"
                :placeholder="t('login.password')"
                class="input input-bordered w-full pl-10 h-11 text-sm"
                autocomplete="current-password"
                required
              />
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
          </div>

          <!-- Captcha -->
          <div class="form-control">
            <label class="label py-1.5"><span class="label-text text-xs font-medium text-base-content/60">{{ t('login.captcha') }}</span></label>
            <div class="flex gap-3">
              <div class="relative flex-1">
                <input
                  v-model="form.captcha"
                  type="text"
                  :placeholder="t('login.captcha')"
                  class="input input-bordered w-full pl-10 h-11 text-sm"
                  autocomplete="off"
                  required
                />
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div
                class="captcha-btn"
                @click="refreshCaptcha"
                role="button"
                tabindex="0"
                :title="t('login.refreshCaptcha')"
              >
                <img v-if="captchaData.img" :src="captchaData.img" :alt="t('login.captcha')" class="w-full h-full" />
                <span v-else class="text-xs text-base-content/40">{{ t('login.loadCaptcha') }}</span>
              </div>
            </div>
          </div>

          <!-- Remember me -->
          <label class="flex items-center gap-2 text-xs text-base-content/60">
            <input v-model="form.rememberMe" type="checkbox" class="checkbox checkbox-sm" />
            <span>{{ t('login.rememberMe') }}</span>
          </label>

          <!-- Submit -->
          <button type="submit" class="btn btn-primary w-full h-11 text-sm font-semibold gap-2" :class="{ loading: loading }">
            <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V16z" /></svg>
            <span v-if="!loading">{{ t('login.submit') }}</span>
          </button>
        </form>

        <!-- Hint -->
        <div class="mt-6 pt-4 border-t border-base-200 flex justify-between text-xs text-base-content/40">
          <span>{{ t('login.defaultUsername') }}</span>
          <span>{{ t('login.defaultPassword') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStorage } from '@vueuse/core';
import { useUserStore } from '@/store/modules/user';
import { authApi } from '@/api/auth';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { setLocale, type Locale } from '@/i18n';
import { initTheme, type ThemeName } from '@/utils/appearance';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const { t, locale } = useI18n();

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

const refreshCaptcha = async () => {
  try {
    const res = await authApi.captcha();
    const svg = res.img ?? res.svg ?? '';
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
  const data = 'data' in error ? error.data : 'response' in error ? error.response : undefined;
  if (typeof data !== 'object' || data === null) return undefined;
  if ('code' in data && typeof data.code === 'number') return data.code;
  if ('data' in data && typeof data.data === 'object' && data.data && 'code' in data.data) {
    const code = data.data.code;
    return typeof code === 'number' ? code : undefined;
  }
  return undefined;
}

function getErrorMessage(error: unknown) {
  if (typeof error !== 'object' || error === null) return t('login.failed');
  if ('message' in error && typeof error.message === 'string') return error.message;
  const data = 'data' in error ? error.data : undefined;
  if (typeof data === 'object' && data && 'message' in data && typeof data.message === 'string') {
    return data.message;
  }
  return t('login.failed');
}

function shouldRefreshCaptcha(error: unknown) {
  const code = getErrorCode(error);
  if (code === 1001 || code === 1002 || code === 1003) return true;
  return getErrorMessage(error).toLowerCase().includes('captcha');
}

const handleLogin = async () => {
  if (!form.username) { ElMessage.warning(t('login.usernameRequired')); return; }
  if (!form.password) { ElMessage.warning(t('login.passwordRequired')); return; }
  if (!form.captcha) { ElMessage.warning(t('login.captchaRequired')); return; }

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

const handleLocaleChange = (val: Locale) => { setLocale(val); currentLocale.value = val; };

onMounted(() => refreshCaptcha());
</script>

<style scoped>
.captcha-btn {
  width: 110px;
  height: 44px;
  border: 1px solid oklch(from var(--color-base-300) l c h / 0.5);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s, transform 0.1s;
  flex-shrink: 0;
}
.captcha-btn:hover { border-color: var(--color-primary); transform: scale(1.02); }
.captcha-btn img { width: 100%; height: 100%; object-fit: cover; }
</style>
