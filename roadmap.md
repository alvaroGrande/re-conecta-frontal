# Roadmap de Futuras Mejoras — reConecta

## 1. Objetivo del roadmap
Este documento define una hoja de ruta de evolución funcional y técnica de la plataforma reConecta para los próximos ciclos.
La intención es:
- Priorizar mejoras con impacto real en usuarios y coordinación.
- Alinear equipo de producto, frontend y backend.
- Medir progreso por hitos y entregables verificables.

---

## 2. Principios de priorización
Se prioriza por:
1. Impacto en usuario final (adopción, retención, valor percibido).
2. Reducción de carga operativa del equipo coordinador/admin.
3. Esfuerzo técnico y riesgo de implementación.
4. Reutilización de componentes existentes (talleres, encuestas, notificaciones, permisos, LOV).

Escala usada:
- Impacto: Alto / Medio / Bajo
- Esfuerzo: Alto / Medio / Bajo
- Prioridad final: P1 / P2 / P3

---

## 3. Iniciativas propuestas (detalle)

## 3.1 Auditoría visible y trazabilidad funcional
**Descripción**
Mostrar en interfaz quién creó, modificó y cuándo los objetos críticos:
- Talleres
- LOV (List of Values)
- Encuestas
- Roles/permisos

**Problema que resuelve**
Actualmente parte de la trazabilidad existe en BD, pero no es visible ni explotable para soporte y gobernanza.

**Alcance**
- Etiquetas de auditoría en vistas detalle y tablas.
- Sección “Actividad reciente”.
- Filtros por usuario/fecha/entidad.

**Impacto**
Alto.

**Esfuerzo**
Medio.

**Dependencias**
- Campos de auditoría consistentes en todas las entidades.
- Endpoints con metadatos de auditoría.

**Métricas de éxito**
- 100% de entidades clave muestran metadatos de auditoría.
- Reducción de incidencias “¿quién cambió esto?” > 70%.

---

## 3.2 Dashboard operativo en tiempo real
**Descripción**
Crear panel con KPIs de operación:
- Ocupación por taller.
- Ratio inscripción/asistencia.
- Cancelaciones y motivos.
- Tasa de respuesta de encuestas.
- Documentos subidos por periodo.

**Problema que resuelve**
No hay visión centralizada para decisiones rápidas de coordinación.

**Alcance**
- Widgets KPI.
- Filtros por rango de fecha, tipo de taller, rol organizador.
- Tendencias (semana/mes/trimestre).

**Impacto**
Alto.

**Esfuerzo**
Medio-Alto.

**Dependencias**
- Índices y consultas optimizadas.
- Normalización de eventos (inscripción, cancelación, encuestas).

**Métricas de éxito**
- Dashboard carga < 2s.
- Uso recurrente semanal por admin/coordinadores > 80%.

---

## 3.3 Lista de espera automática en talleres
**Descripción**
Si el taller está completo, permitir entrar en “lista de espera”.
Cuando hay baja:
- Promoción automática del siguiente usuario.
- Notificación inmediata.

**Problema que resuelve**
Pérdida de plazas por cancelaciones tardías y gestión manual.

**Alcance**
- Tabla `talleres_espera`.
- Reglas de priorización (FIFO inicial).
- Notificaciones automatizadas + expiración de aceptación.

**Impacto**
Alto.

**Esfuerzo**
Medio.

**Dependencias**
- Sistema de notificaciones fiable.
- Manejo de concurrencia en inscripciones.

**Métricas de éxito**
- Reducción de plazas vacías > 40%.
- Tiempo de relleno de vacante < 10 min.

---

## 3.4 Recordatorios inteligentes
**Descripción**
Motor de recordatorios configurable:
- Antes de taller (24h, 1h, 10 min).
- Post-taller (encuesta automática).
- Reintentos si no se entrega.

**Problema que resuelve**
No-show elevado y baja tasa de feedback post actividad.

**Alcance**
- Configuración por tipo de evento.
- Plantillas parametrizables.
- Cola de envíos y trazabilidad de entrega.

**Impacto**
Alto.

**Esfuerzo**
Medio-Alto.

**Dependencias**
- Workers/tareas programadas.
- Plantillas de notificación.

**Métricas de éxito**
- Reducción de no-show > 20%.
- Incremento de encuestas respondidas > 30%.

---

## 3.5 Plantillas reutilizables (Talleres y Encuestas)
**Descripción**
Permitir guardar configuración como plantilla para reutilización rápida.

**Problema que resuelve**
Creación repetitiva de talleres y encuestas similares.

**Alcance**
- CRUD de plantillas.
- Duplicar desde plantilla.
- Versionado simple por plantilla.

**Impacto**
Medio-Alto.

**Esfuerzo**
Medio.

**Dependencias**
- Modelo base común de formularios.
- Permisos por rol para gestionar plantillas.

**Métricas de éxito**
- Tiempo medio de creación reducido > 50%.
- 60% de altas usando plantillas al mes 2.

---

## 3.6 Centro de notificaciones unificado
**Descripción**
Inbox único con:
- Filtros (tipo, leídas/no leídas, entidad).
- Acciones rápidas contextuales.
- Agrupación por día/prioridad.

**Problema que resuelve**
Fragmentación de avisos y baja trazabilidad de acciones.

**Alcance**
- UI de bandeja.
- Marca masiva como leídas.
- Deep links a entidad relacionada.

**Impacto**
Medio-Alto.

**Esfuerzo**
Medio.

**Dependencias**
- Modelo de notificación consolidado.
- Enlaces de navegación robustos.

**Métricas de éxito**
- Tasa de apertura > 75%.
- Tiempo de respuesta a alertas críticas < 1h.

---

## 3.7 Búsqueda global
**Descripción**
Barra de búsqueda global para usuarios, talleres, encuestas, documentos.

**Problema que resuelve**
Navegación lenta y dependencia del conocimiento previo de ubicación.

**Alcance**
- Endpoint único de búsqueda con ranking básico.
- UI con resultados agrupados por entidad.
- Atajo de teclado (Ctrl/Cmd + K).

**Impacto**
Medio.

**Esfuerzo**
Medio.

**Dependencias**
- Índices adecuados.
- Contrato común de resultados.

**Métricas de éxito**
- Tiempo promedio para encontrar entidad < 10s.
- Uso semanal > 50% de usuarios administrativos.

---

## 3.8 Versionado de documentos PDF de talleres
**Descripción**
Guardar histórico de versiones de documentos por taller con etiqueta de cambios.

**Problema que resuelve**
Se sobrescriben documentos y se pierde historial de cambios.

**Alcance**
- Tabla de versiones.
- Marca de versión vigente.
- Descarga de histórico.

**Impacto**
Medio.

**Esfuerzo**
Medio.

**Dependencias**
- Estructura de storage por ruta/version.
- Política de retención.

**Métricas de éxito**
- 100% documentos críticos con histórico accesible.
- Reducción de incidencias por “archivo incorrecto”.

---

## 3.9 Evaluación post-taller automática
**Descripción**
Generar encuesta vinculada al taller al finalizar, con envío automático.

**Problema que resuelve**
Feedback tardío o inexistente tras actividades.

**Alcance**
- Trigger por fecha fin de taller.
- Enlace único por participante.
- Reporte agregado por taller.

**Impacto**
Medio-Alto.

**Esfuerzo**
Medio.

**Dependencias**
- Módulo encuestas.
- Motor recordatorios.

**Métricas de éxito**
- Tasa de respuesta post-taller > 50%.
- Tiempo medio de recolección < 72h.

---

## 3.10 Recomendador básico de talleres (fase IA inicial)
**Descripción**
Sugerencias de talleres por perfil/intereses/historial de participación.

**Problema que resuelve**
Baja personalización y descubrimiento de actividades.

**Alcance**
- Reglas iniciales (no ML complejo al inicio).
- Ranking por afinidad.
- Tarjeta “Recomendado para ti”.

**Impacto**
Medio.

**Esfuerzo**
Medio.

**Dependencias**
- Datos de perfil y comportamiento.
- Eventos de interacción.

**Métricas de éxito**
- CTR de recomendaciones > 15%.
- Incremento de inscripciones en usuarios recurrentes > 10%.

---

## 4. Roadmap por fases (12 meses)

## Fase 1 (0-3 meses) — “Base operativa”
Objetivo: mejorar control y operación diaria.

**Entregables**
- Auditoría visible.
- Dashboard operativo v1.
- Lista de espera automática.
- Recordatorios básicos.

**Hitos**
- H1: Modelo de auditoría completo + endpoints.
- H2: Dashboard v1 en producción.
- H3: Waitlist funcionando con promoción automática.

---

## Fase 2 (3-6 meses) — “Productividad y escalabilidad”
Objetivo: reducir trabajo manual y acelerar ejecución.

**Entregables**
- Plantillas reutilizables.
- Centro de notificaciones unificado.
- Búsqueda global.
- Versionado de documentos.

**Hitos**
- H4: Plantillas operativas para talleres/encuestas.
- H5: Inbox de notificaciones con acciones rápidas.
- H6: Búsqueda global con atajo.

---

## Fase 3 (6-9 meses) — “Calidad de experiencia”
Objetivo: mejorar feedback continuo y cierre de ciclo.

**Entregables**
- Encuesta post-taller automática.
- KPIs avanzados de satisfacción.
- Reglas de inscripción avanzadas.

**Hitos**
- H7: NPS/feedback post-taller desplegado.
- H8: Cuadro de calidad por actividad y coordinador.

---

## Fase 4 (9-12 meses) — “Personalización e inteligencia”
Objetivo: diferenciación y valor predictivo.

**Entregables**
- Recomendador básico de talleres.
- Resumen inteligente de resultados de encuestas.
- Asistente guiado para creación de actividades.

**Hitos**
- H9: Recomendaciones personalizadas en Home.
- H10: Asistente operativo para coordinadores.

---

## 5. Riesgos y mitigaciones

1. **Riesgo**: crecimiento de complejidad en permisos.  
   **Mitigación**: matriz de permisos centralizada + pruebas de autorización por endpoint.

2. **Riesgo**: degradación de rendimiento en dashboard/búsqueda.  
   **Mitigación**: índices, caché, paginación y métricas de consultas lentas.

3. **Riesgo**: baja adopción de nuevas funcionalidades.  
   **Mitigación**: onboarding in-app, feature flags, rollout progresivo.

4. **Riesgo**: inconsistencia entre LOV y validaciones de BD.  
   **Mitigación**: validación backend contra LOV + eliminación de constraints hardcodeados.

---

## 6. KPIs transversales del roadmap
- Tiempo medio de gestión por taller.
- Tasa de asistencia real.
- Tasa de respuesta de encuestas.
- Tiempo de resolución de incidencias operativas.
- Satisfacción de usuarios/coordinadores.
- Adopción de funcionalidades nuevas (% usuarios activos por feature).

---

## 7. Próximos pasos inmediatos (30 días)
1. Cerrar alcance técnico de Fase 1.
2. Definir backlog por épicas/historias con estimación.
3. Implementar métricas base (baseline) para comparar impacto.
4. Planificar release incremental (feature flags + pilotos).