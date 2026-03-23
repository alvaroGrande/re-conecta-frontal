<script setup>
import {
  VideoCameraIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  BellAlertIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
} from '@heroicons/vue/24/outline'

const funcionalidades = [
  {
    icon: VideoCameraIcon,
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950',
    titulo: 'Videollamadas',
    descripcion: 'Sesiones en tiempo real con tus contactos desde cualquier dispositivo.',
  },
  {
    icon: ClipboardDocumentListIcon,
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-950',
    titulo: 'Talleres',
    descripcion: 'Inscríbete en talleres presenciales u online. Los monitores gestionan las inscripciones de sus usuarios.',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-950',
    titulo: 'Encuestas',
    descripcion: 'Crea y responde encuestas para recoger opiniones y medir la satisfacción.',
  },
  {
    icon: UserGroupIcon,
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-950',
    titulo: 'Contactos',
    descripcion: 'Gestiona tu red de contactos y mantén el vínculo con las personas de tu entorno.',
  },
  {
    icon: BellAlertIcon,
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-950',
    titulo: 'Recordatorios',
    descripcion: 'Configura alertas personalizadas para no perder ningún evento importante.',
  },
  {
    icon: ChartBarIcon,
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-950',
    titulo: 'Panel de administración',
    descripcion: 'Dashboard con estadísticas de actividad, usuarios y talleres para administradores.',
  },
]

const roles = [
  {
    nombre: 'Administrador',
    descripcion: 'Gestión completa de la plataforma: usuarios, talleres, encuestas, dashboard y configuración.',
    clase: 'border-orange-300 bg-orange-50 dark:bg-orange-950',
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  },
  {
    nombre: 'Monitor / Supervisor',
    descripcion: 'Supervisa a un grupo de usuarios asignados, puede inscribirlos o desinscribirlos en talleres.',
    clase: 'border-indigo-300 bg-indigo-50 dark:bg-indigo-950',
    badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
  },
  {
    nombre: 'Usuario',
    descripcion: 'Accede a talleres, videollamadas, encuestas y gestión de sus contactos y recordatorios.',
    clase: 'border-green-300 bg-green-50 dark:bg-green-950',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  },
]
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-10 space-y-12">

    <!-- Hero -->
    <section class="text-center space-y-4">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
        re<span class="text-primary-500">Conecta</span>
      </h1>
      <p class="text-lg text-gray-500 dark:text-slate-400 max-w-2xl mx-auto">
        Una plataforma pensada para mantener a las personas conectadas: talleres, videollamadas,
        encuestas y mucho más, todo en un mismo lugar.
      </p>
    </section>

    <!-- Funcionalidades -->
    <section>
      <h2 class="text-2xl font-semibold text-gray-800 dark:text-slate-200 mb-6">¿Qué puedes hacer?</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="f in funcionalidades"
          :key="f.titulo"
          class="flex gap-4 items-start p-4 rounded-xl border border-gray-200 dark:border-slate-700"
          :class="f.bg"
        >
          <component :is="f.icon" class="w-8 h-8 shrink-0 mt-0.5" :class="f.color" />
          <div>
            <p class="font-semibold text-gray-800 dark:text-slate-100">{{ f.titulo }}</p>
            <p class="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{{ f.descripcion }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Roles -->
    <section>
      <h2 class="text-2xl font-semibold text-gray-800 dark:text-slate-200 mb-6">Roles de usuario</h2>
      <div class="space-y-4">
        <div
          v-for="r in roles"
          :key="r.nombre"
          class="flex items-start gap-4 p-4 rounded-xl border"
          :class="r.clase"
        >
          <span class="text-xs font-bold px-2 py-1 rounded-full shrink-0 mt-0.5" :class="r.badge">
            {{ r.nombre }}
          </span>
          <p class="text-sm text-gray-600 dark:text-slate-300">{{ r.descripcion }}</p>
        </div>
      </div>
    </section>

    <!-- Tecnología -->
    <section class="border-t border-gray-200 dark:border-slate-700 pt-8">
      <h2 class="text-2xl font-semibold text-gray-800 dark:text-slate-200 mb-4">Tecnología</h2>
      <div class="flex flex-wrap gap-2">
        <span v-for="t in ['Vue 3', 'Vite', 'Tailwind CSS', 'PrimeVue', 'Node.js', 'Express', 'Supabase', 'Socket.IO']"
          :key="t"
          class="px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-600"
        >
          {{ t }}
        </span>
      </div>
    </section>

  </div>
</template>
