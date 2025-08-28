---
mode: "agent"
tools: ["changes", "codebase", "github"]
description: "Generate a clear commit message for the staged changes"
---

### Commit message helper 🔧

Goal: Produce a high‑quality, Conventional Commits message for the staged
changes. Keep it concise and useful.

Standards

-   Conventional Commits 1.0.0
-   Chris Beams’ 7 rules (subject ≤ 50 chars, blank line, wrap body at ~72,
    imperative mood, no trailing period)

Output rules (copy‑paste ready)

-   Return only the final commit message content
-   No code fences, quotes, Markdown, headings, or explanations
-   Structure: title, blank line, optional body, optional footer(s)
-   Wrap body to ~72 chars; no trailing spaces; use Unix newlines

Format

-   Title: <type>(<scope>)<!?>: <short summary>
    -   type (lowercase): feat, fix, docs, style, refactor, perf, test, build,
        ci, chore, revert
    -   scope (optional): e.g., cli, controllers, models, util, web, views, docs,
        test, build, ci
    -   ! (optional) for breaking change; also add a BREAKING CHANGE footer
    -   summary: imperative mood, ≤ 50 chars, no trailing period

Body (when it adds value)

-   Explain the what and why (not the how). Mention user-visible changes,
    risks, tradeoffs, or alternatives. Use bullets if clearer.

Footers (as needed)

-   BREAKING CHANGE: <description>
-   Closes #123 / Refs #123
-   Co-authored-by: Name <email>

Workflow

1. Gather context:
    - List staged changes (added/modified/renamed/deleted) and skim diffs to
      infer intent, scope, and whether the change is breaking
    - Do not include any analysis or file lists in the final output
2. Write the title per the Format rules
3. Add a body only if it improves clarity
4. Add relevant footers

Examples

-   feat(cli): add gzip flag for http replay
-   fix(controllers): handle null imposter port without crash
-   docs: clarify contributing guide and commit format
-   refactor(util): extract shared logger config
-   perf(models): reduce matcher allocations under load
-   test(web): add crawler edge cases for gzip pages
-   ci: cache node_modules in workflow
-   chore(release): cut 2.9.1
-   revert: feat(api): add experimental endpoint

Return only the complete commit message string, with no additional text.
