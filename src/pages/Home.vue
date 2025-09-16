<script setup>
import { 
  VideoCameraIcon, 
  ChatBubbleLeftIcon, 
  UserGroupIcon, 
  ClipboardDocumentListIcon, 
  QuestionMarkCircleIcon 
} from '@heroicons/vue/24/outline'

// Cada card tiene info distinta
const cards = [
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
    info: '10 contactos activos',
    link : '/Contactos'
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
</script>

<template>
  <div class="w-full px-4 py-4">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
     <RouterLink 
        v-for="card in cards" 
        :key="card.title" 
        :to="card.link"
        class="flex flex-col space-y-4 p-6 rounded-lg bg-white shadow-md hover:shadow-xl transition-shadow cursor-pointer"
      >
        <div class="flex items-center space-x-4">
          <component :is="card.icon" :class="['w-10 h-10 flex-shrink-0', card.color]"/>
          <h2 class="text-xl font-semibold text-gray-800">{{ card.title }}</h2>
        </div>
        <p class="text-gray-600">{{ card.description }}</p>
        <p class="text-gray-500 text-sm">{{ card.info }}</p>
      </RouterLink>
    </div>
  </div>
</template>
