<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>Nest-Admin-Pro</h1>
        <p>全栈快速开发框架</p>
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
            placeholder="Username"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="Password"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item prop="captcha">
          <el-input
            v-model="form.captcha"
            placeholder="Captcha"
            size="large"
            :prefix-icon="CircleCheck"
            style="width: 60%"
          />
          <div class="captcha-img" @click="refreshCaptcha">
            <img v-if="captchaData.img" :src="captchaData.img" alt="captcha" />
            <span v-else>Click to load</span>
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
            Login
          </el-button>
        </el-form-item>

        <div class="login-tips">
          <span>Username: admin</span>
          <span>Password: admin123</span>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../store/modules/user';
import { authApi } from '@/api';
import { ElMessage } from 'element-plus';
import { User, Lock, CircleCheck } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();
const formRef = ref<FormInstance>();
const loading = ref(false);

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

const rules = {
  username: [{ required: true, message: 'Please enter username', trigger: 'blur' }],
  password: [{ required: true, message: 'Please enter password', trigger: 'blur' }],
  captcha: [{ required: true, message: 'Please enter captcha', trigger: 'blur' }],
};

const refreshCaptcha = async () => {
  try {
    const res: any = await authApi.captcha();
    captchaData.key = res.key;
    captchaData.img = res.img;
  } catch (e) {
    ElMessage.error('Failed to load captcha');
  }
};

const handleLogin = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    loading.value = true;
    try {
      await userStore.login(form.username, form.password);
      ElMessage.success('Login successful');
      router.push('/');
    } catch (e: any) {
      ElMessage.error(e.message || 'Login failed');
      refreshCaptcha();
    } finally {
      loading.value = false;
    }
  });
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  font-size: 28px;
  color: #333;
  margin-bottom: 8px;
}

.login-header p {
  font-size: 14px;
  color: #999;
}

.login-form {
  margin-top: 20px;
}

.captcha-img {
  width: 35%;
  height: 40px;
  margin-left: 10px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #999;
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
  color: #999;
  margin-top: 10px;
}
</style>