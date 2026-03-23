<template>
  <div class="max-w-6xl mx-auto p-6">
    <div class="bg-white rounded-xl shadow p-6">
      <h2 class="text-2xl font-bold mb-2">🎥 Videollamada con Zoom</h2>
      <p class="text-sm text-gray-600 mb-6">Plan gratuito: 40 minutos con 3+ participantes, ilimitado 1 a 1</p>
      
      <div class="grid md:grid-cols-2 gap-6">
        <CreateMeeting @meeting-created="handleMeetingCreated" />
        <JoinMeeting @join-meeting="handleJoinMeeting" />
      </div>

      <!-- Información adicional -->
      <div class="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <h3 class="font-semibold text-blue-900 mb-2">💡 ¿Cómo funciona?</h3>
        <ul class="text-sm text-blue-800 space-y-1">
          <li>• Al unirte, se abrirá automáticamente la aplicación de Zoom en tu dispositivo</li>
          <li>• Si no tienes Zoom instalado, se abrirá en el navegador</li>
          <li>• No necesitas crear una cuenta de Zoom para unirte como invitado</li>
          <li>• Las reuniones no requieren contraseña para facilitar el acceso</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useZoomMeeting } from '@composables/useZoomMeeting';
import CreateMeeting from '@features/videocall/CreateMeeting.vue';
import JoinMeeting from '@features/videocall/JoinMeeting.vue';

const { joinMeeting } = useZoomMeeting();

/**
 * Maneja la unión a una reunión (tanto nueva como existente)
 */
const handleJoinMeeting = async ({ meetingNumber, password, userName }) => {
  await joinMeeting(meetingNumber, password, userName);
};

/**
 * Maneja la información de reunión creada
 */
const handleMeetingCreated = (meetingInfo) => {
  console.log('Reunión creada:', meetingInfo);
};
</script>
