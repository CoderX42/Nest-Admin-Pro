<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';

import { computed, onMounted, ref } from 'vue';

import { AuthenticationLogin, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { getCaptchaApi } from '#/api';
import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();

const captchaKey = ref('');
const captchaImg = ref('');
const loadingCaptcha = ref(false);

async function refreshCaptcha() {
  try {
    loadingCaptcha.value = true;
    const { key, img } = await getCaptchaApi();
    captchaKey.value = key;
    captchaImg.value = img;
  } finally {
    loadingCaptcha.value = false;
  }
}

onMounted(() => {
  refreshCaptcha();
});

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.usernameTip'),
      },
      defaultValue: 'admin',
      fieldName: 'username',
      label: $t('authentication.username'),
      rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.password'),
      },
      defaultValue: 'admin123',
      fieldName: 'password',
      label: $t('authentication.password'),
      rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: '请输入验证码',
      },
      defaultValue: '',
      fieldName: 'captchaText',
      label: '验证码',
      rules: z.string().min(1, { message: '请输入验证码' }),
    },
  ];
});

function handleLogin(values: Record<string, any>) {
  return authStore.authLogin({
    ...values,
    captchaKey: captchaKey.value,
  });
}
</script>

<template>
  <div>
    <AuthenticationLogin
      :form-schema="formSchema"
      :loading="authStore.loginLoading"
      @submit="handleLogin"
    />
    <div class="mt-2 flex items-center gap-2 pl-[120px]">
      <span class="text-sm text-gray-500">图形验证码：</span>
      <div
        class="flex h-10 w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded border border-gray-300 bg-white"
        @click="refreshCaptcha"
      >
        <div
          v-if="loadingCaptcha"
          class="text-xs text-gray-400"
        >
          加载中...
        </div>
        <div v-else-if="captchaImg" v-html="captchaImg" />
        <div
          v-else
          class="text-xs text-gray-400"
        >
          点击刷新
        </div>
      </div>
      <span class="text-xs text-gray-400">点击图片刷新</span>
    </div>
  </div>
</template>