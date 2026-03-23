<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">
          {{ $t('calendar.title') }}
        </h1>
        <p class="text-gray-600 mt-1">
          {{ isSupervisor ? $t('calendar.supervisorSubtitle') : $t('calendar.userSubtitle') }}
        </p>
      </div>

      <!-- Controles y filtros para supervisores y admins -->
      <SupervisorFilters
        v-if="isSupervisor"
        v-model:showAdminReminders="showAdminReminders"
        v-model:showUserReminders="showUserReminders"
        v-model:selectedUserId="selectedUserId"
        :is-admin="currentUser.rol === 1"
      />

      <!-- Botón añadir recordatorio -->
      <div class="mb-6">
        <button 
          @click="openModal" 
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2 shadow-sm"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('calendar.addReminder') }}
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Calendario -->
        <div class="lg:col-span-2">
          <CalendarGrid
            :days="calendarDays"
            :week-days="weekDays"
            :month-name="currentMonthName"
            :year="currentYear"
            :is-current-month="isCurrentMonth()"
            @previous-month="previousMonth"
            @next-month="nextMonth"
            @select-day="selectDay"
            @go-to-today="goToToday"
            @go-to-year="goToYear"
          />
        </div>

        <!-- Panel lateral - Recordatorios del día seleccionado -->
        <div class="lg:col-span-1">
          <ReminderList
            :reminders="selectedDayReminders"
            :formatted-date="selectedDateFormatted"
            :show-user-name="isSupervisor"
            :current-user-id="currentUser.id"
            :is-supervisor="isSupervisor"
            @delete="handleDeleteReminder"
            @view="openDetailModal"
          />
        </div>
      </div>
    </div>

    <!-- Modal para crear recordatorio -->
    <ReminderModal
      v-model:visible="showModal"
      :initial-date="initialModalDate"
      @save="handleSaveReminder"
    />

    <!-- Modal de detalle/edición de recordatorio -->
    <ReminderDetailModal
      v-model:visible="showDetailModal"
      :reminder="selectedReminder"
      :current-user-id="currentUser.id"
      :is-supervisor="isSupervisor"
      :show-user-name="isSupervisor"
      @save="handleUpdateReminder"
      @delete="handleDeleteReminder"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCalendar } from '@composables/useCalendar'
import { useReminders } from '@composables/useReminders'

// Componentes
import CalendarGrid from '@features/Calendar/CalendarGrid.vue'
import ReminderList from '@features/Calendar/ReminderList.vue'
import ReminderModal from '@features/Calendar/ReminderModal.vue'
import ReminderDetailModal from '@features/Calendar/ReminderDetailModal.vue'
import SupervisorFilters from '@features/Calendar/SupervisorFilters.vue'

const { t } = useI18n()

// Composables
const {
  selectedDate,
  weekDays,
  currentMonthName,
  currentYear,
  selectedDateFormatted,
  generateCalendarDays,
  isSameDay,
  selectDay,
  previousMonth,
  nextMonth,
  goToToday,
  goToYear,
  isCurrentMonth,
  getDateString
} = useCalendar()

const {
  reminders,
  loading,
  loadReminders,
  addReminder,
  updateReminder,
  deleteReminder,
  getSelectedDayReminders
} = useReminders()

// Estado del usuario — cargado sincrónicamente para evitar flash de rol incorrecto
function getStoredUser() {
  try {
    const stored = localStorage.getItem('usuario')
    return stored ? JSON.parse(stored) : { id: null, nombre: '', rol: 3 }
  } catch {
    return { id: null, nombre: '', rol: 3 }
  }
}
const currentUser = ref(getStoredUser())

const isSupervisor = computed(() => currentUser.value.rol === 2 || currentUser.value.rol === 1)

// Estado del modal de creación
const showModal = ref(false)
const initialModalDate = computed(() => getDateString(selectedDate.value))

// Estado del modal de detalle/edición
const showDetailModal = ref(false)
const selectedReminder = ref(null)

function openDetailModal(reminder) {
  selectedReminder.value = reminder
  showDetailModal.value = true
}

// Filtros para supervisores (persistidos en localStorage)
const STORAGE_KEY_ADMIN = 'calendar_show_admin_reminders'
const STORAGE_KEY_USERS = 'calendar_show_user_reminders'

const showAdminReminders = ref(localStorage.getItem(STORAGE_KEY_ADMIN) !== 'false')
const showUserReminders = ref(localStorage.getItem(STORAGE_KEY_USERS) !== 'false')
const selectedUserId = ref('')

watch(showAdminReminders, (val) => localStorage.setItem(STORAGE_KEY_ADMIN, val))
watch(showUserReminders, (val) => localStorage.setItem(STORAGE_KEY_USERS, val))

// Recordatorios filtrados enviando los filtros a la API
function reloadReminders() {
  loadReminders({
    show_admin: showAdminReminders.value,
    show_users: showUserReminders.value,
    usuario_id: selectedUserId.value || undefined
  })
}

watch([showAdminReminders, showUserReminders, selectedUserId], reloadReminders)

// Días del calendario
const calendarDays = computed(() => {
  return generateCalendarDays(reminders.value)
})

// Recordatorios del día seleccionado
const selectedDayReminders = computed(() => {
  return getSelectedDayReminders(selectedDate.value, reminders.value, isSameDay)
})

// Funciones del modal
function openModal() {
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function handleSaveReminder(reminderData) {
  const newDate = await addReminder(reminderData, currentUser.value)
  selectedDate.value = newDate
}

async function handleUpdateReminder(datos) {
  await updateReminder(datos.id, datos)
}

async function handleDeleteReminder(id) {
  await deleteReminder(id)
}

// Cargar recordatorios al montar
onMounted(async () => {
  await reloadReminders()
})
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
