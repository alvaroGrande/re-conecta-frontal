<template>
  <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
    <div class="flex flex-wrap gap-4 items-center">
      <div class="flex items-center gap-2">
        <input 
          type="checkbox" 
          id="showAdmin" 
          :checked="showAdminReminders"
          @change="$emit('update:showAdminReminders', $event.target.checked)"
          class="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
        />
        <label for="showAdmin" class="text-sm font-medium text-gray-700">
          {{ $t('calendar.showAdminReminders') }}
        </label>
      </div>
      
      <div class="flex items-center gap-2">
        <input 
          type="checkbox" 
          id="showUsers" 
          :checked="showUserReminders"
          @change="$emit('update:showUserReminders', $event.target.checked)"
          class="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
        />
        <label for="showUsers" class="text-sm font-medium text-gray-700">
          {{ $t('calendar.showUserReminders') }}
        </label>
      </div>
      
      <div v-if="showUserReminders" class="flex-1 min-w-[300px] max-w-md">
        <Select
          v-model="internalSelectedUserId"
          :options="userOptions"
          :loading="loading"
          :filter="true"
          :virtualScrollerOptions="{ itemSize: 38 }"
          optionLabel="label"
          optionValue="value"
          :placeholder="$t('calendar.allUsers')"
          :filterPlaceholder="$t('calendar.searchUser')"
          :emptyFilterMessage="$t('calendar.noUsersFound')"
          @filter="onFilter"
          showClear
          class="w-full"
        >
          <template #value="slotProps">
            <div v-if="slotProps.value" class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-600">
                {{ getUserInitials(slotProps.value) }}
              </div>
              <span>{{ getUserLabel(slotProps.value) }}</span>
            </div>
            <span v-else>{{ slotProps.placeholder }}</span>
          </template>
          
          <template #option="slotProps">
            <div class="flex items-center gap-2 py-1">
              <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-600">
                {{ slotProps.option.initials }}
              </div>
              <div>
                <div class="font-medium text-gray-900">{{ slotProps.option.nombre }}</div>
                <div class="text-xs text-gray-500">{{ slotProps.option.email }}</div>
              </div>
            </div>
          </template>
        </Select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Select from 'primevue/select'
import { debounce } from 'lodash-es'
import api from '@services/api'

const props = defineProps({
  showAdminReminders: {
    type: Boolean,
    default: true
  },
  showUserReminders: {
    type: Boolean,
    default: true
  },
  selectedUserId: {
    type: [String, Number],
    default: ''
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:showAdminReminders', 'update:showUserReminders', 'update:selectedUserId'])

const loading = ref(false)
const users = ref([])
const searchQuery = ref('')

const internalSelectedUserId = computed({
  get: () => props.selectedUserId,
  set: (value) => emit('update:selectedUserId', value || '')
})

const userOptions = computed(() => {
  return users.value.map(user => ({
    value: user.id,
    label: `${user.nombre} ${user.Apellidos || ''}`.trim(),
    nombre: `${user.nombre} ${user.Apellidos || ''}`.trim(),
    email: user.email,
    initials: getInitials(user)
  }))
})

const getInitials = (user) => {
  const nombre = user.nombre?.[0] || ''
  const apellido = user.Apellidos?.[0] || ''
  return `${nombre}${apellido}`.toUpperCase()
}

const getUserInitials = (userId) => {
  const user = users.value.find(u => u.id === userId)
  return user ? getInitials(user) : '?'
}

const getUserLabel = (userId) => {
  const user = users.value.find(u => u.id === userId)
  return user ? `${user.nombre} ${user.Apellidos || ''}`.trim() : ''
}

const loadUsers = async (query = '') => {
  try {
    loading.value = true
    const params = {
      limit: 50
    }
    
    if (query) {
      params.name = query
    }
    
    const response = await api.get('/usuarios', { params })
    users.value = response.data.data || []
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
    users.value = []
  } finally {
    loading.value = false
  }
}

const debouncedLoadUsers = debounce((query) => {
  loadUsers(query)
}, 300)

const onFilter = (event) => {
  const query = event.value || ''
  searchQuery.value = query
  debouncedLoadUsers(query)
}

// Cargar usuarios inicialmente
loadUsers()
</script>

<style scoped>
:deep(.p-select) {
  min-height: 38px;
}

:deep(.p-select-overlay) {
  max-width: 500px;
}
</style>
