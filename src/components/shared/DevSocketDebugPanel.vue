<template>
  <div class="fixed bottom-4 right-4 z-[10000] w-[380px] max-w-[calc(100vw-1rem)] rounded-xl border border-slate-700 bg-slate-900/95 text-slate-100 shadow-2xl">
    <button
      class="w-full rounded-t-xl border-b border-slate-700 px-3 py-2 text-left text-sm font-semibold"
      @click="collapsed = !collapsed"
    >
      WS Debug
      <span
        class="ml-2 inline-block h-2.5 w-2.5 rounded-full"
        :class="state.connected ? 'bg-emerald-400' : 'bg-rose-400'"
      />
      <span class="ml-2 text-xs font-normal text-slate-300">
        {{ state.connected ? 'Conectado' : 'Desconectado' }}
      </span>
    </button>

    <div v-if="!collapsed" class="space-y-2 p-3 text-xs">
      <div class="grid grid-cols-2 gap-2">
        <div>
          <p class="text-slate-400">Socket ID</p>
          <p class="truncate">{{ state.socketId || '-' }}</p>
        </div>
        <div>
          <p class="text-slate-400">Transporte</p>
          <p>{{ state.transport || '-' }}</p>
        </div>
      </div>

      <p v-if="state.lastError" class="rounded bg-rose-900/40 px-2 py-1 text-rose-200">
        Error: {{ state.lastError }}
      </p>

      <div class="flex items-center justify-between">
        <p class="text-slate-400">Eventos ({{ state.events.length }})</p>
        <button
          class="rounded border border-slate-600 px-2 py-1 text-[11px] hover:bg-slate-800"
          @click="clearSocketDebugEvents"
        >
          Limpiar
        </button>
      </div>

      <div class="max-h-64 space-y-1 overflow-auto rounded border border-slate-700 p-2">
        <p v-if="state.events.length === 0" class="text-slate-500">Sin eventos todavía</p>

        <div
          v-for="(event, index) in state.events"
          :key="`${event.at}-${event.event}-${index}`"
          class="rounded border border-slate-700 px-2 py-1"
        >
          <div class="flex items-center gap-2">
            <span
              class="rounded px-1.5 py-0.5 text-[10px] font-semibold"
              :class="event.direction === 'in' ? 'bg-blue-900/60 text-blue-200' : 'bg-amber-900/60 text-amber-200'"
            >
              {{ event.direction === 'in' ? 'IN' : 'OUT' }}
            </span>
            <span class="font-semibold">{{ event.event }}</span>
            <span class="ml-auto text-[10px] text-slate-500">{{ formatTime(event.at) }}</span>
          </div>
          <p class="mt-1 break-words text-slate-300">{{ event.payload }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { clearSocketDebugEvents, subscribeSocketDebug } from '@services/socketService'

const collapsed = ref(false)
const state = ref({
  connected: false,
  socketId: null,
  transport: null,
  lastError: null,
  events: []
})

let unsubscribe = () => {}

const formatTime = (isoDate) => {
  if (!isoDate) return '--:--:--'
  return new Date(isoDate).toLocaleTimeString()
}

onMounted(() => {
  unsubscribe = subscribeSocketDebug((snapshot) => {
    state.value = snapshot
  })
})

onUnmounted(() => {
  unsubscribe()
})
</script>
