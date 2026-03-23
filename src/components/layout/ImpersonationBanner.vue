<template>
  <div v-if="impersonando" class="bg-purple-600 text-white px-4 py-2 flex items-center justify-between shadow-lg">
    <div class="flex items-center space-x-3">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <span class="font-medium">
        {{ $t('impersonation.viewing') }}: <strong>{{ usuarioActual?.nombre }} {{ usuarioActual?.Apellidos }}</strong>
      </span>
    </div>
    <button
      @click="volverAlUsuarioOriginal"
      class="bg-white text-purple-600 hover:bg-purple-50 px-4 py-1 rounded-lg font-medium transition"
    >
      {{ $t('impersonation.returnToAccount') }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const impersonando = ref(false)
const usuarioActual = ref(null)

const volverAlUsuarioOriginal = () => {
  try {
    // Restaurar el usuario original
    const usuarioOriginal = localStorage.getItem('usuario_original')
    if (usuarioOriginal) {
      localStorage.setItem('usuario', usuarioOriginal)
      localStorage.removeItem('usuario_original')
      localStorage.removeItem('impersonando')
      
      // Recargar la página
      window.location.href = '/'
    }
  } catch (error) {
    console.error('Error al volver al usuario original:', error)
    alert('Error al restaurar la sesión')
  }
}

const verificarImpersonacion = () => {
  impersonando.value = localStorage.getItem('impersonando') === 'true'
  
  if (impersonando.value) {
    try {
      const usuarioJSON = localStorage.getItem('usuario')
      if (usuarioJSON) {
        usuarioActual.value = JSON.parse(usuarioJSON)
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error)
    }
  }
}

onMounted(() => {
  verificarImpersonacion()
})
</script>
