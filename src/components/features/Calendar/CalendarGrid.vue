<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <!-- Navegación del mes -->
    <div class="flex items-center justify-between mb-6">
      <button 
        @click="$emit('previous-month')" 
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        :aria-label="$t('calendar.previousMonth')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div class="flex items-center gap-3">
        <h2 class="text-xl font-semibold text-gray-900">{{ monthName }}</h2>
        <Select
          :model-value="year"
          :options="yearOptions"
          @update:model-value="$emit('go-to-year', $event)"
          :pt="{ root: { class: 'text-base font-semibold text-gray-900 border-0 bg-transparent shadow-none p-0 min-w-0' } }"
          class="font-semibold text-gray-900"
        />
        <button
          v-if="!isCurrentMonth"
          @click="$emit('go-to-today')"
          class="text-xs px-2 py-1 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
        >
          {{ $t('calendar.today') || 'Hoy' }}
        </button>
      </div>
      <button 
        @click="$emit('next-month')" 
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        :aria-label="$t('calendar.nextMonth')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Días de la semana -->
    <div class="grid grid-cols-7 gap-2 mb-2">
      <div 
        v-for="day in weekDays" 
        :key="day" 
        class="text-center text-sm font-medium text-gray-600 py-2"
      >
        {{ day }}
      </div>
    </div>

    <!-- Días del mes -->
    <div class="grid grid-cols-7 gap-2">
      <CalendarDay
        v-for="day in days"
        :key="day.key"
        :day="day"
        @select="$emit('select-day', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CalendarDay from './CalendarDay.vue'
import Select from 'primevue/select'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  days: {
    type: Array,
    required: true
  },
  weekDays: {
    type: Array,
    required: true
  },
  monthName: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  isCurrentMonth: {
    type: Boolean,
    default: true
  }
})

const yearOptions = computed(() => {
  const current = props.year
  const years = []
  for (let y = current - 10; y <= current + 10; y++) years.push(y)
  return years
})

defineEmits(['previous-month', 'next-month', 'select-day', 'go-to-today', 'go-to-year'])
</script>
