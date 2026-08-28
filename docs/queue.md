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
**The seven `burn-skin-*` lanes below are one block and they are first.** The
owner asked for richer looks — more skins, more animation, offered *beside*
the ones the catalogue already has rather than replacing them. They all draw
on the NOT BUILT YET → SHAPES cards in the director and **none of them touches
`packages/render`**, which is the doctrine `tools/director/src/skins.ts`
already states in its own header: a card is where a look is decided before the
game learns to draw it. That is also why no lane in this block can break a
wave.

`skins/split-s0` is the enabling lane and the other six sit behind it. They
share `tools/director/src/skins/index.ts`, which is owned by nobody and gets
one line from each — a contiguous region, replayed over, exactly like
`config.ts`.

**On the reference sheets, and there are two of them on purpose.**

`docs/reference/20-surface-designs-concept.png` is the target: twenty surfaces
as they should read — fish scale, reptile armour, beetle shell, butterfly
wing, octopus, frog, snake, sea urchin, coral, nautilus, jellyfish, diatom,
dragonfly eye, lobster, starfish, perlmutt, pinecone, sand dollar,
caterpillar, spore pod. Each carries three words naming what it is made of
(*thick plates · irregular · natural*), and those words are the brief for a
skin more than the picture is.

`docs/reference/20-surface-designs.svg` is the same twenty attempted in SVG,
and **the distance between the two files is the most useful thing in either.**
The SVG version is honest about where a vector surface falls down: most of its
spheres are one uniform lattice tiled across a circle, with a single glow laid
over the top. The concept sheet is not tiled at all — its plates change size
across the body, thin toward the rim, catch the light individually, and break
their own pattern. Compare 09 CORAL in the two files: branching structure in
one, wavy stripes in the other. Or 10 NAUTILUS: a chambered spiral, against a
plain sphere with a swoosh on it.

So the failure mode has a picture now, and it is the one every lane in this
block is warned about in its own words — *one lattice at two scales* is not
two materials. A surface reads when its elements vary with position on the
body and are lit individually. That is what the light lane exists for, and it
is why a pattern lane that composes `litPass` will beat one that does not.

Neither file is art to copy in: a fixed illustration cannot wrap a contour
re-sampled from `contourAt` every frame, so every skin here is generated in
contour space or it slides off its body within a second. The owner also linked
three svgrepo files as further reference. **No lane fetches a URL and no lane
vendors a third-party file** — that carries a licence, which is the owner's
call and not a lane's.

## THIRTY-ONE OF THIRTY-THREE CHECK FILES ARE NAMED AFTER A COMMIT THAT NEVER LANDED
_claude/burn-checks-key-y9 · tools/frames/run.ts tools/checks/restated.ts_
**Asked for by the owner.** — the half two landings could not reach.

A lane writes its work, reads the sha, and commits `docs/checks/<sha>.md`. Then
the orchestrator lands it, **and `bun run land` rebases** — so the commit that
reaches `main` has a different sha, and the file is named after one that no
longer exists. Counted just now: **2 of 33 filenames name a commit on `main`.
The other 31 name nothing.**

**This has been harmless for exactly as long as nothing looked the file up by
name.** `bun run checks` joins a restatement to its trailer on the *quoted
sentence*, which is why the list has always rendered correctly and why nobody
noticed. The doctrine even records the reason — a lane that lands behind
another is replayed and its sha stops existing — it simply never followed the
thought as far as the filename.

**Then `bun run frames` landed and looked one up by name.** Given a sha from
`main` it says *no docs/checks/<sha>.md found* and refuses, which is correct
behaviour on top of a broken key. The feature that was just built to read
`where` cannot reach `where` for any commit on the trunk. It was proved against
the two files whose shas happen to match, which is exactly the sample that
hides this.

**Fix the join, not the filenames.** Renaming 31 files fixes today and breaks
again on the next rebase. The key that survives is the one `checks` already
uses: **the trailer's own text.** Give `restated.ts` a lookup that takes a
commit, reads its `Check:` trailers, and finds the restatement quoting them —
then `frames` asks that instead of guessing a path. A filename becomes a
convenience, and a wrong one stops mattering.

**Say what should happen to the 31 stale names.** Leaving them is defensible if
nothing reads them; renaming them at land time is defensible too. Pick one,
argue it in the commit, and do not do both.

Finished when `bun run check` is green, `bun run frames <sha>` finds the
restatement for a commit on `main` with no flag, a test proves the lookup works
for a commit whose file is named after a different sha, and the commit carries
`Check: does bun run frames work on a commit that landed yesterday?`

Model `sonnet`, effort `think hard`. The trap is subtle and the fix is small;
spend the thinking on the sample, because the reason this shipped is that both
test files happened to be the two that match.

## A TANGLE IS ONLY A PUZZLE IF IT CANNOT BE TRACED BY EYE
_claude/burn-boss-maze-draw-b2 · packages/render/src/maze-draw.ts packages/render/test/maze-draw.test.ts_
**Asked for by the owner.**

Behind b1, which owns the state this reads.

The picture is the round. Three mouths above the hull, a tangle behind them,
and — on whichever screen the split gives it to — the thing worth hitting.

**The drawn difficulty is the real difficulty, and it is measurable.** The
catalogue already carries this exact problem and its answer: THE SPLICE's card
in `docs/asset-catalogue.md` has an outstanding check asking whether its tangle
is *genuinely unfollowable, or whether you can get from one end to the other by
eye* — and it says the round dies if a player can trace the strand anyway. Same
here, and worse, because there are three strands and only one matters. Count
the crossings and say the number in the commit; a tangle that reads as a tangle
at card size may be a diagram at phone size, which is the size that counts.

The shot travelling the path is the moment the round pays off, so it is drawn
rather than teleported: it enters a mouth, is out of sight inside, and either
arrives or does not. **Where it goes wrong must be legible** — a shot that
simply fails to arrive teaches nothing, and the pair has to learn something
from a wrong answer or the round is a coin toss with extra steps.

State that outlives a frame goes in `Effects` and is cleared in
`Effects.reset()`; `packages/render/test/restart.test.ts` fails if a field is
added and not cleared, which is correct rather than an obstacle.

Finished when `bun run check` is green, `frame.test.ts` passes through the
strict canvas stub, `restart.test.ts` passes unweakened, and the commit carries
`Check: at phone size, is the tangle unfollowable by eye, or can you trace a
mouth to the target without talking — the director, the maze round, at 380 px`.

Model `sonnet`, effort `think hard`. Read `docs/spec/graphics.md`,
`packages/render/src/mirror.ts` and the SPLICE entry in
`docs/asset-catalogue.md` first.
