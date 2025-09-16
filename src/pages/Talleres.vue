<script setup>
import { ref, onMounted } from 'vue'
import { getTalleres, activarTaller, desactivarTaller, inscribirTaller} from '../services/talleres.js'
import { showSuccess } from "../services/toastService";

import CategoriaBadge from '../components/CategoriaBadge.vue'
import NuevoTallerForm from '../components/Talleres/NuevoTallerForm.vue';
import Dialog from 'primevue/dialog';

const talleres = ref([])
const dialogVisible = ref(false);

onMounted(async () => {
  talleres.value = await getTalleres()
  console.log(talleres.value)
})

function recordar(taller) {
  console.log('Usuario recuerda el taller:', taller.id)
  // Aquí podrías hacer llamada al backend con axios.post('/api/talleres/apuntarse', { id: taller.id })
}

function abrirModal() {
  dialogVisible.value = true;
}

function cerrarModal() {
  dialogVisible.value = false;
}

async function agregarTaller(nuevo) {
  dialogVisible.value = false; // Cierra modal
  //talleres.value.push(nuevo); // Añade a la tabla
  talleres.value = await getTalleres()
}
async function activar(taller) {
  const response = await activarTaller(taller.id)
  if(response)
    showSuccess('Taller activado',"")
  await updateLocal(taller, 1)
}
async function desactivar(taller) {
  const response = await desactivarTaller(taller.id)
  if(response)
    showSuccess('Taller desactivado', "")
  await updateLocal(taller, 0)
}

async function inscribir(taller) {
  const response = await inscribirTaller(taller.id)
  if(response)
    showSuccess('Inscripción realizada', "")
    const index = talleres.value.findIndex(t => t.id === taller.id);
    talleres.value[index].inscritos = response
}

function updateLocal(taller, action){
    const index = talleres.value.findIndex(t => t.id === taller.id);
    if (index !== -1) {
        talleres.value[index].activo = action;
    }
}
</script>

<template>
  <div class="min-w-full max-w-full px-2 py-2">
    <h1 class="text-3xl font-bold mb-6">Próximos Talleres</h1>
    <Button label="Crear Nuevo Taller" icon="pi pi-plus" class="mb-4" @click="abrirModal" />
    <div class="overflow-x-auto">
      <table class="w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead class="bg-gray-100">
          <tr>
            <th class="text-left px-4 py-2">Categoría</th>
            <th class="text-left px-4 py-2">Taller</th>
            <th class="text-left px-4 py-2">Fecha</th>
            <th class="text-left px-4 py-2">Aforo</th>
            <th class="text-left px-4 py-2">Activo</th>
            <th class="text-center px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="taller in talleres" :key="taller.titulo" class="border-t border-gray-200 hover:bg-gray-50">
            <td class="px-4 py-3">
              <CategoriaBadge :tipo="taller.modalidad" :variante="taller.tipo_pago" />
            </td>
            <td class="px-4 py-3">
              <p class="font-bold text-gray-800">{{ taller.titulo }}</p>
              <p class="text-gray-500 text-sm">{{ taller.descripcion }}</p>
            </td>
             <td class="px-4 py-3">
                <p class="text-gray-600 text-sm">Fecha: {{ new Date(taller.fecha).toLocaleDateString() }} {{ new Date(taller.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</p>
                <p class="text-gray-600 text-sm">Duración: {{ taller.duracion }} horas</p>
          
            </td>
            <td class="px-4 py-3">
              <p class="text-gray-600 text-sm">Aforo: {{ taller.aforo }}</p>
              <p class="text-gray-600 text-sm">Inscritos: {{ taller.inscritos || 0 }}</p>
            </td>
            <td class="px-4 py-3">
              <span v-if="taller.activo" class="px-2 py-1 bg-green-100 text-green-600 rounded-full text-sm font-semibold">Sí</span>
              <span v-else class="px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">No</span>
              <button v-if="!taller.activo" class="px-3 py-1 border border-gray-400 text-gray-700 rounded hover:bg-gray-100 cursor-pointer" @click="activar(taller)">Activar</button>
              <button v-if="taller.activo" class="px-3 py-1 border border-gray-400 text-gray-700 rounded hover:bg-gray-100 cursor-pointer" @click="desactivar(taller)">Desactivar</button>
            </td>
            <td class="px-4 py-3 flex justify-center space-x-2">
              <button class="px-3 py-1 border border-gray-400 text-gray-700 rounded hover:bg-gray-100 cursor-pointer" @click="inscribir(taller)">Apúntame</button>
              <button class="px-3 py-1 bg-primary text-white rounded hover:bg-primary-700 cursor-pointer" @click="recordar(taller)">Recordarme</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <Dialog header="Crear Nuevo Taller" v-model:visible="dialogVisible" :modal="true" :closable="true" :style="{ width: '500px' }">
      <NuevoTallerForm @taller-creado="agregarTaller" />
    </Dialog>
</template>
