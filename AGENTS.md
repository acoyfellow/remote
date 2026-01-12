# Ralph Agents

- PAUSED: false
- MAX_FAILURE_RETRIES: 3
- COMMIT_AUTHOR: ralph-bot <ralph@example.com>

## Loop checklist
1) Load AGENTS.md and scripts/ralph state files.
2) If paused, exit immediately.
3) Pick the first `"status": "todo"` story in prd.json and mark it doing before work.
4) Keep one story per run and make the smallest possible diff.
5) Run scripts/ralph/guard.sh before committing; never bypass it.
6) Update progress.txt with a short learning when a story is marked done.
7) If failures exceed MAX_FAILURE_RETRIES, set PAUSED: true and push state.

## Working files
- scripts/ralph/prd.json - story queue (todo/doing/done)
- scripts/ralph/progress.txt - chronological learnings
- scripts/ralph/constraints.json - guard limits
- scripts/ralph/failure.json - consecutive failure bookkeeping

## Footguns
- Do not touch build artifacts (dist, node_modules, .svelte-kit, build).
- Avoid changing more than 25 files or 400 total lines per iteration.
- Guard must pass before any commit or push.***
