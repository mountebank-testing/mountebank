# Agent Guidelines

## Scope

These instructions apply to the entire repository.

## General Guidance

-   Follow modern best practices for collaborative software development: keep changes focused, write clear commit messages, and prefer readable, well-tested code.
-   Adhere to existing project conventions; when unsure, consult current files for patterns before introducing new ones.
-   When modifying code, add or update automated tests as needed to cover new behavior or prevent regressions.
-   Follow the commit message guidelines in `commit-message.prompt.md` and the pull request guidance in `issue-pull-request.prompt.md` whenever preparing commits or PRs.

## Testing Requirements

-   Always run `npm test` before finalising a task, as it is the most comprehensive command and chains the lint checks, unit coverage run, API/CLI smoke tests, and JavaScript end-to-end suites. Ensure all tests pass or document any environment-related failures.

## Test Modification Policy

-   Never change test assertions merely to silence failures. Investigate the root cause of any failing test and fix the underlying issue.
-   Adjusting an assertion is acceptable only when there is a well-justified change in expected behavior, and that rationale should be documented in the code or commit messa
