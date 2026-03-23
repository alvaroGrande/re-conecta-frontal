import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

export function useCalendar() {
  const { locale } = useI18n()
  
  // Estado del calendario
  const currentDate = ref(new Date())
  const selectedDate = ref(new Date())

  // Días de la semana
  const weekDays = computed(() => {
    const days = {
      es: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
      en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      ca: ['Dg', 'Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds'],
      gl: ['Dom', 'Lun', 'Mar', 'Mér', 'Xov', 'Ven', 'Sáb']
    }
    return days[locale.value] || days.es
  })

  // Nombre del mes actual
  const currentMonthName = computed(() => {
    const months = {
      es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      ca: ['Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny', 'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'],
      gl: ['Xaneiro', 'Febreiro', 'Marzo', 'Abril', 'Maio', 'Xuño', 'Xullo', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Decembro']
    }
    const monthList = months[locale.value] || months.es
    return monthList[currentDate.value.getMonth()]
  })

  const currentYear = computed(() => currentDate.value.getFullYear())

  // Fecha seleccionada formateada
  const selectedDateFormatted = computed(() => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return selectedDate.value.toLocaleDateString(locale.value, options)
  })

  // Generar días del calendario
  function generateCalendarDays(filteredReminders) {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const prevLastDay = new Date(year, month, 0)
    
    const firstDayOfWeek = firstDay.getDay()
    const lastDate = lastDay.getDate()
    const prevLastDate = prevLastDay.getDate()
    
    const days = []
    
    // Días del mes anterior
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = prevLastDate - i
      const day = new Date(year, month - 1, date)
      days.push({
        key: `prev-${date}`,
        date,
        fullDate: day,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        reminders: []
      })
    }
    
    // Días del mes actual
    for (let i = 1; i <= lastDate; i++) {
      const day = new Date(year, month, i)
      const isToday = isSameDay(day, new Date())
      const isSelected = isSameDay(day, selectedDate.value)
      
      days.push({
        key: `current-${i}`,
        date: i,
        fullDate: day,
        isCurrentMonth: true,
        isToday,
        isSelected,
        reminders: getRemindersForDate(day, filteredReminders)
      })
    }
    
    // Días del mes siguiente
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(year, month + 1, i)
      days.push({
        key: `next-${i}`,
        date: i,
        fullDate: day,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        reminders: []
      })
    }
    
    return days
  }

  // Funciones auxiliares
  function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear()
  }

  function getRemindersForDate(date, reminders) {
    return reminders.filter(r => isSameDay(r.date, date))
  }

  function selectDay(day) {
    selectedDate.value = day.fullDate
  }

  function previousMonth() {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
  }

  function nextMonth() {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
  }

  function goToToday() {
    const today = new Date()
    currentDate.value = new Date(today.getFullYear(), today.getMonth(), 1)
    selectedDate.value = today
  }

  function goToYear(year) {
    currentDate.value = new Date(year, currentDate.value.getMonth(), 1)
  }

  function isCurrentMonth() {
    const now = new Date()
    return currentDate.value.getFullYear() === now.getFullYear() &&
           currentDate.value.getMonth() === now.getMonth()
  }

  function getDateString(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return {
    currentDate,
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
  }
}
