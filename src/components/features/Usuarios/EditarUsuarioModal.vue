<template>
  <Dialog
    v-model:visible="mostrarDialog"
    :header="usuarioOriginal?.id ? 'Editar Usuario' : 'Nuevo Usuario'"
    :modal="true"
    :closable="true"
    class="w-full md:w-2/3 lg:w-3/5"
    @update:visible="handleCerrar"
  >
    <!-- Formulario -->
    <form @submit.prevent="guardar" class="space-y-2">
      <!-- Nombre, Apellidos y Email -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            v-model="formulario.email"
            type="email"
            :disabled="Boolean(usuarioOriginal?.id)"
            required
            :class="[
              'w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none',
              usuarioOriginal?.id
                ? 'bg-gray-100 cursor-not-allowed text-gray-600'
                : 'focus:ring-2 focus:ring-blue-500'
            ]"
            placeholder="usuario@ejemplo.com"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">
            Nombre *
          </label>
          <input
            v-model="formulario.nombre"
            type="text"
            required
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Juan"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">
            Apellidos *
          </label>
          <input
            v-model="formulario.Apellidos"
            type="text"
            required
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Pérez García"
          />
        </div>
</div>

      <!-- Rol, Género y Fecha de Nacimiento -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">
            Rol *
          </label>
          <select
            v-model="formulario.rol"
            required
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar rol</option>
            <option value="1">Admin</option>
            <option value="2">Instructor</option>
            <option value="3">Usuario</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">
            Género
          </label>
          <select
            v-model="formulario.genero"
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sin especificar</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">
            Fecha de Nacimiento
          </label>
          <DatePicker
            v-model="formulario.fecha_nacimiento"
            date-format="dd/mm/yy"
            placeholder="Seleccionar fecha"
            class="w-full "
            :inline="false"
          />
        </div>
      </div>

      <!-- Localidad, Provincia y Código Postal -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">
            Localidad
          </label>
          <input
            v-model="formulario.localidad"
            type="text"
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Madrid"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">
            Provincia
          </label>
          <input
            v-model="formulario.provincia"
            type="text"
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Madrid"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">
            Código Postal
          </label>
          <input
            v-model="formulario.codigo_postal"
            type="text"
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="28041"
          />
        </div>
      </div>
    </form>

    <!-- Footer con botones -->
    <template #footer>
      <div class="flex justify-end space-x-3">
        <Button
          type="button"
          label="Cancelar"
          severity="secondary"
          @click="cerrar"
        />
        <Button
          type="submit"
          label="Guardar"
          :loading="guardando"
          :disabled="guardando"
          @click="guardar"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import { actualizarUsuario, crearUsuario } from '@services/usuarios'
import { showSuccess, showError } from '@services/toastService'

const props = defineProps({
  mostrar: {
    type: Boolean,
    default: false
  },
  usuario: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['cerrar', 'guardado'])

const mostrarDialog = ref(false)
const guardando = ref(false)
const usuarioOriginal = ref(null)
const formulario = ref({
  nombre: '',
  Apellidos: '',
  email: '',
  rol: '',
  genero: '',
  fecha_nacimiento: '',
  localidad: '',
  provincia: '',
  codigo_postal: ''
})

// Watchers para sincronizar datos
watch(
  () => props.mostrar,
  (nuevoValor) => {
    mostrarDialog.value = nuevoValor
    if (nuevoValor && props.usuario) {
      usuarioOriginal.value = props.usuario
      formulario.value = {
        nombre: props.usuario.nombre || '',
        Apellidos: props.usuario.Apellidos || '',
        email: props.usuario.email || '',
        rol: String(props.usuario.rol) || '',
        genero: props.usuario.genero || '',
        fecha_nacimiento: props.usuario.fecha_nacimiento ? props.usuario.fecha_nacimiento.split('T')[0] : '',
        localidad: props.usuario.localidad || '',
        provincia: props.usuario.provincia || '',
        codigo_postal: props.usuario.codigo_postal || ''
      }
    } else if (nuevoValor && !props.usuario) {
      // Nuevo usuario
      usuarioOriginal.value = null
      formulario.value = {
        nombre: '',
        Apellidos: '',
        email: '',
        rol: '',
        genero: '',
        fecha_nacimiento: '',
        localidad: '',
        provincia: '',
        codigo_postal: ''
      }
    }
  }
)

const guardar = async () => {
  try {
    guardando.value = true
    
    // Convertir rol a número
    const datosActualizados = {
      ...formulario.value,
      rol: parseInt(formulario.value.rol)
    }

    if (usuarioOriginal.value?.id) {
      // Editar usuario existente
      await actualizarUsuario(usuarioOriginal.value.id, datosActualizados)
      showSuccess('Usuario actualizado correctamente')
    } else {
      // Crear nuevo usuario
      await crearUsuario(datosActualizados)
      showSuccess('Usuario creado correctamente')
    }

    emit('guardado')
    cerrar()
  } catch (error) {
    showError(error.response?.data?.message || 'Error al guardar el usuario')
    console.error(error)
  } finally {
    guardando.value = false
  }
}

const handleCerrar = (valor) => {
  if (!valor) {
    emit('cerrar')
  }
}

const cerrar = () => {
  mostrarDialog.value = false
  emit('cerrar')
}
</script>
