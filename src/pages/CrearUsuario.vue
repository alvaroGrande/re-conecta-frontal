<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <!-- Cabecera -->
      <div class="mb-6">
        <button
          type="button"
          @click="cancelar"
          class="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition mb-4"
        >
          <ChevronLeftIcon class="w-5 h-5" />
          <span>Volver</span>
        </button>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-slate-100">Nuevo Usuario</h1>
        <p class="text-gray-600 dark:text-slate-400 mt-2">
          {{ esCoordinador
            ? 'El usuario se creará con rol Usuario y quedará asociado automáticamente a ti como coordinador.'
            : 'Completa los datos para crear una nueva cuenta.' }}
        </p>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <form @submit.prevent="guardar" class="space-y-5" novalidate>
          <!-- Nombre y apellidos -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Nombre *
              </label>
              <input
                v-model.trim="formulario.nombre"
                type="text"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                :class="errores.nombre ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'"
                placeholder="Juan"
              />
              <p v-if="errores.nombre" class="text-xs text-red-600 mt-1">{{ errores.nombre }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Apellido 1 *
              </label>
              <input
                v-model.trim="formulario.apellido1"
                type="text"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                :class="errores.apellido1 ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'"
                placeholder="Pérez"
              />
              <p v-if="errores.apellido1" class="text-xs text-red-600 mt-1">{{ errores.apellido1 }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Apellido 2
              </label>
              <input
                v-model.trim="formulario.apellido2"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="García"
              />
            </div>
          </div>

          <!-- Email y teléfono -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Email *
              </label>
              <input
                v-model.trim="formulario.email"
                type="email"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                :class="errores.email ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'"
                placeholder="usuario@ejemplo.com"
              />
              <p v-if="errores.email" class="text-xs text-red-600 mt-1">{{ errores.email }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Teléfono
              </label>
              <input
                v-model.trim="formulario.telefono"
                type="tel"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                :class="errores.telefono ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'"
                placeholder="+34 600 000 000"
              />
              <p v-if="errores.telefono" class="text-xs text-red-600 mt-1">{{ errores.telefono }}</p>
            </div>
          </div>

          <!-- DNI y fecha de nacimiento -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                DNI / NIE
              </label>
              <input
                v-model.trim="formulario.DNI"
                type="text"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                :class="errores.DNI ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'"
                placeholder="12345678A"
              />
              <p v-if="errores.DNI" class="text-xs text-red-600 mt-1">{{ errores.DNI }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Fecha de Nacimiento
              </label>
              <DatePicker
                v-model="formulario.fecha_nacimiento"
                date-format="dd/mm/yy"
                placeholder="Seleccionar fecha"
                class="w-full"
                :class="errores.fecha_nacimiento ? 'p-invalid' : ''"
                :max-date="hoy"
              />
              <p v-if="errores.fecha_nacimiento" class="text-xs text-red-600 mt-1">{{ errores.fecha_nacimiento }}</p>
            </div>
          </div>

          <!-- Género -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Género
              </label>
              <select
                v-model="formulario.genero"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sin especificar</option>
                <option value="hombre">Hombre</option>
                <option value="mujer">Mujer</option>
                <option value="otro">Otro</option>
                <option value="prefiero_no_decirlo">Prefiero no decirlo</option>
              </select>
            </div>

            <!-- Rol: solo Admin puede elegirlo -->
            <div v-if="!esCoordinador">
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Rol *
              </label>
              <select
                v-model="formulario.rol"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                :class="errores.rol ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'"
              >
                <option value="">Seleccionar rol</option>
                <option value="1">Administrador</option>
                <option value="2">Coordinador</option>
                <option value="3">Usuario</option>
              </select>
              <p v-if="errores.rol" class="text-xs text-red-600 mt-1">{{ errores.rol }}</p>
            </div>

            <!-- Coordinador: fijo, informativo, si el que crea es Coordinador -->
            <div v-else>
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Rol
              </label>
              <input
                type="text"
                value="Usuario"
                disabled
                class="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          <!-- Coordinador asociado: solo Admin, y solo si el rol elegido es Usuario -->
          <div v-if="!esCoordinador && formulario.rol === '3'">
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Coordinador asociado *
            </label>
            <select
              v-model="formulario.coordinador_id"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
              :class="errores.coordinador_id ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'"
              :disabled="cargandoCoordinadores"
            >
              <option value="">{{ cargandoCoordinadores ? 'Cargando coordinadores…' : 'Seleccionar coordinador' }}</option>
              <option v-for="coordinador in coordinadores" :key="coordinador.id" :value="coordinador.id">
                {{ coordinador.nombre }} {{ coordinador.Apellidos }}
              </option>
            </select>
            <p v-if="errores.coordinador_id" class="text-xs text-red-600 mt-1">{{ errores.coordinador_id }}</p>
            <p v-if="!cargandoCoordinadores && coordinadores.length === 0" class="text-xs text-amber-600 mt-1">
              No hay coordinadores disponibles. Crea primero un usuario con rol Coordinador.
            </p>
          </div>

          <!-- Botones -->
          <div class="flex gap-3 pt-4">
            <Button
              type="submit"
              icon="pi pi-user-plus"
              label="Crear Usuario"
              :loading="guardando"
              class="flex-1"
            />
            <Button
              type="button"
              icon="pi pi-times"
              label="Cancelar"
              severity="secondary"
              :disabled="guardando"
              @click="cancelar"
            />
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import { crearUsuario } from '@services/usuarios'
import { obtenerInstructoresDisponibles } from '@services/contactos'
import { showSuccess, showError } from '@services/toastService'
import { validarEmail, validarDNI, validarTelefono, validarFechaNacimiento } from '@helpers/validaciones'

const router = useRouter()
const hoy = new Date()

const usuarioActual = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('usuario') || '{}')
  } catch {
    return {}
  }
})

const esCoordinador = computed(() => usuarioActual.value?.rol === 2)

const formulario = ref({
  nombre: '',
  apellido1: '',
  apellido2: '',
  email: '',
  telefono: '',
  DNI: '',
  genero: '',
  fecha_nacimiento: '',
  rol: '',
  coordinador_id: ''
})

const errores = ref({})
const guardando = ref(false)
const coordinadores = ref([])
const cargandoCoordinadores = ref(false)

const cargarCoordinadores = async () => {
  cargandoCoordinadores.value = true
  try {
    coordinadores.value = await obtenerInstructoresDisponibles()
  } catch (error) {
    console.error('Error al cargar coordinadores:', error)
    showError('No se pudieron cargar los coordinadores disponibles')
  } finally {
    cargandoCoordinadores.value = false
  }
}

const validar = () => {
  const nuevosErrores = {}

  if (!formulario.value.nombre) nuevosErrores.nombre = 'El nombre es obligatorio'
  if (!formulario.value.apellido1) nuevosErrores.apellido1 = 'El primer apellido es obligatorio'

  if (!formulario.value.email) {
    nuevosErrores.email = 'El email es obligatorio'
  } else if (!validarEmail(formulario.value.email)) {
    nuevosErrores.email = 'El email no es válido'
  }

  if (formulario.value.telefono && !validarTelefono(formulario.value.telefono)) {
    nuevosErrores.telefono = 'El teléfono no es válido'
  }

  if (formulario.value.DNI && !validarDNI(formulario.value.DNI)) {
    nuevosErrores.DNI = 'El DNI/NIE no es válido'
  }

  if (formulario.value.fecha_nacimiento && !validarFechaNacimiento(formulario.value.fecha_nacimiento)) {
    nuevosErrores.fecha_nacimiento = 'La fecha de nacimiento no es válida'
  }

  if (!esCoordinador.value) {
    if (!formulario.value.rol) {
      nuevosErrores.rol = 'El rol es obligatorio'
    } else if (formulario.value.rol === '3' && !formulario.value.coordinador_id) {
      nuevosErrores.coordinador_id = 'Debes seleccionar el coordinador asociado'
    }
  }

  errores.value = nuevosErrores
  return Object.keys(nuevosErrores).length === 0
}

const guardar = async () => {
  if (!validar()) return

  guardando.value = true
  try {
    const payload = {
      nombre: formulario.value.nombre,
      apellido1: formulario.value.apellido1,
      apellido2: formulario.value.apellido2,
      email: formulario.value.email,
      telefono: formulario.value.telefono || null,
      DNI: formulario.value.DNI || null,
      genero: formulario.value.genero || null,
      fecha_nacimiento: formulario.value.fecha_nacimiento
        ? new Date(formulario.value.fecha_nacimiento).toISOString().split('T')[0]
        : null
    }

    if (!esCoordinador.value) {
      payload.rol = parseInt(formulario.value.rol, 10)
      if (payload.rol === 3) {
        payload.coordinador_id = formulario.value.coordinador_id
      }
    }

    await crearUsuario(payload)
    showSuccess('Usuario creado correctamente')
    router.push({ name: 'Usuarios' })
  } catch (error) {
    const mensaje = error.response?.data?.message || 'Error al crear el usuario'
    showError(mensaje)
    console.error(error)
  } finally {
    guardando.value = false
  }
}

const cancelar = () => {
  router.push({ name: 'Usuarios' })
}

onMounted(() => {
  if (!esCoordinador.value) {
    cargarCoordinadores()
  }
})
</script>
