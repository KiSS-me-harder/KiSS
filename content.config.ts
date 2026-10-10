import { defineContentConfig, defineCollection } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: '**/*.md'
    }),
    degrees: defineCollection({
      type: 'page',
      source: 'degrees/**/*.md'
    }),
    classes: defineCollection({
      type: 'page',
      source: 'classes/**/*.md'
    }),
    clubs: defineCollection({
      type: 'page',
      source: 'clubs/**/*.md'
    }),
    punishments: defineCollection({
      type: 'page',
      source: 'punishments/**/*.md'
    }),
    faculty: defineCollection({
      type: 'page',
      source: 'faculty/**/*.md'
    }),
    library: defineCollection({
      type: 'page',
      source: 'library/**/*.md'
    }),
    binaural: defineCollection({
      type: 'data',
      source: 'binaural/**/*.md'
    })
  }
})
