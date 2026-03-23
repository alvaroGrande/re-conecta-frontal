import api from './api'

export const obtenerEncuestas = async (filtros = {}) => {
  try {
    const params = new URLSearchParams()
    if (filtros.estado) {
      params.append('estado', filtros.estado)
    }
    
    const url = `/encuestas${params.toString() ? '?' + params.toString() : ''}`
    const response = await api.get(url)
    return response.data
  } catch (error) {
    console.error('Error al obtener encuestas:', error)
    throw error
  }
}

export const obtenerEncuestaPorId = async (id) => {
  try {
    const response = await api.get(`/encuestas/${id}`)
    return response.data
  } catch (error) {
    console.error('Error al obtener encuesta:', error)
    throw error
  }
}

export const crearRespuestaEncuesta = async (encuestaId, respuestas) => {
  try {
    const response = await api.post(`/encuestas/${encuestaId}/respuestas`, {
      respuestas
    })
    return response.data
  } catch (error) {
    console.error('Error al enviar respuestas:', error)
    throw error
  }
}

export const obtenerResultadosEncuesta = async (encuestaId) => {
  try {
    const response = await api.get(`/encuestas/${encuestaId}/resultados`)
    return response.data
  } catch (error) {
    console.error('Error al obtener resultados:', error)
    throw error
  }
}

export const crearEncuesta = async (encuestaData) => {
  try {
    const response = await api.post('/encuestas', encuestaData)
    return response.data
  } catch (error) {
    console.error('Error al crear encuesta:', error)
    throw error
  }
}

export const obtenerRespuestasDetalladas = async (encuestaId) => {
  try {
    const response = await api.get(`/encuestas/${encuestaId}/respuestas-detalladas`)
    return response.data
  } catch (error) {
    console.error('Error al obtener respuestas detalladas:', error)
    throw error
  }
}

export const cerrarEncuesta = async (encuestaId) => {
  try {
    const response = await api.put(`/encuestas/${encuestaId}/cerrar`)
    return response.data
  } catch (error) {
    console.error('Error al cerrar encuesta:', error)
    throw error
  }
}

export const obtenerRespuestasDeUsuario = async (encuestaId, usuarioId) => {
  try {
    const response = await api.get(`/encuestas/${encuestaId}/respuestas-usuario/${usuarioId}`)
    return response.data
  } catch (error) {
    console.error('Error al obtener respuestas del usuario:', error)
    throw error
  }
}
