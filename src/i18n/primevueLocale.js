/**
 * Detecta el primer día de la semana según el locale del navegador.
 * Intl.Locale.weekInfo: 1=Lun … 7=Dom (ISO)
 * PrimeVue firstDayOfWeek:  0=Dom, 1=Lun … 6=Sáb
 */
function detectFirstDayOfWeek() {
  try {
    const locale = new Intl.Locale(navigator.language ?? 'es');
    const info = locale.weekInfo ?? locale.getWeekInfo?.();
    if (info?.firstDay !== undefined) {
      return info.firstDay === 7 ? 0 : info.firstDay; // ISO 7 (Dom) → PrimeVue 0
    }
  } catch { /* browser sin soporte */ }
  // Fallback: domingo para en-US / en-CA, lunes para el resto
  const lang = (navigator.language ?? 'es').toLowerCase();
  return (lang === 'en-us' || lang === 'en-ca') ? 0 : 1;
}

export const primevueLocale = {
  firstDayOfWeek: detectFirstDayOfWeek(),
  dayNames:        ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
  dayNamesShort:   ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
  dayNamesMin:     ['Do','Lu','Ma','Mi','Ju','Vi','Sá'],
  monthNames:      ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  monthNamesShort: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
  today:           'Hoy',
  clear:           'Limpiar',
  weekHeader:      'Sem',
  am:              'AM',
  pm:              'PM',
};
