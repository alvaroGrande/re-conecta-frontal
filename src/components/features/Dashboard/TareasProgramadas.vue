<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Tareas Programadas</h3>
        <p class="text-sm text-gray-500 mt-1">Ejecuciones automáticas del sistema</p>
      </div>
      <button
        @click="cargarTareas"
        class="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
      >
        <ArrowPathIcon class="w-4 h-4 inline mr-1" :class="{ 'animate-spin': cargando }" />
        Actualizar
      </button>
    </div>

    <!-- Estadísticas generales -->
    <div v-if="estadisticas" class="grid grid-cols-4 gap-4 mb-6">
      <div class="bg-blue-50 rounded-lg p-4">
        <div class="text-2xl font-bold text-blue-600">{{ estadisticas.total_ejecuciones || 0 }}</div>
        <div class="text-sm text-gray-600">Total</div>
      </div>
      <div class="bg-green-50 rounded-lg p-4">
        <div class="text-2xl font-bold text-green-600">{{ estadisticas.exitosas || 0 }}</div>
        <div class="text-sm text-gray-600">Exitosas</div>
      </div>
      <div class="bg-red-50 rounded-lg p-4">
        <div class="text-2xl font-bold text-red-600">{{ estadisticas.con_errores || 0 }}</div>
        <div class="text-sm text-gray-600">Con errores</div>
      </div>
      <div class="bg-purple-50 rounded-lg p-4">
        <div class="text-2xl font-bold text-purple-600">{{ formatearDuracion(estadisticas.duracion_promedio_ms) }}</div>
        <div class="text-sm text-gray-600">Duración promedio</div>
      </div>
    </div>

    <!-- Resumen de tareas -->
    <div v-if="resumen.length > 0" class="mb-6">
      <h4 class="text-sm font-semibold text-gray-700 mb-3">Última ejecución por tarea</h4>
      <div class="space-y-2">
        <div
          v-for="tarea in resumen"
          :key="tarea.nombre_tarea"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <div
              class="w-2 h-2 rounded-full"
              :class="{
                'bg-green-500': tarea.estado === 'completada',
                'bg-red-500': tarea.estado === 'error',
                'bg-yellow-500': tarea.estado === 'iniciada'
              }"
            ></div>
            <div>
              <div class="font-medium text-gray-900">{{ formatearNombreTarea(tarea.nombre_tarea) }}</div>
              <div class="text-xs text-gray-500">{{ tarea.mensaje || 'Sin mensaje' }}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-600">{{ formatearFecha(tarea.fecha_inicio) }}</div>
            <div class="text-xs text-gray-500">{{ formatearDuracion(tarea.duracion_ms) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Últimas ejecuciones -->
    <div>
      <h4 class="text-sm font-semibold text-gray-700 mb-3">Historial reciente</h4>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarea</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duración</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Procesados</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mensaje</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="ejecucion in ejecuciones" :key="ejecucion.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 whitespace-nowrap">
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="{
                    'bg-green-100 text-green-800': ejecucion.estado === 'completada',
                    'bg-red-100 text-red-800': ejecucion.estado === 'error',
                    'bg-yellow-100 text-yellow-800': ejecucion.estado === 'iniciada'
                  }"
                >
                  {{ ejecucion.estado }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">
                  {{ formatearNombreTarea(ejecucion.nombre_tarea) }}
                </div>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {{ formatearFecha(ejecucion.fecha_inicio) }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {{ formatearDuracion(ejecucion.duracion_ms) }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                <div v-if="ejecucion.registros_archivados > 0" class="text-green-600">
                  ↓ {{ ejecucion.registros_archivados }} archivados
                </div>
                <div v-if="ejecucion.registros_eliminados > 0" class="text-red-600">
                  ✕ {{ ejecucion.registros_eliminados }} eliminados
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600">
                <div 
                  v-if="ejecucion.estado === 'error'" 
                  class="text-red-600 max-w-xs truncate cursor-pointer"
                  v-tooltip.top="ejecucion.error || 'Error desconocido'"
                >
                  {{ ejecucion.error || 'Error desconocido' }}
                </div>
                <div 
                  v-else 
                  class="max-w-xs truncate cursor-pointer"
                  v-tooltip.top="ejecucion.mensaje || '-'"
                >
                  {{ ejecucion.mensaje || '-' }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="ejecuciones.length === 0 && !cargando" class="text-center py-8 text-gray-500">
        No hay ejecuciones registradas
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ArrowPathIcon } from '@heroicons/vue/24/outline';
import api from '@/services/api';

const cargando = ref(false);
const ejecuciones = ref([]);
const resumen = ref([]);
const estadisticas = ref(null);

const cargarTareas = async () => {
  cargando.value = true;
  try {
    const [ejecucionesRes, resumenRes, estadisticasRes] = await Promise.all([
      api.get('/tasks/ejecuciones?limite=10'),
      api.get('/tasks/resumen'),
      api.get('/tasks/estadisticas')
    ]);

    ejecuciones.value = ejecucionesRes.data;
    resumen.value = resumenRes.data;
    estadisticas.value = estadisticasRes.data;
  } catch (error) {
    console.error('Error al cargar tareas:', error);
  } finally {
    cargando.value = false;
  }
};

const formatearNombreTarea = (nombre) => {
  const nombres = {
    'archivado_actividades': 'Archivado de Actividades'
  };
  return nombres[nombre] || nombre;
};

const formatearFecha = (fecha) => {
  if (!fecha) return '-';
  const date = new Date(fecha);
  const ahora = new Date();
  const diff = ahora - date;
  
  // Si es menos de 1 minuto
  if (diff < 60000) {
    return 'Hace unos segundos';
  }
  
  // Si es menos de 1 hora
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `Hace ${mins} min`;
  }
  
  // Si es hoy
  if (date.toDateString() === ahora.toDateString()) {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }
  
  // Formato completo
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatearDuracion = (ms) => {
  if (!ms) return '-';
  const duracion = Number(ms);
  if (duracion < 1000) {
    return `${Math.round(duracion)}ms`;
  } else if (duracion < 60000) {
    return `${(duracion / 1000).toFixed(1)}s`;
  } else {
    return `${(duracion / 60000).toFixed(1)}min`;
  }
};

onMounted(() => {
  cargarTareas();
});
</script>
