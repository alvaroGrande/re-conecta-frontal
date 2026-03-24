/**
 * Directiva Vue v-permission
 * Oculta un elemento del DOM si el usuario no tiene el permiso requerido.
 * 
 * Registro global en main.js: app.directive('permission', vPermission)
 * 
 * @example
 * <!-- Ocultar botón si no tiene permiso -->
 * <Button v-permission="'talleres:crear'" label="Nuevo taller" />
 * 
 * <!-- Con constante importada -->
 * <Button v-permission="PERMISOS.TALLERES_CREAR" label="Nuevo taller" />
 * 
 * <!-- Modo bloqueo: deshabilita el elemento en vez de ocultarlo -->
 * <Button v-permission.disable="'talleres:crear'" label="Nuevo taller" />
 */

import { PERMISOS_POR_ROL } from '@/config/permissions.js';

function getPermisos() {
  try {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    return new Set(PERMISOS_POR_ROL[usuario.rol] ?? []);
  } catch {
    return new Set();
  }
}

export const vPermission = {
  mounted(el, binding) {
    const permiso = binding.value;
    const permisos = getPermisos();

    if (!permisos.has(permiso)) {
      if (binding.modifiers.disable) {
        // Deshabilitar en vez de ocultar
        el.setAttribute('disabled', 'true');
        el.style.opacity = '0.5';
        el.style.pointerEvents = 'none';
        el.setAttribute('aria-disabled', 'true');
      } else {
        // Ocultar del DOM completamente
        el.style.display = 'none';
      }
    }
  },

  updated(el, binding) {
    const permiso = binding.value;
    const permisos = getPermisos();
    const tienePermiso = permisos.has(permiso);

    if (binding.modifiers.disable) {
      if (tienePermiso) {
        el.removeAttribute('disabled');
        el.style.opacity = '';
        el.style.pointerEvents = '';
        el.removeAttribute('aria-disabled');
      } else {
        el.setAttribute('disabled', 'true');
        el.style.opacity = '0.5';
        el.style.pointerEvents = 'none';
        el.setAttribute('aria-disabled', 'true');
      }
    } else {
      el.style.display = tienePermiso ? '' : 'none';
    }
  },
};
