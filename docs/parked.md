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


## The catalogue's draft count should be derived, not typed

2026-08-27 · claude/cleanup-stale-worktrees-branches-txkdj4

`docs/asset-catalogue.md` opens with "N drafts: so many creatures, so many
bosses". It has now been wrong twice in one day — it read "four bosses" while
there were seven, on both sides of a merge, because two sessions each
incremented the number they found instead of counting. Every other number in
the repo that goes stale this way has a test or a generator behind it.

Not done here because the fix is a choice and this was a merge: either a test
that parses the sentence and compares it against `CATALOGUE` — cheap, ugly, and
it fails for the right reason — or the line becomes generated, like
`bun run checks` derives its own. Start at `tools/shape-sheet/test/drafts.test.ts`,
which already counts drafts by status and would only need the slots.
