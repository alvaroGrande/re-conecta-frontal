<template>
  <div class="space-y-3">
    <!-- Buscador -->
    <div class="relative">
      <InputText 
        :model-value="busqueda"
        @update:model-value="$emit('update:busqueda', $event)"
        placeholder="Buscar por nombre, apellido o email..."
        class="w-full"
        @input="$emit('buscar')"
      />
      <i class="pi pi-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
    </div>

    <!-- Chips de filtro rápido -->
    <div class="flex gap-2 flex-wrap">
      <Chip 
        :label="`Sin usuarios (${conteoPorFiltro.sinUsuarios})`"
        icon="pi pi-exclamation-triangle"
        :class="[
          'cursor-pointer transition-all',
          filtroActivo === 'sinUsuarios' 
            ? 'bg-yellow-100 text-yellow-800 border-yellow-300 border-2' 
            : 'bg-gray-100 text-gray-700 hover:bg-yellow-50'
        ]"
        @click="toggleFiltro('sinUsuarios')"
      />
      <Chip 
        :label="`Sobrecargados (${conteoPorFiltro.sobrecargados})`"
        icon="pi pi-exclamation-circle"
        :class="[
          'cursor-pointer transition-all',
          filtroActivo === 'sobrecargados' 
            ? 'bg-orange-100 text-orange-800 border-orange-300 border-2' 
            : 'bg-gray-100 text-gray-700 hover:bg-orange-50'
        ]"
        @click="toggleFiltro('sobrecargados')"
      />
      <Chip 
        v-if="filtroActivo"
        label="Limpiar filtros"
        icon="pi pi-times"
        class="cursor-pointer bg-blue-100 text-blue-800 hover:bg-blue-200 transition-all"
        @click="limpiarFiltro"
      />
    </div>
  </div>
</template>

<script setup>
import InputText from 'primevue/inputtext'
import Chip from 'primevue/chip'

const props = defineProps({
  busqueda: {
    type: String,
    default: ''
  },
  filtroActivo: {
    type: String,
    default: null
  },
  conteoPorFiltro: {
    type: Object,
    default: () => ({ sinUsuarios: 0, sobrecargados: 0 })
  }
})

const emit = defineEmits(['update:busqueda', 'buscar', 'update:filtro'])

const toggleFiltro = (filtro) => {
  // Si hago clic en el filtro activo, desactivarlo
  if (filtro === props.filtroActivo) {
    emit('update:filtro', null)
  } else {
    emit('update:filtro', filtro)
  }
}

const limpiarFiltro = () => {
  emit('update:filtro', null)
}
</script>

<style scoped>
:deep(.p-chip) {
  display: inline-flex;
  align-items: center;
}
</style>
