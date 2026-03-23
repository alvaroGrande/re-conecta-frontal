<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-xl font-semibold text-gray-900 mb-6">Usuarios Coordinados</h2>
    
    <div v-if="cargando" class="text-center py-8">
      <i class="pi pi-spin pi-spinner text-3xl text-blue-500"></i>
      <p class="text-gray-600 mt-2">Cargando usuarios...</p>
    </div>
    
    <div v-else-if="usuarios.length === 0" class="text-center py-12 text-gray-500">
      <UserIcon class="w-12 h-12 mx-auto mb-3 text-gray-400" />
      <p>Este coordinador no tiene usuarios asignados</p>
    </div>

    <div v-else>
      <!-- Contador de usuarios -->
      <div class="flex items-center justify-between mb-4">
        <p class="text-sm text-gray-600">
          {{ usuarios.length }} {{ usuarios.length === 1 ? 'usuario' : 'usuarios' }}
        </p>
        <button 
          v-if="usuarios.length > 6"
          @click="mostrarTodos = !mostrarTodos"
          class="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {{ mostrarTodos ? 'Ver menos' : 'Ver todos' }}
        </button>
      </div>

      <!-- Lista de usuarios con altura máxima -->
      <div 
        :class="[
          'grid grid-cols-1 md:grid-cols-3 gap-3',
          !mostrarTodos && usuarios.length > 6 ? 'max-h-[400px] overflow-y-auto pr-2' : ''
        ]"
        style="scrollbar-width: thin;"
      >
        <div 
          v-for="usuarioCoord in usuariosMostrados" 
          :key="usuarioCoord.id"
          class="flex flex-col gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition"
        >
          <!-- Cabecera con avatar e info básica -->
          <div class="flex items-center gap-3">
            <!-- Avatar más pequeño -->
            <div class="flex-shrink-0">
              <div v-if="usuarioCoord.foto_perfil" class="w-10 h-10 rounded-full overflow-hidden">
                <img :src="usuarioCoord.foto_perfil" :alt="usuarioCoord.nombre" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span class="text-sm font-semibold text-gray-600">
                  {{ (usuarioCoord.nombre?.[0] || '') + (usuarioCoord.Apellidos?.[0] || '') }}
                </span>
              </div>
            </div>

            <!-- Información -->
            <div class="flex-1 min-w-0">
              <button 
                @click.stop="navegarAPerfil(usuarioCoord.id)"
                class="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer text-left"
              >
                {{ usuarioCoord.nombre }} {{ usuarioCoord.Apellidos }}
              </button>
              <p class="text-xs text-gray-600 truncate">{{ usuarioCoord.email }}</p>
            </div>
          </div>

          <!-- Últimas actividades -->
          <div v-if="usuarioCoord.ultimasActividades && usuarioCoord.ultimasActividades.length > 0" class="border-t border-gray-100 pt-2 space-y-1">
            <p class="text-xs font-medium text-gray-500 mb-1">Últimas actividades:</p>
            <div 
              v-for="(act, idx) in usuarioCoord.ultimasActividades.slice(0, 2)" 
              :key="idx"
              class="flex items-start gap-1.5"
            >
              <span class="text-xs text-gray-400 mt-0.5">•</span>
              <div class="flex-1 min-w-0">
                <p class="text-xs text-gray-600 truncate">{{ act.titulo || act.descripcion || act.tipo }}</p>
                <p class="text-xs text-gray-400">{{ formatearTiempo(act.created_at) }}</p>
              </div>
            </div>
          </div>
          
          <!-- Sin actividad reciente -->
          <div v-else class="border-t border-gray-100 pt-2">
            <p class="text-xs text-gray-400 italic">Sin actividad reciente</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { UserIcon } from '@heroicons/vue/24/outline'
import { obtenerUsuariosDeInstructor } from '@services/contactos'

const props = defineProps({
  coordinadorId: {
    type: String,
    required: true
  }
})

const router = useRouter()
const cargando = ref(false)
const usuarios = ref([])
const mostrarTodos = ref(false)

const usuariosMostrados = computed(() => {
  if (mostrarTodos.value || usuarios.value.length <= 6) {
    return usuarios.value
  }
  return usuarios.value.slice(0, 6)
})

const navegarAPerfil = (userId) => {
  console.log('Navegando al perfil de usuario:', userId)
  if (!userId) {
    console.error('ID de usuario no válido:', userId)
    return
  }
  router.push({ name: 'PerfilUsuario', params: { id: userId } })
}

const formatearTiempo = (fecha) => {
  if (!fecha) return ''
  const date = new Date(fecha)
  const ahora = new Date()
  const diffMs = ahora - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHoras = Math.floor(diffMs / 3600000)
  const diffDias = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Ahora'
  if (diffMins < 60) return `Hace ${diffMins}m`
  if (diffHoras < 24) return `Hace ${diffHoras}h`
  if (diffDias < 7) return `Hace ${diffDias}d`
  
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

const cargarUsuarios = async () => {
  if (!props.coordinadorId) return
  
  cargando.value = true
  try {
    const data = await obtenerUsuariosDeInstructor(props.coordinadorId)
    usuarios.value = data.data || []
  } catch (error) {
    console.error('Error al cargar usuarios coordinados:', error)
    usuarios.value = []
  } finally {
    cargando.value = false
  }
}

// Watch para recargar cuando cambie el coordinador
watch(() => props.coordinadorId, (newId, oldId) => {
  if (newId && newId !== oldId) {
    cargarUsuarios()
  }
})

onMounted(() => {
  cargarUsuarios()
})
</script>
