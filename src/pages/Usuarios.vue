<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto">
      <!-- Lista de usuarios -->
      <UsuariosLista
        @nuevo="handleNuevoUsuario"
        @editar="handleEditarUsuario"
        @eliminar="handleEliminarUsuario"
      />

      <!-- Modal para editar/crear usuario -->
      <EditarUsuarioModal
        :mostrar="mostrarModal"
        :usuario="usuarioSeleccionado"
        @cerrar="cerrarModal"
        @guardado="handleUsuarioGuardado"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import UsuariosLista from '@features/Usuarios/UsuariosLista.vue'
import EditarUsuarioModal from '@features/Usuarios/EditarUsuarioModal.vue'
import { getUsuario } from '@services/usuarios'
import { showError } from '@services/toastService'

const router = useRouter()
const mostrarModal = ref(false)
const usuarioSeleccionado = ref(null)

const handleNuevoUsuario = () => {
  router.push({ name: 'CrearUsuario' })
}

const handleEditarUsuario = async (usuarioId) => {
  try {
    usuarioSeleccionado.value = await getUsuario(usuarioId)
    mostrarModal.value = true
  } catch (error) {
    showError('No se pudo cargar los datos del usuario')
    console.error(error)
  }
}

const handleEliminarUsuario = (usuarioId) => {
  console.log('Eliminar usuario:', usuarioId)
}

const cerrarModal = () => {
  mostrarModal.value = false
  usuarioSeleccionado.value = null
}

const handleUsuarioGuardado = () => {
  cerrarModal()
  // Aquí se recargará la lista automáticamente porque UsuariosLista escucha cambios
}
</script>
