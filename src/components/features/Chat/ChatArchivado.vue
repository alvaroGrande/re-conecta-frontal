<template>
  <div class="flex flex-col h-full bg-gray-50 dark:bg-slate-800">
    <!-- Cabecera -->
    <div class="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800 px-5 py-3 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-3 min-w-0">
        <i class="pi pi-lock text-amber-600 dark:text-amber-400 text-lg shrink-0"></i>
        <div class="min-w-0">
          <h3 class="font-semibold text-amber-800 dark:text-amber-200 truncate">{{ nombreDisplay }}</h3>
          <p class="text-xs text-amber-600 dark:text-amber-400">
            Archivado el {{ formatearFecha(chat.archivado_en) }} · Solo lectura
          </p>
        </div>
      </div>
      <Button
        icon="pi pi-times"
        size="small"
        severity="secondary"
        rounded
        text
        v-tooltip.bottom="'Cerrar historial'"
        @click="emit('cerrar')"
      />
    </div>

    <!-- Aviso -->
    <div class="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-900 px-5 py-2 flex items-center gap-2 shrink-0">
      <i class="pi pi-info-circle text-amber-500 text-sm"></i>
      <p class="text-xs text-amber-700 dark:text-amber-300">
        Esta conversación lleva más de un mes inactiva y ha sido archivada. No se pueden enviar mensajes nuevos.
      </p>
    </div>

    <!-- Mensajes -->
    <div class="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
      <div v-if="cargando" class="flex justify-center items-center h-full">
        <ProgressSpinner style="width: 36px; height: 36px" />
      </div>

      <p v-else-if="!mensajes.length" class="text-center text-sm text-gray-400 dark:text-slate-500 mt-8">
        Esta conversación no tiene mensajes.
      </p>

      <template v-else>
        <div
          v-for="msg in mensajes"
          :key="msg.id"
          class="flex gap-2"
          :class="msg.usuario?.id === usuarioId ? 'flex-row-reverse' : 'flex-row'"
        >
          <div class="shrink-0 mt-auto">
            <div class="w-8 h-8 rounded-full bg-gray-400 dark:bg-slate-600 flex items-center justify-center text-white text-xs font-bold">
              {{ iniciales(msg.usuario) }}
            </div>
          </div>
          <div class="max-w-[70%] flex flex-col gap-0.5" :class="msg.usuario?.id === usuarioId ? 'items-end' : 'items-start'">
            <span v-if="msg.usuario?.id !== usuarioId" class="text-xs text-gray-500 dark:text-slate-400 px-1">
              {{ msg.usuario?.nombre }} {{ msg.usuario?.Apellidos }}
            </span>
            <div
              class="px-3 py-2 rounded-2xl text-sm leading-relaxed wrap-break-word"
              :class="msg.usuario?.id === usuarioId
                ? 'bg-gray-400 dark:bg-slate-600 text-white rounded-br-sm'
                : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 shadow-sm rounded-bl-sm'"
            >
              {{ msg.contenido }}
            </div>
            <span class="text-xs text-gray-400 dark:text-slate-500 px-1">
              {{ formatearHora(msg.creado_en) }}
            </span>
          </div>
        </div>
      </template>
    </div>

    <!-- Footer deshabilitado -->
    <div class="bg-gray-100 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 px-5 py-3 shrink-0 flex items-center gap-2 opacity-60">
      <i class="pi pi-lock text-gray-400 text-sm"></i>
      <p class="text-sm text-gray-400 dark:text-slate-500">Conversación archivada — no se pueden enviar mensajes</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import { useAuth } from '@composables/useAuth'

const props = defineProps({
  chat: { type: Object, required: true },
  mensajes: { type: Array, default: () => [] },
  cargando: { type: Boolean, default: false }
})

const emit = defineEmits(['cerrar'])

const { usuario } = useAuth()

const usuarioId = computed(() => usuario.value?.id)

const nombreDisplay = computed(() => {
  if (props.chat.tipo === 'directo') {
    const miId = String(usuarioId.value ?? '')
    const otro = (props.chat.miembros || []).find(m => String(m.usuario?.id) !== miId)
    if (otro?.usuario) {
      return [otro.usuario.nombre, otro.usuario.Apellidos].filter(Boolean).join(' ')
    }
    return 'Chat directo'
  }
  return props.chat.nombre || 'Chat archivado'
})

const iniciales = (u) => {
  if (!u) return '?'
  return ((u.nombre?.[0] || '') + (u.Apellidos?.[0] || '')).toUpperCase() || '?'
}

const formatearHora = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

const formatearFecha = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
}
</script>
