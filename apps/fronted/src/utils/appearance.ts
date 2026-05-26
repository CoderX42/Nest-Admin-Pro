import daisyuiThemes from 'daisyui/theme'; // get all available daisyui theme names

export type ThemeName = 'emerald' | 'night' | 'wireframe' | 'sunset' | 'cyberpunk' | 'valentine';

export const themeOptions: ThemeName[] = ['emerald', 'night', 'wireframe', 'sunset', 'cyberpunk', 'valentine'];

export interface ThemeMeta {
  name: ThemeName;
  colors: [string, string, string];
}

export const themeMetas: ThemeMeta[] = [
  { name: 'emerald', colors: ['#10b981', '#ecfdf5', '#1e293b'] },
  { name: 'night', colors: ['#818cf8', '#1e1b4b', '#f1f5f9'] },
  { name: 'wireframe', colors: ['#64748b', '#f8fafc', '#1e293b'] },
  { name: 'sunset', colors: ['#f97316', '#fff7ed', '#431407'] },
  { name: 'cyberpunk', colors: ['#ff00ff', '#0f172a', '#ecfeff'] },
  { name: 'valentine', colors: ['#e11d48', '#fdf2f8', '#4c0519'] },
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
