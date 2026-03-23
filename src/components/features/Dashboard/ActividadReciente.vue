<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('dashboard.recentActivity.title') }}</h3>
    
    <div v-if="actividades.length === 0" class="text-center py-8 text-gray-500">
      {{ $t('dashboard.recentActivity.noActivity') }}
    </div>
    
    <div v-else class="space-y-4">
      <div v-for="(actividad, index) in actividades" :key="index" class="flex items-start space-x-3 pb-4 border-b border-gray-200 last:border-0">
        <div class="flex-shrink-0">
          <div class="p-2 rounded-full" :class="actividad.colorBg">
            <component :is="actividad.icono" class="w-5 h-5" :class="actividad.colorIcono" />
          </div>
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <button 
              @click="$emit('ver-perfil', actividad.usuario_id)" 
              class="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
            >
              {{ actividad.titulo }}
            </button>
            <button
              v-if="actividad.totalActividades > 1"
              @click="$emit('ver-detalles', actividad)"
              class="px-2 py-0.5 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 transition cursor-pointer"
              :title="`Ver ${actividad.totalActividades} actividades`"
            >
              {{ actividad.totalActividades }}
            </button>
          </div>
          <p class="text-sm text-gray-600">{{ actividad.descripcion }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ actividad.tiempo }}</p>
          <p v-if="actividad.correoUsuario" class="text-xs text-gray-300 mt-0.5">{{ actividad.correoUsuario }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  actividades: {
    type: Array,
    default: () => []
  }
})

defineEmits(['ver-detalles', 'ver-perfil'])
</script>
