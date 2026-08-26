---
name: worktree-preview
description: Hand a worktree's director webserver to the user in their real Chrome for hands-on testing, then let them choose in chat whether to keep working or merge to main and shut the server down. Use whenever work in a git worktree is ready to be looked at by a human, or the user asks to "test it", "open it in chrome", or "give me a running instance".
---

# Previewing a worktree for the user

Always the **director** (`tools/director`), never the game's own preview or
`dev:game`. The director is the one server that renders through the real
`@neon-spore/sim` + `@neon-spore/render` pipeline *and* lets the user place,
step through and inspect waves and bosses interactively — it is strictly
more than a static playthrough, and it is what this flow always hands over,
whatever the task touched.

Several worktrees, and several Claude sessions, can be doing this at once —
never claim the fixed port (4174) the human's own `bun run dev` uses.

## 1. Launch on a free port, with a human-length idle timeout

From the worktree's root:

```bash
DIRECTOR_PORT=0 DIRECTOR_IDLE_MS=1800000 bun --hot tools/director/server.ts
```

Run it with `run_in_background: true` and read its output for the port it
bound (`director on http://localhost:<port>`). `DIRECTOR_PORT=0` asks the OS
for a free port — nothing to collide with, so nothing to arrange with other
worktrees or sessions. `DIRECTOR_IDLE_MS` overrides the script's own 60-minute
default only if a longer session is expected; the default is already sized
for a person thinking about a wave, not an agent forgetting a process, so
raising it further is rarely needed — 1800000 (30 min) is a floor, not a
ceiling, if the built-in default already covers the session.

See `tools/director/server.ts`'s own header for the rest of the hygiene
(fixed vs. ephemeral port, the `/__director` handshake, the reclaim
protocol) — it is inherited for free, not re-implemented here.

Confirm it's actually the director answering, not something else on that
host, before handing it to the user:

```bash
curl -s http://localhost:<port>/__director
```

## 2. Open it in the user's real Chrome

Not the in-app Browser pane — the user asked to test it themselves, which
means their own browser, with their own window they can interact with.

Load the Chrome tools if deferred, then navigate:

```
ToolSearch: "select:mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__tabs_context_mcp"
```

Create a new tab and navigate it to `http://localhost:<port>`. Tell the user
what you launched and why they won't collide with anything else running,
then stop — do not screenshot or interact with it yourself; it is theirs to
drive now. Leave the tab open; do not close it on their behalf.

## 3. Ask what's next

Once the server is up and handed off, ask (`AskUserQuestion`) which of the
two things this worktree's task ends with:

- **Keep working here** — the session continues, server stays up (still
  bounded by its own idle timeout as a backstop).
- **Merge to main and shut it down** — per `CLAUDE.md`'s Git section: fast
  forward or rebase the worktree branch onto `main` from the main checkout,
  then remove the worktree and delete the temporary branch. Stop the
  director first (`curl http://localhost:<port>/__director/quit`, or kill
  the background task) — a server left running past the worktree's own life
  is the one thing the idle exit is a backstop for, not a substitute for
  actually stopping it once the task is done.

Do the merge from the **main** checkout (`git -C <repo-root> merge --ff-only
<branch>`, or rebase first if main moved), never by force-pushing over
anything. Only remove the worktree (`git worktree remove`) and branch after
the merge lands cleanly — a merge conflict means stopping to sort it out
with the user, not discarding either side.
