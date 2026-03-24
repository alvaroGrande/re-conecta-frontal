<template>
  <div class="space-y-3">
    <!-- Resumen de la encuesta -->
    <div class="bg-blue-50 rounded-lg p-3 border border-blue-200">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h4 class="text-xs font-semibold text-blue-900 mb-0.5">Vista de Administrador</h4>
          <p class="text-xs text-blue-700">
            {{ totalRespuestas }} {{ totalRespuestas === 1 ? 'persona ha respondido' : 'personas han respondido' }}
          </p>
          <p class="text-xs text-blue-600 mt-0.5">
            Creada por:
            <span class="font-medium">
              {{ encuesta.creador ? `${encuesta.creador.nombre} ${encuesta.creador.Apellidos}` : 'Administración' }}
            </span>
          </p>
        </div>
        <button
          v-if="encuesta.estado === 'activa'"
          @click="cerrar"
          :disabled="cargandoCierre"
          class="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          <svg v-if="!cargandoCierre" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ cargandoCierre ? 'Cerrando...' : 'Cerrar Encuesta' }}
        </button>
        <span v-else class="px-2 py-1 bg-gray-200 text-gray-600 rounded-lg text-xs font-medium">
          Cerrada
        </span>
      </div>
    </div>

    <!-- Tabs -->
    <Tabs value="0">
      <TabList>
        <Tab value="0">Resultados</Tab>
        <Tab value="1">Respuestas ({{ totalRespuestas }})</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="0">
          <div class="py-2 space-y-3">
            <div v-if="cargandoResultados" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p class="mt-2 text-sm text-gray-600">Cargando resultados...</p>
            </div>

            <div v-else-if="resultados" class="space-y-3">
              <PreguntaResultado
                v-for="pregunta in encuesta.preguntas"
                :key="pregunta.id"
                :pregunta="pregunta"
                :resultado="resultados[pregunta.id]"
              />
            </div>
          </div>
        </TabPanel>
        <TabPanel value="1">
          <div class="py-2 space-y-3">
            <div v-if="cargandoRespuestas" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p class="mt-2 text-sm text-gray-600">Cargando respuestas...</p>
            </div>

            <div v-else-if="respuestasDetalladas.length === 0" class="text-center py-8">
              <svg class="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 class="mt-2 text-xs font-medium text-gray-900">Sin respuestas</h3>
              <p class="mt-1 text-xs text-gray-500">Aún no hay respuestas para esta encuesta.</p>
            </div>

            <RespuestasTabla
              v-else
              :respuestas="respuestasDetalladas"
              @seleccionar-usuario="abrirRespuestasUsuario"
            />
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
    
    <!-- Dialog: Confirmar cierre de encuesta -->
    <Dialog 
      v-model:visible="mostrarConfirmDialog"
      modal 
      header="Confirmar cierre de encuesta"
      :style="{ width: '450px' }"
    >
      <p class="mb-4">¿Estás seguro de que deseas cerrar esta encuesta? <strong>Esta acción no se puede deshacer.</strong></p>
      <p class="text-sm text-gray-600">Una vez cerrada, los usuarios no podrán enviar más respuestas y los resultados quedarán finalizados.</p>
      <template #footer>
        <div class="flex gap-2 justify-end">
          <Button label="Cancelar" severity="secondary" @click="mostrarConfirmDialog = false" />
          <Button label="Cerrar Encuesta" severity="danger" @click="confirmarCierre" :loading="cargandoCierre" />
        </div>
      </template>
    </Dialog>

    <!-- Dialog: Respuestas de un usuario concreto -->
    <Dialog
      v-model:visible="mostrarDialogUsuario"
      modal
      :header="`Respuestas de ${usuarioSeleccionado?.usuario?.nombre} ${usuarioSeleccionado?.usuario?.Apellidos}`"
      :style="{ width: '100%', maxWidth: '700px' }"
    >
      <div v-if="cargandoRespuestasUsuario" class="flex justify-center py-10">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      <div v-else-if="respuestasUsuario" class="space-y-2">
        <p class="text-xs text-gray-400 mb-1">
          Respondió el {{ formatearFecha(usuarioSeleccionado?.fechaRespuesta) }}
        </p>
        <div
          v-for="pregunta in encuesta.preguntas"
          :key="pregunta.id"
          class="bg-gray-50 rounded-lg p-3"
        >
          <p class="text-xs font-semibold text-gray-700 mb-1.5">{{ pregunta.texto }}</p>
          <!-- Pregunta múltiple -->
          <template v-if="pregunta.tipo === 'multiple'">
            <div
              v-for="opcion in pregunta.opciones"
              :key="opcion.id"
              :class="[
                'flex items-center gap-1.5 text-xs py-0.5',
                respuestaUsuarioPorOpcion(pregunta.id, opcion.id)
                  ? 'text-blue-700 font-medium'
                  : 'text-gray-400'
              ]"
            >
              <svg
                class="h-3.5 w-3.5 flex-shrink-0"
                :class="respuestaUsuarioPorOpcion(pregunta.id, opcion.id) ? 'text-blue-600' : 'text-gray-300'"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path
                  v-if="respuestaUsuarioPorOpcion(pregunta.id, opcion.id)"
                  stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <circle v-else cx="12" cy="12" r="9" stroke-width="2" />
              </svg>
              {{ opcion.texto }}
            </div>
          </template>
          <!-- Pregunta abierta -->
          <template v-else-if="pregunta.tipo === 'abierta'">
            <p class="text-xs text-gray-700 bg-white border border-gray-200 rounded p-2 italic">
              {{ respuestaUsuarioAbierta(pregunta.id) || 'Sin respuesta' }}
            </p>
          </template>
        </div>
      </div>
      <template #footer>
        <Button label="Cerrar" severity="secondary" @click="mostrarDialogUsuario = false" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import PreguntaResultado from './PreguntaResultado.vue';
import RespuestasTabla from './RespuestasTabla.vue';
import { obtenerResultadosEncuesta, obtenerRespuestasDetalladas, obtenerRespuestasDeUsuario, cerrarEncuesta } from '@services/encuestas';
import { showSuccess, showError } from '@services/toastService';

const props = defineProps({
  encuesta: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['cerrar', 'encuesta-cerrada']);

const resultados = ref(null);
const respuestasDetalladas = ref([]);
const cargandoResultados = ref(false);
const cargandoRespuestas = ref(false);
const cargandoCierre = ref(false);
const mostrarConfirmDialog = ref(false);

// Estado para la vista por usuario
const mostrarDialogUsuario = ref(false);
const usuarioSeleccionado = ref(null);
const respuestasUsuario = ref(null);
const cargandoRespuestasUsuario = ref(false);

const totalRespuestas = computed(() => respuestasDetalladas.value.length);

const cargarResultados = async () => {
  cargandoResultados.value = true;
  try {
    const data = await obtenerResultadosEncuesta(props.encuesta.id);
    resultados.value = data.resultados || {};
  } catch (error) {
    console.error('Error al cargar resultados:', error);
    showError('Error al cargar los resultados');
  } finally {
    cargandoResultados.value = false;
  }
};

const cargarRespuestas = async () => {
  cargandoRespuestas.value = true;
  try {
    const data = await obtenerRespuestasDetalladas(props.encuesta.id);
    respuestasDetalladas.value = data || [];
  } catch (error) {
    console.error('Error al cargar respuestas:', error);
    showError('Error al cargar las respuestas');
  } finally {
    cargandoRespuestas.value = false;
  }
};

const cerrar = () => {
  mostrarConfirmDialog.value = true;
};

const abrirRespuestasUsuario = async (respuesta) => {
  usuarioSeleccionado.value = respuesta;
  mostrarDialogUsuario.value = true;
  cargandoRespuestasUsuario.value = true;
  try {
    const data = await obtenerRespuestasDeUsuario(props.encuesta.id, respuesta.usuario.id);
    respuestasUsuario.value = data?.detalles || [];
  } catch (error) {
    showError('Error al cargar las respuestas del usuario');
  } finally {
    cargandoRespuestasUsuario.value = false;
  }
};

const respuestaUsuarioPorOpcion = (preguntaId, opcionId) => {
  if (!respuestasUsuario.value) return false;
  return respuestasUsuario.value.some(
    d => d.pregunta_id === preguntaId && d.opcion_id === opcionId
  );
};

const respuestaUsuarioAbierta = (preguntaId) => {
  if (!respuestasUsuario.value) return '';
  const detalle = respuestasUsuario.value.find(d => d.pregunta_id === preguntaId);
  return detalle?.texto_respuesta || '';
};

const formatearFecha = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const confirmarCierre = async () => {
  cargandoCierre.value = true;
  try {
    await cerrarEncuesta(props.encuesta.id);
    showSuccess('Encuesta cerrada correctamente');
    emit('encuesta-cerrada');
  } catch (error) {
    console.error('Error al cerrar encuesta:', error);
    showError('Error al cerrar la encuesta');
  } finally {
    cargandoCierre.value = false;
    mostrarConfirmDialog.value = false;
  }
};

onMounted(() => {
  cargarResultados();
  cargarRespuestas();
});
</script>
