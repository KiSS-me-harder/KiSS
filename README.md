<div align="center">

# KiSS

[![Nuxt](https://img.shields.io/badge/Nuxt-4.6-00DC82?logo=nuxt.js&logoColor=white)](https://nuxt.com/)
[![Vue](https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![GitHub Actions](https://img.shields.io/github/actions/workflow/status/kiss-projects/KiSS/nuxtjs.yml?branch=main&label=CI)](https://github.com/kiss-projects/KiSS/actions)

</div>

KiSS is a personal development and habit-tracking platform built as a static web application. It provides a structured, gamified experience for self-improvement through degree programs, classes, clubs, and daily routines.

## ✨ Features

### Dashboard
Your daily starting point — view today's tasks, routines, schedule, and calendar in one place. Mark tasks complete, manage your daily schedule, and track your progress at a glance.

### Degrees
Structured degree programs with multiple title levels. Browse available degrees, enroll in programs, and track your progress through each title level.

### Classes
The building blocks of degrees. Each class has prerequisites and tier levels, forming a dependency graph you can visualize on the Study Plan page. Enroll in classes, track completion, and see how they connect to your degree goals.

### Study Plan
Visual dependency graph of all classes across your enrolled degrees. Filter by degree, set target titles, plan your path, and bulk-enroll in classes. Pan, zoom, and explore the full class network.

### Clubs
Join clubs with group activities and challenges. Clubs may have degree prerequisites, and you can complete activities, track progress, and leave clubs when you're done.

### Library
Access and explore a wide range of resources — videos, images, audio, and books — to support your journey.

### Metrics
Track your training milestones and progress over time with detailed metric views.

### Detention & Punishments
Face consequences for missed tasks or broken routines. View detention assignments and punishment details.

### Teachers
Browse faculty profiles and chat with mentors for guidance and support.

### Students
Connect with fellow students, view profiles, and participate in threaded discussions.

### Profile
View and edit your personal information, see enrolled classes with completion progress, and check summary statistics.

### Settings
Configure your preferences including haptics, notifications, and other app options.

### Flashcards
Memorize and reinforce knowledge with interactive flashcard sessions.

### Media Player
Manage and enjoy media content with an integrated player that supports binaural beats and hypnotic spirals.

## 🛠 Tech Stack

- **Framework:** [Nuxt 4](https://nuxt.com/) (SSR, static generation)
- **UI:** [Vue 3](https://vuejs.org/) + [Nuxt UI](https://ui.nuxt.com/) + [Tailwind CSS 4](https://tailwindcss.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **State Management:** [Pinia](https://pinia.vuejs.org/)
- **Content:** [Nuxt Content 3](https://content.nuxt.com/)
- **Testing:** [Playwright](https://playwright.dev/) + [Cucumber](https://cucumber.io/) (E2E), [Vitest](https://vitest.dev/) (unit)
- **Linting:** [ESLint](https://eslint.org/) with [Husky](https://typicode.github.io/husky/) hooks
- **Package Manager:** [pnpm](https://pnpm.js.org/)

## 📦 Setup

```bash
# Clone the repository
git clone <repository-url>
cd KiSS

# Ensure you have your SSH key set up and at the root of the repo, then run:
./setup.sh
```

## 🚀 Development

```bash
# Start the development server
pnpm dev

# Type-check the project
pnpm typecheck

# Lint the codebase
pnpm lint

# Generate the static site (full build with route prerendering)
pnpm generate

# Preview the generated static site
pnpm preview
```

## 🧪 Testing

```bash
# Run all E2E tests
pnpm test

# Run page-level E2E tests
pnpm test:e2e:pages

# Run component-level E2E tests
pnpm test:e2e:components
```

The project uses behavior-driven development with [Gherkin feature files](features/) as the source of truth for expected behavior. Each feature file describes user scenarios that are backed by Playwright E2E tests.

## 📁 Project Structure

```
├── app/                  # All application code
│   ├── pages/            # Route-based pages
│   ├── components/       # Reusable Vue components
│   ├── stores/           # Pinia stores (persistent state)
│   ├── composables/      # Shared composables
│   ├── types/            # TypeScript type definitions
│   ├── plugins/          # Nuxt plugins
│   ├── layouts/          # Page layouts
│   ├── assets/           # Compiled assets
│   └── utils/            # Utility functions
├── content/              # Markdown/YAML data (classes, degrees, clubs, etc.)
├── features/             # Gherkin feature specs (BDD)
├── test/                 # Tests (unit, Nuxt, E2E)
└── public/               # Static assets
```

## 🤝 Contributing

1. Read the relevant [Gherkin feature file](features/) before implementing changes.
2. Follow the existing code style and patterns.
3. Run `pnpm lint` before committing — Husky hooks will enforce this.
4. Use `pnpm generate` to validate your changes catch all route-level errors.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
