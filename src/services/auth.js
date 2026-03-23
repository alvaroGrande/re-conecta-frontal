/**
 * Servicio de autenticación
 * Gestiona el login, logout y sesión del usuario
 * 
 * @module services/auth
 */

import api from './api'
import { conectarSocket, desconectarSocket } from './socketService'
import router from '../router'

// Función helper para actualizar el estado global
let authStateUpdater = null

export const setAuthStateUpdater = (updater) => {
  authStateUpdater = updater
}

/**
 * Iniciar sesión de usuario
 * 
 * @async
 * @param {Object} credenciales - Credenciales de acceso
 * @param {string} credenciales.email - Email del usuario
 * @param {string} credenciales.password - Contraseña del usuario
 * @returns {Promise<Object>} Datos del login (token, usuario)
 * @throws {Error} Si las credenciales son inválidas
 * 
 * @example
 * const datos = await iniciarSesion({ 
 *   email: 'usuario@ejemplo.com', 
 *   password: '123456' 
 * })
 */
export const iniciarSesion = async (credenciales) => {
    try {
        const { data } = await api.post('/auth/login', credenciales)
        
        // Guardar los datos del usuario en localStorage si vienen en la respuesta
        if (data.usuario) {
            localStorage.setItem('usuario', JSON.stringify(data.usuario))
        }
        
        if (data.token) {
            localStorage.setItem('token', data.token)
        }
        
        // Actualizar estado global si está disponible
        if (authStateUpdater && data.token) {
          authStateUpdater(data.token, data.usuario)
        }
        
        // Conectar Socket.IO con el token
        if (data.token) {
            conectarSocket(data.token)
        }
        
        return data
    } catch (error) {
        console.error('Error al iniciar sesión:', error)
        throw error
    }
}

/**
 * Obtener datos del usuario autenticado actual
 * 
 * @async
 * @returns {Promise<Object|null>} Datos del usuario o null si hay error
 * 
 * @example
 * const usuario = await obtenerUsuarioActual()
 * if (usuario) {
 *   console.log(usuario.nombre)
 * }
 */
export const obtenerUsuarioActual = async () => {
    try {
        const { data } = await api.get('/auth/me')
        
        // Guardar los datos del usuario en localStorage
        if (data.usuario) {
            localStorage.setItem('usuario', JSON.stringify(data.usuario))
        }
        
        return data.usuario
    } catch (error) {
        console.error('Error al obtener usuario actual:', error)
        return null
    }
}

/**
 * Cerrar sesión del usuario
 * Limpia tokens, desconecta socket, detiene timers y redirige al login
 * 
 * @async
 * @param {string} motivo - Motivo del cierre de sesión: 'manual' | 'inactividad'
 * @returns {Promise<void>}
 * 
 * @example
 * await cerrarSesion('manual')
 * await cerrarSesion('inactividad')
 */
export const cerrarSesion = async (motivo = 'manual') => {
    try {
        // Llamar al endpoint de logout para marcar usuario como desconectado
        await api.post('/auth/logout', { motivo })
    } catch (error) {
        console.error('Error al hacer logout en el servidor:', error)
        // Continuar con el logout local aunque falle el servidor
    } finally {
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
        
        // Desconectar Socket.IO
        desconectarSocket()
        
        // Detener timer de inactividad
        if (typeof window !== 'undefined' && window.__stopInactivityTimer) {
            window.__stopInactivityTimer()
        }

        // Redirigir al login
        router.push('/login')
    }
}

// === Alias para compatibilidad ===
/** @deprecated Usar iniciarSesion */
export const login = iniciarSesion

/** @deprecated Usar cerrarSesion */
export const logout = cerrarSesion