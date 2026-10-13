// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    rules: {
      'vue/no-multiple-template-root': 'off',
      'vue/max-attributes-per-line': ['error', { singleline: 3 }],
      'max-lines-per-function': ['error', {
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
        template: 150,
        script: 200,
        style: 150,
        skipBlankLines: true
      }],
      'vue/max-template-depth': ['error', {
        maxDepth: 10
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
  },
  {
    files: ['test/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-globals': 'off'
    }
  }
)
