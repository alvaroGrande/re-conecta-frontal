import { ref } from 'vue'

const STORAGE_KEY = 'rc-theme'
const DARK_CLASS = 'p-dark'

// Estado global compartido (singleton por módulo)
const isDark = ref(false)

function applyTheme(dark) {
  if (dark) {
    document.documentElement.classList.add(DARK_CLASS)
  } else {
    document.documentElement.classList.remove(DARK_CLASS)
  }
}

export function useTheme() {
  function initTheme() {
    const stored = localStorage.getItem(STORAGE_KEY)
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = stored !== null ? stored === 'dark' : prefersDark
    applyTheme(isDark.value)
  }

  function toggleTheme() {
    isDark.value = !isDark.value
    applyTheme(isDark.value)
    localStorage.setItem(STORAGE_KEY, isDark.value ? 'dark' : 'light')
  }

  return { isDark, toggleTheme, initTheme }
}
