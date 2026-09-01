# Working with Claude on this repo

## The agent needs something to check itself against

Claude stops when the work *looks* finished. Without a check it can run itself,
you are the verification loop and every mistake waits for you to notice. In a
game that is especially awkward: whether a bubble feels right is only visible
on screen.

That is why the sim/render split is not cosmetic. A headless deterministic
simulation can be tested; a canvas cannot.

What stays yours: game feel, glow, timing as an experience. That is the right
division of labour, not a limitation.

## Configuration in this repo

- **`CLAUDE.md`** — loaded into every session, therefore short and stable.
  The import rule, the commands, the conventions. Anything that changes often
  belongs in `docs/`.
- **`.claude/skills/`** — for what is needed occasionally: `new-creature`,
  `new-wave`, `delegate` and `worktree-preview` carry the full procedure, so it
  does not have to be explained.
- **`.claude/hooks/`** — for what must happen without exception. The
  determinism test runs after every edit inside `packages/sim`. A rule in
  CLAUDE.md is a hint; a hook is binding.
- **Plan mode** — read and plan first, check the plan, then build. It suits the
  way this project has been worked on so far.
- **Subagents** — for searching the codebase, so the main session does not fill
  up with file contents.

## Verification runs against the build, not the dev server

A hot-reloading dev server is the wrong thing to check an agent's work against,
for three reasons that all end the same way — a result reported as verified
that was read off something other than the code just written.

It serves a transform of the source rather than the bundle that ships. It keeps
state across edits, so what is on screen is the sum of several attempts. And it
outlives the turn: nothing in a session ends the process, so the next session
finds port 3000 occupied, quietly takes 3001, and verifies against a server
started days ago. That is not hypothetical — on 2026-08-23 a `bun --hot` from an
earlier session was still holding the port, listening on `::1` only, while
`127.0.0.1` sat free for a second server to bind beside it.

So `bun run preview` builds and serves `apps/game/dist`. The build costs about
ten milliseconds, which is the whole argument: there is no speed to trade away.

The guarantee is in the server, not in the instruction. `apps/game/preview.ts`
holds a fixed port and probes both loopback families before binding; if an older
preview answers it asks it to quit, and if a stranger answers it stops with an
error rather than killing a process it cannot identify. It exits by itself after
30 seconds without a request, so even a preview that escapes the session
cleans itself up. `.claude/launch.json` offers this and nothing else, which
leaves `bun run dev` where it belongs — with a person watching hot reload.

*Amended 2026-08-24:* that fixed port was 3000 — the same one `bun --hot` takes
by default — and the refusal to kill a stranger turned it into the failure it
was written to prevent. A session that found a person's dev server on 3000 got a
preview that would not start, and then measured the dev server anyway: a browser
check handed a URL has no way of noticing which server answered. The stranger
check worked exactly as designed and still yielded a verified result off the
wrong bundle.

Two ports now, so the collision is impossible rather than merely detected:
`dev:game` is pinned to 3000, `preview` sits on 4173. (`dev` itself now
launches the director, on its own port, 4174 — unrelated to this collision,
which is specifically about the game's hot server and its built preview.) A
preview that fails to start leaves an empty port behind, and an empty port
cannot be mistaken for a passing check.

`/__preview` answers `{"app":"neon-spore-preview"}` and settles who replied — a
dev server hands back `index.html` for every unknown path, so a 200 is not
evidence of anything. `bun run preview:once` binds an OS-assigned free port for a
throwaway check or a second worktree; several can run side by side.

## Parameters, not shouting

Not "make the bubble softer" but named values — stiffness, damping, elongation,
wobble, restitution — and a comparison screen where several versions run side
by side with *identical* input. The agent produces variants; you pick.

## Model choice

Plan with a large model, execute with a fast one. See `docs/token-budget.md`.

## Git

**Straight to `main`.** No feature branches, no pull requests. One person works
on this repo; a branch means a merge step later and a review that never comes.
Agents default to branching before they commit on a default branch — that
default is off here, and it is written into `CLAUDE.md` so every session sees
it.

The safety this normally buys is bought differently: `bun run check` before
anything is called done, the determinism hook after every edit in
`packages/sim`, and small commits that are easy to read and easy to revert.

If a change really is exploratory, a branch is still allowed — but it is a
deliberate choice to be stated, not the default.

**Committing is part of finishing.** Claude commits at the end of a task
without being asked, provided `bun run check` passes and the task is actually
done. The four conditions are in `CLAUDE.md`; the one that matters most is
staging by path rather than `git add -A`, because the working tree is not
guaranteed to hold only this session's work — that happened on 2026-08-23, when
a second session was mid-refactor and a blanket commit would have captured a
broken state.

This is deliberately *not* a hook. A hook cannot tell a finished result from an
abandoned one, cannot write a message that explains why, and cannot decide what
to leave out. The `Stop` hook already guards the part that is mechanical:
typecheck and tests have to pass before the turn ends.

## House style for changes

- Touch only what changed. Do not regenerate whole files.
- Bundle change requests rather than sending them one at a time.
- Default mode is spec mode: collect ideas, record decisions, no code, until
  building is explicitly asked for.
