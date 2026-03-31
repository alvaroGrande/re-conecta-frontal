import api from './api';

/**
 * Obtener todas las notificaciones del usuario
 * Retorna array vacío si no hay token de autenticación
 * @param {boolean} soloNoLeidas - Si es true, solo devuelve las no leídas
 * @param {number} limite - Límite de notificaciones a devolver
 */
export const obtenerNotificaciones = async (soloNoLeidas = false, limite = 50) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return [];
  }
  
  const response = await api.get('/notificaciones', {
    params: { solo_no_leidas: soloNoLeidas, limite }
  });
  return response.data;
};

/**
 * Contar notificaciones no leídas
 * Retorna 0 si no hay token de autenticación
 */
export const contarNoLeidas = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return 0;
  }
  
  const response = await api.get('/notificaciones/no-leidas/count');
  return response.data.count;
};

/**
 * Obtener notificaciones enviadas
 */
export const obtenerNotificacionesEnviadas = async (limite = 50) => {
  const response = await api.get('/notificaciones/enviadas', {
    params: { limite }
  });
  return response.data;
};

/**
 * Crear una nueva notificación
 */
export const crearNotificacion = async (notificacion) => {
  const response = await api.post('/notificaciones', notificacion);
  return response.data;
};

/**
 * Enviar notificación masiva
 */
export const enviarNotificacionMasiva = async (data) => {
  const response = await api.post('/notificaciones/masiva', data);
  return response.data;
};

/**
 * Marcar notificación como leída
 */
export const marcarComoLeida = async (notificacionId) => {
  const response = await api.patch(`/notificaciones/${notificacionId}/leida`);
  return response.data;
};

/**
 * Marcar todas las notificaciones como leídas
 */
export const marcarTodasLeidas = async () => {
  const response = await api.patch('/notificaciones/todas/leidas');
  return response.data;
};

/**
 * Eliminar una notificación
 */
export const eliminarNotificacion = async (notificacionId) => {
  const response = await api.delete(`/notificaciones/${notificacionId}`);
  return response.data;
};

/**
 * Obtener configuración de notificaciones del usuario
 */
export const obtenerConfiguracionNotificaciones = async () => {
  const response = await api.get('/notificaciones/config');
  return response.data;
};

/**
 * Actualizar configuración de notificaciones
 */
export const actualizarConfiguracionNotificaciones = async (config) => {
  const response = await api.put('/notificaciones/config', config);
  return response.data;
};

/**
 * Obtener plantillas disponibles (solo admin)
 */
export const obtenerPlantillas = async () => {
  const response = await api.get('/notificaciones/plantillas');
  return response.data;
};

/**
 * Verificar estado de servicios externos
 */
export const verificarEstadoServicios = async () => {
  const response = await api.get('/notificaciones/servicios/estado');
  return response.data;
};

/**
 * Obtener cola de notificaciones pendientes (solo admin)
 */
export const obtenerColaNotificaciones = async () => {
  const response = await api.get('/notificaciones/cola');
  return response.data;
};
