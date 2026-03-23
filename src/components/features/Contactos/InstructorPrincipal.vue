<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <!-- Cabecera con gradiente -->
    <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
      <h2 class="text-xl font-bold mb-1">Tu Instructor Principal</h2>
      <p class="text-blue-100 text-sm">La persona que te acompaña en tu aprendizaje</p>
    </div>

    <!-- Contenido -->
    <div v-if="cargando" class="p-8 text-center">
      <i class="pi pi-spin pi-spinner text-3xl text-blue-500"></i>
      <p class="text-gray-600 mt-2">Cargando...</p>
    </div>

    <div v-else-if="!instructor" class="p-8 text-center">
      <i class="pi pi-user-plus text-5xl text-gray-300 mb-4"></i>
      <p class="text-gray-600 mb-2">Aún no tienes un instructor asignado</p>
      <p class="text-sm text-gray-500">Contacta con el administrador para que te asigne uno</p>
    </div>

    <div v-else class="p-6">
      <div class="flex items-start gap-4">
        <!-- Foto del instructor -->
        <div class="flex-shrink-0">
          <div v-if="instructor.foto_perfil" class="w-20 h-20 rounded-full overflow-hidden border-4 border-blue-100">
            <img :src="instructor.foto_perfil" :alt="nombreCompleto" class="w-full h-full object-cover" />
          </div>
          <div v-else class="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center border-4 border-blue-50">
            <span class="text-2xl font-bold text-blue-600">{{ iniciales }}</span>
          </div>
        </div>

        <!-- Información del instructor -->
        <div class="flex-1 min-w-0">
          <button 
            @click="navegarAPerfil"
            class="text-lg font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer text-left mb-1"
          >
            {{ nombreCompleto }}
          </button>
          
          <!-- Email -->
          <div class="flex items-center gap-2 text-gray-600 mb-2">
            <i class="pi pi-envelope text-sm"></i>
            <a :href="`mailto:${instructor.email}`" class="text-sm hover:text-blue-600 transition truncate">
              {{ instructor.email }}
            </a>
          </div>

          <!-- Teléfono -->
          <div v-if="instructor.telefono" class="flex items-center gap-2 text-gray-600 mb-3">
            <i class="pi pi-phone text-sm"></i>
            <a :href="`tel:${instructor.telefono}`" class="text-sm hover:text-blue-600 transition">
              {{ instructor.telefono }}
            </a>
          </div>

          <!-- Botones de acción -->
          <div class="flex gap-2 mt-4">
            <Button 
              icon="pi pi-envelope" 
              label="Enviar mensaje" 
              size="small" 
              @click="enviarMensaje"
              class="flex-1"
            />
            <Button 
              icon="pi pi-phone" 
              severity="secondary" 
              size="small"
              @click="llamar"
              v-if="instructor.telefono"
            />
          </div>
        </div>
      </div>

      <!-- Información adicional -->
      <div v-if="instructor.fecha_asignacion" class="mt-4 pt-4 border-t border-gray-200">
        <p class="text-xs text-gray-500">
          <i class="pi pi-calendar text-xs mr-1"></i>
          Asignado desde {{ formatearFecha(instructor.fecha_asignacion) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'

const router = useRouter()

const props = defineProps({
  instructor: {
    type: Object,
    default: null
  },
  cargando: {
    type: Boolean,
    default: false
  }
})

const navegarAPerfil = () => {
  if (props.instructor?.id) {
    router.push({ name: 'PerfilUsuario', params: { id: props.instructor.id } })
  }
}

const nombreCompleto = computed(() => {
  if (!props.instructor) return ''
  return `${props.instructor.nombre} ${props.instructor.Apellidos}`
})

const iniciales = computed(() => {
  if (!props.instructor) return ''
  const nombre = props.instructor.nombre?.charAt(0) || ''
  const apellido = props.instructor.Apellidos?.charAt(0) || ''
  return (nombre + apellido).toUpperCase()
})

const enviarMensaje = () => {
  if (props.instructor?.email) {
    window.location.href = `mailto:${props.instructor.email}`
  }
}

const llamar = () => {
  if (props.instructor?.telefono) {
    window.location.href = `tel:${props.instructor.telefono}`
  }
}

const formatearFecha = (fecha) => {
  if (!fecha) return ''
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}
</script>

<style scoped>
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
