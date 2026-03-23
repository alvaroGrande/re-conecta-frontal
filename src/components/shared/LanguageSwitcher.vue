<template>
  <div class="flex items-center gap-2">
    <Select 
      v-model="currentLocale" 
      :options="languages" 
      optionLabel="label" 
      optionValue="code"
      @change="changeLocale"
      :pt="{
        root: { class: 'w-auto !bg-transparent border-slate-600' },
        input: { class: 'py-2 !bg-transparent !text-white' },
        trigger: { class: '!bg-transparent' },
        panel: { class: 'bg-slate-800 border-slate-600' },
        list: { class: 'bg-slate-800' },
        option: { class: 'text-gray-300 hover:bg-slate-700' }
      }"
    >
      <template #value="slotProps">
        <div class="flex items-center gap-2 text-white">
          <i class="pi pi-globe"></i>
          <span>{{ getLanguageLabel(slotProps.value) }}</span>
        </div>
      </template>
      <template #option="slotProps">
        <div class="flex items-center gap-2">
          <span>{{ slotProps.option.flag }}</span>
          <span>{{ slotProps.option.label }}</span>
        </div>
      </template>
    </Select>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Select from 'primevue/select'

const { locale } = useI18n()
const currentLocale = ref(locale.value)

const languages = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'ca', label: 'Català', flag: '🏴' },
  { code: 'gl', label: 'Galego', flag: '🏴' },
  { code: 'en', label: 'English', flag: '🇬🇧' }
]

const getLanguageLabel = (code) => {
  const lang = languages.find(l => l.code === code)
  return lang ? lang.label : code
}

const changeLocale = () => {
  locale.value = currentLocale.value
  localStorage.setItem('locale', currentLocale.value)
}

watch(locale, (newLocale) => {
  currentLocale.value = newLocale
})
</script>
