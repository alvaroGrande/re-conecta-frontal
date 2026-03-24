<template>
  <div class="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-slate-100">Administración de Caché</h3>
        <p class="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Gestiona las entradas de caché en memoria
        </p>
      </div>
      <div class="flex gap-2">
        <button
          @click="cargarDetalles"
          :disabled="cargando"
          class="px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowPathIcon class="w-4 h-4 inline mr-1" :class="{ 'animate-spin': cargando }" />
          Actualizar
        </button>
        <button
          @click="limpiarTodo"
          :disabled="cargando || !entries.length"
          class="px-3 py-2 text-sm bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <TrashIcon class="w-4 h-4 inline mr-1" />
          Limpiar Todo
        </button>
      </div>
    </div>

    <!-- Resumen -->
    <div v-if="summary" class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <p class="text-sm text-gray-600 dark:text-slate-400">Total Entradas</p>
        <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ summary.totalEntries }}</p>
      </div>
      <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
        <p class="text-sm text-gray-600 dark:text-slate-400">Tamaño Total</p>
        <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ summary.totalSize }}</p>
      </div>
      <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
        <p class="text-sm text-gray-600 dark:text-slate-400">TTL</p>
        <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">5 minutos</p>
      </div>
    </div>

    <!-- Mensaje cuando no hay datos -->
    <div v-if="!cargando && entries.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-slate-100">No hay entradas en caché</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-slate-400">El caché está vacío o las entradas han expirado.</p>
    </div>

    <!-- Tabla de entradas -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
        <thead class="bg-gray-50 dark:bg-slate-700/50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Clave
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Tamaño
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Expira en
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Fecha de Expiración
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
          <tr v-for="entry in entriesVisibles" :key="entry.key" class="hover:bg-gray-50 dark:hover:bg-slate-700/40">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900 dark:text-slate-100">{{ entry.key }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                {{ entry.size }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
              {{ formatearTiempoRestante(entry.expiresIn) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
              {{ formatearFecha(entry.expiresAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex gap-2 justify-end">
                <button
                  @click="verDatos(entry.key)"
                  class="px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Ver datos
                </button>
                <button
                  @click="eliminarEntrada(entry.key)"
                  :disabled="eliminando === entry.key"
                  class="px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TrashIcon class="w-4 h-4 inline mr-1" :class="{ 'animate-pulse': eliminando === entry.key }" />
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Dialog: Ver datos cacheados -->
    <Dialog 
      v-model:visible="mostrarDialogoDatos" 
      modal 
      header="Datos Cacheados"
      :style="{ width: '700px', maxHeight: '80vh' }"
    >
      <div v-if="cargandoDatos" class="flex justify-center items-center py-8">
        <i class="pi pi-spin pi-spinner text-4xl text-blue-500"></i>
      </div>
      <div v-else-if="datosCacheados" class="max-h-96 overflow-y-auto">
        <div class="mb-3 flex justify-between items-center">
          <span class="text-sm font-semibold text-gray-700 dark:text-slate-300">Clave: {{ claveSeleccionada }}</span>
          <button
            @click="copiarAlPortapapeles"
            class="px-2 py-1 text-xs bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            <i class="pi pi-copy mr-1"></i>
            Copiar JSON
          </button>
        </div>
        <pre class="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 text-sm overflow-x-auto border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-slate-300"><code>{{ formatearJSON(datosCacheados) }}</code></pre>
      </div>
      <div v-else class="text-center py-8 text-gray-500 dark:text-slate-400">
        No se pudieron cargar los datos
      </div>
      <template #footer>
        <div class="flex justify-end">
          <Button label="Cerrar" severity="secondary" @click="mostrarDialogoDatos = false" />
        </div>
      </template>
    </Dialog>

    <!-- Dialog: Confirmar eliminación de entrada -->
    <Dialog 
      v-model:visible="mostrarDialogoEliminar" 
      modal 
      header="Confirmar eliminación"
      :style="{ width: '450px' }"
    >
      <p class="mb-4">¿Está seguro de eliminar la entrada <strong>{{ entradaAEliminar }}</strong> del caché?</p>
      <p class="text-sm text-gray-600 dark:text-slate-400">La siguiente petición a este endpoint consultará la base de datos.</p>
      <template #footer>
        <div class="flex gap-2 justify-end">
          <Button label="Cancelar" severity="secondary" @click="mostrarDialogoEliminar = false" />
          <Button label="Eliminar" severity="danger" @click="confirmarEliminarEntrada" :loading="eliminando !== null" />
        </div>
      </template>
    </Dialog>

    <!-- Dialog: Confirmar limpiar todo -->
    <Dialog 
      v-model:visible="mostrarDialogoLimpiar" 
      modal 
      header="Confirmar limpieza de caché"
      :style="{ width: '450px' }"
    >
      <p class="mb-4">¿Está seguro de limpiar <strong>TODO el caché</strong>?</p>
      <p class="text-sm text-gray-600 dark:text-slate-400">Esta acción no se puede deshacer y todas las peticiones consultarán la base de datos hasta que se vuelva a llenar el caché.</p>
      <template #footer>
        <div class="flex gap-2 justify-end">
          <Button label="Cancelar" severity="secondary" @click="mostrarDialogoLimpiar = false" />
          <Button label="Limpiar Todo" severity="danger" @click="confirmarLimpiarTodo" :loading="cargando" />
        </div>
      </template>
    </Dialog>

    <!-- Toast personalizado para eliminación con cancelar -->
    <Toast position="bottom-center" group="bc">
      <template #message="slotProps">
        <div class="flex flex-col gap-3 w-full">
          <div class="flex items-start gap-3">
            <i class="pi pi-exclamation-triangle text-yellow-500 text-2xl"></i>
            <div class="flex-1">
              <p class="font-semibold text-gray-900 dark:text-slate-100">{{ slotProps.message.summary }}</p>
              <p class="text-sm text-gray-600 dark:text-slate-400">La entrada se eliminará en {{ tiempoRestante }} segundos</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex-1 bg-gray-200 dark:bg-slate-600 rounded-full h-2 overflow-hidden">
              <div 
                class="bg-yellow-500 h-full transition-all duration-1000 ease-linear"
                :style="{ width: `${(tiempoRestante / 10) * 100}%` }"
              ></div>
            </div>
            <span class="text-sm font-medium text-gray-700 dark:text-slate-300">{{ tiempoRestante }}s</span>
          </div>
          <Button 
            label="Cancelar" 
            severity="secondary" 
            size="small"
            @click="cancelarEliminacion" 
            class="w-full"
          />
        </div>
      </template>
    </Toast>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { ArrowPathIcon, TrashIcon } from '@heroicons/vue/24/outline';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { cacheService } from '../services/cache';
import { showError, showSuccess } from '@services/toastService';

const toast = useToast();

const cargando = ref(false);
const eliminando = ref(null);
const summary = ref(null);
const entries = ref([]);
const mostrarDialogoEliminar = ref(false);
const mostrarDialogoLimpiar = ref(false);
const mostrarDialogoDatos = ref(false);
const entradaAEliminar = ref('');
const temporizadorEliminacion = ref(null);
const tiempoRestante = ref(10);
const datosCacheados = ref(null);
const claveSeleccionada = ref('');
const cargandoDatos = ref(false);

// Computed para filtrar las entradas visibles (ocultar la que está siendo eliminada)
const entriesVisibles = computed(() => {
  if (!entradaAEliminar.value || !temporizadorEliminacion.value) {
    return entries.value;
  }
  return entries.value.filter(entry => entry.key !== entradaAEliminar.value);
});

const cargarDetalles = async () => {
  try {
    cargando.value = true;
    const data = await cacheService.obtenerDetalles();
    summary.value = data.summary;
    entries.value = data.entries;
  } catch (error) {
    console.error('Error al cargar detalles del caché:', error);
    showError('Error al cargar detalles del caché');
  } finally {
    cargando.value = false;
  }
};

const eliminarEntrada = (key) => {
  entradaAEliminar.value = key;
  mostrarDialogoEliminar.value = true;
};

const verDatos = async (key) => {
  claveSeleccionada.value = key;
  mostrarDialogoDatos.value = true;
  cargandoDatos.value = true;
  datosCacheados.value = null;
  
  try {
    const data = await cacheService.obtenerDatosEntrada(key);
    datosCacheados.value = data;
  } catch (error) {
    console.error('Error al obtener datos del cach\u00e9:', error);
    showError('Error al obtener los datos cacheados');
  } finally {
    cargandoDatos.value = false;
  }
};

const formatearJSON = (data) => {
  return JSON.stringify(data, null, 2);
};

const copiarAlPortapapeles = async () => {
  try {
    const jsonText = formatearJSON(datosCacheados.value);
    await navigator.clipboard.writeText(jsonText);
    showSuccess('Copiado', 'JSON copiado al portapapeles');
  } catch (error) {
    console.error('Error al copiar:', error);
    showError('Error al copiar al portapapeles');
  }
};

const confirmarEliminarEntrada = async () => {
  const keyAEliminar = entradaAEliminar.value;
  
  // Cerrar el dialog
  mostrarDialogoEliminar.value = false;
  
  // Iniciar temporizador
  tiempoRestante.value = 10;
  
  // Mostrar toast con opción de cancelar
  if (toast) {
    toast.add({
      severity: 'warn',
      summary: 'Eliminando entrada',
      detail: `La entrada '${keyAEliminar}' se eliminará en ${tiempoRestante.value} segundos`,
      life: 10000,
      closable: false,
      group: 'bc'
    });
  }
  
  // Iniciar cuenta regresiva
  temporizadorEliminacion.value = setInterval(() => {
    tiempoRestante.value--;
    
    if (tiempoRestante.value <= 0) {
      ejecutarEliminacion(keyAEliminar);
    }
  }, 1000);
};

const ejecutarEliminacion = async (keyAEliminar) => {
  // Limpiar temporizador
  if (temporizadorEliminacion.value) {
    clearInterval(temporizadorEliminacion.value);
    temporizadorEliminacion.value = null;
  }
  
  // Remover toast
  if (toast) {
    toast.removeGroup('bc');
  }
  
  try {
    eliminando.value = keyAEliminar;
    await cacheService.eliminarEntrada(keyAEliminar);
    showSuccess('Entrada eliminada', `La entrada '${keyAEliminar}' ha sido eliminada del caché`);
    await cargarDetalles();
  } catch (error) {
    console.error('Error al eliminar entrada:', error);
    showError('Error al eliminar entrada del caché');
  } finally {
    eliminando.value = null;
    entradaAEliminar.value = '';
    tiempoRestante.value = 10;
  }
};

const cancelarEliminacion = () => {
  if (temporizadorEliminacion.value) {
    clearInterval(temporizadorEliminacion.value);
    temporizadorEliminacion.value = null;
  }
  
  if (toast) {
    toast.removeGroup('bc');
  }
  
  showSuccess('Cancelado', 'La eliminación ha sido cancelada');
  
  entradaAEliminar.value = '';
  tiempoRestante.value = 10;
};

const limpiarTodo = () => {
  mostrarDialogoLimpiar.value = true;
};

const confirmarLimpiarTodo = async () => {
  try {
    cargando.value = true;
    await cacheService.limpiarTodo();
    showSuccess('Caché limpiado', 'Todo el caché ha sido limpiado correctamente');
    mostrarDialogoLimpiar.value = false;
    await cargarDetalles();
  } catch (error) {
    console.error('Error al limpiar caché:', error);
    showError('Error al limpiar el caché');
  } finally {
    cargando.value = false;
  }
};

const formatearTiempoRestante = (segundos) => {
  if (segundos === -1) return '∞ Indefinido';
  if (segundos <= 0) return 'Expirado';
  
  const minutos = Math.floor(segundos / 60);
  const segs = segundos % 60;
  
  if (minutos > 0) {
    const textoMinutos = minutos === 1 ? 'minuto' : 'minutos';
    if (segs > 0) {
      const textoSegundos = segs === 1 ? 'segundo' : 'segundos';
      return `${minutos} ${textoMinutos} ${segs} ${textoSegundos}`;
    }
    return `${minutos} ${textoMinutos}`;
  }
  
  const textoSegundos = segs === 1 ? 'segundo' : 'segundos';
  return `${segs} ${textoSegundos}`;
};

const formatearFecha = (isoString) => {
  if (!isoString) return '∞ Indefinido';
  const fecha = new Date(isoString);
  return fecha.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

onMounted(() => {
  cargarDetalles();
});

onBeforeUnmount(() => {
  // Limpiar temporizador si el componente se desmonta
  if (temporizadorEliminacion.value) {
    clearInterval(temporizadorEliminacion.value);
  }
});
</script>
