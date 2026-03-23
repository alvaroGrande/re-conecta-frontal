<template>
  <div
    @click="$emit('select', day)"
    :class="[
      'min-h-20 p-2 border rounded-lg cursor-pointer transition-all duration-200',
      day.isCurrentMonth ? 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm' : 'bg-gray-50 border-gray-100 text-gray-400',
      day.isToday ? 'ring-2 ring-indigo-500' : '',
      day.isSelected && !day.isToday ? 'bg-indigo-50 border-indigo-400' : ''
    ]"
  >
    <div
      :class="[
        'font-medium text-sm mb-1 w-6 h-6 flex items-center justify-center rounded-full',
        day.isToday ? 'bg-indigo-600 text-white' : ''
      ]"
    >{{ day.date }}</div>
    <div class="space-y-1">
      <div
        v-for="reminder in day.reminders.slice(0, 2)"
        :key="reminder.id"
        :class="[
          'text-xs px-2 py-1 rounded truncate',
          getReminderColor(reminder.type)
        ]"
        :title="reminder.title"
      >
        {{ reminder.title }}
      </div>
      <div v-if="day.reminders.length > 2" class="text-xs text-gray-500 px-2">
        +{{ day.reminders.length - 2 }} más
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  day: {
    type: Object,
    required: true
  }
})

defineEmits(['select'])

function getReminderColor(type) {
  return type === 'admin' 
    ? 'bg-purple-100 text-purple-700' 
    : 'bg-blue-100 text-blue-700'
}
</script>
