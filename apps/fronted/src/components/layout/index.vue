<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapsed ? '72px' : '248px'" class="layout-aside">
      <div class="logo-container">
        <img v-if="!isCollapsed" src="/logo.svg" alt="logo" class="logo" />
        <span v-if="!isCollapsed" class="logo-text">{{ t('app.name') }}</span>
        <el-icon v-else :size="24"><Box /></el-icon>
      </div>

      <el-menu :default-active="activeMenu" :collapse="isCollapsed" :unique-opened="true" class="sidebar-menu" router>
        <template v-for="item in menus" :key="item.id">
          <el-sub-menu v-if="item.children?.length" :index="String(item.id)">
            <template #title>{{ getMenuTitle(item) }}</template>
            <el-menu-item v-for="child in item.children" :key="child.id" :index="child.path || `/system/${child.name}`">
              {{ getMenuTitle(child) }}
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="item.path || `/system/${item.name}`">
            {{ getMenuTitle(item) }}
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="layout-header">
        <div class="header-left">
          <el-tooltip :content="isCollapsed ? t('common.expand') : t('common.collapse')" placement="bottom">
            <el-button text circle class="icon-btn" @click="isCollapsed = !isCollapsed">
              <el-icon :size="20">
                <Expand v-if="isCollapsed" />
                <Fold v-else />
              </el-icon>
            </el-button>
          </el-tooltip>

          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">{{ t('common.home') }}</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRoute">{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <div class="preference-group">
            <el-icon><Brush /></el-icon>
            <el-select
              v-model="currentTheme"
              class="preference-select"
              size="small"
              :aria-label="t('common.theme')"
              @change="handleThemeChange"
            >
              <el-option
                v-for="theme in themeOptions"
                :key="theme"
                :label="t(`theme.${theme}`)"
                :value="theme"
              >
                <div class="theme-option">
                  <span class="theme-dot" :style="{ background: getThemeColor(theme) }" />
                  <span>{{ t(`theme.${theme}`) }}</span>
                </div>
              </el-option>
            </el-select>
          </div>

          <div class="preference-group">
            <el-icon><Switch /></el-icon>
            <el-select
              v-model="currentLocale"
              class="language-select"
              size="small"
              :aria-label="t('common.language')"
              @change="handleLocaleChange"
            >
              <el-option label="中文" value="zh-CN" />
              <el-option label="English" value="en-US" />
            </el-select>
          </div>

          <el-dropdown @command="handleCommand">
            <span class="user-dropdown">
              <el-avatar :size="32" :src="userInfo?.avatar || ''">
                {{ userInfo?.nickname?.charAt(0) || 'U' }}
              </el-avatar>
              <span class="username">{{ userInfo?.nickname || t('common.userFallback') }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">{{ t('common.profile') }}</el-dropdown-item>
                <el-dropdown-item command="password">{{ t('common.changePassword') }}</el-dropdown-item>
                <el-dropdown-item divided command="logout">{{ t('common.logout') }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../../store/modules/user';
import { ElMessage } from 'element-plus';
import { Fold, Expand, Box, Brush, Switch } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { setLocale, type Locale } from '@/i18n';
import { themeOptions, themeMetas, type ThemeName } from '@/utils/appearance';
import { useThemeStore } from '@/store/theme';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const { t, locale } = useI18n();

const isCollapsed = ref(false);
const themeStore = useThemeStore();
const currentTheme = computed(() => themeStore.currentTheme);
const currentLocale = ref<Locale>(locale.value as Locale);
const activeMenu = computed(() => route.path);
const currentRoute = computed(() => route);
const currentTitle = computed(() => {
  const key = route.meta?.titleKey as string | undefined;
  return key ? t(key) : route.meta?.title;
});
const userInfo = computed(() => userStore.userInfo);
const menus = computed(() => userStore.menus);

const navKeyByPath: Record<string, string> = {
  '/dashboard': 'nav.dashboard',
  '/system/user': 'nav.user',
  '/system/role': 'nav.role',
  '/system/dept': 'nav.dept',
  '/system/post': 'nav.post',
  '/system/menu': 'nav.menu',
  '/system/dict': 'nav.dict',
  '/system/config': 'nav.config',
  '/system/notice': 'nav.notice',
  '/monitor/login-log': 'nav.loginLog',
  '/monitor/oper-log': 'nav.operLog',
  '/monitor/online': 'nav.online',
  '/monitor/server': 'nav.server',
  '/monitor/cache': 'nav.cache',
};

const navKeyByName: Record<string, string> = {
  Dashboard: 'nav.dashboard',
  'User Management': 'nav.user',
  'Role Management': 'nav.role',
  Department: 'nav.dept',
  'Post Management': 'nav.post',
  'Menu Management': 'nav.menu',
  Dictionary: 'nav.dict',
  Config: 'nav.config',
  Notice: 'nav.notice',
  'Login Log': 'nav.loginLog',
  'Operation Log': 'nav.operLog',
  'Online Users': 'nav.online',
  'Server Monitor': 'nav.server',
  'Cache Monitor': 'nav.cache',
  系统管理: 'nav.system',
  系统监控: 'nav.monitor',
};

const getMenuTitle = (item: any) => {
  const key = navKeyByPath[item.path] || navKeyByName[item.name];
  return key ? t(key) : item.name;
};

onMounted(async () => {
  if (userStore.token && !userStore.userInfo) {
    try {
      await userStore.getUserInfo();
    } catch (e) {
      userStore.reset();
      router.push('/login');
    }
  }
});

const handleCommand = async (command: string) => {
  if (command === 'profile') {
    router.push('/profile');
  } else if (command === 'logout') {
    await userStore.logout();
    router.push('/login');
    ElMessage.success(t('common.loggedOut'));
  }
};

const getThemeColor = (theme: ThemeName) => {
  const meta = themeMetas.find((m) => m.name === theme);
  return meta?.colors[0] || '#4f46e5';
};

const handleThemeChange = (theme: ThemeName) => {
  themeStore.setTheme(theme);
};

const handleLocaleChange = (value: Locale) => {
  setLocale(value);
  currentLocale.value = value;
};
</script>

<style scoped>
.layout-container {
  height: 100vh;
  background: var(--app-bg);
}

.layout-aside {
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  transition: width 0.24s ease, background 0.24s ease;
  overflow: hidden;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid var(--sidebar-border);
  letter-spacing: 0;
}

.logo {
  width: 32px;
  height: 32px;
}

.sidebar-menu {
  border-right: none;
  background: transparent;
}

.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  height: var(--nav-item-height);
  margin: 4px 10px;
  border-radius: 8px;
  color: var(--sidebar-text);
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: var(--sidebar-active-bg);
  color: var(--sidebar-active-text);
  font-weight: 700;
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background: var(--sidebar-hover-bg);
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  padding: 0 20px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.preference-group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--muted);
}

.preference-select {
  width: 112px;
}

.language-select {
  width: 104px;
}

.icon-btn {
  color: var(--muted);
}

.icon-btn:hover {
  color: var(--primary);
  background: var(--primary-soft);
}

.username {
  margin-left: 8px;
  color: var(--text);
  font-weight: 600;
}

.layout-main {
  background: transparent;
  padding: var(--page-padding);
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 8px;
  transition: background 0.18s ease;
}

.user-dropdown:hover {
  background: var(--soft-surface);
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.theme-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
</style>
