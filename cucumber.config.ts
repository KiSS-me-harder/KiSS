export default {
  default: {
    import: ['./test/e2e/tsx-register.js', './test/e2e/steps/**/*.ts'],
    format: ['progress'],
    paths: ['./features/pages/**/*.feature', './features/components/**/*.feature'],
    publishQuiet: true
  },
  pages: {
    import: ['./test/e2e/tsx-register.js', './test/e2e/steps/**/*.ts'],
    format: ['progress'],
    paths: ['./features/pages/**/*.feature'],
    publishQuiet: true
  },
  components: {
    import: ['./test/e2e/tsx-register.js', './test/e2e/steps/**/*.ts'],
    format: ['progress'],
    paths: ['./features/components/**/*.feature'],
    publishQuiet: true
  }
}
