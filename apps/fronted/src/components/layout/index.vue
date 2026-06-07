<template>
  <el-container class="layout-container">
    <!-- Sidebar -->
    <el-aside :width="isCollapsed ? '64px' : '220px'" class="layout-aside">
      <div class="logo-container">
        <div class="logo-icon">N</div>
        <span v-if="!isCollapsed" class="logo-text">{{ t('app.name') }}</span>
      </div>
      <el-scrollbar class="sidebar-scroll">
        <SidebarMenu :menus="menus" :collapsed="isCollapsed" :active-menu="activeMenu" />
      </el-scrollbar>
    </el-aside>

    <el-container>
      <!-- Header -->
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon :size="20" class="collapse-btn" @click="isCollapsed = !isCollapsed">
            <Expand v-if="isCollapsed" />
            <Fold v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">{{ t('common.home') }}</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentTitle">{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <!-- Theme Toggle -->
          <el-tooltip
            :content="currentTheme === 'light' ? t('theme.dark') : t('theme.light')"
            placement="bottom"
          >
            <el-icon :size="18" class="header-icon" @click="themeStore.toggleTheme()">
              <Moon v-if="currentTheme === 'light'" />
              <Sunny v-else />
            </el-icon>
          </el-tooltip>

          <!-- Language -->
          <el-dropdown trigger="click" @command="handleLocaleChange">
            <span class="header-action">
              <el-icon :size="18"><Globe /></el-icon>
              <span class="header-action-text">{{ currentLocale === 'zh-CN' ? '中文' : 'EN' }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="zh-CN" :disabled="currentLocale === 'zh-CN'">中文</el-dropdown-item>
                <el-dropdown-item command="en-US" :disabled="currentLocale === 'en-US'">English</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- User -->
          <el-dropdown trigger="click" @command="handleUserCommand">
            <span class="user-dropdown">
              <el-avatar :size="32" :src="userInfo?.avatar || ''">
                {{ userInfo?.nickname?.charAt(0) || 'U' }}
              </el-avatar>
              <span class="username">{{ userInfo?.nickname || t('common.userFallback') }}</span>
              <el-icon :size="12"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>{{ t('common.profile') }}
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>{{ t('common.logout') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- Main Content -->
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../../store/modules/user';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { setLocale, type Locale } from '@/i18n';
import { useThemeStore } from '@/store/theme';
import { Fold, Expand, Moon, Sunny, ArrowDown, User, SwitchButton } from '@element-plus/icons-vue';
import SidebarMenu from './SidebarMenu.vue';

// Inline Globe icon (Element Plus has no built-in globe)
const Globe = {
  name: 'Globe',
  render() {
    return h(
      'svg',
      { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' },
      [
        h('circle', { cx: '12', cy: '12', r: '10' }),
        h('line', { x1: '2', y1: '12', x2: '22', y2: '12' }),
        h('path', { d: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' }),
      ],
    );
  },
};

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const { t, tm, locale } = useI18n();

const isCollapsed = ref(false);
const themeStore = useThemeStore();
const currentTheme = computed(() => themeStore.currentTheme);
const currentLocale = ref<Locale>(locale.value as Locale);

const activeMenu = computed(() => route.path);
const currentTitle = computed(() => {
  const key = route.meta?.titleKey as string | undefined;
  if (!key) return route.meta?.title as string | undefined;

  const message = tm(key);
  if (message && typeof message === 'object' && 'index' in message) {
    return String((message as Record<string, unknown>).index);
  }

  return t(key);
});
const userInfo = computed(() => userStore.userInfo);
const menus = computed(() => userStore.menus);

onMounted(async () => {
  if (userStore.token && !userStore.userInfo) {
    try {
      await userStore.getUserInfo(router);
    } catch {
      userStore.reset(router);
      router.push('/login');
    }
  }
});

const handleLocaleChange = (val: Locale) => {
  currentLocale.value = val;
  setLocale(val);
};

const handleUserCommand = async (command: string) => {
  if (command === 'profile') {
    router.push('/profile');
  } else if (command === 'logout') {
    await userStore.logout({ router });
    router.push('/login');
    ElMessage.success(t('common.loggedOut'));
  }
};
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.layout-aside {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #fff;
  font-weight: bold;
  border-bottom: 1px solid #3d4a5c;
  flex-shrink: 0;
}

.logo-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: var(--el-color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  flex-shrink: 0;
}

.logo-text {
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar-scroll {
  flex: 1;
  overflow-x: hidden;
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  padding: 0 20px;
  height: 60px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  cursor: pointer;
  color: #666;
}

.collapse-btn:hover {
  color: var(--el-color-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  cursor: pointer;
  color: #666;
}

.header-icon:hover {
  color: var(--el-color-primary);
}

.header-action {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: #666;
  outline: none;
}

.header-action:hover {
  color: var(--el-color-primary);
}

.header-action-text {
  font-size: 13px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  outline: none;
}

.username {
  color: #333;
  font-size: 14px;
}

.layout-main {
  background: #f0f2f5;
  padding: 16px;
  overflow-y: auto;
}

/* Dark theme overrides */
:global([data-theme='dark']) .layout-header {
  background: #1d1e1f;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}

:global([data-theme='dark']) .layout-main {
  background: #141414;
}

:global([data-theme='dark']) .username,
:global([data-theme='dark']) .header-icon,
:global([data-theme='dark']) .header-action,
:global([data-theme='dark']) .collapse-btn {
  color: #ddd;
}
</style>
