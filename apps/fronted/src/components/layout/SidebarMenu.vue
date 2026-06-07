<template>
  <el-menu
    :default-active="activeMenu"
    :collapse="collapsed"
    :unique-opened="true"
    background-color="#304156"
    text-color="#bfcbd9"
    active-text-color="#409eff"
    class="sidebar-menu"
    router
  >
    <template v-for="item in visibleMenus" :key="item.id">
      <el-sub-menu v-if="getVisibleChildren(item).length" :index="String(item.id)">
        <template #title>
          <el-icon>
            <component :is="resolveIcon(item.icon)" />
          </el-icon>
          <span>{{ getMenuTitle(item) }}</span>
        </template>
        <el-menu-item
          v-for="child in getVisibleChildren(item)"
          :key="child.id"
          :index="resolveMenuPath(child, item)"
        >
          <el-icon>
            <component :is="resolveIcon(child.icon)" />
          </el-icon>
          <template #title>{{ getMenuTitle(child) }}</template>
        </el-menu-item>
      </el-sub-menu>

      <el-menu-item v-else :index="resolveMenuPath(item)">
        <el-icon>
          <component :is="resolveIcon(item.icon)" />
        </el-icon>
        <template #title>{{ getMenuTitle(item) }}</template>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  Odometer,
  Setting,
  User,
  UserFilled,
  Key,
  OfficeBuilding,
  Briefcase,
  Menu as MenuIcon,
  Document,
  Tools,
  Bell,
  Folder,
  Files,
  Monitor,
  Cpu,
  DataLine,
  List,
  Timer,
  Connection,
  Lock,
} from '@element-plus/icons-vue';
import type { MenuItem } from '@/types/menu';

const props = defineProps<{ menus: MenuItem[]; collapsed?: boolean; activeMenu?: string }>();
const { t, tm } = useI18n();

// Map backend icon string → Element Plus icon component
const iconMap: Record<string, unknown> = {
  odometer: Odometer,
  setting: Setting,
  user: User,
  'user-filled': UserFilled,
  key: Key,
  building: OfficeBuilding,
  briefcase: Briefcase,
  menu: MenuIcon,
  document: Document,
  tools: Tools,
  bell: Bell,
  folder: Folder,
  files: Files,
  monitor: Monitor,
  cpu: Cpu,
  'data-line': DataLine,
  list: List,
  timer: Timer,
  connection: Connection,
  lock: Lock,
};

function resolveIcon(name?: string | null) {
  if (!name) return MenuIcon;
  return iconMap[name.toLowerCase()] || MenuIcon;
}

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
  Dashboard: 'nav.dashboard',
  'User Management': 'nav.user',
  'Role Management': 'nav.role',
  Department: 'nav.dept',
  'Post Management': 'nav.post',
  'Menu Management': 'nav.menu',
  Dictionary: 'nav.dict',
  Config: 'nav.config',
  'File Config': 'nav.fileConfig',
  'File Management': 'nav.file',
  Notice: 'nav.notice',
  'Login Log': 'nav.loginLog',
  'Operation Log': 'nav.operLog',
  'Online Users': 'nav.online',
  'Server Monitor': 'nav.server',
  'Cache Monitor': 'nav.cache',
  系统管理: 'nav.system',
  系统监控: 'nav.monitor',
};

const visibleMenus = computed(() =>
  props.menus.filter((item) => item.type !== 3 && item.isVisible !== 0),
);

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
  if (!key) return item.name;

  const message = tm(key);
  if (message && typeof message === 'object' && 'index' in message) {
    return String((message as Record<string, unknown>).index);
  }

  return t(key);
};
</script>

<style scoped>
.sidebar-menu {
  border-right: none;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 220px;
}
</style>
