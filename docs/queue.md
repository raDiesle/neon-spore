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

## A FRAME OF THE WRONG WAVE PROVES NOTHING, AND IT TOOK THREE TRIES TO AVOID
_claude/burn-frames-aim-y8 · tools/frames/run.ts tools/frames/capture.ts_
**Asked for by the owner.** — the half the frames lane could not reach.

`bun run frames <sha>` works and costs about twelve seconds a pair. Using it on
the shell creature the day it landed took **three runs**, and the first two
produced honest, comparable, completely useless pictures: the default is wave
1, so the pair showed a wave the change could not appear in. A tool whose
output is a real frame of the wrong thing is worse than one that refuses,
because the picture looks like evidence.

**Two separate faults, and the second is the one that wasted the tries.**

**It does not know where to look.** The commit knows: `docs/checks/<sha>.md`
carries a `where` field naming the place a person should stand, and most of
them name a wave or a page. Read it. If `where` names a wave, open that wave;
if it names a director page, say so and refuse rather than screenshotting the
game. A `--wave` flag stays for the cases the field cannot express.

**`--wave N` is off by one against every other way a wave is named.** Passing
`--wave 20` opened the wave the HUD calls **W21**. Whichever end is wrong, a
number that means something different here than in the wave list, the director
and the HUD is a trap for every future use. Fix it so one wave has one number,
and **take a name too** — `--wave "THE THIRD SHOT"` is what a person actually
has in hand, and it cannot be off by one.

**And say when nothing moved.** If the two frames are identical, the tool
should say so instead of writing them. That single line would have caught both
wasted runs at once, and it is also the guard for the rule the run works to: a
picture of an unchanged field teaches nothing and trains the eye to skip the
next one.

Finished when `bun run check` is green, a commit whose restatement names a wave
is captured on that wave with no flag at all, a wave can be given by name, the
number agrees with the HUD, an identical pair is reported rather than written,
and the commit carries `Check: does bun run frames, given only a sha, put the
change in the picture?`

Model `sonnet`, effort `think hard`. Read `docs/checks/` for what `where`
actually contains across two dozen entries before deciding how to parse it —
the field is prose, and a parser that only understands one phrasing is the same
trap in a new place.

## A RELOAD KEEPS THE PLACE AND FORGETS EVERYTHING ELSE
_claude/burn-director-session-s15 · tools/director/src/session.ts tools/director/src/main.ts tools/director/index.html_
**Asked for by the owner.**

The owner works in the director while lanes land behind them, so the page
reloads under them several times an hour — and every reload costs them the tab
they were on, the wave they were looking at, and a dialog asking whether they
meant to lose changes. Fifty-odd checks are waiting on that person looking at
things. Friction here is not a nicety; it is the tax on the one activity
nothing else in this repository can do.

**And the owner has drawn the line through the middle of it, so read this
before the rest:** *whenever I reload, I don't want my director settings stored
without me having saved them — it should ignore and reset what it was before.*
Asked which half of this lane that killed, they said: **keep the place, drop
the state.**

So the lane is two rules and they point in opposite directions on purpose.

**Where you were is navigation, and it survives.** Which tab, and which wave
index, in `location.hash` or a query string, written with
`history.replaceState` on every change so it never grows a history entry per
click, and read once on load. That buys three things and only one of them was
asked for: a reload returns you where you were; back and forward start working;
and a link now names a place, so `?tab=shapes&wave=7` can be sent to a phone or
pasted into a `Check:` trailer's *where* row. That last one compounds — every
check written from now on could point at exactly the thing rather than
describing the route to it.

Keep the vocabulary small and stable: a tab name and an index, nothing that
needs escaping, nothing that breaks when a panel is renamed. **An unknown or
malformed value must fall back silently to the default** rather than throwing —
a URL outlives the code that wrote it, and a link from three weeks ago should
open the page rather than a blank screen.

**Everything else is a setting, and it resets.** The director starts from what
ships, every single load: default dials, default skin, default motion, LIT off,
no recovered draft, nothing carried over from the last session by any route.
Not a prompt offering yesterday's work back — *nothing*. The reason is that a
page which quietly hands back state the owner did not save is a page whose
every judgement is about the wrong thing, and this director exists almost
entirely to be judged from. A wave that looks wrong has to be a wave that is
wrong, not one still wearing an experiment from Tuesday.

**A place is not a setting, and the boundary is worth stating in the file.**
The test is whether the value changes what is drawn or what would ship. A tab
name and a wave index say *which thing you are looking at*; a dial value, a
skin pick and an edited wave say *what it looks like*. The first goes in the
URL. The second does not go anywhere. Write that sentence into
`session.ts`'s header, because the next lane that wants to remember the SHAPES
skin bar across a reload will read it and stop.

**Explicit save already has a shape in this tree, and it is the only shape.**
`tuning.ts`'s preset bar writes to `localStorage` on a `+ SAVE` press and
restores only when a named preset is clicked — the owner's rule, already
implemented, before it was stated. Nothing in this lane adds a second
mechanism, and nothing in it writes storage at all.

**So `beforeunload` stays, and the old brief was wrong to plan its removal.**
It was going to go because a recovered draft meant nothing was lost by
reloading. Drafts are not recovered any more, so the warning is once again the
only thing between a reload and a lost edit, and `store.dirty` is honest about
when it fires. Leave it exactly as it is.

**Audit while you are in there, and report rather than fix.** Grep the whole
director for `localStorage` and `sessionStorage` and say in the commit what
each remaining call is and whether it is behind an explicit press. Two are
known — the tuning presets, which are, and the brush-hints toggle in
`main.ts`, which is a UI preference set by a deliberate click. If a third
turns up that restores editable state on its own, name it in the report; it is
somebody's lane, not a thing to fix inside this one.

Finished when `bun run check` is green, a reload returns to the same tab and
wave, back and forward work, an unknown URL value opens the default page
rather than failing, every dial and every picked skin or motion is back at its
default after a reload, no new storage key exists anywhere in the director,
`beforeunload` is untouched, and the commit carries `Check: after a reload, are
you back on the same tab and wave with every setting back at its default?`

Model `sonnet`, effort `think hard`. The judgement is the line between a place
and a setting, and it is now decided — spend the thinking on stating it so the
next lane cannot cross it by accident. Read `tools/director/src/main.ts`,
`bindTabs` and `tools/director/src/tuning.ts` first.

## THREE MOUTHS ABOVE THE SHIP, ONE OF THEM GOES SOMEWHERE
_claude/burn-boss-maze-b1 · packages/sim/src/maze.ts packages/sim/src/maze-round.ts packages/sim/test/maze.test.ts packages/content/src/maze-rounds.ts_
**Asked for by the owner.**

The owner's boss. Three entrances open above the ship, one path through the
tangle behind them actually reaches the thing worth hitting, and the pair has
to find which before the clock runs out and then fire into it. A shot down the
right mouth travels the path and lands; a shot down a wrong one finds something
it should not have, and the ship pays for it.

**It is a boss and not an interlude, and that is decided rather than open.**
The owner called it a boss and the rules agree: `docs/spec/interludes.md` says
in its own words that passing and failing leave by the same door — *no hull, no
score, no scar* — and that the one thing an interlude must never do is end the
run. A round whose failure damages the ship cannot be an interlude. It can be a
boss, and there is a precedent that is almost exactly this shape: **THE
MIRROR** replaces the field with its own choreography, and answers a wrong
input with a rock out of its own body into whichever column the cannon is
standing in — *the ordinary hull breach every missed rock already is: a crater,
a crack, and damage that stays.* Read `mirror.ts` and `mirror-round.ts` before
designing anything; this round's failure should arrive through the same door
rather than inventing a second kind of damage.

**The one thing that decides whether this is worth building.** A labyrinth both
players can see is a solo puzzle with an audience — one person traces the path,
says "left one", and the other presses. That is not this game. **The tangle has
to be split across the two screens**, so neither can trace it alone and the
answer only exists in the sentence between them. Three ways it could split, and
picking one *is* the design work:

- by **region** — each sees half the tangle, and the path crosses the seam, so
  one reads the first half and the other must recognise where it comes out;
- by **layer** — one sees the walls and the other sees which junctions are
  open, so both are looking at the same place and neither sees a path;
- by **end** — one sees the three mouths, the other sees the target and what
  lies beside it, so the pilot knows where to shoot and only the navigator
  knows what happens next.

The third is the closest to `THE SPLICE` in `docs/spec/ideas.md` — *a nest of
tangled cable, two ends, and the colour on the wrong device* — so read that
entry and say in the commit whether this is a different round or that one
wearing a different coat. If it is that one, say so and build it under its own
name rather than shipping a near-duplicate.

**And one ambiguity that must be settled, not guessed.** "The shooting moves
the path" reads two ways: either the shot *travels* an existing fixed path, or
firing *shifts* the tangle so the path changes under the pair. The first is a
quiz; the second is a system, and much better — but it is also a different
round, because a maze that moves cannot be memorised and the pressure comes
from tracking rather than from reading. Decide it, write down which and why,
and note the other in the commit for the orchestrator to park.

**The rules that are not negotiable.** `sim` never imports `render`; no
`Math.random`, no `Date.now`, no DOM; integers, sub-tile values in thousandths.
The tangle, the chosen mouth and the shot's position along the path all go into
`hashWorld` — decision 23 made hashed the default and named the only
exceptions, and two devices that disagree about which mouth is open are two
devices playing different bosses. The rounds are **authored, not generated**:
`mirror.ts` says *nothing here is random — the rounds are authored in the
director, so the whole fight is the same fight on both devices*, and that is
the pattern to copy.

The no-travel rule does not forbid the shot. `docs/decisions.md` #21 says that
rule is about the field, and this is a boss with its own picture — the same
licence THE MIRROR already takes.

Finished when `bun run check` and `bun run test:determinism` are green, a
replay test plays a round from both seats and proves neither can find the path
alone, a wrong mouth breaches the hull through the existing door, and the
commit carries `Check: does the pair actually have to talk, or does one of
them just read it out — play a round from both seats and try to solve it in
silence`.

Model `opus`, effort `ultrathink`. The split is the whole design and the maze
is arithmetic; a labyrinth that one player can solve alone is a boss that
teaches the pair to stop talking, which is the one failure this game cannot
absorb. Read `docs/spec/couplings.md`, `docs/spec/bosses.md`, `mirror.ts` and
`docs/spec/ideas.md`'s `THE SPLICE` first.

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
