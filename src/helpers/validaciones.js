// Utilidades de validación de formularios (espejo del backend: src/utils/validaciones.js)

const TABLA_LETRAS_DNI = 'TRWAGMYFPDXBNJZSQVHLCKE'

export const validarEmail = (email) => {
  if (!email) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())
}

/**
 * Valida un DNI o NIE español mediante el algoritmo de letra de control.
 * Campo opcional: si viene vacío, se considera válido.
 */
export const validarDNI = (valor) => {
  if (!valor) return true
  const limpio = String(valor).trim().toUpperCase().replace(/[\s-]/g, '')

  const matchDNI = limpio.match(/^(\d{8})([A-Z])$/)
  const matchNIE = limpio.match(/^([XYZ])(\d{7})([A-Z])$/)

  let numero
  let letra

  if (matchDNI) {
    numero = parseInt(matchDNI[1], 10)
    letra = matchDNI[2]
  } else if (matchNIE) {
    const prefijos = { X: '0', Y: '1', Z: '2' }
    numero = parseInt(prefijos[matchNIE[1]] + matchNIE[2], 10)
    letra = matchNIE[3]
  } else {
    return false
  }

  return TABLA_LETRAS_DNI[numero % 23] === letra
}

/**
 * Valida un teléfono español (fijo o móvil), con o sin prefijo +34.
 * Campo opcional: si viene vacío, se considera válido.
 */
export const validarTelefono = (telefono) => {
  if (!telefono) return true
  const limpio = String(telefono).trim().replace(/[\s-]/g, '')
  return /^(\+34|0034)?[6789]\d{8}$/.test(limpio)
}

/**
 * Valida que una fecha no esté en el futuro.
 * Campo opcional: si viene vacío, se considera válido.
 */
export const validarFechaNacimiento = (fecha) => {
  if (!fecha) return true
  const timestamp = Date.parse(fecha)
  if (Number.isNaN(timestamp)) return false
  return timestamp <= Date.now()
}
