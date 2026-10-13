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
    courses: defineCollection({
      type: 'page',
      source: 'courses/**/*.md'
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
      type: 'page',
      source: 'binaural/**/*.md'
    }),
    metrics: defineCollection({
      type: 'page',
      source: 'metrics/**/*.md'
    }),
    activities: defineCollection({
      type: 'page',
      source: 'activities/**/*.md'
    })
  }
})
