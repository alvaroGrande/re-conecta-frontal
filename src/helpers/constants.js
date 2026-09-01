const TIPO_CURSO = {
  PRESENCIAL: 'presencial',
  ONLINE: 'online'
};

const TIPO_PAGO_CURSO = {
  GRATIS: 'gratis',
  PAGO: 'pago'
};

// Configuración de timers de inactividad
const INACTIVITY_CONFIG = {
  // Tiempo de inactividad antes de mostrar la primera advertencia (en milisegundos)
  WARNING_TIMEOUT: 10 * 60 * 1000, // 10 minutos
  // Tiempo del contador de advertencia antes de cerrar sesión (en segundos)
  COUNTDOWN_DURATION: 12  // 12 segundos
};

// Configuración de supervisores
const SUPERVISORES_CONFIG = {
  // Número máximo recomendado de usuarios por supervisor
  MAX_USUARIOS_POR_SUPERVISOR: 10
};

export { TIPO_CURSO, TIPO_PAGO_CURSO, INACTIVITY_CONFIG, SUPERVISORES_CONFIG };