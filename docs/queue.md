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

## COLLECT AND CONVERT A SECOND GAME'S BODIES
_claude/convert-second-game · tools/shape-sheet/src/forms tools/shape-sheet/src/drafts tools/shape-sheet/test docs/tower-defence.md_
**Asked for by the owner.** *"i expect you collect also boss screenshots and
enemy unit screenshots. then try some to convert that they look near to their,
but for our game."*

Nine bodies and four motions are converted off the five games
`docs/tower-defence.md` already reads — that page's "What has been converted"
section lists them, and they are on the SHAPES tab as free contours. The two
that were deliberately **not** converted are named there too, with the reason,
and that half matters: a catalogue that only grows stops meaning anything.

What is left is a different *kind* of source, not more games of the same kind.
The five already read are two bullet heavens, a vertical tower defence and two
lane defences, and the last three of them gave up one body each because their
vocabulary is ours already — Nova Drift's whole line-up came back as things
this catalogue draws under other names, which the page lists one by one.

So the yield is falling, and the lane should say what it is fishing for rather
than pick another shooter. The two gaps the nine did not close: a silhouette
that changes because of **what the body is doing** rather than what it is (a
thing that opens, digs in, or folds away — `THE LURE`'s fold is the only one we
have), and hard polygons carrying **life** rather than rock. Pick a source that
has one of those, from anywhere — a shmup boss's transformation phases, an
insect, a machine. It does not have to be a tower defence and the page's title
has already stopped being accurate.

Read the existing seven first. Each carries an `owner` line saying what was
left behind and why, and the useful pattern in them is that the conversion is
never the picture — it is the one claim the outline makes, redrawn. A card that
does not name what it dropped has not been converted, it has been traced.

Each lands as a **free** contour, never a `draft`: a draft names an idea in
`docs/spec/ideas.md` and nothing collected this way is one. Expect to move the
counted assertions in `drawn-size.test.ts` and `long-axis.test.ts`; both say in
their own headers that the denominator moves when a body is added.

_Judge it by looking: on the SHAPES tab, does each converted body read as the thing it was converted from — and does it still read at 26 px?_

## THE BURR IS A SEA URCHIN AND ITS OWN CHECK SAYS SO
_claude/burr-or-pommel · tools/shape-sheet/src/forms/studded.ts tools/shape-sheet/src/drafts/tower-defence.ts tools/shape-sheet/src/retired.ts tools/shape-sheet/test docs/tower-defence.md_
**Proposed by the run.**

Check `#215` asks whether THE BURR reads as the body it was converted from.
Drawing it says no, and names the reason: `studded`'s `blunt` rounds a *tip*,
and the thing that makes the source's rim read is its *waist* — a cap wider
than the neck carrying it. A radius function keeps only the outer of the two
radii a club has, so the neck is not something `studded` renders badly, it is
something `studded` cannot represent. `forms/clubbed.ts` and THE POMMEL are
that body converted a second time, walked instead of sampled.

Two bodies now stand for one proposal, which is a state the catalogue should
not be left in. This lane is the decision made concrete once the owner has
looked at both: retire the loser into `retired.ts` with its reason, and leave
one entry.

It is filed as proposed rather than asked because the *verdict* is the owner's
and is not in yet. The lane does not choose. What it may do without waiting is
the part that is already settled either way: `studded`'s doc comment claims
`blunt: 1` "flattens into a cap", and a caller reading that will keep expecting
a club out of it. Say there what the form cannot do, and point at `clubbed`.

_Judge it by looking: on the SHAPES tab, is there one body from that screenshot rather than two — and does the retired one's reason say why it lost?_
