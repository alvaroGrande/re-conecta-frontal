<script setup>
import { computed } from 'vue'
import CategoriaBadge from '@shared/CategoriaBadge.vue'
import TallerAcciones from '@features/Talleres/TallerAcciones.vue'

const props = defineProps({
  talleres:         { type: Array,   required: true },
  misInscripciones: { type: Object,  default: () => new Set() }, // Set de IDs
  procesando:       { type: Object,  default: () => new Set() }, // Set de IDs
  esAdmin:          { type: Boolean, default: false },
  esSupervisor:     { type: Boolean, default: false },
  pdfsEnCurso:      { type: Object,  default: () => new Set() }, // Set de IDs con upload activo
  pdfsNuevos:       { type: Object,  default: () => new Set() }, // Set de IDs recién subidos
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

const talleresVisibles = computed(() => {
  if (!props.esAdmin && !props.esSupervisor) {
    return props.talleres.filter(t => t.activo)
  }
  return props.talleres
})

function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString()
}
function formatHora(fecha) {
  return new Date(fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full border border-gray-200 rounded-lg overflow-hidden">
      <thead class="bg-gray-100">
        <tr>
          <th class="text-left px-4 py-2">Categoría</th>
          <th class="text-left px-4 py-2">Taller</th>
          <th class="text-left px-4 py-2">Fecha</th>
          <th class="text-left px-4 py-2">Aforo</th>
          <th v-if="esAdmin" class="text-left px-4 py-2">Estado</th>
          <th class="text-center px-4 py-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="taller in talleresVisibles"
          :key="taller.id"
          class="border-t border-gray-200 hover:bg-gray-50"
        >
          <!-- Categoría -->
          <td class="px-4 py-3">
            <CategoriaBadge :tipo="taller.modalidad" :variante="taller.tipo_pago" />
          </td>

          <!-- Título / descripción -->
          <td class="px-4 py-3">
            <p class="font-bold text-gray-800">{{ taller.titulo }}</p>
            <p
              v-if="taller.descripcion"
              class="text-gray-500 text-sm max-w-xs truncate cursor-default"
              v-tooltip.bottom="taller.descripcion.length > 80 ? { value: taller.descripcion, showDelay: 300, pt: { root: { style: 'max-width: 420px; white-space: normal' } } } : undefined"
            >{{ taller.descripcion }}</p>
          </td>

          <!-- Fecha -->
          <td class="px-4 py-3 text-sm text-gray-600">
            <p>{{ formatFecha(taller.fecha) }} {{ formatHora(taller.fecha) }}</p>
            <p class="text-gray-400">{{ taller.duracion }} horas</p>
          </td>

          <!-- Aforo -->
          <td class="px-4 py-3 text-sm text-gray-600">
            <p>Aforo: {{ taller.aforo }}</p>
            <p>Inscritos: {{ taller.inscritos ?? 0 }}</p>
          </td>

          <!-- Estado (solo admin) -->
          <td v-if="esAdmin" class="px-4 py-3">
            <span
              v-if="taller.activo"
              class="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-semibold"
            >Activo</span>
            <span
              v-else
              class="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold"
            >Inactivo</span>
          </td>

          <!-- Acciones -->
          <td class="px-4 py-3">
            <TallerAcciones
              :taller="taller"
              :inscrito="misInscripciones.has(taller.id)"
              :procesando="procesando.has(taller.id)"
              :es-admin="esAdmin"
              :es-supervisor="esSupervisor"
              :pdf-pendiente="pdfsEnCurso.has(taller.id)"
              :pdf-nuevo="pdfsNuevos.has(taller.id)"
              @toggle-inscripcion="emit('toggle-inscripcion', taller)"
              @ver-inscritos="emit('ver-inscritos', taller)"
              @gestionar="emit('gestionar', taller)"
              @activar="emit('activar', taller)"
              @desactivar="emit('desactivar', taller)"
              @editar="emit('editar', taller)"
              @eliminar="emit('eliminar', taller)"
              @cancelar="emit('cancelar', taller)"
              @ver-documentos="emit('ver-documentos', taller)"
            />
          </td>
        </tr>

        <tr v-if="talleresVisibles.length === 0">
          <td :colspan="esAdmin ? 6 : 5" class="text-center py-8 text-gray-400">
            No hay talleres disponibles.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
