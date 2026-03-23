<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Distribución de Usuarios por Rol</h3>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  distribucion: {
    type: Array,
    default: () => []
  }
})

const chartCanvas = ref(null)
let chartInstance = null

const actualizarGrafica = () => {
  if (!chartCanvas.value || !props.distribucion.length) return

  const conteoRoles = {
    admin: 0,
    instructor: 0,
    usuario: 0
  }

  props.distribucion.forEach(item => {
    if (item.rol === 1) conteoRoles.admin = item.cantidad
    if (item.rol === 2) conteoRoles.instructor = item.cantidad
    if (item.rol === 3) conteoRoles.usuario = item.cantidad
  })

  if (chartInstance) {
    chartInstance.destroy()
  }

  chartInstance = new Chart(chartCanvas.value, {
    type: 'doughnut',
    data: {
      labels: ['Administradores', 'Instructores', 'Usuarios'],
      datasets: [{
        data: [conteoRoles.admin, conteoRoles.instructor, conteoRoles.usuario],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(156, 163, 175, 0.8)'
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(59, 130, 246)',
          'rgb(156, 163, 175)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  })
}

watch(() => props.distribucion, actualizarGrafica, { deep: true })

onMounted(() => {
  actualizarGrafica()
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>
