<script setup>
import { ref, watch, computed } from 'vue';
import { getInscritos, desinscribirUsuario } from '@/services/talleres.js';
import { crearNotificacion } from '@/services/notificaciones.js';
import { showSuccess, showError } from '@/services/toastService';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Paginator from 'primevue/paginator';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';

const props = defineProps({
  visible: { type: Boolean, default: false },
  taller: { type: Object, default: null },
  esAdmin: { type: Boolean, default: false }
});

const emit = defineEmits(['update:visible']);

const inscritos = ref([]);
const loading = ref(false);
const busqueda = ref('');
const paginaOffset = ref(0);
const POR_PAGINA = 15;

// Estado del diálogo de confirmación de baja
const dialogBaja = ref(false);
const itemAEliminar = ref(null);
const motivoBaja = ref('');
const procesandoBaja = ref(false);

watch(() => props.visible, async (val) => {
  if (val && props.taller) {
    loading.value = true;
    busqueda.value = '';
    paginaOffset.value = 0;
    try {
      inscritos.value = await getInscritos(props.taller.id);
    } catch (e) {
      console.error('Error al cargar inscritos', e);
    } finally {
      loading.value = false;
    }
  } else {
    inscritos.value = [];
  }
});

// Filtrado por nombre o email
const inscritosFiltrados = computed(() => {
  const q = busqueda.value.trim().toLowerCase();
  if (!q) return inscritos.value;
  return inscritos.value.filter(item => {
    const nombre = nombreCompleto(item.usuario).toLowerCase();
    const email  = (item.usuario?.email ?? '').toLowerCase();
    return nombre.includes(q) || email.includes(q);
  });
});

// Resetear página cuando cambia la búsqueda
watch(busqueda, () => { paginaOffset.value = 0 });

const mostrarPaginador = computed(() => inscritos.value.length > POR_PAGINA);

const inscritosPaginados = computed(() => {
  if (!mostrarPaginador.value) return inscritosFiltrados.value;
  return inscritosFiltrados.value.slice(paginaOffset.value, paginaOffset.value + POR_PAGINA);
});

function cerrar() {
  emit('update:visible', false);
}

function nombreCompleto(u) {
  return `${u?.nombre ?? ''} ${u?.Apellidos ?? ''}`.trim();
}

// ─── Quitar inscrito (admin) ───────────────────────────────────────────────────
function solicitarBaja(item) {
  itemAEliminar.value = item;
  motivoBaja.value = '';
  dialogBaja.value = true;
}

async function confirmarBaja() {
  if (!itemAEliminar.value) return;
  procesandoBaja.value = true;
  const usuario = itemAEliminar.value.usuario;
  try {
    await desinscribirUsuario(props.taller.id, usuario.id);

    // Notificar al usuario con el motivo indicado
    const motivo = motivoBaja.value.trim();
    await crearNotificacion({
      receptor_id: usuario.id,
      tipo: 'taller',
      titulo: `Baja del taller: ${props.taller.titulo}`,
      contenido: motivo
        ? `Has sido dado de baja del taller "${props.taller.titulo}". Motivo: ${motivo}`
        : `Has sido dado de baja del taller "${props.taller.titulo}".`,
    });

    inscritos.value = inscritos.value.filter(
      i => i.usuario?.id !== usuario.id
    );
    dialogBaja.value = false;
    showSuccess('Usuario dado de baja', `${nombreCompleto(usuario)} eliminado del taller`);
  } catch (e) {
    showError('Error', e?.response?.data?.message ?? e.message);
  } finally {
    procesandoBaja.value = false;
  }
}
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="cerrar"
    :header="`Inscritos en: ${taller?.titulo ?? ''}`"
    :modal="true"
    :closable="true"
    :style="{ width: '600px' }"
  >
    <div v-if="loading" class="py-6 text-center text-gray-500">Cargando...</div>

    <template v-else>
      <!-- Buscador -->
      <div class="mb-3">
        <InputText
          v-model="busqueda"
          placeholder="Buscar por nombre o email..."
          class="w-full"
          autocomplete="off"
        />
      </div>

      <div v-if="inscritosFiltrados.length === 0" class="py-6 text-center text-gray-400">
        {{ busqueda ? 'No hay coincidencias.' : 'Nadie inscrito aún.' }}
      </div>

      <table v-else class="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
        <thead class="bg-gray-100">
          <tr>
            <th class="text-left px-4 py-2">Nombre</th>
            <th class="text-left px-4 py-2">Email</th>
            <th class="text-left px-4 py-2">F. inscripción</th>
            <th v-if="esAdmin" class="text-center px-4 py-2">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in inscritosPaginados"
            :key="item.id"
            class="border-t border-gray-200 hover:bg-gray-50"
          >
            <td class="px-4 py-2 flex items-center gap-2">
              <img
                v-if="item.usuario?.foto_perfil"
                :src="item.usuario.foto_perfil"
                class="w-7 h-7 rounded-full object-cover"
                alt=""
              />
              <span v-else class="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                {{ item.usuario?.nombre?.charAt(0) ?? '?' }}
              </span>
              {{ nombreCompleto(item.usuario) }}
            </td>
            <td class="px-4 py-2 text-gray-500">{{ item.usuario?.email }}</td>
            <td class="px-4 py-2 text-gray-400">
              {{ new Date(item.fecha_inscripcion).toLocaleDateString() }}
            </td>
            <td v-if="esAdmin" class="px-4 py-2 text-center">
              <button
                class="px-2 py-1 text-xs rounded border border-red-300 text-red-600 hover:bg-red-50 cursor-pointer"
                @click="solicitarBaja(item)"
              >Quitar</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginador: solo si hay más de 15 inscritos en total -->
      <Paginator
        v-if="mostrarPaginador"
        :rows="POR_PAGINA"
        :totalRecords="inscritosFiltrados.length"
        :first="paginaOffset"
        @page="paginaOffset = $event.first"
        class="mt-2"
      />
    </template>

    <template #footer>
      <div class="flex justify-between items-center w-full">
        <span class="text-sm text-gray-500">
          Total inscritos: <strong>{{ inscritos.length }}</strong>
          <template v-if="busqueda && inscritosFiltrados.length !== inscritos.length">
            &nbsp;· Mostrando <strong>{{ inscritosFiltrados.length }}</strong> resultado{{ inscritosFiltrados.length !== 1 ? 's' : '' }}
          </template>
        </span>
        <Button label="Cerrar" severity="secondary" @click="cerrar" />
      </div>
    </template>
  </Dialog>

  <!-- Dialog: motivo de baja -->
  <Dialog
    v-model:visible="dialogBaja"
    header="Dar de baja al usuario"
    :modal="true"
    :closable="!procesandoBaja"
    :style="{ width: '420px' }"
  >
    <p class="mb-3 text-sm text-gray-600">
      Vas a eliminar a
      <strong>{{ nombreCompleto(itemAEliminar?.usuario) }}</strong>
      del taller <strong>{{ taller?.titulo }}</strong>.
      Se le enviará una notificación automáticamente.
    </p>
    <label class="block text-sm font-medium text-gray-700 mb-1">Motivo <span class="text-gray-400 font-normal">(opcional)</span></label>
    <Textarea
      v-model="motivoBaja"
      rows="3"
      class="w-full"
      placeholder="Ej: No cumple los requisitos del taller..."
      :disabled="procesandoBaja"
      autoResize
    />
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Cancelar" severity="secondary" :disabled="procesandoBaja" @click="dialogBaja = false" />
        <Button label="Confirmar baja" severity="danger" :loading="procesandoBaja" @click="confirmarBaja" />
      </div>
    </template>
  </Dialog>
</template>
