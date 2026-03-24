<script setup>
import { ref, computed, watch } from 'vue'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import Button from 'primevue/button'
import { crearTaller, editarTaller, subirDocumentoPDF } from '@/services/talleres.js'
import { TIPO_PAGO_CURSO, TIPO_CURSO } from '@/helpers/constants.js'
import { showError, showSuccess } from '@services/toastService'

const props = defineProps({
  taller: { type: Object, default: null }
})
const emit = defineEmits(['taller-creado', 'taller-editado', 'pdfs-subiendo', 'pdfs-listos'])

const modoEdicion = computed(() => !!props.taller)

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
    tipo_pago:   tiposPago.value.find(t => t.code === (props.taller?.tipo_pago ?? 'gratis')) ?? tiposPago.value[0],
    modalidad:   tiposCursos.value.find(t => t.code === (props.taller?.modalidad ?? 'online')) ?? tiposCursos.value[0],
    titulo:      props.taller?.titulo ?? '',
    descripcion: props.taller?.descripcion ?? '',
    fecha:       props.taller?.fecha ? new Date(props.taller.fecha) : '',
    duracion:    props.taller?.duracion ?? 60,
    aforo:       props.taller?.aforo ?? 10,
    activo:      props.taller?.activo ?? 1,
  }
}

const form     = ref(buildFormDefault())
const errors   = ref({})
const enviando = ref(false)

// PDFs a adjuntar al crear (no en edición, ya existe TallerDocumentos para eso)
const pdfsSel     = ref([])   // [{ file }]
const pdfInputRef = ref(null)

watch(() => props.taller, () => {
  form.value   = buildFormDefault()
  errors.value = {}
  pdfsSel.value = []
})

function validarForm() {
  errors.value = {}
  if (!form.value.titulo)      errors.value.titulo      = 'El título es obligatorio'
  if (!form.value.descripcion) errors.value.descripcion = 'La descripción es obligatoria'
  if (!form.value.fecha)       errors.value.fecha       = 'La fecha es obligatoria'
  if (!form.value.duracion)    errors.value.duracion    = 'La duración es obligatoria'
  if (!form.value.aforo)       errors.value.aforo       = 'El aforo es obligatorio'
  return Object.keys(errors.value).length === 0
}

function onPDFSeleccionado(e) {
  const files = Array.from(e.target.files)
  for (const file of files) {
    if (file.type !== 'application/pdf') {
      showError(`"${file.name}" no es un PDF`)
      continue
    }
    if (file.size > 100 * 1024 * 1024) {
      showError(`"${file.name}" supera los 100 MB`)
      continue
    }
    pdfsSel.value.push({ file })
  }
  e.target.value = ''
}

function quitarPDF(idx) {
  pdfsSel.value.splice(idx, 1)
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

async function submitForm() {
  if (!validarForm()) return
  enviando.value = true
  try {
    const payload = {
      ...form.value,
      modalidad: form.value.modalidad?.code ?? form.value.modalidad,
      tipo_pago: form.value.tipo_pago?.code ?? form.value.tipo_pago,
    }

    if (modoEdicion.value) {
      await editarTaller(props.taller.id, payload)
      form.value   = buildFormDefault()
      errors.value = {}
      emit('taller-editado')
    } else {
      const creado = await crearTaller(payload)
      // Capturar PDFs antes de resetear para subirlos en segundo plano
      const pdfsParaSubir = pdfsSel.value.map(i => i.file)
      const { id: tallerId, titulo: tallerTitulo } = creado
      // Resetear y cerrar modal inmediatamente
      form.value    = buildFormDefault()
      errors.value  = {}
      pdfsSel.value = []
      emit('taller-creado', creado)
      // Subir PDFs en segundo plano sin bloquear al usuario
      if (pdfsParaSubir.length > 0) {
        emit('pdfs-subiendo', tallerId)
        Promise.allSettled(pdfsParaSubir.map(f => subirDocumentoPDF(tallerId, f)))
          .then(results => {
            const fallidos = results.filter(r => r.status === 'rejected').length
            if (fallidos) showError(`${fallidos} PDF(s) no pudieron subirse en "${tallerTitulo}"`)
            else showSuccess(`PDFs disponibles en "${tallerTitulo}"`)
            emit('pdfs-listos', tallerId)
          })
      }
    }
  } catch (error) {
    if (!error?.response) console.error('Error inesperado al guardar taller', error)
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <form @submit.prevent="submitForm" class="space-y-0">

    <!-- ── Cabecera de categorías ─────────────────────────────────────── -->
    <div class="flex gap-3 mb-5">
      <div class="flex-1">
        <label class="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Modalidad</label>
        <Select
          v-model="form.modalidad"
          :options="tiposCursos"
          option-label="name"
          placeholder="Modalidad"
          class="w-full"
        />
      </div>
      <div class="flex-1">
        <label class="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Tipo de pago</label>
        <Select
          v-model="form.tipo_pago"
          :options="tiposPago"
          option-label="name"
          placeholder="Pago"
          class="w-full"
        />
      </div>
    </div>

    <!-- ── Sección: Información básica ───────────────────────────────── -->
    <div class="rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden mb-4">
      <div class="bg-gray-50 dark:bg-slate-800 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200 dark:border-slate-700">
        <i class="pi pi-info-circle text-blue-500"></i>
        <span class="text-sm font-semibold text-gray-700 dark:text-slate-200">Información del taller</span>
      </div>
      <div class="p-4 space-y-4 bg-white dark:bg-slate-900">
        <!-- Título -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Título <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.titulo"
            type="text"
            placeholder="Ej: Taller de mindfulness"
            class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400
                   border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100"
            :class="errors.titulo ? 'border-red-400 focus:ring-red-400' : ''"
          />
          <p v-if="errors.titulo" class="text-red-500 text-xs mt-1 flex items-center gap-1">
            <i class="pi pi-exclamation-circle text-[10px]"></i>{{ errors.titulo }}
          </p>
        </div>

        <!-- Descripción -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Descripción <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="form.descripcion"
            placeholder="Describe de qué trata el taller, qué aprenderán los participantes…"
            rows="3"
            class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400
                   border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 resize-none"
            :class="errors.descripcion ? 'border-red-400 focus:ring-red-400' : ''"
          />
          <p v-if="errors.descripcion" class="text-red-500 text-xs mt-1 flex items-center gap-1">
            <i class="pi pi-exclamation-circle text-[10px]"></i>{{ errors.descripcion }}
          </p>
        </div>
      </div>
    </div>

    <!-- ── Sección: Fecha y capacidad ────────────────────────────────── -->
    <div class="rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden mb-4">
      <div class="bg-gray-50 dark:bg-slate-800 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200 dark:border-slate-700">
        <i class="pi pi-calendar text-green-500"></i>
        <span class="text-sm font-semibold text-gray-700 dark:text-slate-200">Fecha y capacidad</span>
      </div>
      <div class="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-slate-900">
        <!-- Fecha -->
        <div class="sm:col-span-3">
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Fecha y hora <span class="text-red-500">*</span>
          </label>
          <DatePicker
            v-model="form.fecha"
            class="w-full"
            date-format="dd/mm/yy"
            show-time
            hour-format="24"
            :min-date="modoEdicion ? undefined : new Date()"
          />
          <p v-if="errors.fecha" class="text-red-500 text-xs mt-1 flex items-center gap-1">
            <i class="pi pi-exclamation-circle text-[10px]"></i>{{ errors.fecha }}
          </p>
        </div>

        <!-- Duración -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Duración (h) <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.duracion"
            type="number"
            min="0.5"
            step="0.5"
            placeholder="1.5"
            class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400
                   border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100"
            :class="errors.duracion ? 'border-red-400' : ''"
          />
          <p v-if="errors.duracion" class="text-red-500 text-xs mt-1">{{ errors.duracion }}</p>
        </div>

        <!-- Aforo -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Aforo <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.aforo"
            type="number"
            min="1"
            placeholder="20"
            class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400
                   border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100"
            :class="errors.aforo ? 'border-red-400' : ''"
          />
          <p v-if="errors.aforo" class="text-red-500 text-xs mt-1">{{ errors.aforo }}</p>
        </div>
      </div>
    </div>

    <!-- ── Sección: Documentos PDF (solo creación) ───────────────────── -->
    <div v-if="!modoEdicion" class="rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden mb-5">
      <div class="bg-gray-50 dark:bg-slate-800 px-4 py-2.5 flex items-center justify-between border-b border-gray-200 dark:border-slate-700">
        <div class="flex items-center gap-2">
          <i class="pi pi-file-pdf text-red-500"></i>
          <span class="text-sm font-semibold text-gray-700 dark:text-slate-200">Documentos PDF</span>
          <span class="text-xs text-gray-400 font-normal">(opcional · máx. 100 MB/archivo)</span>
        </div>
        <Button
          type="button"
          icon="pi pi-plus"
          label="Añadir"
          size="small"
          severity="secondary"
          @click="pdfInputRef.click()"
        />
        <input
          ref="pdfInputRef"
          type="file"
          accept="application/pdf"
          multiple
          class="hidden"
          @change="onPDFSeleccionado"
        />
      </div>

      <div class="bg-white dark:bg-slate-900 p-4">
        <!-- Lista de PDFs seleccionados -->
        <ul v-if="pdfsSel.length" class="space-y-2">
          <li
            v-for="(item, idx) in pdfsSel"
            :key="idx"
            class="flex items-center gap-3 rounded-lg px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
          >
            <i class="pi pi-file-pdf text-red-400 text-lg flex-shrink-0"></i>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-700 dark:text-slate-200 truncate">{{ item.file.name }}</p>
              <p class="text-xs text-gray-400">{{ formatBytes(item.file.size) }}</p>
            </div>
            <button type="button" class="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors" @click="quitarPDF(idx)">
              <i class="pi pi-times"></i>
            </button>
          </li>
        </ul>

        <!-- Zona de drop vacía -->
        <div
          v-else
          class="flex flex-col items-center justify-center py-6 rounded-lg border-2 border-dashed border-gray-200 dark:border-slate-700 cursor-pointer hover:border-blue-300 transition-colors"
          @click="pdfInputRef.click()"
        >
          <i class="pi pi-cloud-upload text-3xl text-gray-300 mb-2"></i>
          <p class="text-sm text-gray-400">Haz clic o arrastra PDFs aquí</p>
        </div>
      </div>
    </div>

    <!-- ── Acciones ───────────────────────────────────────────────────── -->
    <div class="flex justify-end gap-2 pt-1">
      <Button
        type="submit"
        :icon="enviando ? 'pi pi-spin pi-spinner' : (modoEdicion ? 'pi pi-save' : 'pi pi-check')"
        :label="enviando ? 'Creando taller…' : (modoEdicion ? 'Guardar cambios' : 'Crear taller')"
        :loading="false"
        :disabled="enviando"
        severity="success"
      />
    </div>
  </form>
</template>

