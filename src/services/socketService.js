import { io } from 'socket.io-client';

let socket = null;

/**
 * Conectar al servidor Socket.IO
 */
export const conectarSocket = (token) => {
  if (socket?.connected) {
    return socket;
  }

  const url = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  socket = io(url, {
    auth: {
      token
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });

  socket.on('connect', () => {
    console.log('✓ Conectado a Socket.IO');
    socket.emit('online');
  });

  socket.on('connect_error', (error) => {
    console.error('✗ Error de conexión Socket.IO:', error.message);
  });

  socket.on('disconnect', () => {
    console.log('✗ Desconectado de Socket.IO');
  });

  return socket;
};

/**
 * Desconectar del servidor Socket.IO
 */
export const desconectarSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Obtener la instancia del socket
 */
export const getSocket = () => socket;

/**
 * Escuchar nuevas notificaciones
 */
export const onNuevaNotificacion = (callback) => {
  if (!socket) return;
  socket.on('nueva_notificacion', callback);
};

/**
 * Dejar de escuchar nuevas notificaciones
 */
export const offNuevaNotificacion = () => {
  if (!socket) return;
  socket.off('nueva_notificacion');
};

/**
 * Escuchar cuando un usuario está en línea
 */
export const onUsuarioOnline = (callback) => {
  if (!socket) return;
  socket.on('user_online', callback);
};

/**
 * Escuchar cuando un usuario está escribiendo
 */
export const onUsuarioEscribiendo = (callback) => {
  if (!socket) return;
  socket.on('user_typing', callback);
};

/**
 * Emitir que estás escribiendo
 */
export const emitirEscribiendo = (receptorId) => {
  if (!socket) return;
  socket.emit('typing', { receptorId });
};

/**
 * Emitir que dejaste de escribir
 */
export const emitirDejarEscribir = (receptorId) => {
  if (!socket) return;
  socket.emit('stop_typing', { receptorId });
};

/**
 * Notificar que se marcó una notificación como leída
 */
export const emitirNotificacionLeida = (notificacionId) => {
  if (!socket) return;
  socket.emit('notificacion_leida', { notificacionId });
};
