import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useStorage } from '@vueuse/core';

export type DeviceType = 'desktop' | 'mobile';

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = useStorage('nap_sidebar_collapsed', false);
  const device = ref<DeviceType>('desktop');
  const locale = useStorage('nap_locale', 'zh-CN');
  const isMobile = computed(() => device.value === 'mobile');

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  function setSidebarCollapsed(value: boolean) {
    sidebarCollapsed.value = value;
  }

  function setDevice(value: DeviceType) {
    device.value = value;
  }

  function setLocale(value: string) {
    locale.value = value;
  }

  return {
    sidebarCollapsed,
    device,
    locale,
    isMobile,
    toggleSidebar,
    setSidebarCollapsed,
    setDevice,
    setLocale,
  };
});
