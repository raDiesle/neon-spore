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

## 1. Start it

From the worktree's root, in the background:

```bash
bun run dev
```

That is the whole command. **Do not set `DIRECTOR_PORT`.** A port belongs to
a tree (`tools/ports.ts`): the main checkout keeps 4174, and every worktree
derives its own stable number from its own path. Two sessions in two trees
therefore cannot collide, and neither can retire the other — while an
OS-assigned port (`DIRECTOR_PORT=0`, `dev:once`) would hand the user a
different URL on every restart and make the number worthless in a log.

Read the port off its first line — `director on http://localhost:<port>` —
and confirm it is really the director before handing it over:

```bash
curl -s http://localhost:<port>/__director
```

It refuses to start beside a stranger, retires an older copy *of its own
tree*, and exits after an hour of silence. None of that is a substitute for
step 3.

## 2. Open it in the user's real Chrome

Not the in-app Browser pane — the user asked to test it themselves, which
means their own browser, in a window they can drive.

Load the Chrome tools if deferred, then navigate:

```
ToolSearch: "select:mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__tabs_context_mcp"
```

Create a tab, navigate it to `http://localhost:<port>`, and stop there — it
is theirs to drive now. Leave the tab open; do not close it on their behalf.
After a later code change, re-navigate the same tab rather than opening a
second one: the director hot-reloads, so the tab only needs a reload.

## 3. Ask what's next, and shut down when merging

Once it is up and handed off, ask (`AskUserQuestion`) which of the two things
this worktree's task ends with:

- **Keep working here** — the session continues and the server stays up.
- **Merge to main and shut down** — see below.

**Merging to main always ends with the worktree's servers stopped.** Not the
idle timeout's job: that is a backstop for a leak, not a way to finish. A
server left answering on a merged worktree's port serves a tree that is about
to stop existing, and the next `curl` against it returns a confident 200 from
nowhere. So, in this order:

1. `bun run check` — never merge a red tree.
2. Rebase onto `main` (it moves; another session may well have pushed while
   this one was working) and re-run `check` after resolving anything.
3. Merge from the **main** checkout: `git -C <repo-root> merge --ff-only
   <branch>`. If main has uncommitted work in the way, save the diff to a
   patch first and reapply it after — never discard it.
4. Stop every server this worktree started, by asking it to quit rather than
   killing a pid:
   ```bash
   curl -s http://localhost:<port>/__director/quit
   ```
   `/__preview/quit` for a game preview. Then confirm each is actually gone
   (`curl` again and expect a failure), and kill any still-running background
   tasks the session owns.
5. Only then remove the worktree and its branch. A session cannot remove the
   worktree it is running inside — say so and leave that one step to the
   user rather than pretending it is done.
