<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    modal
    :header="$t('calendar.newReminder')"
    :style="{ width: '100%', maxWidth: '28rem' }"
    :draggable="false"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4 pt-2">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ $t('calendar.reminderTitle') }}
        </label>
        <InputText
          v-model="formData.title"
          required
          class="w-full"
          :placeholder="$t('calendar.titlePlaceholder')"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ $t('calendar.description') }}
        </label>
        <Textarea
          v-model="formData.description"
          rows="3"
          class="w-full"
          :placeholder="$t('calendar.descriptionPlaceholder')"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ $t('calendar.date') }}
        </label>
        <input
          v-model="formData.date"
          type="date"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ $t('calendar.time') }}
        </label>
        <input
          v-model="formData.time"
          type="time"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>
    </form>

    <template #footer>
      <Button
        :label="$t('calendar.cancel')"
        severity="secondary"
        @click="$emit('update:visible', false)"
      />
      <Button
        :label="$t('calendar.save')"
        @click="handleSubmit"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  initialDate: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:visible', 'save'])

const formData = ref({
  title: '',
  description: '',
  date: '',
  time: ''
})

watch(() => props.visible, (newValue) => {
  if (newValue) {
    formData.value = {
      title: '',
      description: props.initialDate ? '' : '',
      date: props.initialDate || '',
      time: ''
    }
  }
})

function handleSubmit() {
  if (!formData.value.title || !formData.value.date || !formData.value.time) return
  emit('save', { ...formData.value })
  emit('update:visible', false)
}
</script>
