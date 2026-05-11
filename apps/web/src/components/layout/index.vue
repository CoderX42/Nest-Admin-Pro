<template>
  <el-container class="layout-container">
    <!-- Sidebar -->
    <el-aside :width="isCollapsed ? '64px' : '220px'" class="layout-aside">
      <div class="logo-container">
        <img v-if="!isCollapsed" src="/logo.svg" alt="logo" class="logo" />
        <span v-if="!isCollapsed" class="logo-text">Nest-Admin-Pro</span>
        <el-icon v-else :size="24"><Box /></el-icon>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        :unique-opened="true"
        class="sidebar-menu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
        router
      >
        <template v-for="item in menus" :key="item.id">
          <el-sub-menu v-if="item.children?.length" :index="String(item.id)">
            <template #title>
              <el-icon><component :is="item.icon || 'Folder'" /></el-icon>
              <span>{{ item.name }}</span>
            </template>
            <el-menu-item
              v-for="child in item.children"
              :key="child.id"
              :index="child.path || `/system/${child.name}`"
            >
              <el-icon><component :is="child.icon || 'Document'" /></el-icon>
              <span>{{ child.name }}</span>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="item.path || `/system/${item.name}`">
            <el-icon><component :is="item.icon || 'Folder'" /></el-icon>
            <span>{{ item.name }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- Header -->
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon :size="24" class="collapse-btn" @click="isCollapsed = !isCollapsed">
            <Expand v-if="isCollapsed" />
            <Fold v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">Home</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRoute">{{ currentRoute.meta?.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-dropdown">
              <el-avatar :size="32" :src="userInfo?.avatar || ''">
                {{ userInfo?.nickname?.charAt(0) || 'U' }}
              </el-avatar>
              <span class="username">{{ userInfo?.nickname || 'User' }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">Profile</el-dropdown-item>
                <el-dropdown-item command="password">Change Password</el-dropdown-item>
                <el-dropdown-item divided command="logout">Logout</el-dropdown-item>
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
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../../store/modules/user';
import { ElMessage } from 'element-plus';
import { Fold, Expand, Box } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const isCollapsed = ref(false);
const activeMenu = computed(() => route.path);
const currentRoute = computed(() => route);
const userInfo = computed(() => userStore.userInfo);
const menus = computed(() => userStore.menus);

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
  if (command === 'logout') {
    await userStore.logout();
    router.push('/login');
    ElMessage.success('Logged out');
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
  border-bottom: 1px solid #3d4a5c;
}

.logo {
  width: 32px;
  height: 32px;
}

.sidebar-menu {
  border-right: none;
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  padding: 0 20px;
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

.username {
  margin-left: 8px;
  color: #333;
}

.layout-main {
  background: #f0f2f5;
  padding: 16px;
  overflow-y: auto;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
}
</style>