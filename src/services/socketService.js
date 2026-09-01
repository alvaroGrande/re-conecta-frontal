import { io } from 'socket.io-client';

let socket = null;
const isDev = import.meta.env.DEV;
const MAX_DEBUG_EVENTS = 120;

const debugSubscribers = new Set();
const debugState = {
  connected: false,
  socketId: null,
  transport: null,
  lastError: null,
  lastUpdatedAt: null,
  events: []
};

const getDebugSnapshot = () => ({
  ...debugState,
  events: [...debugState.events]
});

const notifyDebugSubscribers = () => {
  if (!isDev) return;

  const snapshot = getDebugSnapshot();
  debugSubscribers.forEach((callback) => callback(snapshot));
};

const normalizePayload = (args) => {
  if (!args || args.length === 0) return '(sin payload)';

  const payload = args.length === 1 ? args[0] : args;
  try {
    const serialized = JSON.stringify(payload);
    return serialized.length > 320 ? `${serialized.slice(0, 320)}...` : serialized;
  } catch {
    return '[payload no serializable]';
  }
};

const pushDebugEvent = (direction, event, args = []) => {
  if (!isDev) return;

  debugState.events.unshift({
    at: new Date().toISOString(),
    direction,
    event,
    payload: normalizePayload(args)
  });

  if (debugState.events.length > MAX_DEBUG_EVENTS) {
    debugState.events.length = MAX_DEBUG_EVENTS;
  }

  debugState.lastUpdatedAt = new Date().toISOString();
  notifyDebugSubscribers();
};

const updateDebugConnection = (partialState) => {
  if (!isDev) return;

  Object.assign(debugState, partialState, { lastUpdatedAt: new Date().toISOString() });
  notifyDebugSubscribers();
};

const instrumentSocket = (socketInstance) => {
  if (!isDev || socketInstance.__debugInstrumented) return;

  const originalEmit = socketInstance.emit.bind(socketInstance);
  socketInstance.emit = (event, ...args) => {
    pushDebugEvent('out', event, args);
    return originalEmit(event, ...args);
  };

  socketInstance.onAny((event, ...args) => {
    pushDebugEvent('in', event, args);
  });

  socketInstance.__debugInstrumented = true;
};

export const subscribeSocketDebug = (callback) => {
  if (!isDev || typeof callback !== 'function') {
    return () => {};
  }

  debugSubscribers.add(callback);
  callback(getDebugSnapshot());

  return () => {
    debugSubscribers.delete(callback);
  };
};

export const clearSocketDebugEvents = () => {
  if (!isDev) return;

  debugState.events = [];
  debugState.lastUpdatedAt = new Date().toISOString();
  notifyDebugSubscribers();
};

/**
 * Conectar al servidor Socket.IO
 */
export const conectarSocket = (token) => {
  if (socket?.connected) {
    return socket;
  }

  const url = import.meta.env.VITE_API_URL || 'http://localhost:3003';

  socket = io(url, {
    auth: {
      token
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });

  instrumentSocket(socket);
  updateDebugConnection({
    connected: false,
    socketId: null,
    transport: socket.io.engine.transport.name,
    lastError: null
  });

  socket.on('connect', () => {
    console.log('✓ Conectado a Socket.IO');
    updateDebugConnection({
      connected: true,
      socketId: socket.id,
      transport: socket.io.engine.transport.name,
      lastError: null
    });

    socket.io.engine.on('upgrade', (transport) => {
      updateDebugConnection({ transport: transport?.name || socket.io.engine.transport.name });
    });

    socket.emit('online');
  });

  socket.on('connect_error', (error) => {
    console.error('✗ Error de conexión Socket.IO:', error.message);
    updateDebugConnection({
      connected: false,
      socketId: null,
      lastError: error.message
    });
  });

  socket.on('disconnect', (reason) => {
    console.log('✗ Desconectado de Socket.IO');
    updateDebugConnection({
      connected: false,
      socketId: null,
      lastError: reason || null
    });
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
    updateDebugConnection({
      connected: false,
      socketId: null,
      transport: null
    });
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
