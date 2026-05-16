<template>
  <div class="page-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="18"><User /></el-icon>
          <span>{{ t('common.profile') }}</span>
        </div>
      </template>
      <div class="profile-info">
        <el-avatar :size="64" :src="userInfo?.avatar || ''">
          {{ userInfo?.nickname?.charAt(0) || 'U' }}
        </el-avatar>
        <div class="profile-meta">
          <h3>{{ userInfo?.nickname || t('common.userFallback') }}</h3>
          <p class="muted">{{ userInfo?.email || '-' }}</p>
        </div>
      </div>
    </el-card>

    <el-card class="appearance-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="18"><Brush /></el-icon>
          <span>{{ t('common.theme') }}</span>
        </div>
      </template>
      <div class="theme-grid">
        <div
          v-for="theme in themeOptions"
          :key="theme"
          class="theme-card"
          :class="{ active: themeStore.currentTheme === theme }"
          @click="themeStore.setTheme(theme)"
        >
          <div class="theme-preview" :style="{ background: getThemeGradient(theme) }">
            <div class="theme-dots">
              <span
                v-for="(color, idx) in getThemeColors(theme)"
                :key="idx"
                class="dot"
                :style="{ background: color }"
              />
            </div>
          </div>
          <div class="theme-name">{{ t(`theme.${theme}`) }}</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/store/modules/user';
import { useThemeStore } from '@/store/theme';
import { themeOptions, themeMetas, type ThemeName } from '@/utils/appearance';
import { User, Brush } from '@element-plus/icons-vue';

const { t } = useI18n();
const userStore = useUserStore();
const themeStore = useThemeStore();

const userInfo = computed(() => userStore.userInfo);

const getThemeColors = (theme: ThemeName) => {
  const meta = themeMetas.find((m) => m.name === theme);
  return meta?.colors || ['#4f46e5', '#e0e7ff', '#1e293b'];
};

const getThemeGradient = (theme: ThemeName) => {
  const colors = getThemeColors(theme);
  return `linear-gradient(135deg, ${colors[1]} 0%, ${colors[0]} 100%)`;
};
</script>

<style scoped>
.profile-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-meta h3 {
  margin: 0 0 4px;
  color: var(--text);
}

.profile-meta .muted {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 768px) {
  .theme-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .theme-grid {
    grid-template-columns: 1fr;
  }
}

.theme-card {
  cursor: pointer;
  border-radius: var(--glass-radius);
  border: 2px solid transparent;
  overflow: hidden;
  transition: border-color 0.2s ease, transform 0.2s ease;
  background: var(--surface);
}

.theme-card:hover {
  transform: translateY(-2px);
}

.theme-card.active {
  border-color: var(--primary);
}

.theme-preview {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.theme-dots {
  display: flex;
  gap: 8px;
  z-index: 1;
}

.dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.theme-name {
  padding: 12px;
  text-align: center;
  font-weight: 600;
  color: var(--text);
  font-size: 14px;
}
</style>