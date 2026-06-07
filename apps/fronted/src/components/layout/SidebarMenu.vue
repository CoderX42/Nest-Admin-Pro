<template>
  <ul class="menu p-2 gap-1">
    <li v-for="item in visibleMenus" :key="item.id">
      <!-- Has children: collapse -->
      <details v-if="getVisibleChildren(item).length" class="group">
        <summary
          class="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer select-none transition-colors hover:bg-base-300"
          :class="{ 'justify-center': collapsed }"
        >
          <div v-if="collapsed" class="flex justify-center">
            <span class="text-base">{{ getIcon(item.name) }}</span>
          </div>
          <div v-else class="flex items-center gap-3 flex-1 min-w-0">
            <span class="text-base opacity-80 flex-shrink-0">{{ getIcon(item.name) }}</span>
            <span class="truncate flex-1">{{ getMenuTitle(item) }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 opacity-50 transition-transform group-open:rotate-180 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </summary>
        <ul v-if="!collapsed" class="pl-3 mt-1 mb-1 gap-1">
          <li v-for="child in getVisibleChildren(item)" :key="child.id">
            <router-link
              :to="resolveMenuPath(child, item)"
              class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-primary/10"
              :class="{ 'bg-primary/10 text-primary font-semibold': isActive(resolveMenuPath(child, item)) }"
            >
              <span class="w-1.5 h-1.5 rounded-full opacity-60 flex-shrink-0" :class="isActive(resolveMenuPath(child, item)) ? 'bg-primary opacity-100' : ''"></span>
              <span class="truncate">{{ getMenuTitle(child) }}</span>
            </router-link>
          </li>
        </ul>
      </details>

      <!-- No children: link -->
      <router-link
        v-else
        :to="resolveMenuPath(item)"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-base-300"
        :class="[
          isActive(resolveMenuPath(item)) ? 'bg-primary/10 text-primary font-semibold' : '',
          collapsed ? 'justify-center' : ''
        ]"
        :title="collapsed ? getMenuTitle(item) : undefined"
      >
        <span class="text-base flex-shrink-0">{{ getIcon(item.name) }}</span>
        <span v-if="!collapsed" class="truncate">{{ getMenuTitle(item) }}</span>
      </router-link>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import type { MenuItem } from '@/types/menu';

const props = defineProps<{ menus: MenuItem[]; collapsed?: boolean }>();
const route = useRoute();
const { t } = useI18n();

// Icon map for menu items
const iconMap: Record<string, string> = {
  'Dashboard': '📊',
  'User Management': '👤',
  'Role Management': '🔑',
  'Department': '🏢',
  'Post Management': '💼',
  'Menu Management': '🗂️',
  'Dictionary': '📖',
  'Config': '⚙️',
  'File Config': '💾',
  'File Management': '📁',
  'Notice': '📢',
  'Login Log': '🔐',
  'Operation Log': '📝',
  'Online Users': '🌐',
  'Server Monitor': '🖥️',
  'Cache Monitor': '⚡',
  '系统管理': '⚙️',
  '系统监控': '📈',
};

const getIcon = (name: string) => iconMap[name] || '📌';

const navKeyByPath: Record<string, string> = {
  '/dashboard': 'nav.dashboard',
  '/system/user': 'nav.user',
  '/system/role': 'nav.role',
  '/system/dept': 'nav.dept',
  '/system/post': 'nav.post',
  '/system/menu': 'nav.menu',
  '/system/dict': 'nav.dict',
  '/system/config': 'nav.config',
  '/system/file-config': 'nav.fileConfig',
  '/system/file': 'nav.file',
  '/system/notice': 'nav.notice',
  '/monitor/login-log': 'nav.loginLog',
  '/monitor/oper-log': 'nav.operLog',
  '/monitor/online': 'nav.online',
  '/monitor/server': 'nav.server',
  '/monitor/cache': 'nav.cache',
};

const navKeyByName: Record<string, string> = {
  'Dashboard': 'nav.dashboard',
  'User Management': 'nav.user',
  'Role Management': 'nav.role',
  'Department': 'nav.dept',
  'Post Management': 'nav.post',
  'Menu Management': 'nav.menu',
  'Dictionary': 'nav.dict',
  'Config': 'nav.config',
  'File Config': 'nav.fileConfig',
  'File Management': 'nav.file',
  'Notice': 'nav.notice',
  'Login Log': 'nav.loginLog',
  'Operation Log': 'nav.operLog',
  'Online Users': 'nav.online',
  'Server Monitor': 'nav.server',
  'Cache Monitor': 'nav.cache',
  '系统管理': 'nav.system',
  '系统监控': 'nav.monitor',
};

const visibleMenus = computed(() => props.menus.filter((item) => item.type !== 3 && item.isVisible !== 0));

function getVisibleChildren(item: MenuItem) {
  return item.children?.filter((child) => child.type !== 3 && child.isVisible !== 0) ?? [];
}

function resolveMenuPath(item: MenuItem, parent?: MenuItem) {
  if (item.path?.startsWith('/')) return item.path;
  const path = item.path || String(item.id);
  if (!parent?.path) return `/${path}`;
  return `${parent.path}/${path}`.replace(/\/+/g, '/');
}

const getMenuTitle = (item: MenuItem) => {
  const key = navKeyByPath[resolveMenuPath(item)] || navKeyByName[item.name];
  return key ? t(key) : item.name;
};

const isActive = (path: string) => route.path === path;
</script>
