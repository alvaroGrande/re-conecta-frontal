import api from './api';

/**
 * Búsqueda global en talleres, encuestas y usuarios
 * @param {string} q - Término de búsqueda (mínimo 2 caracteres)
 * @param {number} limit - Máximo de resultados por entidad (por defecto 5)
 * @returns {Object} { talleres, encuestas, usuarios, total }
 */
export const buscarGlobal = async (q, limit = 5) => {
  const response = await api.get('/busqueda', { params: { q, limit } });
  return response.data;
};
