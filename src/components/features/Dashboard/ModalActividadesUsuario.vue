<template>
  <Dialog
    :visible="mostrar"
    @update:visible="$emit('cerrar')"
    modal
    :header="`Actividades de ${usuario.nombre}`"
    :style="{ width: '90%', maxWidth: '700px' }"
  >
    <div class="mb-4">
      <p class="text-sm text-gray-500">{{ actividades.length }} actividades registradas</p>
    </div>

    <!-- Lista de actividades -->
    <div class="max-h-96 overflow-y-auto space-y-3">
      <div 
        v-for="(actividad, index) in actividades" 
        :key="index"
        class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition"
      >
        <div class="flex-shrink-0">
          <div class="p-2 rounded-full" :class="obtenerEstiloTipo(actividad.tipo).colorBg">
            <component :is="obtenerEstiloTipo(actividad.tipo).icono" class="w-4 h-4" :class="obtenerEstiloTipo(actividad.tipo).colorIcono" />
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900">{{ obtenerEstiloTipo(actividad.tipo).titulo }}</p>
          <p class="text-sm text-gray-600 break-words">{{ actividad.descripcion }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ formatearFecha(actividad.fecha) }}</p>
        </div>
      </div>
    </div>

    <template #footer>
      <Button
        label="Cerrar"
        severity="secondary"
        @click="$emit('cerrar')"
      />
    </template>
  </Dialog>
</template>

<script setup>
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { 
  UserPlusIcon,
  DocumentTextIcon,
  BellIcon,
  AcademicCapIcon
} from '@heroicons/vue/24/outline'

defineProps({
  mostrar: {
    type: Boolean,
    default: false
  },
  usuario: {
    type: Object,
    default: () => ({})
  },
  actividades: {
    type: Array,
    default: () => []
  }
})

defineEmits(['cerrar'])

const tiposActividad = {
  login: {
    icono: UserPlusIcon,
    colorBg: 'bg-blue-100',
    colorIcono: 'text-blue-600',
    titulo: 'Inicio de sesión'
  },
  logout: {
    icono: UserPlusIcon,
    colorBg: 'bg-gray-100',
    colorIcono: 'text-gray-600',
    titulo: 'Cierre de sesión'
  },
  registro: {
    icono: UserPlusIcon,
    colorBg: 'bg-green-100',
    colorIcono: 'text-green-600',
    titulo: 'Registro'
  },
  encuesta: {
    icono: DocumentTextIcon,
    colorBg: 'bg-yellow-100',
    colorIcono: 'text-yellow-600',
    titulo: 'Encuesta'
  },
  taller: {
    icono: AcademicCapIcon,
    colorBg: 'bg-purple-100',
    colorIcono: 'text-purple-600',
    titulo: 'Taller'
  },
  notificacion: {
    icono: BellIcon,
    colorBg: 'bg-orange-100',
    colorIcono: 'text-orange-600',
    titulo: 'Notificación'
  },
  default: {
    icono: DocumentTextIcon,
    colorBg: 'bg-gray-100',
    colorIcono: 'text-gray-600',
    titulo: 'Actividad'
  }
}

const obtenerEstiloTipo = (tipo) => {
  return tiposActividad[tipo] || tiposActividad.default
}

const formatearFecha = (fecha) => {
  if (!fecha) return 'Fecha desconocida'
  const date = new Date(fecha)
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
</script>
