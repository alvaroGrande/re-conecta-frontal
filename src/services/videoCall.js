import api from './api'

/**
 * Crea una nueva reunión de Zoom
 */
export const createMeeting = async (meetingConfig) => {
    const { data } = await api.post('/video-calls/create-room', meetingConfig)
    return data
}

/**
 * Obtiene la firma necesaria para unirse a una reunión con Zoom SDK
 */
export const getMeetingSignature = async (signatureConfig) => {
    const { data } = await api.post('/video-calls/signature', signatureConfig)
    return data
}

/**
 * Obtiene información de una reunión existente
 */
export const getMeetingInfo = async (meetingId) => {
    const { data } = await api.get(`/video-calls/meeting/${meetingId}`)
    return data
}
