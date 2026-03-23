import api from './api'

/**
 * Obtener el instructor principal del usuario autenticado
 */
export const obtenerInstructorPrincipal = async () => {
  try {
    const response = await api.get('/contactos/instructor-principal')
    return response.data
  } catch (error) {
    // Si no hay instructor, devolver null
    if (error.response?.status === 404) {
      return null
    }
    console.error('Error al obtener instructor principal:', error)
    throw error
  }
}

/**
 * Obtener todos los instructores asignados
 */
export const obtenerInstructores = async () => {
  try {
    const response = await api.get('/contactos/instructores')
    return response.data
  } catch (error) {
    console.error('Error al obtener instructores:', error)
    throw error
  }
}

/**
 * Obtener la lista de contactos con paginación y búsqueda
 * @param {number} page - Número de página
 * @param {number} limit - Cantidad de resultados por página
 * @param {string} search - Término de búsqueda
 */
export const obtenerContactos = async (page = 1, limit = 20, search = '') => {
  try {
    console.log('🌐 Llamando a GET /contactos/contactos')
    console.log('📄 Params:', { page, limit, search })
    const response = await api.get('/contactos/contactos', {
      params: { page, limit, search }
    })
    console.log('📥 Respuesta recibida:', response.data)
    return response.data
  } catch (error) {
    console.error('Error al obtener contactos:', error)
    throw error
  }
}

/**
 * Agregar un nuevo contacto
 * @param {number} contactoId - ID del usuario a agregar como contacto
 */
export const agregarContacto = async (contactoId) => {
  try {
    const response = await api.post('/contactos/contactos', {
      contacto_id: contactoId
    })
    return response.data
  } catch (error) {
    console.error('Error al agregar contacto:', error)
    throw error
  }
}

/**
 * Eliminar un contacto
 * @param {number} contactoId - ID del contacto a eliminar
 */
export const eliminarContacto = async (contactoId) => {
  try {
    const response = await api.delete(`/contactos/contactos/${contactoId}`)
    return response.data
  } catch (error) {
    console.error('Error al eliminar contacto:', error)
    throw error
  }
}

/**
 * Buscar usuarios para agregar como contacto
 * @param {string} termino - Término de búsqueda
 */
export const buscarUsuarios = async (termino = '') => {
  try {
    const response = await api.get('/contactos/buscar', {
      params: { q: termino }
    })
    return response.data
  } catch (error) {
    console.error('Error al buscar usuarios:', error)
    throw error
  }
}

/**
 * Obtener lista de instructores disponibles
 */
export const obtenerInstructoresDisponibles = async () => {
  try {
    const response = await api.get('/contactos/instructores-disponibles')
    return response.data
  } catch (error) {
    console.error('Error al obtener instructores disponibles:', error)
    throw error
  }
}

/**
 * Asignar un instructor a un usuario (solo admin)
 * @param {number} usuarioId - ID del usuario
 * @param {number} instructorId - ID del instructor
 * @param {boolean} esPrincipal - Si es el instructor principal
 */
export const asignarInstructor = async (usuarioId, instructorId, esPrincipal = false) => {
  try {
    const response = await api.post('/contactos/instructores/asignar', {
      usuario_id: usuarioId,
      instructor_id: instructorId,
      es_principal: esPrincipal
    })
    return response.data
  } catch (error) {
    console.error('Error al asignar instructor:', error)
    throw error
  }
}

/**
 * Cambiar el instructor principal (solo admin)
 * @param {number} usuarioId - ID del usuario
 * @param {number} instructorId - ID del nuevo instructor principal
 */
export const cambiarInstructorPrincipal = async (usuarioId, instructorId) => {
  try {
    const response = await api.patch('/contactos/instructores/cambiar-principal', {
      usuario_id: usuarioId,
      instructor_id: instructorId
    })
    return response.data
  } catch (error) {
    console.error('Error al cambiar instructor principal:', error)
    throw error
  }
}

/**
 * Obtener usuarios coordinados por el instructor autenticado
 * (Alias de obtenerContactos que devuelve usuarios si eres instructor)
 */
export const obtenerUsuariosCoordinados = async () => {
  try {
    // El endpoint /contactos/contactos ya maneja la lógica:
    // - Si eres instructor (rol 2), devuelve usuarios coordinados
    // - Si eres usuario normal, devuelve contactos
    const response = await api.get('/contactos/contactos')
    return response.data
  } catch (error) {
    console.error('Error al obtener usuarios coordinados:', error)
    throw error
  }
}
/**
 * Obtener usuarios coordinados por un instructor específico (para administradores)
 * @param {string|number} instructorId - ID del instructor
 * @returns {Array} Lista de usuarios coordinados
 */
export const obtenerUsuariosDeInstructor = async (instructorId) => {
  try {
    const response = await api.get(`/contactos/instructores/${instructorId}/usuarios`)
    return response.data
  } catch (error) {
    console.error('Error al obtener usuarios del instructor:', error)
    throw error
  }
}

/**
 * Obtener usuarios sin supervisor asignado (solo administradores)
 * @returns {Array} Lista de usuarios sin supervisor
 */
export const obtenerUsuariosSinSupervisor = async () => {
  try {
    const response = await api.get('/contactos/usuarios-sin-supervisor')
    return response.data
  } catch (error) {
    console.error('Error al obtener usuarios sin supervisor:', error)
    throw error
  }
}

/**
 * Obtener conteos de supervisores por filtro (solo administradores)
 * @returns {Object} Objeto con sinUsuarios y sobrecargados
 */
export const obtenerConteosSupervisores = async () => {
  try {
    const response = await api.get('/contactos/supervisores/conteos')
    return response.data
  } catch (error) {
    console.error('Error al obtener conteos de supervisores:', error)
    throw error
  }
}