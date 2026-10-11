---
name: content-collection
description: Add or modify Nuxt Content collections in `content/` and `content.config.ts`.
---

# Content Collection

Add or modify Nuxt Content collections in `content/` and `content.config.ts`.

## When to Use

- Adding a new content domain (e.g., new content folder with Markdown files)
- Modifying frontmatter schema for existing content
- Registering a new collection so `queryCollection()` can find it
- Adding structured data (activities, metrics, binaural configs)

## Steps

1. **Create content folder** — `content/<collection-name>/` under `content/`.
2. **Write content files** — Markdown with YAML frontmatter. Use `_index.md` for index files, numbered files (e.g., `100.md`) for leveled content.
3. **Register the collection** — Add entry to `content.config.ts`:
   ```ts
   myCollection: defineCollection({
     type: 'page',  // or 'data' for non-page content
     source: 'myCollection/**/*.md'
   })
   ```
4. **Query in pages/components** — Use `queryCollection('myCollection')` with `.where()` filters.
5. **Validate** — Run `pnpm generate` to confirm content is discoverable.

## Content Types

- **`type: 'page'`** — Content that maps to routes. Used for classes, degrees, clubs, activities, etc.
- **`type: 'data'`** — Pure data content not mapped to routes. Used for binaural configs.

## Frontmatter Patterns

See `reference/frontmatter-examples.md` for full examples by content type.

### Classes (leveled content)

```yaml
---
title: "Lesson Title"
class: "Class Name"
level: 100
flashcards:
  - question: "..."
    options: ["A", "B", "C", "D"]
    correctIndex: 0
exam:
  - type: checklist
    text: "Task description"
---
```

### Degrees

```yaml
---
title: "Degree Name"
description: "Short description"
levels:
  - name: "Junior"
    description: "..."
    classes:
      - slug: "degree/class-name"
        maxLevel: 104
---
```

### Activities

```yaml
---
title: "Activity Name"
description: "..."
icon: "i-lucide-ruler"
category: "Category"
fields:
  - id: "fieldName"
    label: "Field Label"
    unit: "unit"
    required: true
contributions:
  - metric: "metric-slug"
    map:
      fieldName: "metricField"
---
```

### Clubs

```yaml
---
title: "Club Name"
description: "..."
requiredDegree: "degree-slug"
clubActivities:
  - activity-slug-1
  - activity-slug-2
activities:
  - type: challenge
    title: "..."
    description: "..."
    xp: 50
    icon: "i-lucide-dumbbell"
---
```

## Querying Content

```ts
// Fetch all items
const { data } = await useAsyncData('key', () => queryCollection('classes').all())

// Filter with .where()
const { data } = await useAsyncData('key', () =>
  queryCollection('classes')
    .where('stem', 'LIKE', `classes/degree/slug%`)
    .all()
)

// Access frontmatter via .meta property
const level = item.meta?.level
const deps = item.meta?.dependencies
```

## Key Rules

- **Always register new collections** in `content.config.ts` — unregistered content is invisible to queries.
- Use `.where()` on large collections instead of fetching all and filtering in JS.
- Content files use file path as implicit slug — `classes/degree/name/100.md` → stem `classes/degree/name/100`.
- `_index.md` files are index files without a level number.
- Frontmatter fields are accessed via `item.meta?.fieldName` in templates.

## References

- `reference/frontmatter-examples.md` — Complete frontmatter schemas
- `content.config.ts` — Collection registration
- `content/classes/` — Leveled class content
- `content/degrees/` — Degree definitions
- `content/activities/` — Activity templates with fields
