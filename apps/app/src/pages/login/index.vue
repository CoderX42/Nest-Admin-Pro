<template>
  <view class="login-container">
    <view class="login-box">
      <view class="login-header">
        <image src="/static/logo.png" class="logo" mode="aspectFit" />
        <text class="title">Nest-Admin-Pro</text>
        <text class="subtitle">全栈快速开发框架</text>
      </view>

      <view class="login-form">
        <input v-model="form.username" placeholder="Username" class="input" />
        <input v-model="form.password" type="password" placeholder="Password" class="input" />
        <view v-if="showCaptcha" class="captcha-row">
          <input v-model="form.captcha" placeholder="Captcha" class="input captcha-input" />
          <image v-if="captcha.img" :src="captcha.img" class="captcha-img" @click="refreshCaptcha" />
        </view>
        <button class="login-btn" @click="handleLogin">Login</button>
        <view class="login-tips">
          <text>Username: admin</text>
          <text>Password: admin123</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { authApi } from '../../api/auth';
import { useUserStore } from '../../stores/user';

const userStore = useUserStore();

const form = reactive({
  username: 'admin',
  password: 'admin123',
  captcha: '',
});

const captcha = reactive({
  key: '',
  img: '',
});

const showCaptcha = ref(false);

// #ifdef H5
showCaptcha.value = true;
// #endif

const refreshCaptcha = async () => {
  if (!showCaptcha.value) return;
  try {
    const res = await authApi.captcha();
    const svg = res.img ?? res.svg ?? '';
    captcha.key = res.key;
    captcha.img = svg.startsWith('data:') ? svg : `data:image/svg+xml;utf-8,${encodeURIComponent(svg)}`;
    form.captcha = '';
  } catch (e) {
    console.error('Failed to load captcha', e);
  }
};

const handleLogin = async () => {
  if (!form.username || !form.password) {
    uni.showToast({ title: 'Please enter username and password', icon: 'none' });
    return;
  }
  if (showCaptcha.value && !form.captcha) {
    uni.showToast({ title: 'Please enter captcha', icon: 'none' });
    return;
  }
  try {
    const res: any = await authApi.login({
      username: form.username,
      password: form.password,
      captchaKey: showCaptcha.value ? captcha.key : undefined,
      captchaText: showCaptcha.value ? form.captcha : undefined,
    });
    userStore.setToken(res.token);
    const info: any = await authApi.getUserInfo();
    userStore.setUserInfo(info.user);
    uni.showToast({ title: 'Login successful', icon: 'success' });
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/index/index' });
    }, 500);
  } catch (e: any) {
    uni.showToast({ title: e.message || 'Login failed', icon: 'none' });
    refreshCaptcha();
  }
};

refreshCaptcha();
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.login-box {
  width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 60rpx;
}

.logo {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 20rpx;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.subtitle {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-top: 10rpx;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.input {
  height: 88rpx;
  border: 1px solid #dcdfe6;
  border-radius: 12rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
}

.captcha-row {
  display: flex;
  gap: 20rpx;
  align-items: center;
}

.captcha-input {
  flex: 1;
}

.captcha-img {
  width: 200rpx;
  height: 80rpx;
  border: 1px solid #dcdfe6;
  border-radius: 12rpx;
}

.login-btn {
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 12rpx;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-tips {
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
  color: #999;
}
</style>
