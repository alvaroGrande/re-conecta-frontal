import axios from 'axios'
import { showError } from "./toastService";
import router from '../router'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para añadir token si existe
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const isLoginRequest = error.config?.url?.includes('/auth/login')

    // Token expirado o inválido fuera del login → limpiar sesión y redirigir
    // Solo ante 401 (no autenticado). El 403 (sin permisos) no cierra sesión.
    if (status === 401 && !isLoginRequest) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-updated'))
      }
      router.push({ name: 'Login' })
      return Promise.reject(error)
    }

    //console.error('API Error:', error);

    // Errores de negocio esperados (manejados por cada componente)
    const silentStatuses = [409, 403];
    if (!silentStatuses.includes(status)) {
      showError(error.response?.data?.message || "Error en el servidor");
    }

    return Promise.reject(error);
  }
);

export default api
