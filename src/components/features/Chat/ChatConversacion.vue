<template>
  <div class="flex h-full overflow-hidden bg-gray-50 dark:bg-slate-800">
    <!-- â”€â”€ Columna central: chat â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
    <div class="flex flex-col flex-1 min-w-0">
      <!-- Cabecera -->
      <div class="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-5 py-3 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-3 min-w-0">
          <span :class="chat.tipo === 'general' ? 'pi pi-globe' : chat.tipo === 'directo' ? 'pi pi-comment' : 'pi pi-users'" class="text-blue-500 text-lg shrink-0"></span>
          <div class="min-w-0">
            <h3 class="font-semibold text-gray-800 dark:text-slate-100 truncate">{{ nombreDisplay }}</h3>
            <!-- Indicador de escritura en la cabecera -->
            <Transition name="fade">
              <p v-if="escribiendo.length" class="text-xs text-blue-500 dark:text-blue-400 truncate">
                <i class="pi pi-pencil text-xs mr-1"></i>
                {{ escribiendo.join(', ') }} {{ escribiendo.length === 1 ? 'está escribiendo...' : 'están escribiendo...' }}
              </p>
              <p v-else-if="chat.descripcion" class="text-xs text-gray-500 dark:text-slate-400 truncate">{{ chat.descripcion }}</p>
            </Transition>
          </div>
          <span
            v-if="chat.es_efimero"
            class="ml-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 flex items-center gap-1 shrink-0"
          >
            <i class="pi pi-clock text-xs"></i>
            {{ chat.ttl_horas ? `${chat.ttl_horas}h` : 'Efímero' }}
          </span>
        </div>

        <div class="flex items-center gap-1 shrink-0">
          <!-- Toggle panel miembros -->
          <Button
            v-if="miembros.length"
            :icon="mostrarMiembros ? 'pi pi-times' : 'pi pi-users'"
            size="small"
            :severity="mostrarMiembros ? 'info' : 'secondary'"
            rounded
            text
            v-tooltip.bottom="mostrarMiembros ? 'Ocultar miembros' : 'Ver miembros'"
            @click="mostrarMiembros = !mostrarMiembros"
          />
          <!-- Acciones admin/creador -->
          <template v-if="chat.tipo !== 'general' && (esAdmin || esCreador)">
            <Button icon="pi pi-pencil" size="small" severity="secondary" rounded text v-tooltip.bottom="'Editar grupo'" @click="emit('editar', chat)" />
            <Button icon="pi pi-user-plus" size="small" severity="secondary" rounded text v-tooltip.bottom="'Añadir miembros'" @click="emit('añadir-miembros', chat)" />
            <Button icon="pi pi-trash" size="small" severity="danger" rounded text v-tooltip.bottom="'Eliminar grupo'" @click="confirmarEliminar" />
          </template>
        </div>
      </div>

      <!-- Área de mensajes -->
      <div ref="areaMensajes" class="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        <div v-if="cargando" class="flex justify-center items-center h-full">
          <ProgressSpinner style="width: 36px; height: 36px" />
        </div>

        <p v-else-if="!mensajes.length" class="text-center text-sm text-gray-400 dark:text-slate-500 mt-8">
          Aún no hay mensajes. ¡Sé el primero en escribir!
        </p>

        <template v-else>
          <div
            v-for="msg in mensajes"
            :key="msg.id"
            class="flex gap-2"
            :class="msg.usuario?.id === usuarioId ? 'flex-row-reverse' : 'flex-row'"
          >
            <div class="shrink-0 mt-auto">
              <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                {{ iniciales(msg.usuario) }}
              </div>
            </div>
            <div class="max-w-[70%] flex flex-col gap-0.5" :class="msg.usuario?.id === usuarioId ? 'items-end' : 'items-start'">
              <span v-if="msg.usuario?.id !== usuarioId" class="text-xs text-gray-500 dark:text-slate-400 px-1">
                {{ msg.usuario?.nombre }} {{ msg.usuario?.Apellidos }}
              </span>
              <div
                class="px-3 py-2 rounded-2xl text-sm leading-relaxed break-words"
                :class="msg.usuario?.id === usuarioId
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 shadow-sm rounded-bl-sm'"
              >
                {{ msg.contenido }}
              </div>
              <span class="text-xs text-gray-400 dark:text-slate-500 px-1">
                {{ formatearHora(msg.creado_en) }}
                <span v-if="msg.expira_en" class="ml-1 text-amber-500">expira {{ formatearHora(msg.expira_en) }}</span>
              </span>
            </div>
          </div>
        </template>
      </div>

      <!-- Input de mensaje -->
      <div class="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 p-3 shrink-0">
        <div class="flex gap-2 items-end">
          <Textarea
            v-model="texto"
            placeholder="Escribe un mensaje..."
            :autoResize="true"
            rows="1"
            class="flex-1 resize-none text-sm"
            @keydown.enter.exact.prevent="enviar"
            @input="onInput"
          />
          <Button icon="pi pi-send" :disabled="!texto.trim()" @click="enviar" />
        </div>
        <p class="text-xs text-gray-400 dark:text-slate-500 mt-1 px-1">Enter para enviar · Shift+Enter para salto de línea</p>
      </div>
    </div>

    <!-- ── Panel lateral: miembros ─────────────────────────────────────────────── -->
    <Transition name="slide-left">
      <div
        v-if="mostrarMiembros && miembros.length"
        class="w-60 shrink-0 border-l border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col overflow-hidden"
      >
        <div class="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
          <p class="text-sm font-semibold text-gray-700 dark:text-slate-300">
            Miembros <span class="text-gray-400 dark:text-slate-500 font-normal">({{ miembros.length }})</span>
          </p>
          <p class="text-xs text-green-600 dark:text-green-400 mt-0.5">
            {{ miembrosOnline.length }} en línea
          </p>
        </div>
        <div class="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1">
          <!-- Online primero -->
          <template v-for="m in miembrosOrdenados" :key="m.id">
            <div class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition">
              <div class="relative shrink-0">
                <div class="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  {{ iniciales(m) }}
                </div>
                <span
                  class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900"
                  :class="m.online ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600'"
                ></span>
              </div>
              <div class="min-w-0">
                <p class="text-xs font-medium text-gray-800 dark:text-slate-200 truncate">
                  {{ m.nombre }} {{ m.Apellidos }}
                </p>
                <p class="text-xs" :class="m.online ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-slate-500'">
                  {{ m.online ? 'En l­nea' : 'Desconectado' }}
                </p>
              </div>
            </div>
          </template>
        </div>
      </div>
    </Transition>

    <ConfirmDialog />
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import ProgressSpinner from 'primevue/progressspinner'
import ConfirmDialog from 'primevue/confirmdialog'
import { useAuth } from '@composables/useAuth'
import { useConfirm } from 'primevue/useconfirm'
import { eliminarChat as apiEliminarChat } from '@services/chat'
import { useToast } from 'primevue/usetoast'

const props = defineProps({
  chat: { type: Object, required: true },
  mensajes: { type: Array, default: () => [] },
  cargando: { type: Boolean, default: false },
  escribiendo: { type: Array, default: () => [] },
  miembros: { type: Array, default: () => [] }
})

const emit = defineEmits(['enviar', 'escribiendo', 'editar', 'añadir-miembros', 'chat-eliminado'])

const { usuario } = useAuth()
const confirm = useConfirm()
const toast = useToast()

const texto = ref('')
const areaMensajes = ref(null)
const mostrarMiembros = ref(false)

const usuarioId = computed(() => usuario.value?.id)
const esAdmin = computed(() => usuario.value?.rol === 1)
const esCreador = computed(() => props.chat?.creado_por_usuario?.id === usuarioId.value)

const miembrosOnline = computed(() => props.miembros.filter(m => m.online))
const miembrosOrdenados = computed(() => [...props.miembros].sort((a, b) => (b.online ? 1 : 0) - (a.online ? 1 : 0)))

const nombreDisplay = computed(() => {
  if (props.chat.tipo !== 'directo') return props.chat.nombre
  const miId = String(usuarioId.value ?? '')
  const otro = props.miembros.find(m => String(m.id) !== miId)
  if (!otro) return 'Chat directo'
  return [otro.nombre, otro.Apellidos].filter(Boolean).join(' ')
})

// Cerrar panel al cambiar de chat
watch(() => props.chat?.id, () => { mostrarMiembros.value = false })

const iniciales = (u) => {
  if (!u) return '?'
  return ((u.nombre?.[0] || '') + (u.Apellidos?.[0] || '')).toUpperCase() || '?'
}

const formatearHora = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

const enviar = () => {
  if (!texto.value.trim()) return
  emit('enviar', texto.value)
  texto.value = ''
}

let typingTimer = null
const onInput = () => {
  emit('escribiendo')
  clearTimeout(typingTimer)
  typingTimer = setTimeout(() => {}, 2500)
}

const confirmarEliminar = () => {
  confirm.require({
    message: `¿Eliminar el grupo "${props.chat.nombre}"? Esta acción no se puede deshacer.`,
    header: 'Eliminar grupo',
    icon: 'pi pi-exclamation-triangle',
    acceptSeverity: 'danger',
    acceptLabel: 'Eliminar',
    rejectLabel: 'Cancelar',
    accept: async () => {
      try {
        await apiEliminarChat(props.chat.id)
        emit('chat-eliminado', props.chat.id)
        toast.add({ severity: 'success', summary: 'Grupo eliminado', life: 3000 })
      } catch {
        toast.add({ severity: 'error', summary: 'Error al eliminar el grupo', life: 3000 })
      }
    }
  })
}

watch(() => props.mensajes.length, async () => {
  await nextTick()
  if (areaMensajes.value) {
    areaMensajes.value.scrollTop = areaMensajes.value.scrollHeight
  }
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-left-enter-active, .slide-left-leave-active { transition: all 0.2s ease; }
.slide-left-enter-from, .slide-left-leave-to { opacity: 0; transform: translateX(20px); }
</style>