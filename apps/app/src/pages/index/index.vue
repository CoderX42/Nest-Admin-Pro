<template>
  <view class="container">
    <!-- Header -->
    <view class="header">
      <view class="user-info" @click="goToCenter">
        <image v-if="userInfo?.avatar" :src="userInfo.avatar" class="avatar" mode="aspectFill" />
        <view v-else class="avatar-placeholder">{{ userInfo?.nickname?.charAt(0) || 'U' }}</view>
        <view class="user-detail">
          <text class="nickname">{{ userInfo?.nickname || 'Not logged in' }}</text>
          <text class="roles">{{ userInfo?.roles?.join(', ') || 'Click to login' }}</text>
        </view>
      </view>
    </view>

    <!-- Notice -->
    <view class="notice-card">
      <text class="notice-title">System Notice</text>
      <text class="notice-content">Welcome to Nest-Admin-Pro</text>
    </view>

    <!-- Quick Actions -->
    <view class="quick-actions">
      <view class="action-item" v-for="action in actions" :key="action.label" @click="action.handler">
        <view class="action-icon">{{ action.icon }}</view>
        <text class="action-label">{{ action.label }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const userInfo = computed(() => userStore.userInfo);

onShow(async () => {
  if (userStore.token && !userStore.userInfo) {
    await userStore.getUserInfo();
  }
});

const goToCenter = () => {
  if (userStore.token) {
    uni.switchTab({ url: '/pages/center/index' });
  } else {
    uni.reLaunch({ url: '/pages/login/index' });
  }
};

const actions = [
  { icon: '👤', label: 'User Center', handler: () => goToCenter() },
  { icon: '📋', label: 'My Tasks', handler: () => uni.showToast({ title: 'Coming soon', icon: 'none' }) },
  { icon: '⚙️', label: 'Settings', handler: () => uni.showToast({ title: 'Coming soon', icon: 'none' }) },
];
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f0f2f5;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 30rpx 100rpx;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 30rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.5);
}

.avatar-placeholder {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  color: #fff;
}

.user-detail {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.nickname {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.roles {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.notice-card {
  margin: -60rpx 30rpx 30rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.notice-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 15rpx;
}

.notice-content {
  font-size: 26rpx;
  color: #666;
}

.quick-actions {
  margin: 0 30rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  display: flex;
  justify-content: space-around;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15rpx;
}

.action-icon {
  font-size: 48rpx;
}

.action-label {
  font-size: 24rpx;
  color: #666;
}
</style>
