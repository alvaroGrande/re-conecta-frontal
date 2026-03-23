<script setup>
import { computed, ref, onMounted } from 'vue'
import { 
  VideoCameraIcon, 
  ChatBubbleLeftIcon, 
  UserGroupIcon, 
  ClipboardDocumentListIcon, 
  QuestionMarkCircleIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'
import Skeleton from 'primevue/skeleton'
import { obtenerContactos } from '@services/contactos'

// Estado para contactos
const totalContactos = ref(0)
const cargandoContactos = ref(false)

// Obtener usuario actual
const usuarioActual = computed(() => {
  try {
    const usuario = localStorage.getItem('usuario')
    return usuario ? JSON.parse(usuario) : null
  } catch {
    return null
  }
})

// Verificar si es administrador
const esAdmin = computed(() => usuarioActual.value?.rol === 1)

// Cargar contactos
const cargarContactos = async () => {
  cargandoContactos.value = true
  try {
    const response = await obtenerContactos(1, 1, '')
    totalContactos.value = response.total || 0
  } catch (error) {
    console.error('Error al cargar contactos:', error)
    totalContactos.value = 0
  } finally {
    cargandoContactos.value = false
  }
}

onMounted(() => {
  cargarContactos()
})

// Cada card tiene info distinta
const cards = computed(() => {
  const baseCards = [
    { 
      title: 'Video Llamada', 
      description: 'Conéctate en tiempo real con tus colegas.', 
      icon: VideoCameraIcon, 
      color: 'text-blue-500',
      info: 'Última sesión hace 1 hora',
      link : '/videollamada'
    },
    { 
      title: 'Talleres', 
      description: 'Participa en talleres interactivos.', 
      icon: ClipboardDocumentListIcon, 
      color: 'text-green-500',
      info: '2 talleres disponibles hoy',
      link : '/talleres'
    },
    { 
      title: 'Contactos', 
      description: 'Gestiona tus contactos.', 
      icon: UserGroupIcon, 
      color: 'text-purple-500',
      info: totalContactos.value === 0 && !cargandoContactos.value
        ? 'No hay contactos' 
        : `${totalContactos.value} contacto${totalContactos.value !== 1 ? 's' : ''} activo${totalContactos.value !== 1 ? 's' : ''}`,
      link : '/contact',
      isContactos: true
    },
    { 
      title: 'Encuestas', 
      description: 'Crea y responde encuestas.', 
      icon: ClipboardDocumentListIcon, 
      color: 'text-yellow-500',
      info: '3 encuestas pendientes',
      link : '/Encuestas'
    },
    { 
      title: 'Recordatorios', 
      description: 'Accede a resultados de encuestas.', 
      icon: ClipboardDocumentListIcon, 
      color: 'text-red-500',
      info: 'Última encuesta completada hace 2 días',
      link : '/Recordatorios'
    },
    { 
      title: 'Ayuda', 
      description: 'Consulta las preguntas frecuentes.', 
      icon: QuestionMarkCircleIcon, 
      color: 'text-indigo-500',
      info: '5 artículos nuevos',
      link : '/Ayuda'
    }
  ]

  // Si es admin, agregar card del Dashboard al principio
  if (esAdmin.value) {
    return [
      {
        title: 'Panel de Administración',
        description: 'Vista general del sistema y estadísticas.',
        icon: ChartBarIcon,
        color: 'text-orange-500',
        info: 'Acceso exclusivo para administradores',
        link: '/dashboard',
        destacado: true
      },
      ...baseCards
    ]
  }

  return baseCards
})
</script>

<template>
  <div class="w-full px-4 py-4">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
     <RouterLink 
        v-for="card in cards" 
        :key="card.title" 
        :to="card.link"
        class="flex flex-col space-y-4 p-6 rounded-lg bg-white dark:bg-slate-800 shadow-md hover:shadow-xl transition-shadow cursor-pointer"
        :class="{ 'ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-slate-900': card.destacado }"
      >
        <div class="flex items-center space-x-4">
          <component :is="card.icon" :class="['w-10 h-10 flex-shrink-0', card.color]" />
          <h2 class="text-xl font-semibold text-gray-800 dark:text-slate-100">{{ card.title }}</h2>
          <span v-if="card.destacado" class="ml-auto px-2 py-1 text-xs font-bold text-orange-600 bg-orange-100 rounded-full">
            ADMIN
          </span>
        </div>
        <p class="text-gray-600 dark:text-slate-300">{{ card.description }}</p>
        <Skeleton v-if="card.isContactos && cargandoContactos" height="1.25rem" class="w-3/4" />
        <p v-else class="text-gray-500 dark:text-slate-400 text-sm">{{ card.info }}</p>
      </RouterLink>
    </div>
  </div>
</template>
