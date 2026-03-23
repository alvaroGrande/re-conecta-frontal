<template>
  <div class="bg-white rounded-lg shadow-sm p-6 sticky top-4">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">
      {{ formattedDate }}
    </h3>
    
    <div v-if="reminders.length === 0" class="text-center py-8 text-gray-500">
      <svg class="w-16 h-16 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p class="text-sm">{{ $t('calendar.noReminders') }}</p>
    </div>

    <div v-else class="space-y-3 max-h-96 overflow-y-auto">
      <div
        v-for="reminder in reminders"
        :key="reminder.id"
        :class="[
          'p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-shadow',
          getReminderBorderColor(reminder.type)
        ]"
        @click="$emit('view', reminder)"
      >
        <div class="flex items-start justify-between mb-1">
          <h4 class="font-medium text-gray-900 text-sm">{{ reminder.title }}</h4>
          <Button
            v-if="canDelete(reminder)"
            icon="pi pi-trash"
            severity="danger"
            text
            rounded
            size="small"
            :aria-label="$t('calendar.deleteReminder')"
            @click.stop="confirmDelete(reminder.id)"
          />
        </div>
        <p class="text-xs text-gray-600 mb-2">{{ reminder.description }}</p>
        <div class="flex items-center gap-2 text-xs">
          <span :class="getTypeColor(reminder.type)">
            {{ getTypeLabel(reminder.type) }}
          </span>
          <span v-if="showUserName && reminder.userName" class="text-gray-500">
            • {{ reminder.userName }}
          </span>
          <span class="text-gray-500">{{ reminder.time }}</span>
        </div>
      </div>
    </div>
  </div>

  <ConfirmDialog />
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useConfirm } from 'primevue/useconfirm'
import Button from 'primevue/button'
import ConfirmDialog from 'primevue/confirmdialog'

const { t } = useI18n()
const confirm = useConfirm()

const props = defineProps({
  reminders: {
    type: Array,
    required: true
  },
  formattedDate: {
    type: String,
    required: true
  },
  showUserName: {
    type: Boolean,
    default: false
  },
  currentUserId: {
    type: [Number, String],
    required: true
  },
  isSupervisor: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['delete', 'view'])

function getReminderBorderColor(type) {
  return type === 'admin' 
    ? 'border-purple-400 bg-purple-50' 
    : 'border-blue-400 bg-blue-50'
}

function getTypeColor(type) {
  return type === 'admin'
    ? 'text-purple-600 font-medium'
    : 'text-blue-600 font-medium'
}

function getTypeLabel(type) {
  return type === 'admin' ? t('calendar.adminReminder') : t('calendar.userReminder')
}

function canDelete(reminder) {
  // Los usuarios solo pueden borrar sus propios recordatorios
  // Los supervisores pueden borrar recordatorios de usuarios pero no de admin
  if (reminder.userId === props.currentUserId) return true
  if (props.isSupervisor && reminder.type === 'user') return true
  return false
}

function confirmDelete(id) {
  confirm.require({
    message: t('calendar.confirmDelete'),
    header: t('calendar.deleteReminder'),
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: t('calendar.cancel'),
      severity: 'secondary'
    },
    acceptProps: {
      label: t('calendar.delete') || 'Eliminar',
      severity: 'danger'
    },
    accept: () => emit('delete', id)
  })
}
</script>
