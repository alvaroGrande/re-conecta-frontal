import api from './api'

export const getTalleres = async ({ page = 1, limit = 50 } = {}) => {
    const {data} = await api.get('/talleres', { params: { page, limit } })
    return data  // { data: [...], total, page, limit }
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

// ─── Documentos PDF ────────────────────────────────────────────────────────────────────────────

export const getDocumentos = async (tallerId) => {
    const { data } = await api.get(`/talleres/${tallerId}/documentos`)
    return data
}

export const eliminarDocumentoPDF = async (tallerId, docId) => {
    const { data } = await api.delete(`/talleres/${tallerId}/documentos/${docId}`)
    return data
}

export const subirDocumentoPDF = async (tallerId, archivo, onProgress) => {
    const CHUNK_SIZE = 256 * 1024  // 256 KB de base64 por petición

    const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            const result = reader.result
            resolve(result.slice(result.indexOf(',') + 1))
        }
        reader.onerror = reject
        reader.readAsDataURL(archivo)
    })

    const sessionId = crypto.randomUUID()
    const chunks = []
    for (let i = 0; i < base64.length; i += CHUNK_SIZE) {
        chunks.push(base64.slice(i, i + CHUNK_SIZE))
    }

    let lastData = null
    for (let i = 0; i < chunks.length; i++) {
        const { data } = await api.post(`/talleres/${tallerId}/documentos/chunk`, {
            sessionId,
            index:  i,
            total:  chunks.length,
            nombre: archivo.name,
            data:   chunks[i],
        })
        lastData = data
        onProgress?.((i + 1) / chunks.length)
    }
    return lastData
}
