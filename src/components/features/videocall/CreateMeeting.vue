<template>
  <div class="bg-white p-6 rounded-lg shadow">
    <h3 class="text-lg font-semibold mb-4">Crear nueva reunión</h3>
    
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Tema de la reunión</label>
        <input 
          v-model="meetingTopic" 
          placeholder="Tema de la reunión" 
          class="mt-2 block w-full rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Duración estimada (minutos)</label>
        <input 
          v-model.number="duration" 
          type="number"
          min="1"
          max="40"
          placeholder="40" 
          class="mt-2 block w-full rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
        />
        <p class="text-xs text-gray-500 mt-1"></p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Número de participantes</label>
        <input 
          v-model.number="numParticipants" 
          type="number"
          min="1"
          max="100"
          placeholder="2" 
          class="mt-2 block w-full rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
        />
        <p class="text-xs text-gray-500 mt-1">Número estimado de personas que se unirán</p>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700">Tu nombre</label>
        <input 
          v-model="userName" 
          placeholder="Tu nombre" 
          class="mt-2 block w-full rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
        />
      </div>

      <button 
        @click="handleCreateAndJoin" 
        :disabled="loading" 
        class="w-full inline-flex items-center justify-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md disabled:opacity-60"
      >
        {{ loading ? 'Creando...' : '🚀 Crear Reunión' }}
      </button>
    </div>

    <!-- Mensajes de error -->
    <div v-if="error" class="mt-4 text-sm text-red-600">❌ {{ error }}</div>

    <!-- Información de reunión creada -->
    <div v-if="createdMeetingInfo" class="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded">
      <div class="font-semibold text-emerald-800">✅ ¡Reunión creada!</div>
      <p class="text-sm text-emerald-700 mt-1">Zoom se abrirá automáticamente. Comparte esta información para invitar:</p>
      <div class="mt-3 space-y-2">
        <div class="flex gap-2">
          <input 
            :value="createdMeetingInfo.joinUrl" 
            readonly 
            class="flex-1 rounded-md border border-gray-200 px-3 py-2 bg-white text-sm" 
            ref="shareInput" 
          />
          <button 
            @click="copyToClipboard" 
            class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
          >
            {{ copied ? '✓' : '📋' }}
          </button>
        </div>
        <div class="text-sm">
          <span class="font-medium">ID:</span> {{ createdMeetingInfo.meetingNumber }}
          <span v-if="createdMeetingInfo.password" class="ml-4">
            <span class="font-medium">Contraseña:</span> {{ createdMeetingInfo.password }}
          </span>
        </div>
        <button 
          @click="handleJoinZoom" 
          class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm mt-2"
        >
          🔗 Abrir en Zoom
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useZoomMeeting } from '@composables/useZoomMeeting';
import { useAuth } from '@composables/useAuth';

const emit = defineEmits(['meeting-created', 'join-meeting']);

const { createMeeting, loading, error } = useZoomMeeting();
const { usuario } = useAuth();

const meetingTopic = ref('');
const duration = ref(40);
const numParticipants = ref(2);
const createdMeetingInfo = ref(null);
const copied = ref(false);
const shareInput = ref(null);

// Obtener el nombre del usuario autenticado
const userName = ref(computed(() => {
  if (usuario.value?.nombre && usuario.value?.apellido) {
    return `${usuario.value.nombre} ${usuario.value.apellido}`;
  }
  return usuario.value?.nombre || usuario.value?.email || 'Usuario';
}).value);

const handleCreateAndJoin = async () => {
  const topic = meetingTopic.value.trim() || 'reConecta Video Call';
  
  const result = await createMeeting(
    topic, 
    duration.value || 40,
    numParticipants.value || 2
  );

  if (result.success) {
    createdMeetingInfo.value = {
      meetingNumber: result.meetingNumber,
      password: result.password,
      joinUrl: result.joinUrl
    };

    // Emitir evento con la información de la reunión creada
    emit('meeting-created', createdMeetingInfo.value);
    
    // Abrir directamente en Zoom
    setTimeout(() => {
      handleJoinZoom();
    }, 500);
  }
};

const handleJoinZoom = () => {
  if (!createdMeetingInfo.value) return;
  
  const { meetingNumber, password } = createdMeetingInfo.value;
  
  // Construir URL para abrir la app de Zoom
  let zoomUrl = `zoommtg://zoom.us/join?confno=${meetingNumber}`;
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
  
  // Fallback a web
  setTimeout(() => {
    window.open(webUrl, '_blank');
  }, 1500);
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(createdMeetingInfo.value.joinUrl);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Error copiando:', err);
    // Fallback
    if (shareInput.value) {
      shareInput.value.select();
      document.execCommand('copy');
      copied.value = true;
      setTimeout(() => {
        copied.value = false;
      }, 2000);
    }
  }
};
</script>
