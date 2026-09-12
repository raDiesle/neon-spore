# Where a session's time goes

Rough statistics, kept over days, so the bottlenecks in ordinary work become
visible. The owner asked for this on 10 September 2026: *"tasks take a lot of
time, I like to know the bottlenecks."*

**One `##` entry per lane**, written in the commit that lands it, with the
minutes read off commit timestamps, file modification times and the tools'
own durations — never instrumented, and rounded to five. The point is the
shape of the distribution across sessions, not precision. The rows are the
same every time so they can be compared:

- **reading** — finding the seam: the queue entry, the files it names, the
  pattern the last lane used, the docs.
- **writing** — code, tests, comments, candidates.
- **looking** — seeing the result: `versus:shot`, `bun run frames`, the
  browser pane, and the correcting that follows a picture.
- **friction** — commands that failed, hung or answered the wrong thing and
  had to be worked around or fixed before the work could go on.
- **landing** — `check:fast`, the commit, `bun run land`, and every rebase
  conflict or red full check between the first attempt and the trunk moving.

End each entry with the one bottleneck, in a sentence.

## 2026-09-12 · hit-looks — the Mine: a wisp that stands still and is tapped, designed and drawn at, not built

The owner: *a new enemy like the wisp but stationary; after some time it
damages the ship and disappears; one player cannot see it and the other
must tap its exact position; a tap on a neighbouring tile also damages the
hull — show me some idea of nice visuals.* Three forks were put to him first
(who sees and who taps, what a wrong tap costs, what the blind seat gets)
and the answers went into one idea-store entry; three shapes were drawn at
it on the SHAPES page. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `sim/wisp.ts`, the split tables, THE BEATBOX's tap, the draft files and the forms |
| writing | 10 | the entry in `ideas.md`, three cards in `drafts/mine.ts`, the three ledgers that count cards |
| looking | 5 | the three shapes at three moments each, twice — REACHER's arms and SINKER's roots were tuned once |
| friction | 0 | — |
| landing | 5 | `check:fast` twice — the first run caught the drafts file over 250 lines and two card counts |

The bottleneck was the ledgers: four tests count the catalogue's cards
by hand, and every new draft is four sentences to write before it is green.

## 2026-09-12 · hit-looks — the tutorial's film is phone-shaped on any stage, and its plate is compact

The owner: *TEST, P1 and P2 in briefing mode should be the game's own screen
width; the ship's skin is cut vertically at top-left and top-right.* The film
was laid out across the whole stage while its columns were bound by the
height, so the hull stopped short of the band on both sides; it now stands
in the rectangle the game itself would take (`render/guide-film.ts`). The
narrower film put the corner plate over the siren's seat chip, so the plate
became a third smaller — the first item of the owner's later tutorial task,
brought forward. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `guide-scene.ts`, `layout.ts`, `canvas2d-takeover.ts`, the plate in `guide-switch.ts` |
| writing | 10 | the film rectangle, the plate's sizes, two files split off the length ceiling |
| looking | 10 | the director stage in TEST, P1 and P2 through `shot` and the pane's canvas, phone frames of two guides |
| friction | 5 | `dev:once` idled out mid-look and was restarted on a new port; `crop` takes only whole zooms |
| landing | 5 | `check:fast` twice — the first run caught the two files over 250 lines |

The bottleneck was looking: the director's stage has no `--role` flag for
`shot`, so P1 and P2 were read out of the pane's canvas by hand.

## 2026-09-12 · hit-looks — three counts for THE COUNT, offered in VERSUS

The owner: *improve the "Countdown" enemy visuals.* The shipped count is
four notches in the rim; a look is offered, not replaced, so THE COUNT's
draw became a record (`render/countdown-look.ts`) and three candidates
patch it under `creature:countdown` — DIAL, IRIS and FUSE — judged on a new
pose with three marks left. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `countdown.ts`, the body table, how a throb candidate was written, the pair and the seat probe |
| writing | 15 | the look record, the disc helper, three paints and their cards, the pose, the pose row |
| looking | 10 | seven frames of the shipped count beat by beat, then the three candidates at true size beside it |
| friction | 0 | — |
| landing | 0 | `bun run land --keep` |

Bottleneck: the first five frames I took were all on the two open beats, so the shipped notches looked missing until a frame per beat showed them.

## 2026-09-12 · hit-looks — the band keeps its skin and grows POLYP's threads; the beads walk the cords

The owner, from the VERSUS page: *keep current in game, but add the tiny
polyp hanging down from the skin; make the lightning pulse movement inside
the veins fluent — right now it has a stuck, jumping movement.* POLYP's
filaments moved into `render/band-filaments.ts` and are drawn over the
shipped pendants; the beads on the cords interpolate between the sixteen
points instead of standing on the nearest. `versus drop` closed the last open
slot, which left the generated registry and pose map in a form Biome
rejects and two director tests with no rows to read. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the POLYP candidate, `slime-look.ts`, `gland-cord.ts`, the registry and pose-row generators |
| writing | 10 | the filaments file, the slime record, the bead interpolation, the empty forms in both generators and the two tests, four budget tables remeasured |
| looking | 5 | the POLYP shot beside the band crop; the beads on a cord over four frames |
| friction | 5 | the last slot closed left `[\n]` and `{\n}` behind, which lint refused and the pose test could not read — both generators now print the one-line form |
| landing | 0 | `bun run land --keep` |

Bottleneck: the first tree with no open VERSUS slot — the generators had never printed an empty list.

## 2026-09-12 · hit-looks — THE THROB wears PORES and is two tiles by two

The owner, from the VERSUS page: *adopt 'CREATURE:THROB · PORES', remove
the other THROB candidates; make Throb big, of 2x2 tiles.* Asked whether
2×2 meant two lanes, he took the torch's rule. `versus adopt` moved the
paint into `render/throb-pores.ts` and closed the slot; GLOBE's paint went
with it. `colSpan("throb")` is two and `THROB_BODY_MUL` doubles the drawn
and grabbed body. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the PORES candidate, `throb.ts` and `throb-look.ts`, how a wide body is placed and sized (`span.ts`, `creature-place.ts`) |
| writing | 5 | the adopt, GLOBE removed, the span and the multiplier, the bestiary line, the versus-pose test's empty-creature-slot guard |
| looking | 5 | four frames of THE THROB on player 1's screen — two lanes lit, the body between them |
| friction | 0 | — |
| landing | 0 | `bun run land --keep` |

**Bottleneck:** `creature-place.ts` at its line limit — the size constant's
comment was trimmed twice before the file fit.

## 2026-09-12 · hit-looks — TWIST is THE WARDEN's rope; all four ropes kept and shown as real examples; a picture on every ON THE FIELD row

The owner, from the VERSUS page: *I like all 'CREATURE:TETHER' alternatives;
I will need them for special pull mechanics later on — document it all to be
used later on, as real examples, on Documentation → Controls → On the Field;
default TWIST; images for every On the Field control.* So the three
candidates moved into render/ as `tether-{cord,sinew,twist}.ts`, the shipped
stroke became `STROKE_LOOK`, and `tether-looks.ts` holds all four with
`useTetherLook` as the switch — TWIST live. The ON THE FIELD tab names a
gallery pose per row and draws it; five poses the gallery lacked were made
(rope taut, both balloon hands, gum stuck, choke on the cannon, ready
circles); under THE WARDEN'S TETHER the same taut frame is drawn four times,
once per look. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the three candidates, `tether-look.ts`, the field-controls files, pose kit, the balloon/gum/choke/briefing sims for the states a pose needs |
| writing | 15 | four render files, the looks table, `poses-field-controls.ts`, the rows and tether files, the def's `pose` field, the test, the warden budget rows |
| looking | 5 | the page in this tree's director; the four ropes at field width were hairlines, so the examples were cut close under the eye |
| friction | 5 | `bun run versus drop` loads candidates whose files had moved — imports pointed at render first; the frame-budget rows remeasured for the two-strand rope |
| landing | 0 | `bun run land --keep` |

**Bottleneck:** the four examples at a card's field width all read as one
line — the picture had to be cut to the eye's underside before the four
roots and ropes were tellable apart.

## 2026-09-12 · hit-looks — The rocks burn: BLAZE built in, COMET and SMOULDER worn by any rock, FORGE rejected

The owner, from the VERSUS page: *build into game 'CREATURE:METEOR · BLAZE';
I would like to configure also COMET to be alternative visuals for any
meteor; SMOULDER also; reject FORGE.* Asked how a rock should pick an
alternative, he chose *by the rock itself* — so the three looks are
`MeteorLook` records in `meteor-looks.ts` and each rock wears one by its own
id, two to one to one, blaze first; the grey stone stays as `STONE_LOOK` for
THE VOLLEY's ball and PINBALL's obstacles. The slot was taken by hand (the
candidates' draws were written inline) and closed with `versus drop`. About
35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the four candidates, `meteor-look.ts`, `meteor.ts`, `drawRockBody`'s two other callers, `docs/versus.md` on adopting a function field |
| writing | 15 | six files moved into render/ with their imports rewritten, `meteor-looks.ts`, the pick in `drawRockBody`, the pinball exception, the pose test built by name |
| looking | 5 | one film of THE HAND: three rocks, three fires |
| friction | 5 | `versus drop` could not load a registry whose candidates imported files already moved — their imports were pointed at the new modules for the one run that deleted them |
| landing | 5 | `check:fast` (THE WISP's budget rows remeasured for one burning rock), the commit, `land --keep` |

Bottleneck: **an inline draw** — a candidate whose `body` is written in its
`index.ts` cannot be adopted by the command, so the four steps `adopt` does
were done by hand, and the drop then tripped over the files the hand had
already moved.

## 2026-09-12 · hit-looks — THE VOLLEY is a round ball with a smaller ball inside, and breaks into pieces of itself

The owner: *it should look like a basketball, such as rounded; improve the
graphics of the broken pieces; maybe change what is inside to a smaller red
or cyan only enemy so it looks harmonic with the same shape of the
basketball.* The shell is a true circle now rather than the `METEOR`
contour; what shows through a break is `volley-core.ts`, a glossy sphere of
the body's colour at half the shell's radius wearing the shell's own four
seams, breathing; and `volley-shards.ts` replaces the spray of squares with
curved fragments cut from the sector a ward took — rind and stone, some with
a burning length of seam — thrown up and out off the shield and falling on
the skin, and at the hatch a ring of the core's own skin. The simulation is
untouched: the core is a picture over the slick or bulb it will fall as, and
the hatch's burst covers the swap. About 55 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `volley.ts`, `volley-look.ts`, `volley-stone.ts`, `shatter.ts` for why its cutter does not fit a sector, `effects.ts` for where a transient is registered |
| writing | 20 | the circle, `volleyBallRadius`, `volley-core.ts`, `volley-shards.ts`, the `Effects` wiring, the spark counts, the body-draw row and its test |
| looking | 20 | four films: the first pieces landed on the shield before they were seen (lift up, pull down); the hatch strip showed no shell was left to break, so the hatch throws the core's skin instead |
| friction | 5 | `crop` refuses a fractional zoom; the frames tool's effect clock runs behind the simulation, so the pieces' flight was judged by shape and not by timing |
| landing | 5 | `check:fast` (two index rows, one body-draw assertion moved), the commit, `land --keep` |

Bottleneck: **what is there to break** — the pieces were designed for a shell
that the third ward has already taken whole, and only the film of the hatch
said so.

## 2026-09-12 · hit-looks — THE CRYSTAL is a craft with an electric field, opened by a shield anywhere under it

The owner: *it should react on the shield when in the same vertical as the
whole ship, to make it easier; add some visual before which indicates an
electrical shield around all — when shielded correctly below it the electric
shield is interrupted and the shot can hit the middle; let it fly slower;
make it look more cool, like a space ship; when hit wrong it shouldn't fall
faster, just nothing; replace the bulb and slick in the ship with anything
you like, red and cyan.* `crystalHeld` now answers for any lane of the span,
the crossing is one lane a beat, a wrong shot is caught and nothing else
happens (`crystalCatch`; the dive went to NOT BUILT YET → Mechanics), and
the body is a saucer cut from the retired `SHELL` contour with red and cyan
engine pods and a canopy in the join's colour, an electric field crawling
round the whole of it that opens across the underside while the shield
stands armed there. Found on the way: the shot was tested against the
middle of the lane the body was *going to* while it was found against the
lane it was *drawn* in, so a bolt up the visible join in the first half of a
beat was caught — `crystalMiddleLane` and `crystalUnder` read the drawn lane
now. About 55 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `sim/crystal.ts` and its config, events and consumers, `render/crystal.ts`, `silhouettes-spare.ts` for a free contour, the shape drafts, `mid-beat.ts` and `bullets.ts` for how a shot finds a body |
| writing | 25 | the sim rule and its tests, the event rename through audio, render, director and their tests, `crystal-craft.ts`, `crystal-field.ts`, the guide, the tables, the bestiary and the NOT BUILT YET card |
| looking | 10 | three films: the pods hidden under the wing, then a shot up the middle that was caught — which was the lane defect, not the picture |
| friction | 5 | `--press` refuses a press after `--ticks`, so the whole sequence was filmed as two runs |
| landing | 5 | `check:fast` (two index rows), the commit, `land --keep` |

Bottleneck: **the drawn lane** — a body that changes lanes is found by a bolt
where it is drawn, and every rule that then asks "which column of it" has to
ask the same question; the crystal's did not, and the film is what said so.

## 2026-09-12 · hit-looks — THE COIL's rock is thrown from the dome's tile to the far wall

The owner: *the first hit by shield must have a torch falling, immediately;
the torches must release from the exact position the coil was removing its
shield, then fly in a diagonal to the farthest border; when it has a shield
it is already looking like a torch inside; text "Do not shield!".* The freed
rock used to appear at the far wall on the dome's row and fall a beat later.
`popCoil` now leaves `fromCol`/`fromRow` on the dome's tile and puts the
rock on the far wall's hull row, so the glide is the diagonal and it is
resolved on the next beat line; a transient measures the throw from the
frame the dome went (a late ward is a fast one), runs the tail from the dome
and keeps the line lit a moment after the hit, and the impact's own vertical
tail is off for it. The coil is drawn as the burning torch inside its dome.
"Do not shield!" opens player 2's half of THE COIL's guide. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `sim/coil.ts`, `beat.ts`'s order, `hull.ts`'s arrival rule, `recoil-leap.ts`, `creatures.ts`, `torch.ts`, `rock-impact.ts` |
| writing | 10 | `popCoil`, two sim tests, `coil-flight.ts`, the tail from anywhere, `creature-body-rock.ts` (the rock bodies moved out of a full file), the wiring, four render tests, the guide line |
| looking | 5 | one film of a mid-beat ward — right first time |
| friction | 5 | the probe's `waveWorld` started a wave without its fault, so the stuck shield never armed; fixed in the tool (`tools/probe/world.ts`) |
| landing | 5 | `check:fast` twice (a guide half over 220 characters, a file at 251 lines, two index rows), the commit, `land --keep` |

Bottleneck: **deciding the timing** — a dome opened late in a beat leaves the
rock a fraction of a beat to fly, and every way of giving it a whole beat
needed either a new field on the body or a picture that ended after the
simulation had resolved it; the fast flight with a lit line behind it won.

## 2026-09-12 · hit-looks — THE CHOKE crawls along the hull to the cannon before it takes it

The owner: *when the choke hits the ship, it fast crawls to the cannon
first.* The grip was a cut — strand in its lane one frame, loops on the
cannon the next. Now the `chokeGrip` event names the body, and a transient
held with the hull-level ones draws the sac lying on the plating and surging
toward the cannon in the beat the simulation already leaves before it walks
anything, hooks reaching, with a flash as the loops go on. The landing burst
moved to the lane it fell in. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `sim/choke.ts`, `render/choke.ts`, `render-state.ts`, `canvas2d.ts`, the handed burst table |
| writing | 10 | `id` on the event, `choke-crawl.ts`, `choke-strand.ts` (the paint moved out of `choke.ts`, the crawler beside it), the wiring, four tests |
| looking | 5 | one film, cropped to the hull — right first time |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **none worth the name** — the simulation had already left the
beat the crawl needed.

## 2026-09-11 · hit-looks — THE STRAND's thread burns away like a fuse

The owner: *when all bulb and slick are destroyed there must be a nice
animation how the string is destroyed — like a fuse in the air, a bigger
effect.* The `strandBroke` event now carries every bead on the thread, and a
new body transient rebuilds the line from them, lights it at both ends and
burns it inward — sparking fronts, each raisin popping off as a front reaches
it — to a blast where the two meet, on the tile the old grey puff stood on.
About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `strand.ts`, `strand-bead.ts`, `effects-body.ts`, the burst table and both silent lists |
| writing | 10 | the event's `beads`, `drawRaisinAt`, `strand-fuse.ts` and `strand-fuse-draw.ts`, the wiring, five tests |
| looking | 5 | three films — the first too small, the second's blast too big |
| friction | 5 | the probe that planned the presses: two threads under the one I wanted rejected the shots, and the cooldown; `sinHash` re-derived once |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **getting every bead shrivelled on film** — the lit end is the
seeded rng's and hops after every shot, so the presses had to be planned by
running the wave headless first (`tools/probe`).

## 2026-09-11 · hit-looks — THE LID's cord hangs beside the eye and rides down with it

The owner: *the pull must be left or right of the enemy, then it should
glide as the lid glides.* The handle hangs a tile beside the eye on the side
toward the middle of the field (`lidSide`), and held or loose it goes down
with the body, the cord keeping its length; the tension is still the hand's
travel. The frozen anchor a September lane added is gone, and the per-beat
re-clamp it removed is back. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `lid.ts`, `handle-pull.ts`, `lid-string.ts`, `handle-place.ts`, the commit that froze the anchor and why |
| writing | 10 | `lidSide`, the rest and handle rules, `stepLidPulls` back, the two anchor fields out of the state and the hash, the render's `lidHandlePoint`, the sag's belly hanging down, three tests |
| looking | 5 | two films — one with the handle pulled off the crop, one loose then held |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **none worth the name** — the one decision was which side, and
the side with the room answered it.

## 2026-09-11 · hit-looks — THE RECOIL is thrown, not jumped

The owner: *jumping when hit is sometimes not natural and fluent — it's like
jumping.* A bounce was written mid-tick and glided over whatever was left of
the beat, so the frame of the hit jumped and a late hit crossed two rows in a
tenth of a beat. Now a struck recoil is on a throw of its own for one beat:
a parabola from where it was drawn, ending on the simulation's own place at
the fall's own speed, the colour turning along it. About 40 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `recoil.ts`'s bounce, `drawnRow`/`drawnCol`, the beat's `from` reset, where `Effects` reaches `drawCreatures` |
| writing | 15 | `recoil-leap.ts`, `Body.turn`, the placement in `creatures.ts`, the wake's end, four tests |
| looking | 10 | three films — the first two on the authored column rather than the mapped one, the bullet flying up an empty lane |
| friction | 0 | — |
| landing | 5 | `creature-place.ts` one line over its limit, `check:fast`, the commit, `land --keep` |

Bottleneck: **the column.** A wave's column is not the field's (`mapCol`),
and `press.ts` says so in its own header — two films were spent before it
was read.

## 2026-09-11 · hit-looks — What is inside a body stays inside it

The owner saw the red rind's inner animation reach past its body: a rind
wearing BURR (three lobes and knobs) drew the slick's bloom, whose veins are
sized to the slick's own ellipse, and they crossed the knobbed rim. Now every
living body's interior is clipped to the body drawn a sixth smaller
(`body-inset.ts`), so nothing inside touches the edge. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `living-draw.ts`'s order of clips, where `drawDetails` gets its radii, the BURR contour against the bloom's reach |
| writing | 10 | `body-inset.ts`, the wrap in `living-draw.ts`, a test that counts the clips per living body |
| looking | 5 | two 6-frame strips of THE RIND at zoom 3 — inset 0.9 still touched, 0.84 left a clear gap |
| friction | 5 | ten budget rows moved by one `clip` and one `save` each — remeasured with MEASURE on, every other figure checked unchanged |
| landing | 5 | `check:fast`, the two dated notes, the commit, `land --keep` |

Bottleneck: **the budget rows** — one extra clip per living body touches
every row in two budget tests, and each had to be remeasured rather than
padded.

## 2026-09-11 · hit-looks — The BESTIARY tab comes off

The owner asked whether the page was gone; it was not — an earlier lane had
only retired its idea rows. Now it is: the tab and its sheet leave the
director, the creature ideas read on MECHANICS in a group of their own, each
beside the draft drawn for it, which was already on GRAPHICS. About 20 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | what the tab still held (two empty groups, ten ideas, one prose section), every `bestiary` in the director, the concept-art join |
| writing | 5 | `index.html`, `backlog.ts` and `backlog-page.ts`, three comments, the README, the backlog tests |
| looking | 5 | two shots of the page against this tree's own director — the tab row, then the CREATURE IDEAS group with its shapes |
| friction | 0 | — |
| landing | 5 | lint red once on a line the formatter wanted folded, `check:fast`, the commit, `land --keep` |

Bottleneck: **none worth the name** — the shapes were on GRAPHICS already
through each draft's `suggests`, so the work was taking a page away without
breaking the join that page had carried.

## 2026-09-11 · hit-looks — A rock lands in the hole it makes

The owner's report: the meteor went into the ship and vanished, then jumped
up with the crater under it. The hull row's centre is under the membrane, so
the last glide ended behind the skin; and the hole stayed shut under the
stuck rock until it lifted off. Now the glide ends half-sunk in the plating,
the replay picks it up standing there, and the hole, the sparks and the
crack all show that frame. About 50 min, a compaction in the middle.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the layout numbers at 390×844, `rock-impact.ts`, `creatures.ts`'s placement, `sim/hull.ts`'s landing beat, `frame-ship.ts`'s gate, the two samplers in `hull-frame.ts`, the tests |
| writing | 15 | `rock-landing.ts` and its test, the `y0` clamp and the gate in `rock-impact.ts`, `skinSampler`, the parameter through `drawBodies` and `drawCreatures`, three doc comments |
| looking | 10 | two eight-frame strips of THE ROCK, the first with the cannon standing on the rock's column — which is what turned the surface sampler into the skin one |
| friction | 5 | no PNG joiner on the machine: a throwaway strip script against `tools/frames`'s own codec, written twice because the encoder lives in `picture.ts` and the decoder in `pixels.ts` |
| landing | 5 | `check:fast` red once on the file index, `bun run index`, the commit, `land --keep` |

Bottleneck: **reading** — the defect is three files agreeing on a height,
and finding which of the two membranes each one was asking took longer than
making them agree.

## 2026-09-11 · hit-looks — The act order names only what is built

The owner cleared THE ACT ORDER group of the NOT BUILT YET page: seven
placeholder names and THE TELL out of `bosses.md`'s order, 11.10 "In plain
words" gone with them, THE MOTHER and THE VESSEL drafts set free, a decision,
and the page's empty line saying where a built boss went. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `roster.ts`'s order parser and `isBuilt`, the drafts that suggest the names, every file naming a slot |
| writing | 15 | `bosses.md`'s head and the cut, `decisions.md` #30, four director tests, two drafts, the catalogue, `backlog.ts`'s `builtWhere`, the tab preamble |
| looking | 5 | three shots of the tab — the first against the main checkout's director on 4174, which showed yesterday's page |
| friction | 5 | The Conductor stood as unbuilt under its own name (now written as THE VANE); a draft must be offered to something, so two became free; the once-director idles out in three minutes |
| landing | 0 | `check:fast`, the commit, `land --keep` |

Bottleneck: **writing** — a draft cannot point at nothing and a test cannot
count nothing, so removing eight names is also deciding what the two
pictures drawn for them are now.

## 2026-09-11 · hit-looks — THE COUNT

The Countdown creature out of `ideas.md` and into act 3 as THE COUNT: a disc
whose count only the pilot is drawn, open for two beats at nought, a shot off
zero costing the hull. `sim/countdown.ts`, the render's marks, the wave and
its guide, the six tables, the director's brush and ship groups, a decision,
and sixteen tests that counted things moved by one. About 55 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the ideas entry, the lure's price and the throb's colour arrangement, `bullet-hit.ts`, `spawn.ts`, the split family in `creatures-split.ts`, the COUNTDOWN draft, `nameability.ts` |
| writing | 25 | `countdown.ts` in sim and render, the silhouette, the wave, the tables, the test, `decisions.md` #29, the bestiary row, fifteen knock-on tests |
| looking | 5 | two close-ups and a seven-beat strip of the pilot's screen, one close-up of the navigator's |
| friction | 10 | a one-lobe disc has no lobe count under the nameability gate (fixed with seven shallow lobes); the draft's card name collided with the new living card; five files at 251–254 lines trimmed back to 250 |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **writing** — a new kind is a name in six tables and a number in
sixteen tests, and every one of those tests wanted a sentence saying why it
moved.

## 2026-09-11 · hit-looks — Ten creature ideas leave the bestiary

The owner retired the Choke, the Glyph and the nine idea rows of bestiary 10.2
from the NOT BUILT YET page. Rows, paragraphs and the whole of 10.5 out of the
spec, a decision written, six documents that pointed at them re-pointed, the
director's tests turned round, and the page's empty-group line made one
sentence. About 40 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | how the director builds the bestiary groups (`backlog.ts`, `roster.ts`, `plain-words.ts`), every file naming the ten, the page's empty-group text |
| writing | 15 | `bestiary.md`, `decisions.md` #28, five other documents, two director tests, `backlog-page.ts` |
| looking | 5 | three shots of the tab: the two notes said "nothing here" and then "12 more", then "all 1 are" |
| friction | 5 | a Python heredoc bash refused to parse, rewritten as a file; one wrong assertion length |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **writing** — ten names were in eleven places, and each place
needed a sentence that still reads once they are gone.

## 2026-09-11 · hit-looks — `bun run shot` says what the page said

The queue's `versus:shot` item: a page that throws while loading used to
photograph as *no element matches — is the tab right?*, and with `--freeze`
as a ten-minute wait. `shot.ts` now listens to the page from the moment it
opens and prints what it said above that line, and a throw cuts the wait to
five seconds. A browser test with a page that throws. About 20 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `shot.ts`, `versus-shot.ts`, `shot-state.ts`, `page.ts`'s own listener, how `opening.test.ts` shares a browser |
| writing | 10 | `page-said.ts`, the wiring in `shot.ts` under its line limit, `page-said.test.ts` |
| looking | 0 | nothing visible moved |
| friction | 0 | — |
| landing | 10 | `queue done` by title, `check:fast`, the commit, `land --keep` twice |

Bottleneck: **landing** — half the time went on landing a 10-minute change.
The first `bun run land` ran its full check for four minutes and then went
red on one thing: the new file had no row in `docs/INDEX.md`. Writing the row
took a minute; the second full check took another four. `check:fast` had
passed a moment earlier because the index test was not among the tests it
runs for every change. Fixed in the next landing: the index test is now one
of `check:fast`'s sweeps, so a missing row is red before the commit.

## 2026-09-11 · hit-looks — THE CHOKE

A body that takes the cannon: the strip goes dead, the cannon walks wall to
wall, player 1 taps it off. Rules, six tables, a wave in act 7, the look on
the field and on the strip, its sounds, the director's rows, the bestiary
card retired. About 160 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 25 | `gum.ts` both sides, `malfunction.ts`, the strip look, the spine, `touch.ts`, the band's draw order, the frames tool's flags, nine pinned-count tests |
| writing | 75 | `sim/choke.ts` and its config and events, the codec, the six tables, `act-7a.ts`, `render/choke.ts`, `choke-coil.ts`, `choke-strip.ts`, `bind-choke.ts`, the replay and frame tests, the director rows, the bestiary |
| looking | 15 | four `bun run frames` pictures: the loops merged into a block at the first stack height, the hooks tangled once |
| friction | 30 | Python's text mode wrote CRLF into 45 files and biome refused them; a commit message in a `$(cat <<EOF)` hung bash and was written to a file; six files at the 250-line ceiling (`bind.ts`, `effects-spark.ts`, `act-7b.ts`, `events-creature.ts`, three tables), each split or trimmed; `--hold` had no lift, so the frames tool learnt `choke=up` |
| landing | 15 | `check:fast` four times over the pinned counts, the commit, `land --keep` |

Bottleneck: **friction** — a new creature touches every table the game has,
and five of them were already standing on the 250-line ceiling.

## 2026-09-11 · hit-looks — panel:band-skin opened with POLYP, VESICLE and SUCKER

Three candidates for the bed, gloss, life and slime round a button on GLAND's panel; a module cycle band-join / gland-join / band-seam that kept the VERSUS page from opening at all is broken by a leaf seam-line.ts.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | reading |
| writing | 45 | writing |
| looking | 20 | looking |
| friction | 20 | friction |
| landing | 10 | landing |

Bottleneck: bun run versus:shot failed with no picture and no message for twenty minutes before the in-app browser showed the cycle; the shot tool should print the page's console errors when the stage is missing.

## 2026-09-11 · hit-looks — The slime on the band is a record

drawBand called drawDrips by name; BAND_SLIME in slime-look.ts now wraps it so panel:band-skin can patch what hangs over the buttons.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | reading |
| writing | 10 | writing |
| looking | 0 | looking |
| friction | 0 | friction |
| landing | 5 | landing |

Bottleneck: Nothing worth naming: one import, one call, one new file.

## 2026-09-11 · hit-looks — GLAND's paths are held between frames

The spine's cord, stations and node and each organ's bed are cached per layout and per button, the stations are one fill instead of ten, the budget rows fell back and the frame is byte-identical.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | reading |
| writing | 10 | writing |
| looking | 0 | looking |
| friction | 0 | friction |
| landing | 5 | landing |

Bottleneck: Remeasuring five budget tables is a run and a paste, but still the longest part of a small change.

## 2026-09-11 · hit-looks — GLAND is the ship

The owner picked GLAND out of ship:body; adopt refused the function fields so the six shared tool modules moved into packages/render by hand, the seven records point at them, the displaced looks are deleted, five budget tables and the baked-entry count were remeasured, and the slot closed.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | reading |
| writing | 25 | writing |
| looking | 5 | looking |
| friction | 15 | friction |
| landing | 10 | landing |

Bottleneck: Closing the slot by hand: drop needs the candidates and their shared modules present to list them, so the moved files had to be restored, dropped, and removed again.

## 2026-09-11 · hit-looks — The lane question is retired

The owner said a landed lane must no longer ask whether to push, sweep or deploy; the rule, the hook message, its test, the reasoning doc and the lane skill now say: land with --keep, report, stop.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | reading |
| writing | 10 | writing |
| looking | 0 | looking |
| friction | 5 | friction |
| landing | 5 | landing |

Bottleneck: A python heredoc with apostrophes in it broke under the Bash tool again, so the edit script went through a file.

## 2026-09-11 · hit-looks — Three burning meteors offered in VERSUS

Three new creature:meteor candidates — BLAZE (a torch's fireball round a scorched, cratered stone), COMET (rusted iron under a long plume) and SMOULDER (a black stone burning on its underside, under a column of smoke) — each shedding small pieces with their own smoke up the wake, each keeping the shot marks; shared fire and smoke helpers in tools/versus/wake.ts and wake-fire.ts.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | reading |
| writing | 40 | writing |
| looking | 35 | looking |
| friction | 20 | friction |
| landing | 10 | landing |

Bottleneck: Radial gradients painted inside the clipped stone came out flat or blank in the shots, whatever their geometry; the hot underside is a linear gradient instead, and every other gradient in the three was made concentric on the way.

## 2026-09-11 · hit-looks — THE GUM: a body that sticks to the ship and is swiped off by the seat without the cannon

A new creature and wave 44: the gum falls straight, cannot be shot, sticks to the hull and shuts the cannon in its columns; player 1 parks the cannon under it and player 2 swipes it toward the nearer wall, the wrong way spreading it a lane. Sim, render (THE WEIGHT's sac in venom green), scene, audio, director, frames tool, tests.

| activity | minutes | what it was |
|---|---|---|
| reading | 25 | the balloon's handle, drag and audio files as the pattern, the tests that enumerate every kind |
| writing | 95 | sim, render, content, scene, audio binding, director pages, the sim test |
| looking | 5 | one frame of a stuck gum mid-swipe |
| friction | 20 | two heredocs broken by apostrophes, the canvas stub without transform, a dozen enumerating tests found one by one |
| landing | 15 | format, check:fast, index, perf --unmeasured, the log |

Bottleneck: The tests that enumerate every creature kind — bestiary categories, mechanics, backlog counts, sheet card counts, audio wiring lists — each found by running the whole suite rather than from one checklist.

## 2026-09-11 · hit-looks — THE CRYSTAL

THE CRYSTAL built off the bestiary's Crystal: a red slick and a cyan bulb joined at a thin middle under one shell, crossing on the carom's diagonal, opened only by the shield under the middle and the guard armed on the beat the shot of the join's colour lands; a wave, a guide film, three sounds, the director's rows. About 70 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the carom and clasp files end to end, the scene format, the audio binding tables, the file-limit list, the director's brush and ship tables |
| writing | 30 | config-crystal, crystal.ts in sim and render, events, the joined creatures file, the wave, the scene, the bindings, thirteen sim tests and a frame test, the bestiary |
| looking | 10 | six bun run frames pictures — the shell's waist too shallow at first, then the link drawn under the gliding body instead of in the shield's lane |
| friction | 5 | a heredoc turned an escaped newline into a real one and broke the edit script; two files landed on 251 lines and each lost a comment line |
| landing | 10 | two check:fast rounds fixing the twelve tests that name every kind, the commit, land --keep |

Bottleneck: writing — a creature touches forty files across four packages and the director before it can be drawn once, and every one of them is a row in a table a test reads

## 2026-09-11 · hit-looks — THE TELL removed

The boss round THE TELL and everything that hung off it — sim ladder and ring, render body and scenes, the reduced panel, the guide scene, wave 60, the director's rows, the perf baseline row — taken out; the design stays on the BOSSES page as a removed idea.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | reading |
| writing | 20 | writing |
| looking | 0 | looking |
| friction | 5 | friction |
| landing | 10 | landing |

Bottleneck: Finding every dependency of a round when 'tell' is also an ordinary English word and the Bulb Queen's own field name.

## 2026-09-11 · hit-looks — creature:rind kept, three sheds to the LIBRARY

The owner kept the shipped shed and asked for the VERSUS alternatives on the GRAPHICS page: FLAKES, POD and SLOUGH moved into packages/render beside their record, the slot dropped by hand, and a rind card built that replays the shed on the game's own burr.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | reading |
| writing | 20 | writing |
| looking | 15 | looking |
| friction | 10 | friction |
| landing | 10 | landing |

Bottleneck: Catching a half-second event on a card with a fixed-wait shot took five shots; the page clock does not start at the click.

## 2026-09-11 · hit-looks — creature:recoil — GLOBE into the game, three cages kept

Copied MOONS, FOAM and CALYX into render for the LIBRARY, adopted GLOBE with the tool, built a recoil card that spends its ribs, let two creatures share a label on the LIBRARY.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | reading |
| writing | 15 | writing |
| looking | 5 | looking |
| friction | 5 | friction |
| landing | 5 | landing |

Bottleneck: Two slots had spelled a look FOAM, and the LIBRARY test wanted labels unique across the whole page; a label is now unique under its creature.

## 2026-09-11 · hit-looks — creature:queen — SCUTES into the game, CARAPACE and FACET kept

Copied CARAPACE and FACET into render for the LIBRARY, adopted SCUTES with the tool, built a queen card that hands her contour straight to a look, remeasured the BULB QUEEN's op-count rows.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | reading |
| writing | 15 | writing |
| looking | 5 | looking |
| friction | 10 | friction |
| landing | 5 | landing |

Bottleneck: A Bash heredoc holding three files failed to parse and had to be redone through the Write tool; then the op-count budget wanted the seven plates measured.

## 2026-09-11 · hit-looks — creature:mount — TAPROOT into the game, RASP kept

Moved the rooted rim into content so a package could draw it, took TAPROOT and RASP by hand, broke the record–look import cycle with mount-bearing.ts, built a mount card with a hub to face, dropped the slot.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | reading |
| writing | 20 | writing |
| looking | 5 | looking |
| friction | 5 | friction |
| landing | 5 | landing |

Bottleneck: Both candidates imported tools/shape-sheet, which a package cannot; the rim had to move into content first and the adopt tool could not do the slot.

## 2026-09-11 · hit-looks — creature:magnet — ORE into the game, the rest gone

Adopted ORE with the tool, cut COIL's dead arch out of magnet-coil.ts and retitled it as the slab and poles ORE draws over, photographed THE MAGNET.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | reading |
| writing | 10 | writing |
| looking | 5 | looking |
| friction | 5 | friction |
| landing | 5 | landing |

Bottleneck: Cutting the dead horseshoe: the slab shares the bevel with the arch, and the first cut took it too.

## 2026-09-11 · hit-looks — creature:lid — IRIS into the game, BEVEL kept, SHAPES renamed GRAPHICS

Adopted IRIS with the tool after copying BEVEL and the old plates into render for the LIBRARY, built the lid stage that pulls the cord on a card, renamed the tab with SHAPES kept as a synonym for the shot tool, remeasured THE LID's op-count row.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | reading |
| writing | 20 | writing |
| looking | 10 | looking |
| friction | 5 | friction |
| landing | 5 | landing |

Bottleneck: The op-count budget: six leaves cost more fills and gradients than two plates, and the row had to be remeasured in MEASURE mode and moved before check:fast went green.

## 2026-09-11 · hit-looks — creature:veer — the rider's collar stays on the rock

Read the rider's geometry, found the 'hands' are the ruff beads sinking with the crouch, pinned them to the rock's crown, photographed the brace before and after, dropped the slot.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | reading |
| writing | 5 | writing |
| looking | 15 | looking |
| friction | 5 | friction |
| landing | 5 | landing |

Bottleneck: Catching the brace on a frame: the first two photographs were of a rock in a row that does not brace, and a probe had to say which tick to shoot.

## 2026-09-11 · hit-looks — creature:veil — ANVIL kept and thinned over the body, three clouds kept

Moved FOAM, STRATA and VORTEX into packages/render, thinned the see-through cloud until the slick reads, built a veil stage and four cards, photographed the field and the LIBRARY, dropped the slot.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | reading |
| writing | 20 | writing |
| looking | 15 | looking |
| friction | 0 | friction |
| landing | 10 | landing |

Bottleneck: Finding how much cloud to leave on player 1's screen took three frames: the near heaps are dark on dark and hardly show at game size, so the visible change is mostly the base fill going.

## 2026-09-11 · hit-looks — creature:volley — EMBER into the game, PITTED and the painted seams kept

Moved EMBER's seams into the record and PITTED beside it, built a volley stage that walks the plate count down on a card, photographed the LIBRARY and the field, dropped the slot.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | reading |
| writing | 20 | writing |
| looking | 10 | looking |
| friction | 5 | friction |
| landing | 10 | landing |

Bottleneck: Dropping a decided slot also drops its versus-pose row, and one test reached the pose through that row — it now names the pose directly.

## 2026-09-11 · hit-looks — creature:warden — SURFACE stays, three kept on the LIBRARY

Read the three candidates and the warden record, moved their paints into packages/render beside the record, built a warden stage for the LIBRARY from the game's own body and state, photographed the cards, dropped the slot.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | reading |
| writing | 25 | writing |
| looking | 15 | looking |
| friction | 10 | friction |
| landing | 10 | landing |

Bottleneck: Photographing the LIBRARY: the browser pane cannot save a PNG and `bun run shot` needed the right flags (`--tab` opens the sheet itself; `--click` takes a CSS selector, not a Playwright one) — found by three failed runs.

## 2026-09-11 · hit-looks — the wisp wears ARMS, and SHAPES gets a LIBRARY

The owner took ARMS into the game and asked for the threads it replaced, COMB and SKIRT, to be kept on the SHAPES page because he wants more jellyfish-like bodies. The page had no place for a whole canvas-drawn look, so it got one: a fourth view, LIBRARY, whose cards are the game's own drawing code run on the game's own wisp (`tools/director/src/library`). ARMS was inline in its candidate and went in by hand; THE WISP's op-count rows moved.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the candidate, `wisp-look.ts`, the SHAPES views, the holders panel's loop |
| writing | 25 | `wisp-arms.ts`, the library's types, stage, four assets, panel, VIEW button, test |
| looking | 10 | the LIBRARY in the director twice, one frame of THE WISP |
| friction | 5 | a canvas that is 300 wide by default hid a missing height; one heredoc too long for the shell |
| landing | 5 | check:fast, budget rows, commit, land |

Bottleneck: There was no place on the SHAPES page for a canvas-drawn look, and building one was most of the piece.

## 2026-09-11 · hit-looks — the back decided: the sea stays, one light in the corner, the beat's sweep off

The owner kept the shipped back and dropped `field:backdrop`; what he kept of NEBULA is one soft rounded light of the act's tint in the sky's bottom-right corner (`corner-light.ts`, additive like the shafts), and the beat's travelling band across the field is off for the moment, its function kept and exported with a note on how to put it back. Every op-count budget moved by the one `drawImage` a frame the light costs.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the three candidates, `backdrop-look.ts`, `field.ts`'s sweep, the budget files |
| writing | 10 | `corner-light.ts`, the record's new order, the sweep's note |
| looking | 10 | three frames of THE RIND — the first two too faint to see over the violet ground |
| friction | 5 | twenty-two budget rows and the baked count moved by one |
| landing | 5 | check:fast, commit, land |

Bottleneck: A light of an act's tint laid over the ground is invisible until it is added instead, which took two pictures to see.

## 2026-09-11 · hit-looks — the rind decided: BURR

The owner picked BURR for `rind:body`. `bun run versus adopt` moved the candidate into render, but it imported the shape sheet's `studded` form by a relative path, which a package may not do; the arithmetic moved into `packages/content/src/studded.ts` and the sheet's form became a wrapper round it, the move `metaball.ts` and `body-path.ts` made before.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the adopt tool's output and the candidate's imports |
| writing | 10 | `content/studded.ts`, the sheet's wrapper, the render import |
| looking | 5 | one frame of THE RIND, cropped |
| friction | 5 | the moved file's relative import broke the typecheck; the crop tool's argument shape |
| landing | 5 | check:fast, commit, land |

Bottleneck: The adopt tool moves a file without rewriting a relative import into a tool, which cost a typecheck round.

## 2026-09-11 · hit-looks — the crater decided

The owner keeps the crater as shipped; the slot closed with nothing taken. About 5 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 0 | nothing — the decision came in chat |
| writing | 0 | nothing |
| looking | 0 | nothing |
| friction | 0 | none |
| landing | 5 | `versus drop`, `check:fast`, the commit, `land --keep` |

Bottleneck: **landing** — there was nothing else.

## 2026-09-11 · hit-looks — the ship's body, three cards from the brief

The owner named what he wanted from three of the six ships rather than one of
them; those three went and three new cards stand in their place, built on a
wet grain-free skin, buttons grown as organs, and PLASM's bubbles and strings.
About 70 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the three cards he judged, `join.ts`, `sheen.ts`, the band's draw order, the record types, the versus tests that hold a slot to one shape |
| writing | 35 | `wet.ts`, `organ.ts`, `cord.ts`, `fluid.ts`, three candidates, the DECIDED entry |
| looking | 10 | five `versus:shot` pictures: ribs beading at the rim, veins as a sea urchin twice before they read as vessels |
| friction | 5 | two long heredocs died in bash and were written through a script file; `organ.ts` over 250 lines, the cords moved to `cord.ts` |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **writing** — a brief that takes one thing from each of three
cards is three shared modules before any card can be drawn.

## 2026-09-11 · hit-looks — DOCUMENTATION → WORDINGS

A new tab: two whole phones, the pilot's and the navigator's, each a real
frame with a line from every word to the thing it names, and the words with
no place to point at under them. About 75 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | the sheet's tab wiring, `pose-art.ts`, `layout.ts`, the band, lobe, siren, HUD and radar files for what each thing is called and where it stands |
| writing | 30 | the world, the callouts, the page with its label stacking, the glossary, the CSS, the test, three render exports |
| looking | 15 | two `bun run shot` rounds: labels piling up at the top of one margin, both lobe leaders on one line, the blip under the torch's alarm |
| friction | 5 | a `cat` left waiting on stdin; `bun run dev` is refused to an agent, so the director was launched by absolute path on its own port |
| landing | 5 | `main.ts` over 250 lines after one more binding — the five room bindings moved to `documentation-rooms.ts` |

Bottleneck: **writing** — laying labels beside a picture without them
piling up took a measured two-pass stack rather than a guessed one.

## 2026-09-11 · hit-looks — the torch decided

The owner keeps the torch as shipped: both torch slots dropped, the stale
queue claim closed, the branch that only ever existed as a local ref deleted.
About 10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | where the claimed branch lived (a local ref in the main checkout, tip already on `main`, no worktree), the two torch slots |
| writing | 0 | — |
| looking | 0 | — |
| friction | 0 | — |
| landing | 5 | `versus drop` twice, `queue done`, the tests, the commit, `land --keep` |

Bottleneck: **reading** — a `Taken:` line names a branch, not where the
branch lives, so the owner could not tell a finished claim from a lost one.

## 2026-09-11 · hit-looks — the queue: the pose map's stale rows

Nineteen rows for closed slots out of `versus-pose.ts`; `adopt` and `drop`
take a slot's row with it, and the director's test refuses a row whose slot
has no candidate. On the way, two room tests that raced under a full check.
About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `versus-pose.ts`, its test, `decide.ts`; then `room.test.ts`, `settle`, `occupiedSeats` and `pressStart` for the flakes |
| writing | 15 | `pose-row.ts` and its test, the row test, the cannon tests moved onto the pose by name, `docs/versus.md`; the two room tests |
| looking | 0 | — |
| friction | 5 | the Bash tool collapses a doubled backslash inside quoted heredocs and `node -e`, so a script that matched source text never matched — the edits went through the editor tool |
| landing | 5 | `queue done`, `check:fast`, the commit, `land --keep` |

Bottleneck: **friction** — two red `land` runs on room tests unrelated to
the lane, each a full `check` to find out.

## 2026-09-11 · hit-looks — the queue: a claim on the lane's own entry

`bun run queue take` marks an entry the trunk has not got in the working
copy instead of throwing, and a claim that fails to mark deletes the branch
it made; `repo.ts` split along its git seam into `git.ts`. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `claim.ts`, `repo.ts`, `run.ts`, `edit.ts`, the two existing tests |
| writing | 15 | `trunkHas`, the working-copy branch of `claim`, the rollback, `hasEntry`, a test repository shaped like the lane, the preamble paragraph |
| looking | 0 | — |
| friction | 0 | one assertion compared against an untrimmed `git status` line |
| landing | 5 | `queue done`, `check:fast`, the commit, `land --keep` |

Bottleneck: **writing** — the fix is ten lines and the test that proves it
in a real repository is a hundred.


## 2026-09-11 · hit-looks — the queue: shipped-looks caught up

Four sections written into `docs/shipped-looks.md` — the chute, the coil, the
dart and the echo — from the four `*-look.ts` records, the adopted paint and
`DECIDED.md`, in the file's own table form. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the file's 400 lines for its form, eight render files and four DECIDED entries for the numbers |
| writing | 10 | four tables and the paragraph under each |
| looking | 0 | nothing visible moved |
| friction | 0 | a long heredoc died in bash again — the sections were written with the tool and spliced in with awk |
| landing | 5 | `queue done`, the commit, `land --keep` |

Bottleneck: **reading** — every number in a table is in a different file
from the one that says why it is there.


## 2026-09-11 · hit-looks — the gyre slot answered

ORBIT into the game; the granules it replaced, HELIX and VORTEX all
re-authored as fillings on the SHAPES page, ORBIT beside them as the
control. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the three gyre candidates and `gyre-core.ts` |
| writing | 15 | the adoption, the core stripped to its shared parts, four fillings and two helpers in `fillings/parts.ts` |
| looking | 5 | `versus:shot` before; one card each after, the helix opened up on the second look |
| friction | 0 | — |
| landing | 5 | the gyre budget rows remeasured, `check:fast` |

Bottleneck: none worth the name — the ghost lane an hour earlier had already
built the path, and this one walked it.

## 2026-09-11 · hit-looks — the ghost slot answered

SWARM into the game, the eyes made to read at the field's size, HOLLOW and
LANTERN re-authored as fillings on the SHAPES page. About 40 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the three ghost candidates, `ghost-eyes.ts`, `ghost.ts`, the fillings axis and its helpers |
| writing | 10 | the adoption, the eye numbers, two fillings, the record clean-up |
| looking | 10 | `versus:shot` before, `frames . --wave` after at 8x; two rounds on each filling card |
| friction | 5 | `land` refused yesterday's lane over two parked titles a few characters past eighty |
| landing | 5 | the ghost budget rows remeasured, `check:fast` |

Bottleneck: once a slot is closed nothing shows the shipped look on its own —
`versus:shot` needs a candidate — so the eyes were checked by cropping a
wave frame, which is fine for the ghost and blind for a body that moves.

## 2026-09-10 · hit-looks — five creature slots answered

Five VERSUS slots taken into the game from one chat message, the looks he
wanted kept re-authored on the SHAPES page (three tails, two skins, one hit),
two op-count budgets remeasured. About 50 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `docs/versus.md`, the five slots' candidates, the tails/skins/hits registries |
| writing | 15 | four adoptions by tool and one by hand, six SHAPES entries, the record clean-ups |
| looking | 10 | `shapes:still` grew `tail:`, `tails`, `hit:` so the six could be seen; three rounds each |
| friction | 5 | `queue take` cannot claim an entry only in the lane's tree; a heredoc that swallowed three files |
| landing | 10 | two budget tables moved, `check:fast`, `land` |

Bottleneck: the SHAPES page had no terminal path to a tail or a hit, so half
the looking time went into building one before anything could be looked at.

## 2026-09-10 · claude/band-slot-after-ship-body

One question put to the owner and his answer written into the band's queue
entry, which now waits on `ship:body` instead of asking. About 5 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 0 | — |
| writing | 5 | the entry, re-filed as a task |
| looking | 0 | nothing visible moved |
| friction | 0 | — |
| landing | 0 | folded into the next landing's check |

Bottleneck: none worth naming.

## 2026-09-10 · claude/compaction-window-and-hook

The auto-compaction window set to 300k in `.claude/settings.json`, compact
instructions at the end of `CLAUDE.md`, and a `SessionStart(compact)` hook
that restates branch, queue and parked into the fresh context. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the Claude Code docs for the setting's real name, the existing hooks and their wiring test, the queue parser |
| writing | 10 | the hook, its test, the settings, the instructions, two docs |
| looking | 0 | nothing visible moved |
| friction | 5 | one combined command hung for two minutes and was re-run as separate steps |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **reading** — a setting's name has to come from the docs, not
from memory, before it can be written into a file every session reads.

## 2026-09-10 · claude/next-and-stop-in-chat

The convention for handing a session several independent tasks — a numbered
list worked in order, `NEXT:` to queue a task mid-turn, `STOP` to interrupt —
written into `CLAUDE.md` and `docs/working-with-claude.md`. About 10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 0 | — |
| writing | 5 | one bullet, one section |
| looking | 0 | nothing visible moved |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **none** — a short lane.

## 2026-09-10 · claude/workflow-token-efficiency-fb8475 (second landing)

`docs/choosing-a-model.md` removed with its three pointers, and
`docs/token-budget.md` rewritten for the way the work is actually done: one
session on Opus 5, tasks in sequence, compaction at about 300k. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the three files that pointed at the doc, the sessions memory |
| writing | 5 | the doc, three pointers, an INDEX row |
| looking | 0 | nothing visible moved |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **none** to speak of — a short lane.

## 2026-09-10 · claude/workflow-token-efficiency-fb8475

`CLAUDE.md` cut from 21.3 KB to 13.3 KB, a paragraph's headroom from its
ceiling, after the owner asked how to spend fewer tokens: the justifications
went back to the docs that already held them, the rarely-run scripts to a new
`docs/commands.md`, and the ceiling came down to 16 KB. About 20 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `CLAUDE.md` whole, `claude-md.test.ts`, the time log, `token-budget.md`, and each receiving doc to be sure it held what was being cut |
| writing | 10 | the file rewritten, `docs/commands.md`, two tests, an INDEX row |
| looking | 0 | nothing visible moved |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **reading** — checking that every sentence removed already lived
somewhere else, which is the only thing that makes removing it safe.

## 2026-09-10 · claude/queue-what-a-hit-on-a-slick-or-a-bulb-looks-like-is-sh

A hit record per kind, the transient that draws it, two poses, and six
candidates — three strikes for the slick and three for the bulb. About
50 min from the claim to the trunk moving.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the queue entry, `body-interior.ts`, `debris.ts`, `effects-break.ts`, `effects-spark.ts`, the recoil lane's candidate shape, the break pose |
| writing | 15 | `body-hit.ts`, `body-strike.ts`, the debris and sparks routed through it, a test, `poses-struck.ts`, six paints and six cards |
| looking | 20 | twenty `versus:shot` runs at eight seconds each, and what each picture asked for — petals too small, a drip drawn as a disc, spores lost in the wedges, a wave four columns wide |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **looking**, again — but a shot is eight seconds now rather than
two minutes, so the cost was the number of corrections rather than the wait
for each, which is the right cost to be paying.

## 2026-09-10 · claude/queue-the-players-ship-has-had-one-hull-since-the-game

Two queue entries checked against what `main` already carries: the hull
entry was answered by `ship:body`, and the band entry cannot open while that
slot holds its fields. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the queue, `docs/versus.md`, `DECIDED.md`, `bun run versus`'s field lists, the five `ship:body` commit messages |
| writing | 5 | one entry removed, one re-filed with an `Asks:` line |
| looking | 0 | nothing visible moved |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **reading** — the entries were written before `ship:body`
existed, so most of the lane was establishing that it is the answer to one
of them and the block on the other.

## 2026-09-10 · claude/queue-the-rind-and-the-lid-have-one-look-each-and-no-r

Three sheds and three bodies for THE RIND, three armours for THE LID, a hand
on the pose, and a pair that dropped half its events. About 2 h 35 min from
the first command to the trunk moving.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | the queue, `docs/versus.md`, the throb/crawler lane's shape, `rind-shed.ts`, `lid.ts`, the pose kit |
| writing | 50 | two look records and their shipped paint, `Pose.hand` and two poses, six candidates, then the `rind:body` seam and three more at the owner's asking |
| looking | 55 | fourteen `versus:shot` runs at two to three minutes each, reading each picture, and the tuning it asked for — POD's swing, IRIS's seam, FLAKES' colour, FACET's depth |
| friction | 20 | `--at` came back as prose (a wrong rectangle, read as a bug); the browser pane's screenshots timed out on the pair; no way to magnify a PNG already taken, so a throwaway script |
| landing | 15 | `check:fast` red on a file one line over; first `land` refused on four conflicts with thirteen commits landed meanwhile; second red on `docs/INDEX.md` rows; third landed |

Bottleneck: **looking**. A picture of one candidate costs two to three minutes
of director start-up and browser, and a candidate needs two or three pictures
before it is right — more than a third of the lane was waiting for
screenshots. The pair's own frame rate is not the cost; the start-up is.

## 2026-09-10 · claude/queue-bun-run-check-is-red-on-main-a-claim-the-shapes

A test that was green on Windows and red on Linux by the last digit of a
float, settled by saying what the sheet actually does. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the queue entry, `candidates.test.ts`, `drawn-size.ts`, `shape-fit.ts`, `drawn-size.test.ts`'s premise, the git log around dce50590 |
| writing | 5 | the two cases in `candidates.test.ts` and a paragraph in `drawn-size.ts` |
| looking | 0 | nothing visible moved |
| friction | 5 | the failure would not reproduce here — a scratch script at the root could not import `@neon-spore/content` and had to move inside the package |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **reading** — the entry named a red test that is green on this
machine, so most of the lane went into proving the diagnosis before the
three-line fix could be trusted.

## 2026-09-10 · claude/queue-bun-run-queue-take-cannot-write-its-taken-line-i

A claim written onto `main` in a clone that has nothing checked out on it.
About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the queue entry, `claim.ts`, `repo.ts`, `run.ts`, how `land` writes a note in a clone (`note-commit.ts`) and how it merges `docs/queue.md` (`queue-merge.ts`) |
| writing | 15 | `commitOnRef` through git plumbing, its clone-shaped test, two paragraphs of docs |
| looking | 0 | nothing visible moved |
| friction | 5 | a regex written through `sed` lost its backslashes twice; the third time it went through Python |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **reading** — deciding between the entry's two options took
finding that the landing already resolves the conflict the first one would
cause, which was in a file the entry did not name.

## 2026-09-10 · claude/queue-versus-pose-ts-is-at-the-line-ceiling-and-every

`SLOT_POSE` cut down to rows, each slot's reason moved onto the pose it names,
and a test that keeps the paragraphs from growing back. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the queue entry, `versus-pose.ts`, every `poses-*.ts` docstring the map pointed at, `limits.test.ts`, the scaffold's step four |
| writing | 10 | the rows-only map, one sentence on each of twenty poses, the test, the scaffold's wording |
| looking | 0 | nothing visible moved |
| friction | 5 | a heredoc that would not close on a quote inside the prose, moved to a script file; two escaped newlines the test file lost on the way in |
| landing | 5 | the director and versus tests, `check:fast`, the commit, `land --keep` |

Bottleneck: **reading** — twenty pose docstrings had to be read to know which
already argued for their slot and which did not, before a sentence could be
put on the ones that did not.

## 2026-09-10 · claude/queue-the-volley-and-the-veer-have-one-look-each-and-n

A look record each for THE VOLLEY's shell and THE VEER's rider, a pose each,
and three candidates apiece. About 1 h 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | the queue entry, `volley.ts` and its seams and cracks, `veer-clown.ts` and the clown figure, `throb-look.ts` for the record shape, the depth skill, `versus/README.md`, the pose kit's hand |
| writing | 45 | two records and the shipped paint moved behind them, `VolleyShell.kept`, two poses and the volley's hand, six candidates, the ward test |
| looking | 15 | eight `versus:shot` runs at twelve seconds each; the pits made larger and more, the jester's horns widened into a V, the ember's scorch clipped to stone |
| friction | 10 | a heredoc that would not close, three times, on prose with quotes in it — moved to script files and to the Write tool; a `rm -rf` of the wrong glob that took six freshly written files with it |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **writing** — six paints is six small programs, and each was
written against a picture of the shipped body taken first rather than blind,
which is what kept the looking short.
## 2026-09-10 · claude/queue-the-coil-and-the-tether-have-one-look-each-and-n

Two look records cut, three candidates each for THE COIL's chain and THE
WARDEN's rope, and a pose file for both. About 95 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | the queue entry, `coil.ts`, `coil-jump.ts`, `tether.ts`, `clasp.ts`, `handle-draw.ts`, the sim's coil and rope rules, `carom-look.ts` as the pattern, the pose kit and three pose files, the depth skill |
| writing | 40 | `coil-look.ts`, `tether-look.ts`, the two call sites, six candidates with their paints, `poses-link.ts`, the rows |
| looking | 25 | nine `versus:shot` pictures with crops; the first coil pose collapsed its chain, the first bead answer put a dark blob on the rock and was replaced, the prongs read as Vs, the sinew's sheath filled as a chord |
| friction | 5 | no Python on this machine for a multi-file edit; a probe script at the root could not import `@neon-spore/sim` and moved inside the director |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **looking** — none of the four defects the pictures caught was
visible to `bun run check`, and each cost a shot, a crop and a re-shot; the
pose's chain in particular could only be timed by watching the beats print.

## 2026-09-10 · hit-looks

Every hit look on the VERSUS page put into the game, one body each, and both
slots closed. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the six candidates, `body-hit.ts`, `body-strike.ts`, which kills carry which kind (`wornKind`), the adopt tool |
| writing | 10 | the five moves, the seven records and `hitFor`, `of` on the kill event, the test, DECIDED |
| looking | 5 | four `bun run frames` strips to find the tick a bolt meets a bulb on wave 2; two perf runs |
| friction | 0 | no Python on this machine for the sim edit — sed did it |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **looking** — photographing a kill means guessing the tick the
bolt lands on, and it took three strips of the wrong tick before one of the
right one.

## 2026-09-10 · hit-looks (second piece: the carom capsule)

FACET taken on as a space rescue capsule: three offered on its faces, one
picked in chat and shipped, the slot closed. About 40 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the four carom candidates, `carom-look.ts`, `carom.ts`, the window, the adopt and by-hand tools |
| writing | 20 | `carom-facet.ts` and `carom-marks.ts`, three paints and their indexes, the by-hand take, DECIDED, INDEX |
| looking | 10 | three `versus:shot` pictures twice over with a strip tool written in the scratchpad, one game frame, one perf run |
| friction | 5 | a heredoc with a long file died in bash and was written with the tool instead; `adopt` refuses a slot whose travel is the shipped wedge, and `drop` needs the directories still there — the DECIDED entry was written by hand |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **writing** — three candidates that all wear four markings is
one base and two helper files before any of the three can be drawn.
