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
/**
 * Subir foto de perfil por chunks para evitar límites de payload.
 * @param {string} usuarioId - ID del usuario
 * @param {File} archivo - Archivo de imagen
 * @param {(progress: number) => void} [onProgress] - Callback con progreso 0-1
 */
export const subirFotoPerfil = async (usuarioId, archivo, onProgress) => {
  const CHUNK_SIZE = 64 * 1024 // 64 KB de base64 por petición

  const base64DataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(archivo)
  })

  const commaIdx = base64DataUrl.indexOf(',')
  const header   = base64DataUrl.slice(0, commaIdx)       // "data:image/jpeg;base64"
  const base64   = base64DataUrl.slice(commaIdx + 1)      // datos puros
  const mimeType = header.match(/:(.*?);/)[1]

  const sessionId = crypto.randomUUID()
  const chunks = []
  for (let i = 0; i < base64.length; i += CHUNK_SIZE) {
    chunks.push(base64.slice(i, i + CHUNK_SIZE))
  }

  let lastData = null
  for (let i = 0; i < chunks.length; i++) {
    const { data } = await api.post(`/usuarios/${usuarioId}/foto/chunk`, {
      sessionId,
      index: i,
      total: chunks.length,
      mimeType,
      data: chunks[i]
    })
    lastData = data
    onProgress?.((i + 1) / chunks.length)
  }
  return lastData
}
