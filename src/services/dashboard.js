import api from './api';

export const dashboardService = {
  /**
   * Obtiene estadísticas generales del dashboard
   * @returns {Promise<Object>} Estadísticas: total usuarios, activos, conectados, talleres, encuestas
   */
  async obtenerEstadisticas() {
    try {
      const response = await api.get('/dashboard/estadisticas');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas del dashboard:', error);
      throw error;
    }
  },

  /**
   * Obtiene estadísticas de usuarios
   * @returns {Promise<Object>} Total, activos y conectados
   */
  async obtenerEstadisticasUsuarios() {
    try {
      const response = await api.get('/dashboard/estadisticas/usuarios');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de usuarios:', error);
      throw error;
    }
  },

  /**
   * Obtiene estadísticas de talleres
   * @returns {Promise<Object>} Talleres activos y del mes
   */
  async obtenerEstadisticasTalleres() {
    try {
      const response = await api.get('/dashboard/estadisticas/talleres');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de talleres:', error);
      throw error;
    }
  },

  /**
   * Obtiene estadísticas de encuestas
   * @returns {Promise<Object>} Encuestas activas y respuestas
   */
  async obtenerEstadisticasEncuestas() {
    try {
      const response = await api.get('/dashboard/estadisticas/encuestas');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de encuestas:', error);
      throw error;
    }
  },

  /**
   * Obtiene la distribución de usuarios por roles
   * @returns {Promise<Array>} Array con rol y cantidad de usuarios
   */
  async obtenerDistribucionRoles() {
    try {
      const response = await api.get('/dashboard/distribucion-roles');
      return response.data;
    } catch (error) {
      console.error('Error al obtener distribución de roles:', error);
      throw error;
    }
  },

  /**
   * Obtiene datos de actividad de los últimos N días
   * @param {number} dias - Número de días (default: 7)
   * @returns {Promise<Array>} Array con fecha, día de la semana y cantidad de actividad
   */
  async obtenerActividadPorDias(dias = 7) {
    try {
      const response = await api.get('/dashboard/actividad-dias', {
        params: { dias }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener actividad por días:', error);
      throw error;
    }
  },

  /**
   * Obtiene la lista de usuarios conectados actualmente (últimos 5 minutos)
   * @returns {Promise<Array>} Array de usuarios con id, nombre, email, rol, foto_perfil
   */
  async obtenerUsuariosConectados() {
    try {
      const response = await api.get('/dashboard/usuarios-conectados');
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuarios conectados:', error);
      throw error;
    }
  },

  /**
   * Obtiene actividad reciente del sistema o de un usuario específico
   * @param {number} limite - Número máximo de registros (default: 10)
   * @param {number|null} usuarioId - ID del usuario específico (opcional)
   * @param {number} dias - Número de días para usuario específico (default: 7)
   * @returns {Promise<Array>} Array de actividades con tipo, descripción, fecha y usuario
   */
  async obtenerActividadReciente(limite = 10, usuarioId = null, dias = 7) {
    try {
      const url = usuarioId 
        ? `/dashboard/actividad-reciente/${usuarioId}`
        : '/dashboard/actividad-reciente';
      
      const params = usuarioId 
        ? { dias }
        : { limite };
      
      const response = await api.get(url, { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener actividad reciente:', error);
      throw error;
    }
  }
};

export default dashboardService;
