export type ThemeName = 'professional' | 'midnight' | 'compact';

export const themeOptions: ThemeName[] = ['professional', 'midnight', 'compact'];

export const applyTheme = (theme: ThemeName) => {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('theme', theme);
};

export const initTheme = () => {
  const savedTheme = localStorage.getItem('theme') as ThemeName | null;
  const theme = savedTheme && themeOptions.includes(savedTheme) ? savedTheme : 'professional';
  applyTheme(theme);
  return theme;
};
