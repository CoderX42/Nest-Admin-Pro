export type ThemeName = 'professional' | 'midnight' | 'compact' | 'sunset' | 'cyber' | 'purple';

export const themeOptions: ThemeName[] = ['professional', 'midnight', 'compact', 'sunset', 'cyber', 'purple'];

export interface ThemeMeta {
  name: ThemeName;
  colors: [string, string, string];
}

export const themeMetas: ThemeMeta[] = [
  { name: 'professional', colors: ['#4f46e5', '#e0e7ff', '#1e293b'] },
  { name: 'midnight', colors: ['#818cf8', '#1e1b4b', '#f1f5f9'] },
  { name: 'compact', colors: ['#0f766e', '#f0f4f8', '#1a202c'] },
  { name: 'sunset', colors: ['#f97316', '#fff7ed', '#431407'] },
  { name: 'cyber', colors: ['#06b6d4', '#0f172a', '#ecfeff'] },
  { name: 'purple', colors: ['#722ed1', '#f9f0ff', '#120338'] },
];

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
