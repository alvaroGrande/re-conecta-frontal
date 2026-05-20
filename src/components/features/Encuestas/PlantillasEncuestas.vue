<template>
  <div class="space-y-4">
    <!-- Cabecera -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
          <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Plantillas de encuestas
        </h2>
        <p class="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
          Reutiliza preguntas predefinidas para crear encuestas rápidamente
        </p>
      </div>
      <div class="flex gap-2 items-center">
        <!-- Toggle mostrar inactivas (solo admin) -->
        <div v-if="esAdmin" class="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 rounded-lg px-3 py-1.5">
          <ToggleSwitch v-model="mostrarInactivas" inputId="toggle-inactivas" />
          <label for="toggle-inactivas" class="text-xs text-gray-600 dark:text-slate-300 cursor-pointer select-none">
            Mostrar inactivas
          </label>
        </div>
        <Button icon="pi pi-plus" label="Nueva plantilla" severity="help" size="small" @click="abrirCrear" />
      </div>
    </div>

    <!-- Cargando -->
    <div v-if="cargando" class="flex justify-center py-8">
      <ProgressSpinner style="width:40px;height:40px" />
    </div>

    <!-- Lista vacía -->
    <div v-else-if="plantillasFiltradas.length === 0"
      class="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-600">
      <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p class="text-gray-500 dark:text-slate-400 font-medium">No hay plantillas aún</p>
      <p class="text-gray-400 dark:text-slate-500 text-sm mt-1">Crea tu primera plantilla para ahorrar tiempo</p>
    </div>

    <!-- Tarjetas de plantillas -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="plantilla in plantillasFiltradas"
        :key="plantilla.id"
        :class="[
          'bg-white dark:bg-slate-800 rounded-xl border shadow-sm hover:shadow-md transition-all p-4 flex flex-col gap-3',
          plantilla.activa
            ? 'border-gray-200 dark:border-slate-700'
            : 'border-dashed border-gray-300 dark:border-slate-600 opacity-60'
        ]"
      >
        <!-- Header tarjeta -->
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-gray-800 dark:text-slate-100 truncate">{{ plantilla.titulo }}</h3>
              <Tag
                v-if="!plantilla.activa"
                value="Inactiva"
                severity="secondary"
                class="text-xs shrink-0"
              />
            </div>
            <p v-if="plantilla.descripcion" class="text-xs text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-2">
              {{ plantilla.descripcion }}
            </p>
          </div>
          <Tag
            :value="`v${plantilla.version}`"
            severity="secondary"
            class="shrink-0 text-xs"
          />
        </div>

        <!-- Estadísticas -->
        <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
          <span class="flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ (plantilla.preguntas || []).length }} preguntas
          </span>
          <span v-if="plantilla.creador" class="flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {{ plantilla.creador.nombre }}
          </span>
          <Tag
            v-if="plantilla.rol_objetivo"
            :value="etiquetaRol(plantilla.rol_objetivo)"
            :severity="severidadRol(plantilla.rol_objetivo)"
            class="text-xs"
          />
        </div>

        <!-- Acciones -->
        <div class="flex gap-2 pt-1 border-t border-gray-100 dark:border-slate-700">
          <Button
            v-if="plantilla.activa"
            icon="pi pi-file-edit"
            label="Usar plantilla"
            size="small"
            severity="success"
            class="flex-1"
            @click="emit('usar-plantilla', plantilla)"
          />
          <Button
            v-else
            icon="pi pi-ban"
            label="Inactiva"
            size="small"
            severity="secondary"
            class="flex-1"
            disabled
          />
          <Button
            :icon="plantilla.activa ? 'pi pi-pause-circle' : 'pi pi-play-circle'"
            :title="plantilla.activa ? 'Desactivar plantilla' : 'Activar plantilla'"
            size="small"
            :severity="plantilla.activa ? 'warn' : 'success'"
            text
            rounded
            :loading="togglingId === plantilla.id"
            @click="toggleActiva(plantilla)"
          />
          <Button
            icon="pi pi-pencil"
            size="small"
            severity="secondary"
            text
            rounded
            @click="abrirEditar(plantilla)"
          />
          <Button
            icon="pi pi-trash"
            size="small"
            severity="danger"
            text
            rounded
            @click="confirmarEliminar(plantilla)"
          />
        </div>
      </div>
    </div>

    <!-- ── Modal crear/editar plantilla ── -->
    <Dialog
      v-model:visible="modalPlantilla"
      modal
      :header="editando ? 'Editar plantilla' : 'Nueva plantilla'"
      :style="{ width: '100%', maxWidth: '800px' }"
    >
      <div class="space-y-4">
        <!-- Datos básicos -->
        <div class="grid grid-cols-1 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Título *</label>
            <InputText v-model="form.titulo" placeholder="Nombre de la plantilla" class="w-full" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Descripción</label>
            <Textarea v-model="form.descripcion" placeholder="Descripción opcional" rows="2" class="w-full" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Audiencia</label>
            <Select
              v-model="form.rol_objetivo"
              :options="opcionesRol"
              option-label="label"
              option-value="value"
              placeholder="Todos los roles"
              class="w-full"
            />
          </div>
        </div>

        <!-- Preguntas -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-medium text-gray-700 dark:text-slate-300">Preguntas</h4>
            <Button icon="pi pi-plus" label="Añadir" size="small" severity="info" @click="agregarPregunta" />
          </div>

          <div v-if="form.preguntas.length === 0"
            class="text-center py-6 bg-gray-50 dark:bg-slate-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600">
            <p class="text-gray-400 dark:text-slate-500 text-sm">Sin preguntas aún</p>
          </div>

          <div class="space-y-3 max-h-72 overflow-y-auto pr-1">
            <div
              v-for="(preg, idx) in form.preguntas"
              :key="idx"
              class="border border-gray-200 dark:border-slate-600 rounded-lg p-3 bg-white dark:bg-slate-700"
            >
              <div class="flex items-start gap-2 mb-2">
                <span class="shrink-0 w-6 h-6 flex items-center justify-center bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold">
                  {{ idx + 1 }}
                </span>
                <Select
                  v-model="preg.tipo"
                  :options="tiposPreguntas"
                  option-label="label"
                  option-value="value"
                  size="small"
                  class="w-36 shrink-0"
                />
                <Button icon="pi pi-trash" severity="danger" text rounded size="small" @click="eliminarPregunta(idx)" />
              </div>
              <InputText v-model="preg.texto" placeholder="Texto de la pregunta" class="w-full mb-2" size="small" />

              <!-- Opciones para múltiple -->
              <div v-if="preg.tipo === 'multiple'" class="space-y-1 pl-2">
                <div v-for="(op, oidx) in preg.opciones" :key="oidx" class="flex gap-1">
                  <InputText v-model="op.texto" :placeholder="`Opción ${oidx + 1}`" class="flex-1" size="small" />
                  <Button icon="pi pi-times" text severity="danger" size="small" @click="eliminarOpcion(idx, oidx)" />
                </div>
                <Button
                  icon="pi pi-plus"
                  label="Opción"
                  text
                  size="small"
                  severity="secondary"
                  @click="agregarOpcion(idx)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Cancelar" severity="secondary" @click="modalPlantilla = false" />
          <Button
            :label="editando ? 'Guardar cambios' : 'Crear plantilla'"
            :icon="guardando ? 'pi pi-spin pi-spinner' : 'pi pi-check'"
            :disabled="guardando"
            severity="help"
            @click="guardarPlantilla"
          />
        </div>
      </template>
    </Dialog>

    <!-- Confirm dialog -->
    <ConfirmDialog />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'
import ToggleSwitch from 'primevue/toggleswitch'
import ConfirmDialog from 'primevue/confirmdialog'
import {
  obtenerPlantillas,
  crearPlantilla,
  actualizarPlantilla,
  eliminarPlantilla,
} from '@/services/encuestas.js'

const props = defineProps({
  esAdmin: { type: Boolean, default: false },
})
const emit = defineEmits(['usar-plantilla'])

const confirm = useConfirm()
const toast   = useToast()

const plantillas      = ref([])
const cargando        = ref(false)
const modalPlantilla  = ref(false)
const editando        = ref(false)
const guardando       = ref(false)
const togglingId      = ref(null)
const mostrarInactivas = ref(false)

const plantillasFiltradas = computed(() =>
  mostrarInactivas.value
    ? plantillas.value
    : plantillas.value.filter(p => p.activa)
)

const formVacio = () => ({ titulo: '', descripcion: '', rol_objetivo: null, preguntas: [] })
const form = ref(formVacio())

const tiposPreguntas = [
  { label: 'Opción múltiple', value: 'multiple' },
  { label: 'Respuesta abierta', value: 'abierta' },
]

const opcionesRol = [
  { label: 'Todos', value: null },
  { label: 'Administradores', value: 1 },
  { label: 'Coordinadores', value: 2 },
  { label: 'Usuarios', value: 3 },
]

function etiquetaRol(rol) {
  return { 1: 'Admin', 2: 'Coordinador', 3: 'Usuario' }[rol] ?? 'Todos'
}
function severidadRol(rol) {
  return { 1: 'danger', 2: 'warn', 3: 'info' }[rol] ?? 'secondary'
}

async function cargar() {
  cargando.value = true
  try {
    // Cargar TODAS (activas e inactivas) para la vista de gestión
    plantillas.value = await obtenerPlantillas({ soloActivas: false })
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las plantillas', life: 3000 })
  } finally {
    cargando.value = false
  }
}

async function toggleActiva(plantilla) {
  togglingId.value = plantilla.id
  try {
    await actualizarPlantilla(plantilla.id, { activa: !plantilla.activa })
    plantilla.activa = !plantilla.activa
    toast.add({
      severity: plantilla.activa ? 'success' : 'warn',
      summary:  plantilla.activa ? 'Activada' : 'Desactivada',
      detail:   `La plantilla "${plantilla.titulo}" ya ${plantilla.activa ? 'está activa' : 'está desactivada'}`,
      life:     3000,
    })
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar el estado', life: 3000 })
  } finally {
    togglingId.value = null
  }
}

function abrirCrear() {
  editando.value    = false
  form.value        = formVacio()
  modalPlantilla.value = true
}

function abrirEditar(plantilla) {
  editando.value = true
  form.value = {
    id:           plantilla.id,
    titulo:       plantilla.titulo,
    descripcion:  plantilla.descripcion || '',
    rol_objetivo: plantilla.rol_objetivo ?? null,
    preguntas:    (plantilla.preguntas || []).map(p => ({
      texto:   p.texto,
      tipo:    p.tipo,
      opciones: (p.opciones || []).map(o => ({ texto: o.texto })),
    })),
  }
  modalPlantilla.value = true
}

function agregarPregunta() {
  form.value.preguntas.push({ texto: '', tipo: 'multiple', opciones: [{ texto: '' }, { texto: '' }] })
}
function eliminarPregunta(idx) {
  form.value.preguntas.splice(idx, 1)
}
function agregarOpcion(pregIdx) {
  form.value.preguntas[pregIdx].opciones.push({ texto: '' })
}
function eliminarOpcion(pregIdx, opIdx) {
  form.value.preguntas[pregIdx].opciones.splice(opIdx, 1)
}

async function guardarPlantilla() {
  if (!form.value.titulo.trim()) {
    toast.add({ severity: 'warn', summary: 'Campo requerido', detail: 'El título es obligatorio', life: 3000 })
    return
  }
  if (form.value.preguntas.length === 0) {
    toast.add({ severity: 'warn', summary: 'Sin preguntas', detail: 'Añade al menos una pregunta', life: 3000 })
    return
  }

  guardando.value = true
  try {
    if (editando.value) {
      await actualizarPlantilla(form.value.id, {
        titulo:       form.value.titulo,
        descripcion:  form.value.descripcion,
        rol_objetivo: form.value.rol_objetivo,
      })
      toast.add({ severity: 'success', summary: 'Actualizada', detail: 'Plantilla actualizada correctamente', life: 3000 })
    } else {
      await crearPlantilla({
        titulo:       form.value.titulo,
        descripcion:  form.value.descripcion,
        rol_objetivo: form.value.rol_objetivo,
        preguntas:    form.value.preguntas,
      })
      toast.add({ severity: 'success', summary: 'Creada', detail: 'Plantilla creada correctamente', life: 3000 })
    }
    modalPlantilla.value = false
    await cargar()
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la plantilla', life: 3000 })
  } finally {
    guardando.value = false
  }
}

function confirmarEliminar(plantilla) {
  confirm.require({
    message: `¿Eliminar la plantilla "${plantilla.titulo}"? Esta acción no se puede deshacer.`,
    header:  'Eliminar plantilla',
    icon:    'pi pi-exclamation-triangle',
    acceptLabel: 'Eliminar',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await eliminarPlantilla(plantilla.id)
        toast.add({ severity: 'success', summary: 'Eliminada', detail: 'Plantilla eliminada', life: 3000 })
        await cargar()
      } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la plantilla', life: 3000 })
      }
    },
  })
}

onMounted(cargar)
</script>
