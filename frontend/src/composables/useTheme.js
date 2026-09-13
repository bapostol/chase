import { ref } from 'vue';

const STORAGE_KEY = 'chase_active_theme';
const activeTheme = ref('classic');

export function useTheme() {
  // Sync the raw HTML DOM node attribute directly with the active memory token
  const applyThemeToDOM = (themeName) => {
    document.documentElement.setAttribute('data-theme', themeName);
  };

  // Bootstrap the theme configuration smoothly on application mount
  const initializeTheme = () => {
    const cachedTheme = localStorage.getItem(STORAGE_KEY);
    
    if (cachedTheme) {
      activeTheme.value = cachedTheme;
    } else {
      activeTheme.value = 'classic'; // Default out-of-the-box system anchor
    }
    
    applyThemeToDOM(activeTheme.value);
  };

  // Mutate state, commit to disk storage, and crossfade DOM layers smoothly
  const setTheme = (themeName) => {
    activeTheme.value = themeName;
    localStorage.setItem(STORAGE_KEY, themeName);
    applyThemeToDOM(themeName);
  };

  return {
    activeTheme,
    initializeTheme,
    setTheme
  };
}
