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

## THE GAME HAS A SHEEN, A RIM AND A CRATER, AND NO IDEA WHERE THE LIGHT IS
_claude/burn-depth-light-d3 · packages/render/src/key-light.ts packages/render/test/key-light.test.ts packages/content/src/light.ts_

The owner asked for shadow and light in the game itself, and the gap is exact:
**the key light exists only in the tool.** `tools/director/src/skins/light.ts`
has the direction, the terminator, the contact shadow, the specular and the
rim, and by the skin block's own doctrine nothing in that directory may touch
`packages/render`. Meanwhile the game draws a hull sheen, a rimmed crater and a
glow on every body — all of which imply a light, and none of which names one.
A grep for a light direction across `packages/render` returns prose.

So the field is lit from nowhere in particular, and that is why it reads flat
however good each individual effect is: five things each implying a slightly
different source is exactly the twelve-directions failure the card lane was
built to prevent, arriving in the shipping renderer instead.

**The first decision is where the direction lives, and it is a real one.** The
director's skins may not import `packages/render`, and `packages/render` may
not import `tools/`. So one constant now has to be readable from two places
that are forbidden to reach each other. Two honest answers: put it in
`packages/content`, which both already read and which is data rather than code
— a unit vector breaks no purity rule; or duplicate it and add a `COPIES` row
to `packages/sim/test/purity.test.ts`, which exists precisely for a rule that
must be called rather than re-derived. **Prefer content.** Say which and why in
the commit, and if it is content, note that this is the first drawing fact to
live there and argue that it belongs.

**What gets lit, and what deliberately does not.** The hull first: it is on
screen every frame, it is the player's own ship, and it carries no ammunition
colour. Then rocks and the meteor, which are inert by fiction and are the one
body whose volume is already better than the creatures' — `drawMeteor` builds a
linear gradient today, so it has an implied direction that should become the
shared one, and if its current implied direction disagrees with `KEY` that
disagreement is already on screen and worth naming.

**Creatures are held back, and the reason is a rule rather than caution.**
`docs/alive.md` refuses a hue split on a body in a wave, because a creature's
red-or-cyan is a gameplay fact the pair says out loud across a two-second
delay, and `light.ts`'s own header already records what a shipped version would
have to clear: at 26 px the tint may never move a red body toward cyan, because
the colour *is* the callout. So a creature may take the *value* half of this
light — a terminator and a contact shadow, which are brightness — and not the
hue half. Build it so that split is expressible rather than a comment, and put
a test on it: a lit red body must not measurably shift toward cyan.

**Nothing here changes the simulation.** Lighting is a drawing decision;
`hashWorld` is untouched, no `SimConfig` field decides an angle, and two
devices that disagree about a highlight still agree about the world. And
nothing may allocate a gradient per frame — `glow.ts`'s `haloSprite` caches on
`${color}@${radius}` and `sheen.ts` rounds its radius to avoid exactly that,
so follow the pattern already in the file rather than inventing a cache.

**The gate on this lane is lifted.** It used to sit behind the card check —
five lanes are built on `light.ts` and nobody has seen a lit body move — but
the owner has now asked for shadow and light in the game directly, and asked
for the direction to be decided. That is the decision, so the lane proceeds.
The card check stays outstanding and still matters: if it comes back saying a
lit card reads as a gradient rather than as volume, that is a finding about
this lane too, and it arrives as a fix rather than as a reason not to have
started.

Finished when `bun run check` is green, `frame.test.ts` passes through the
strict canvas stub, the hull and the rocks are lit from one named direction
that nothing else in the tree contradicts, a test proves a lit red body does
not shift toward cyan, and the commit carries `Check: does the field read as
lit from one place, or do the hull, the rocks and the glow disagree about where
the light is — a full wave at tempo, watching the hull and a rock together`.

Model `opus`, effort `think hard`. Where the constant lives is the decision and
the drawing is the easy half. Read `tools/director/src/skins/light.ts`,
`packages/render/src/sheen.ts`, `glow.ts`, `meteor.ts` and `docs/alive.md`
first.

## A BODY SHADES THE HULL AND NOTHING ELSE, INCLUDING THE BODY BELOW IT
_claude/burn-depth-cast-d4 · packages/render/src/cast-shadow.ts packages/render/test/cast-shadow.test.ts_

Behind `burn-depth-light-d3`, which brings the light into the game — you
cannot cast a shadow without a direction, and the direction must be the one
constant everything else uses.

A body near the hull now throws a shadow onto it. The owner wants the other
half: **bodies shading each other**, so the field reads as objects in a space
rather than as sprites on a plane. It is the right ask and one thing about it
has to be settled first, because it is not obvious and it is not cosmetic.

**The light is upper left, and that is the problem.** `light.ts` fixes `KEY` at
upper left for a stated reason — the hull's own aura sits low and even, so a
lit shoulder up and left argues least with the glow. Screen axes, y down. So a
shadow falls **down and to the right**. On the field, down is toward the hull.

Which means **a body shadows the body below it — the one nearer the hull, the
one about to cost the pair something.** The more urgent body is darkened by the
less urgent one. That is exactly backwards from what the pair needs, and it is
a consequence of a direction chosen for a card, on a page with no hull and no
falling.

So the first question this lane answers is **whether the game's light is the
card's light.** Three honest answers and the lane picks one with a reason:

- **Keep upper left and accept it**, if the darkening is small enough that a
  body's colour still reads — the callout is red-or-cyan, and a shadow is a
  value change rather than a hue change, so there is room. Measure it.
- **Give the game its own direction**, high and near-frontal, so shadows fall
  short and mostly sideways and no body is buried by the one above it. Then
  `light.ts`'s comment is right about cards and the game's constant is right
  about the field, and both say why.
- **Cast onto the hull and the rocks only**, and not between creatures at all.
  The weakest for realism and the strongest for the thing the game is: no
  creature ever gets harder to read because of another one.

**The rule that outranks the look.** A creature's red-or-cyan is a gameplay
fact the pair says out loud across a two-second delay. **A shadow may never
make a body hard to name or hard to see.** Not "it looks a bit dark" — the
failure is a pair calling a column wrong because one body was under another.
Put a floor on it and test the floor: a shaded body's colour must stay on the
right side of whatever distinguishes red from cyan, at 26 px, at the deepest
shadow the system can produce.

**And rocks are the free case.** A meteor is inert, carries no colour and is
already the one body with volume. A rock shadowing a creature, or a creature
shadowing a rock, costs the pair nothing and buys the whole effect. If the
measurement above goes badly, **ship that much** — inert bodies cast and
receive, living bodies only cast onto the hull — and say so as the finding.

Nothing here changes the simulation: shadows are drawing, `hashWorld` is
untouched, and two devices that disagree about a shadow still agree about the
world. Cost matters — this is per pair of nearby bodies per frame, so bound it
by distance the way `contact-shadow.ts` bounds itself by rows, and do not
allocate a gradient per pair per frame.

Finished when `bun run check` and `bun run test:determinism` are green,
`frame.test.ts` passes, the light's direction for the game is decided and
written down once with its reason, a test proves a shaded body stays nameable
at the deepest shadow, and the commit carries `Check: does a body in another's
shadow still read as the colour it is?`

Model `opus`, effort `think hard`. The direction is the judgement and the
drawing is arithmetic — a shadow that falls toward the hull darkens exactly the
bodies the pair most needs to read. Read `packages/render/src/contact-shadow.ts`,
`depth.ts`, `tools/director/src/skins/light.ts` and `docs/alive.md` first.

## A CHECK A COMMAND CAN SETTLE SHOULD NEVER REACH THE LIST
_claude/burn-land-autorun-s17 · tools/land/run.ts tools/checks/run.ts_

`bun run checks --run` exists, and the director has a `▶ RUN THE COMMANDS`
button beside it, and both are manual. That is the mistake: a check whose
trailer names a repository command needs no person at all, so it should be
**decided at the landing** and never appear on a list a person reads.

The owner said it plainly, and the code agrees — `bun run land` already
imports `parseLog` from `tools/checks/trailers.js` and prints
*"N check(s) landed with it"*, so at the moment of the fast-forward it knows
exactly which checks it just created. `runCommand` in `tools/checks/repo.ts`
already runs one and `run.ts` already records a `PASS`. Everything needed is
built; the two halves have simply never been joined.

So: after the fast-forward, run the runnable ones **among the checks this
landing added**, record their verdicts, and print what happened.

**Only the new ones, and that distinction is the whole design.** `--run` today
runs every outstanding runnable check in the backlog. Doing that on every
landing would re-run the same eight commands thirty times an afternoon, and a
step that slow gets skipped, which is how it stops being automatic. The
landing settles what the landing created; the backlog stays a manual sweep.

**What this changes about the list is the point of it.** `bun run checks`
becomes purely *things that need an eye* — no mixed list, no scanning past
eight rows a machine could have answered. That directly serves the shorter,
clearer report the restatement lane is already queued to build, and the two
should be read together.

**A failure must not block the landing, and must be loud.** The tree was green
before the fast-forward; a `relay:check` that fails afterwards is a finding
about the code, not a reason to unwind a landing that has already happened.
Record the `FAIL`, say so in the closing lines with the command that failed,
and leave it on the list where a person will see it. Never silently pass, and
never leave a failure looking like it was not run.

**Two things to be careful of.** A command may take a long time or need
something the machine has not got — `bun run relay:check` wants a wrangler on
a port — so a command that cannot start is *not run* rather than failed, and
must say which of the two it was. And landing is the one step in this
arrangement that must stay reliable: if running a check can hang, it needs a
timeout, and the landing has to survive the timeout rather than inherit it.

Finished when `bun run check` is green, landing a commit whose trailer names a
command settles that check without anybody asking, a failing command is
reported loudly and does not unwind the landing, an unrunnable one is
distinguished from a failing one, and `bun run checks` afterwards lists only
what still needs a person.

No `Check:` trailer — the whole lane is about things a command decides.

Model `sonnet`, effort `think hard`. Read `tools/land/run.ts` around its
`parseLog` call, `runCommand` in `tools/checks/repo.ts`, and `runAll` in
`tools/checks/run.ts` first — all three halves exist and this joins them.

## NINETEEN GROUPS OF DIALS SIT BESIDE THE ONE WAVE YOU ARE EDITING
_claude/burn-director-ship-split-s16 · tools/director/src/ship.ts tools/director/src/ship-fields.ts tools/director/index.html_

The left column runs WAVE, then SHIP, and SHIP is the whole of `SimConfig` —
nineteen groups from AIM down to PLUMBING, one of which is literally labelled
*not a dial a person turns*. None of it belongs to the wave in front of you.
`aimMillis` is the same number on wave 3 and wave 30; so is the hull's repair
rate, the beat, the score. They are beside the wave because that is where the
panel was built, not because that is where they are needed.

**The cost is not space, it is attention.** A column that shows everything all
the time teaches you to scroll past it, and then the thing you actually needed
is scrolled past too. The owner edits a wave and reads nineteen headings that
have nothing to do with it, every time.

**So the column holds what belongs to this wave, and the rest moves behind a
button on the topbar.** The split is not by taste; ask of each group *does
changing this change the wave in front of me, or the game everywhere?*

- **Stays** — the wave's own entries and its metadata, and any group that is
  about something the current wave actually contains. If the wave has a warden,
  WARDEN belongs beside it; if it has none, those dials are noise. The same for
  VANE, MIRROR, QUEEN, and for THE GAUGE, which is an interlude's round and
  only matters in a gap that carries one. **Show a boss's group when the wave
  holds that boss**, and the panel stops being a list and starts being an
  answer.
- **Moves** — everything global: AIM, GUARD, MAW, POD, LANCE, GRIP, HULL,
  RADAR, THE BEAT, THE FORK, BRIEFING, THROB, SCORE. These are the ship, and
  the ship is the same ship on every wave.
- **Moves and stays moved** — PLUMBING. Its own label says nobody turns it.

**One thing must not be lost in the move.** `FIELD_GROUP` is a
`Record<keyof SimConfig, GroupName>`, which is why adding a config field is a
hard typecheck failure until the director is told where it goes — a lane
discovered that today by hitting it. That exhaustiveness is the reason no
tunable can be added and left unreachable in the tool that tunes it, so
**whatever shape the split takes, every field must still be reachable and the
Record must stay exhaustive.** A group that is hidden is not a group that is
gone, and a "show everything" escape hatch has to exist for the day something
is missing.

**And the topbar is getting crowded**, so this is a place to be careful rather
than quick: the director already has tabs, a checks sheet, a backlog sheet and
a states control. One more button is fine; a second row is a different
problem, and if this needs one, say so instead of building it.

Finished when `bun run check` is green, the left column shows the wave and only
what the wave contains, the ship's global dials are one click away and all of
them are reachable, `FIELD_GROUP` is still exhaustive, and the commit carries
`Check: with a wave open, is everything in the left column about that wave?`

Model `sonnet`, effort `think hard`. The judgement is which groups are about a
wave and which are about the ship, and the boss groups are the interesting
case — they are global numbers that only matter contextually, which is exactly
the line this lane is drawing. Read `ship-fields.ts`'s `GROUP_ORDER` and
`ship.ts` first.

## A RELOAD PUTS YOU BACK AT THE TOP AND ASKS IF YOU MEANT IT
_claude/burn-director-session-s15 · tools/director/src/session.ts tools/director/src/main.ts tools/director/index.html_

The owner works in the director while lanes land behind them, so the page
reloads under them several times an hour — and every reload costs them the tab
they were on, the wave they were looking at, and a dialog asking whether they
meant to lose changes. Fifty-odd checks are waiting on that person looking at
things. Friction here is not a nicety; it is the tax on the one activity
nothing else in this repository can do.

**`bun --hot` cannot fix this and it is worth saying why.** It re-evaluates
`server.ts` in the same process — that is *server* state, and the comment in
that file says so. A browser page load is a fresh document either way, so
anything held only in a module-level variable is gone by construction. The fix
is not a bun flag; it is to stop keeping the state only in memory.

**Put the place in the URL.** Which tab, and which wave index. `location.hash`
or a query string, written with `history.replaceState` on every change so it
never grows a history entry per click, and read once on load. That buys three
things and only one of them was asked for: a reload returns you where you
were; back and forward start working; and a link now names a place, so
`?tab=shapes&wave=7` can be sent to a phone or pasted into a `Check:`
trailer's *where* row. That last one compounds — every check written from now
on could point at exactly the thing rather than describing the route to it.

Keep the vocabulary small and stable: a tab name and an index, nothing that
needs escaping, nothing that breaks when a panel is renamed. **An unknown or
malformed value must fall back silently to the default** rather than throwing —
a URL outlives the code that wrote it, and a link from three weeks ago should
open the page rather than a blank screen.

**Then the dialog, which is a different problem wearing the same coat.**
`main.ts` guards `beforeunload` on `store.dirty`, which is honest — the store
holds `WAVES` cloned for editing and `dirty` means real unsaved work. The
warning is not wrong; it is just the *only* thing offered, and "warn and lose
it" is the weakest of the available answers.

So save the draft instead. `store.waves` and `store.index` to `localStorage`
on change, debounced; on load, if a draft differs from the shipped `WAVES`,
**say so visibly and let the owner choose** — a small line at the top of the
editor naming what was recovered, with restore and discard. Then `beforeunload`
can go entirely, because nothing is lost by reloading.

**Restoring silently is the trap, and it is worse than the dialog.** A draft
recovered without saying so means the owner is editing yesterday's unfinished
change while believing they are looking at what ships, and every judgement they
make from that page is about the wrong thing. Visible, dismissable, and it
names the wave it belongs to.

**Scope, deliberately.** The SHAPES skin/motion/LIT state and the VERSUS slot
live in their own panels and are *not* in this lane — they would drag four
files two other lanes are working in. Design the URL vocabulary so they can be
added later without changing what this lane writes, and say in the commit what
the next key would be called.

Finished when `bun run check` is green, a reload returns to the same tab and
wave, back and forward work, an unknown URL value opens the default page
rather than failing, an unsaved wave edit survives a reload behind a visible
prompt, and `beforeunload` is gone. The commit carries `Check: after a lane
lands and the page reloads under you, are you still where you were?`

Model `sonnet`, effort `think hard`. The judgement is what belongs in a URL
that outlives the code that wrote it; the storage is arithmetic. Read
`tools/director/src/main.ts` and `bindTabs` first.

## A RESTATEMENT IS A FILE PER COMMIT, NOT A LINE IN A SHARED ONE
_claude/burn-restated-split-p2 · docs/checks tools/checks/restated.ts_

`docs/checks/restated.md` is a single file that every lane appends to, at the
end, in the same commit shape — so two lanes landing in one evening conflict
there by construction. That is the exact failure this repository diagnosed
this morning about `docs/parked.md` and fixed by taking the writing away from
lanes; the skill then recreated it here an hour later.

The fix is not to take the writing away again — a restatement has to be
written by the session that knows what changed. It is to remove the shared
append point: one file per commit, `docs/checks/<sha>.md`, which is how the
entries are keyed anyway. Two lanes then never touch the same path, and the
reader gains nothing to merge.

**And a sha is not stable, which is the other half of the problem.** A lane
that lands behind another one is replayed, so the commit it keyed its
restatement to no longer exists — the drafts lane was rebased twice tonight
and said so: its key is only correct while the landing stays a fast-forward,
and nothing would notice it going stale except the orphan report. Splitting
the file does not fix that on its own.

`bun run land` is where it can be fixed, because that is the one place both
shas are known: it rebases, so it can see what each commit was and what it
became, and rewrite the key as part of landing — the same way it already
retires the queue entry. Do that, and prove it by landing something behind
another lane and watching the key follow.

**And while the parser is being rewritten, it gains the two fields the owner
asked for and loses the length nobody asked for.** The list is read on a phone,
in the two minutes before a laptop closes, and trailers written this year have
run to a thousand characters. The skill's `Check:` section now demands one
sentence and puts the detail in fields; this is the half that makes the fields
exist.

- **`before` and `after` become real fields**, parsed and printed beside
  `subject` / `changed` / `decide` / `where`. They are *what to put beside
  what* — `before: SCALE`, `after: MOUNTED SCALE`, naming the buttons that
  select each — because a look judged alone is judged against memory, and
  memory prefers whatever it saw last. `before: nothing, this is new` is a
  legitimate value and must be accepted rather than read as missing.
- **If either names a file under `docs/checks/`, print it as an image path**,
  so a lane that captured the same frame either side of its change has
  somewhere to put the pair.
- **The report gets shorter, not longer.** Today it prints the trailer, a
  derived hint and five restatement fields for every one of fifty-odd entries.
  Lead with the question and where to stand; put the rest behind a flag. Say in
  the commit what the default prints now and why that is the half a person
  actually acts on.

Finished when the parser reads a directory rather than a document, when the
existing entries are split without losing their keying, when a replayed commit
carries its restatement with it, when `before`/`after` are parsed and printed,
when the default report is materially shorter than today's, and when the skill
tells a lane to write `docs/checks/<sha>.md` in its second commit. The keying
stays exact — sha plus trailer text, word for word.
## THREE THINGS THAT DRAW A BODY HAVE HAD TO GUESS AT IT
_claude/burn-body-context-s14 · packages/content/src/own-motion.ts tools/director/src/skins/types.ts tools/director/src/shape-figure.ts tools/shape-sheet/src/motions/index.ts_

Not a look, an interface — and it is queued because it has now been found
three times by three lanes that each worked around it correctly and separately.

**A skin is told its reach and never its shape.** `shape-figure.ts` computes
`reach = max(w, h) / 2` and throws the aspect away. So `WIND`, needing to know
which way a body is long, looks the subject back up in `CATALOGUE` by
`ctx.name` — and falls back silently to "tall" for anything the catalogue does
not reach.

**A skin is told the time and never the motion.** `CILIA`, needing the body's
velocity to lean its fringe against the direction of travel, reads
`ctx.body.transform.baseVal.getItem(0).matrix` and differences it frame to
frame — which assumes `shape-figure.ts` writes a translate as the *first*
transform item. True today, promised nowhere; if that write changes shape the
fringe stops leaning and no test fails.

**A motion is told the clock and nothing else at all.** `poseAt(t: Beats)`
cannot see its carrier, so `PERISTALSIS` had to *declare* the long axis as x.
That lane measured the cost rather than hiding it: over the sixty catalogue
entries, **25 are wide** and x is right, **27 are round** and any direction is
fine, and **8 are tall** — TENDRIL, THE NEEDLE, RIBBON, THE SPLICE, THE CLAW,
POD and both HUSKs — where the swell squeezes *across* the body instead of
along it. That is wrong rather than arbitrary.

**And a third skin has since used CILIA's technique.** `NACRE` differences the
same transform matrix to slide its interference bands, because its shift has to
ride the body's own motion or it is a screensaver. So the cleanup below removes
**three** callers, not two. That lane also left the strongest argument for this
one existing: interference tracks the surface *normal*, so `p.rot` would drive
NACRE better than `p.dx`/`p.dy` — and reading rotation would mean a *second*
assumption about the transform list (that item 1 is the rotate), which is the
point at which working around the gap stops being reasonable. `TREMBLE`, which
has more rotation than drift, is the concrete case to test against.

Four lanes, four workarounds, one missing thing: **what is drawn does not
know what it is drawing.**

So: an optional `extent: { w, h }` on `SkinContext`, an optional velocity or
pose beside it, and an optional `axis` on `OwnMotion` — or, if it reads better,
one small shape handed to both. Decide which and say why; the judgement is
whether a motion should be handed its subject at all, since `poseAt` being a
pure function of a clock is what makes `MOTIONS` a table anyone can read and
`drafts.test.ts` able to sample it blind. **An `axis` field is data and keeps
that property; a subject argument does not.** Prefer the field unless you can
argue otherwise.

**Then remove the three workarounds**, which is the point: WIND stops looking
up the catalogue, CILIA stops reading a transform matrix, PERISTALSIS stops
declaring. Prove the pictures did not change — `WIND`'s own lane hashed every
catalogue entry at four poses to show its memo changed nothing, and that is the
technique.

**Two things to be careful of.** `own-motion.ts` is described in `docs/INDEX.md`
as *"how a body sways while going nowhere — the one copy of it"*, so adding a
field there touches the shipped game as well as the tool; nothing about this may
alter what the game draws, and `frame.test.ts` plus the replay tests are the
proof. And `packages/content` may not use `Math.random`, `Date.now` or the DOM
— an extent and an axis are constants, which is fine, but derive them at
authoring time and never at draw time.

Finished when `bun run check` and `bun run test:determinism` are green, none of
the four workarounds remains, a test proves the catalogue draws identically
before and after, and the eight tall bodies get a swell that runs along them.

No `Check:` trailer if the pictures are proven identical — and if the eight
tall bodies now look different, that *is* a visual change and needs one.

Model `opus`, effort `think hard`. The judgement is the field-versus-argument
question and everything else is a move. Read `WIND`'s `isWideBody`, `CILIA`'s
lean, `pulse.ts`'s header, and `docs/parked.md`'s two entries on this before
starting.

## SIX PIECES, AND EVERY ONE OF THEM IS ON THE GRID
_claude/burn-music-deep-m1 · packages/audio/src/music/deep.ts packages/audio/test/deep.test.ts_

The owner asked for music for a deep sea underground — mystical, and fluid.
Three of those four words the palette can already say; the fourth is the lane.

**What is already there, so nothing is rebuilt.** `packages/audio/src/music/`
holds six themes over a cell vocabulary — HEART, PLUCK, STEP, BREATH, BELL,
STAR, DUST, WASH, GRIND, ALIVE — arranged with `line`, `pulse` and `again`.
Two of them already lean this way: `deepCurrent` is a four-note bass turning
under a wavering low voice, and `pressure` is a very low saw walking down. So
*deep* is not the missing thing.

**The missing thing is fluid, and the reason is structural.** Every note in
every theme sits on a beat, because `line`, `pulse` and `again` all take beat
positions — the whole file is metrical, and water is not. What makes something
read as liquid is drift: two slow rates that do not divide into each other, so
the thing wanders and never quite repeats. That trick is already proven in this
repository, in a different medium — `DRIFT` in `tools/shape-sheet/src/motions/`
is exactly two non-dividing frequencies and its note says so in one line. The
engine can do it: a filter carries `freq` → `toFreq`, so a band can sweep, and
`burst` takes a `detune`. Check whether an oscillator's own pitch can glide
before designing around it, and say in the commit what you found — if it
cannot, the drift has to live in the filter and the amplitude, which is a
different piece and worth knowing before writing one.

**And the constraint is the subject, which almost never happens.** Talking is
the control scheme, so `band.ts` keeps 300–3000 Hz clear and *fails* a sound
that holds a tone in it — bodies below 300, sparkle above 3 k, only brief
transients crossing. Water is broadband noise, which is precisely the forbidden
middle. So a water piece here has to be a low body and a high glitter with a
hole between them — which is what deep water actually sounds like, a pressure
rumble under scattered high glints. **For once the rule and the mood want the
same thing.** Say that in the file header, because the next person will assume
the band fought them.

Three pieces, genuinely different rather than one at three tempos:

**TIDE** — the bed. Almost no pulse; two slow swells on non-dividing periods so
the loop point cannot be heard. The one piece that does not tell you where the
beat is.

**CAVERN** — mythical rather than merely sad. The existing six sit on 0/3/5/7/10,
which is minor and familiar; open the fourth and fifth and let them hang
unresolved, with long decay and a suggestion of a room too large to see the end
of. Ancient is an interval and a reverb, not a slower tempo.

**SILT** — fluid made of grain rather than tone: DUST and WASH scattered on a
rate that drifts against itself, so it is always moving and never arriving. This
is the one most likely to fail the band test, so write it last and against the
test.

Every one gets a `use:` line saying where it belongs, the way the existing six
do — that field is the reason the catalogue is legible, and a theme with
nowhere to go is a theme nobody plays. **They sit beside the six, never
replacing one**: decision 24, the owner decides later what is adopted, kept,
reused or dropped.

Finished when `bun run check` is green, all three pass `band.ts`'s in-band
budget as a test rather than by inspection, none of the six existing themes is
altered, they are auditionable in the director beside the others, and the
commit carries `Check: does TIDE read as water, or only as slow — the
director, TIDE then deepCurrent, with the game's own wave sound over it`.

Model `opus`, effort `think hard`. The drift is the lane and the notes are
arithmetic: a piece that is merely slow is what you get if the two rates
divide. Read `packages/audio/src/music/themes.ts`, `cells.ts`, `band.ts` and
`docs/spec/audio.md` first.

**This lane collides with nothing.** It is the only work in the queue inside
`packages/audio`, so it can run beside any graphics lane without a rebase.

## A SHELL THAT COMES OFF IN PIECES, AND A COLOUR NOBODY KNEW UNTIL IT DOES
_claude/burn-creature-shell-g1 · packages/sim/src/shell.ts packages/sim/src/shell-round.ts packages/sim/test/shell.test.ts packages/content/src/creatures.ts packages/content/src/briefings.ts packages/content/src/waves.ts_

The owner's creature, and most of it is already agreed and half of it is
already built. `docs/spec/systems.md` §5.6 asks for exactly this — *hits cut
real pieces out of it*, *3–6 splinters fly off*, and **the meteor craters to a
hard core that further hits only spark against**. `holes` exists in
`packages/sim`: `bullet-hit.ts` increments it against `cfg.maxHoles`,
`hash.ts` pushes it, and render places crater `k` from the id. That machinery
is built and shipped, for rocks. This lane gives it to a creature and adds the
one thing rocks do not have: something alive underneath.

**The shape of it.** A body that takes several shots. Each hit breaks a piece
out where it was struck, with a small burst at the break. **Two pieces**, and
the owner is right that two beats three. The pieces are column-wide slices, so
their number *is* the body's width on a seven-column field — three is a lot of
the field spoken for, two is proportionate. Two hits also brings the phase
reversal sooner, which matters because the reversal is the design and a shell
phase that outlasts the pair's interest in it has buried its own point. And
two has a virtue three does not: the players can take one slice each, so they
are symmetric right up to the instant the shell is gone and one of them
becomes the only one who can finish it. When the last is gone the core is
exposed — a plain creature in a plain colour,
which **nobody knew until the shell came off**, and which then needs the
matching shot like any other body.

**The two phases divide the work differently, and that is the point of it.**
Breaking the shell is colour-blind: either shot chips it, so either player can
work on it and neither has to be told which. Killing the core is
colour-locked: one specific player must finish it, and until the shell is off
nobody knows which. So an arrival that starts as *anyone, keep hitting it*
turns into *you, now, and only you* — and the turn happens at a moment the
pair cannot plan for. Read `docs/spec/couplings.md` before settling the
timings; that reversal is the whole design and everything else serves it.

**The constraint the owner found, and it is the sharp one.** The cannon fires
straight up, so a bullet meets whatever is lowest in its column first. A shell
stacked in rows would make its upper pieces permanently unreachable — the
lower ones would armour them, and the creature would be unkillable rather than
hard. **So the pieces divide the body vertically, not horizontally**: each is
a full-height slice, and every column of the body has exactly one piece in
front of it. Getting this wrong produces a creature that passes every test and
cannot be killed on a phone, so put the reasoning in the commit and make the
test prove it — fire up each column in turn and assert every piece is
reachable.

**Explicitly not in this lane**, and both are good ideas that belong after it:
a broken piece that keeps falling as a rock (the `Moulting` idea in
`docs/spec/ideas.md` proposes exactly that, and it turns one arrival into
cannon-then-shield in that order — real, and a second mechanic); and any
change to the meteor's own cratering. Do not touch `rock-impact.ts`.

**The rules that are not negotiable**, and this is the first lane of the run
inside `packages/sim`, so read `CLAUDE.md` twice: no `Math.random`, no
`Date.now`, no DOM, integers only with sub-tile values in thousandths, and
`sim` never imports `render`. Every new field on the creature goes into
`hashWorld` — see `docs/decisions.md` #23, which made *hashed* the default and
named the only four exceptions. A shell segment count that two devices
disagree about is a desync that reads like a network bug.

Follow `.claude/skills/new-creature`, which carries the control-visibility
entry, the state machine and the replay test this needs — **including its §5,
which is new: a creature gets one wave that is about it and one briefing card
before that wave.** Both are this lane's, not a follow-up's.

The wave's sentence names the **mistake the creature exists to punish**, never
the creature: THE RUNT is *"The one where a shot that lands is the mistake."*
Here that sentence is about the reversal — an arrival that starts as *anyone,
keep hitting it* and becomes *you, now, and only you* — and if the sentence
cannot be written, the reversal is not landing and the creature is not ready.

The card is three texts. `both` says what the thing is; `p1` and `p2` say what
each seat does about it, and **they must differ**, because for most of this
creature's life neither player knows which of them will have to finish it. That
asymmetry is the card's job: it is the one place the pair is told that the
answer is currently unknown to both of them.

Finished when `bun run check` and `bun run test:determinism` are green, a
replay test kills one from both seats and proves the colour lock only applies
after the shell is gone, the reachability test above passes, and the commit
carries `Check: does the switch from "anyone hit it" to "only you, now" land
as a moment, or does the pair miss that it happened — a wave with one, played
from both seats`.

Model `opus`, effort `ultrathink`. The unpick test says so: this is a premise
about how a creature can be layered, it goes in the hash, and it is expensive
to unpick months later. Think about the two-phase reversal before any code —
the code is the easy half. Read `docs/spec/systems.md` §5.6, `docs/spec/bestiary.md`
and `packages/sim/src/bullet-hit.ts` first.

## A PIECE COMES OFF A BODY AND NOTHING DRAWS THE BREAK
_claude/burn-creature-shell-draw-g2 · packages/render/src/shell-draw.ts packages/render/test/shell-draw.test.ts_

Behind g1, which owns the state this reads.

Two pieces come off, and the break is the whole feel of the creature and the sim cannot express it: a
piece leaves, an edge is raw where it left, and there is a burst at the
break. The owner's reference is a meteorite striking the ship — but with no
fixed form, the shot *loosens a chunk* rather than punching a neat hole.

`packages/render/src/craters.ts` already draws pits with lit rims and shadowed
floors, `rock-impact.ts` already draws a strike, and `effects-spark.ts` and
`sparks.ts` already throw particles. Read all four before drawing anything —
§5.6 asks for splinters and a broken edge that *glows briefly*, and three of
those four already do a version of it. Do not import the meteor's own
functions if it means changing them; a creature is not a rock and the two
should be able to diverge.

**The state that outlives a frame goes in `Effects` and is cleared in
`Effects.reset()`** — `packages/render/test/restart.test.ts` fails if a field
is added and not cleared, and that is correct rather than an obstacle:
`world.beat`, `world.tick` and `world.nextId` all restart at 0, which is how a
crack once came to show before the rock that made it.

**The thing to get right is the raw edge, not the burst.** A burst is cheap
and every game has one; what says *a piece came off this body* is that the
silhouette is now wrong in a specific place — the contour is interrupted, and
the interruption keeps its shape as the body sways. A body that loses a piece
and stays a clean closed blob has lost nothing.

Finished when `bun run check` is green, `frame.test.ts` passes through the
strict canvas stub, `restart.test.ts` passes unweakened, and the commit
carries `Check: does a piece coming off read as broken away, or as a hole
appearing — one at 26 px on a phone, and again beside a meteor for contrast`.

Model `sonnet`, effort `think hard`. Read `craters.ts`, `rock-impact.ts` and
`docs/spec/graphics.md` first.

## THREE MOUTHS ABOVE THE SHIP, ONE OF THEM GOES SOMEWHERE
_claude/burn-boss-maze-b1 · packages/sim/src/maze.ts packages/sim/src/maze-round.ts packages/sim/test/maze.test.ts packages/content/src/maze-rounds.ts_

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

## FIVE HUNDRED LINES IN ONE FILE, AND THE DOCUMENT THAT NAMES ITS NEIGHBOURS
_claude/burn-versus-promptsplit-v3b · tools/versus/prompt.ts tools/versus/text.ts docs/versus.md_

`tools/versus/prompt.ts` landed at 511 lines against CLAUDE.md's ~250, and it landed that way deliberately: the lane that wrote it could not split it, because the seam files are enumerated by name in `docs/versus.md` **and** inside the prompt's own step 4, and it owned neither. This lane owns both, which is the whole reason it exists.

The seam is already there and needs no invention. `votePrompt` begins at line 195; everything above it — `wrap`, `row`, `named`, `count`, `list`, `quoted`, `show`, `block` — is text formatting that knows nothing about votes, and belongs in `tools/versus/text.ts`. What is left is the template and `changes`, which is the part worth reading as one piece.

Two things this must not break, and both are tested already, so the test suite is the acceptance: the adopt and keep forms still differ in exactly the five ways the template names, and `votePrompt` still throws on a patch under `packages/sim/`. Do not weaken a test to fit a split.

Then update the two places that enumerate the directory — `docs/versus.md` and step 4's own file list — so the prompt keeps telling the truth about the tree it is describing. That is the actual risk here: a prompt that lists files which are no longer there teaches a cold session to distrust it.

Finished when `bun run check` is green, every file is under 250 lines, and no test was changed to make it so.

Model `sonnet`, effort `think`. This is a move with a documentation tail, not a design.

## THE VOTE BUTTONS COPY A RECORD, AND THE PROMPT THEY SHOULD COPY NOW EXISTS
_claude/burn-versus-wire-v3c · tools/director/src/versus-page.ts_

Behind v3b, so the split settles before this reads from it.

The pair renderer landed while `prompt.ts` did not yet exist, so its vote buttons put a *record* on the clipboard — slot, winner, loser, the typed reason, every field `old -> new` — under a header saying in plain words that it is not the adoption prompt. That was the right call at the time and it is the wrong thing to ship: it is the expensive half of the vote kept warm, waiting for the cheap half.

`votePrompt(vote)` and `readCurrent(v)` are now on `main`. Replace the record with the real thing, and delete the header that apologises for it. **`readCurrent` must be called before any patch is applied** — the whole refusal mechanism rests on the left-hand values being what the shipped record actually says right now, so reading them off a patched record would emit a prompt that cheerfully reverts nothing and claims it reverted something.

Nothing else in the page changes. The vote box may want its own file — both new director files sit at exactly the 250-line ceiling — and if it does, that is this lane's to make, contiguous and small.

Finished when `bun run check` is green, a vote copies a prompt a cold session could paste, and the commit says which values `readCurrent` was called against.

Model `sonnet`, effort `think hard`. The one thing to get right is the ordering of the read against the patch. Read `tools/versus/prompt.ts` and `variant.ts` first.

## THE CATALOGUE'S ARROW POINTS ONE WAY, AND A TAKEN SHAPE CAN STILL BE WRONG
_claude/burn-versus-docs-v4 · docs/verification.md docs/asset-catalogue.md CLAUDE.md_

`docs/asset-catalogue.md` says the direction of travel is one way — a draft that is claimed becomes taken, and nothing goes back — which was true while the only open question was what to draw. It is not true any more: the same page already runs NOTCH 1 against NOTCH 2 on one clock and says a single draft in that position quietly becomes the answer by being the only thing on the page, and that argument applies with more force to a shape the game has been drawing for months. Write decision **25** in `docs/decisions.md` (23 and 24 are taken — 24 is the owner's rule that nothing is deleted for being undecided, and this lane must not contradict it) (why a candidate is a patch in `tools/`, why the game's import graph is the enforcement rather than a rule anyone follows, why the vote persists as nothing, and a `Reconsider if:` that names the case where it breaks — more than one person voting, or a look whose difference only shows on a device this machine is not), one `##` section in `docs/asset-catalogue.md` on where a vote sits beside DRAFT / FREE / TAKEN, one paragraph in `docs/verification.md` giving the `Check: versus <slot> — …` trailer its shape at both ends, and in `CLAUDE.md` one `bun run versus` row in Commands plus a short Conventions paragraph saying a replacement look is voted on before it is adopted. Two rules that must land here or they land nowhere. **A slot that is not decided simply stays open** — decision 24 reverses the original design here, so do not write the session-scoped deletion the older draft of this brief asked for: a variant persists until the owner says adopt, keep, reuse or delete, and a session ending is not an event in their day. And a session landing candidates writes the opening `Check:` naming the slot, so a slot's whole life sits on `bun run checks` and `⚑ TO CHECK` rather than on a second list. Finished when `bun run check` is green — and be careful with `asset-catalogue.md`: `tools/shape-sheet/test/drafts.test.ts` reads its status sentence and counts the catalogue, so add a section and touch neither the blockquote nor the counts.

Model `sonnet`, effort `think`. Read `docs/versus.md` first — it is the design this lane implements.

## THE HULL IS ON SCREEN EVERY FRAME AND HAS ONLY EVER HAD ONE ANSWER
_claude/burn-versus-slots-v5 · tools/versus/candidates/_

The mechanism now exists and has been looked through once, so this is the lane that fills it — and it goes last on purpose, because a candidate authored before anybody has watched the pair run is a candidate authored blind. Three slots, all of them things a player looks at constantly and none of them needing a lifting commit: a second candidate in `ship:hull-skin` so the first vote is a genuine three-way (current, warm, and one more), `creature:bulb` and `creature:slick` as separate slots each patching the silhouette record and its own-motion together, and `palette:ammo-pair` patching `PALETTE`'s six red and cyan tokens as one slot because a vote on cyan alone is a vote on something nobody ever sees alone. Think hard about what makes two candidates a real choice rather than a nudge and its twin: each `claim` has to pass the one-sentence test `.claude/skills/new-wave` already applies to a wave, and two candidates whose failure modes are the *same* failure mode teach nothing — the catalogue's own NOTCH pair is the model, where one says the direction with a feature small enough to vanish at 26 px and the other says it with the whole mass, so whichever way it goes the result is a measurement. Every candidate is a directory under `tools/versus/candidates/` holding `variant.ts`, so removal is `git rm -r` regardless of what it grew. Finished when each slot draws two moving phones that differ visibly at 380 px, `bun run versus` lists three open slots with their readers, and the landing commit carries one `Check: versus <slot> — …` per slot pointing at the director's VERSUS tab. Do not open a slot that patches `SWAY_PUMP` or `TILT_RIPPLE` until `claude/burn-own-motion-b10` has landed — that lane owns `own-motion.ts` and a vote taken against a record about to move is a vote against nothing.

**Behind the mechanism lanes, not beside them.** It adds entries to
`tools/versus/candidates/index.ts`, which the first lane creates and owns — a
candidate authored before the registry exists is a candidate authored against
a guess.

Model `sonnet`, effort `think hard`. Read `docs/versus.md` first — it is the design this lane implements.

## THE SPEC SAYS TO BUILD EIGHT PANEL SCENES, AND NOBODY SHOULD
_claude/burn-teach-spec-t3 · docs/spec/calls.md docs/spec/briefings.md docs/parked.md docs/INDEX.md_

Write the design down before it is built, because the thing it replaces is currently an instruction sitting in the spec.

**`docs/spec/calls.md`, new.** THE CALL: a teaching wave is an ordinary `Wave` plus `lesson?: LessonId` from a closed list of three; the script is `CALLS: Record<LessonId, Call[]>` in content, a `Record` over a closed list so a lesson shipping without a script is a type error, exactly the discipline `BRIEFINGS` already uses. A call's `beat` is a **`waveBeat`**, always. The freeze is `onBeat`'s field half, not a fourth early return in `step`, and the reason is that the release is the real play. The `need` vocabulary and the anchor vocabulary, both closed lists. The two escalation stages, 16 beats and 32. And the rule that earns a test: **a call never resolves to the same subject on both screens**, with `beats` the single exemption because systems.md 5.2 lists the shared clock as the row of the split table that is deliberately not split.

**`docs/decisions.md` #23.** Why a lesson is a field on `Wave` against #18 (choreography is not derivable; `boss: { kind: "mirror", rounds }` already sits there; the derivable half — whether a lesson has been taught — stays derived as a bit in `world.brief`). Why the freeze is inside `onBeat`. Why there is no timeout and no SKIP button. A `Reconsider if:` naming the case where it breaks: a pair who reliably lock-pick a `cannonIn` gate by stepping columns, which is cheaper than talking and is not closed by anything here.

**`docs/spec/briefings.md`.** Strike §3.2 — the eight scene functions, the `Field` split out of `Layout`, the panel-sized `hull-frame.ts` — and say what replaced it and why: its own load-bearing requirement is satisfied by never building a diagram. Restate §1's "Before wave" column, now stale by three. Narrow §3.7 to the rail mark. Leave §3.1, §3.3–§3.6 alone: the card survives unchanged.

**`docs/parked.md`, two sections.** First: **waves 1–3 can be cleared in silence.** `drawCreatures` in `canvas2d.ts:188` is unconditional, so once a body is on the field both screens have it in full, and only the 6-beat radar lead is one-sided. The teaching waves are authored so no call ever claims otherwise — every line is about a *strip* or a *control*, never about a body — but the residual is real and the strongest version of this ships with one body in FIRST STEP or TWO COLOURS made genuinely one-sided. That is a change to the shipped information model and it is not decided, so it is parked and not queued. Second: **`forgetBriefings` fires on every room join.** It is called from exactly one place, `startTogether()` in `apps/game/src/main.ts`, which runs on `link.onStart` — so the "returning pair" skip is session-scoped, and a pair who put their phones down and picked them up tomorrow pay the full tax again. The save file briefings.md §3.6 already names is the answer and nothing here builds it.

Finished when `bun run check` is green and `docs/INDEX.md` lists the new page.

Model `sonnet`, effort `think`. The decisions are made in this plan; the work is writing them so a session three months out does not re-open them. Do not invent mechanism the other lanes have not been told to build.

Model `sonnet`, effort `think`. Read `docs/teaching.md` first — it is the design this lane implements.

## THE FIELD STOPS ON AN AUTHORED BEAT AND THE CLOCK DOES NOT
_claude/burn-teach-call-t4 · packages/sim/src/call.ts packages/sim/src/commands.ts packages/sim/src/hull.ts packages/sim/src/briefing.ts packages/sim/src/events.ts packages/sim/test/call.test.ts packages/audio/src/bind.ts packages/audio/src/catalogue.ts packages/audio/test/bind.test.ts_

The mechanism. Sixteen files, but nine of them are one or two lines each and the mechanism itself is one new file — `packages/sim/src/call.ts`. Read `docs/spec/calls.md` (lane 3) first; it is the design this implements.

**State.** `world.call: { lesson, index, sinceBeat, latch, p1Col, p2Col, stage } | null` — seven integers. `p1Col`/`p2Col` are `cannonCol`/`shieldCol` as they stood at the last beat boundary, and they exist because `cannonIn(n)` means "rested across a beat boundary", which needs a remembered previous column. `stage` is 0 / 1 / 2 for the escalation. Plus `world.lesson: number` (a `LESSONS` index or -1) and a `taught` integer added to the `Briefings` interface — put it there rather than beside it, and `forgetBriefings`, which already does `world.brief = newBriefings()`, clears it for free. Every one of these into `hashWorld`, beside `world.brief` and `world.interlude`, for the identical reason both are there: **a call decides whether the field advances**.

**The freeze.** `callHolds(world)` guards only the spawn/fall/boss/pod/hull block inside `onBeat`; `world.waveBeat` does not increment and `world.beat` does, because `beatMetronome` is already `onBeat`'s first line and was factored out for exactly this. Commands, bullets, grips and the metronome all keep running — the release is the real play. `cleared` gains `&& world.call === null` so a wave whose lesson is unfinished cannot clear out from under it. `startWave` installs the lesson and clears any call.

**The needs.** `cannonIn(col)`, `shieldIn(col)`, `guard`, `fire(color)`, `gone`, `none`. Both halves must be true **on the same tick** — THE FORK's overlap rule, evaluated in sim from the world, not raced between two arrivals. `guard` and `fire` are latched in the bitfield because they are instants; that is why lane 2 had to land first.

**The escalation, and this is where D2's best idea is repurposed.** Split `applyCommand` into a hold check plus `runCommand`. At 16 beats unanswered, `stage` goes to 1 and the other seat's line stops being redacted. At 32, `stage` goes to 2 and the ship **performs the outstanding half itself** through `runCommand`, so it can never demonstrate a gesture a player cannot make and the band draws itself being pressed with no new code. Do **not** add `seatFor`: `applyCommand` ignores `timed.player` for everything but `grip`, the script authors which half is whose, and a `seatFor` in sim would be a second copy of a rule that already lives in `render/src/touch.ts` as a hit test no regex can match.

**The hull, and this is the bug two designs walked into.** `applyHullDamage` honours `cfg.hullInvulnerable`, but `breachHull` pushes the `Scar` and the `breach` event **outside** that guard (`hull.ts:254-255`). So: guard `applyHullDamage` on `world.lesson >= 0` as well — world state, hashed, never a mid-run mutation of `cfg`, which `hashWorld` does not cover at all. Keep pushing the event, so the crack draws and the impact sounds. And clear `world.scars` in `startWave` when entering or leaving a lesson wave, so three teaching cracks do not walk into FIRST STEP.

**Forced tail.** One new `SimEvent`, `{ type: "call"; index: number; open: boolean }`. `packages/audio/test/bind.test.ts` reads the union out of `events.ts` and requires a sound for every member, so this is a checked addition, not an optional one: a cue in `bind.ts`, an entry in `catalogue.ts`, a sample in the test's `SAMPLES` map. Two people looking at two phones need to hear that the other screen changed.

**Purity.** One new `COPIES` row for `callHolds`, so a second hold cannot be spelled out by hand in `beat.ts`.

**Tests.** `packages/sim/test/call.test.ts` runs a whole lesson headless with `{ ...DEFAULT_CONFIG, ...PAIR_ON }` — and note that `test:determinism` does **not** cover this for free: the gate is `cfg.briefings`, off in `DEFAULT_CONFIG`, so the determinism run plays the teaching waves as plain short waves with no call in them. Prove: the field holds and the clock does not; a satisfied need passes without drawing; both halves are needed; a sweep does not trip `cannonIn`; the two escalation stages fire at 16 and 32; the hull takes no damage and leaves no lasting scar; and two worlds disagreeing about a call disagree about their fingerprints.

`startWave` takes `lesson` with a `null` default so no existing call site breaks and this lane stays green on its own. Finished when `bun run check` and `bun run test:determinism` are green.

Model `opus`, effort `ultrathink`. **ultrathink about what two devices can disagree about while a call is open** — that is the part that is expensive to unpick later, and it is why this is the one `ultrathink` in the batch. In particular: whether every field that decides the release is in `hashWorld`, and whether a command already in flight from `inputDelayTicks` ago can land on a tick where one device thinks a call is open and the other does not.

**Behind t1 and t2, not beside them.** The files this lane's work lives in —
`world.ts`, `beat.ts`, `hash.ts` and whatever t1's split leaves behind — are
being reshaped by those two first. It adds to them; it does not own them.
Starting it early means authoring against a layout that is about to change.

Model `opus`, effort `ultrathink`. Read `docs/teaching.md` first — it is the design this lane implements.

## SEVEN WORDS A SCREEN, AND THE THREE WAVES THEY BELONG TO
_claude/burn-teach-script-t5 · packages/content/src/calls.ts packages/content/src/wave-types.ts packages/content/src/waves.ts packages/content/src/queue.ts packages/content/src/index.ts packages/content/test/calls.test.ts apps/game/src/waves.ts tools/director/src/serialize.ts tools/director/src/rail.ts tools/director/src/stage.ts tools/director/test/serialize.test.ts_

The words and the waves. `theThreeWaves` in the plan this lane came from has every entry, every call, every beat and every line already decided — author them, do not re-decide them.

**`calls.ts`, new.** `CALLS: Record<LessonId, Call[]>` over the closed list in `sim/call.ts`, so a lesson shipping without a script is a type error. `buildLesson(waveIndex)` beside it, the sibling of `buildBoss`, and a `callsFor` that remaps a call's authored columns through **`mapCol`** — a call's `col` and the entry it points at must not be able to land in different columns on an 11-column field, and `mapCol` is called, never re-derived.

**`waves.ts`.** WAVE 0 · ONE OF YOU CAN SEE IT, WAVE 1 · COLUMN AND BEAT, WAVE 2 · WHAT TO CALL THEM, at indices 0, 1, 2. Each has its one sentence (`docs/spec/wave-design.md` 8.3) and none of them is padding. `wave-types.ts` gains `lesson?: LessonId` with the comment saying why it is not the `briefings:` field decision #18 refused.

**`interludes.ts`.** `GAPS[10]` becomes `GAPS[13]`. Three insertions shift every index by three, and `interludeDue` compares `interludeDone !== wave`, so getting this wrong opens THE GAUGE in front of the wrong wave with nothing failing.

**The director is forced, not optional.** `serialize.ts` regenerates `waves.ts` field by field and silently drops anything it does not know, and `serialize.test.ts` compares its output against the real file — so the moment a `lesson:` field exists, that test **fails** until `serializeWave` round-trips it. Match Biome's formatting exactly, the way `textField` already does. Add a rail mark for a teaching wave beside the way `♛` marks a boss, and thread `buildLesson` through `stage.ts` and the two `startWave` calls in `apps/game/src/waves.ts`.

**`packages/content/test/calls.test.ts` is the only defence against this becoming the wall of text it replaces.** Four assertions, three of them lifted straight from `render/test/briefing.test.ts` which already runs them over `BRIEFINGS`: no line over **seven words**; no line empty; no call telling both screens the same thing; and **no call resolving to the same subject on both screens**, with `beats` the single exemption. Plus one of its own: every authored `col` is `<= AUTHORED_COL_MAX`, so nobody types a real column into a call.

Two authoring rules that are not negotiable and are easy to break. **Every line is about a strip or a control, never about a body** — "only your strip has this" stays true forever, "only you can see it" is false in five beats, because `drawCreatures` is unconditional. And **anything both screens would carry belongs in `hint`, not in a call**; the banner already shows `hint` on both for 5.5 s.

Finished when `bun run check` is green, `bun run dev` shows the three waves in the rail with their marks, and a save round-trip through the director leaves `waves.ts` byte-identical.

Model `sonnet`, effort `think hard`. **Think hard about the word count and the anchor rule before you write a single line** — those are the two things that will slip, and the test has to be written first so they cannot.

Model `sonnet`, effort `think hard`. Read `docs/teaching.md` first — it is the design this lane implements.

## A BRACKET, FIVE WORDS, AND A CHEVRON POINTING AT THE OTHER PHONE
_claude/burn-teach-draw-t6 · packages/render/src/call.ts packages/render/src/redact.ts packages/render/src/briefing.ts packages/render/src/canvas2d.ts packages/render/src/index.ts packages/render/test/call.test.ts_

The picture, and it is small on purpose: **nothing here animates anything the game does not already draw.** The blip hanging on the strip is `drawRadar` with `waveBeat` frozen — `field.ts:135` derives height as `q.beat - (world.waveBeat - 1)`, so the animation *is* the radar, held still, and this lane writes none of it. The lobe sliding under the target is the real membrane, the real `Glide`, the real `blobPath`. The shot, the pop, the crater, the deflection flash and the crack are all real events through the existing `Effects`, because bullets and the hull keep working during a freeze. What this lane draws is the pointer.

**`call.ts`, new, ~120 lines.** `drawCall(ctx, layout, world, role, call)` — a pure function of a `Call`, exactly as `drawBriefing` is a pure function of the world, so it holds nothing across frames, `Effects.reset()` gains nothing to clear and `restart.test.ts` stays green without an edit. Anchor resolution per role against `Layout`: `beats` and `hull` (both screens); `column(n)` and `body` (both — `drawGrid` and `drawCreatures` are not role-gated); `strip` (this screen's own radar strip, role-relative by construction); `radar(n)` (real on the owner's screen); `fire(color)` (p2 and `test`, off `layout.fireButtons`); `trigger`, `maw`, `lance` (p1 and `test`); `cannon`, `shield` (off `showsCannon` / `showsShield`); `mark(n)`, an amber column marker standing on the grid on one named screen only — the `pod` amber this game already spends on "here, this is the thing"; and **`elsewhere`**, which is not a place on this screen at all: a chevron at the stage edge pointing at the other phone, with the other seat's line beneath it as grey word-shaped bars.

**`redact.ts`, new.** Lift `redact()` out of `briefing.ts:146` into its own file with two callers, so they cannot drift. It is the piece the card already invented and explained: a single grey bar says "something is hidden", a row of word-shaped bars says "they are holding a sentence you need", which is the thing that makes somebody read theirs out loud. A chevron turns it into a direction.

**Format discipline, drawn.** One line, in the seat's own colour, beside its bracket — never in a panel, never centred, because the eye has to go to the thing. At 375 px portrait that is one line of 11 px Courier and a 2 px bracket. The bracket breathes on `beatPhase`, which is already in `ViewState` and identical on both devices, so even the pointer is on the beat. On the `test` role, stack both halves prefixed `1·` and `2·` so a desk tester and the director see the whole of what the pair sees between them, and resolve `elsewhere` to nothing there.

**Wiring.** One contiguous line in `canvas2d.ts`, over the pause overlay and under the card, drawn from `CALLS` via the helper the content lane exports. `canvas2d.ts` is owned by nobody — add in one region and expect to replay over somebody else.

**Test.** `packages/render/test/call.test.ts`: every call in the catalogue, every role, through the strict canvas stub that refuses what a real canvas refuses — including a screen too narrow for a word, and a `radar(n)` anchor on the screen that does not own that strip. Build `Call` fixtures by hand so the file is complete before the catalogue is.

**Land after the content lane**, which owns the catalogue the wiring line reads; if both finish together, rebase onto it and the wiring is your last commit.

Finished when `bun run check` is green, `bun run preview` shows a call on both seats at 375 px, and `restart.test.ts` is untouched.

Model `sonnet`, effort `think hard`. **Think hard about `elsewhere`** — it is the one anchor with judgement in it, and it is what turns "my screen is missing something" into "ask them". Everything else on this list is a bracket.

Model `sonnet`, effort `think hard`. Read `docs/teaching.md` first — it is the design this lane implements.

## EVERY BODY MOVES A ROW ON THE SAME INSTANT AND NONE OF THEM ARRIVES
_claude/burn-body-land-c5 · packages/content/src/drive.ts packages/content/test/drive.test.ts_

The beat arriving in a body, and the hull's approach arriving with it. Behind lanes 3 and 4.

A new pure file in `content`, so nothing here reads a world: `Drive` (a struct of plain numbers: `beatPhase`, `moved`, `dread`, `held`, `jolt`, `shockX`, `shockY`, `scatter`) and `poseWith(motion, beats, drive)`, which composes an `OwnMotion`'s pose with the impulses. `own-motion.ts` is not touched — lane 3 owns it, and `poseWith` taking an `OwnMotion` is what keeps these two lanes from colliding.

**The landing and the gather.** With `p = beatPhase + (scatter - 0.5) * 0.08`: `land = max(0, 1 - p/0.32)^2`, `gather = max(0, (p - 0.75)/0.25)^2`, and `squash = landGain * (0.18*land - 0.07*gather)` applied volume-preserving as `sx *= 1 + squash`, `sy *= 1 - squash`, plus a small `dy`. Position stays exactly linear — `creatureCenter` is untouched, because "it lands on the three" is a statement both players act on across a two-second delay and the even glide is what makes it one. **The overshoot goes in the pose, never in the position.** `landGain` is a new named field on `OwnMotion`... which lane 3 owns, so take it as a `Record<CreatureKind, number>` in this file instead and say in the comment that it wants to move onto `OwnMotion` once the two lanes are both on `main`. Bulb 1.0, slick 0.6, runt 0.4, **throb 0.0** — and write the reason down as a rule rather than a value, because the next person raising SWAY_PUMP's pump needs it: `throbOpen` is a gameplay signal telling the pair when to fire, so the throb keeps a monopoly on beat-synchronous scale change and no other body may express the beat in size. The slick's 0.6 exists because it is the one kind whose squash could walk it toward the round three; check the direction — at maximum it goes to ~2.24, away from them, not toward.

**Dread.** `dread = clamp01((c.row - (hullRow(cfg) - 3)) / 3)`, zero until three rows out and one at the hull, scaling everything the body already does by `1 + 0.55*dread` and doubling the gather in the last row before impact. No new motion is invented; the existing one gets louder. Amplitude scaling touches no shape parameter, so it is free of nameability risk by construction — and it is not decoration: agitation is a second, peripheral channel telling the pair which lane is about to cost them, readable without reading a row number.

**The elliptical pen, and nobody in three design proposals noticed it.** `drawLiving` composes `ctx.scale(scale * sx, scale * sy)`, so a non-uniform pose strokes the outline with an elliptical pen: apparent line weight varies by direction at exactly the instant the squash peaks. This is already true today at SWAY_PUMP's +/-10%; this lane takes it to 18%, a swing `docs/spec/graphics.md` pins at 1.2-1.8 px cannot absorb. Fix it in the one contiguous region this lane adds to `creatures.ts` — compensate `lineWidth` against the geometric mean of `sx` and `sy`, or stroke outside the non-uniform transform. Say in the commit which, and that it changes the resting look slightly because the bug predates the batch.

The gate from lane 2 must be green with `landGain` at these values and red if any of them is doubled; that is the acceptance test, not an eye.

**That gate has since been built, and it says these values are red on arrival.** `claude/burn-body-gate-c2` landed the three-axis nameability test, and its finding is specifically about this lane: BULB and THROB are held apart by the **lobe axis alone**, and the lobe axis answers to the pose, because a squash is a second harmonic that competes with the nine bumps. The bulb's pump sits exactly on its ceiling — 0.10 passes, 0.11 fails — so the 0.18 squash written above fails the moment it is applied to the bulb. This is not a reason to weaken the gate; the gate is the thing that caught it. Run `bun run shapes:report` and read the TOLD APART BY block before choosing a number. The brief's own fallback is the likely answer and it lands under the ceiling: **halve every `landGain`** — bulb 0.5, slick 0.3, runt 0.2, throb still 0.0 — giving a ~0.09 squash, and let the directional gather carry the beat. If a halved gain reads as nothing, that is the finding, and the choice between a legible landing and nine countable lobes is a decision for the orchestrator, not something to resolve by widening a cap.

Finished when `bun run check` is green, `drive.test.ts` proves every impulse decays to under 1% by mid-beat and that `sx * sy` stays within 1% of 1 at every sample, and the commit carries `Check: does the unison landing read as tempo or as twelve metronomes — a full wave at tempo, then a two-body wave`.

Model `opus`, and think hard about **whether the unison is tempo or a metronome** — it is the one item in the batch with real nameability exposure, D3 itself calls its own hedges "the argument, not the evidence", and the fallback if it reads mechanical is to halve every `landGain` and let the directional gather carry the beat alone.

Model `opus`, effort `think hard`. Read `docs/alive.md` first — it is the design this lane implements.

## A THING DIES AND EVERYTHING AROUND IT CARRIES ON EXACTLY AS BEFORE
_claude/burn-body-shock-c6 · packages/render/src/shock.ts packages/render/test/shock.test.ts_

The only change in the batch that makes one creature react to something that happened to another, and the largest visible motion proposed anywhere — up to 0.35 tiles, about 12 px of whole-body translation, at the most-watched instant in the game. Behind lanes 4 and 5.

Right now a kill is a silhouette vanishing behind a particle burst while its neighbours carry on unchanged, which reads as objects being deleted from a list. `Effects.ingest` already receives `destroy`, `runtHit`, `petal`, `queenDown` and `wardenDown`, and **all five already carry `col` and `row`** — check `packages/sim/src/events.ts` and confirm before building. Push `{ x, y, age: 0, life: 0.45, power }` (power 2 for the two boss deaths) into a new list, age it in `update`, and per creature accumulate `k = power * (1 - age/life)^2 * max(0, 1 - dist/(2.6*l.tile))` as a push away from the source, clamped to 0.35 tiles total. Shocks are few and short-lived, so this is a handful of multiplies per body. It feeds lane 5's `Drive` as `shockX`/`shockY`; it is pure translation, no colour and no scale.

**This is new render state that outlives a frame**, and it is the only thing in the batch that is. It goes in a list on `Effects` and **must be cleared in `Effects.reset()`**, which `Canvas2DRenderer.waveRestarted` calls on every way a wave can start over — `packages/render/test/restart.test.ts` compares structurally against a fresh `Effects` and fails if a new field is added and not cleared. That is correct behaviour, not an obstacle; `world.beat`, `world.tick` and `world.nextId` all restart at 0 and state cached against them is read by the next run as its own.

`packages/render/src/effects.ts` is 241 lines and owned by nobody — add the field, the ingest case and the reset line in one contiguous region each, and put the falloff maths in this lane's own `shock.ts` so the region in `effects.ts` stays three lines.

**The risk to watch, and it is the one failure in the batch that misinforms a player rather than looking wrong.** Three bodies flinching when one dies may read as a chain reaction and invite a wasted shot. The mitigations are the short falloff, the pure translation and the absence of any colour change — but they are arguments. This is the first thing to look at on a phone, and if it reads as damage it is worse than nothing, because it lies about the rules.

Finished when `bun run check` is green, `restart.test.ts` passes without being weakened, a test proves the list is empty after `reset()` and that a shock decays to zero within its life, and the commit carries `Check: does a neighbour's flinch read as sympathy or as damage — fire into a cluster and watch what a partner assumes`.

Model `sonnet`, `think hard` — the pattern (an `Effects` field aged in `update` and cleared in `reset`) already exists several times in the file; the hard part is the falloff radius and whether it lies, and that is named above.

Model `sonnet`, effort `think hard`. Read `docs/alive.md` first — it is the design this lane implements.

## A BODY UNDER A HAND SWAYS EXACTLY LIKE A FREE ONE
_claude/burn-body-held-c7 · packages/render/src/creature-drive.ts packages/render/test/creature-drive.test.ts_

What the two players do to a body, drawn on the body. Behind lanes 4 and 5.

One new file that reads the `World`, the `SimConfig` and `Effects` and hands lane 5's plain-number `Drive` to `poseWith` — so the direction of flow stays one way, render still decides nothing, and `content` stays pure. Everything it reads exists: `gripsCreature`, `gripCount`, `hullRow`, and `Effects.blocked`, which already holds a per-id countdown from 0.35.

**The hit-stop comes first, and it is the only item in this batch that makes a silhouette *more* legible.** For the first 60 ms of `blocked` — while the countdown is above 0.29 — draw the pose lerped fully to `REST`: no sway, no drift, no impulse, and quantise the `t` fed to `blobPath` so the contour freezes too. That is the clearest, stillest, most canonical look at a shape anywhere in the game, and it happens at the exact moment the player is looking hardest at that one body. D3 wanted to answer a blocked shot with *more* motion; this is the opposite and it is right.

**Then the recoil.** With `b = blocked/0.29` decaying from 1: a volume-preserving squash of about 0.18 scaled by `b*b`, a small upward `dy` because the shot came from the hull below, and amplitude scaled by `1 + 0.6*b`. The existing grey-outline branch stays; it stops being the *whole* response. A wrong-colour hit currently reads as the silhouette going grey behind a particle cloud, and `docs/spec/graphics.md` asks in its own words for a short hit-stop and a reaction proportional to its cause — there is none anywhere in the pipeline today.

**And the grip.** `grip.ts`'s own comment says the entire point of the mechanic is the *other* screen seeing that a hand is on something, and yet a held creature currently sways identically to a free one — the whole mechanic lives in a ring drawn around it. Under a hand: `sy *= 1 + 0.09*held`, `sx *= 1 - 0.09*held`, and own-motion amplitude cut by 35% — the body is stretched between the hand pulling up and the fall pulling down, and pinned rather than free. One consequence falls out for nothing: `grippedFallTiles` returns 0 for a held creature on most beats, so `moved` is 0 and it gets no landing kick — the grip becomes visible as an absence of the field's pulse, a body held out of time.

Add to `creatures.ts` in one contiguous region; it is owned by nobody after lane 4.

Finished when `bun run check` is green, a test proves the pose is exactly `REST` for the first 60 ms of a block and that every reaction returns to within 1% of the canonical pose, and the commit carries `Check: does a held body read as held from the other seat, at arm's length` and `Check: is the hit-stop visible at all, or is 60 ms below the threshold on a phone`.

Model `sonnet`, effort `think hard`. Read `docs/alive.md` first — it is the design this lane implements.

## THE ONE BODY THE FICTION FORBIDS FROM LOOKING ALIVE IS THE ONLY ONE WITH VOLUME
_claude/burn-body-skin-c8 · packages/render/src/creature-skin.ts packages/render/src/glow.ts packages/render/src/palette.ts_

Last on purpose, and **conditional**: build it only if the field still looks flat once the bodies are behaving. Everything before this is behaviour; this is the only lane that is decoration, and it is also the only one whose premise a judge argued might be wrong — `docs/spec/graphics.md` says liveliness at 20-26 px comes from motion with overshoot and not from detail, and the flat swatch may be a deliberate reading of that line rather than the omission three readers took it for.

The counter-evidence is in the file itself: `drawMeteor` builds a linear gradient, and the indestructible rock — the one body whose fiction requires it to look inert — is the only thing on the field with volume. A viewer currently finds more depth in the meteor than in the bulb beside it.

**Three things, and no more.** (a) `coreFill`: replace the flat `dark` swatch with a cached radial gradient in the shape's local coordinates, offset toward one implied key light shared by every body on the field, with stops `mix(dark, hex, 0.34)` -> `mix(dark, hex, 0.12)` at 0.5 -> `dark` mixed 35% toward `PALETTE.background` at the rim. The outermost stop is the whole point and it is why this is the safest interior item in the exercise: it *darkens* the body at the edge and raises the rim-to-interior contrast the lobe read depends on, instead of eroding it like every other interior proposal. Cache in a `Map` keyed by colour and shape — three colour triples times four silhouettes is at most twelve gradient objects for the life of the process. **Never construct a gradient per frame**, and never build a breathing radius through `halo()`: `haloSprite` keys on `${color}@${radius}` and allocates a canvas on a miss, which is exactly the trap `sheen.ts` guards against with `Math.round(.../4)*4`. (b) One clipped inward membrane stroke, `innerLight`'s technique from `sheen.ts` re-expressed as fractions of the body radius rather than pixel constants, so it survives at 26 px — it follows every lobe and puts a bright inner edge on each one, which should make lobes *easier* to count. (c) Widen `strokeGlow`'s `color` parameter from `string` to `string | CanvasGradient`. It is assigned straight to `ctx.strokeStyle`, so every existing caller is unaffected and there are zero extra draw calls, and a colour gradient around the loop varies apparent line weight — which is what a constant stroke weight all the way round a closed contour costs you: it is the signature of vector clip-art. **The rule is colour only, never alpha**: add named deep swatches (`redDeep`, `cyanDeep`) to `palette.ts` so all three stops are fully opaque and the rule is enforced by the palette rather than by memory, because a stop reaching zero alpha opens a hole in the outline and a silhouette with a missing bottom edge is a different word.

**Explicitly not built**: the travelling gleam (a 9 px additive dot at alpha 0.35 on a 30 px contour looks like a bullet, and D3 admits it); a second organ, or any organ at all on the runt, which draws at about 10 px — below graphics.md's own "at 11 px nothing of a figure survives" line, so everything the runt says it says with tremble amplitude and with the absence of the field's rhythm; iridescence, because a third colour on a body whose red-or-cyan is a gameplay fact the pair says out loud is worse than a body that is merely less alive; and any drifting, unmirroring or breathing of the detail dots, which are 1.0 px in radius with 0.5 px filaments. If the details are worth an entry, the entry is deleting them and letting the gradient carry the interior.

**Budget the brightness, not just the cost.** "Creatures stay the brightest thing on the field" is a ratio, and this adds light inside the rim. Drop `strokeGlow`'s pass count for creatures from 3 to 2 (an optional `passes` argument), since the inner light now carries part of the rim read. Check the result against the hull's five sheen passes and against a Simon round's green, which is the one colour in the game that must never be competed with.

Finished when `bun run check` is green, `frame.test.ts` passes with the new fills through the strict canvas stub, no gradient or halo sprite is allocated after the first frame, and the commit carries `Check: does the interior gradient survive 26 px, or is the spec right that it does not — desaturated shape sheet at 26 px, rim peak at least 2.5x the interior peak`.

Model `sonnet`, effort `think hard`. Read `docs/alive.md` first — it is the design this lane implements.

## A CHECK THAT LANDED YESTERDAY HAS NO "BEFORE" AND COULD HAVE
_claude/burn-frames-f1 · tools/frames/capture.ts tools/frames/run.ts_

The owner wants a before and after picture, or an animation, beside a check —
and for anything landing from now on the skill already asks the lane to
capture both while it still has the tree in front of it. The fifty-five that
already landed have no such thing, and it looks at first as though they never
can.

They can. Every one of them names a commit, every commit has a parent, and a
headless preview can be built and driven at either. So: `bun run frames <sha>`
checks the parent out into a scratch worktree, builds, drives the real loop to
an agreed frame, captures it, does the same at the commit itself, and writes
the pair under `docs/checks/`. For anything whose question is about *motion* —
and most of them are — the same run captures a short strip of frames rather
than one.

Two things decide whether this is worth building, and both should be settled
before it is: whether a frame can be made **comparable** across two builds (the
same wave, the same tick, the same seed, no wall-clock anywhere in the shot),
and how much of the fifty-five it can actually answer, since a check about a
sound or about two devices cannot be photographed at all. Report that number
honestly before capturing anything in bulk.

## ONE PREDICATE STANDS BETWEEN THIRTEEN CREATURES AND A PICTURE
_claude/burn-drafts-suggest-p1 · tools/shape-sheet/test/drafts.test.ts tools/shape-sheet/src/drafts/index.ts_

A draft shape names the idea it is offered to through `suggests`, and
`drafts.test.ts` resolves that name against `docs/spec/ideas.md` and
`docs/spec/bosses.md` only. The thirteen unbuilt creatures in the bestiary are
table rows rather than idea-store sections, so a draft cannot legally point at
one — which means the largest undrawn group in the repository is the one group
nobody can draw for.

Found by the lane that drew six shapes ahead of the need and then ran out of
things it was allowed to offer them to. It called it one predicate, and it is:
`roster.ts` already parses the bestiary table into named rows, so the
resolution has a second source waiting for it.

Finished when a draft can name a bestiary creature, when a name that matches
nothing still fails loudly, and when `bun run shapes:report` shows at least one
new contour offered to one of the thirteen. The rule that has to survive: a
`suggests` pointing at nothing must remain an error, because the whole value of
the field is that a drawn shape is joined to the idea it serves.

