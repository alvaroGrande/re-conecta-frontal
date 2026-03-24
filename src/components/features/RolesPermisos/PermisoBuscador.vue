<template>
  <div class="mb-4 relative">
    <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"></i>
    <input
      :value="modelValue"
      type="search"
      placeholder="Buscar permiso por nombre o codigo..."
      class="w-full pl-9 pr-24 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600
             bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200
             focus:outline-none focus:ring-2 focus:ring-blue-500"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <span
      v-if="modelValue.trim()"
      class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400"
    >
      {{ total }} resultado{{ total !== 1 ? 's' : '' }}
    </span>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, required: true },
  total: { type: Number, default: 0 },
})
defineEmits(['update:modelValue'])
</script>
