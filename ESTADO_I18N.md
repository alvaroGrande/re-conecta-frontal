# Estado de Internacionalización (i18n) - reConecta

## ✅ Trabajo Completado

### 1. Archivos de Traducción Actualizados
Se han ampliado los 4 archivos de idioma con más de **200 claves de traducción**:

- **es.json** (Español) - ✅ Completo
- **ca.json** (Catalán) - ✅ Completo
- **gl.json** (Gallego) - ✅ Completo
- **en.json** (Inglés) - ✅ Completo

### 2. Nuevas Secciones de Traducción Añadidas

#### Dashboard
- `dashboard.stats.*` - Estadísticas (Total Usuarios, Conectados Ahora, Talleres, Encuestas)
- `dashboard.connectedUsers.*` - Usuarios conectados en tiempo real
- `dashboard.recentActivity.*` - Actividad reciente del sistema

#### Autenticación
- `auth.loginTitle`, `auth.loginSubtitle` - Títulos del login
- `auth.user`, `auth.userPlaceholder` - Campo de usuario
- `auth.showPassword`, `auth.hidePassword` - Visibilidad de contraseña
- `auth.forgotPassword`, `auth.loggingIn` - Estados y enlaces

#### Perfil
- `profile.title`, `profile.subtitle` - Cabecera
- `profile.photo.*` - Gestión de foto de perfil
- `profile.personalInfo.*` - Información personal (nombre, apellidos, email, teléfono)
- `profile.security.*` - Sección de seguridad
- `profile.roleInfo.*` - Información del rol

#### Layout y Componentes Comunes
- `inactivity.*` - Modal de sesión inactiva
- `impersonation.*` - Banner de impersonación
- `footer.*` - Pie de página

#### Usuarios, Talleres, Encuestas, Notificaciones, Contactos
- Claves extendidas para búsqueda, estados, acciones
- Mensajes de "no hay datos disponibles"

#### Errores y Mensajes
- `errors.*` - Validaciones (required, invalidEmail, minLength, etc.)
- `messages.*` - Operaciones (success, error, saved, deleted, created, updated)

### 3. Componentes Vue Traducidos ✅

#### Dashboard
- ✅ **EstadisticasCards.vue** - Tarjetas de estadísticas principales
  - Total Usuarios, Conectados Ahora, Talleres Activos, Encuestas Activas
  - Textos traducidos: "activos hoy", "este mes", "respuestas totales"
  
- ✅ **UsuariosConectadosTabla.vue** - Tabla de usuarios conectados
  - Título, botón de actualizar, cabeceras de tabla
  - Estados: "En línea", "Nunca", "Ahora mismo", "Hace X minutos/horas"
  - **Formateo dinámico de fechas** según idioma actual
  
- ✅ **ActividadReciente.vue** - Panel de actividad reciente
  - Título y mensaje de "no hay actividad"

#### Páginas Principales
- ✅ **Login.vue** - Página de inicio de sesión
  - Título y subtítulo
  - Labels: Usuario, Contraseña
  - Placeholders traducidos
  - Checkbox "Recordarme"
  - Link "¿Olvidaste la contraseña?"
  - Botones: "Entrar", "Verificando…"
  - **Validaciones traducidas** con useI18n

- ✅ **Perfil.vue** - Página de perfil de usuario
  - Sección de foto de perfil (seleccionar, guardar, cancelar)
  - Información personal (nombre, apellidos, email, teléfono)
  - **Roles dinámicos traducidos** (Administrador, Instructor, Usuario)
  - **Formateo de fecha** según idioma (Miembro desde)
  - Botones de acción

#### Componentes de Layout
- ✅ **Header.vue** - Navegación principal (completado anteriormente)
- ✅ **Footer.vue** - Pie de página
  - Descripción de la plataforma
  - Copyright y derechos reservados
  
- ✅ **InactivityWarningModal.vue** - Modal de sesión inactiva
  - Título, mensaje con contador dinámico
  - Botón "Continuar"
  
- ✅ **ImpersonationBanner.vue** - Banner de impersonación
  - Mensaje de "Vista de usuario impersonado"
  - Botón "Volver a mi cuenta"

### 4. Características Avanzadas Implementadas

#### Formateo Dinámico de Fechas
Los componentes usan `locale.value` para formatear fechas según el idioma:
- **Español**: "es-ES" → "15 de dic, 10:30"
- **Catalán**: "ca-ES" → "15 de des, 10:30"
- **Gallego**: "gl-ES" → "15 de dec, 10:30"
- **Inglés**: "en-US" → "Dec 15, 10:30 AM"

#### Interpolación de Variables
Mensajes dinámicos con parámetros:
```javascript
t('dashboard.connectedUsers.minutesAgo', { count: 5 }) // "Hace 5 minutos"
t('dashboard.stats.activeToday', { count: 12 }) // "12 activos hoy"
```

#### Roles Dinámicos
Los nombres de roles se traducen en tiempo real:
```javascript
const rolTexto = computed(() => {
  const rolesMap = {
    1: t('users.roles.admin'),      // Administrador / Administrator
    2: t('users.roles.instructor'),  // Instructor
    3: t('users.roles.user')         // Usuario / User
  }
  return rolesMap[usuario.value.rol]
})
```

## 📋 Componentes Pendientes de Traducir

### Alta Prioridad
1. **Usuarios**
   - [ ] UsuariosLista.vue
   - [ ] EditarUsuarioModal.vue
   
2. **Talleres**
   - [ ] NuevoTallerForm.vue
   - [ ] TalleresLista.vue (si existe)
   
3. **Encuestas**
   - [ ] EncuestasLista.vue
   - [ ] EncuestaCard.vue
   - [ ] CrearEncuestaForm.vue
   - [ ] EncuestaFormulario.vue
   - [ ] EncuestaResultados.vue
   
4. **Notificaciones**
   - [ ] NotificacionesPanel.vue
   - [ ] EnviarNotificacionModal.vue

### Prioridad Media
5. **Páginas**
   - [ ] Home.vue
   - [ ] Dashboard.vue (página principal)
   - [ ] Talleres.vue (página)
   - [ ] Encuestas.vue (página)
   - [ ] Usuarios.vue (página)
   - [ ] Contact.vue
   - [ ] About.vue

6. **Contactos**
   - [ ] ContactosLista.vue (si existe)
   - [ ] ContactoCard.vue (si existe)

### Componentes Compartidos
7. **Shared**
   - [ ] CategoriaBadge.vue
   - [ ] HelloWorld.vue (probablemente no necesario)

## 🔧 Instrucciones para Continuar

### Patrón a Seguir

1. **Identificar textos hardcodeados**
   ```vue
   <!-- ❌ Antes -->
   <h1>Crear Usuario</h1>
   
   <!-- ✅ Después -->
   <h1>{{ $t('users.create') }}</h1>
   ```

2. **Añadir claves a archivos de traducción**
   ```json
   // es.json
   "users": {
     "create": "Crear Usuario"
   }
   
   // en.json
   "users": {
     "create": "Create User"
   }
   ```

3. **Importar useI18n si es necesario en script**
   ```javascript
   import { useI18n } from 'vue-i18n'
   const { t, locale } = useI18n()
   ```

4. **Traducir validaciones y mensajes dinámicos**
   ```javascript
   // ❌ Antes
   if (!email) return 'El email es obligatorio'
   
   // ✅ Después
   if (!email) return t('errors.required')
   ```

### Claves de Traducción Sugeridas (Ya Disponibles)

#### Para Formularios
- `common.save` - Guardar
- `common.cancel` - Cancelar
- `common.delete` - Eliminar
- `common.edit` - Editar
- `common.search` - Buscar
- `common.loading` - Cargando...
- `common.noData` - No hay datos disponibles

#### Para Validaciones
- `errors.required` - Este campo es obligatorio
- `errors.invalidEmail` - Email inválido
- `errors.minLength` - Mínimo {count} caracteres

#### Para Mensajes
- `messages.success` - Operación exitosa
- `messages.saved` - Guardado correctamente
- `messages.deleted` - Eliminado correctamente

## 🎯 Siguiente Paso Recomendado

**Opción 1: Traducir componentes de Usuarios**
Los componentes de gestión de usuarios son muy usados y relativamente simples:
```bash
# Archivos a modificar:
- UsuariosLista.vue
- EditarUsuarioModal.vue
```

**Opción 2: Traducir página Dashboard principal**
La página Dashboard.vue probablemente solo importa componentes ya traducidos.

**Opción 3: Traducir Encuestas completas**
Sistema completo con 6 componentes.

## 📊 Estadísticas

- **Archivos de traducción**: 4 (100% completos con claves base)
- **Claves de traducción**: ~200+
- **Componentes traducidos**: 8/44 (18%)
- **Páginas traducidas**: 2/11 (18%)
- **Componentes de layout traducidos**: 4/5 (80%)

## ⚠️ Notas Importantes

1. **API Backend**: Los mensajes de error de la API están en español. Ver [MENSAJES_API_I18N.md](MENSAJES_API_I18N.md) para plan de internacionalización backend.

2. **PrimeVue**: Los componentes de PrimeVue tienen su propio sistema de i18n. Considerar configurarlo si se necesitan traducir labels internos.

3. **Dates**: Siempre usar `locale.value` para `Intl.DateTimeFormat` y `toLocaleDateString()`.

4. **Interpolación**: Para variables, usar `{ count }`, `{ name }`, etc.:
   ```javascript
   t('message.withCount', { count: 5 })  // "Tienes 5 mensajes"
   ```

5. **Validación**: Al usar useI18n en composables, asegurarse de que esté dentro del contexto de Vue.

## 🧪 Testing

Para probar las traducciones:
1. Cambiar idioma con el selector (esquina superior derecha)
2. Navegar por las páginas traducidas
3. Verificar que fechas y números se formateen correctamente
4. Comprobar que no hay errores de claves faltantes en consola

## 📝 Comandos Útiles

```bash
# Buscar textos hardcodeados en español
grep -r "class=\".*\">.*[áéíóúñ]" src/components --include="*.vue"

# Ver archivos Vue sin traducir
find src -name "*.vue" -exec grep -l "Crear\|Editar\|Guardar\|Cancelar" {} \;

# Verificar imports de useI18n
grep -r "useI18n" src --include="*.vue"
```

---

**Estado**: Fundación sólida establecida. Sistema i18n funcional con 8 componentes críticos traducidos.
**Próximo paso**: Continuar con componentes de funcionalidades específicas (Usuarios, Talleres, Encuestas).
