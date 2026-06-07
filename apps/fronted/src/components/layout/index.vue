<template>
  <!-- Mobile top navbar -->
  <div class="lg:hidden drawer lg:drawer-open">
    <input id="sidebar-drawer" type="checkbox" class="drawer-toggle" v-model="drawerOpen" />

    <div class="drawer-content flex flex-col">
      <!-- Mobile header -->
      <div class="navbar bg-base-200 border-b border-base-300 shadow-sm sticky top-0 z-30 px-4 gap-2">
        <div class="flex-none">
          <label for="sidebar-drawer" class="btn btn-square btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </label>
        </div>
        <div class="flex-1">
          <span class="text-lg font-bold tracking-tight">{{ t('app.name') }}</span>
        </div>
        <!-- User avatar -->
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar placeholder">
            <div class="bg-neutral text-neutral-content w-8 rounded-full">
              <span class="text-sm font-medium">{{ userInfo?.nickname?.charAt(0) || 'U' }}</span>
            </div>
          </div>
          <ul tabindex="0" class="mt-2 z-[1] p-1 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-box w-48 border border-base-300">
            <li><button type="button" @click="router.push('/profile')" class="rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              {{ t('common.profile') }}
            </button></li>
            <li><button type="button" @click="handleLogout" class="rounded-lg text-error">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              {{ t('common.logout') }}
            </button></li>
          </ul>
        </div>
      </div>

      <!-- Main content -->
      <main class="flex-1 p-4 overflow-auto bg-base-100/30">
        <router-view />
      </main>
    </div>

    <!-- Mobile sidebar drawer -->
    <div class="drawer-side z-40">
      <label for="sidebar-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
      <aside class="w-64 min-h-screen bg-base-200 border-r border-base-300 flex flex-col">
        <div class="p-4 text-lg font-bold text-center border-b border-base-300 tracking-tight">
          🌼 {{ t('app.name') }}
        </div>
        <div class="flex-1 overflow-y-auto py-2">
          <SidebarMenu :menus="menus" />
        </div>
      </aside>
    </div>
  </div>

  <!-- Desktop layout -->
  <div class="hidden lg:flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <aside
      :class="[
        'flex flex-col bg-base-200 border-r border-base-300 transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0',
        isCollapsed ? 'w-[72px]' : 'w-64'
      ]"
    >
      <!-- Logo -->
      <div :class="['flex items-center border-b border-base-300 transition-all duration-300', isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-4']">
        <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-content font-bold text-sm flex-shrink-0">N</div>
        <span v-if="!isCollapsed" class="text-base font-bold tracking-tight whitespace-nowrap overflow-hidden">{{ t('app.name') }}</span>
      </div>

      <!-- Menu -->
      <div class="flex-1 overflow-y-auto overflow-x-hidden py-2">
        <SidebarMenu :menus="menus" :collapsed="isCollapsed" />
      </div>
    </aside>

    <!-- Main area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Header -->
      <header class="navbar bg-base-100 border-b border-base-300 shadow-sm px-6 gap-4">
        <!-- Left: collapse + breadcrumb -->
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <button
            class="btn btn-ghost btn-sm btn-square text-base-content/60 hover:text-base-content"
            @click="isCollapsed = !isCollapsed"
            :title="isCollapsed ? t('common.expand') : t('common.collapse')"
          >
            <svg v-if="isCollapsed" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>

          <nav class="breadcrumbs text-sm min-w-0">
            <ul class="flex items-center gap-1.5">
              <li>
                <router-link to="/" class="text-base-content/50 hover:text-primary flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span class="hidden sm:inline">{{ t('common.home') }}</span>
                </router-link>
              </li>
              <li class="text-base-content/30 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
                <span class="font-medium text-base-content truncate max-w-[200px]">{{ currentTitle || '' }}</span>
              </li>
            </ul>
          </nav>
        </div>

        <!-- Right: theme + language + user -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <!-- Theme Toggle -->
          <button
            class="btn btn-ghost btn-sm btn-square text-base-content/60 hover:text-base-content"
            @click="themeStore.toggleTheme()"
            :title="currentTheme === 'light' ? t('theme.dark') : t('theme.light')"
          >
            <svg v-if="currentTheme === 'light'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </button>

          <!-- Language -->
          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-sm gap-1.5 text-base-content/60 hover:text-base-content">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A8.001 8.001 0 0116.953 9H15m2 4h.01M21 12a9 9 0 00-2.636-6.364M12 12V3" />
              </svg>
              <span class="hidden sm:inline text-xs">{{ currentLocale === 'zh-CN' ? '中文' : 'EN' }}</span>
            </div>
            <ul tabindex="0" class="dropdown-content z-[1] menu menu-sm p-1 shadow-lg bg-base-100 rounded-box w-28 border border-base-300 mt-1">
              <li><button type="button" :class="{ 'active': currentLocale === 'zh-CN' }" @click="handleLocaleChange('zh-CN')" class="rounded-lg text-sm">中文</button></li>
              <li><button type="button" :class="{ 'active': currentLocale === 'en-US' }" @click="handleLocaleChange('en-US')" class="rounded-lg text-sm">English</button></li>
            </ul>
          </div>

          <!-- User -->
          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-base-200 cursor-pointer transition-colors">
              <div class="avatar placeholder">
                <div class="bg-neutral text-neutral-content w-8 rounded-full">
                  <span class="text-xs font-medium">{{ userInfo?.nickname?.charAt(0) || 'U' }}</span>
                </div>
              </div>
              <span class="font-medium text-sm hidden xl:inline">{{ userInfo?.nickname || t('common.userFallback') }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <ul tabindex="0" class="dropdown-content z-[1] menu menu-sm p-1 shadow-lg bg-base-100 rounded-box w-48 border border-base-300 mt-1">
              <li><button type="button" @click="router.push('/profile')" class="rounded-lg text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                {{ t('common.profile') }}
              </button></li>
              <li><button type="button" @click="handleLogout" class="rounded-lg text-sm text-error">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                {{ t('common.logout') }}
              </button></li>
            </ul>
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 overflow-auto p-6 bg-base-100/30">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../../store/modules/user';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { setLocale, type Locale } from '@/i18n';
import { useThemeStore } from '@/store/theme';
import SidebarMenu from './SidebarMenu.vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const { t, tm, locale } = useI18n();

const isCollapsed = ref(false);
const drawerOpen = ref(false);
const themeStore = useThemeStore();
const currentTheme = computed(() => themeStore.currentTheme);
const currentLocale = ref<Locale>(locale.value as Locale);

const activeMenu = computed(() => route.path);
const currentTitle = computed(() => {
  const key = route.meta?.titleKey as string | undefined;
  if (!key) return route.meta?.title;

  const message = tm(key);
  if (message && typeof message === 'object' && 'index' in message) {
    return String(message.index);
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

const handleLogout = async () => {
  await userStore.logout({ router });
  router.push('/login');
  ElMessage.success(t('common.loggedOut'));
};

const handleLocaleChange = (val: Locale) => {
  currentLocale.value = val;
  setLocale(val);
};
</script>
