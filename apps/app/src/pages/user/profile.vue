<template>
  <view class="profile-container">
    <view class="avatar-section" @click="handleChooseAvatar">
      <image v-if="form.avatar" :src="form.avatar" class="avatar-img" mode="aspectFill" />
      <view v-else class="avatar-placeholder">{{ form.nickname?.charAt(0) || 'U' }}</view>
      <text class="avatar-tip">Click to change avatar</text>
    </view>

    <view class="form-section">
      <view class="form-item">
        <text class="form-label">Username</text>
        <input v-model="form.username" disabled class="form-input" />
      </view>
      <view class="form-item">
        <text class="form-label">Nickname</text>
        <input v-model="form.nickname" class="form-input" placeholder="Enter nickname" />
      </view>
      <view class="form-item">
        <text class="form-label">Email</text>
        <input v-model="form.email" class="form-input" placeholder="Enter email" />
      </view>
      <view class="form-item">
        <text class="form-label">Phone</text>
        <input v-model="form.phone" class="form-input" placeholder="Enter phone" />
      </view>
      <view class="form-item">
        <text class="form-label">Remark</text>
        <input v-model="form.remark" class="form-input" placeholder="Enter remark" />
      </view>
    </view>

    <view class="submit-btn">
      <button type="primary" @click="handleSubmit">Save</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { userApi } from '../../api';
import { useUserStore } from '../../stores/user';

const userStore = useUserStore();

const form = reactive({
  username: '',
  nickname: '',
  email: '',
  phone: '',
  avatar: '',
  remark: '',
});

onShow(async () => {
  try {
    const res: any = await userApi.getProfile();
    Object.assign(form, res);
  } catch (e) {
    console.error('Failed to load profile', e);
  }
});

const handleChooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const tempPath = res.tempFilePaths[0];
      try {
        const result: any = await userApi.uploadAvatar(tempPath);
        form.avatar = result.url;
        uni.showToast({ title: 'Avatar updated', icon: 'success' });
      } catch (e) {
        uni.showToast({ title: 'Upload failed', icon: 'none' });
      }
    },
  });
};

const handleSubmit = async () => {
  try {
    await userApi.updateProfile(form);
    if (userStore.userInfo) {
      userStore.userInfo.nickname = form.nickname;
      userStore.userInfo.avatar = form.avatar;
    }
    uni.showToast({ title: 'Saved successfully', icon: 'success' });
  } catch (e: any) {
    uni.showToast({ title: e.message || 'Save failed', icon: 'none' });
  }
};
</script>

<style scoped>
.profile-container {
  padding: 30rpx;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24rpx;
  margin-bottom: 40rpx;
}

.avatar-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.5);
}

.avatar-placeholder {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64rpx;
  color: #fff;
}

.avatar-tip {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 20rpx;
}

.form-section {
  background: #fff;
  border-radius: 24rpx;
  padding: 20rpx 30rpx;
  margin-bottom: 40rpx;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1px solid #f0f0f0;
}

.form-item:last-child {
  border-bottom: none;
}

.form-label {
  width: 160rpx;
  font-size: 28rpx;
  color: #333;
}

.form-input {
  flex: 1;
  font-size: 28rpx;
  color: #666;
}

.submit-btn button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 12rpx;
  height: 88rpx;
  font-size: 32rpx;
}
</style>