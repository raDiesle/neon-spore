# Parked

Ideas a session had and did not act on. Optional, every one of them — nobody
owes this file anything.

It exists because both alternatives were worse. A suggestion made in a report
is read once on a phone and scrolled past; a suggestion filed in
`docs/spec/ideas.md` is filed with the design, which is the wrong shelf for
"the director could show this list beside TO CHECK". So it goes here, in the
commit, where a later session with nothing but the clone can pick it up.

It is **not** the outstanding list. `bun run checks` derives that from the
`Check:` trailers, and every row on it is an obligation: work that landed and
that nobody has looked at. A row here is the opposite — work nobody has decided
to do. Keeping the two in one place would make the outstanding list somewhere
that some rows matter and some do not, which is how a list stops being read.

**The format.** One `##` per idea, the date and the branch it came off under
it, then two or three sentences: what it is, why it was not done then, and where to start.

An entry leaves by being **deleted** — done or refused, the history keeps it
either way. Nothing is ticked here. A file of ticked boxes is a file nobody
reads to the bottom of.

## The one-screen tester cannot pull half of THE WARDEN's tethers

2026-08-27 · claude/boss-concepts-implementation-4hri7c

A finger on the field is signed with the seat this device holds, and in the
`test` role that seat is player 1. Half the Warden's cycles clamp player 1, and
you get no leverage on your own tether — so on those cycles a mouse cannot
touch the line at all and the rescue has to go through the **G** key, which is
player 2's hand. That is correct for the finished game (one role per device)
and awkward for the one screen everything is actually tested on.

Not done here because the fix is a choice about the test rig rather than about
the boss: either the field's touch carries a modifier for "the other seat", or
the `test` role signs a finger with whichever seat is *not* currently clamped —
which is a rule that exists only in a view nobody ships. Start at
`field.seat` in `packages/render/src/touch.ts`.

## The Warden's phase table is written twice, in prose and in code

2026-08-27 · claude/boss-concepts-implementation-4hri7c

`WARDEN_PHASES` in `packages/sim/src/warden-cycle.ts` and the table in
`docs/spec/bosses.md` 11.4 carry the same three rows. The director's boss panel
already renders the code's copy rather than a third one, so the tool is honest;
the spec is the copy free to drift. The queen has exactly the same problem one
section up.

Not done here because the general fix is the interesting one: `tools/director`
already parses `## N Title — tail` sections out of the spec (`sections.ts`), so
a check that a spec table matches the constant it describes would cover both
bosses and every one after them. Start at `tools/director/src/roster.ts`, which
already reads `bosses.md`.
