---
name: worktree-preview
description: Hand a worktree's webserver to the user in their real Chrome for hands-on testing — the director to look at a wave, the game itself when a control has to be played — then let them choose in chat whether to keep working or merge to main and shut the server down. Use whenever work in a git worktree is ready to be looked at by a human, or the user asks to "test it", "open it in chrome", or "give me a running instance".
---

# Previewing a worktree for the user

**Which server depends on what the user has to do with it**, and there are
only two answers.

**The director** (`tools/director`, step 1) for anything to be *looked at*:
a wave, a silhouette, a boss, a number. It renders through the real
`@neon-spore/sim` + `@neon-spore/render` pipeline and lets the user place,
step through and inspect waves and bosses interactively, which is strictly
more than a playthrough. This is the default.

**The game** (`game-dev` in `.claude/launch.json`, step 1b) for anything to
be *played*: a control, a gesture, anything a thumb does. The director's
stage answers a click with the editor's own meaning — placing, scrubbing,
pausing — so the game's controls are not reachable there at all. Handing the
director over for a control change costs the user a turn and they have to
come back and say so, which is how this paragraph came to be written.

If the task touched `apps/game/src/input.ts`, `keys.ts` or anything either of
them reaches, it is the second one.

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

## 1b. Or start the game, when it has to be played

```
preview_start { "name": "game-dev" }
```

That is the `dev:game` entry: `bun --hot`, port 3000, hot reload, and no idle
exit — the human's server, and the one CLAUDE.md names as theirs. Not `bun run
preview`: that one exits after 30 seconds without a request, and a page being
played makes none, so it dies under the user mid-test.

Port 3000 is pinned rather than derived from the tree, so two worktrees cannot
both hand it over. Ask before taking it if something already answers there.

Both servers can run at once, and often should: the director to look at the
wave, the game to play it.

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
   `/__preview/quit` for a game preview. A `game-dev` server has no quit
   route — it is a plain `bun --hot`, so stop it the way it was started
   (`preview_stop` with its `serverId`). Then confirm each is actually gone
   (`curl` again and expect a failure), and kill any still-running background
   tasks the session owns.
5. Only then remove the worktree and its branch. A session cannot remove the
   worktree it is running inside — say so and leave that one step to the
   user rather than pretending it is done.
