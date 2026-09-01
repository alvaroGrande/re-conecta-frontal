import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';

/**
 * Servicio para gestionar el caché del backend
 */
export const cacheService = {
  /**
   * Obtener estadísticas generales del caché
   */
  async obtenerEstadisticas() {
    try {
      const response = await axios.get(`${API_URL}/tasks/cache/stats`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas del caché:', error);
      throw error;
    }
  },

  /**
   * Obtener detalles de todas las entradas del caché
   */
  async obtenerDetalles() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/tasks/cache/details`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener detalles del caché:', error);
      throw error;
    }
  },

  /**
   * Obtener los datos de una entrada específica del caché
   * @param {string} key - La clave de la entrada
   */
  async obtenerDatosEntrada(key) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/tasks/cache/entry/${encodeURIComponent(key)}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener datos de la entrada del caché:', error);
      throw error;
    }
  },

  /**
   * Eliminar una entrada específica del caché
   * @param {string} key - La clave de la entrada a eliminar
   */
  async eliminarEntrada(key) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/tasks/cache/entry/${encodeURIComponent(key)}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al eliminar entrada del caché:', error);
      throw error;
    }
  },

  /**
   * Limpiar todo el caché
   */
  async limpiarTodo() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/tasks/cache/clear`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al limpiar caché:', error);
      throw error;
    }
  }
};
