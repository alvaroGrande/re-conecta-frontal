<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    modal
    :header="`Supervisor: ${supervisor?.nombre} ${supervisor?.Apellidos}`"
    :style="{ width: '90%', maxWidth: '900px' }"
  >
    <div class="space-y-6">
      <!-- Información del supervisor -->
      <div class="bg-blue-50 p-4 rounded-lg">
        <div class="flex items-center gap-3">
          <div class="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center">
            <span class="text-2xl font-bold text-blue-800">{{ iniciales }}</span>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">{{ supervisor?.nombre }} {{ supervisor?.Apellidos }}</h3>
            <p class="text-sm text-gray-600">{{ supervisor?.email }}</p>
            <p class="text-xs text-blue-600 mt-1">
              <i class="pi pi-users text-xs mr-1"></i>{{ usuariosCoordinados.length }} usuario{{ usuariosCoordinados.length !== 1 ? 's' : '' }} coordinado{{ usuariosCoordinados.length !== 1 ? 's' : '' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Pestañas -->
      <div class="border-b border-gray-200">
        <div class="flex gap-4">
          <button
            @click="tabActiva = 'coordinados'"
            :class="[
              'px-4 py-2 font-medium text-sm border-b-2 transition',
              tabActiva === 'coordinados'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            ]"
          >
            Usuarios Coordinados ({{ usuariosCoordinados.length }})
          </button>
          <button
            @click="tabActiva = 'sin-supervisor'"
            :class="[
              'px-4 py-2 font-medium text-sm border-b-2 transition',
              tabActiva === 'sin-supervisor'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            ]"
          >
            Sin Supervisor ({{ usuariosSinSupervisor.length }})
          </button>
        </div>
      </div>

      <!-- Usuarios Coordinados -->
      <div v-show="tabActiva === 'coordinados'">
        <div v-if="cargandoCoordinados" class="text-center py-8">
          <i class="pi pi-spin pi-spinner text-2xl text-blue-500"></i>
          <p class="text-gray-600 mt-2">Cargando usuarios...</p>
        </div>

        <div v-else-if="usuariosCoordinados.length === 0" class="text-center py-8">
          <i class="pi pi-users text-4xl text-gray-300"></i>
          <p class="text-gray-600 mt-2">Este supervisor aún no coordina ningún usuario</p>
        </div>

        <div v-else class="space-y-2 max-h-96 overflow-y-auto">
          <div
            v-for="usuario in usuariosCoordinados"
            :key="usuario.id"
            class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span class="text-sm font-semibold text-gray-600">{{ inicialesUsuario(usuario) }}</span>
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ usuario.nombre }} {{ usuario.Apellidos }}</p>
                <p class="text-sm text-gray-600">{{ usuario.email }}</p>
              </div>
            </div>
            <Button
              icon="pi pi-times"
              severity="danger"
              text
              rounded
              @click="desasignarUsuario(usuario)"
              v-tooltip.left="'Desasignar supervisor'"
              :loading="desasignando === usuario.id"
            />
          </div>
        </div>
      </div>

      <!-- Usuarios Sin Supervisor -->
      <div v-show="tabActiva === 'sin-supervisor'">
        <div v-if="cargandoSinSupervisor" class="text-center py-8">
          <i class="pi pi-spin pi-spinner text-2xl text-blue-500"></i>
          <p class="text-gray-600 mt-2">Cargando usuarios...</p>
        </div>

        <div v-else-if="usuariosSinSupervisor.length === 0" class="text-center py-8">
          <i class="pi pi-check-circle text-4xl text-green-500"></i>
          <p class="text-gray-600 mt-2">Todos los usuarios tienen supervisor asignado</p>
        </div>

        <div v-else class="space-y-2 max-h-96 overflow-y-auto">
          <div
            v-for="usuario in usuariosSinSupervisor"
            :key="usuario.id"
            class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span class="text-sm font-semibold text-gray-600">{{ inicialesUsuario(usuario) }}</span>
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ usuario.nombre }} {{ usuario.Apellidos }}</p>
                <p class="text-sm text-gray-600">{{ usuario.email }}</p>
              </div>
            </div>
            <Button
              icon="pi pi-plus"
              label="Asignar"
              size="small"
              @click="asignarUsuario(usuario)"
              :loading="asignando === usuario.id"
            />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <Button
          label="Cerrar"
          @click="$emit('update:visible', false)"
          severity="secondary"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { obtenerUsuariosDeInstructor, obtenerUsuariosSinSupervisor, asignarInstructor } from '@services/contactos'
import { showSuccess, showError } from '@services/toastService'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  supervisor: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'actualizado'])

const tabActiva = ref('coordinados')
const usuariosCoordinados = ref([])
const usuariosSinSupervisor = ref([])
const cargandoCoordinados = ref(false)
const cargandoSinSupervisor = ref(false)
const asignando = ref(null)
const desasignando = ref(null)

const iniciales = computed(() => {
  if (!props.supervisor) return ''
  const nombre = props.supervisor.nombre?.charAt(0) || ''
  const apellido = props.supervisor.Apellidos?.charAt(0) || ''
  return (nombre + apellido).toUpperCase()
})

const inicialesUsuario = (usuario) => {
  const nombre = usuario.nombre?.charAt(0) || ''
  const apellido = usuario.Apellidos?.charAt(0) || ''
  return (nombre + apellido).toUpperCase()
}

const cargarUsuariosCoordinados = async () => {
  if (!props.supervisor) return
  
  cargandoCoordinados.value = true
  try {
    const resultado = await obtenerUsuariosDeInstructor(props.supervisor.id)
    // Manejar tanto la respuesta paginada como un array simple
    usuariosCoordinados.value = resultado.data || resultado
  } catch (error) {
    console.error('Error al cargar usuarios coordinados:', error)
    showError('Error al cargar usuarios coordinados')
  } finally {
    cargandoCoordinados.value = false
  }
}

const cargarUsuariosSinSupervisor = async () => {
  cargandoSinSupervisor.value = true
  try {
    const resultado = await obtenerUsuariosSinSupervisor()
    // Manejar tanto la respuesta paginada como un array simple
    usuariosSinSupervisor.value = resultado.data || resultado
  } catch (error) {
    console.error('Error al cargar usuarios sin supervisor:', error)
    showError('Error al cargar usuarios sin supervisor')
  } finally {
    cargandoSinSupervisor.value = false
  }
}

const asignarUsuario = async (usuario) => {
  asignando.value = usuario.id
  try {
    await asignarInstructor(usuario.id, props.supervisor.id, true)
    showSuccess(`${usuario.nombre} asignado correctamente`)
    
    // Actualizar listas localmente sin recargar del backend
    // Agregar a coordinados
    usuariosCoordinados.value.push({
      ...usuario,
      fecha_asignacion: new Date().toISOString(),
      es_principal: true
    })
    
    // Eliminar de sin supervisor
    usuariosSinSupervisor.value = usuariosSinSupervisor.value.filter(u => u.id !== usuario.id)
    
    // Emitir el nuevo conteo sin recargar todo
    emit('actualizado', props.supervisor.id, usuariosCoordinados.value.length)
  } catch (error) {
    showError('Error al asignar usuario')
  } finally {
    asignando.value = null
  }
}

const desasignarUsuario = async (usuario) => {
  desasignando.value = usuario.id
  try {
    // Aquí necesitarías implementar un endpoint para desasignar
    // Por ahora mostramos un mensaje
    showError('Funcionalidad de desasignación pendiente de implementar')
  } catch (error) {
    showError('Error al desasignar usuario')
  } finally {
    desasignando.value = null
  }
}

watch(() => props.visible, (newValue) => {
  if (newValue && props.supervisor) {
    cargarUsuariosCoordinados()
    cargarUsuariosSinSupervisor()
    tabActiva.value = 'coordinados'
  }
})
</script>
