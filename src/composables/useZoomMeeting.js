import { ref } from 'vue';
import { createMeeting as createMeetingAPI } from '@services/videoCall.js';

export function useZoomMeeting() {
  const inCall = ref(false);
  const loading = ref(false);
  const error = ref('');
  const currentMeetingTopic = ref('');
  const currentMeetingNumber = ref('');

  /**
   * Abre la aplicación de Zoom para unirse a una reunión
   */
  const joinMeeting = async (meetingNumber, password, displayName) => {
    try {
      loading.value = true;
      error.value = '';
      
      console.log('🔗 Abriendo aplicación de Zoom...');
      
      // Construir la URL para abrir la app de Zoom
      // Formato: zoommtg://zoom.us/join?confno=MEETING_ID&pwd=PASSWORD
      let zoomUrl = `zoommtg://zoom.us/join?confno=${meetingNumber}`;
      
      if (password) {
        zoomUrl += `&pwd=${password}`;
      }
      
      // También construir URL web como fallback
      let webUrl = `https://zoom.us/j/${meetingNumber}`;
      if (password) {
        webUrl += `?pwd=${password}`;
      }

      // Intentar abrir la app de Zoom
      window.location.href = zoomUrl;
      
      // Después de un breve delay, abrir la URL web como fallback
      setTimeout(() => {
        // Abrir en nueva ventana como respaldo si la app no se abre
        window.open(webUrl, '_blank');
      }, 1500);

      console.log('✅ Redirigiendo a Zoom');
      loading.value = false;

      return { success: true };
    } catch (err) {
      console.error('❌ Error al abrir Zoom:', err);
      error.value = err.message || 'Error al abrir Zoom';
      loading.value = false;
      
      return { success: false, error: error.value };
    }
  };

  /**
   * Crea una nueva reunión
   */
  const createMeeting = async (topic, duration = 40, numParticipants = 2) => {
    try {
      loading.value = true;
      error.value = '';
      
      const response = await createMeetingAPI({
        topic,
        duration,
        participantes: [] // Array vacío por ahora, se puede expandir para agregar participantes específicos
      });

      console.log('Reunión creada:', response);

      if (response && response.meetingNumber) {
        loading.value = false;
        return {
          success: true,
          meetingNumber: response.meetingNumber,
          password: response.password,
          joinUrl: response.joinUrl
        };
      } else {
        throw new Error('Información de reunión no válida');
      }
    } catch (err) {
      console.error('Error creando reunión:', err);
      error.value = err.response?.data?.error || 'Error al crear la reunión';
      loading.value = false;
      return { success: false, error: error.value };
    }
  };

  /**
   * Abre la URL de Zoom en una nueva ventana
   */
  const openMeetingUrl = (joinUrl) => {
    window.open(joinUrl, '_blank');
  };

  return {
    inCall,
    loading,
    error,
    currentMeetingTopic,
    currentMeetingNumber,
    joinMeeting,
    createMeeting,
    openMeetingUrl
  };
}
