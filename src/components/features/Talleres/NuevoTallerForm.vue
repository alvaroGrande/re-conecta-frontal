<script setup>

import { crearTaller, editarTaller } from '@/services/talleres.js'
import { TIPO_PAGO_CURSO, TIPO_CURSO } from '@/helpers/constants.js'

import { ref, computed, watch } from 'vue';

const props = defineProps({
  /** Si se pasa un taller, el formulario funciona en modo edición */
  taller: { type: Object, default: null }
});

const modoEdicion = computed(() => !!props.taller);

const emit = defineEmits(['taller-creado', 'taller-editado']);
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';

const tiposCursos = ref(
  Object.entries(TIPO_CURSO).map(([key, value]) => ({
    name: key.charAt(0) + key.slice(1).toLowerCase(),
    code: value.toLowerCase()
  }))
)
const tiposPago = ref(
  Object.entries(TIPO_PAGO_CURSO).map(([key, value]) => ({
    name: key.charAt(0) + key.slice(1).toLowerCase(),
    code: value.toLowerCase()
  }))
)

function buildFormDefault() {
  return {
    tipo_pago: tiposPago.value.find(t => t.code === (props.taller?.tipo_pago ?? 'gratis')) ?? tiposPago.value[0],
    modalidad: tiposCursos.value.find(t => t.code === (props.taller?.modalidad ?? 'online')) ?? tiposCursos.value[0],
    titulo: props.taller?.titulo ?? '',
    descripcion: props.taller?.descripcion ?? '',
    fecha: props.taller?.fecha ? new Date(props.taller.fecha) : '',
    duracion: props.taller?.duracion ?? 60,
    aforo: props.taller?.aforo ?? 10,
    activo: props.taller?.activo ?? 1,
  };
}

const form = ref(buildFormDefault());

// Cuando cambia el prop taller (abrir modal en modo edición), reiniciar el form
watch(() => props.taller, () => {
  form.value = buildFormDefault();
  errors.value = {};
});

const errors = ref({});

function validarForm() {
  errors.value = {};
  if (!form.value.titulo) errors.value.titulo = 'El título es obligatorio';
  if (!form.value.descripcion) errors.value.descripcion = 'La descripción es obligatoria';
  if (!form.value.fecha) errors.value.fecha = 'La fecha es obligatoria';
  if (!form.value.duracion) errors.value.duracion = 'La duración es obligatoria';
  if (!form.value.aforo) errors.value.aforo = 'El aforo es obligatorio';
  return Object.keys(errors.value).length === 0;
}

async function submitForm() {
  if (!validarForm()) return;

  try {
    const payload = {
      ...form.value,
      modalidad: form.value.modalidad?.code ?? form.value.modalidad,
      tipo_pago: form.value.tipo_pago?.code ?? form.value.tipo_pago,
    };

    if (modoEdicion.value) {
      await editarTaller(props.taller.id, payload);
      emit('taller-editado');
    } else {
      const creado = await crearTaller(payload);
      emit('taller-creado', creado);
    }

    limpiarForm();
  } catch (error) {
    // El interceptor global ya muestra el toast de error de API;
    // aquí capturamos errores inesperados de lógica local.
    if (!error?.response) {
      console.error('Error inesperado al guardar taller', error);
    }
  }
}

function limpiarForm() {
  form.value = buildFormDefault();
  errors.value = {};
}
</script>

<template>
  <form @submit.prevent="submitForm" class="space-y-4">
    <!-- Tipo y Variante -->
    <div class="flex gap-2">
      <Select v-model="form.modalidad" :options="tiposCursos" option-label="name" placeholder="Selecciona tipo de taller" class="w-full md:w-56" />
      <Select v-model="form.tipo_pago" :options="tiposPago" option-label="name" placeholder="Selecciona tipo de pago" class="w-full md:w-56" />
    </div>

    <!-- Título -->
    <div>
      <input v-model="form.titulo" type="text" placeholder="Título del taller" class="border rounded p-2 w-full" />
      <p v-if="errors.titulo" class="text-red-500 text-sm">{{ errors.titulo }}</p>
    </div>

    <!-- Descripción -->
    <div>
      <textarea v-model="form.descripcion" placeholder="Descripción" class="border rounded p-2 w-full" rows="3" />
      <p v-if="errors.descripcion" class="text-red-500 text-sm">{{ errors.descripcion }}</p>
    </div>

    <!-- Fecha -->
    <div>
      <DatePicker v-model="form.fecha" class="w-full" date-format="dd/mm/yy" show-time hour-format="24" />
      <p v-if="errors.fecha" class="text-red-500 text-sm">{{ errors.fecha }}</p>
    </div>

    <!-- Duración -->
    <div>
      <input v-model="form.duracion" type="text" placeholder="Duración (horas)" class="border rounded p-2 w-full" />
      <p v-if="errors.duracion" class="text-red-500 text-sm">{{ errors.duracion }}</p>
    </div>

    <!-- Aforo -->
    <div>
      <input v-model="form.aforo" type="number" placeholder="Aforo" class="border rounded p-2 w-full" />
      <p v-if="errors.aforo" class="text-red-500 text-sm">{{ errors.aforo }}</p>
    </div>

    <!-- Botón de envío -->
    <div class="flex justify-end">
      <button type="submit" class="bg-primary-500 hover:bg-primary-700 text-white px-4 py-2 rounded">
        {{ modoEdicion ? 'Guardar cambios' : 'Crear Taller' }}
      </button>
    </div>
  </form>
</template>

