<template>
  <Analytics />
  <div class="flex flex-col min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 transition-colors duration-200">
   <Toast />
    <ImpersonationBanner />
    <Header />

    <main class="flex-grow flex flex-col max-w-full p-4">
      <RouterView />
    </main>

    <Footer />
    
    <!-- Dialog de advertencia con countdown -->
    <Dialog
      :visible="showTimerBadge"
      modal
      :closable="false"
      :draggable="false"
      header="Sesión Inactiva"
      :style="{ width: '360px' }"
    >
      <div class="flex flex-col items-center gap-3 py-3">
        <p class="text-center text-base text-gray-700">
          Tu sesión se cerrará en <span class="font-semibold text-gray-900">{{ timeRemaining }}</span> segundos
        </p>
        
        <p class="text-center text-sm text-gray-500">
          Haz clic para continuar
        </p>
      </div>
      
      <template #footer>
        <div class="flex justify-center">
          <Button
            label="Continuar"
            icon="pi pi-check"
            @click="handleContinueSession"
            size="small"
            autofocus
          />
        </div>
      </template>
    </Dialog>
    
    <!-- Modal de advertencia de inactividad final -->
    <InactivityWarningModal
      :visible="showWarningModal"
      :initial-countdown="INACTIVITY_CONFIG.COUNTDOWN_DURATION"
      @continue="handleContinueSession"
      @timeout="handleSessionTimeout"
    />
  </div>
</template>

<script setup>
import { Analytics } from '@vercel/analytics/vue';
import { ref, onMounted } from "vue";
import Header from '@layout/Header.vue'
import Footer from '@layout/Footer.vue'
import ImpersonationBanner from '@layout/ImpersonationBanner.vue'
import { RouterView } from 'vue-router'
import { useToast } from "primevue/usetoast";
import { setToast } from "@services/toastService";
import { useInactivityTimer } from "@composables/useInactivityTimer";
import InactivityWarningModal from '@layout/InactivityWarningModal.vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { INACTIVITY_CONFIG } from '@helpers/constants'
import { useTheme } from '@composables/useTheme'

const toast = useToast();
const { initTheme } = useTheme()

// Detectar inactividad del usuario
const { 
  showWarningModal,
  showTimerBadge,
  timeRemaining,
  handleContinue, 
  handleInactivity,
  stopTimer
} = useInactivityTimer(INACTIVITY_CONFIG.WARNING_TIMEOUT, INACTIVITY_CONFIG.COUNTDOWN_DURATION)

// Exponer stopTimer globalmente para que logout pueda usarlo
if (typeof window !== 'undefined') {
  window.__stopInactivityTimer = stopTimer
}

const handleContinueSession = () => {
  handleContinue()
}

const handleSessionTimeout = () => {
  handleInactivity()
}

onMounted(() => {
  setToast(toast); // Registramos la instancia global
  initTheme();     // Aplicar tema guardado o preferencia del sistema
});
</script>
