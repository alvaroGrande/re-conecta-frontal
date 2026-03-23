<template>
  <Dialog
    :visible="visible"
    @update:visible="handleClose"
    modal
    :style="{ width: '100%', maxWidth: '28rem' }"
    :draggable="false"
    :header="isEditing ? $t('calendar.editReminder') : $t('calendar.reminderDetail')"
  >
    <div v-if="reminder" class="pt-2 space-y-4">
      <!-- Modo visualización -->
      <template v-if="!isEditing">
        <div
          :class="[
            'rounded-lg border-l-4 p-4',
            reminder.type === 'admin' ? 'border-purple-400 bg-purple-50' : 'border-blue-400 bg-blue-50'
          ]"
        >
          <h4 class="font-semibold text-gray-900 text-base mb-1">{{ reminder.title }}</h4>
          <p v-if="reminder.description" class="text-sm text-gray-600 mb-3">{{ reminder.description }}</p>
          <div class="flex flex-wrap gap-3 text-xs text-gray-500">
            <span class="flex items-center gap-1">
              <i class="pi pi-calendar" />
              {{ formatDate(reminder.date) }}
            </span>
            <span class="flex items-center gap-1">
              <i class="pi pi-clock" />
              {{ reminder.time }}
            </span>
            <span :class="reminder.type === 'admin' ? 'text-purple-600 font-medium' : 'text-blue-600 font-medium'">
              {{ reminder.type === 'admin' ? $t('calendar.adminReminder') : $t('calendar.userReminder') }}
            </span>
            <span v-if="showUserName && reminder.userName">• {{ reminder.userName }}</span>
          </div>
        </div>
      </template>

      <!-- Modo edición -->
      <template v-else>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ $t('calendar.reminderTitle') }}
          </label>
          <InputText v-model="form.title" class="w-full" :placeholder="$t('calendar.titlePlaceholder')" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ $t('calendar.description') }}
          </label>
          <Textarea v-model="form.description" rows="3" class="w-full" :placeholder="$t('calendar.descriptionPlaceholder')" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ $t('calendar.date') }}
          </label>
          <input
            v-model="form.date"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ $t('calendar.time') }}
          </label>
          <input
            v-model="form.time"
            type="time"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </template>
    </div>

    <template #footer>
      <div class="flex justify-between w-full">
        <!-- Botón eliminar (izquierda) -->
        <Button
          v-if="canDelete"
          icon="pi pi-trash"
          :label="$t('calendar.deleteReminder') || 'Eliminar'"
          severity="danger"
          text
          size="small"
          @click="confirmDelete"
        />
        <div v-else />

        <!-- Acciones principales (derecha) -->
        <div class="flex gap-2">
          <Button
            v-if="!isEditing"
            :label="$t('calendar.cancel')"
            severity="secondary"
            size="small"
            @click="handleClose"
          />
          <Button
            v-if="canEdit && !isEditing"
            icon="pi pi-pencil"
            :label="$t('calendar.edit') || 'Editar'"
            size="small"
            @click="startEditing"
          />

          <Button
            v-if="isEditing"
            :label="$t('calendar.cancel')"
            severity="secondary"
            size="small"
            @click="cancelEditing"
          />
          <Button
            v-if="isEditing"
            icon="pi pi-check"
            :label="$t('calendar.save')"
            :loading="saving"
            size="small"
            @click="handleSave"
          />
        </div>
      </div>
    </template>

    <ConfirmDialog group="reminder-detail" />
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConfirm } from 'primevue/useconfirm'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import ConfirmDialog from 'primevue/confirmdialog'

const { t } = useI18n()
const confirm = useConfirm()

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  reminder: {
    type: Object,
    default: null
  },
  currentUserId: {
    type: [Number, String],
    required: true
  },
  isSupervisor: {
    type: Boolean,
    default: false
  },
  showUserName: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'save', 'delete'])

const isEditing = ref(false)
const saving = ref(false)
const form = ref({ title: '', description: '', date: '', time: '' })

const canEdit = computed(() =>
  props.reminder && props.reminder.userId === props.currentUserId
)

const canDelete = computed(() => {
  if (!props.reminder) return false
  if (props.reminder.userId === props.currentUserId) return true
  if (props.isSupervisor && props.reminder.type === 'user') return true
  return false
})

watch(() => props.visible, (val) => {
  if (val && props.reminder) {
    populateForm()
    isEditing.value = false
  }
})

function populateForm() {
  const r = props.reminder
  const y = r.date.getFullYear()
  const m = String(r.date.getMonth() + 1).padStart(2, '0')
  const d = String(r.date.getDate()).padStart(2, '0')
  form.value = {
    title: r.title,
    description: r.description,
    date: `${y}-${m}-${d}`,
    time: r.time
  }
}

function formatDate(date) {
  return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

function startEditing() {
  populateForm()
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
}

function handleClose() {
  isEditing.value = false
  emit('update:visible', false)
}

async function handleSave() {
  if (!form.value.title || !form.value.date || !form.value.time) return
  saving.value = true
  try {
    await emit('save', { id: props.reminder.id, ...form.value })
    isEditing.value = false
  } finally {
    saving.value = false
  }
}

function confirmDelete() {
  confirm.require({
    group: 'reminder-detail',
    message: t('calendar.confirmDelete'),
    header: t('calendar.deleteReminder'),
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: t('calendar.cancel'), severity: 'secondary' },
    acceptProps: { label: t('calendar.delete') || 'Eliminar', severity: 'danger' },
    accept: () => {
      emit('delete', props.reminder.id)
      handleClose()
    }
  })
}
</script>
