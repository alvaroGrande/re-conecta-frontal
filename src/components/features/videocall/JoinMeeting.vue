<template>
  <div class="bg-white p-6 rounded-lg shadow">
    <h3 class="text-lg font-semibold mb-4">Unirse a reunión existente</h3>
    
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">ID de la reunión</label>
        <input 
          v-model="meetingNumberInput" 
          placeholder="123 456 7890" 
          @keyup.enter="handleJoinMeeting" 
          class="mt-2 block w-full rounded-md border border-gray-200 px-3 py-2" 
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Contraseña (opcional)</label>
        <input 
          v-model="meetingPassword" 
          type="text" 
          placeholder="Contraseña" 
          @keyup.enter="handleJoinMeeting" 
          class="mt-2 block w-full rounded-md border border-gray-200 px-3 py-2" 
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Tu nombre</label>
        <input 
          v-model="userName" 
          placeholder="Tu nombre" 
          @keyup.enter="handleJoinMeeting" 
          class="mt-2 block w-full rounded-md border border-gray-200 px-3 py-2" 
        />
      </div>

      <button 
        @click="handleJoinMeeting" 
        :disabled="loading || !meetingNumberInput" 
        class="w-full inline-flex items-center justify-center gap-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md disabled:opacity-60"
      >
        {{ loading ? 'Abriendo Zoom...' : '🔗 Unirse a la Reunión' }}
      </button>
    </div>

    <!-- Mensajes de éxito -->
    <div v-if="success" class="mt-4 text-sm text-emerald-600">✅ Abriendo Zoom...</div>
    
    <!-- Mensajes de error -->
    <div v-if="error" class="mt-4 text-sm text-red-600">❌ {{ error }}</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuth } from '@composables/useAuth';

const emit = defineEmits(['join-meeting']);

const { usuario } = useAuth();

const loading = ref(false);
const error = ref('');
const success = ref(false);
const meetingNumberInput = ref('');
const meetingPassword = ref('');

// Obtener el nombre del usuario autenticado
const userName = ref(computed(() => {
  if (usuario.value?.nombre && usuario.value?.apellido) {
    return `${usuario.value.nombre} ${usuario.value.apellido}`;
  }
  return usuario.value?.nombre || usuario.value?.email || 'Usuario';
}).value);

const handleJoinMeeting = () => {
  // Validar que meetingNumberInput tenga un valor
  const inputValue = meetingNumberInput.value;
  
  if (!inputValue || !inputValue.trim()) {
    error.value = 'Por favor ingresa el ID de la reunión';
    return;
  }

  // Limpiar el número de reunión (quitar espacios y guiones)
  const meetingNumber = inputValue.replace(/[\s-]/g, '');

  // Validar que después de limpiar aún tenga contenido
  if (!meetingNumber) {
    error.value = 'Por favor ingresa un ID de reunión válido';
    return;
  }

  // Limpiar mensajes
  error.value = '';
  success.value = true;
  loading.value = true;

  // Construir URLs para abrir Zoom
  let zoomUrl = `zoommtg://zoom.us/join?confno=${meetingNumber}`;
  const password = meetingPassword.value;
  
  if (password) {
    zoomUrl += `&pwd=${password}`;
  }
  
  // URL web como fallback
  let webUrl = `https://zoom.us/j/${meetingNumber}`;
  if (password) {
    webUrl += `?pwd=${password}`;
  }

  // Intentar abrir la app de Zoom
  window.location.href = zoomUrl;
  
  // Fallback a web después de un delay
  setTimeout(() => {
    window.open(webUrl, '_blank');
    loading.value = false;
    success.value = false;
  }, 1500);

  // Emitir evento (para tracking o logging)
  emit('join-meeting', {
    meetingNumber,
    password: password || '',
    userName: userName.value || 'Usuario',
    topic: 'Reunión de Zoom'
  });
};
</script>
