<template>
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Usuario
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Email
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Fecha de Respuesta
          </th>
          <th class="px-6 py-3"></th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr
          v-for="respuesta in respuestas"
          :key="respuesta.id"
          class="hover:bg-blue-50 cursor-pointer transition-colors group"
          @click="emit('seleccionar-usuario', respuesta)"
        >
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900 group-hover:text-blue-700">
              {{ respuesta.usuario.nombre }} {{ respuesta.usuario.Apellidos }}
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-500">{{ respuesta.usuario.email }}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-500">{{ formatearFecha(respuesta.fechaRespuesta) }}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right">
            <svg class="h-4 w-4 text-gray-300 group-hover:text-blue-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  respuestas: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['seleccionar-usuario']);

const formatearFecha = (isoString) => {
  const fecha = new Date(isoString);
  return fecha.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>
