import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { logout } from '@services/auth'
import { showWarn } from '@services/toastService'

/**
 * Composable para detectar inactividad del usuario
 * @param {number} timeout - Tiempo de inactividad en milisegundos (default: 60000 = 1 minuto)
 * @param {number} warningTimeout - Tiempo del contador de advertencia en segundos (default: 30)
 */
export function useInactivityTimer(timeout = 1500, warningTimeout = 30) {
  const router = useRouter()
  let inactivityTimer = null
  let warningTimer = null
  let countdownInterval = null
  const isActive = ref(true)
  const showWarningModal = ref(false)
  const timeRemaining = ref(0)
  const showTimerBadge = ref(false)

  const resetTimer = () => {
    // Verificar si hay sesión activa antes de resetear
    const token = localStorage.getItem('token')
    if (!token) {
      console.log('❌ Sin token - Deteniendo timer')
      stopTimer()
      return
    }

    // Limpiar timers existentes
    if (inactivityTimer) {
      clearTimeout(inactivityTimer)
    }
    if (warningTimer) {
      clearTimeout(warningTimer)
    }
    if (countdownInterval) {
      clearInterval(countdownInterval)
    }

    // Cerrar modal y badge si estaban abiertos
    showWarningModal.value = false
    showTimerBadge.value = false
    timeRemaining.value = 0
    isActive.value = true

    // Crear nuevo timer de inactividad
    inactivityTimer = setTimeout(() => {
      showWarning()
    }, timeout)
  }

  const showWarning = () => {
    console.log('⚠️ Inactividad detectada - Mostrando timer badge')
    // Mostrar badge con timer
    showTimerBadge.value = true
    timeRemaining.value = warningTimeout
    isActive.value = false

    // Iniciar countdown visible
    countdownInterval = setInterval(() => {
      timeRemaining.value--
      if (timeRemaining.value % 5 === 0) {
        console.log(`⏱️ Timer: ${timeRemaining.value}s restantes`)
      }
      
      if (timeRemaining.value <= 0) {
        clearInterval(countdownInterval)
        showTimerBadge.value = false
        console.log('🚨 Timer expirado - Mostrando modal')
        // Mostrar modal después del countdown
        showWarningModal.value = true
      }
    }, 1000)

    // Iniciar timer de advertencia (warningTimeout segundos)
    warningTimer = setTimeout(() => {
      handleInactivity()
    }, warningTimeout * 1000)
  }

  const handleInactivity = () => {
    // Cerrar modal
    showWarningModal.value = false
    
    // Cerrar sesión por inactividad
    logout('inactividad')
    
    // Mostrar mensaje
    showWarn('Sesión cerrada por inactividad', 'Tu sesión ha sido cerrada automáticamente debido a inactividad.')
    
    // Redirigir al login
    router.push({ name: 'Login' })
  }

  const handleContinue = () => {
    // Usuario interactuó, cancelar cierre de sesión
    if (warningTimer) {
      clearTimeout(warningTimer)
    }
    if (countdownInterval) {
      clearInterval(countdownInterval)
    }
    showWarningModal.value = false
    showTimerBadge.value = false
    timeRemaining.value = 0
    resetTimer()
  }

  const setupListeners = () => {
    // Eventos que indican actividad del usuario
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ]

    events.forEach(event => {
      window.addEventListener(event, resetTimer, true)
    })
  }

  const removeListeners = () => {
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ]

    events.forEach(event => {
      window.removeEventListener(event, resetTimer, true)
    })
  }

  const startTimer = () => {
    // Solo iniciar si hay token (usuario autenticado)
    const token = localStorage.getItem('token')
    console.log('🔍 Verificando autenticación:', token ? '✅ Token encontrado' : '❌ Sin token')
    if (token) {
      console.log('⏰ Iniciando timer de inactividad')
      setupListeners()
      resetTimer()
    }
  }

  const stopTimer = () => {
    console.log('🛑 Deteniendo timer de inactividad')
    if (inactivityTimer) {
      clearTimeout(inactivityTimer)
    }
    if (warningTimer) {
      clearTimeout(warningTimer)
    }
    if (countdownInterval) {
      clearInterval(countdownInterval)
    }
    // Cerrar modales si están abiertos
    showWarningModal.value = false
    showTimerBadge.value = false
    timeRemaining.value = 0
    removeListeners()
  }

  onMounted(() => {
    startTimer()
  })

  onUnmounted(() => {
    stopTimer()
  })

  return {
    isActive,
    showWarningModal,
    showTimerBadge,
    timeRemaining,
    resetTimer,
    startTimer,
    stopTimer,
    handleContinue,
    handleInactivity
  }
}
