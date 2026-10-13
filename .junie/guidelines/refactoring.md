# Refactoring — KiSS

**Hard rule:** When a file exceeds its ESLint line limit, refactor by extracting cohesive components, composables, or utilities.

## What to Do

- **Extract components** — Split large Vue templates into child components by logical sections.
- **Extract composables** — Move shared logic, state management, or side effects into `app/composables/`.
- **Extract utilities** — Place pure helper functions in `app/utils/`.
- **Refactor existing code** — When adding features, prefer restructuring existing large files first to make room, keeping the total codebase slim.

## What NOT to Do

- **Do not** compress code or remove readability-enhancing whitespace to fit within limits.
- **Do not** disable or bypass ESLint rules (e.g., `eslint-disable` comments) to hide line count violations.
- **Do not** append new code to already-large files without first evaluating whether extraction is needed.

## Line Limit References

- Vue templates: 50 lines is a warning sign, 100+ means split it.
- Script sections: Keep under 200 lines; 300+ is too much.
- ESLint `max-lines` rule enforces the hard limit — let it fail, then refactor.
