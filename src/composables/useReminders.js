import { ref } from 'vue'
import {
  obtenerRecordatorios,
  crearRecordatorio,
  actualizarRecordatorio,
  eliminarRecordatorio
} from '@services/recordatorios'

export function useReminders() {
  const reminders = ref([])
  const loading = ref(false)

  /**
   * Convierte un registro de la API al formato interno del calendario.
   */
  function mapReminder(r) {
    const [year, month, day] = r.fecha.split('-').map(Number)
    return {
      id: r.id,
      title: r.titulo,
      description: r.descripcion || '',
      date: new Date(year, month - 1, day),
      time: r.hora.slice(0, 5), // 'HH:MM'
      type: r.tipo,
      userId: r.usuario_id,
      userName: r.usuario
        ? `${r.usuario.nombre} ${r.usuario.Apellidos || ''}`.trim()
        : ''
    }
  }

  /**
   * Carga recordatorios desde la API.
   * @param {Object} filtros - Filtros opcionales para supervisores
   */
  async function loadReminders(filtros = {}) {
    try {
      loading.value = true
      const data = await obtenerRecordatorios(filtros)
      reminders.value = data.map(mapReminder)
    } catch (error) {
      console.error('Error al cargar recordatorios:', error)
      reminders.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Crea un recordatorio y lo añade al estado local.
   * @returns {Date} La fecha del nuevo recordatorio
   */
  async function addReminder(reminderData, _currentUser) {
    const nuevo = await crearRecordatorio({
      titulo: reminderData.title,
      descripcion: reminderData.description,
      fecha: reminderData.date,
      hora: reminderData.time
    })
    const mapped = mapReminder(nuevo)
    reminders.value.push(mapped)
    return mapped.date
  }

  /**
   * Actualiza un recordatorio en la API y en el estado local.
   */
  async function updateReminder(id, datos) {
    const actualizado = await actualizarRecordatorio(id, {
      titulo: datos.title,
      descripcion: datos.description,
      fecha: datos.date,
      hora: datos.time
    })
    const mapped = mapReminder(actualizado)
    const index = reminders.value.findIndex(r => r.id === id)
    if (index !== -1) reminders.value.splice(index, 1, mapped)
    return mapped
  }

  /**
   * Elimina un recordatorio de la API y del estado local.
   */
  async function deleteReminder(id) {
    await eliminarRecordatorio(id)
    const index = reminders.value.findIndex(r => r.id === id)
    if (index !== -1) reminders.value.splice(index, 1)
  }

  /**
   * Devuelve los recordatorios del día seleccionado, ordenados por hora.
   */
  function getSelectedDayReminders(selectedDate, filteredReminders, isSameDay) {
    return filteredReminders
      .filter(r => isSameDay(r.date, selectedDate))
      .sort((a, b) => a.time.localeCompare(b.time))
  }

  return {
    reminders,
    loading,
    loadReminders,
    addReminder,
    updateReminder,
    deleteReminder,
    getSelectedDayReminders
  }
}

