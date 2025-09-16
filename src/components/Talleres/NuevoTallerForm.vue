<script setup>

import { crearTaller } from '../../services/talleres.js'
import { TIPO_PAGO_CURSO, TIPO_CURSO } from '../../helpers/constants.js'

import { ref } from 'vue';
const emit = defineEmits(['taller-creado']);
import axios from 'axios';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';

const form = ref({
  tipo_pago: 'Gratis',
  titulo: '',
  descripcion: '',
  fecha: '',
  duracion: '',
  aforo: null,
  activo : 1
});

const errors = ref({});
const tiposCursos = ref(
  Object.entries(TIPO_CURSO).map(([key, value]) => ({
    name: key.charAt(0) + key.slice(1).toLowerCase(), // Capitaliza la primera letra
    code: value.toLowerCase()
  }))
)
const tiposPago = ref(
  Object.entries(TIPO_PAGO_CURSO).map(([key, value]) => ({
    name: key.charAt(0) + key.slice(1).toLowerCase(), // Capitaliza la primera letra
    code: value.toLowerCase()
  }))
)

// Función para validar campos
function validarForm() {
  errors.value = {};
  if (!form.value.titulo) errors.value.titulo = 'El título es obligatorio';
  if (!form.value.descripcion) errors.value.descripcion = 'La descripción es obligatoria';
  if (!form.value.fecha) errors.value.fecha = 'La fecha es obligatoria';
  if (!form.value.duracion) errors.value.duracion = 'La duración es obligatoria';
  if (!form.value.aforo) errors.value.aforo = 'El aforo es obligatorio';
  return Object.keys(errors.value).length === 0;
}

// Función para enviar datos
async function submitForm() {
  if (!validarForm()) return;

  try {
    console.log('Creando taller:', form.value);
    form.value.modalidad = form.value.modalidad.code;
    form.value.tipo_pago = form.value.tipo_pago.code;
    // Ejemplo de llamada al backend
    // await axios.post('/api/talleres', form.value);
    const taller = await crearTaller(form.value);
    // alert('Taller creado con éxito');
    emit('taller-creado', { ...form.value }); 
    limpiarForm();
  } catch (error) {
    console.error('Error al crear taller', error);
  }
}

// Limpiar formulario
function limpiarForm() {
  form.value = {
    titulo: '',
    descripcion: '',
    fecha: '',
    duracion: '',
    aforo: null,
  };
  errors.value = {};
}

// Opcional: limpiar formulario al abrir/cerrar modal si pasas un prop
</script>

<template>
  <form @submit.prevent="submitForm" class="space-y-4">
    
    <!-- Tipo y Variante -->
    <div class="flex gap-2">
     <Select v-model="form.modalidad" :options="tiposCursos" optionLabel="name" placeholder="Selecciona tipo de taller" class="w-full md:w-56" />
      <Select v-model="form.tipo_pago" :options="tiposPago" optionLabel="name" placeholder="Selecciona tipo de pago" class="w-full md:w-56" />
    </div>

    <!-- Título -->
    <div>
      <input
        v-model="form.titulo"
        type="text"
        placeholder="Título del taller"
        class="border rounded p-2 w-full"
      />
      <p v-if="errors.titulo" class="text-red-500 text-sm">{{ errors.titulo }}</p>
    </div>

    <!-- Descripción -->
    <div>
      <textarea
        v-model="form.descripcion"
        placeholder="Descripción"
        class="border rounded p-2 w-full"
        rows="3"
      ></textarea>
      <p v-if="errors.descripcion" class="text-red-500 text-sm">{{ errors.descripcion }}</p>
    </div>

    <!-- Fecha -->
    <div>
        <DatePicker v-model="form.fecha" class="w-full" dateFormat="dd/mm/yy" showTime hourFormat="24"/>
      <p v-if="errors.fecha" class="text-red-500 text-sm">{{ errors.fecha }}</p>
    </div>

    <!-- Duración -->
    <div>
      <input v-model="form.duracion" type="text" placeholder="Duración" class="border rounded p-2 w-full" />
      <p v-if="errors.duracion" class="text-red-500 text-sm">{{ errors.duracion }}</p>
    </div>

    <!-- Aforo -->
    <div>
      <input v-model="form.aforo" type="number" placeholder="Aforo" class="border rounded p-2 w-full" />
      <p v-if="errors.aforo" class="text-red-500 text-sm">{{ errors.aforo }}</p>
    </div>

    <!-- Botón de envío -->
    <div class="flex justify-end">
      <button
        type="submit"
        class="bg-primary-500 hover:bg-primary-700 text-white px-4 py-2 rounded"
      >
        Crear Taller
      </button>
    </div>
  </form>
</template>
