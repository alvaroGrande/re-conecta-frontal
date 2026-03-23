<template>
  <div class="bg-white rounded-lg shadow-md">
    <!-- Header con título y botón agregar -->
    <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
      <h2 class="text-lg font-bold text-gray-900">Gestión de Usuarios</h2>
      <button
        @click="$emit('nuevo')"
        class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
      >
        + Nuevo Usuario
      </button>
    </div>

    <!-- Barra de búsqueda y filtros -->
    <div class="px-6 py-4 border-b border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
      <input
        v-model="filtro.name"
        type="text"
        placeholder="Buscar por nombre..."
        @input="buscarUsuarios"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        v-model="filtro.email"
        type="email"
        placeholder="Buscar por correo..."
        @input="buscarUsuarios"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        v-model="filtro.role"
        @change="buscarUsuarios"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todos los roles</option>
        <option value="1">Admin</option>
        <option value="2">Instructor</option>
        <option value="3">Usuario</option>
      </select>
      <button
        @click="limpiarFiltros"
        class="col-span-1 md:col-span-3 lg:col-span-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition"
      >
        Limpiar Filtros
      </button>
    </div>

    <!-- DataTable de PrimeVue -->
    <DataTable
      :value="usuarios"
      :loading="cargando"
      striped-rows
      class="p-datatable-sm"
      responsive-layout="scroll"
      paginator
      lazy
      :first="first"
      :rows="filasPorPagina"
      :rows-per-page-options="[5, 10, 20, 50]"
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :current-page-report-template="`Mostrando {first} a {last} de ${totalUsuarios} usuarios`"
      :global-filter-fields="['nombre', 'email', 'rol']"
      :total-records="totalUsuarios"
      @page="handlePaginacion"
    >
      <template #empty>
        <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded">
          <p class="text-red-800">{{ error }}</p>
          <button
            @click="cargarUsuarios"
            class="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Reintentar
          </button>
        </div>
        <div v-else class="p-4 text-center text-gray-600">
          No se encontraron usuarios
        </div>
      </template>

      <Column field="nombre" header="Nombre" style="min-width: 150px" />
      <Column field="email" header="Correo" style="min-width: 200px" />
      <Column field="ultimoInicio" header="Último Inicio" style="min-width: 150px">
        <template #body="{ data }">
          {{ formatearFecha(data.ultimoInicio) }}
        </template>
      </Column>
      <Column field="rol" header="Rol" style="min-width: 120px">
        <template #body="{ data }">
          <span
            :class="[
              'px-3 py-1 text-xs font-semibold rounded-full',
              obtenerColorRol(data.rol)
            ]"
          >
            {{ obtenerNombreRol(data.rol) }}
          </span>
        </template>
      </Column>
      <Column header="Acciones" style="min-width: 220px">
        <template #body="{ data }">
          <div class="flex items-center gap-2">
            <button
              @click="$emit('editar', data.id)"
              class="bg-white border border-blue-400 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg transition text-sm cursor-pointer"
              title="Editar usuario"
            >
              Editar
            </button>
            <button
              v-if="esAdministrador && data.id !== usuarioActual?.id"
              @click="impersonarUsuario(data)"
              class="bg-white border border-purple-400 text-purple-600 hover:bg-purple-50 px-3 py-1 rounded-lg transition text-sm cursor-pointer"
              title="Iniciar sesión como este usuario"
            >
              Login as
            </button>
            <button
              @click="$emit('eliminar', data.id)"
              class="bg-white border border-red-400 text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg transition text-sm cursor-pointer"
              title="Eliminar usuario"
            >
              Eliminar
            </button>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { getUsuarios } from '@services/usuarios'
import { obtenerColorRol, obtenerNombreRol } from '@helpers/rolesHelper'

const route = useRoute()
const router = useRouter()
const usuarios = ref([])
const totalUsuarios = ref(0)
const cargando = ref(false)
const error = ref(null)
const paginaActual = ref(0)
const filasPorPagina = ref(10)
const first = ref(0)
const usuarioActual = ref(null)
let timeoutId = null

const filtro = ref({
  name: '',
  email: '',
  role: ''
})

defineEmits(['nuevo', 'editar', 'eliminar'])

// Verificar si el usuario actual es administrador
const esAdministrador = computed(() => {
  return usuarioActual.value?.rol === 1
})

const usuariosFiltrados = computed(() => {
  return usuarios.value
})

const formatearFecha = (fecha) => {
  if (!fecha) return 'Nunca'
  const date = new Date(fecha)
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const buscarUsuarios = async () => {
  // Limpiar timeout anterior si existe
  if (timeoutId) {
    clearTimeout(timeoutId)
  }

  // Resetear a la primera página al buscar
  paginaActual.value = 0
  // Actualizar URL con los filtros
  actualizarURL()

  // Establecer nuevo timeout con debounce de 300ms
  timeoutId = setTimeout(async () => {
    await cargarUsuariosConFiltros()
  }, 300)
}

const actualizarURL = () => {
  const query = {}
  if (filtro.value.name) query.name = filtro.value.name
  if (filtro.value.email) query.email = filtro.value.email
  if (filtro.value.role) query.role = filtro.value.role
  if (filasPorPagina.value !== 10) query.limit = filasPorPagina.value
  if (paginaActual.value > 0) query.page = paginaActual.value
  
  router.replace({ query })
}

const cargarUsuariosConFiltros = async () => {
  try {
    cargando.value = true
    error.value = null
    
    // Construir objeto de filtros
    const filtros = {}
    if (filtro.value.name) filtros.name = filtro.value.name
    if (filtro.value.email) filtros.email = filtro.value.email
    if (filtro.value.role) filtros.role = filtro.value.role
    
    const opciones = {
      limit: filasPorPagina.value,
      offset: paginaActual.value * filasPorPagina.value
    }
    
    const data = await getUsuarios(filtros, opciones)
    // Si data tiene estructura { data: [...], total: N }
    if (data.data && data.total !== undefined) {
      usuarios.value = data.data
      totalUsuarios.value = data.total
    } else if (Array.isArray(data)) {
      // Si data es un array directamente
      usuarios.value = data
      totalUsuarios.value = data.length
    }
  } catch (err) {
    error.value = 'No se pudo cargar la lista de usuarios'
    console.error(err)
  } finally {
    cargando.value = false
  }
}

const handlePaginacion = async (event) => {
  paginaActual.value = event.page
  first.value = event.first
  filasPorPagina.value = event.rows
  actualizarURL()
  await cargarUsuariosConFiltros()
}

const limpiarFiltros = () => {
  filtro.value.name = ''
  filtro.value.email = ''
  filtro.value.role = ''
  paginaActual.value = 0
  first.value = 0
  router.replace({ query: {} })
  cargarUsuariosConFiltros()
}

const impersonarUsuario = (usuario) => {
  if (!esAdministrador.value) {
    alert('No tienes permisos para realizar esta acción')
    return
  }

  if (confirm(`¿Iniciar sesión como ${usuario.nombre} ${usuario.Apellidos}?`)) {
    try {
      // Guardar el usuario administrador original para poder volver
      const adminOriginal = localStorage.getItem('usuario')
      localStorage.setItem('usuario_original', adminOriginal)
      
      // Reemplazar el usuario actual con el usuario impersonado
      localStorage.setItem('usuario', JSON.stringify(usuario))
      
      // Guardar flag de impersonación
      localStorage.setItem('impersonando', 'true')
      
      // Recargar la página para aplicar los cambios
      window.location.href = '/'
    } catch (error) {
      console.error('Error al impersonar usuario:', error)
      alert('Error al cambiar de usuario')
    }
  }
}

const cargarUsuarioActual = () => {
  try {
    const usuarioJSON = localStorage.getItem('usuario')
    if (usuarioJSON) {
      usuarioActual.value = JSON.parse(usuarioJSON)
    }
  } catch (error) {
    console.error('Error al cargar usuario actual:', error)
  }
}

const cargarDesdeFiltrosURL = () => {
  const query = route.query
  if (query.name) filtro.value.name = query.name
  if (query.email) filtro.value.email = query.email
  if (query.role) filtro.value.role = query.role
  if (query.limit) filasPorPagina.value = Number(query.limit)
  if (query.page) paginaActual.value = Number(query.page)
}

onMounted(() => {
  cargarUsuarioActual()
  cargarDesdeFiltrosURL()
  cargarUsuariosConFiltros()
})
</script>