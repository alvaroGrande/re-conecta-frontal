<template>
  <Dialog 
    :visible="visible" 
    @update:visible="$emit('update:visible', $event)"
    modal 
    :header="headerText"
    :style="{ width: '100%', maxWidth: '500px' }"
  >
    <div class="space-y-4">
      <!-- Buscador -->
      <div class="relative">
        <InputText 
          v-model="terminoBusqueda"
          placeholder="Buscar por nombre, apellido o email..."
          class="w-full"
          @input="buscar"
        />
        <i class="pi pi-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
      </div>

      <!-- Resultados -->
      <div v-if="buscando" class="text-center py-8">
        <i class="pi pi-spin pi-spinner text-2xl text-blue-500"></i>
      </div>

      <div v-else-if="resultadosBusqueda.length === 0 && terminoBusqueda" class="text-center py-8">
        <p class="text-gray-600">No se encontraron usuarios</p>
      </div>

      <div v-else-if="resultadosBusqueda.length > 0" class="max-h-96 overflow-y-auto space-y-2">
        <div 
          v-for="usuario in resultadosBusqueda" 
          :key="usuario.id"
          class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <div v-if="usuario.foto_perfil" class="w-10 h-10 rounded-full overflow-hidden">
            <img :src="usuario.foto_perfil" :alt="nombreCompleto(usuario)" class="w-full h-full object-cover" />
          </div>
          <div v-else class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span class="text-sm font-semibold text-gray-600">{{ iniciales(usuario) }}</span>
          </div>

          <div class="flex-1 min-w-0">
            <p class="font-medium text-gray-900">{{ nombreCompleto(usuario) }}</p>
            <p class="text-sm text-gray-600 truncate">{{ usuario.email }}</p>
          </div>

          <Button 
            v-if="usuario.esContacto"
            icon="pi pi-check"
            label="Agregado"
            size="small"
            severity="secondary"
            disabled
          />
          <Button 
            v-else
            icon="pi pi-plus"
            label="Agregar"
            size="small"
            @click="agregar(usuario)"
            :loading="agregando === usuario.id"
          />
        </div>
      </div>

      <p v-else class="text-center text-gray-500 py-8 text-sm">
        Escribe para buscar usuarios
      </p>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import { buscarUsuarios, agregarContacto } from '@services/contactos'
import { showSuccess, showError } from '@services/toastService'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  esInstructor: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'agregado'])

const terminoBusqueda = ref('')
const resultadosBusqueda = ref([])
const buscando = ref(false)
const agregando = ref(null)
let timeoutBusqueda = null

const headerText = computed(() => {
  return props.esInstructor ? 'Agregar Usuario' : 'Agregar Contacto'
})

const buscar = () => {
  clearTimeout(timeoutBusqueda)
  
  if (!terminoBusqueda.value.trim()) {
    resultadosBusqueda.value = []
    return
  }

  timeoutBusqueda = setTimeout(async () => {
    buscando.value = true
    try {
      resultadosBusqueda.value = await buscarUsuarios(terminoBusqueda.value)
    } catch (error) {
      showError('Error al buscar usuarios')
    } finally {
      buscando.value = false
    }
  }, 500)
}

const agregar = async (usuario) => {
  agregando.value = usuario.id
  try {
    await agregarContacto(usuario.id)
    const mensaje = props.esInstructor 
      ? `${usuario.nombre} agregado a tu coordinación` 
      : `${usuario.nombre} agregado a tus contactos`
    showSuccess(mensaje)
    
    // Marcar como agregado en los resultados
    const resultado = resultadosBusqueda.value.find(u => u.id === usuario.id)
    if (resultado) {
      resultado.esContacto = true
    }
    
    // Notificar al padre para que recargue la lista
    emit('agregado')
  } catch (error) {
    if (error.response?.data?.message) {
      showError(error.response.data.message)
    } else {
      showError('Error al agregar contacto')
    }
  } finally {
    agregando.value = null
  }
}

const nombreCompleto = (persona) => {
  return `${persona.nombre} ${persona.Apellidos}`
}

const iniciales = (persona) => {
  const nombre = persona.nombre?.charAt(0) || ''
  const apellido = persona.Apellidos?.charAt(0) || ''
  return (nombre + apellido).toUpperCase()
}
</script>

<style scoped>
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
