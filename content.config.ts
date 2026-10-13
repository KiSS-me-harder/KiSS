import { defineContentConfig, defineCollection, property } from '@nuxt/content'
import z from 'zod'

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
      source: 'courses/**/*.md',
      schema: z.object({
        flashcards: property(z.array(z.object({
          question: z.string(),
          options: z.array(z.string()),
          correctIndex: z.number()
        }))).optional(),
        exam: property(z.array(z.union([
          z.string(),
          z.object({
            type: z.string(),
            text: z.string(),
            metric: z.string().optional(),
            field: z.string().optional(),
            target: z.number().optional(),
            label: z.string().optional(),
            unit: z.string().optional()
          })
        ]))).optional()
      })
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
