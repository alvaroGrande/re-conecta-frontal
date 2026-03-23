<template>
  <div 
    class="p-4 hover:bg-gray-50 transition"
    :class="[
      { 'cursor-pointer': clickable },
      classes
    ]"
    @click="$emit('click', contacto)"
  >
    <div class="flex items-center gap-3">
      <!-- Icono de alerta -->
      <div v-if="iconoAlerta" class="flex-shrink-0">
        <i 
          :class="[iconoAlerta.icono, iconoAlerta.color, 'text-xl']"
          class="pi"
          v-tooltip.right="iconoAlerta.tooltip"
        ></i>
      </div>
      
      <!-- Foto -->
      <div class="flex-shrink-0">
        <div v-if="contacto.foto_perfil" class="w-12 h-12 rounded-full overflow-hidden">
          <img :src="contacto.foto_perfil" :alt="nombreCompleto" class="w-full h-full object-cover" />
        </div>
        <div v-else class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
          <span class="text-lg font-semibold text-gray-600">{{ iniciales }}</span>
        </div>
      </div>

      <!-- Información -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <button 
            @click.stop="navegarAPerfil"
            class="font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer text-left"
          >
            {{ nombreCompleto }}
          </button>
          <span 
            v-if="contacto.rol !== 3"
            :class="rolClasses"
            class="text-xs px-2 py-0.5 rounded-full"
          >
            {{ rolTexto }}
          </span>
        </div>
        <p class="text-sm text-gray-600 truncate">{{ contacto.email }}</p>
        <p v-if="contacto.telefono" class="text-xs text-gray-500 mt-1">
          <i class="pi pi-phone text-xs mr-1"></i>{{ contacto.telefono }}
        </p>
        <!-- Información adicional para administradores -->
        <p v-if="mostrarUsuariosCoordinados && contacto.usuarios_coordinados !== undefined" class="text-xs text-blue-600 mt-1">
          <i class="pi pi-users text-xs mr-1"></i>{{ contacto.usuarios_coordinados }} usuario{{ contacto.usuarios_coordinados !== 1 ? 's' : '' }} coordinado{{ contacto.usuarios_coordinados !== 1 ? 's' : '' }}
        </p>
      </div>

      <!-- Acciones -->
      <div class="flex gap-1" @click.stop>
        <Button 
          icon="pi pi-send" 
          severity="info" 
          text
          rounded
          @click="$emit('enviar-notificacion', contacto)"
          v-tooltip.left="'Enviar notificación'"
        />
        <Button 
          icon="pi pi-envelope" 
          severity="secondary" 
          text
          rounded
          @click="$emit('enviar-email', contacto)"
          v-tooltip.left="'Enviar email'"
        />
        <Button 
          v-if="mostrarEliminar"
          icon="pi pi-trash" 
          severity="danger" 
          text
          rounded
          @click="$emit('eliminar', contacto)"
          v-tooltip.left="'Eliminar'"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'

const router = useRouter()

const props = defineProps({
  contacto: {
    type: Object,
    required: true
  },
  clickable: {
    type: Boolean,
    default: false
  },
  classes: {
    type: String,
    default: ''
  },
  iconoAlerta: {
    type: Object,
    default: null
  },
  mostrarEliminar: {
    type: Boolean,
    default: false
  },
  mostrarUsuariosCoordinados: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click', 'enviar-notificacion', 'enviar-email', 'eliminar'])

const navegarAPerfil = () => {
  router.push({ name: 'PerfilUsuario', params: { id: props.contacto.id } })
}

const nombreCompleto = computed(() => {
  return `${props.contacto.nombre} ${props.contacto.Apellidos}`
})

const iniciales = computed(() => {
  const nombre = props.contacto.nombre?.charAt(0) || ''
  const apellido = props.contacto.Apellidos?.charAt(0) || ''
  return (nombre + apellido).toUpperCase()
})

const rolTexto = computed(() => {
  const roles = {
    1: 'Admin',
    2: 'Instructor',
    3: 'Usuario'
  }
  return roles[props.contacto.rol] || 'Usuario'
})

const rolClasses = computed(() => {
  const classes = {
    1: 'bg-purple-100 text-purple-800',
    2: 'bg-blue-100 text-blue-800',
    3: 'bg-gray-100 text-gray-800'
  }
  return classes[props.contacto.rol] || 'bg-gray-100 text-gray-800'
})
</script>

<style scoped>
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
