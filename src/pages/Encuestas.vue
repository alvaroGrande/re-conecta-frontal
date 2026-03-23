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
      <!-- Lista de encuestas -->
      <EncuestasLista 
        :encuestas="encuestasFilteradas"
        :cargando="cargando"
        :es-activa="mostrarActivas"
        @seleccionar="seleccionarEncuesta"
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
        @crear="crearNuevaEncuesta"
        @cancelar="cerrarModalCrear"
      />
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Dialog from 'primevue/dialog'
import EncuestasHeader from '@features/Encuestas/EncuestasHeader.vue'
import EncuestasLista from '@features/Encuestas/EncuestasLista.vue'
import EncuestaFormulario from '@features/Encuestas/EncuestaFormulario.vue'
import EncuestaResultados from '@features/Encuestas/EncuestaResultados.vue'
import AdminEncuestaDetalle from '@features/Encuestas/AdminEncuestaDetalle.vue'
import CrearEncuestaForm from '@features/Encuestas/CrearEncuestaForm.vue'
import { obtenerEncuestas, crearRespuestaEncuesta, obtenerResultadosEncuesta, crearEncuesta } from '@services/encuestas'
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

const esAdmin = computed(() => {
  if (!usuarioActual.value) return false
  // rol 1 es Admin según el rolesHelper
  return usuarioActual.value.rol === 1
})

const encuestasFilteradas = computed(() => {
  return encuestas.value.filter(e => {
    const estaActiva = e.estado === 'activa'
    return mostrarActivas.value ? estaActiva : !estaActiva
  })
})

const cargarEncuestas = async () => {
  cargando.value = true
  try {
    const estado = mostrarActivas.value ? 'activa' : 'cerrada'
    const data = await obtenerEncuestas({ estado })
    encuestas.value = Array.isArray(data) ? data : data.data || []
  } catch (error) {
    showError('Error al cargar encuestas')
  } finally {
    cargando.value = false
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
  // Cambiar la URL preservando el query param de vista
  const query = mostrarActivas.value ? {} : { vista: 'pasadas' }
  router.push({ name: 'Encuestas', params: { id: encuesta.id }, query })
  
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
    router.push({ name: 'Encuestas', query })
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
  // Actualizar la URL; el watch en route.query.vista actualiza estado y datos
  const query = esActiva ? {} : { vista: 'pasadas' }
  router.push({ name: 'Encuestas', query })
}

const manejarEncuestaCerrada = async () => {
  // Recargar la lista de encuestas
  await cargarEncuestas()
  
  // Cerrar el modal
  cerrarModal()
  
  showSuccess('Encuesta cerrada', 'La encuesta ha sido cerrada y movida a "Pasadas"')
}

const abrirModalCrear = () => {
  if (!esAdmin.value) {
    showError('Solo los administradores pueden crear encuestas')
    return
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

watch(mostrarActivas, () => {
  cerrarModal()
})

// Sincronizar estado con cambios en ?vista (navegación directa, botones atrás/adelante)
watch(() => route.query.vista, (vistaQuery) => {
  const deberiaSerActiva = vistaQuery !== 'pasadas'
  // Guard: no-admins no pueden acceder a la vista de pasadas
  if (!deberiaSerActiva && !esAdmin.value) {
    router.replace({ name: 'Encuestas' })
    return
  }
  if (mostrarActivas.value !== deberiaSerActiva) {
    mostrarActivas.value = deberiaSerActiva
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
