import api from './api';

/**
 * Obtiene el catálogo de permisos desde la BD.
 * @returns {Promise<Array<{permiso, descripcion, grupo, grupo_icono, orden_grupo, orden}>>}
 */
export const getPermisosDisponibles = async () => {
  const { data } = await api.get('/roles-permisos/disponibles');
  return data;
};

/**
 * Obtiene los permisos actuales de cada rol.
 * @returns {Promise<Record<string, string[]>>} Ej: { "1": [...], "2": [...], "3": [...] }
 */
export const getRolesPermisos = async () => {
  const { data } = await api.get('/roles-permisos');
  return data;
};

/**
 * Guarda la nueva configuración de permisos por rol.
 * @param {Record<string, string[]>} permisos
 */
export const updateRolesPermisos = async (permisos) => {
  const { data } = await api.put('/roles-permisos', permisos);
  return data;
};

/**
 * Restaura los permisos a los valores por defecto del sistema.
 */
export const resetRolesPermisos = async () => {
  const { data } = await api.delete('/roles-permisos');
  return data;
};
