<script setup>
/**
 * GestionMonitorModal.vue
 * Permite a un monitor/supervisor inscribir o desinscribir
 * a los usuarios que supervisa en un taller concreto.
 */
import { ref, watch, computed } from 'vue';
import { getInscritos, inscribirUsuario, desinscribirUsuario } from '@/services/talleres.js';
import { obtenerUsuariosCoordinados } from '@/services/contactos.js';
import { showSuccess, showError } from '@/services/toastService';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';

const props = defineProps({
  visible: { type: Boolean, default: false },
  taller: { type: Object, default: null }
});

const emit = defineEmits(['update:visible']);

const usuarios = ref([]);       // usuarios supervisados por este monitor
const inscritos = ref(new Set()); // IDs ya inscritos en el taller
const loading = ref(false);
const procesando = ref(new Set()); // IDs en proceso de inscripción/desinscripción
const busqueda = ref('')
const inscribiendoTodos = ref(false)

const usuariosFiltrados = computed(() => {
  const q = busqueda.value.trim().toLowerCase();
  if (!q) return usuarios.value;
  return usuarios.value.filter(u =>
    `${u.nombre ?? ''} ${u.Apellidos ?? ''}`.toLowerCase().includes(q) ||
    (u.email ?? '').toLowerCase().includes(q)
  );
});

watch(() => props.visible, async (val) => {
  if (val && props.taller) {
    loading.value = true;
    try {
      const [coordinados, inscritosData] = await Promise.all([
        obtenerUsuariosCoordinados(),
        getInscritos(props.taller.id)
      ]);
      // La API devuelve { data: [...], total, ... } para rol 2
      usuarios.value = Array.isArray(coordinados) ? coordinados : (coordinados.data ?? []);
      inscritos.value = new Set(inscritosData.map(i => i.usuario?.id));
    } catch (e) {
      console.error('Error al cargar datos del monitor', e);
    } finally {
      loading.value = false;
    }
  } else {
    usuarios.value = [];
    inscritos.value = new Set();
    procesando.value = new Set();
    busqueda.value = '';
  }
});

async function toggleInscripcion(usuario) {
  if (procesando.value.has(usuario.id)) return;

  procesando.value = new Set([...procesando.value, usuario.id]);
  try {
    if (inscritos.value.has(usuario.id)) {
      await desinscribirUsuario(props.taller.id, usuario.id);
      inscritos.value.delete(usuario.id);
      inscritos.value = new Set(inscritos.value);
      showSuccess('Desinscrito', `${usuario.nombre} eliminado del taller`);
    } else {
      await inscribirUsuario(props.taller.id, usuario.id);
      inscritos.value = new Set([...inscritos.value, usuario.id]);
      showSuccess('Inscrito', `${usuario.nombre} inscrito en el taller`);
    }
  } catch (e) {
    showError('Error', e?.response?.data?.message ?? e.message);
  } finally {
    procesando.value.delete(usuario.id);
    procesando.value = new Set(procesando.value);
  }
}

function cerrar() {
  emit('update:visible', false);
}
async function inscribirTodos() {
  const pendientes = usuariosFiltrados.value.filter(u => !inscritos.value.has(u.id))
  if (pendientes.length === 0) return
  inscribiendoTodos.value = true
  const errores = []
  await Promise.allSettled(
    pendientes.map(async u => {
      try {
        await inscribirUsuario(props.taller.id, u.id)
        inscritos.value = new Set([...inscritos.value, u.id])
      } catch (e) {
        errores.push(u.nombre)
      }
    })
  )
  inscribiendoTodos.value = false
  if (errores.length) {
    showError('Aviso', `No se pudo inscribir a: ${errores.join(', ')}`)
  } else {
    showSuccess('Completado', `${pendientes.length} usuario(s) inscritos`)
  }
}
function nombreCompleto(u) {
  return `${u?.nombre ?? ''} ${u?.Apellidos ?? ''}`.trim();
}
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="cerrar"
    :header="`Gestionar inscripciones: ${taller?.titulo ?? ''}`"
    :modal="true"
    :closable="true"
    :style="{ width: '620px' }"
  >
    <div v-if="loading" class="py-6 text-center text-gray-500">Cargando...</div>

    <template v-else>
      <div class="mb-3">
        <InputText
          v-model="busqueda"
          placeholder="Buscar por nombre o email..."
          class="w-full"
          size="small"
        />
      </div>

      <div v-if="usuarios.length === 0" class="py-6 text-center text-gray-400">
        No tienes usuarios supervisados asignados.
      </div>

      <div v-else-if="usuariosFiltrados.length === 0" class="py-6 text-center text-gray-400">
        Sin resultados para "{{ busqueda }}".
      </div>

      <table v-else class="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
      <thead class="bg-gray-100">
        <tr>
          <th class="text-left px-4 py-2">Usuario</th>
          <th class="text-left px-4 py-2">Email</th>
          <th class="text-center px-4 py-2">Estado</th>
          <th class="text-center px-4 py-2">Acción</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="u in usuariosFiltrados"
          :key="u.id"
          class="border-t border-gray-200 hover:bg-gray-50"
        >
          <td class="px-4 py-2 flex items-center gap-2">
            <img
              v-if="u.foto_perfil"
              :src="u.foto_perfil"
              class="w-7 h-7 rounded-full object-cover"
              alt=""
            />
            <span
              v-else
              class="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs"
            >
              {{ u.nombre?.charAt(0) ?? '?' }}
            </span>
            {{ nombreCompleto(u) }}
          </td>
          <td class="px-4 py-2 text-gray-500">{{ u.email }}</td>
          <td class="px-4 py-2 text-center">
            <span
              v-if="inscritos.has(u.id)"
              class="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold"
            >Inscrito</span>
            <span
              v-else
              class="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs"
            >No inscrito</span>
          </td>
          <td class="px-4 py-2 text-center">
            <button
              class="px-3 py-1 text-sm rounded border cursor-pointer disabled:opacity-50"
              :class="inscritos.has(u.id)
                ? 'border-red-300 text-red-600 hover:bg-red-50'
                : 'border-primary-400 text-primary-600 hover:bg-primary-50'"
              :disabled="procesando.has(u.id)"
              @click="toggleInscripcion(u)"
            >
              {{ procesando.has(u.id) ? '...' : inscritos.has(u.id) ? 'Desinscribir' : 'Inscribir' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>    </template>
    <template #footer>
      <div class="flex justify-between w-full">
        <button
          v-if="usuariosFiltrados.length > 0"
          class="px-3 py-1.5 text-sm rounded border border-primary-400 text-primary-600 hover:bg-primary-50 disabled:opacity-50 cursor-pointer"
          :disabled="inscribiendoTodos || usuariosFiltrados.every(u => inscritos.has(u.id))"
          @click="inscribirTodos"
        >
          {{ inscribiendoTodos ? 'Inscribiendo...' : 'Inscribir todos' }}
        </button>
        <span v-else />
        <button class="px-4 py-2 border rounded hover:bg-gray-50" @click="cerrar">Cerrar</button>
      </div>
    </template>
  </Dialog>
</template>
