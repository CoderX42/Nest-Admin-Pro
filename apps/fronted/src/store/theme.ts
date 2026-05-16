import { defineStore } from 'pinia';
import { ref } from 'vue';
import { applyTheme, initTheme, themeOptions, type ThemeName } from '@/utils/appearance';

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<ThemeName>(initTheme());

  const setTheme = (theme: ThemeName) => {
    if (!themeOptions.includes(theme)) return;
    currentTheme.value = theme;
    applyTheme(theme);
  };

  return {
    currentTheme,
    setTheme,
  };
});