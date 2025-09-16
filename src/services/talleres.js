import api from './api'

export const getTalleres = async () => {
    const {data} = await api.get('/talleres')
    return data
}

export const crearTaller = async (taller) => {
    const {data} = await api.post('/talleres', taller)
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

export const inscribirTaller = async (id) => {
    const {data} = await api.post(`/talleres/inscribir/${id}`)
    return data
}