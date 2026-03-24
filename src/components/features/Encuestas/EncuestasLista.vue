<template>
  <div>
    <!-- Barra de filtros pasadas (siempre visible, independiente del estado de carga) -->
    <div v-if="!esActiva" class="flex flex-wrap items-center gap-3 mb-3">
      <!-- Búsqueda por texto -->
      <div class="relative flex items-center">
        <svg
          v-if="buscando"
          class="animate-spin h-3 w-3 absolute left-2.5 text-blue-400 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        <i v-else class="pi pi-search absolute left-2.5 text-gray-400 text-xs pointer-events-none" aria-hidden="true"></i>
        <input
          type="search"
          :value="filtroTexto"
          @input="emit('buscar', $event.target.value)"
          placeholder="Buscar por título o descripción…"
          class="pl-7 pr-3 py-1 text-xs rounded-lg border border-gray-300 dark:border-slate-600
                 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200
                 focus:outline-none focus:ring-2 focus:ring-blue-400 w-56"
        />
      </div>
      <!-- Filtro por creador -->
      <template v-if="esAdmin && opcionesCreador.length > 1">
        <span class="text-gray-300 dark:text-slate-600 select-none">|</span>
        <span class="text-xs text-gray-500">Creado por:</span>
        <Select
          :model-value="filtroCreador"
          :options="opcionesCreador"
          option-label="label"
          option-value="value"
          placeholder="Todos"
          size="small"
          @update:model-value="emit('filtrar-creador', $event ?? null)"
        />
        <button
          v-if="filtroCreador"
          @click="emit('filtrar-creador', null)"
          class="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-gray-300 dark:border-slate-500
                 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >
          <i class="pi pi-times text-[10px]" aria-hidden="true"></i>
          Todos
        </button>
      </template>

      <!-- Filtro de mes activo -->
      <template v-if="filtroAnio && filtroMes">
        <span class="text-gray-300 dark:text-slate-600 select-none">|</span>
        <span class="text-xs text-gray-500 dark:text-slate-400">
          Mes: <strong class="text-gray-700 dark:text-slate-200">{{ MESES[filtroMes - 1] }} {{ filtroAnio }}</strong>
        </span>
        <button
          @click="emit('filtrar-mes', null)"
          class="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-gray-300 dark:border-slate-500
                 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >
          <i class="pi pi-times text-[10px]" aria-hidden="true"></i>
          Todos
        </button>
      </template>
    </div>

    <!-- Estado de carga -->
    <div v-if="cargando" class="flex justify-center items-center py-12">
      <div class="text-center">
        <div class="inline-block">
          <svg class="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        </div>
        <p class="text-gray-600 mt-4">Cargando encuestas...</p>
      </div>
    </div>

    <!-- Grid simple para encuestas activas -->
    <div v-else-if="esActiva && encuestas.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <EncuestaCard 
        v-for="encuesta in encuestas" 
        :key="encuesta.id"
        :encuesta="encuesta"
        :es-activa="true"
        @seleccionar="emit('seleccionar', $event)"
      />
    </div>

    <!-- Archivo por año/mes para encuestas pasadas -->
    <div
      v-else-if="!esActiva && encuestas.length > 0"
      class="space-y-3 transition-opacity duration-150"
      :class="buscando ? 'opacity-50 pointer-events-none select-none' : ''"
    >
      <div 
        v-for="(meses, anio) in archivoPorAnio" 
        :key="anio"
        class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
      >
        <!-- Cabecera del año -->
        <button 
          @click="toggleAnio(anio)"
          class="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 transition text-left"
        >
          <span class="flex items-center gap-3">
            <svg class="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="text-lg font-semibold text-gray-800">{{ anio }}</span>
            <span class="text-sm text-gray-500 font-normal">
              {{ contarEncuestasAnio(meses) }} encuesta{{ contarEncuestasAnio(meses) !== 1 ? 's' : '' }}
            </span>
          </span>
          <svg 
            class="h-5 w-5 text-gray-500 transition-transform duration-200"
            :class="aniosAbiertos[anio] ? 'rotate-180' : ''"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Meses del año -->
        <div v-show="aniosAbiertos[anio]" class="divide-y divide-gray-100">
          <div
            v-for="(encuestasMes, mes) in meses"
            :key="mes"
            :class="mesesAbiertos[`${anio}-${mes}`] ? 'bg-blue-50/60' : ''"
            class="transition-colors duration-200"
          >
            <!-- Cabecera del mes (colapsable) -->
            <button
              @click="toggleMes(anio, mes)"
              :class="mesesAbiertos[`${anio}-${mes}`]
                ? 'bg-blue-100/70 text-blue-800'
                : 'hover:bg-gray-50'"
              class="w-full flex items-center justify-between px-6 py-3 transition text-left"
            >
              <span class="flex items-center gap-2">
                <span
                  :class="mesesAbiertos[`${anio}-${mes}`] ? 'bg-blue-400' : 'bg-gray-300'"
                  class="inline-block w-2 h-2 rounded-full transition-colors"
                ></span>
                <span
                  :class="mesesAbiertos[`${anio}-${mes}`] ? 'text-blue-800' : 'text-gray-600'"
                  class="text-sm font-semibold"
                >{{ mes }}</span>
                <span class="text-xs text-gray-400 font-normal">· {{ encuestasMes.length }} encuesta{{ encuestasMes.length !== 1 ? 's' : '' }}</span>
              </span>
              <svg
                :class="[
                  'h-4 w-4 transition-transform duration-200',
                  mesesAbiertos[`${anio}-${mes}`] ? 'rotate-180 text-blue-500' : 'text-gray-400'
                ]"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <!-- Filas en línea del mes -->
            <div v-show="mesesAbiertos[`${anio}-${mes}`]">
              <button
                v-for="encuesta in encuestasMes"
                :key="encuesta.id"
                @click="emit('seleccionar', encuesta)"
                class="w-full flex items-center gap-4 px-6 py-2.5 hover:bg-blue-50 transition text-left border-t border-gray-50 group"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0"></span>
                <!-- Título + descripción -->
                <span class="flex-1 min-w-0">
                  <span class="block text-sm text-gray-700 font-medium truncate group-hover:text-blue-700">
                    {{ encuesta.titulo }}
                  </span>
                  <span
                    v-if="encuesta.descripcion"
                    class="block text-xs text-gray-400 truncate"
                    :title="encuesta.descripcion"
                  >
                    {{ encuesta.descripcion }}
                  </span>
                </span>
                <!-- Creador -->
                <span
                  v-if="esAdmin"
                  class="text-xs flex-shrink-0 hidden md:flex items-center gap-0.5"
                  :class="encuesta.creador ? 'text-indigo-500' : 'text-gray-400'"
                >
                  <i class="pi pi-user text-[10px]" aria-hidden="true"></i>
                  <RouterLink
                    v-if="encuesta.creador"
                    :to="{ name: 'PerfilUsuario', params: { id: encuesta.creador.id } }"
                    class="hover:underline"
                    @click.stop
                  >
                    {{ encuesta.creador.nombre }} {{ encuesta.creador.Apellidos }}
                  </RouterLink>
                  <span v-else>Administración</span>
                </span>
                <span class="text-xs text-gray-400 flex-shrink-0 hidden sm:block">
                  {{ encuesta.respuestas || 0 }} resp.
                </span>
                <span class="text-xs text-gray-400 flex-shrink-0">
                  {{ encuesta.fecha_fin ? formatearFecha(encuesta.fecha_fin) : '' }}
                </span>
                <svg class="h-3.5 w-3.5 text-gray-300 group-hover:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sin encuestas -->
    <div v-else class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
      <p class="text-gray-600 mt-4">No hay encuestas {{ esActiva ? 'activas' : 'pasadas' }} en este momento</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import EncuestaCard from './EncuestaCard.vue'
import Select from 'primevue/select'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const props = defineProps({
  encuestas:     { type: Array,   required: true },
  cargando:      { type: Boolean, default: false },
  esActiva:      { type: Boolean, default: true },
  esAdmin:       { type: Boolean, default: false },
  creadores:     { type: Array,   default: () => [] },
  filtroCreador: { default: null },
  filtroAnio:    { default: null },
  filtroMes:     { default: null },
  filtroTexto:   { type: String,  default: '' },
  buscando:      { type: Boolean, default: false }
})

const emit = defineEmits(['seleccionar', 'filtrar-creador', 'filtrar-mes', 'buscar'])

const opcionesCreador = computed(() => {
  const opts = []
  for (const c of props.creadores) {
    if (c === null) {
      opts.push({ label: 'Administración', value: 'admin' })
    } else {
      opts.push({ label: `${c.nombre} ${c.Apellidos}`, value: c.id })
    }
  }
  return opts
})

// Estado de paneles abiertos por año
const aniosAbiertos = ref({})
// Estado de paneles abiertos por mes (clave: "anio-mes")
const mesesAbiertos = ref({})

// Agrupa encuestas pasadas por año (desc) y mes (desc)
const archivoPorAnio = computed(() => {
  const grupos = {}

  for (const encuesta of props.encuestas) {
    const fecha = new Date(encuesta.fecha_fin || encuesta.fecha_cierre || encuesta.created_at)
    if (isNaN(fecha)) continue

    const anio = fecha.getFullYear()
    const mes = fecha.toLocaleDateString('es-ES', { month: 'long' })
      .replace(/^\w/, c => c.toUpperCase())
    const mesOrden = fecha.getMonth() // 0-11 para ordenar desc

    if (!grupos[anio]) grupos[anio] = {}
    if (!grupos[anio][mes]) grupos[anio][mes] = { encuestas: [], orden: mesOrden }
    grupos[anio][mes].encuestas.push(encuesta)
  }

  // Ordenar años descendente, meses descendente dentro de cada año
  const resultado = {}
  const aniosOrdenados = Object.keys(grupos).map(Number).sort((a, b) => b - a)

  for (const anio of aniosOrdenados) {
    const mesesOrdenados = Object.entries(grupos[anio])
      .sort((a, b) => b[1].orden - a[1].orden)
    resultado[anio] = {}
    for (const [mes, { encuestas }] of mesesOrdenados) {
      resultado[anio][mes] = encuestas
    }
  }

  return resultado
})

const contarEncuestasAnio = (meses) => {
  return Object.values(meses).reduce((sum, lista) => sum + lista.length, 0)
}

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const toggleAnio = (anio) => {
  const yaAbierto = aniosAbiertos.value[anio]
  // Cerrar todos los años
  Object.keys(aniosAbiertos.value).forEach(a => { aniosAbiertos.value[a] = false })
  // Abrir el seleccionado solo si estaba cerrado
  if (!yaAbierto) aniosAbiertos.value[anio] = true
}

const toggleMes = (anio, mes) => {
  const key = `${anio}-${mes}`
  mesesAbiertos.value[key] = !mesesAbiertos.value[key]
}

// Abrir el año más reciente y su mes más reciente por defecto al cargar encuestas pasadas
watch(archivoPorAnio, (nuevoArchivo) => {
  const anios = Object.keys(nuevoArchivo).map(Number).sort((a, b) => b - a)
  if (anios.length > 0) {
    const anioReciente = anios[0]
    if (!(anioReciente in aniosAbiertos.value)) {
      aniosAbiertos.value[anioReciente] = true
    }
  }
}, { immediate: true })
</script>
