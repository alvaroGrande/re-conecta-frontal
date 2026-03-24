<script setup>
import { computed } from 'vue'

const props = defineProps({
  taller:       { type: Object,  required: true },
  inscrito:     { type: Boolean, default: false },
  procesando:   { type: Boolean, default: false },
  esAdmin:      { type: Boolean, default: false },
  esSupervisor: { type: Boolean, default: false },
  pdfPendiente: { type: Boolean, default: false },
  pdfNuevo:     { type: Boolean, default: false },
})

const emit = defineEmits([
  'toggle-inscripcion',
  'ver-inscritos',
  'gestionar',
  'activar',
  'desactivar',
  'editar',
  'eliminar',
  'cancelar',
  'ver-documentos',
])

const aforoLleno  = computed(() => (props.taller.inscritos ?? 0) >= props.taller.aforo)
const fechaVencida = computed(() => props.taller.fecha && new Date(props.taller.fecha) < new Date())

const bloqueado = computed(() =>
  props.procesando || ((aforoLleno.value || fechaVencida.value) && !props.inscrito)
)

const tooltip = computed(() => {
  if (props.procesando || props.inscrito) return ''
  if (fechaVencida.value) return 'La fecha de este taller ya ha pasado'
  if (aforoLleno.value)   return 'Aforo completo'
  return ''
})

const textoInscripcion = computed(() => {
  if (props.procesando)    return '...'
  if (props.inscrito)      return 'Desinscribirme'
  if (fechaVencida.value)  return 'Taller finalizado'
  if (aforoLleno.value)    return 'Aforo completo'
  return 'Apúntame'
})

const claseInscripcion = computed(() => {
  if (props.inscrito) return 'border-red-300 text-red-600 hover:bg-red-50 cursor-pointer'
  if (bloqueado.value) return 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed opacity-60'
  return 'border-primary-400 text-primary-600 hover:bg-primary-50 cursor-pointer'
})
</script>

<template>
  <div class="flex flex-wrap justify-center gap-1">

    <!-- Inscribirse / Desinscribirse -->
    <span :title="tooltip" :class="bloqueado && !inscrito ? 'cursor-not-allowed' : ''">
      <button
        class="px-3 py-1 text-sm rounded border transition-colors"
        :class="claseInscripcion"
        :disabled="bloqueado"
        @click="emit('toggle-inscripcion')"
      >
        {{ textoInscripcion }}
      </button>
    </span>

    <!-- Documentos PDF (todos los usuarios) -->
    <button
      class="px-3 py-1 text-sm rounded border transition-colors flex items-center gap-1 relative"
      :class="pdfPendiente
        ? 'border-orange-300 text-orange-500 hover:bg-orange-50 cursor-wait'
        : pdfNuevo
          ? 'border-green-400 text-green-600 hover:bg-green-50 cursor-pointer'
          : 'border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer'"
      :title="pdfPendiente ? 'Los PDFs aún se están subiendo…' : pdfNuevo ? 'Nuevos documentos disponibles' : ''"
      @click="emit('ver-documentos')"
    >
      <i v-if="pdfPendiente" class="pi pi-spin pi-spinner text-xs" />
      <i v-else class="pi pi-file-pdf" />
      {{ pdfPendiente ? 'Subiendo…' : 'PDF' }}
      <span v-if="pdfNuevo" class="absolute -top-1.5 -right-1.5 text-[9px] font-bold bg-green-500 text-white rounded-full px-1 leading-4">NEW</span>
    </button>

    <!-- Ver inscritos (admin / monitor) -->
    <button
      v-if="esAdmin || esSupervisor"
      class="px-3 py-1 text-sm rounded border border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer"
      @click="emit('ver-inscritos')"
    >
      Ver inscritos
    </button>

    <!-- Gestionar usuarios supervisados (solo monitor) -->
    <button
      v-if="esSupervisor"
      class="px-3 py-1 text-sm rounded border border-indigo-300 text-indigo-600 hover:bg-indigo-50 cursor-pointer"
      @click="emit('gestionar')"
    >
      Gestionar
    </button>

    <!-- Admin: activar / desactivar -->
    <button
      v-if="esAdmin && !taller.activo"
      class="px-3 py-1 text-sm rounded border border-green-400 text-green-600 hover:bg-green-50 cursor-pointer"
      @click="emit('activar')"
    >Activar</button>
    <button
      v-if="esAdmin && taller.activo"
      class="px-3 py-1 text-sm rounded border border-yellow-400 text-yellow-600 hover:bg-yellow-50 cursor-pointer"
      @click="emit('desactivar')"
    >Desactivar</button>

    <!-- Admin: editar / eliminar -->
    <button
      v-if="esAdmin"
      class="px-3 py-1 text-sm rounded border border-blue-300 text-blue-600 hover:bg-blue-50 cursor-pointer"
      @click="emit('editar')"
    >
      <i class="pi pi-pencil" /> Editar
    </button>
    <button
      v-if="esAdmin"
      class="px-3 py-1 text-sm rounded border border-red-300 text-red-600 hover:bg-red-50 cursor-pointer"
      @click="emit('eliminar')"
    >
      <i class="pi pi-trash" /> Eliminar
    </button>
    <button
      v-if="esAdmin && taller.activo"
      class="px-3 py-1 text-sm rounded border border-orange-400 text-orange-600 hover:bg-orange-50 cursor-pointer"
      @click="emit('cancelar')"
    >
      <i class="pi pi-ban" /> Cancelar
    </button>

  </div>
</template>
