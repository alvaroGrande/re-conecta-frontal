import { ref, computed } from 'vue'
import { showWarn } from '@services/toastService'
import {
  obtenerChats, obtenerChatPorId, obtenerMensajes, enviarMensaje,
  obtenerChatsArchivados, obtenerMensajesArchivados,
  conectarChat, unirseAChat,
  onNuevoMensaje, offNuevoMensaje,
  onNuevoGrupo, offNuevoGrupo,
  onNuevoDirecto, offNuevoDirecto,
  onChatEliminado, offChatEliminado,
  onChatExpirado, offChatExpirado,
  onUsuarioEscribiendo, offUsuarioEscribiendo,
  onUsuarioParoEscribiendo, offUsuarioParoEscribiendo,
  emitirEscribiendo, emitirParoEscribiendo,
  iniciarChatDirecto as apiIniciarDirecto
} from '@services/chat'
import { onUsuarioOnline } from '@services/socketService'
import { getSocket } from '@services/socketService'

const CHAT_GENERAL_ID = '00000000-0000-0000-0000-000000000001'

// Estado global compartido entre componentes
const chats = ref([])
const chatsArchivados = ref([])       // chats archivados (solo lectura)
const chatActivo = ref(null)
const chatArchivadoActivo = ref(null) // chat archivado que se está viendo
const miembrosActivos = ref([])   // miembros del chat activo con info
const mensajes = ref([])
const mensajesArchivados = ref([])    // mensajes del chat archivado
const cargandoMensajes = ref(false)
const cargandoArchivados = ref(false)
const escribiendo = ref({}) // { chatId: { userId: nombre } }
const usuariosOnline = ref(new Set()) // Set de userIds online

let typingTimer = null

export function useChat() {
  const chatGeneral = computed(() => chats.value.find(c => c.id === CHAT_GENERAL_ID))
  const chatsGrupales = computed(() => chats.value.filter(c => c.tipo === 'grupal'))
  const chatsDirectos = computed(() => chats.value.filter(c => c.tipo === 'directo'))

  // ── Inicialización ─────────────────────────────────────────────────────────

  const inicializar = async () => {
    await cargarChats()
    conectarChat()
    _registrarEventos()
  }

  const destruir = () => {
    offNuevoMensaje()
    offNuevoGrupo()
    offNuevoDirecto()
    offChatEliminado()
    offChatExpirado()
    offUsuarioEscribiendo()
    offUsuarioParoEscribiendo()
  }

  // ── Chats ──────────────────────────────────────────────────────────────────

  const cargarChats = async () => {
    chats.value = await obtenerChats()
  }

  const cargarChatsArchivados = async () => {
    cargandoArchivados.value = true
    try {
      chatsArchivados.value = await obtenerChatsArchivados()
    } finally {
      cargandoArchivados.value = false
    }
  }

  const verArchivado = async (chat) => {
    chatActivo.value = null          // cerrar chat activo
    chatArchivadoActivo.value = chat
    cargandoMensajes.value = true
    try {
      mensajesArchivados.value = await obtenerMensajesArchivados(chat.id)
    } finally {
      cargandoMensajes.value = false
    }
  }

  const cerrarArchivado = () => {
    chatArchivadoActivo.value = null
    mensajesArchivados.value = []
  }

  const seleccionarChat = async (chat) => {
    chatActivo.value = chat
    escribiendo.value = {}
    unirseAChat(chat.id)
    await _cargarMensajes(chat.id)
    await _cargarMiembros(chat.id)
  }

  const _cargarMiembros = async (chatId) => {
    try {
      const detalle = await obtenerChatPorId(chatId)
      miembrosActivos.value = (detalle.miembros || []).map(m => m.usuario).filter(Boolean)
    } catch {
      miembrosActivos.value = []
    }
  }

  const _cargarMensajes = async (chatId) => {
    cargandoMensajes.value = true
    try {
      mensajes.value = await obtenerMensajes(chatId)
    } finally {
      cargandoMensajes.value = false
    }
  }

  // ── Mensajes ───────────────────────────────────────────────────────────────

  const enviar = (contenido) => {
    if (!chatActivo.value || !contenido?.trim()) return
    enviarMensaje(chatActivo.value.id, contenido.trim())
    _emitirEscribiendoStop()
  }

  const notificarEscribiendo = () => {
    if (!chatActivo.value) return
    emitirEscribiendo(chatActivo.value.id)

    clearTimeout(typingTimer)
    typingTimer = setTimeout(() => _emitirEscribiendoStop(), 2500)
  }

  const _emitirEscribiendoStop = () => {
    if (chatActivo.value) emitirParoEscribiendo(chatActivo.value.id)
    clearTimeout(typingTimer)
  }

  // ── Eventos Socket.IO ──────────────────────────────────────────────────────

  const _registrarEventos = () => {
    // Eventos online/offline del socket global
    const socket = getSocket()
    if (socket) {
      socket.on('user_online', ({ userId }) => usuariosOnline.value.add(userId))
      socket.on('user_offline', ({ userId }) => usuariosOnline.value.delete(userId))
    }
    onNuevoMensaje(({ chatId, mensaje }) => {
      if (chatActivo.value?.id === chatId) {
        mensajes.value.push(mensaje)
      }
      // Actualizar badge de chat en lista (mover al inicio)
      const idx = chats.value.findIndex(c => c.id === chatId)
      if (idx > 0) {
        const [chat] = chats.value.splice(idx, 1)
        chats.value.unshift(chat)
      }
    })

    onNuevoGrupo(({ chat }) => {
      if (!chats.value.find(c => c.id === chat.id)) {
        chats.value.unshift(chat)
      }
    })

    onNuevoDirecto(({ chat }) => {
      if (!chats.value.find(c => c.id === chat.id)) {
        chats.value.unshift(chat)
      }
    })

    onChatEliminado(({ chatId }) => {
      chats.value = chats.value.filter(c => c.id !== chatId)
      if (chatActivo.value?.id === chatId) {
        chatActivo.value = null
        mensajes.value = []
      }
    })

    onChatExpirado(({ chatId }) => {
      // Buscar el chat en la lista activa
      const idx = chats.value.findIndex(c => c.id === chatId)
      const chatExpirado = idx !== -1 ? chats.value[idx] : null

      // Quitarlo de la lista de chats activos
      if (idx !== -1) chats.value.splice(idx, 1)

      // Si está abierto: cerrar la vista y moverlo a archivados
      if (chatActivo.value?.id === chatId) {
        chatActivo.value = null
        mensajes.value = []
        miembrosActivos.value = []
        showWarn(
          'Chat archivado',
          'Este chat efímero ha caducado y ha sido archivado. Puedes consultarlo en "Archivados".'
        )
      }

      // Añadirlo a la lista de archivados si aún no está
      if (chatExpirado && !chatsArchivados.value.find(c => c.id === chatId)) {
        chatsArchivados.value.unshift({ ...chatExpirado, archivado: true })
      }
    })

    onUsuarioEscribiendo(({ chatId, userId, nombre }) => {
      if (!escribiendo.value[chatId]) escribiendo.value[chatId] = {}
      escribiendo.value[chatId][userId] = nombre
    })

    onUsuarioParoEscribiendo(({ chatId, userId }) => {
      if (escribiendo.value[chatId]) {
        delete escribiendo.value[chatId][userId]
      }
    })
  }

  const escribiendoEnChatActivo = computed(() => {
    if (!chatActivo.value) return []
    return Object.values(escribiendo.value[chatActivo.value.id] || {})
  })

  const miembrosConOnline = computed(() =>
    miembrosActivos.value.map(m => ({
      ...m,
      online: usuariosOnline.value.has(m.id)
    }))
  )

  const abrirDirecto = async (usuarioId) => {
    const chat = await apiIniciarDirecto(usuarioId)
    if (!chats.value.find(c => c.id === chat.id)) {
      chats.value.unshift(chat)
    }
    await seleccionarChat(chat)
  }

  return {
    chats,
    chatActivo,
    chatsArchivados,
    chatArchivadoActivo,
    mensajes,
    mensajesArchivados,
    miembrosActivos,
    miembrosConOnline,
    cargandoMensajes,
    cargandoArchivados,
    chatGeneral,
    chatsGrupales,
    chatsDirectos,
    escribiendoEnChatActivo,
    inicializar,
    destruir,
    cargarChats,
    cargarChatsArchivados,
    seleccionarChat,
    abrirDirecto,
    verArchivado,
    cerrarArchivado,
    enviar,
    notificarEscribiendo
  }
}
