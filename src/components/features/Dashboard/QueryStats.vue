<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Rendimiento de Queries</h3>
        <p class="text-sm text-gray-500 mt-1">Monitoreo de queries en las últimas 24 horas</p>
      </div>
      <button
        @click="cargarDatos"
        class="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
      >
        <ArrowPathIcon class="w-4 h-4 inline mr-1" :class="{ 'animate-spin': cargando }" />
        Actualizar
      </button>
    </div>

    <!-- Estadísticas generales -->
    <div v-if="estadisticas" class="grid grid-cols-5 gap-4 mb-6">
      <div class="bg-blue-50 rounded-lg p-4">
        <div class="text-2xl font-bold text-blue-600">{{ estadisticas.total_queries || 0 }}</div>
        <div class="text-sm text-gray-600">Total Queries</div>
      </div>
      <div class="bg-red-50 rounded-lg p-4">
        <div class="text-2xl font-bold text-red-600">{{ estadisticas.queries_lentas || 0 }}</div>
        <div class="text-sm text-gray-600">Queries Lentas</div>
      </div>
      <div class="bg-purple-50 rounded-lg p-4">
        <div class="text-2xl font-bold text-purple-600">{{ formatearDuracion(estadisticas.duracion_promedio_ms) }}</div>
        <div class="text-sm text-gray-600">Promedio</div>
      </div>
      <div class="bg-orange-50 rounded-lg p-4">
        <div class="text-2xl font-bold text-orange-600">{{ formatearDuracion(estadisticas.duracion_maxima_ms) }}</div>
        <div class="text-sm text-gray-600">Máxima</div>
      </div>
      <div class="bg-green-50 rounded-lg p-4">
        <div class="text-2xl font-bold text-green-600">{{ formatearDuracion(estadisticas.duracion_minima_ms) }}</div>
        <div class="text-sm text-gray-600">Mínima</div>
      </div>
    </div>

    <!-- Top queries más lentas -->
    <div>
      <h4 class="text-sm font-semibold text-gray-700 mb-3">Queries más lentas</h4>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Query</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ejecuciones</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Promedio</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Máxima</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mínima</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">% Lentas</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="query in queriesLentasPaginadas" :key="query.nombre_query" class="hover:bg-gray-50">
              <td class="px-4 py-3">
                <div 
                  class="text-sm font-medium text-gray-900 max-w-xs truncate cursor-pointer"
                  v-tooltip.top="query.nombre_query"
                >
                  {{ query.nombre_query }}
                </div>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {{ query.ejecuciones }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm">
                <span 
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="getColorDuracion(query.duracion_promedio_ms)"
                >
                  {{ formatearDuracion(query.duracion_promedio_ms) }}
                </span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {{ formatearDuracion(query.duracion_maxima_ms) }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {{ formatearDuracion(query.duracion_minima_ms) }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm">
                <span 
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="getColorPorcentaje(query.ejecuciones_lentas, query.ejecuciones)"
                >
                  {{ calcularPorcentaje(query.ejecuciones_lentas, query.ejecuciones) }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="queriesLentas.length === 0 && !cargando" class="text-center py-8 text-gray-500">
        No hay datos de queries disponibles
      </div>

      <!-- Paginación PrimeVue -->
      <Paginator
        v-if="queriesLentas.length > registrosPorPagina"
        :rows="registrosPorPagina"
        :totalRecords="queriesLentas.length"
        :first="(paginaActual - 1) * registrosPorPagina"
        @page="onPage"
        class="mt-4 pt-4 border-t border-gray-200"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ArrowPathIcon } from '@heroicons/vue/24/outline';
import Paginator from 'primevue/paginator';
import api from '@/services/api';

const cargando = ref(false);
const estadisticas = ref(null);
const queriesLentas = ref([]);

const registrosPorPagina = 10;
const paginaActual = ref(1);

const queriesLentasPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina;
  return queriesLentas.value.slice(inicio, inicio + registrosPorPagina);
});

function onPage(event) {
  paginaActual.value = event.page + 1;
}

const cargarDatos = async () => {
  cargando.value = true;
  try {
    const [estadisticasRes, queriesRes] = await Promise.all([
      api.get('/tasks/estadisticas-queries'),
      api.get('/tasks/queries-lentas?limite=20')
    ]);

    estadisticas.value = estadisticasRes.data;
    queriesLentas.value = queriesRes.data;
    paginaActual.value = 1;
  } catch (error) {
    console.error('Error al cargar datos de queries:', error);
  } finally {
    cargando.value = false;
  }
};

const formatearDuracion = (ms) => {
  if (!ms && ms !== 0) return '-';
  const duracion = Number(ms);
  if (duracion < 1000) {
    return `${Math.round(duracion)}ms`;
  } else if (duracion < 60000) {
    return `${(duracion / 1000).toFixed(1)}s`;
  } else {
    return `${(duracion / 60000).toFixed(1)}min`;
  }
};

const getColorDuracion = (ms) => {
  if (ms < 200) return 'bg-green-100 text-green-800';
  if (ms < 500) return 'bg-yellow-100 text-yellow-800';
  if (ms < 1000) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

const calcularPorcentaje = (lentas, total) => {
  if (total === 0) return 0;
  return Math.round((lentas / total) * 100);
};

const getColorPorcentaje = (lentas, total) => {
  const porcentaje = calcularPorcentaje(lentas, total);
  if (porcentaje < 10) return 'bg-green-100 text-green-800';
  if (porcentaje < 25) return 'bg-yellow-100 text-yellow-800';
  if (porcentaje < 50) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

onMounted(() => {
  cargarDatos();
});
</script>
