import { themes } from '../data/themes';

export const applyTheme = (themeId) => {
  const theme = themes.find(t => t.id === themeId) || themes[0];
  
  const root = document.documentElement;
  root.style.setProperty('--color-primary', theme.primary);
  root.style.setProperty('--color-secondary', theme.secondary);
  root.style.setProperty('--color-primary-hover', theme.hover);
};

export const saveThemeLocally = (themeId) => {
  localStorage.setItem('kindred_theme', themeId);
};

export const getThemeLocally = () => {
  return localStorage.getItem('kindred_theme') || 'aurora';
};
