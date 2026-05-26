<template>
  <div class="space-y-4 max-w-2xl">
    <!-- User profile card -->
    <div class="card bg-base-100 shadow-sm border border-base-300">
      <div class="card-body p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div class="avatar placeholder">
          <div class="bg-neutral text-neutral-content w-16 rounded-full">
            <span class="text-2xl">{{ userInfo?.nickname?.charAt(0) || 'U' }}</span>
          </div>
        </div>
        <div>
          <h3 class="text-xl font-bold">{{ userInfo?.nickname || t('common.userFallback') }}</h3>
          <p class="text-sm text-base-content/60">{{ userInfo?.email || '-' }}</p>
        </div>
      </div>
    </div>

    <!-- Edit profile -->
    <div class="card bg-base-100 shadow-sm border border-base-300">
      <div class="card-body">
        <h3 class="card-title text-base font-semibold mb-4">{{ t('profile.editProfile') }}</h3>
        <form @submit.prevent="handleSave" class="space-y-3">
          <!-- Avatar upload -->
          <div class="flex items-center gap-4 mb-4">
            <div class="avatar">
              <div class="w-20 rounded-full bg-neutral text-neutral-content">
                <span class="text-2xl">{{ form.nickname?.charAt(0) || 'U' }}</span>
              </div>
            </div>
            <el-upload :show-file-list="false" :http-request="handleAvatarUpload">
              <button type="button" class="btn btn-sm btn-primary">{{ t('profile.uploadAvatar') }}</button>
            </el-upload>
          </div>

          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('system.user.username') }}</span></div>
            <input v-model="form.username" class="input input-bordered" disabled />
          </label>
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('profile.nickname') }}</span></div>
            <input v-model="form.nickname" class="input input-bordered" />
          </label>
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('profile.email') }}</span></div>
            <input v-model="form.email" type="email" class="input input-bordered" />
          </label>
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('profile.phone') }}</span></div>
            <input v-model="form.phone" class="input input-bordered" />
          </label>
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('profile.remark') }}</span></div>
            <textarea v-model="form.remark" class="textarea textarea-bordered" rows="2"></textarea>
          </label>
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('profile.department') }}</span></div>
            <input :value="profileData.deptName || '-'" class="input input-bordered" disabled />
          </label>
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('profile.roles') }}</span></div>
            <input :value="(profileData.roles || []).map((r: any) => r.name).join(', ') || '-'" class="input input-bordered" disabled />
          </label>
          <button type="submit" class="btn btn-primary self-start">{{ t('common.action.save') }}</button>
        </form>
      </div>
    </div>

    <!-- Change password -->
    <div class="card bg-base-100 shadow-sm border border-base-300">
      <div class="card-body">
        <h3 class="card-title text-base font-semibold mb-4">{{ t('profile.changePassword') }}</h3>
        <form @submit.prevent="handleChangePassword" class="space-y-3">
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('profile.oldPassword') }}</span></div>
            <input v-model="pwdForm.oldPassword" type="password" class="input input-bordered" autocomplete="current-password" />
          </label>
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('profile.newPassword') }}</span></div>
            <input v-model="pwdForm.newPassword" type="password" class="input input-bordered" autocomplete="new-password" />
          </label>
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('profile.confirmPassword') }}</span></div>
            <input v-model="pwdForm.confirmPassword" type="password" class="input input-bordered" autocomplete="new-password" />
          </label>
          <div v-if="pwdForm.confirmPassword && pwdForm.newPassword !== pwdForm.confirmPassword" class="text-error text-sm">⚠️ {{ t('profile.passwordMismatch') }}</div>
          <button type="submit" class="btn btn-primary self-start">{{ t('common.action.submit') }}</button>
        </form>
      </div>
    </div>

    <!-- Theme selector -->
    <div class="card bg-base-100 shadow-sm border border-base-300">
      <div class="card-body">
        <h3 class="card-title text-base font-semibold mb-4">{{ t('common.theme') }}</h3>
        <div class="flex items-center gap-3">
          <button
            class="btn btn-sm gap-2"
            :class="themeStore.currentTheme === 'light' ? 'btn-primary' : 'btn-ghost'"
            @click="themeStore.setTheme('light')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {{ t('theme.light') }}
          </button>
          <button
            class="btn btn-sm gap-2"
            :class="themeStore.currentTheme === 'dark' ? 'btn-primary' : 'btn-ghost'"
            @click="themeStore.setTheme('dark')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            {{ t('theme.dark') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/store/modules/user';
import { useThemeStore } from '@/store/theme';
import { profileApi, fileApi } from '@/api';
import type { UploadRequestOptions } from 'element-plus';

const { t } = useI18n();
const userStore = useUserStore();
const themeStore = useThemeStore();
const userInfo = computed(() => userStore.userInfo);

const form = reactive({ username: '', nickname: '', email: '', phone: '', avatar: '', remark: '' });
const profileData = ref<any>({});

const loadProfile = async () => {
  try {
    const res: any = await profileApi.getProfile();
    profileData.value = res;
    Object.assign(form, { username: res.username, nickname: res.nickname, email: res.email || '', phone: res.phone || '', avatar: res.avatar || '', remark: res.remark || '' });
  } catch { ElMessage.error(t('common.message.loadFailed')); }
};

const handleAvatarUpload = async (options: UploadRequestOptions) => {
  const fd = new FormData(); fd.append('file', options.file);
  try { const res: any = await fileApi.upload(fd); form.avatar = res.url; ElMessage.success(t('common.message.success')); }
  catch { ElMessage.error(t('common.message.failed')); }
};

const handleSave = async () => {
  try {
    await profileApi.updateProfile({ nickname: form.nickname, email: form.email || undefined, phone: form.phone || undefined, avatar: form.avatar, remark: form.remark || undefined });
    if (userStore.userInfo) { userStore.userInfo.nickname = form.nickname; userStore.userInfo.avatar = form.avatar; }
    ElMessage.success(t('profile.saveSuccess'));
  } catch { ElMessage.error(t('common.message.failed')); }
};

const pwdForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' });

const handleChangePassword = async () => {
  if (pwdForm.newPassword !== pwdForm.confirmPassword) { ElMessage.error(t('profile.passwordMismatch')); return; }
  try {
    await profileApi.updatePassword({ oldPassword: pwdForm.oldPassword, newPassword: pwdForm.newPassword });
    ElMessage.success(t('profile.passwordUpdateSuccess'));
    pwdForm.oldPassword = ''; pwdForm.newPassword = ''; pwdForm.confirmPassword = '';
  } catch { /* interceptor handles */ }
};

onMounted(() => loadProfile());
</script>