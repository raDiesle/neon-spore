# Queue

Work that has been decided on and not yet done. First in the file is next.

It is worked **by hand, one session at a time**: the owner picks an entry, opens
a session on it, and deletes the entry from this file in the commit that
finishes it. Nothing here is ticked, nothing records progress, and no tool reads
this file to decide what to do next. There used to be one — `bun run burn` read
this as a board and drove lanes off it — and it went with the rest of the
unattended machinery.

It is not `docs/release-notes.md`, which records what already landed and is
closed. It is not `docs/parked.md`, which is ideas nobody has decided on. This
is the middle one: **decided, not yet done**.

**Every entry says who wanted it.** Either **Asked for by the owner.** or
**Proposed by the run.**, those two words and no third option — a session that
has read a spec file and found a gap is proposing, however obvious the gap.
That label is the first sort key: the owner's asks are worked before anything a
session thought of, and a new entry that cannot honestly carry the first label
is filed below every entry that can.

The label is not a ranking of quality. Several of the proposed entries below
are better ideas than the ones above them, and that is exactly why the
labelling exists — designing is more enjoyable than fixing, so work a session
invented rises on its own unless something holds it down.

**An entry may not change what the game already draws.** CLAUDE.md's *A look is
offered, never replaced* binds every entry in this file: a new colour, a new
animation or a different shape is written as an alternative on the NOT BUILT
YET pages, beside the shipped one, and the owner decides by looking. A brief
that would replace a look outright is a brief that has been written wrong, and
the three narrow exemptions are named there rather than here.

The italic line under a heading, where one is present, names the paths that
entry expects to touch. It used to be `branch · the paths that lane owns`, and
the ownership half was load-bearing when two lanes ran side by side — nothing
runs side by side now, so it is read as prose: a note about blast radius, and a
branch name nobody is bound by.
