<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
    <!-- Cabecera -->
    <!-- <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 py-6">
        <h1 class="text-3xl font-bold text-gray-900">{{ tituloPagina }}</h1>
        <p class="text-gray-600 mt-2">{{ descripcionPagina }}</p>
      </div>
    </div> -->

    <!-- Contenido principal -->
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Si es ADMINISTRADOR, mostrar solo lista de instructores -->
      <div v-if="esAdministrador">
        <ListaContactos :es-administrador="true" />
      </div>
      
      <!-- Si es INSTRUCTOR, mostrar solo usuarios coordinados -->
      <div v-else-if="esInstructor">
        <ListaContactos :es-instructor="true" />
      </div>

      <!-- Si es USUARIO NORMAL, mostrar layout con instructor + contactos -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Instructor Principal (columna izquierda) -->
        <div class="lg:col-span-1">
          <InstructorPrincipal 
            :instructor="instructorPrincipal"
            :cargando="cargandoInstructor"
          />
        </div>

        <!-- Lista de Contactos (columna derecha) -->
        <div class="lg:col-span-2">
          <ListaContactos :es-instructor="false" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import InstructorPrincipal from '@features/Contactos/InstructorPrincipal.vue'
import ListaContactos from '@features/Contactos/ListaContactos.vue'
import { obtenerInstructorPrincipal } from '@services/contactos'

const instructorPrincipal = ref(null)
const cargandoInstructor = ref(false)

// Verificar rol del usuario
const user = computed(() => {
  return JSON.parse(localStorage.getItem('usuario') || '{}')
})

const esInstructor = computed(() => {
  console.log('Usuario actual:', user.value)
  return user.value.rol === 2
})

const esAdministrador = computed(() => {
  return user.value.rol === 1
})

// Textos dinámicos
const tituloPagina = computed(() => {
  if (esAdministrador.value) return 'Supervisión'
  if (esInstructor.value) return 'Coordinación'
  return 'Contactos'
})

const descripcionPagina = computed(() => {
  if (esAdministrador.value) return 'Gestiona todos los supervisores e instructores del sistema'
  if (esInstructor.value) return 'Gestiona los usuarios que coordinas'
  return 'Mantén el contacto con tu instructor y otros usuarios'
})

const cargarInstructorPrincipal = async () => {
  // Si es instructor o administrador, no necesita cargar instructor principal
  if (esInstructor.value || esAdministrador.value) return
  
  cargandoInstructor.value = true
  try {
    instructorPrincipal.value = await obtenerInstructorPrincipal()
  } catch (error) {
    console.error('Error al cargar instructor principal:', error)
    // No mostramos error si simplemente no hay instructor
  } finally {
    cargandoInstructor.value = false
  }
}

onMounted(() => {
  cargarInstructorPrincipal()
})
</script>
