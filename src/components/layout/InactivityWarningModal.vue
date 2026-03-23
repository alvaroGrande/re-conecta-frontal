<template>
  <Dialog
    :visible="visible"
    modal
    :closable="false"
    :draggable="false"
    :header="$t('inactivity.title')"
    :style="{ width: '380px' }"
  >
    <div class="flex flex-col items-center gap-3 py-3">
      <p class="text-center text-base text-gray-700">
        {{ $t('inactivity.message', { seconds: countdown }) }}
      </p>
      
      <p class="text-center text-sm text-gray-500">
        {{ $t('inactivity.clickToContinue') }}
      </p>
    </div>
    
    <template #footer>
      <div class="flex justify-center">
        <Button
          :label="$t('common.continue')"
          icon="pi pi-check"
          @click="handleContinue"
          size="small"
          autofocus
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  initialCountdown: {
    type: Number,
    default: 30
  }
})

const emit = defineEmits(['update:visible', 'continue', 'timeout'])

const countdown = ref(props.initialCountdown)
let countdownInterval = null

const startCountdown = () => {
  countdown.value = props.initialCountdown
  
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
  
  countdownInterval = setInterval(() => {
    countdown.value--
    
    if (countdown.value <= 0) {
      clearInterval(countdownInterval)
      emit('timeout')
    }
  }, 1000)
}

const stopCountdown = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
}

const handleContinue = () => {
  stopCountdown()
  emit('continue')
  emit('update:visible', false)
}

// Watch para iniciar/detener el countdown cuando cambia la visibilidad
watch(() => props.visible, (newValue) => {
  if (newValue) {
    startCountdown()
  } else {
    stopCountdown()
  }
})
</script>

<style scoped>
/* Estilos simplificados */
</style>
