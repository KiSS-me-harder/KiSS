import { defineContentConfig, defineCollection } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: '**/*.md'
    }),
    degrees: defineCollection({
      type: 'page',
      source: '**/degrees/**/*.md'
    })
  }
})
