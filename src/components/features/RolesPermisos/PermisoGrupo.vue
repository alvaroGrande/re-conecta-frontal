<template>
  <tbody>
    <!-- Cabecera de grupo — clickable para colapsar -->
    <tr
      class="bg-gray-50 dark:bg-slate-700/50 cursor-pointer select-none
             hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
      @click="$emit('toggle', grupo.label)"
    >
      <td colspan="4" class="py-2.5 px-6">
        <div class="flex items-center justify-between">
          <span class="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <i :class="grupo.icon"></i>
            {{ grupo.label }}
            <span class="font-normal normal-case tracking-normal text-gray-400 dark:text-gray-500">
              ({{ grupo.permisosFiltrados.length }})
            </span>
          </span>
          <i
            :class="abierto ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"
            class="text-[10px] text-gray-400 dark:text-gray-500 transition-transform"
          ></i>
        </div>
      </td>
    </tr>

    <!-- Filas de permisos -->
    <template v-if="abierto">
      <tr
        v-for="item in grupo.permisosFiltrados"
        :key="item.permiso"
        class="border-t border-gray-100 dark:border-slate-700/40
               hover:bg-gray-50/50 dark:hover:bg-slate-700/20 transition-colors"
      >
        <!-- Descripcion + codigo -->
        <td class="py-3 px-6 text-gray-700 dark:text-gray-300">
          <div class="flex flex-col gap-0.5">
            <span v-html="item.descripcionHtml"></span>
            <code class="text-[10px] text-gray-400 dark:text-gray-500" v-html="item.permisoHtml"></code>
          </div>
        </td>

        <!-- Administrador: siempre activo, bloqueado -->
        <td class="py-3 px-6 text-center">
          <input
            type="checkbox"
            checked
            disabled
            class="w-4 h-4 cursor-not-allowed opacity-40"
            title="El Administrador siempre tiene todos los permisos"
          />
        </td>

        <!-- Coordinador -->
        <td class="py-3 px-6 text-center">
          <input
            type="checkbox"
            :checked="tienePermiso(2, item.permiso)"
            class="w-4 h-4 cursor-pointer accent-blue-600"
            @change="$emit('toggle-permiso', 2, item.permiso)"
          />
        </td>

        <!-- Usuario -->
        <td class="py-3 px-6 text-center">
          <input
            type="checkbox"
            :checked="tienePermiso(3, item.permiso)"
            class="w-4 h-4 cursor-pointer accent-blue-600"
            @change="$emit('toggle-permiso', 3, item.permiso)"
          />
        </td>
      </tr>
    </template>
  </tbody>
</template>

<script setup>
defineProps({
  grupo: { type: Object, required: true },
  abierto: { type: Boolean, required: true },
  tienePermiso: { type: Function, required: true },
})

defineEmits(['toggle', 'toggle-permiso'])
</script>
