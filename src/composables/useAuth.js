import { ref, computed } from 'vue'

// Estado reactivo global
const token = ref(localStorage.getItem('token'))
const usuario = ref(null)

// Inicializar usuario desde localStorage
try {
  const usuarioStorage = localStorage.getItem('usuario')
  if (usuarioStorage) {
    usuario.value = JSON.parse(usuarioStorage)
  }
} catch (error) {
  console.error('Error al parsear usuario del localStorage:', error)
}

export function useAuth() {
  const isAuthenticated = computed(() => !!token.value)
  
  const esAdmin = computed(() => usuario.value?.rol === 1)
  
  const esSupervisor = computed(() => usuario.value?.rol === 2)
  
  const setAuth = (newToken, newUsuario) => {
    token.value = newToken
    usuario.value = newUsuario
    
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
    
    if (newUsuario) {
      localStorage.setItem('usuario', JSON.stringify(newUsuario))
    } else {
      localStorage.removeItem('usuario')
    }
  }
  
  const clearAuth = () => {
    token.value = null
    usuario.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
  }
  
  return {
    isAuthenticated,
    esAdmin,
    esSupervisor,
    usuario,
    token,
    setAuth,
    clearAuth
  }
}
