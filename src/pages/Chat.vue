<template>
  <div class="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
    <!-- Sidebar de chats -->
    <ChatPanel
      :chats="chats"
      :chat-activo="chatActivo"
      :chats-archivados="chatsArchivados"
      :chat-archivado-activo="chatArchivadoActivo"
      :cargando-archivados="cargandoArchivados"
      @seleccionar="onSeleccionar"
      @nuevo-grupo="mostrarModalGrupo = true"
      @nuevo-directo="mostrarModalDirecto = true"
      @ver-archivado="verArchivado"
      @abrir-archivados="onAbrirArchivados"
    />

    <!-- Área de conversación -->
    <div class="flex-1 overflow-hidden">
      <!-- Chat archivado (solo lectura) -->
      <ChatArchivado
        v-if="chatArchivadoActivo"
        :chat="chatArchivadoActivo"
        :mensajes="mensajesArchivados"
        :cargando="cargandoMensajes"
        @cerrar="cerrarArchivado"
      />

      <ChatConversacion
        v-else-if="chatActivo"
        :chat="chatActivo"
        :mensajes="mensajes"
        :cargando="cargandoMensajes"
        :escribiendo="escribiendoEnChatActivo"
        :miembros="miembrosConOnline"
        @enviar="enviar"
        @escribiendo="notificarEscribiendo"
        @editar="chatParaEditar = $event; mostrarModalGrupo = true"
        @añadir-miembros="abrirAñadirMiembros"
        @chat-eliminado="onChatEliminado"
      />

      <!-- Estado vacío -->
      <div
        v-else
        class="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500 gap-3"
      >
        <i class="pi pi-comments text-5xl opacity-30"></i>
        <p class="text-base">Selecciona un chat para empezar</p>
      </div>
    </div>

    <!-- Modal crear / editar grupo -->
    <ChatGrupoModal
      v-model="mostrarModalGrupo"
      :chat-editar="chatParaEditar"
      @chat-creado="onGrupoCreado"
      @chat-actualizado="onGrupoActualizado"
      @hide="chatParaEditar = null"
    />

    <ConfirmDialog />

    <!-- Modal nuevo DM -->
    <ChatNuevoDirectoModal
      v-model="mostrarModalDirecto"
      @iniciar="abrirDirecto"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ChatPanel from '@features/Chat/ChatPanel.vue'
import ChatConversacion from '@features/Chat/ChatConversacion.vue'
import ChatArchivado from '@features/Chat/ChatArchivado.vue'
import ChatGrupoModal from '@features/Chat/ChatGrupoModal.vue'
import ChatNuevoDirectoModal from '@features/Chat/ChatNuevoDirectoModal.vue'
import ConfirmDialog from 'primevue/confirmdialog'
import { useChat } from '@composables/useChat'

const {
  chats,
  chatActivo,
  chatsArchivados,
  chatArchivadoActivo,
  mensajes,
  mensajesArchivados,
  miembrosConOnline,
  cargandoMensajes,
  cargandoArchivados,
  escribiendoEnChatActivo,
  inicializar,
  destruir,
  seleccionarChat,
  abrirDirecto,
  cargarChatsArchivados,
  verArchivado,
  cerrarArchivado,
  enviar,
  notificarEscribiendo
} = useChat()

const mostrarModalGrupo = ref(false)
const mostrarModalDirecto = ref(false)
const chatParaEditar = ref(null)

const route = useRoute()
const router = useRouter()

// Convierte el nombre de un grupo en slug URL-friendly
const slugify = (str) =>
  (str ?? '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '')

// Construye la ruta correcta según el tipo de chat
const rutaDeChat = (chat) => {
  if (chat.tipo === 'general')  return { name: 'ChatGeneral' }
  if (chat.tipo === 'grupal')   return { name: 'ChatGrupo',   params: { slug: slugify(chat.nombre) } }
  if (chat.tipo === 'directo')  return { name: 'ChatDirecto', params: { chatId: chat.id } }
  return { name: 'Chat' }
}

onMounted(async () => {
  await inicializar()

  // Restaurar chat desde la URL y verificar que el usuario pertenece a él
  let chatRestore = null
  if (route.name === 'ChatGeneral') {
    chatRestore = chats.value.find(c => c.tipo === 'general')
  } else if (route.name === 'ChatGrupo') {
    chatRestore = chats.value.find(c => c.tipo === 'grupal' && slugify(c.nombre) === route.params.slug)
  } else if (route.name === 'ChatDirecto') {
    chatRestore = chats.value.find(c => c.id === route.params.chatId)
  }

  if (chatRestore) {
    await seleccionarChat(chatRestore)
  } else if (route.name !== 'Chat') {
    // El usuario no tiene acceso o el chat no existe → redirigir
    router.replace({ name: 'Chat' })
  }
})
onUnmounted(() => destruir())

// Carga lazy de archivados (solo una vez cuando el usuario abre la sección)
let archivadosCargados = false
const onAbrirArchivados = async () => {
  if (archivadosCargados) return
  archivadosCargados = true
  await cargarChatsArchivados()
}

// Seleccionar chat y reflejar URL amigable
const onSeleccionar = async (chat) => {
  router.replace(rutaDeChat(chat))
  await seleccionarChat(chat)
}

const onGrupoCreado = (chat) => {
  chats.value.unshift(chat)
  onSeleccionar(chat)
}

const onGrupoActualizado = (chatActualizado) => {
  const idx = chats.value.findIndex(c => c.id === chatActualizado.id)
  if (idx !== -1) chats.value[idx] = { ...chats.value[idx], ...chatActualizado }
  if (chatActivo.value?.id === chatActualizado.id) {
    chatActivo.value = { ...chatActivo.value, ...chatActualizado }
  }
  chatParaEditar.value = null
}

const onChatEliminado = (chatId) => {
  chats.value = chats.value.filter(c => c.id !== chatId)
  if (chatActivo.value?.id === chatId) {
    chatActivo.value = null
    router.replace({ name: 'Chat' })
  }
}

const abrirAñadirMiembros = (_chat) => {
  // Reutilizamos el modal de grupo en modo "añadir miembros"
  // en una iteración futura se puede separar en modal propio
}
</script>
