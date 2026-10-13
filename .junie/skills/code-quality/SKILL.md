---
name: code-quality
description: Resolve code quality issues by alternating between linting, typechecking, and testing. Use when the project has lint errors, type errors, or test failures that need to be fixed.
---

# Code Quality Resolution

Run `pnpm lint`, `pnpm typecheck`, and `pnpm test` in alternating cycles to discover and resolve code quality issues. Fix issues in the code, not the checks — never suppress lint rules, weaken test assertions, or bypass type errors.

**Core expectation:** The purpose of this skill is to resolve **all** failing tests and code quality issues in the project. It is **not acceptable** to complete a code quality task with any unresolved failing tests remaining. Whether the failures are related to a specific feature or are pre-existing issues is irrelevant — the task is to leave the project in a fully passing state. If you encounter a wall of failures, fix them one by one until nothing remains.

## Workflow

1. **Run `pnpm lint`** — Identify linting issues. Fix them by refactoring the code per project guidelines. Never disable lint rules or edit lint configuration to work around issues.
2. **Run `pnpm typecheck`** — After fixing lint issues, verify types still pass. Lint fixes can introduce type errors; resolve any new type issues before proceeding.
3. **Run the E2E test suite** — With a dev server running on port 3000, run the tests using the rerun workflow (see below). Pipe all output to a file to keep context usage low, then read only the summary. Fix test failures by updating the implementation only.

**Piping test output to a file** — To avoid accumulating large amounts of stdout in your session context, redirect every test command to a temp file and read only what you need:

```bash
# Run tests, piping all output (stdout + stderr) to a file
pnpm test:e2e:rerun > /tmp/e2e-output.txt 2>&1
echo $? > /tmp/e2e-exit.txt
```

Then check the result:
```bash
# Read only the exit code
cat /tmp/e2e-exit.txt

# Read only the last ~50 lines (failure summary + stack traces)
tail -50 /tmp/e2e-output.txt
```

The Cucumber progress-bar formatter outputs dots during execution, then a summary with failure details at the end. You only need the exit code and the tail — the intermediate progress output is noise. Apply the same pattern to `pnpm test:e2e` (full suite) and any other test commands.

### E2E Test Rerun Workflow

Use `@rerun.txt` at the project root to limit test runs to previously failed scenarios, reducing the full suite time from ~3 minutes to only the failing tests.

- **If `@rerun.txt` exists and is non-empty** — Run `pnpm test:e2e:rerun` to execute only the failed tests listed in the file. Assume the full suite has already been run for you; focus only on fixing the features that fail. **Do not run the full suite (`pnpm test:e2e`) while `@rerun.txt` has contents** — this wastes time re-running already-known failures.
- **If `@rerun.txt` does not exist or is empty** — Run `pnpm test:e2e` to execute the full suite and generate the file. Subsequent runs should then use `pnpm test:e2e:rerun`.
- **After all rerun tests pass** — When `@rerun.txt` still exists but all its listed tests now pass, run the full suite (`pnpm test:e2e`) once to verify no regressions were introduced and to regenerate a clean `@rerun.txt`.
- **Timeout** — The E2E test suite can take several minutes. Use a **5-minute timeout** (300 seconds) when running any E2E test command to avoid premature termination.

4. **Check console output** — After running the E2E test suite, summarize the console logs instead of reading raw JSONL files (which can be 1+ MB). Use a quick summary script to get only the error/warning messages:

```bash
# Summarize console logs: count by level + print error messages
cat test/results/console/*.jsonl 2>/dev/null | node -e "
  const chunks = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n').filter(Boolean);
  const byLevel = {}; chunks.forEach(c => { const l = JSON.parse(c).level; byLevel[l]=(byLevel[l]||0)+1; });
  console.log('Total:', chunks.length, 'by level:', byLevel);
  const errors = chunks.map(JSON.parse).filter(c => c.level==='error' || c.level==='warning');
  errors.forEach(e => console.log(e.level.toUpperCase()+' ['+e.type+'] '+e.message));
" 2>/dev/null || echo "No console files found"
```

Then check `test/results/` for any remaining files. A fully passing test suite is only considered problem-free when the results folder is completely empty after a run. Any console entries found there must be dealt with — the message level (error, warning, log, debug) is **not** an indication of whether it requires attention; all entries need to be addressed.

- **Dealing with a console entry** — For each entry found, choose one of two approaches:
  - **(A) Add a filter rule** — If the message is expected output that should not be captured, **request permission** from the user before updating the filtering logic in `test/e2e/support/diagnostics.ts`. Do not silently modify filtering rules without approval.
  - **(B) Fix the code** — Make code changes that resolve the message at its source (e.g., remove unnecessary `console.log`/`console.warn` calls, fix unhandled promise rejections, correct network request failures).
- **No skipping allowed** — Do not skip console entries because they appear to be benign log or debug messages. Every entry in the results folder represents something that should not have been emitted during a clean test run.
- **If the results folder is empty** — No issues were captured; proceed to the next step.

5. **Check screenshots** — After running the E2E test suite, check `test/results/screenshots/` for any files. Screenshots are captured for every scenario and stored in subdirectories by outcome: `test/results/screenshots/success/` for passing scenarios and `test/results/screenshots/failure/` for failing scenarios. Check the failure subdirectory first to understand the visual state of the page at the time of failure — these provide evidence of broken layouts, missing elements, or incorrect rendering that may not be apparent from console logs alone. The success subdirectory contains screenshots of passing scenarios for reference.

6. **Repeat** — After each round of fixes, re-run all checks to ensure fixes don't introduce new issues. Continue until all pass.

## Constraints

### What you MAY edit

The code-quality skill is strictly limited to two types of changes:

1. **Implementation code** — Files under `app/` (pages, components, stores, composables, utils, types, plugins, layouts, assets).
2. **Step definitions** — Files under `test/e2e/steps/` (Cucumber step implementation files).

### What you MUST NOT edit

- **Feature files** — Gherkin feature files in `features/` are the source of truth — never modify them to make tests pass.
- **Test suite infrastructure** — Never modify `cucumber.json`, `playwright.config.ts`, `vitest.config.ts`, `cucumber.config.ts`, or any files in `test/e2e/support/` (setup, world, diagnostics). These are project configuration, not code to be fixed.
- **Test configuration** — Do not change test runner settings like `parallel`, `format`, `strict`, timeouts, or browser options to make tests pass.
- **Lint configuration** — Do not add `eslint-disable` comments, modify `eslint.config.mjs`, or otherwise suppress lint warnings.
- **Type suppression** — Do not add `@ts-ignore`, `@ts-nocheck`, `// @ts-expect-error`, or use `any` types to silence type errors.
- **Error suppression in code** — Do not add `.catch(() => {})`, empty `try/catch` blocks, or modify `diagnostics.ts` filter rules to hide error messages.
- **Stubbing steps** — Do not replace step definition logic with `throw errors.Pending`, empty functions, `undefined` returns, or hardcoded assertions. Step definitions must perform real assertions against the application.

### Other rules

- **One artifact type per task.** If both tests and implementation need updating, fix the implementation first in one task, then update tests in a follow-up task. Do not modify both in the same task.
- **Test failures → implementation fixes only.** Resolve E2E test failures by updating the implementation code, not by changing test expectations.
- **No lint suppression.** Fix lint issues by refactoring code properly.
- **Alternate checks.** Always run typecheck after lint fixes, and lint after typecheck fixes — one fix can break another check.

## Commands

- `pnpm lint` — Lint check (use `pnpm lint --fix` for auto-fixable issues first).
- `pnpm typecheck` — TypeScript type checking.
- `pnpm test:e2e` — Full E2E test suite (**always** runs all scenarios, requires dev server on port 3000, use a 5-minute timeout).
- `pnpm test:e2e:single` — Run a single feature file (e.g., `pnpm test:e2e:single features/pages/study-plan.feature`, requires dev server on port 3000).
- `pnpm test:e2e:rerun` — Run only failed tests from `@rerun.txt` (requires dev server on port 3000, use a 5-minute timeout).
- `pnpm dev` — Start dev server (run in background if port 3000 is not in use before testing).

## Context Management

**Use diagnostic artifacts judiciously — do not read or include everything available.** Payload size limits are exceeded frequently when agents dump all screenshots, console logs, and test output into responses.

- **Screenshots:** Open only the screenshot for the specific failing scenario you're investigating. Never read all screenshots in a batch. Skip screenshots entirely when the issue is clearly non-visual (e.g., logic errors, type errors, lint failures).
- **Console logs:** Use the summary script below to get counts and error messages — never read raw JSONL files (1+ MB each). Only drill into a specific log file if the summary reveals an unfamiliar error worth investigating.
- **Test output:** Always pipe test commands to a file and read only the exit code and last ~50 lines. Never include full test run output in responses.

## When to Stop

Stop when all three commands pass with exit code 0 **and** `test/results/` is completely empty — no console entry files should remain. If issues persist after multiple rounds, reassess whether the root cause requires a different approach.
