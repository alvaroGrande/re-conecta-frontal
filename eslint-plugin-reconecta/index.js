/**
 * Plugin ESLint personalizado para reConecta
 * Enforza las convenciones de nomenclatura del proyecto
 */

module.exports = {
  rules: {
    'spanish-naming': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Enforza nombres en español para funciones y variables',
          category: 'Best Practices',
          recommended: true
        },
        messages: {
          noEnglishVerbs: 'Usar verbos en español: "{{ name }}" debería ser "{{ suggestion }}"'
        },
        schema: []
      },
      create(context) {
        const englishToSpanish = {
          // Verbos comunes
          'get': 'obtener',
          'set': 'establecer',
          'create': 'crear',
          'delete': 'eliminar',
          'update': 'actualizar',
          'fetch': 'obtener',
          'send': 'enviar',
          'receive': 'recibir',
          'connect': 'conectar',
          'disconnect': 'desconectar',
          'listen': 'escuchar',
          'start': 'iniciar',
          'stop': 'detener',
          'show': 'mostrar',
          'hide': 'ocultar',
          'open': 'abrir',
          'close': 'cerrar',
          'load': 'cargar',
          'save': 'guardar',
          'search': 'buscar',
          'filter': 'filtrar',
          'validate': 'validar',
          'verify': 'verificar',
          'check': 'verificar',
          'count': 'contar',
          'add': 'agregar',
          'remove': 'eliminar'
        }

        // Palabras en español que NO deben ser marcadas como errores
        const spanishVerbs = [
          'obtener', 'establecer', 'crear', 'eliminar', 'actualizar',
          'enviar', 'recibir', 'conectar', 'desconectar', 'escuchar',
          'emitir', 'iniciar', 'detener', 'mostrar', 'ocultar',
          'abrir', 'cerrar', 'cargar', 'guardar', 'buscar',
          'filtrar', 'validar', 'verificar', 'contar', 'agregar',
          'marcar', 'cambiar', 'asignar', 'inscribir', 'activar',
          'desactivar', 'subirFotoPerfil'
        ]

        return {
          FunctionDeclaration(node) {
            const name = node.id?.name
            if (!name) return

            // Ignorar funciones con prefijos válidos (handle, on, use)
            if (name.startsWith('handle') || name.startsWith('on') || name.startsWith('use')) {
              return
            }

            // Ignorar funciones que ya empiezan con verbos en español
            if (spanishVerbs.some(verb => name.startsWith(verb))) {
              return
            }

            // Verificar verbos en inglés al inicio
            for (const [english, spanish] of Object.entries(englishToSpanish)) {
              if (name.startsWith(english)) {
                const suggestion = name.replace(new RegExp(`^${english}`), spanish)
                context.report({
                  node,
                  messageId: 'noEnglishVerbs',
                  data: { name, suggestion }
                })
                break
              }
            }
          },

          ArrowFunctionExpression(node) {
            if (node.parent.type === 'VariableDeclarator' && node.parent.id) {
              const name = node.parent.id.name
              
              // Ignorar funciones que ya empiezan con verbos en español
              if (spanishVerbs.some(verb => name.startsWith(verb))) {
                return
              }

              // Ignorar funciones con prefijos válidos
              if (name.startsWith('handle') || name.startsWith('on') || name.startsWith('use')) {
                return
              }

              // Verificar verbos en inglés al inicio
              for (const [english, spanish] of Object.entries(englishToSpanish)) {
                if (name.startsWith(english)) {
                  const suggestion = name.replace(new RegExp(`^${english}`), spanish)
                  context.report({
                    node: node.parent.id,
                    messageId: 'noEnglishVerbs',
                    data: { name, suggestion }
                  })
                  break
                }
              }
            }
          }
        }
      }
    },

    'component-naming': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Enforza PascalCase para componentes Vue',
          category: 'Best Practices',
          recommended: true
        },
        messages: {
          notPascalCase: 'Los componentes deben usar PascalCase: "{{ name }}"'
        },
        schema: []
      },
      create(context) {
        const filename = context.getFilename()
        
        // Solo verificar archivos .vue
        if (!filename.endsWith('.vue')) {
          return {}
        }

        const componentName = filename.split('/').pop().replace('.vue', '')
        const isPascalCase = /^[A-Z][a-zA-Z0-9]*$/.test(componentName)

        return {
          Program(node) {
            if (!isPascalCase) {
              context.report({
                node,
                messageId: 'notPascalCase',
                data: { name: componentName }
              })
            }
          }
        }
      }
    },

    'service-naming': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Enforza convenciones de nomenclatura para servicios',
          category: 'Best Practices',
          recommended: true
        },
        messages: {
          mustBeService: 'Los archivos de servicios deben terminar en .service.js',
          noDeprecatedImport: 'Importar desde {{ newPath }} en lugar de {{ oldPath }}'
        },
        schema: []
      },
      create(context) {
        const filename = context.getFilename()
        const isServiceFile = filename.includes('/services/') && filename.endsWith('.js')

        return {
          Program(node) {
            // Verificar que archivos en /services/ terminen en .service.js
            if (isServiceFile && !filename.endsWith('.service.js') && !filename.endsWith('/api.js') && !filename.endsWith('/toastService.js')) {
              const baseName = filename.split('/').pop()
              if (!['api.js', 'toastService.js'].includes(baseName)) {
                context.report({
                  node,
                  messageId: 'mustBeService'
                })
              }
            }
          },

          ImportDeclaration(node) {
            const importPath = node.source.value

            // Verificar importaciones de servicios antiguos
            const deprecatedServices = {
              './auth': './auth.service',
              './contactos': './contactos.service',
              './notificaciones': './notificaciones.service',
              './socketService': './socketService.service',
              './videoCall': './videoCall.service',
              './usuarios': './usuarios.service',
              './talleres': './talleres.service',
              './encuestas': './encuestas.service',
              './dashboard': './dashboard.service'
            }

            if (deprecatedServices[importPath]) {
              context.report({
                node,
                messageId: 'noDeprecatedImport',
                data: {
                  oldPath: importPath,
                  newPath: deprecatedServices[importPath]
                }
              })
            }
          }
        }
      }
    },

    'prop-naming': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Enforza camelCase para props y eventos en Vue',
          category: 'Best Practices',
          recommended: true
        },
        messages: {
          notCamelCase: 'Props deben usar camelCase: "{{ name }}"',
          notKebabCase: 'Eventos deben usar kebab-case: "{{ name }}"'
        },
        schema: []
      },
      create(context) {
        return {
          Property(node) {
            if (!node.key?.name) return

            const sourceCode = context.getSourceCode()
            const text = sourceCode.getText(node)

            // Verificar props
            if (text.includes('props:') || node.parent?.parent?.key?.name === 'props') {
              const name = node.key.name
              const isCamelCase = /^[a-z][a-zA-Z0-9]*$/.test(name)
              
              if (!isCamelCase) {
                context.report({
                  node: node.key,
                  messageId: 'notCamelCase',
                  data: { name }
                })
              }
            }

            // Verificar eventos emit
            if (text.includes('$emit') || text.includes('emit(')) {
              const value = node.value?.value || node.value?.elements?.[0]?.value
              if (value && typeof value === 'string') {
                const isKebabCase = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(value)
                
                if (!isKebabCase) {
                  context.report({
                    node,
                    messageId: 'notKebabCase',
                    data: { name: value }
                  })
                }
              }
            }
          }
        }
      }
    },

    'jsdoc-required': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Requiere JSDoc para funciones exportadas en servicios',
          category: 'Best Practices',
          recommended: true
        },
        messages: {
          missingJSDoc: 'Las funciones exportadas deben tener documentación JSDoc'
        },
        schema: []
      },
      create(context) {
        const filename = context.getFilename()
        const isServiceFile = filename.includes('/services/') && filename.endsWith('.service.js')

        if (!isServiceFile) {
          return {}
        }

        return {
          ExportNamedDeclaration(node) {
            if (node.declaration?.type === 'FunctionDeclaration' || 
                node.declaration?.type === 'VariableDeclaration') {
              
              const sourceCode = context.getSourceCode()
              const comments = sourceCode.getCommentsBefore(node)
              const hasJSDoc = comments.some(comment => comment.type === 'Block' && comment.value.startsWith('*'))

              if (!hasJSDoc) {
                context.report({
                  node,
                  messageId: 'missingJSDoc'
                })
              }
            }
          }
        }
      }
    }
  }
}
