# Queue

The ordered work an unattended run walks. First in the file is next to be done.

It is not the outstanding list — `bun run checks` derives that from the
`Check:` trailers, and every row of it is an obligation somebody incurred by
landing something. It is not `docs/parked.md` either, which is ideas nobody
has decided on. This is the middle one: **decided, not yet done**.

An entry leaves by being **deleted**, once its branch is on `main`. Nothing
here is ticked, and nothing here records progress — a lane is done when its
branch is an ancestor of the trunk, which git can be asked and a file cannot.
`bun run burn` asks. `docs/autonomous.md` has the rest.

**Every entry says who wanted it, on its own line under the branch.** Either
**Asked for by the owner.** or **Proposed by the run.**, those two words and no
third option — a run that has read a spec file and found a gap is proposing,
however obvious the gap. That label is the first sort key: the owner asks are
worked before anything the run thought of, and a new entry that cannot honestly
carry the first label is filed below every entry that can.

The label is not a ranking of quality. Several of the proposed entries below
are better ideas than the reports above them, and that is exactly why the
labelling exists — designing is more enjoyable than fixing, so work the run
invented rises on its own unless something holds it down.

**A lane may not change what the game already draws.** CLAUDE.md's *A look is
offered, never replaced* binds every entry in this file: a new colour, a new
animation or a different shape is written as an alternative on the NOT BUILT
YET pages, beside the shipped one, and the owner decides by looking. A brief
that would replace a look outright is a brief that has been written wrong, and
the three narrow exemptions are named there rather than here.

**What the owner asked for outranks what a run decided to do next.** The
order is not a judgement about which work is better; it is about where the
work came from. A brief that can point at something the owner said — *CILIA is
slow*, *shadow and light in the game*, *I cannot tell what combines with what*
— goes above one derived from a spec file, a `--candidates` sweep or a session
noticing a gap while it was passing. Both are legitimate work and the second
kind is often the more interesting, which is exactly why it drifts to the top
on its own if nothing holds it down.

So a run refilling this file sorts on that first and on everything else
second, and a new entry that cannot name an owner ask is filed below every one
that can, however obvious it feels while writing it. A lane whose brief does
not say where it came from is a lane nobody can sort later.

The italic line under each heading is `branch · the paths that lane owns`. Two
lanes may not own the same path. The files everything wants — `config.ts`,
`world.ts`, `canvas2d.ts`, `apps/game/src/main.ts` — are owned by nobody: add
to one in a single contiguous region and expect to replay over somebody else.

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

`Check: on the SHAPES tab, does each converted body read as the thing it was converted from — and does it still read at 26 px?`

## LANDING PRINTS THE COMMAND THAT MAKES AN ORPHAN
_claude/land-verified-removal · tools/land tools/land/test_
**Proposed by the run.** The half `749911e` could not reach: it owned
`tools/checks` and not `tools/land`.

`749911e` taught the sweep to verify a removal instead of trusting it, and to
find directories git no longer knows about. `bun run land` was not in its
paths, and land is where the orphan is actually made.

Land deletes the branch itself, then **prints `git worktree remove <path>` for
somebody to run by hand.** That command is the one with the fault: on Windows
it fails to delete the directory while a handle is still held, drops the
registry entry anyway, and leaves a full checkout on disk that git believes is
gone. Measured immediately after the sweep lane landed — the printed command
was run verbatim, failed exactly that way, and the orphan it made was then
found and removed by the sweep the same commit had just added. The tool
repaired damage its sibling had told a person to cause.

Land should do the removal itself, with the retry-and-verify that now lives in
`tools/checks/sweep.ts`, and print a path only when it genuinely could not
remove one. The guarantee does not change: a tree with uncommitted work is
left alone and named, never forced.

`Check: land a lane — is its worktree folder gone from disk when the landing finishes, with no command left for you to run?`

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

`Check: on the SHAPES tab, is there one body from that screenshot rather than two — and does the retired one's reason say why it lost?`
