<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <!-- Cabecera -->
    <div class="p-6 border-b border-gray-200">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-xl font-bold text-gray-900">{{ tituloSeccion }}</h2>
          <p class="text-sm text-gray-600 mt-1">{{ totalContactos }} {{ subtituloSeccion }}{{ totalContactos !== 1 ? 'es' : '' }}</p>
        </div>
        <Button 
          v-if="!esAdministrador"
          icon="pi pi-plus" 
          :label="esInstructor ? 'Agregar Usuario' : 'Agregar'" 
          @click="mostrarModalAgregar = true"
          size="small"
        />
      </div>
      
      <!-- Filtros de supervisores -->
      <FiltrosSupervisores
        v-if="esAdministrador"
        v-model:busqueda="busqueda"
        v-model:filtro="filtroActivo"
        :conteo-por-filtro="conteoPorFiltro"
        @buscar="debounceSearch"
      />
      
      <!-- Buscador estándar -->
      <div v-else class="relative">
        <InputText 
          v-model="busqueda"
          placeholder="Buscar por nombre, apellido o email..."
          class="w-full"
          @input="debounceSearch"
        />
        <i class="pi pi-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
      </div>
    </div>

    <!-- Lista de contactos -->
    <div v-if="cargando && contactos.length === 0" class="p-8 text-center">
      <i class="pi pi-spin pi-spinner text-3xl text-blue-500"></i>
      <p class="text-gray-600 mt-2">Cargando contactos...</p>
    </div>

    <div v-else-if="contactos.length === 0" class="p-8 text-center">
      <i class="pi pi-users text-5xl text-gray-300 mb-4"></i>
      <p class="text-gray-600 mb-2">{{ mensajeVacio }}</p>
      <p v-if="!esAdministrador" class="text-sm text-gray-500">{{ descripcionVacio }}</p>
    </div>

    <div v-else-if="contactosFiltrados.length === 0" class="p-8 text-center">
      <i class="pi pi-filter text-5xl text-gray-300 mb-4"></i>
      <p class="text-gray-600 mb-2">No hay supervisores con este criterio</p>
      <p class="text-sm text-gray-500">Intenta con otro filtro o búsqueda</p>
    </div>

    <div v-else class="divide-y divide-gray-200 max-h-[600px] overflow-y-auto" ref="scrollContainer">
      <ContactoCard
        v-for="contacto in contactosFiltrados" 
        :key="contacto.id"
        :contacto="contacto"
        :clickable="esAdministrador"
        :classes="supervisorClasses(contacto)"
        :icono-alerta="supervisorIcono(contacto)"
        :mostrar-eliminar="!esAdministrador"
        :mostrar-usuarios-coordinados="esAdministrador"
        @click="abrirDetalleSupervisor"
        @enviar-notificacion="abrirModalNotificacion"
        @enviar-email="enviarMensaje"
        @eliminar="confirmarEliminar"
      />
      
      <!-- Indicador de carga al hacer scroll -->
      <div v-if="cargandoMas" class="py-6 text-center bg-gray-50">
        <div class="flex flex-col items-center justify-center gap-3">
          <i class="pi pi-spin pi-spinner text-4xl text-blue-500"></i>
          <p class="text-sm font-medium text-gray-700">Cargando más resultados...</p>
        </div>
      </div>
      
      <!-- Elemento observador para infinite scroll -->
      <div ref="observerTarget" class="h-1"></div>
    </div>

    <!-- Modal: Agregar contacto -->
    <ModalAgregarContacto
      v-model:visible="mostrarModalAgregar"
      :es-instructor="esInstructor"
      @agregado="handleContactoAgregado"
    />

    <!-- Dialog: Confirmar eliminación -->
    <Dialog 
      v-model:visible="mostrarDialogoEliminar" 
      modal 
      header="Confirmar eliminación"
      :style="{ width: '400px' }"
    >
      <p class="mb-4">¿Estás seguro de que deseas eliminar a <strong>{{ contactoAEliminar?.nombre }} {{ contactoAEliminar?.apellido }}</strong> de tus contactos?</p>
      <div class="flex gap-2 justify-end">
        <Button label="Cancelar" severity="secondary" @click="mostrarDialogoEliminar = false" />
        <Button label="Eliminar" severity="danger" @click="eliminar" :loading="eliminando" />
      </div>
    </Dialog>

    <!-- Modal: Enviar notificación -->
    <EnviarNotificacionModal 
      v-model:visible="mostrarModalNotificacion"
      :receptor-preseleccionado="contactoSeleccionado"
      @enviado="handleNotificacionEnviada"
    />

    <!-- Modal: Detalle del supervisor (solo para administradores) -->
    <DetalleSupervisorModal
      v-if="esAdministrador"
      v-model:visible="mostrarDetalleSupervisor"
      :supervisor="supervisorSeleccionado"
      @actualizado="actualizarContadorSupervisor"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import FiltrosSupervisores from './FiltrosSupervisores.vue'
import ContactoCard from './ContactoCard.vue'
import ModalAgregarContacto from './ModalAgregarContacto.vue'
import EnviarNotificacionModal from '../Notificaciones/EnviarNotificacionModal.vue'
import DetalleSupervisorModal from './DetalleSupervisorModal.vue'
import { obtenerContactos, eliminarContacto, obtenerConteosSupervisores } from '@services/contactos'
import { showSuccess, showError } from '@services/toastService'
import { SUPERVISORES_CONFIG } from '@helpers/constants'

const props = defineProps({
  esInstructor: {
    type: Boolean,
    default: false
  },
  esAdministrador: {
    type: Boolean,
    default: false
  }
})

// Estados de la lista principal
const contactos = ref([])
const cargando = ref(false)
const cargandoMas = ref(false)
const paginaActual = ref(1)
const totalContactos = ref(0)
const hayMas = ref(true)
const busqueda = ref('')
const filtroActivo = ref(null)
const scrollContainer = ref(null)
const observerTarget = ref(null)
const conteosSupervisores = ref({ sinUsuarios: 0, sobrecargados: 0 })

// Estados del modal agregar
const mostrarModalAgregar = ref(false)

// Estados de eliminación
const mostrarDialogoEliminar = ref(false)
const contactoAEliminar = ref(null)
const eliminando = ref(false)

// Estados de modales
const mostrarModalNotificacion = ref(false)
const mostrarDetalleSupervisor = ref(false)
const supervisorSeleccionado = ref(null)
const contactoSeleccionado = ref(null)

let timeoutBusqueda = null
let observer = null
const LIMIT_PER_PAGE = 10

// Textos dinámicos según el rol
const tituloSeccion = computed(() => {
  if (props.esAdministrador) return 'Supervisores / Instructores'
  if (props.esInstructor) return 'Usuarios que Coordino'
  return 'Mis Contactos'
})

const subtituloSeccion = computed(() => {
  if (props.esAdministrador) return 'instructor'
  if (props.esInstructor) return 'usuario'
  return 'contacto'
})

const mensajeVacio = computed(() => {
  if (busqueda.value) return 'No se encontraron resultados'
  if (props.esAdministrador) return 'No hay instructores registrados'
  if (props.esInstructor) return 'Aún no coordinas ningún usuario'
  return 'Aún no tienes contactos'
})

const descripcionVacio = computed(() => {
  if (busqueda.value) return 'Intenta con otros términos de búsqueda'
  if (props.esInstructor) return 'Agrega usuarios a tu coordinación'
  return 'Agrega personas para mantener el contacto fácilmente'
})

// Conteo de supervisores por filtro (desde la API)
const conteoPorFiltro = computed(() => {
  if (!props.esAdministrador) return { sinUsuarios: 0, sobrecargados: 0 }
  return conteosSupervisores.value
})

// Contactos filtrados según el filtro activo
const contactosFiltrados = computed(() => {
  if (!props.esAdministrador || !filtroActivo.value) {
    return contactos.value
  }
  
  if (filtroActivo.value === 'sinUsuarios') {
    return contactos.value.filter(c => (c.usuarios_coordinados || 0) === 0)
  }
  
  if (filtroActivo.value === 'sobrecargados') {
    return contactos.value.filter(c => (c.usuarios_coordinados || 0) > SUPERVISORES_CONFIG.MAX_USUARIOS_POR_SUPERVISOR)
  }
  
  return contactos.value
})

// Cargar contactos con paginación
const cargarContactos = async (reiniciar = true) => {
  if (reiniciar) {
    cargando.value = true
    paginaActual.value = 1
    contactos.value = []
  } else {
    if (!hayMas.value || cargandoMas.value) return
    cargandoMas.value = true
  }

  try {
    console.log('🔍 Cargando contactos...', { page: paginaActual.value, search: busqueda.value })
    const resultado = await obtenerContactos(paginaActual.value, LIMIT_PER_PAGE, busqueda.value)
    
    console.log('📥 Resultado:', resultado)
    
    if (reiniciar) {
      contactos.value = resultado.data
    } else {
      contactos.value = [...contactos.value, ...resultado.data]
    }
    
    totalContactos.value = resultado.total
    hayMas.value = resultado.hasMore
    
    console.log('✅ Contactos cargados:', contactos.value.length, 'Total:', totalContactos.value, 'HayMás:', hayMas.value)
    
    // Si es administrador, cargar también los conteos
    if (props.esAdministrador && reiniciar) {
      await cargarConteosSupervisores()
    }
  } catch (error) {
    console.error('❌ Error al cargar contactos:', error)
    showError('Error al cargar contactos')
  } finally {
    cargando.value = false
    cargandoMas.value = false
  }
}

// Cargar conteos de supervisores desde la API
const cargarConteosSupervisores = async () => {
  if (!props.esAdministrador) return
  
  try {
    const conteos = await obtenerConteosSupervisores()
    conteosSupervisores.value = conteos
  } catch (error) {
    console.error('❌ Error al cargar conteos de supervisores:', error)
    // No mostrar error al usuario, es una funcionalidad secundaria
  }
}

// Búsqueda con debounce
const debounceSearch = () => {
  clearTimeout(timeoutBusqueda)
  timeoutBusqueda = setTimeout(() => {
    cargarContactos(true)
  }, 500)
}

// Configurar Intersection Observer para infinite scroll
const setupInfiniteScroll = async () => {
  await nextTick()
  
  if (!observerTarget.value) return

  observer = new IntersectionObserver(
    (entries) => {
      const target = entries[0]
      if (target.isIntersecting && hayMas.value && !cargandoMas.value && !cargando.value) {
        console.log('🔄 Cargando más contactos...')
        paginaActual.value++
        cargarContactos(false)
      }
    },
    {
      root: scrollContainer.value,
      threshold: 0.1
    }
  )

  observer.observe(observerTarget.value)
}

const handleContactoAgregado = async () => {
  await cargarContactos(true)
}

const confirmarEliminar = (contacto) => {
  contactoAEliminar.value = contacto
  mostrarDialogoEliminar.value = true
}

const eliminar = async () => {
  eliminando.value = true
  try {
    await eliminarContacto(contactoAEliminar.value.id)
    const mensaje = props.esInstructor 
      ? 'Usuario eliminado de tu coordinación' 
      : 'Contacto eliminado'
    showSuccess(mensaje)
    await cargarContactos(true)
    mostrarDialogoEliminar.value = false
    contactoAEliminar.value = null
  } catch (error) {
    showError('Error al eliminar')
  } finally {
    eliminando.value = false
  }
}

const enviarMensaje = (contacto) => {
  window.location.href = `mailto:${contacto.email}`
}

const abrirModalNotificacion = (contacto) => {
  contactoSeleccionado.value = contacto
  mostrarModalNotificacion.value = true
}

const abrirDetalleSupervisor = (supervisor) => {
  supervisorSeleccionado.value = supervisor
  mostrarDetalleSupervisor.value = true
}

const actualizarContadorSupervisor = async (supervisorId, nuevoConteo) => {
  // Actualizar solo el contador sin recargar toda la lista
  const supervisor = contactos.value.find(c => c.id === supervisorId)
  if (supervisor) {
    supervisor.usuarios_coordinados = nuevoConteo
  }
  
  // Recargar los conteos globales
  await cargarConteosSupervisores()
}

const handleNotificacionEnviada = () => {
  // El modal ya muestra el toast
}

const supervisorClasses = (contacto) => {
  if (!props.esAdministrador) return ''
  
  const usuariosCoordinados = contacto.usuarios_coordinados || 0
  
  // Sin usuarios asignados
  if (usuariosCoordinados === 0) {
    return 'border-l-4 border-b-0 border-yellow-300'
  }
  
  // Sobrecargado (más del límite)
  if (usuariosCoordinados > SUPERVISORES_CONFIG.MAX_USUARIOS_POR_SUPERVISOR) {
    return 'border-l-4 border-b-0 border-orange-400'
  }
  
  return ''
}

const supervisorIcono = (contacto) => {
  if (!props.esAdministrador) return null
  
  const usuariosCoordinados = contacto.usuarios_coordinados || 0
  
  if (usuariosCoordinados === 0) {
    return { icono: 'pi-exclamation-triangle', color: 'text-yellow-600', tooltip: 'Sin usuarios asignados' }
  }
  
  if (usuariosCoordinados > SUPERVISORES_CONFIG.MAX_USUARIOS_POR_SUPERVISOR) {
    return { icono: 'pi-exclamation-circle', color: 'text-orange-600', tooltip: `Sobrecargado (más de ${SUPERVISORES_CONFIG.MAX_USUARIOS_POR_SUPERVISOR} usuarios)` }
  }
  
  return null
}

onMounted(async () => {
  await cargarContactos(true)
  setupInfiniteScroll()
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
  clearTimeout(timeoutBusqueda)
})
</script>

<style scoped>
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
