import api from './api';
import { getSocket } from './socketService';

const BASE = '/chat';

// ── REST ─────────────────────────────────────────────────────────────────────

export const obtenerChats = async () => {
  const { data } = await api.get(BASE);
  return data.data;
};

export const obtenerChatsArchivados = async () => {
  const { data } = await api.get(`${BASE}/archivados`);
  return data.data;
};

export const obtenerMensajesArchivados = async (chatId) => {
  const { data } = await api.get(`${BASE}/archivados/${chatId}/mensajes`);
  return data.data;
};

export const iniciarChatDirecto = async (usuarioId) => {
  const { data } = await api.post(`${BASE}/directo/${usuarioId}`);
  return data.data;
};

export const obtenerChatPorId = async (chatId) => {
  const { data } = await api.get(`${BASE}/${chatId}`);
  return data.data;
};

export const crearChat = async (payload) => {
  const { data } = await api.post(BASE, payload);
  return data.data;
};

export const actualizarChat = async (chatId, cambios) => {
  const { data } = await api.put(`${BASE}/${chatId}`, cambios);
  return data.data;
};

export const eliminarChat = async (chatId) => {
  const { data } = await api.delete(`${BASE}/${chatId}`);
  return data;
};

export const obtenerMensajes = async (chatId, { limite = 50, antes = null } = {}) => {
  const { data } = await api.get(`${BASE}/${chatId}/mensajes`, {
    params: { limite, antes }
  });
  return data.data;
};

export const añadirMiembros = async (chatId, usuarios) => {
  const { data } = await api.post(`${BASE}/${chatId}/miembros`, { usuarios });
  return data;
};

export const eliminarMiembro = async (chatId, usuarioId) => {
  const { data } = await api.delete(`${BASE}/${chatId}/miembros/${usuarioId}`);
  return data;
};

// ── Socket.IO ─────────────────────────────────────────────────────────────────

/** Conectar al chat: une el socket a las salas del usuario */
export const conectarChat = () => {
  const socket = getSocket();
  if (socket) socket.emit('chat:conectar');
};

/** Unirse manualmente a la sala de un chat */
export const unirseAChat = (chatId) => {
  const socket = getSocket();
  if (socket) socket.emit('chat:unirse', { chatId });
};

/** Enviar un mensaje a un chat */
export const enviarMensaje = (chatId, contenido) => {
  const socket = getSocket();
  if (socket) socket.emit('chat:mensaje', { chatId, contenido });
};

/** Emitir "está escribiendo" */
export const emitirEscribiendo = (chatId) => {
  const socket = getSocket();
  if (socket) socket.emit('chat:escribiendo', { chatId });
};

/** Emitir "paró de escribir" */
export const emitirParoEscribiendo = (chatId) => {
  const socket = getSocket();
  if (socket) socket.emit('chat:parar_escribiendo', { chatId });
};

/** Escuchar nuevos mensajes */
export const onNuevoMensaje = (callback) => {
  const socket = getSocket();
  if (socket) socket.on('chat:nuevo_mensaje', callback);
};

export const offNuevoMensaje = () => {
  const socket = getSocket();
  if (socket) socket.off('chat:nuevo_mensaje');
};

/** Escuchar nuevo grupo al que me añadieron */
export const onNuevoGrupo = (callback) => {
  const socket = getSocket();
  if (socket) socket.on('chat:nuevo_grupo', callback);
};

export const offNuevoGrupo = () => {
  const socket = getSocket();
  if (socket) socket.off('chat:nuevo_grupo');
};

/** Escuchar nuevo chat directo iniciado por otro usuario */
export const onNuevoDirecto = (callback) => {
  const socket = getSocket();
  if (socket) socket.on('chat:nuevo_directo', callback);
};

export const offNuevoDirecto = () => {
  const socket = getSocket();
  if (socket) socket.off('chat:nuevo_directo');
};

/** Escuchar que un chat fue eliminado */
export const onChatEliminado = (callback) => {
  const socket = getSocket();
  if (socket) socket.on('chat:eliminado', callback);
};

export const offChatEliminado = () => {
  const socket = getSocket();
  if (socket) socket.off('chat:eliminado');
};

/** Escuchar indicadores de escritura */
export const onUsuarioEscribiendo = (callback) => {
  const socket = getSocket();
  if (socket) socket.on('chat:usuario_escribiendo', callback);
};

export const offUsuarioEscribiendo = () => {
  const socket = getSocket();
  if (socket) socket.off('chat:usuario_escribiendo');
};

export const onUsuarioParoEscribiendo = (callback) => {
  const socket = getSocket();
  if (socket) socket.on('chat:usuario_paró_escribiendo', callback);
};

export const offUsuarioParoEscribiendo = () => {
  const socket = getSocket();
  if (socket) socket.off('chat:usuario_paró_escribiendo');
};

/** Escuchar que un chat efímero ha caducado y fue archivado */
export const onChatExpirado = (callback) => {
  const socket = getSocket();
  if (socket) socket.on('chat:expirado', callback);
};

export const offChatExpirado = () => {
  const socket = getSocket();
  if (socket) socket.off('chat:expirado');
};
