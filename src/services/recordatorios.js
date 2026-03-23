import api from './api'

/**
 * Obtener recordatorios del usuario (o todos para supervisores).
 * @param {Object} params - Filtros opcionales para supervisores
 * @param {boolean} params.show_admin
 * @param {boolean} params.show_users
 * @param {string}  params.usuario_id
 */
export const obtenerRecordatorios = async (params = {}) => {
  const queryParams = {}

  if (params.show_admin === false) queryParams.show_admin = '0'
  if (params.show_users === false) queryParams.show_users = '0'
  if (params.usuario_id) queryParams.usuario_id = params.usuario_id

  const { data } = await api.get('/recordatorios', { params: queryParams })
  return data.data || []
}

/**
 * Crear un nuevo recordatorio.
 * @param {{ titulo: string, descripcion?: string, fecha: string, hora: string }} datos
 */
export const crearRecordatorio = async (datos) => {
  const { data } = await api.post('/recordatorios', datos)
  return data.data
}

/**
 * Actualizar un recordatorio existente.
 * @param {number} id
 * @param {{ titulo?: string, descripcion?: string, fecha?: string, hora?: string }} datos
 */
export const actualizarRecordatorio = async (id, datos) => {
  const { data } = await api.patch(`/recordatorios/${id}`, datos)
  return data.data
}

/**
 * Eliminar un recordatorio por ID.
 * @param {number} id
 */
export const eliminarRecordatorio = async (id) => {
  await api.delete(`/recordatorios/${id}`)
}
