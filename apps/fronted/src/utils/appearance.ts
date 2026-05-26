export type ThemeName = 'light' | 'dark';

export const applyTheme = (theme: ThemeName) => {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('theme', theme);
};

export const initTheme = () => {
  const saved = localStorage.getItem('theme') as ThemeName | null;
  const theme = saved || 'light';
  applyTheme(theme);
  return theme;
};