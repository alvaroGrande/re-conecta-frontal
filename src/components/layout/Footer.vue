<template>
  <footer class="bg-gradient-to-r from-slate-800 to-slate-900 text-gray-300 border-t border-slate-700 mt-auto">
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <!-- Información de la app -->
        <div class="text-center md:text-left">
          <h3 class="text-white font-semibold text-lg">reConecta</h3>
          <p class="text-gray-400 text-sm">{{ $t('footer.platform') }}</p>
          <p class="text-gray-500 text-xs mt-1">v{{ version }}</p>
        </div>

        <!-- Usuario conectado -->
        <div v-if="usuarioActual" class="flex flex-col items-center md:items-end space-y-1">
          <div class="flex items-center space-x-2">
            <div class="text-center md:text-right">
              <div class="flex items-center justify-center md:justify-end space-x-2">
                <p class="text-white font-medium text-sm">{{ usuarioActual.nombre }} {{ usuarioActual.Apellidos }}</p>
                <span v-if="mostrarRol" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" :class="obtenerColorRol(usuarioActual.rol)">
                  {{ obtenerNombreRol(usuarioActual.rol) }}
                </span>
              </div>
              <p class="text-gray-400 text-xs">{{ usuarioActual.email }}</p>
            </div>
          </div>
          <div class="text-gray-400 text-xs">
            <span class="font-mono">{{ horaActual }}</span>
          </div>
        </div>

        <!-- Selector de idioma -->
        <div class="flex flex-col items-center gap-2">
          <LanguageSwitcher />
        </div>

        <!-- Copyright -->
        <div class="text-gray-400 text-xs text-center md:text-right">
          <p>© {{ anoActual }} reConecta</p>
          <p class="text-gray-500 text-[10px]">{{ $t('footer.rights') }}</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { obtenerNombreRol, obtenerColorRol } from '@helpers/rolesHelper'
import LanguageSwitcher from '@shared/LanguageSwitcher.vue'

const usuarioActual = ref(null)
const anoActual = new Date().getFullYear()
const version = '1.0.0'
const horaActual = ref('')
let intervaloReloj = null

// Mostrar rol solo si NO es usuario normal (rol 3)
const mostrarRol = computed(() => {
  return usuarioActual.value && usuarioActual.value.rol !== 3
})

const actualizarHora = () => {
  const ahora = new Date()
  horaActual.value = ahora.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
}

const cargarUsuarioActual = () => {
  try {
    const usuarioJSON = localStorage.getItem('usuario')
    if (usuarioJSON) {
      usuarioActual.value = JSON.parse(usuarioJSON)
    }
  } catch (error) {
    console.error('Error al cargar usuario actual:', error)
  }
}

onMounted(() => {
  cargarUsuarioActual()
  actualizarHora()
  
  // Actualizar la hora cada segundo
  intervaloReloj = setInterval(actualizarHora, 1000)
  
  // Escuchar cambios en el localStorage (para sincronizar entre pestañas)
  window.addEventListener('storage', cargarUsuarioActual)
})

onBeforeUnmount(() => {
  if (intervaloReloj) {
    clearInterval(intervaloReloj)
  }
  window.removeEventListener('storage', cargarUsuarioActual)
})
</script>

<style scoped>
footer {
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.1);
}
</style>