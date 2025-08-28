mode: "agent"
tools: ["changes", "codebase", "github", "runCommands"]
description: "Generate a clear PR title and description for the proposed changes; write for senior engineers who are not JavaScript experts"

---

### Pull request helper 🔧

# Pull Request Title & Description Template

Audience: Senior engineers who are not JavaScript experts. Be clear, avoid JS-specific jargon, and explain reasoning and trade-offs plainly. Keep sections few but strong. Long explanations are fine; too many sections are not.

Before you write, figure out what changed based on the diff to the default branch. Commit messages are secondary.

How to determine changes (use the available tools in this order):

-   Prefer the repository-aware changes/codebase/github tools to get the diff between the current branch (HEAD) and the repository default branch.
-   Determine the base branch as the repo default branch. If unavailable, discover via GitHub. If still unknown, read origin/HEAD. Fallback order: default → origin/HEAD → master → main.
-   If needed, run shell commands to compute the diff: fetch latest, then compare HEAD to the base branch to list changed files and hunks. Use commit messages only to enrich rationale, not as the primary source.

Diff analysis checklist:

-   Classify changes by area (src, test, docs, tasks, scripts, config/ci).
-   Detect runtime/product behavior changes (e.g., src/ and public interfaces), versus tests-only or docs-only edits.
-   Note notable risk factors: dependency/version changes, security-sensitive areas, performance-affecting code, network/filesystem, startup logic.

## Title

-   Use imperative mood, keep it concise (aim ≤ 72 chars), and include scope in parentheses when helpful.
-   Prefer Conventional Commit style types when natural (e.g., `fix`, `test`, `docs`, `refactor`) but don’t force it.
-   Include ticket/issue ref if applicable. Use `[WIP]` prefix for drafts.

Examples:

-   `fix(cli): make --host tests robust across local DNS setups`
-   `test(harness): make mb spawn wait configurable to reduce flakes`

## Summary (required)

-   2–4 bullets of what changed at a high level and why it matters.
-   Explicitly state scope (e.g., tests only) and whether runtime behavior changes.

## Context (required)

-   Briefly explain the problem in real-world terms. Link issues/docs if relevant.
-   Define any unavoidable jargon in one line.

## Changes (required)

-   Bullet the key changes with short rationale (group by file if it clarifies).
-   Call out what intentionally did NOT change.

## Validation (optional; include if functionality, tests, or risky areas changed)

-   How you verified it (e.g., test suite results, manual checks). Include counts/timings if useful.
-   Note any expected skips and why they’re correct.

## Impact & Risks (optional; include if runtime, deps, security, perf, or API surface changed)

-   Scope of impact (tests, harness, product). Product/security/perf changes, if any.
-   Known risks/trade-offs and how they’re mitigated.

## Reviewer Notes (optional; include for non-obvious decisions, migrations, or env-specific behavior)

-   What to focus on while reviewing. Any feedback specifically requested.
-   @mention people/teams who should take a look and why.

## Follow-ups (optional; include if TODOs or deferred items remain)

-   Any deferred cleanups or future improvements.

---

Tips

-   Keep the structure minimal; put details into Context/Changes instead of adding more sections.
-   Write for senior non-JS readers: concrete examples > jargon.
-   If long, add a 2–3 line TL;DR at the top of Summary.

Operational notes for the agent

-   Primary source of truth: the diff between HEAD and the base branch. Secondary: commit messages.
-   Only include optional sections when justified by the diff analysis; omit empty/low-value sections.
-   If the diff is empty or ambiguous (e.g., branch not ahead of base), say so briefly and suggest next steps (push commits, select correct base).
-   Output: Write the final PR title and description to `tmp/pr-description.md` at the repo root, overwriting any existing content. Do not open or file a PR on GitHub; generating the local file is the only deliverable.
