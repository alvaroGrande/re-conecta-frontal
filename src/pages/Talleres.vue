<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  getTalleres,
  activarTaller,
  desactivarTaller,
  inscribirTaller,
  desinscribirTaller,
  getMiInscripcion,
  eliminarTaller,
  cancelarTaller,
  getMotivosCancelacion,
} from '@services/talleres.js'
import { showSuccess, showError } from '@services/toastService'
import { useAuth } from '@/composables/useAuth'

import TalleresTabla from '@features/Talleres/TalleresTabla.vue'
import NuevoTallerForm from '@features/Talleres/NuevoTallerForm.vue'
import InscritosModal from '@features/Talleres/InscritosModal.vue'
import GestionMonitorModal from '@features/Talleres/GestionMonitorModal.vue'
import TallerDocumentos from '@features/Talleres/TallerDocumentos.vue'
import Dialog from 'primevue/dialog'
import ConfirmDialog from 'primevue/confirmdialog'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import Paginator from 'primevue/paginator'
import { useConfirm } from 'primevue/useconfirm'

const confirm = useConfirm()
const router = useRouter()

const { esAdmin, esSupervisor, usuario } = useAuth()

const talleres = ref([])
const misInscripciones = ref(new Set())
const procesando = ref(new Set())

// Paginación
const paginaActual  = ref(1)
const limitPagina   = ref(50)
const totalTalleres = ref(0)
const cargando      = ref(false)

const modalCrear   = ref(false)
const modalEditar  = ref(false)
const tallerEditando = ref(null)

const modalInscritos = ref(false)
const tallerInscritos = ref(null)

const modalMonitor  = ref(false)
const tallerMonitor = ref(null)

const modalDocumentos    = ref(false)
const tallerDocumentos   = ref(null)
const pdfsEnCurso        = ref(new Set())
const pdfsNuevos         = ref(new Set())
function onPdfsSubiendo(id) { pdfsEnCurso.value = new Set([...pdfsEnCurso.value, id]) }
function onPdfsListos(id) {
  const s = new Set(pdfsEnCurso.value); s.delete(id); pdfsEnCurso.value = s
  pdfsNuevos.value = new Set([...pdfsNuevos.value, id])
  setTimeout(() => {
    const n = new Set(pdfsNuevos.value); n.delete(id); pdfsNuevos.value = n
  }, 8000)
}

const modalCancelar    = ref(false)
const tallerACancelar  = ref(null)
const motivoCancelacion = ref('')
const motivoCancelacionId = ref(null)
const procesandoCancelar = ref(false)

// Catálogo de motivos (se carga una sola vez)
const motivosCancelacion = ref([])
let motivosCargados = false
async function cargarMotivos() {
  if (motivosCargados) return
  try {
    motivosCancelacion.value = await getMotivosCancelacion()
    motivosCargados = true
  } catch { /* silencioso */ }
}

onMounted(cargarTalleres)

async function cargarTalleres() {
  cargando.value = true
  try {
    const res = await getTalleres({ page: paginaActual.value, limit: limitPagina.value })
    talleres.value  = res.data
    totalTalleres.value = res.total

    if (usuario.value?.id) {
      const checks = await Promise.allSettled(
        talleres.value.map(t => getMiInscripcion(t.id))
      )
      const ids = new Set()
      checks.forEach((r, idx) => {
        if (r.status === 'fulfilled' && r.value?.inscrito) ids.add(talleres.value[idx].id)
      })
      misInscripciones.value = ids
    }
  } finally {
    cargando.value = false
  }
}

async function onPage(event) {
  paginaActual.value = event.page + 1
  await cargarTalleres()
}

async function toggleInscripcion(taller) {
  if (procesando.value.has(taller.id)) return
  procesando.value = new Set([...procesando.value, taller.id])

  try {
    if (misInscripciones.value.has(taller.id)) {
      const res = await desinscribirTaller(taller.id)
      misInscripciones.value.delete(taller.id)
      misInscripciones.value = new Set(misInscripciones.value)
      taller.inscritos = res.inscritos
      showSuccess('Desinscripción realizada', '')
    } else {
      const res = await inscribirTaller(taller.id)
      misInscripciones.value = new Set([...misInscripciones.value, taller.id])
      taller.inscritos = res.inscritos
      showSuccess('Inscripción realizada', '')
    }
  } catch (e) {
    showError(e?.response?.data?.message ?? 'Error al procesar inscripción')
  } finally {
    procesando.value.delete(taller.id)
    procesando.value = new Set(procesando.value)
  }
}

// CRUD (admin) 
async function activar(taller) {
  try {
    await activarTaller(taller.id)
    const idx = talleres.value.findIndex(t => t.id === taller.id)
    if (idx !== -1) talleres.value[idx].activo = 1
    showSuccess('Taller activado', '')
  } catch (e) {
    showError(e?.response?.data?.message ?? 'Error al activar el taller')
  }
}

async function desactivar(taller) {
  try {
    await desactivarTaller(taller.id)
    const idx = talleres.value.findIndex(t => t.id === taller.id)
    if (idx !== -1) talleres.value[idx].activo = 0
    showSuccess('Taller desactivado', '')
  } catch (e) {
    showError(e?.response?.data?.message ?? 'Error al desactivar el taller')
  }
}

function confirmarEliminar(taller) {
  confirm.require({
    header: 'Eliminar taller',
    message: `¿Eliminar el taller "${taller.titulo}"? Esta acción no se puede deshacer.`,
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancelar',
    acceptLabel: 'Eliminar',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await eliminarTaller(taller.id)
        showSuccess('Taller eliminado', '')
        talleres.value = talleres.value.filter(t => t.id !== taller.id)
      } catch (e) {
        showError(e?.response?.data?.message ?? 'Error al eliminar')
      }
    }
  })
}

function confirmarCancelar(taller) {
  tallerACancelar.value = taller
  motivoCancelacion.value = ''
  motivoCancelacionId.value = null
  modalCancelar.value = true
  cargarMotivos()
}

async function ejecutarCancelacion() {
  if (procesandoCancelar.value) return
  procesandoCancelar.value = true
  try {
    const res = await cancelarTaller(
      tallerACancelar.value.id,
      motivoCancelacion.value.trim() || null,
      motivoCancelacionId.value
    )
    showSuccess('Taller cancelado', `${res.desinscritosTotales} usuario(s) notificado(s). El taller ha sido archivado.`)
    modalCancelar.value = false
    talleres.value = talleres.value.filter(t => t.id !== tallerACancelar.value.id)
  } catch (e) {
    if (e?.response?.status === 404) {
      // Otro administrador ya lo eliminó; cerrar modal y refrescar
      modalCancelar.value = false
      showError('Taller no encontrado', 'Es posible que otro administrador lo haya eliminado. La lista se ha actualizado.')
      await cargarTalleres()
    } else {
      showError(e?.response?.data?.message ?? 'Error al cancelar el taller')
    }
  } finally {
    procesandoCancelar.value = false
  }
}

function abrirEditar(taller) {
  tallerEditando.value = taller
  modalEditar.value = true
}

async function alTallerCreado() {
  modalCrear.value = false
  await cargarTalleres()
}

async function alTallerEditado() {
  modalEditar.value = false
  showSuccess('Taller actualizado', '')
  await cargarTalleres()
}

// Modales inscritos / monitor
function verInscritos(taller) {
  tallerInscritos.value = taller
  modalInscritos.value = true
}

function gestionarMonitor(taller) {
  tallerMonitor.value = taller
  modalMonitor.value = true
}

function verDocumentos(taller) {
  tallerDocumentos.value = taller
  modalDocumentos.value  = true
}
</script>

<template>
  <div class="min-w-full max-w-full px-2 py-2">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">Talleres</h1>
      <div class="flex gap-2">
        <Button v-if="esAdmin" label="Archivados" icon="pi pi-history" severity="secondary" @click="router.push({ name: 'TalleresArchivados' })" />
        <Button v-if="esAdmin" label="Nuevo Taller" icon="pi pi-plus" @click="modalCrear = true" />
      </div>
    </div>

    <TalleresTabla
      :talleres="talleres"
      :mis-inscripciones="misInscripciones"
      :procesando="procesando"
      :es-admin="esAdmin"
      :es-supervisor="esSupervisor"
      :pdfs-en-curso="pdfsEnCurso"
      :pdfs-nuevos="pdfsNuevos"
      @toggle-inscripcion="toggleInscripcion"
      @ver-inscritos="verInscritos"
      @gestionar="gestionarMonitor"
      @activar="activar"
      @desactivar="desactivar"
      @editar="abrirEditar"
      @eliminar="confirmarEliminar"
      @cancelar="confirmarCancelar"
      @ver-documentos="verDocumentos"
    />

    <Paginator
      v-if="totalTalleres > limitPagina"
      :rows="limitPagina"
      :totalRecords="totalTalleres"
      :first="(paginaActual - 1) * limitPagina"
      :rowsPerPageOptions="[25, 50, 100]"
      @page="onPage"
      class="mt-4"
    />
  </div>

  <!-- Modal Crear -->
  <Dialog header="Nuevo Taller" v-model:visible="modalCrear" :modal="true" :closable="true" :style="{ width: '95%', maxWidth: '560px' }">
    <NuevoTallerForm
      @taller-creado="alTallerCreado"
      @pdfs-subiendo="onPdfsSubiendo"
      @pdfs-listos="onPdfsListos"
    />
  </Dialog>

  <!-- Modal Editar -->
  <Dialog header="Editar Taller" v-model:visible="modalEditar" :modal="true" :closable="true" :style="{ width: '95%', maxWidth: '560px' }">
    <NuevoTallerForm :taller="tallerEditando" @taller-editado="alTallerEditado" />
  </Dialog>

  <!-- Modal inscritos -->
  <InscritosModal v-model:visible="modalInscritos" :taller="tallerInscritos" :es-admin="esAdmin" />

  <!-- Modal gestión monitor -->
  <GestionMonitorModal v-model:visible="modalMonitor" :taller="tallerMonitor" />

  <!-- Modal documentos PDF -->
  <TallerDocumentos
    v-model:visible="modalDocumentos"
    :taller="tallerDocumentos"
    :es-admin="esAdmin"
    :es-supervisor="esSupervisor"
  />

  <!-- Dialog cancelar taller (con motivo) -->
  <Dialog
    v-model:visible="modalCancelar"
    header="Cancelar taller"
    :modal="true"
    :closable="!procesandoCancelar"
    :style="{ width: '480px' }"
  >
    <div v-if="tallerACancelar" class="flex flex-col gap-4">
      <p class="text-sm text-gray-700">
        ¿Cancelar el taller <strong>"{{ tallerACancelar.titulo }}"</strong>?<br />
        Todos los usuarios inscritos serán desinscri­tos y notificados.
        <span class="font-semibold text-orange-600"> El taller se moverá a Archivados.</span>
      </p>

      <!-- Motivo predefinido -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-gray-500">Motivo de cancelación <span class="text-gray-400">(recomendado)</span></label>
        <Select
          v-model="motivoCancelacionId"
          :options="motivosCancelacion"
          option-label="nombre"
          option-value="id"
          placeholder="Selecciona un motivo…"
          class="w-full"
          :disabled="procesandoCancelar"
          show-clear
        />
      </div>

      <!-- Nota libre adicional -->
      <div class="flex flex-col gap-1">
        <div class="flex items-center justify-between">
          <label class="text-xs font-semibold text-gray-500">Notas adicionales <span class="text-gray-400">(opcional)</span></label>
          <span class="text-xs" :class="motivoCancelacion.length >= 500 ? 'text-red-500 font-semibold' : 'text-gray-400'">{{ motivoCancelacion.length }}/500</span>
        </div>
        <Textarea
          v-model="motivoCancelacion"
          rows="2"
          placeholder="Añade detalles si lo deseas…"
          class="w-full"
          :maxlength="500"
          :disabled="procesandoCancelar"
        />
      </div>

      <div class="flex justify-end gap-2">
        <Button label="Volver" severity="secondary" :disabled="procesandoCancelar" @click="modalCancelar = false" />
        <Button
          label="Cancelar taller"
          severity="danger"
          icon="pi pi-ban"
          :loading="procesandoCancelar"
          @click="ejecutarCancelacion"
        />
      </div>
    </div>
  </Dialog>

  <ConfirmDialog />
</template>
