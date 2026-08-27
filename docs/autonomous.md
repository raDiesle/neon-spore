# Running unattended

A mode, not a mood: the person says *spend what is left of the week on the
game, decide for yourself what*, and then goes away for hours. What follows is
what that arrangement needs in order not to end in a pile of branches nobody
can land.

It is driven by `.claude/skills/autonomous`. This file is the reasoning; the
skill is the procedure.

## The three lists, and why there are three

`bun run checks` derives **obligations** from the `Check:` trailers: work that
landed and that nobody has looked at. `docs/parked.md` holds **offers**: ideas
a session had and did not act on. Neither can answer the question an
unattended run asks every twenty minutes — *what is the next thing, and is
somebody already on it* — so `docs/queue.md` is the third, and it is an
**intention**: work that has been decided on and not yet done.

Merging any two of them breaks the one that gets absorbed. An obligation list
where some rows are optional stops being read. An offer list you are expected
to work through stops being a place to write things down.

An entry leaves the queue by being **deleted**, the same rule as parked. There
is no tick, because progress is *derivable*: a lane is done when its branch is
an ancestor of `main`. That fact survives a session dying mid-run, a laptop
closing and a token limit — which nothing written by the session would.

## Lanes

A **lane** is one branch, one worktree, one subagent, and a declared list of
the paths it owns. The ownership line is the whole of what makes two of them
safe to run at once, so it is checked before a batch starts rather than
discovered when the second one tries to land: `bun run burn` refuses to be
quiet about two lanes that own the same path.

Two or three at a time, not six. The limit is not the machine, it is the
**landing** — `main` is linear, so every lane rebases onto a trunk that moved
under it, and the fourth one pays for the three before it. `CLAUDE.md` says
the same thing about cloud sessions and for the same reason.

Files that everything wants — `packages/sim/src/config.ts`,
`packages/sim/src/world.ts`, `packages/render/src/canvas2d.ts`,
`apps/game/src/main.ts` — are owned by nobody. A lane may add to one, in a
single contiguous region, and expects to replay over somebody else's addition.
A lane that would *restructure* one of them is not a parallel lane; it goes on
its own, between batches.

## Landing

`bun run land`, from inside the lane's worktree. It replays the lane onto
`main`, runs `bun run check` on the *result*, and only then fast-forwards — so
a red tree stops before the trunk has moved rather than after. It will not
merge. If the fast-forward is not available it refuses, because the shape this
history has is not an accident.

Landings happen one at a time, in queue order, driven by the session that owns
the run. A subagent commits; it does not land.

## What the run may not do

**It may not decide that something was looked at.** A wave watched at tempo, a
silhouette at 26 px, a colour against the field — none of that is available to
a session, and a landed lane says so in a `Check:` trailer rather than
offering a green tick that covered less than usual. `docs/verification.md`
holds the loop; the trailers are how the morning finds out what to open.

**It may not go quiet on a question.** A lane blocked on a design decision
stops, writes the question into its report, and the run moves to the next lane
rather than guessing and building on the guess.

**It may not leave the queue lying.** Anything decided-but-not-started stays
in `docs/queue.md`, and anything noticed-and-not-done reaches `docs/parked.md`
before the run ends. A run whose plan exists only in the transcript has ended
with no plan.

Parked notes are filed by the orchestrator rather than by the lane that had
them, and that is not tidiness. `docs/parked.md` is the one file every lane
would want to append to, so three lanes appending to its end is three rebase
conflicts in the file whose content nobody would think to look at twice. A
lane reports its idea; the run files it once, after the landings.

## Stopping and starting again

A window of tokens runs out mid-run. That is expected, and it is why nothing
above is stored in the session.

Coming back — an hour later, or a day later, in a session that knows only the
clone — is `bun run burn`. It reads the queue, asks git about every lane's
branch, and prints what landed, what is in flight and what has not started. A
lane that was halfway through is a branch with commits on it and a worktree
still standing; picking it up is `bun run burn --next` and reading its brief.

There is nothing to reconstruct because nothing was remembered.
