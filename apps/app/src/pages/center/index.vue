<template>
  <view class="center-container">
    <!-- User Info Card -->
    <view class="user-card">
      <view class="avatar-container" @click="chooseAvatar">
        <image v-if="userInfo?.avatar" :src="userInfo.avatar" class="avatar" mode="aspectFill" />
        <view v-else class="avatar-placeholder">{{ userInfo?.nickname?.charAt(0) || 'U' }}</view>
      </view>
      <view class="user-info">
        <text class="nickname">{{ userInfo?.nickname || 'User' }}</text>
        <text class="username">@{{ userInfo?.username }}</text>
      </view>
    </view>

    <!-- Menu List -->
    <view class="menu-list">
      <view class="menu-item" @click="goToProfile">
        <text class="menu-label">Personal Info</text>
        <text class="menu-arrow">></text>
      </view>
      <view class="menu-item" @click="goToPassword">
        <text class="menu-label">Change Password</text>
        <text class="menu-arrow">></text>
      </view>
      <view class="menu-item" @click="handleLogout">
        <text class="menu-label logout">Logout</text>
        <text class="menu-arrow">></text>
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

const chooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const tempPath = res.tempFilePaths[0];
      try {
        const result: any = await (await import('@/api')).userApi.uploadAvatar(tempPath);
        uni.showToast({ title: 'Avatar updated', icon: 'success' });
      } catch (e) {
        uni.showToast({ title: 'Upload failed', icon: 'none' });
      }
    },
  });
};

const goToProfile = () => {
  uni.navigateTo({ url: '/pages/user/profile' });
};

const goToPassword = () => {
  uni.navigateTo({ url: '/pages/user/password' });
};

const handleLogout = async () => {
  await userStore.logout();
  uni.showToast({ title: 'Logged out', icon: 'success' });
  setTimeout(() => {
    uni.reLaunch({ url: '/pages/login/index' });
  }, 500);
};
</script>

<style scoped>
.center-container {
  padding: 30rpx;
}

.user-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  display: flex;
  align-items: center;
  gap: 30rpx;
  margin-bottom: 40rpx;
}

.avatar-container {
  width: 140rpx;
  height: 140rpx;
}

.avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.5);
}

.avatar-placeholder {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60rpx;
  color: #fff;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.nickname {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.username {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.menu-list {
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 30rpx;
  border-bottom: 1px solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-label {
  font-size: 30rpx;
  color: #333;
}

.menu-label.logout {
  color: #f56c6c;
}

.menu-arrow {
  color: #999;
  font-size: 28rpx;
}
</style>
