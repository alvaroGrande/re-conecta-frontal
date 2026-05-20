<template>
  <!-- Sidebar de lista de chats -->
  <div class="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 w-72 shrink-0">
    <!-- Cabecera -->
    <div class="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
      <h2 class="font-bold text-gray-800 dark:text-slate-100 text-lg">Chat</h2>
      <Button
        v-if="esAdmin || esCoordinador"
        icon="pi pi-plus"
        size="small"
        severity="secondary"
        rounded
        v-tooltip.bottom="'Nuevo grupo'"
        @click="emit('nuevo-grupo')"
      />
    </div>

    <!-- Lista de chats -->
    <div class="flex-1 overflow-y-auto">
      <!-- General -->
      <div class="px-3 py-2">
        <p class="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">General</p>
        <button
          v-if="chatGeneral"
          class="w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-3 group"
          :class="chatActivo?.id === chatGeneral.id
            ? 'bg-blue-600 text-white'
            : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-800 dark:text-slate-200'"
          @click="emit('seleccionar', chatGeneral)"
        >
          <span class="pi pi-globe text-base shrink-0"></span>
          <span class="font-medium truncate">{{ chatGeneral.nombre }}</span>
          <span
            v-if="chatGeneral.es_efimero"
            class="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 shrink-0"
          >
            Efímero
          </span>
        </button>
      </div>

      <!-- Grupos -->
      <div v-if="chatsGrupales.length" class="px-3 py-2">
        <p class="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Grupos</p>
        <button
          v-for="chat in chatsGrupales"
          :key="chat.id"
          class="w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-3 mb-0.5"
          :class="chatActivo?.id === chat.id
            ? 'bg-blue-600 text-white'
            : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-800 dark:text-slate-200'"
          @click="emit('seleccionar', chat)"
        >
          <span class="pi pi-users text-base shrink-0"></span>
          <span class="font-medium truncate flex-1">{{ chat.nombre }}</span>
          <span
            v-if="chat.es_efimero"
            class="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 shrink-0"
          >
            Efímero
          </span>
        </button>
      </div>

      <!-- Mensajes directos -->
      <div class="px-3 py-2">
        <div class="flex items-center justify-between mb-1">
          <p class="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Mensajes directos</p>
          <button
            class="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition"
            title="Nuevo mensaje directo"
            @click="emit('nuevo-directo')"
          >
            <span class="pi pi-plus text-xs"></span>
          </button>
        </div>
        <button
          v-for="chat in chatsDirectos"
          :key="chat.id"
          class="w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-3 mb-0.5"
          :class="chatActivo?.id === chat.id
            ? 'bg-blue-600 text-white'
            : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-800 dark:text-slate-200'"
          @click="emit('seleccionar', chat)"
        >
          <span class="pi pi-comment text-base shrink-0"></span>
          <span class="font-medium truncate flex-1">{{ nombreDirecto(chat) }}</span>
        </button>
        <p
          v-if="!chatsDirectos.length"
          class="text-xs text-gray-400 dark:text-slate-600 px-1 py-1"
        >
          Ningún mensaje directo aún
        </p>
      </div>

      <!-- Archivados -->
      <div class="px-3 py-2 border-t border-gray-100 dark:border-slate-800 mt-1">
        <button
          class="flex items-center justify-between w-full text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1 hover:text-gray-600 dark:hover:text-slate-400 transition"
          @click="archivoAbierto = !archivoAbierto"
        >
          <span><i class="pi pi-box mr-1"></i>Archivados</span>
          <span :class="archivoAbierto ? 'pi pi-chevron-down' : 'pi pi-chevron-right'" class="text-xs"></span>
        </button>

        <template v-if="archivoAbierto">
          <div v-if="cargandoArchivados" class="flex justify-center py-2">
            <i class="pi pi-spin pi-spinner text-gray-400 text-sm"></i>
          </div>
          <template v-else>
            <button
              v-for="chat in chatsArchivados"
              :key="chat.id"
              class="w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-2 mb-0.5 opacity-70"
              :class="chatArchivadoActivo?.id === chat.id
                ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400'"
              @click="emit('ver-archivado', chat)"
            >
              <i class="pi pi-lock text-xs shrink-0"></i>
              <span class="text-xs truncate flex-1">{{ nombreArchivado(chat) }}</span>
              <span class="text-xs text-gray-400 dark:text-slate-600 shrink-0">
                {{ formatearFecha(chat.archivado_en) }}
              </span>
            </button>
            <p
              v-if="!chatsArchivados.length"
              class="text-xs text-gray-400 dark:text-slate-600 px-1 py-1"
            >
              Sin conversaciones archivadas
            </p>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Button from 'primevue/button'
import { useAuth } from '@composables/useAuth'

const props = defineProps({
  chats: { type: Array, default: () => [] },
  chatActivo: { type: Object, default: null },
  chatsArchivados: { type: Array, default: () => [] },
  chatArchivadoActivo: { type: Object, default: null },
  cargandoArchivados: { type: Boolean, default: false }
})

const emit = defineEmits(['seleccionar', 'nuevo-grupo', 'nuevo-directo', 'ver-archivado', 'abrir-archivados'])

const archivoAbierto = ref(false)
watch(archivoAbierto, (val) => {
  if (val) emit('abrir-archivados')
})

const { usuario } = useAuth()
const esAdmin = computed(() => usuario.value?.rol === 1)
const esCoordinador = computed(() => usuario.value?.rol === 2)

const chatGeneral = computed(() => props.chats.find(c => c.tipo === 'general'))
const chatsGrupales = computed(() => props.chats.filter(c => c.tipo === 'grupal'))
const chatsDirectos = computed(() => props.chats.filter(c => c.tipo === 'directo'))

const nombreDirecto = (chat) => {
    console.log('Calculando nombre para chat directo:', chat)
  const miId = String(usuario.value?.id ?? '')
  const otro = (chat.miembros || []).find(m => String(m.usuario?.id) !== miId)
  if (!otro?.usuario) return 'Chat directo'
  const u = otro.usuario
  return [u.nombre, u.Apellidos].filter(Boolean).join(' ')
}

const nombreArchivado = (chat) => {
  if (chat.tipo === 'directo') return nombreDirecto(chat)
  return chat.nombre || 'Chat archivado'
}

const formatearFecha = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}
</script>
