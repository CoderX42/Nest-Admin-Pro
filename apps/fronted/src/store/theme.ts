import { defineStore } from 'pinia';
import { ref } from 'vue';
import { applyTheme, initTheme, type ThemeName } from '@/utils/appearance';

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<ThemeName>(initTheme() as ThemeName);

  const toggleTheme = () => {
    const next: ThemeName = currentTheme.value === 'light' ? 'dark' : 'light';
    currentTheme.value = next;
    applyTheme(next);
  };

  const setTheme = (theme: ThemeName) => {
    currentTheme.value = theme;
    applyTheme(theme);
  };

  return {
    currentTheme,
    toggleTheme,
    setTheme,
  };
});