import { computed } from 'vue';
import { useAuth } from './useAuth.js';
import { PERMISOS_POR_ROL, PERMISOS, ROLES } from '@/config/permissions.js';

/**
 * Composable para verificar permisos del usuario autenticado.
 * 
 * @example
 * const { puede, esAdmin, esCoordinador } = usePermissions()
 * 
 * // En template:
 * v-if="puede('talleres:crear')"
 * 
 * // Con constante:
 * v-if="puede(PERMISOS.TALLERES_CREAR)"
 */
export function usePermissions() {
  const { usuario } = useAuth();

  /** Permisos del usuario actual cacheados en un Set para búsqueda O(1) */
  const permisosUsuario = computed(() => {
    const rol = usuario.value?.rol;
    return new Set(PERMISOS_POR_ROL[rol] ?? []);
  });

  /**
   * Verifica si el usuario tiene un permiso.
   * @param {string} permiso - Ej: 'talleres:crear' o PERMISOS.TALLERES_CREAR
   * @returns {boolean}
   */
  const puede = (permiso) => permisosUsuario.value.has(permiso);

  /**
   * Verifica si el usuario tiene TODOS los permisos indicados.
   * @param {string[]} listaPermisos
   * @returns {boolean}
   */
  const puedeTodo = (listaPermisos) => listaPermisos.every((p) => permisosUsuario.value.has(p));

  /**
   * Verifica si el usuario tiene AL MENOS UNO de los permisos indicados.
   * @param {string[]} listaPermisos
   * @returns {boolean}
   */
  const puedeAlguno = (listaPermisos) => listaPermisos.some((p) => permisosUsuario.value.has(p));

  const esAdmin = computed(() => usuario.value?.rol === ROLES.ADMINISTRADOR);
  const esCoordinador = computed(() => usuario.value?.rol === ROLES.COORDINADOR);
  const esUsuario = computed(() => usuario.value?.rol === ROLES.USUARIO);

  return {
    puede,
    puedeTodo,
    puedeAlguno,
    permisosUsuario,
    esAdmin,
    esCoordinador,
    esUsuario,
    PERMISOS,
    ROLES,
  };
}
