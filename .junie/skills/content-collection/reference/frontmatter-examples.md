# Frontmatter Examples

Complete frontmatter schemas for each content collection.

## Classes

Located in `content/classes/<degree>/<class-name>/<level>.md`.

```yaml
---
title: "Introduction to Topic"
class: "Class Name"
level: 100
flashcards:
  - question: "What is the key principle?"
    options:
      - "Option A"
      - "Option B"
      - "Option C"
      - "Option D"
    correctIndex: 0
  - question: "Second question?"
    options:
      - "A"
      - "B"
      - "C"
      - "D"
    correctIndex: 2
exam:
  - type: checklist
    text: "Complete task 1"
  - type: checklist
    text: "Complete task 2"
---
```

Body contains Markdown lesson content rendered via `<ContentRenderer>`.

## Degrees

Located in `content/degrees/<degree-slug>.md`.

```yaml
---
title: "Degree Name"
description: "Short description of the degree program."
levels:
  - name: "Junior"
    description: "Beginner level description."
    classes:
      - slug: "degree/class-name"
        maxLevel: 104
  - name: "Senior"
    description: "Intermediate level."
    classes:
      - slug: "degree/class-name"
        maxLevel: 204
  - name: "Master"
    description: "Advanced level."
    classes:
      - slug: "degree/class-name"
        maxLevel: 304
      - slug: "other-degree/other-class"
        maxLevel: 104
---
```

Body contains optional degree description text.

## Activities

Located in `content/activities/<activity-slug>/_index.md`.

```yaml
---
title: "Activity Name"
description: "Short description."
longDescription: "Extended description for detail views."
icon: "i-lucide-ruler"
category: "Category Name"
fields:
  - id: "waist"
    label: "Waist"
    unit: "cm"
    icon: "i-lucide-ruler"
    required: true
  - id: "hips"
    label: "Hips"
    unit: "cm"
    icon: "i-lucide-ruler"
    required: true
contributions:
  - metric: "body-shape"
    map:
      waist: "waist"
      hips: "hips"
---
```

## Clubs

Located in `content/clubs/<club-slug>.md`.

```yaml
---
title: "Club Name"
description: "Short description."
requiredDegree: "fitness"
clubActivities:
  - squat-hold
  - hip-flexor-stretch
activities:
  - type: challenge
    title: "Challenge Name"
    description: "Challenge description."
    xp: 70
    icon: "i-lucide-dumbbell"
  - type: game
    title: "Game Name"
    description: "Game description."
    xp: 40
    icon: "i-lucide-timer"
  - type: task
    title: "Task Name"
    description: "Task description."
    xp: 50
    icon: "i-lucide-zap"
---
```

Body contains club description text.

## Metrics

Located in `content/metrics/<metric-slug>/_index.md`.

Defines training milestones and progress tracking fields.

## Library

Located in `content/library/<category>/<slug>.md`.

Media entries for videos, images, audio, and books.

## Faculty

Located in `content/faculty/<slug>.md`.

Teacher profile definitions.

## Punishments

Located in `content/punishments/<slug>.md`.

Detention and punishment definitions.

## Binaural

Located in `content/binaural/<slug>.md`.

Registered as `type: 'data'` (not `'page'`) — pure configuration data.
