<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import {
  getTalleresArchivados,
  getResumenArchivados,
  getTallerArchivadoDetalle,
} from '@services/talleres.js'
import { showError } from '@services/toastService'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

import Button from 'primevue/button'
import ResumenPeriodo from '@features/TalleresArchivados/ResumenPeriodo.vue'
import TalleresArchivadosTabla from '@features/TalleresArchivados/TalleresArchivadosTabla.vue'
import DetalleModal from '@features/TalleresArchivados/DetalleModal.vue'
import CopiarTallerModal from '@features/TalleresArchivados/CopiarTallerModal.vue'

const router = useRouter()
const { esAdmin } = useAuth()

watch(esAdmin, val => {
  if (val === false) router.replace({ name: 'Talleres' })
}, { immediate: true })

const POR_PAGINA      = 20
const archivados      = ref([])
const resumen         = ref([])
const totalArchivados = ref(0)
const loading         = ref(false)
const paginaOffset    = ref(0)

const filtroAnio = ref(null)
const filtroMes  = ref(null)

const opcionesAnio = computed(() => {
  const anios = [...new Set(resumen.value.map(r => r.anio))].sort((a, b) => b - a)
  return [{ label: 'Todos los años', value: null }, ...anios.map(a => ({ label: String(a), value: a }))]
})
const opcionesMes = [
  { label: 'Todos los meses', value: null },
  ...['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
    .map((label, i) => ({ label, value: i + 1 }))
]

const modalDetalle   = ref(false)
const detalle        = ref(null)
const loadingDetalle = ref(false)
const modalCopiar    = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    resumen.value = await getResumenArchivados()
    await cargar()
  } finally {
    loading.value = false
  }
})

async function cargar() {
  loading.value = true
  try {
    const res = await getTalleresArchivados({
      anio:  filtroAnio.value,
      mes:   filtroMes.value,
      page:  Math.floor(paginaOffset.value / POR_PAGINA) + 1,
      limit: POR_PAGINA,
    })
    archivados.value      = res.data
    totalArchivados.value = res.total
  } finally {
    loading.value = false
  }
}

async function aplicarFiltros() {
  paginaOffset.value = 0
  await cargar()
}

function seleccionarPeriodo(r) {
  if (filtroAnio.value === r.anio && filtroMes.value === r.mes) {
    filtroAnio.value = null
    filtroMes.value  = null
  } else {
    filtroAnio.value = r.anio
    filtroMes.value  = r.mes
  }
  aplicarFiltros()
}

function quitarFiltros() {
  filtroAnio.value = null
  filtroMes.value  = null
  aplicarFiltros()
}

async function verDetalle(taller) {
  detalle.value        = null
  modalDetalle.value   = true
  loadingDetalle.value = true
  try {
    detalle.value = await getTallerArchivadoDetalle(taller.id)
  } catch (e) {
    showError(e?.response?.data?.message ?? e.message)
    modalDetalle.value = false
  } finally {
    loadingDetalle.value = false
  }
}
</script>

<template>
  <div class="min-w-full max-w-full px-2 py-2">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold">Talleres archivados</h1>
        <p class="text-gray-500 text-sm mt-1">Historial de talleres finalizados. Solo visible para administradores.</p>
      </div>
      <Button label="← Talleres activos" severity="secondary" @click="router.push({ name: 'Talleres' })" />
    </div>

    <ResumenPeriodo
      :resumen="resumen"
      :filtro-anio="filtroAnio"
      :filtro-mes="filtroMes"
      @seleccionar="seleccionarPeriodo"
    />

    <TalleresArchivadosTabla
      :archivados="archivados"
      :loading="loading"
      :total="totalArchivados"
      :filtro-anio="filtroAnio"
      :filtro-mes="filtroMes"
      :opciones-anio="opcionesAnio"
      :opciones-mes="opcionesMes"
      :pagina-offset="paginaOffset"
      :por-pagina="POR_PAGINA"
      @update:filtroAnio="filtroAnio = $event"
      @update:filtroMes="filtroMes = $event"
      @aplicar-filtros="aplicarFiltros"
      @quitar-filtros="quitarFiltros"
      @ver-detalle="verDetalle"
      @page="e => { paginaOffset = e.first; cargar() }"
    />
  </div>

  <DetalleModal
    v-model:visible="modalDetalle"
    :detalle="detalle"
    :loading-detalle="loadingDetalle"
    @abrir-copiar="modalCopiar = true"
  />

  <CopiarTallerModal
    v-model:visible="modalCopiar"
    :detalle="detalle"
    @taller-creado="modalDetalle = false"
  />
</template>
