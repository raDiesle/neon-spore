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

Seven bodies and three motions are converted off the four games
`docs/tower-defence.md` already reads — that page's "What has been converted"
section lists them, and they are on the SHAPES tab as free contours. The two
that were deliberately **not** converted are named there too, with the reason,
and that half matters: a catalogue that only grows stops meaning anything.

What is left is a different game, not more of the same one. The four already
read are a vertical tower defence, a bullet heaven, a lane defence and a lane
defence with a fringe on everything — and the second and third gave up one body
each, because their vocabulary is ours already. Pick a game whose bodies are
built out of something this catalogue has never drawn: hard polygons carrying
*life* (Neon Pulsefire spends them and we only spend them on rock), bodies made
of separate parts that stay apart, or anything whose silhouette changes because
of what it is *doing* rather than what it is.

Read the existing seven first. Each carries an `owner` line saying what was
left behind and why, and the useful pattern in them is that the conversion is
never the picture — it is the one claim the outline makes, redrawn. A card that
does not name what it dropped has not been converted, it has been traced.

Each lands as a **free** contour, never a `draft`: a draft names an idea in
`docs/spec/ideas.md` and nothing collected this way is one. Expect to move the
counted assertions in `drawn-size.test.ts` and `long-axis.test.ts`; both say in
their own headers that the denominator moves when a body is added.

`Check: on the SHAPES tab, does each converted body read as the thing it was converted from — and does it still read at 26 px?`

## A DISABLED BUTTON IN THE DIRECTOR HAS NO STYLE OF ITS OWN
_claude/burn-disabled-button-style · tools/director/index.html tools/director/src/rail.ts tools/director/test_
**Proposed by the run.** The half `015ad71` could not reach: it owned
`rail.ts` and not the stylesheet.

`015ad71` fixed COPY and DELETE looking live on a boss wave, and found the
cause was not the guard — the guard had been right since `ba352ba`. It was
that `tools/director/index.html` has **no `button:disabled` rule at all**,
while `button { color: var(--dim); cursor: pointer; }` applies whatever the
state is. A disabled button rendered pixel-identical to a live one: same
colour, opacity 1, and a pointer cursor inviting the press that would be
refused.

Because that lane owned only `rail.ts`, it fixed the two buttons it was sent
for by setting `style.opacity` and `style.cursor` inline. That works and is
the wrong place for it — **every other disabled control in the director still
looks live**, and the next one written will inherit the same trap.

Move it to the stylesheet: one `button:disabled` rule, and drop the inline
styles from `rail.ts` once it covers them. Then check the director for other
controls that are disabled somewhere and have never looked it.

`Check: with a boss wave selected, does every greyed control in the director read as unpressable before you press it?`

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
