import api from './api'

export const getUsuarios = async (filtros = {}, opciones = {}) => {
  const params = new URLSearchParams()
  
  // Agregar filtros
  if (filtros.name) params.append('name', filtros.name)
  if (filtros.email) params.append('email', filtros.email)
  if (filtros.role) params.append('role', filtros.role)
  
  // Agregar opciones de paginación
  if (opciones.limit) params.append('limit', opciones.limit)
  if (opciones.offset) params.append('offset', opciones.offset)
  
  const queryString = params.toString()
  const url = queryString ? `/usuarios?${queryString}` : '/usuarios'
  
  const { data } = await api.get(url)
  return data
}

export const getUsuario = async (id) => {
  const { data } = await api.get(`/usuarios/${id}`)
  return data
}

export const crearUsuario = async (usuarioData) => {
  const { data } = await api.post('/usuarios', usuarioData)
  return data
}

export const actualizarUsuario = async (id, usuarioData) => {
  const { data } = await api.put(`/usuarios/${id}`, usuarioData)
  return data
}

export const eliminarUsuario = async (id) => {
  const { data } = await api.delete(`/usuarios/${id}`)
  return data
}

/**
 * Subir foto de perfil de un usuario
 * @param {string} usuarioId - ID del usuario
 * @param {File} archivo - Archivo de imagen
 */
export const subirFotoPerfil = async (usuarioId, archivo) => {
  // Convertir archivo a base64
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(archivo)
  })
  
  const { data } = await api.post(`/usuarios/${usuarioId}/foto`, {
    foto: base64
  })
  return data
}
