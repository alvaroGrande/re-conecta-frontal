<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
    <!-- Encabezado -->
    <EncuestasHeader
      :mostrar-activas="mostrarActivas"
      :es-admin="esAdmin"
      @cambiar-filtro="cambiarFiltro"
      @crear="abrirModalCrear"
    />

    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Resumen por mes (solo encuestas cerradas) -->
      <ResumenEncuestas
        v-if="!mostrarActivas"
        :encuestas="encuestas.filter(e => e.estado !== 'activa')"
        :filtro-anio="filtroResumenAnio"
        :filtro-mes="filtroResumenMes"
        @filtrar="onFiltrarResumen"
      />

      <!-- Lista de encuestas -->
      <EncuestasLista
        :encuestas="encuestasFilteradas"
        :cargando="cargando"
        :es-activa="mostrarActivas"
        :es-admin="esAdmin"
        :creadores="creadoresUnicos"
        :filtro-creador="filtroCreador"
        :filtro-anio="filtroResumenAnio"
        :filtro-mes="filtroResumenMes"
        :filtro-texto="filtroTexto"
        :buscando="buscando"
        @seleccionar="seleccionarEncuesta"
        @filtrar-creador="onFiltrarCreador"
        @filtrar-mes="onFiltrarResumen"
        @buscar="t => { filtroTexto = t; onBuscar() }"
      />
    </div>

    <!-- Modal de encuesta -->
    <Dialog 
      v-model:visible="mostrarModal" 
      modal 
      :header="encuestaSeleccionada?.titulo"
      :style="{ width: '100%', maxWidth: '1200px' }"
      @hide="cerrarModal"
    >
      <template v-if="encuestaSeleccionada">
        <!-- Vista admin (activas y cerradas): resultados + tabla de usuarios clicable -->
        <AdminEncuestaDetalle
          v-if="esAdmin"
          :encuesta="encuestaSeleccionada"
          @encuesta-cerrada="manejarEncuestaCerrada"
          @cerrar="cerrarModal"
        />

        <!-- Hacer encuesta (activa y no respondida, usuario normal) -->
        <EncuestaFormulario 
          v-else-if="mostrarActivas && !yaRespondida"
          :encuesta="encuestaSeleccionada"
          :cargando="enviando"
          @enviar="enviarRespuestas"
          @cancelar="cerrarModal"
        />

        <!-- Ver resultados (pasada o ya respondida, usuario normal) -->
        <EncuestaResultados 
          v-else
          :encuesta="encuestaSeleccionada"
          :resultados="resultados"
          :ya-respondida="yaRespondida"
          @cerrar="cerrarModal"
        />
      </template>
    </Dialog>

    <!-- Modal crear encuesta -->
    <Dialog 
      v-model:visible="mostrarModalCrear" 
      modal 
      header="Crear nueva encuesta"
      :style="{ width: '100%', maxWidth: '900px' }"
      @hide="cerrarModalCrear"
    >
      <CrearEncuestaForm 
        :cargando="cargandoCrear"
        :es-coordinador="usuarioActual?.rol === 2"
        :usuarios-coordinados="usuariosCoordinados"
        @crear="crearNuevaEncuesta"
        @cancelar="cerrarModalCrear"
      />
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { debounce } from 'lodash-es'
import Dialog from 'primevue/dialog'
import EncuestasHeader from '@features/Encuestas/EncuestasHeader.vue'
import EncuestasLista from '@features/Encuestas/EncuestasLista.vue'
import EncuestaFormulario from '@features/Encuestas/EncuestaFormulario.vue'
import EncuestaResultados from '@features/Encuestas/EncuestaResultados.vue'
import AdminEncuestaDetalle from '@features/Encuestas/AdminEncuestaDetalle.vue'
import CrearEncuestaForm from '@features/Encuestas/CrearEncuestaForm.vue'
import ResumenEncuestas from '@features/Encuestas/ResumenEncuestas.vue'
import { obtenerEncuestas, crearRespuestaEncuesta, obtenerResultadosEncuesta, crearEncuesta } from '@services/encuestas'
import { getUsuarios } from '@services/usuarios'
import { showSuccess, showError } from '@services/toastService'

const router = useRouter()
const route = useRoute()

const encuestas = ref([])
// Inicializar desde la URL: ?vista=pasadas activa el modo pasadas
const mostrarActivas = ref(route.query.vista !== 'pasadas')
const cargando = ref(false)
const mostrarModal = ref(false)
const mostrarModalCrear = ref(false)
const encuestaSeleccionada = ref(null)
const resultados = ref(null)
const yaRespondida = ref(false)
const enviando = ref(false)
const cargandoCrear = ref(false)
const usuarioActual = ref(null)
const usuariosCoordinados = ref([])
const filtroCreador = ref(route.query.creador || null)
const filtroTexto   = ref(route.query.q || '')
const buscando      = ref(false)
let abortCtrl = null

// Filtro de resumen por mes (solo vista cerrada)
const filtroResumenAnio = ref(route.query.anio ? Number(route.query.anio) : null)
const filtroResumenMes  = ref(route.query.mes  ? Number(route.query.mes)  : null)

function onFiltrarResumen(periodo) {
  if (!periodo) {
    filtroResumenAnio.value = null
    filtroResumenMes.value  = null
  } else {
    filtroResumenAnio.value = periodo.anio
    filtroResumenMes.value  = periodo.mes
  }
  // Reflejar en la URL
  const query = {}
  if (!mostrarActivas.value)          query.vista = 'pasadas'
  if (filtroResumenAnio.value)        query.anio  = filtroResumenAnio.value
  if (filtroResumenMes.value)         query.mes   = filtroResumenMes.value
  router.replace({ name: 'Encuestas', query })
}

const onFiltrarCreador = (valor) => {
  filtroCreador.value = valor
  sincFiltrosURL()
}

const sincFiltrosURL = () => {
  const query = {}
  if (!mostrarActivas.value)   query.vista    = 'pasadas'
  if (filtroResumenAnio.value) query.anio     = filtroResumenAnio.value
  if (filtroResumenMes.value)  query.mes      = filtroResumenMes.value
  if (filtroCreador.value)     query.creador  = filtroCreador.value
  if (filtroTexto.value.trim()) query.q       = filtroTexto.value.trim()
  router.replace({ name: 'Encuestas', query })
}

const onBuscar = debounce(() => {
  sincFiltrosURL()
  cargarEncuestas({ silencioso: true })
}, 350)

const creadoresUnicos = computed(() => {
  const vistos = new Set()
  const lista = []
  for (const e of encuestas.value) {
    if (!e.creador) {
      if (!vistos.has('admin')) { vistos.add('admin'); lista.push(null) }
    } else {
      if (!vistos.has(e.creador.id)) { vistos.add(e.creador.id); lista.push(e.creador) }
    }
  }
  return lista
})

const esAdmin = computed(() => {
  if (!usuarioActual.value) return false
  // rol 1 = Administrador, rol 2 = Coordinador (puede gestionar encuestas)
  return usuarioActual.value.rol === 1 || usuarioActual.value.rol === 2
})

const encuestasFilteradas = computed(() => {
  let lista = encuestas.value.filter(e => {
    const estaActiva = e.estado === 'activa'
    return mostrarActivas.value ? estaActiva : !estaActiva
  })
  // Aplicar filtro de mes solo en vista cerrada
  if (!mostrarActivas.value && filtroResumenAnio.value && filtroResumenMes.value) {
    lista = lista.filter(e => {
      const fecha = new Date(e.fecha_fin)
      return fecha.getFullYear() === filtroResumenAnio.value &&
             fecha.getMonth() + 1 === filtroResumenMes.value
    })
  }
  // Aplicar filtro de creador solo en vista cerrada
  if (!mostrarActivas.value && filtroCreador.value !== null) {
    if (filtroCreador.value === 'admin') {
      lista = lista.filter(e => !e.creador)
    } else {
      lista = lista.filter(e => e.creador?.id === filtroCreador.value)
    }
  }
  return lista
})

const cargarEncuestas = async ({ silencioso = false } = {}) => {
  if (abortCtrl) abortCtrl.abort()
  abortCtrl = new AbortController()

  if (silencioso) {
    buscando.value = true
  } else {
    cargando.value = true
  }
  try {
    const estado = mostrarActivas.value ? 'activa' : 'cerrada'
    const filtros = { estado }
    if (filtroTexto.value.trim()) filtros.q = filtroTexto.value.trim()
    const data = await obtenerEncuestas(filtros, abortCtrl.signal)
    encuestas.value = Array.isArray(data) ? data : data.data || []
  } catch (error) {
    if (error.code === 'ERR_CANCELED' || error.name === 'CanceledError') return
    showError('Error al cargar encuestas')
  } finally {
    cargando.value = false
    buscando.value = false
  }
}

const cargarResultados = async (encuesta) => {
  encuestaSeleccionada.value = encuesta
  resultados.value = null
  yaRespondida.value = false
  
  try {
    const resultadosData = await obtenerResultadosEncuesta(encuesta.id)
    resultados.value = resultadosData.resultados || {}
    yaRespondida.value = resultadosData.yaRespondida || false
  } catch (error) {
    console.error('Error al obtener resultados:', error)
  }
}

const seleccionarEncuesta = async (encuesta) => {
  // replace: abrir modal no es una navegación que deba estar en el historial
  const query = mostrarActivas.value ? {} : { vista: 'pasadas' }
  router.replace({ name: 'Encuestas', params: { id: encuesta.id }, query })
  
  await cargarResultados(encuesta)
  mostrarModal.value = true
}

const enviarRespuestas = async (respuestas) => {
  enviando.value = true
  try {
    await crearRespuestaEncuesta(encuestaSeleccionada.value.id, respuestas)
    showSuccess('Gracias por tu respuesta')
    
    const resultadosData = await obtenerResultadosEncuesta(encuestaSeleccionada.value.id)
    resultados.value = resultadosData.resultados || {}
    yaRespondida.value = true
  } catch (error) {
    showError('Error al enviar las respuestas')
  } finally {
    enviando.value = false
  }
}

const cerrarModal = () => {
  mostrarModal.value = false
  encuestaSeleccionada.value = null
  
  // Volver a la URL base de encuestas preservando el query param de vista
  if (route.params.id) {
    const query = mostrarActivas.value ? {} : { vista: 'pasadas' }
    router.replace({ name: 'Encuestas', query })
  }
}

const cerrarModalCrear = () => {
  mostrarModalCrear.value = false
}

const crearNuevaEncuesta = async (datoEncuesta) => {
  cargandoCrear.value = true
  try {
    const resultado = await crearEncuesta(datoEncuesta)
    showSuccess('Encuesta creada exitosamente')
    
    // Recargar encuestas
    await cargarEncuestas()
    cerrarModalCrear()
  } catch (error) {
    showError('Error al crear la encuesta')
  } finally {
    cargandoCrear.value = false
  }
}

const cambiarFiltro = (esActiva) => {
  // replace en lugar de push: cambiar filtro no debe acumular historial
  const query = esActiva ? {} : { vista: 'pasadas' }
  router.replace({ name: 'Encuestas', query })
}

const manejarEncuestaCerrada = async () => {
  // Recargar la lista de encuestas
  await cargarEncuestas()
  
  // Cerrar el modal
  cerrarModal()
  
  showSuccess('Encuesta cerrada', 'La encuesta ha sido cerrada y movida a "Pasadas"')
}

const abrirModalCrear = async () => {
  if (!esAdmin.value) {
    showError('Solo los administradores pueden crear encuestas')
    return
  }
  // Coordinadores: cargar sus usuarios antes de abrir el modal
  if (usuarioActual.value?.rol === 2) {
    try {
      const { data } = await getUsuarios()
      usuariosCoordinados.value = data || []
    } catch {
      usuariosCoordinados.value = []
    }
  }
  mostrarModalCrear.value = true
}

const cargarUsuario = () => {
  try {
    const usuarioJSON = localStorage.getItem('usuario')
    if (usuarioJSON) {
      usuarioActual.value = JSON.parse(usuarioJSON)
    }
  } catch (error) {
    console.error('Error al cargar usuario:', error)
  }
}

const cargarEncuestaDesdeURL = async () => {
  const encuestaId = route.params.id
  if (encuestaId && encuestas.value.length > 0) {
    const encuesta = encuestas.value.find(e => e.id === parseInt(encuestaId))
    if (encuesta) {
      await cargarResultados(encuesta)
      mostrarModal.value = true
    } else {
      // Si no se encuentra la encuesta en la lista actual, intentar cargar todas
      await cargarEncuestas()
      const encuestaEncontrada = encuestas.value.find(e => e.id === parseInt(encuestaId))
      if (encuestaEncontrada) {
        await cargarResultados(encuestaEncontrada)
        mostrarModal.value = true
      } else {
        showError('Encuesta no encontrada')
        router.push({ name: 'Encuestas' })
      }
    }
  }
}

// Limpiar filtro de mes al cambiar a vista activas
watch(() => route.query.vista, (vistaQuery) => {
  const deberiaSerActiva = vistaQuery !== 'pasadas'
  // Guard: no-admins no pueden acceder a la vista de pasadas
  if (!deberiaSerActiva && !esAdmin.value) {
    router.replace({ name: 'Encuestas' })
    return
  }
  if (mostrarActivas.value !== deberiaSerActiva) {
    mostrarActivas.value = deberiaSerActiva
    // Limpiar filtros al cambiar de vista
    filtroResumenAnio.value = null
    filtroResumenMes.value  = null
    filtroCreador.value     = null
    filtroTexto.value       = ''
    cargarEncuestas()
  }
})

// Watch para detectar cambios en la URL
watch(() => route.params.id, (newId) => {
  if (newId) {
    cargarEncuestaDesdeURL()
  } else if (mostrarModal.value) {
    cerrarModal()
  }
}, { immediate: false })

onMounted(async () => {
  cargarUsuario()

  // Guard: si un no-admin accede directamente con ?vista=pasadas, redirigir a activas
  if (route.query.vista === 'pasadas' && !esAdmin.value) {
    mostrarActivas.value = true
    await router.replace({ name: 'Encuestas' })
  }

  await cargarEncuestas()
  
  // Cargar encuesta si viene en la URL
  if (route.params.id) {
    await cargarEncuestaDesdeURL()
  }
})
</script>
