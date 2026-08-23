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
- **`.claude/skills/`** — for what is needed occasionally: `new-creature` and
  `new-wave` carry the full procedure, so it does not have to be explained.
- **`.claude/hooks/`** — for what must happen without exception. The
  determinism test runs after every edit inside `packages/sim`. A rule in
  CLAUDE.md is a hint; a hook is binding.
- **Plan mode** — read and plan first, check the plan, then build. It suits the
  way this project has been worked on so far.
- **Subagents** — for searching the codebase, so the main session does not fill
  up with file contents.

## Parameters, not shouting

Not "make the bubble softer" but named values — stiffness, damping, elongation,
wobble, restitution — and a comparison screen where several versions run side
by side with *identical* input. The agent produces variants; you pick.

## Model choice

Plan with a large model, execute with a fast one. See `docs/token-budget.md`.

## House style for changes

- Touch only what changed. Do not regenerate whole files.
- Bundle change requests rather than sending them one at a time.
- Default mode is spec mode: collect ideas, record decisions, no code, until
  building is explicitly asked for.
