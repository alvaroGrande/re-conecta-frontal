/**
 * Configuración de ESLint para reConecta
 * Incluye reglas personalizadas para enforcar convenciones de nomenclatura
 */

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    'vue',
    'reconecta'
  ],
  rules: {
    // === Reglas de Vue ===
    'vue/multi-word-component-names': 'off',
    'vue/component-name-in-template-casing': ['warn', 'PascalCase'],
    'vue/prop-name-casing': ['warn', 'camelCase'],
    'vue/attribute-hyphenation': ['warn', 'always'],
    'vue/v-on-event-hyphenation': ['warn', 'always'],
    
    // Reglas de formato (warnings, no errors)
    'vue/html-indent': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/html-self-closing': 'off',
    'vue/attributes-order': 'off',

    // === Reglas generales ===
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'prefer-const': 'warn',
    'no-var': 'error',
    'quotes': 'off',
    'semi': 'off',
    'comma-dangle': 'off',
    'indent': 'off',
    'object-curly-spacing': 'off',
    'array-bracket-spacing': 'off',
    'arrow-spacing': 'off',
    'keyword-spacing': 'off',
    'space-before-blocks': 'off',

    // === Reglas personalizadas de reConecta (desactivadas) ===
    'reconecta/spanish-naming': 'off',
    'reconecta/component-naming': 'off',
    'reconecta/service-naming': 'off',
    'reconecta/prop-naming': 'off',
    'reconecta/jsdoc-required': 'off'
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@', './src'],
          ['@helpers', './src/helpers'],
          ['@features', './src/components/features'],
          ['@layout', './src/components/layout'],
          ['@shared', './src/components/shared'],
          ['@services', './src/services'],
          ['@pages', './src/pages'],
          ['@composables', './src/composables']
        ],
        extensions: ['.js', '.vue', '.json']
      }
    }
  },
  overrides: [
    {
      // Configuración para archivos de configuración
      files: ['*.config.js', 'vite.config.js', 'tailwind.config.js'],
      rules: {
        'no-console': 'off'
      }
    }
  ]
}
