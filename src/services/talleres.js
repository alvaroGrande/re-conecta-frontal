import api from './api'

export const getTalleres = async () => {
    const {data} = await api.get('/talleres')
    return data
}

export const getTallerPorId = async (id) => {
    const {data} = await api.get(`/talleres/${id}`)
    return data
}

export const crearTaller = async (taller) => {
    const {data} = await api.post('/talleres', taller)
    return data
}

export const editarTaller = async (id, taller) => {
    const {data} = await api.patch(`/talleres/${id}`, taller)
    return data
}

export const eliminarTaller = async (id) => {
    const {data} = await api.delete(`/talleres/${id}`)
    return data
}

export const activarTaller = async (id) => {
    const {data} = await api.patch(`/talleres/${id}/activar`)
    return data
}

export const desactivarTaller = async (id) => {
    const {data} = await api.patch(`/talleres/${id}/desactivar`)
    return data
}

/** El usuario autenticado se inscribe */
export const inscribirTaller = async (id) => {
    const {data} = await api.post(`/talleres/${id}/inscribir`)
    return data
}

/** El usuario autenticado se desinscribe */
export const desinscribirTaller = async (id) => {
    const {data} = await api.delete(`/talleres/${id}/inscribir`)
    return data
}

/** Comprobar si el usuario autenticado está inscrito */
export const getMiInscripcion = async (id) => {
    const {data} = await api.get(`/talleres/${id}/mi-inscripcion`)
    return data
}

/** Listado de inscritos (admin/monitor) */
export const getInscritos = async (id) => {
    const {data} = await api.get(`/talleres/${id}/inscritos`)
    return data
}

/** Monitor/Admin inscribe a un usuario concreto */
export const inscribirUsuario = async (tallerId, usuarioId) => {
    const {data} = await api.post(`/talleres/${tallerId}/inscribir/${usuarioId}`)
    return data
}

/** Monitor/Admin desinscribe a un usuario concreto */
export const desinscribirUsuario = async (tallerId, usuarioId) => {
    const {data} = await api.delete(`/talleres/${tallerId}/inscribir/${usuarioId}`)
    return data
}

/** Admin cancela el taller: lo archiva con motivo y notifica a todos */
export const cancelarTaller = async (id, motivo = null, motivoId = null) => {
    const {data} = await api.patch(`/talleres/${id}/cancelar`, { motivo, motivo_id: motivoId })
    return data
}

/** Catálogo de motivos de cancelación (cacheado en backend) */
export const getMotivosCancelacion = async () => {
    const {data} = await api.get('/talleres/motivos-cancelacion')
    return data
}

// ─── Talleres archivados ──────────────────────────────────────────────────────

export const getTalleresArchivados = async ({ anio, mes, page = 1, limit = 20 } = {}) => {
    const params = { page, limit }
    if (anio) params.anio = anio
    if (mes)  params.mes  = mes
    const { data } = await api.get('/talleres/archivados', { params })
    return data
}

export const getResumenArchivados = async () => {
    const { data } = await api.get('/talleres/archivados/resumen')
    return data
}

export const getTallerArchivadoDetalle = async (id) => {
    const { data } = await api.get(`/talleres/archivados/${id}`)
    return data
}

export const patchAsistencia = async (tallerArchivadoId, usuarioId, asistio) => {
    const { data } = await api.patch(`/talleres/archivados/${tallerArchivadoId}/asistencia/${usuarioId}`, { asistio })
    return data
}
