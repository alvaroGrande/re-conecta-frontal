// Mapeo de roles numéricos a nombres
export const ROLES_MAP = {
  1: 'Admin',
  2: 'Instructor',
  3: 'Usuario'
}

export const obtenerNombreRol = (rolId) => {
  return ROLES_MAP[rolId] || 'Desconocido'
}

export const obtenerColorRol = (rolId) => {
  const colores = {
    1: 'bg-red-100 text-red-800',
    2: 'bg-blue-100 text-blue-800',
    3: 'bg-gray-100 text-gray-800'
  }
  return colores[rolId] || 'bg-gray-100 text-gray-800'
}
