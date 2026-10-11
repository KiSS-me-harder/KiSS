// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    rules: {
      'vue/no-multiple-template-root': 'off',
      'vue/max-attributes-per-line': ['error', { singleline: 3 }],
      'max-lines-per-function': ['warn', {
        max: 100,
        skipBlankLines: true,
        skipComments: true
      }],
      'no-restricted-globals': ['error', {
        globals: [{
          name: 'localStorage',
          message: 'Use Pinia instead of direct localStorage access.'
        }],
        checkGlobalObject: true
      }]
    }
  },
  {
    files: ['**/*.vue'],
    rules: {
      'vue/max-lines-per-block': ['error', {
        template: 200,
        script: 150,
        style: 150,
        skipBlankLines: true
      }],
      'vue/max-template-depth': ['warn', {
        maxDepth: 8
      }]
    }
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'max-lines': ['error', {
        max: 300,
        skipBlankLines: true,
        skipComments: true
      }]
    }
  }
)
