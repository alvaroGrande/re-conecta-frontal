<template>
  <!-- Overlay de fondo -->
  <Teleport to="body">
    <Transition name="busqueda-fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
        @click.self="cerrar"
        aria-modal="true"
        role="dialog"
        aria-label="Búsqueda global"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cerrar" />

        <!-- Panel de búsqueda -->
        <div class="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">

          <!-- Input de búsqueda -->
          <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-slate-700">
            <i class="pi pi-search text-gray-400 text-lg flex-shrink-0"></i>
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              placeholder="Buscar talleres, encuestas, usuarios..."
              class="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 text-base outline-none"
              @input="onInput"
              @keydown.escape="cerrar"
              @keydown.arrow-down.prevent="moverSeleccion(1)"
              @keydown.arrow-up.prevent="moverSeleccion(-1)"
              @keydown.enter.prevent="abrirSeleccionado"
            />
            <span class="text-xs text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded flex-shrink-0">ESC</span>
          </div>

          <!-- Resultados -->
          <div class="max-h-[60vh] overflow-y-auto">

            <!-- Cargando -->
            <div v-if="cargando" class="flex justify-center py-10">
              <i class="pi pi-spin pi-spinner text-2xl text-blue-500"></i>
            </div>

            <!-- Sin resultados -->
            <div v-else-if="query.length >= 2 && resultados.total === 0" class="text-center py-10 text-gray-500">
              <i class="pi pi-search text-3xl mb-3 block text-gray-300"></i>
              No se encontraron resultados para "<strong>{{ query }}</strong>"
            </div>

            <!-- Prompt inicial -->
            <div v-else-if="query.length < 2" class="py-8 text-center text-gray-400 text-sm">
              Empieza a escribir para buscar...
            </div>

            <!-- Grupos de resultados -->
            <template v-else>

              <!-- Talleres -->
              <div v-if="resultados.talleres.length" class="px-2 py-2">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-1">Talleres</p>
                <button
                  v-for="(taller, i) in resultados.talleres"
                  :key="`taller-${taller.id}`"
                  :class="[
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                    indiceSeleccionado === calcularIndice('talleres', i)
                      ? 'bg-blue-50 dark:bg-blue-900/30'
                      : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                  ]"
                  @click="navegar('talleres', taller)"
                  @mouseenter="indiceSeleccionado = calcularIndice('talleres', i)"
                >
                  <div class="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <i class="pi pi-calendar text-blue-600 dark:text-blue-400 text-sm"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ taller.titulo }}</p>
                    <p class="text-xs text-gray-500 truncate">{{ formatearFecha(taller.fecha) }} · {{ taller.modalidad }}</p>
                  </div>
                  <span :class="[
                    'text-xs px-2 py-0.5 rounded-full flex-shrink-0',
                    taller.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  ]">
                    {{ taller.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </button>
              </div>

              <!-- Encuestas -->
              <div v-if="resultados.encuestas.length" class="px-2 py-2 border-t border-gray-100 dark:border-slate-700">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-1">Encuestas</p>
                <button
                  v-for="(encuesta, i) in resultados.encuestas"
                  :key="`encuesta-${encuesta.id}`"
                  :class="[
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                    indiceSeleccionado === calcularIndice('encuestas', i)
                      ? 'bg-purple-50 dark:bg-purple-900/30'
                      : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                  ]"
                  @click="navegar('encuestas', encuesta)"
                  @mouseenter="indiceSeleccionado = calcularIndice('encuestas', i)"
                >
                  <div class="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <i class="pi pi-question-circle text-purple-600 dark:text-purple-400 text-sm"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ encuesta.titulo }}</p>
                    <p class="text-xs text-gray-500 truncate">{{ encuesta.descripcion }}</p>
                  </div>
                </button>
              </div>

              <!-- Usuarios -->
              <div v-if="resultados.usuarios.length" class="px-2 py-2 border-t border-gray-100 dark:border-slate-700">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-1">Usuarios</p>
                <button
                  v-for="(usuario, i) in resultados.usuarios"
                  :key="`usuario-${usuario.id}`"
                  :class="[
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                    indiceSeleccionado === calcularIndice('usuarios', i)
                      ? 'bg-green-50 dark:bg-green-900/30'
                      : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                  ]"
                  @click="navegar('usuarios', usuario)"
                  @mouseenter="indiceSeleccionado = calcularIndice('usuarios', i)"
                >
                  <div class="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <i class="pi pi-user text-green-600 dark:text-green-400 text-sm"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {{ usuario.nombre }} {{ usuario.Apellidos }}
                    </p>
                    <p class="text-xs text-gray-500 truncate">{{ usuario.email }}</p>
                  </div>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-gray-300 flex-shrink-0">
                    {{ getRolTexto(usuario.rol) }}
                  </span>
                </button>
              </div>
            </template>
          </div>

          <!-- Footer con atajos -->
          <div v-if="resultados.total > 0" class="flex items-center gap-4 px-4 py-2 border-t border-gray-100 dark:border-slate-700 text-xs text-gray-400">
            <span><kbd class="font-sans">↑↓</kbd> Navegar</span>
            <span><kbd class="font-sans">↵</kbd> Abrir</span>
            <span><kbd class="font-sans">ESC</kbd> Cerrar</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { buscarGlobal } from '@services/busqueda'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible'])

const router = useRouter()
const inputRef = ref(null)
const query = ref('')
const cargando = ref(false)
const indiceSeleccionado = ref(-1)
const debounceTimeout = ref(null)

const resultados = reactive({
  talleres: [],
  encuestas: [],
  usuarios: [],
  total: 0
})

// Índice lineal para navegación por teclado
const todasFilas = computed(() => [
  ...resultados.talleres.map(t => ({ tipo: 'talleres', item: t })),
  ...resultados.encuestas.map(e => ({ tipo: 'encuestas', item: e })),
  ...resultados.usuarios.map(u => ({ tipo: 'usuarios', item: u }))
])

const calcularIndice = (tipo, i) => {
  const offset = {
    talleres: 0,
    encuestas: resultados.talleres.length,
    usuarios: resultados.talleres.length + resultados.encuestas.length
  }
  return offset[tipo] + i
}

// Focus en el input al abrir
watch(() => props.visible, async (val) => {
  if (val) {
    await nextTick()
    inputRef.value?.focus()
  } else {
    resetear()
  }
})

const onInput = () => {
  indiceSeleccionado.value = -1
  clearTimeout(debounceTimeout.value)

  if (query.value.trim().length < 2) {
    resultados.talleres = []
    resultados.encuestas = []
    resultados.usuarios = []
    resultados.total = 0
    return
  }

  debounceTimeout.value = setTimeout(ejecutarBusqueda, 300)
}

const ejecutarBusqueda = async () => {
  cargando.value = true
  try {
    const data = await buscarGlobal(query.value.trim())
    resultados.talleres = data.talleres
    resultados.encuestas = data.encuestas
    resultados.usuarios = data.usuarios
    resultados.total = data.total
  } catch (error) {
    console.error('Error en búsqueda global:', error)
  } finally {
    cargando.value = false
  }
}

const moverSeleccion = (direccion) => {
  const total = todasFilas.value.length
  if (total === 0) return
  indiceSeleccionado.value = (indiceSeleccionado.value + direccion + total) % total
}

const abrirSeleccionado = () => {
  if (indiceSeleccionado.value < 0) return
  const fila = todasFilas.value[indiceSeleccionado.value]
  if (fila) navegar(fila.tipo, fila.item)
}

const navegar = (tipo, item) => {
  cerrar()
  const rutas = {
    talleres: '/talleres',
    encuestas: `/encuestas/${item.id}`,
    usuarios: `/usuario/${item.id}`
  }
  router.push(rutas[tipo])
}

const cerrar = () => {
  emit('update:visible', false)
}

const resetear = () => {
  query.value = ''
  resultados.talleres = []
  resultados.encuestas = []
  resultados.usuarios = []
  resultados.total = 0
  indiceSeleccionado.value = -1
  clearTimeout(debounceTimeout.value)
}

// Atajos de teclado globales
const onKeydown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    emit('update:visible', !props.visible)
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatearFecha = (fecha) => {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

const getRolTexto = (rol) => {
  const roles = { 1: 'Admin', 2: 'Coordinador', 3: 'Usuario' }
  return roles[rol] || 'Usuario'
}
</script>

<style scoped>
.busqueda-fade-enter-active,
.busqueda-fade-leave-active {
  transition: opacity 0.15s ease;
}
.busqueda-fade-enter-from,
.busqueda-fade-leave-to {
  opacity: 0;
}
.busqueda-fade-enter-active .relative,
.busqueda-fade-leave-active .relative {
  transition: transform 0.15s ease;
}
.busqueda-fade-enter-from .relative {
  transform: translateY(-8px);
}
</style>
