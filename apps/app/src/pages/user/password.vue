<template>
  <view class="password-container">
    <view class="form-section">
      <view class="form-item">
        <text class="form-label">Old Password</text>
        <input v-model="form.oldPassword" type="password" class="form-input" placeholder="Enter old password" />
      </view>
      <view class="form-item">
        <text class="form-label">New Password</text>
        <input v-model="form.newPassword" type="password" class="form-input" placeholder="Enter new password" />
      </view>
      <view class="form-item">
        <text class="form-label">Confirm Password</text>
        <input v-model="form.confirmPassword" type="password" class="form-input" placeholder="Confirm new password" />
      </view>
    </view>

    <view class="submit-btn">
      <button type="primary" @click="handleSubmit">Submit</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { userApi } from '../../api';

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const handleSubmit = async () => {
  if (!form.oldPassword) {
    uni.showToast({ title: 'Please enter old password', icon: 'none' });
    return;
  }
  if (!form.newPassword) {
    uni.showToast({ title: 'Please enter new password', icon: 'none' });
    return;
  }
  if (form.newPassword !== form.confirmPassword) {
    uni.showToast({ title: 'Passwords do not match', icon: 'none' });
    return;
  }
  if (form.newPassword.length < 6) {
    uni.showToast({ title: 'Password must be at least 6 characters', icon: 'none' });
    return;
  }

  try {
    await userApi.updatePassword({
      oldPassword: form.oldPassword,
      newPassword: form.newPassword,
    });
    uni.showToast({ title: 'Password changed successfully', icon: 'success' });
    setTimeout(() => {
      uni.navigateBack();
    }, 1000);
  } catch (e: any) {
    uni.showToast({ title: e.message || 'Change failed', icon: 'none' });
  }
};
</script>

<style scoped>
.password-container {
  padding: 30rpx;
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
  width: 280rpx;
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