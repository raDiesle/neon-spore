# Context map

One line per file, so a session can open the two it needs instead of searching.
Keep this current — it is the cheapest file in the repo and it saves the most.
The Code table below is completed by `bun run index`, which adds a row for
any in-scope source file that does not have one yet; a hand-written row is
never overwritten, so improve one by editing its text in place.
`bun run index --check` writes nothing and fails when the table has drifted
from the tree. A row's prose is yours, but the two things in it that go stale
on their own are checked: a backticked name has to be a file or a word in the
file, and a count has to agree with what the file's own header counts.

## Decisions and architecture

| File | Read it when |
|---|---|
| `docs/decisions.md` | you are about to change a technology or a structural rule |
| `docs/git-and-landing.md` | a landing surprised you, or you want to argue with a Git rule in CLAUDE.md |
| `docs/cloud-session.md` | you are a session started from the phone, or you are changing what one may do |
| `docs/looks.md` | you are about to change something a player would see in a frame |
| `docs/style-guide.md` | you want the whole visual language on one screen — identity, shape, colour, light, motion, what a physics round needs of an asset, and which format is which. The top of the visual tree, with `docs/reference/style-guide.svg` beside it |
| `docs/art-review.md` | you are about to propose anything a player would see, and want the checklist those rules turn into |
| `docs/architecture.md` | you touch the sim/render boundary, determinism or the tick |
| `docs/working-with-claude.md` | you are setting up a session, a skill or a hook |
| `docs/versus.md` | you are offering a second answer to something already drawn, or judging one |
| `docs/alive.md` | you are making a body read as living rather than as drawn |
| `docs/parts.md` | you are adding a secondary form — a tentacle, a spore, a crystal, a fin — or building a body out of them |
| `docs/skins.md` | you are adding a way to draw a catalogue card's body, or animating one |
| `docs/shipped-looks.md` | you need to know what the game actually draws today — every glow and tail, creature by creature, with the numbers |
| `docs/glow.md` | you are adding a way for a catalogue card's body to throw light — or things — into the space around it, or to react to being hit |
| `docs/raster.md` | you are about to add a picture the game does not compute — a sprite atlas, an APNG, an animated WebP — or you are deciding whether an effect should be baked at all |
| `docs/dimensional.md` | you are asking how much depth this stack can show without a second renderer |
| `docs/teaching.md` | you are about to touch a wave's guide, or reconsidering a gated demonstration for the first minutes — the game's own answer to that question is `docs/spec/briefings.md` |
| `docs/release-notes.md` | you want to know what changed and when — read-only, written by `bun run land` |
| `docs/time-log.md` | you want to know where a lane's time went, or you are landing one and owe it an entry — the bottlenecks across sessions, in minutes |
| `docs/lane-speed.md` | you want the reading of `docs/time-log.md` rather than its entries — where a lane's minutes go across hundreds of them, what friction costs by cause, and what would take the minutes off |
| `docs/queue.md` | you found a technical improvement and are not doing it now, or you are opening a session to drain one — `bun run queue` |
| `docs/parked.md` | you are stopping mid-way through something, or picking up what a session left half-done — the front of the same queue, work only, never ideas |
| `docs/performance.md` | you added a shape or an animation, or you want to know what a frame costs and where the time goes — `bun run perf` |
| `docs/token-budget.md` | you wonder why files are small and docs are split, or how one sequential session with automatic compaction should spend its context |
| `docs/commands.md` | you need a `bun run` script that `CLAUDE.md`'s short list has not got — every one, a line each |
| `docs/delegating.md` | you hand implementation to the worker model |
| `docs/delegation-cost.md` | you wonder whether delegating is worth it — it was measured |
| `docs/delegation-pitfalls.md` | you turn delegation back on for more tasks — the failure modes already hit |
| `docs/claude-vs-chatgpt.md` | you are wondering whether the subscription paying for the agent should change — task by task, with a verdict column |
| `docs/borrowed.md` | you are mining It Takes Two or Split Fiction for a mechanic — the verdict column says what can reach this game |
| `docs/tower-defence.md` | you want a slick, a bulb or a meteor to be played differently, or a weapon or helping system — read off 2D tower defence, with pictures |
| `docs/party-games.md` | you are looking for the next round that is not the field — Mario Party and Rayman Raving Rabbids, read for the shape of sixty seconds rather than for a minigame |
| `docs/asset-catalogue.md` | you are looking for a shape to spend, or adding one |
| `tools/delegate/WORKER-CONVENTIONS.md` | you change what the worker model is allowed to do or must know |

## Specification

The design lives in `docs/spec/`, translated and split by topic. Start at
`docs/spec/README.md`: it carries the status vocabulary and says which parts
are built. The spec is design intent — `docs/decisions.md` decides when it and
the code disagree, and the code is the truth for numbers.

| File | Read it when |
|---|---|
| `docs/spec/overview.md` | you need the core sentence, the speech rule or the setting |
| `docs/spec/roles.md` | you touch what either player can operate |
| `docs/spec/couplings.md` | you are designing something two people must do together |
| `docs/spec/latency.md` | you change a speed, a distance or the beat |
| `docs/spec/systems.md` | you touch control visibility, damage, shots or the grid |
| `docs/spec/assists.md` | you work on helping a weaker partner |
| `docs/spec/structure.md` | you touch waves, the clock and retries, saving or randomness |
| `docs/spec/briefings.md` | you teach the pair a mechanic or a creature |
| `docs/spec/between-waves.md` | you draw anything over the rest between one wave and the next — what a cleared wave says, and the hand-off into the next one's guide |
| `docs/spec/wave-design.md` | you author a wave or an act |
| `docs/spec/graphics.md` | you draw anything |
| `docs/spec/audio.md` | you add a sound, or wonder why none of them sit in the speech band |
| `docs/spec/bestiary.md` | you add or change a creature |
| `docs/spec/bosses.md` | you build a boss |
| `docs/spec/open-questions.md` | you hit something the design has not decided |
| `docs/spec/ideas.md` | you are looking for what to build next |
| `docs/spec/transfers.md` | you are mining Spaceteam or Lovers in a Dangerous Spacetime for an idea |
| `docs/spec/transfers-hazelight.md` | you are mining It Takes Two or Split Fiction — they are a reference for the shape of a round, not for a creature |
| `docs/spec/interludes.md` | you are building a round that is not the field: its own rules, controls and picture |
| `docs/spec/bosses-choreographed.md` | you want a boss that goes somewhere rather than loops — A Way Out read against this engine, fifteen concepts, and the primitive library a choreographed encounter would need |
| `docs/spec/bosses-cinematic.md` | you are picking the next choreographed boss to build — the owner's own brief, nineteen more concepts in words only, none claimed yet |
| `docs/spec/choreographed-windows.md` | you are doubling a boss's window on the owner's rule — which figure doubles, which need rises beside it, and which bosses are left alone and why |

The German original has been translated in full and deleted; it is in the git
history if the wording of a rejected idea is ever needed.

## Code

Every `.ts` file under `packages/*/src/**` and `apps/*/src/**` (barrels and
tests excepted) needs a row here; `tools/index/test/index.test.ts` fails and
names the path when one is missing or a row's file has been deleted. Run
`bun run index` to add the missing rows, then edit the new row's text in
place — the generator keeps whatever is there. A row that is still exactly its
file's header sentence follows the header when a lane rewrites it; one edited
by hand never moves.

<!-- index:code:start -->

### packages/sim

| Path | One line |
|---|---|
| `packages/sim/src/config.ts` | every tunable number, `ticksPerBeat`, `hullRow` |
| `packages/sim/src/rng.ts` | the only permitted source of randomness |
| `packages/sim/src/types.ts` | creatures, bullets, scars, commands |
| `packages/sim/src/world.ts` | the `World` shape and `createWorld`; `step` itself lives in `step.ts` |
| `packages/sim/src/world-ship.ts` | `ShipState`: the hull’s own fields of `World` — both hands, the arm, the crank, a shot |
| `packages/sim/src/beat.ts` | the beat: spawning, gliding, the hull, the guard rule |
| `packages/sim/src/commands.ts` | what a press does: the cannon, the shield, the trigger, the grip, the lance |
| `packages/sim/src/grip.ts` | THE GRIP: a hand held on a rock, and how much it slows |
| `packages/sim/src/boss.ts` | the Bulb Queen, and which boss a beat belongs to |
| `packages/sim/src/simon.ts` | THE MIRROR's vocabulary: what a step is, what it remembers |
| `packages/sim/src/sinew-hand.ts` | **The two hands on THE SINEW**, off the wire, on the tick |
| `packages/sim/src/sinew-hash.ts` | What THE SINEW puts into `hashWorld`, and nothing else |
| `packages/sim/src/sinew-step.ts` | THE SINEW's clock — the hold, the part, the snap-back, the slack, the fall |
| `packages/sim/src/sinew.ts` | THE SINEW: how hard, not when |
| `packages/sim/src/mirror.ts` | THE MIRROR's choreography: count in, perform, listen |
| `packages/sim/src/mirror-round.ts` | how a round ends: the echo strike, the break, the bait |
| `packages/sim/src/mirror-hand.ts` | **A thumb on THE MIRROR's own ship**, off the wire, on the tick |
| `packages/sim/src/entries.ts` | what a wave hands the sim: spawns, pods, either boss |
| `packages/sim/src/bullets.ts` | firing and tile-wise travel |
| `packages/sim/src/bullet-hit.ts` | what a shot does when it meets something, and whether it goes on |
| `packages/sim/src/lance.ts` | THE LANCE: a lobe filled by one player, spent by the other |
| `packages/sim/src/pods.ts` | pods: hanging, shot loose, falling, taken in |
| `packages/sim/src/balance.ts` | the balance sheet: the clock, the retries, joint moments, SYNC, the streak |
| `packages/sim/src/hash.ts` | world fingerprint — desync detection |
| `packages/sim/src/replay.ts` | the test format: inputs in, fingerprint out |
| `packages/sim/src/reprise-state.ts` | **THE REPRISE**: the cursors into the wave's own script that the echo is read back off |
| `packages/sim/src/reprise.ts` | **THE REPRISE's clock**: holds the wave's own arrivals and sends the stretch just gone down again, unseen |
| `packages/sim/src/boss-state.ts` | everything the Bulb Queen encounter remembers between beats |
| `packages/sim/src/briefing.ts` | how a wave opens, and the only part of it the simulation owns |
| `packages/sim/src/clasp.ts` | THE CLASP: a slick or a bulb inside a shield of its own, becoming a different creature instead of dying |
| `packages/sim/src/cling.ts` | **THE LIMPET and THE LEECH**: two bodies that fall straight down one lane, cannot be shot |
| `packages/sim/src/command-types.ts` | what a press *is*, as a flat union — so that a replay is a list of these and nothing else |
| `packages/sim/src/config-boss.ts` | the numbers the bosses own |
| `packages/sim/src/config-boss-clocks.ts` | **The bosses that are a clock**, as one block of `SimConfig` |
| `packages/sim/src/config-creatures.ts` | how long one creature's own clock runs, and the shapes it moves |
| `packages/sim/src/config-gauge.ts` | THE GAUGE's numbers — the first of the twelve rounds, and its whole difficulty |
| `packages/sim/src/config-pair.ts` | the switch that exists because the game has two people in front of it |
| `packages/sim/src/config-shot.ts` | everything about a shot, as numbers: speed, rate, hold value, which moments it may leave on |
| `packages/sim/src/creature-kinds.ts` | every body that can stand on the field, as a name, in the fixed order the world fingerprint writes it in |
| `packages/sim/src/creature-rules.ts` | the state machines the bestiary asks for that are small enough to be one function each |
| `packages/sim/src/dart.ts` | THE DART: the first body that does not hold its lane |
| `packages/sim/src/events.ts` | everything the simulation reports about a tick, and the whole of what it says to anybody |
| `packages/sim/src/gauge-round.ts` | THE GAUGE's clock: the three phases, the way in and the way out |
| `packages/sim/src/gauge-band.ts` | **The band between the two marks**: where it lands, where it walks, and how wide it is at this moment |
| `packages/sim/src/gauge-hand.ts` | **THE GAUGE's two thumbs on the dial itself** |
| `packages/sim/src/gauge.ts` | THE GAUGE: one needle, two marks, one of you reading and the other turning |
| `packages/sim/src/hash-boss.ts` | the boss half of the world fingerprint |
| `packages/sim/src/hash-boss-clocks.ts` | The fingerprint's share of **the bosses that are a clock** — THE STARE, THE DIASTOLE, THE BATON |
| `packages/sim/src/hull-types.ts` | what the hull remembers: where it broke, and how the pair have been doing at stopping it breaking |
| `packages/sim/src/hull.ts` | the row the shield answers a rock on: one above the ship's own |
| `packages/sim/src/kinds.ts` | what a `CreatureKind` *means*: colour, fall speed, width, whether a hand may be put on it |
| `packages/sim/src/maze-clock.ts` | THE MAZE's clock: how long each part of a round stands, in beats |
| `packages/sim/src/maze-controls.ts` | THE MAZE's two verbs, and they are the whole of what the pair can do |
| `packages/sim/src/maze-round.ts` | the round the pair plays against THE MAZE, and what it costs them |
| `packages/sim/src/maze-wheel.ts` | THE MAZE's drum as a *written-down thing*: its circles, walls and openings, and what is wrong with them if they were typed wrong |
| `packages/sim/src/maze.ts` | THE MAZE's wheel, as arithmetic |
| `packages/sim/src/queen-mark.ts` | the mark itself: the two vulnerable spots cradled under her middle, only one ever real |
| `packages/sim/src/queen-hand.ts` | **Player 1's thumb on THE BULB QUEEN's marks**, off the wire, on the tick |
| `packages/sim/src/run.ts` | the run, as opposed to the beat |
| `packages/sim/src/shell-round.ts` | the round the pair plays against THE SHELL, which is two rounds and the turn between them |
| `packages/sim/src/shell.ts` | THE SHELL's armour, as arithmetic |
| `packages/sim/src/shot-charge.ts` | the shot is laid, not fired |
| `packages/sim/src/step.ts` | advance exactly one tick |
| `packages/sim/src/vane-cycle.ts` | THE VANE's cycle, as arithmetic |
| `packages/sim/src/vane-arm.ts` | THE VANE's arm laid over a field — the tip's column, the fold, the split's column — the five that take a `SimConfig` |
| `packages/sim/src/vane-hand.ts` | **THE VANE's two hands on the picture**, on the tick |
| `packages/sim/src/vane-hash.ts` | THE VANE in the fingerprint |
| `packages/sim/src/vane-open.ts` | **Where THE VANE's arm is standing and whether the bearing is open** — one place, read by the fold, the shot |
| `packages/sim/src/vane.ts` | THE VANE's whole choreography: the boss that bends the field instead of the beat |
| `packages/sim/src/veil.ts` | THE VEIL: a thundercloud with a body inside it, the first creature hidden from player 2 |
| `packages/sim/src/warden-cycle.ts` | THE WARDEN's cycle, as arithmetic |
| `packages/sim/src/warden.ts` | THE WARDEN's whole choreography: a gate held open by a rope somebody is pulling |
| `packages/sim/src/wave-start.ts` | begin playing a wave |
| `packages/sim/src/wisp.ts` | you are changing where a wisp goes next, how long it stands there, or what a shot at one does |
| `packages/sim/src/ghost.ts` | THE GHOST: a body only one screen draws, and the first creature whose secret is **where it is** |
| `packages/sim/src/bosses.ts` | every boss's vocabulary, re-exported by `index.ts` — the seam `hash-boss.ts` already cut |
| `packages/sim/src/config-fleet.ts` | THE FLEET's numbers: how big the chart is, how long the pair has, and what running out costs |
| `packages/sim/src/fleet-board.ts` | THE FLEET's chart as arithmetic — where a ship stands, which squares are spent, what makes a fleet |
| `packages/sim/src/fleet-flood.ts` | **THE FLEET's second and third states, on the beat** — the flood a hit opens |
| `packages/sim/src/fleet-hand.ts` | **Three thumbs on THE FLEET's picture**, off the wire, on the tick |
| `packages/sim/src/fleet-hash.ts` | THE FLEET's second and third states in the fingerprint, beside the chart `hash-boss.ts` already pushes |
| `packages/sim/src/fleet-state.ts` | **THE FLEET's three states, and what the pair does in each.** Moved out of `boss-state.ts` with the second… |
| `packages/sim/src/fleet.ts` | THE FLEET: one seat holds the map, the other holds the sights, and neither can reach the other's half |
| `packages/sim/src/flip.ts` | THE FLIP: |
| `packages/sim/src/config-snake.ts` | SNAKE's numbers — the arena, the mouth's window, what starting over costs |
| `packages/sim/src/snake-controls.ts` | The four verbs of the round, and the two seats they are split between |
| `packages/sim/src/snake-move.ts` | One step of the body, and the four ways an attempt ends badly |
| `packages/sim/src/snake-round.ts` | SNAKE's clock: the three phases, the way in and the way out |
| `packages/sim/src/snake.ts` | SNAKE: one of you drives it and the other one works it |
| `packages/sim/src/echo.ts` | THE ECHO: half speed down, dividing into four — the fan, the price and the one field it carries |
| `packages/sim/src/rind.ts` | THE RIND: three sizes of one body — the shed, the kill at the end and the layer count that is also its health bar |
| `packages/sim/src/events-creature.ts` | the arm of `SimEvent` about one body — a disguise, a covering, a cloud, a layer |
| `packages/sim/src/snake-arena.ts` | What is standing on a tile, and whether a tile is a tile at all |
| `packages/sim/src/echo-split.ts` | how an echo comes apart — which way the halves step, how long each generation waits first, and the pass that does it |
| `packages/sim/src/config-pinball.ts` | PINBALL's numbers — the table, the ball, and what a dropped one costs |
| `packages/sim/src/config-pinball-hand.ts` | **PINBALL's two hands on the table**: what counts as a hard launch |
| `packages/sim/src/pinball-board.ts` | The table as arithmetic: how big it is, what a legal board looks like, and what an angle and a power add up to |
| `packages/sim/src/pinball-contact.ts` | what the ball can touch, how deep it is into one, and the integer square root that answers |
| `packages/sim/src/pinball-controls.ts` | The three verbs of the round, and the two seats they are split between |
| `packages/sim/src/pinball-physics.ts` | one tick of a ball on a table: gravity, the speed cap, the bounce |
| `packages/sim/src/pinball-round.ts` | PINBALL's clock: the three phases, the shot loop inside the middle one, and the two ways the hull pays |
| `packages/sim/src/pinball.ts` | PINBALL: the ship folds into a bucket, and the bucket is both the gun and the glove |
| `packages/sim/src/gyre-rim.ts` | you need where a body on a wheel's rim stands, what colour it is, or where the diamond has walked to — the table and the route, with no world in it |
| `packages/sim/src/gyre.ts` | you touch the wheel itself — how it turns, what the maw does to it, how it carries its six bodies and when it breaks |
| `packages/sim/src/span.ts` | you need how wide a body is or which columns it covers — `spanOf`, `occupiesCol` and the clamps, cut out of `kinds.ts` |
| `packages/sim/src/spawn.ts` | you are giving a new creature a field it is born with — one queue entry becoming a body, and the only place one does |
| `packages/sim/src/spawn-companions.ts` | a creature is meant to bring bodies with it — the gyre's rim, the strand's beads, the crawler's links, built off the body just pushed |
| `packages/sim/src/spawn-fields.ts` | you are giving a new creature a field it is born with — the per-kind spread, in the order the rolls come off `world.rng` |
| `packages/sim/src/splice-hash.ts` | What THE SPLICE puts into `hashWorld`, and nothing else |
| `packages/sim/src/splice-round.ts` | THE SPLICE's clock, its one verb and what a feed costs |
| `packages/sim/src/splice-tangle.ts` | Laying THE SPLICE's straws: three integer arrays and a permutation |
| `packages/sim/src/splice.ts` | THE SPLICE: a children's path puzzle, played by two people who can each see half of it |
| `packages/sim/src/spend.ts` | **THE SPEND LEDGER: what the pair has already spent**, per colour, over the last few beats of their own play |
| `packages/sim/src/spool-hand.ts` | **The brake on THE SPOOL**, off the wire, on the tick |
| `packages/sim/src/spool-hash.ts` | What THE SPOOL puts into `hashWorld`, and nothing else |
| `packages/sim/src/spool-step.ts` | THE SPOOL's clock: the line running out under the brake, the zone moving under a correction |
| `packages/sim/src/spool.ts` | THE SPOOL: the one boss answered by holding back exactly enough |
| `packages/sim/src/config-gyre.ts` | you are retuning the wheel — how fast the rim turns, how much the maw takes off it, how far the diamond sinks |
| `packages/sim/src/pod-types.ts` | you need what a pod *is* rather than what one does — the shape, lifted out of `types.ts` beside `hull-types.ts` |
| `packages/sim/src/hash-creature.ts` | you added a field to `Creature` and have to put it in the fingerprint |
| `packages/sim/src/field.ts` | taking a body off the field — the counterpart to `spawn.ts` |
| `packages/sim/src/field-hands.ts` | **Every hand on the field, read on the tick** |
| `packages/sim/src/filament-hand.ts` | Two thumbs on THE FILAMENT: the pilot's drawing it, the navigator's following |
| `packages/sim/src/filament-hash.ts` | What THE FILAMENT puts into `hashWorld`, and nothing else |
| `packages/sim/src/filament-step.ts` | THE FILAMENT's clock: the arm, the pull, the next filament, the end |
| `packages/sim/src/filament.ts` | THE FILAMENT: a body over the field made of loose filaments, the way a nerve is a bundle |
| `packages/sim/src/config-derived.ts` | what the config implies: ticks per beat, ms to ticks, the hull row, the middle column |
| `packages/sim/src/config-diastole.ts` | THE DIASTOLE's five numbers — the two cadences, which must stay coprime, and what a chamber and a burst are worth |
| `packages/sim/src/bullet-hit-boss.ts` | a shot met the queen or the warden and you want to know which half of the pair a rejection is charged to |
| `packages/sim/src/bullet-types.ts` | you need what a bullet *is* rather than what one does — the shape, lifted out of `types.ts` beside `pod-types.ts` |
| `packages/sim/src/lid.ts` | you are working on the armoured eye — the cord, how far the plates have parted, and what a shot into it does |
| `packages/sim/src/config-ghost.ts` | THE GHOST's numbers: what one is worth, the row a crossing one prowls along, how far it goes each beat, how |
| `packages/sim/src/config-gum.ts` | THE GUM's numbers: how far a swipe has to carry it, and how far it flies a beat once swiped |
| `packages/sim/src/config-gorge.ts` | THE GORGE's numbers — how wide the sack is, how many beads fill an intake |
| `packages/sim/src/config-gimbal.ts` | THE GIMBAL's tuning: how near a mark is near enough, how long an alignment has to be held |
| `packages/sim/src/boss-surface.ts` | Every name the boss code puts on `@neon-spore/sim`'s surface, written out |
| `packages/sim/src/boss-surface-clocks.ts` | **The clock bosses' half of the surface**, written out the same way |
| `packages/sim/src/boss-surface-clocks-b.ts` | **The clock bosses' half of the surface, the second page** — from THE ANTIPHON on |
| `packages/sim/src/boss-surface-clocks-c.ts` | **The clock bosses' half of the surface, the third page** — THE WELL's face and the thumb on its seam |
| `packages/sim/src/boss-surface-snake.ts` | **SNAKE's names on `@neon-spore/sim`'s surface** |
| `packages/sim/src/boss-surface-pinball.ts` | **PINBALL's names on `@neon-spore/sim`'s surface** |
| `packages/sim/src/boss-surface-ledger.ts` | **THE LEDGER's names on `@neon-spore/sim`'s surface** |
| `packages/sim/src/handle-pull.ts` | a hand is carrying a handle and you need to know how far it may go — the taut length, the field it may not leave, and how taut is measured |
| `packages/sim/src/wave-end.ts` | How a wave ends, in one place, because two paths reach it |
| `packages/sim/src/wave-fail.ts` | A hit fails the wave, and the wave is played again; the clock and retries text |
| `packages/sim/src/wave-boss.ts` | you are adding a round or a boss with a place and need where a wave's `boss:` entry becomes installed state — and what each leaves on the field |
| `packages/sim/src/wave-boss-clocks.ts` | you are adding a choreographed boss and need where its `boss:` entry becomes installed state — its branch and its `kind` on `CLOCK_KINDS` go here |
| `packages/sim/src/warden-rope.ts` | you are working on THE WARDEN's line — the hand on it, how taut it is, and when it is lowered or cut |
| `packages/sim/src/warden-start.ts` | THE WARDEN takes the field where it stands and never leaves it: dead centre, at `wardenRow`, five columns wide |
| `packages/sim/src/warden-hand.ts` | THE WARDEN's three hands on the tick: the rope, player 2's thumb on the eye under NARROW, player 1's swipe across the hatch under GLARE, and the slam that ends the window |
| `packages/sim/src/warden-open.ts` | Whether THE WARDEN's eye shows, and how far the hatch and the lids stand open — one place that reads the phase's gesture, for the shot and the picture |
| `packages/sim/src/snake-open.ts` | Opening a round and starting an attempt over — the two places a `SnakeState` is written from nothing |
| `packages/sim/src/scene.ts` | you are changing what a guide's rehearsal is — a small world, built from a script and looped |
| `packages/sim/src/ready-gate.ts` | you are changing the two circles a guide ends on — what fills one, what empties it, and how long the hold is |
| `packages/sim/src/config-recoil.ts` | THE RECOIL's numbers: how many times a shot fails to kill it |
| `packages/sim/src/creature-types.ts` | What a **body on the field** is made of |
| `packages/sim/src/recoil.ts` | THE RECOIL: a slick or a bulb inside a sprung cage, and the first body a landed shot sends the **wrong way** |
| `packages/sim/src/guide-steps.ts` | A guide the pair turns the pages of, one seat at a time |
| `packages/sim/src/gum.ts` | **THE GUM**: a sticky mass that falls straight down one lane, cannot be shot, is not stopped by the shield, and has to be swiped away in the air |
| `packages/sim/src/carom.ts` | THE CAROM: a slick or a bulb sealed inside a hurtling rock crust |
| `packages/sim/src/cairn.ts` | THE CAIRN: a pile of seven rocks nothing fired reaches, taken apart by a hand carried sideways, and the clock that drops one itself into a lane only player 1 is shown |
| `packages/sim/src/cairn-hold.ts` | THE CAIRN's second gesture: a hand resting on the pile stops its shed clock for four beats, on the grip the pair already has and with no new word on the field |
| `packages/sim/src/candle-hash.ts` | What THE CANDLE puts into `hashWorld`, and nothing else |
| `packages/sim/src/candle-hand.ts` | **The one hand on THE CANDLE**: the flame, pulled down off the wick by the pilot, off the wire, on the tick |
| `packages/sim/src/candle-step.ts` | THE CANDLE's clock — the drift, the turn, the last step and the black frame |
| `packages/sim/src/candle.ts` | THE CANDLE: whether you can act in the dark |
| `packages/sim/src/config-carom.ts` | THE CAROM's numbers: how steeply it crosses the field, what cracking one open is worth |
| `packages/sim/src/config-candle.ts` | THE CANDLE's numbers — how many steps its glow has, how long the field takes to go black |
| `packages/sim/src/config-cairn.ts` | THE CAIRN's two clocks: the beats the pile stands before it sheds a rock itself, and the beats a still thumb buys back off them |
| `packages/sim/src/impact.ts` | **How heavy one body lands when it reaches the hull**, for everything the shield was never offered — the weight picks the sound, and a hit costs the wave whatever hit |
| `packages/sim/src/creature-state.ts` | **The state one kind carries and no other does.** Every field here is optional |
| `packages/sim/src/chute.ts` | THE CHUTE: the slick or the bulb thrown clear of a cracked carom |
| `packages/sim/src/events-carom.ts` | **Everything THE CAROM and the body it throws out do**, as events |
| `packages/sim/src/events-candle.ts` | **Everything THE CANDLE does that neither screen already says**, as events |
| `packages/sim/src/config-pod.ts` | THE POD's numbers: how a capsule shot loose falls, how it steers itself into the maw |
| `packages/sim/src/config-volley.ts` | THE VOLLEY's numbers: how steeply it comes in, how far a ward throws it back up the field |
| `packages/sim/src/cross.ts` | **A body crossing the field and turning at its side walls** |
| `packages/sim/src/events-volley.ts` | **What THE VOLLEY does**, as events: a ward that sends it back |
| `packages/sim/src/volley.ts` | THE VOLLEY: a rock coming in on a diagonal with a body sealed inside it |
| `packages/sim/src/ward.ts` | **What the shield does with a body it turns**, which used to be one answer and is now two |
| `packages/sim/src/weight.ts` |  |
| `packages/sim/src/well.ts` | THE WELL: the field turned inside out, and then turned — the face's three phases and the thumb on the seam |
| `packages/sim/src/well-hand.ts` | **The pilot's thumb on the seam**, off the wire, on the tick |
| `packages/sim/src/well-hash.ts` | What THE WELL puts into `hashWorld`, and nothing else |
| `packages/sim/src/well-step.ts` | **THE WELL's clock: the face slips, and stops when it has slipped far enough.** Three states and they run in… |
| `packages/sim/src/colour-armour.ts` | What a shot of the wrong colour leaves behind on an ordinary body: a window in which nothing at all reaches it |
| `packages/sim/src/maze-solve.ts` | The way through THE MAZE's drum, worked out from the walls rather than typed beside them |
| `packages/sim/src/maze-state.ts` | what THE MAZE remembers between ticks — `MazeState`, a paragraph per field — and the two ways it is set: fresh for a wave, wiped for a phase |
| `packages/sim/src/maze-hash.ts` | What THE MAZE puts into `hashWorld`, and nothing else |
| `packages/sim/src/maze-hand.ts` | **A thumb on THE MAZE's heart**, off the wire, on the tick |
| `packages/sim/src/maze-verdict.ts` | How an attempt on THE MAZE ends, and what it costs |
| `packages/sim/src/hull-guard.ts` | **The shield's own arithmetic**: where it stands, how long its window is open |
| `packages/sim/src/config-veer.ts` | THE VEER's two numbers: how far apart the rows it changes lane on are, and the widest a single change can reach |
| `packages/sim/src/creature-state-held.ts` | **The state a hand writes**, as opposed to the state the beat writes |
| `packages/sim/src/veer.ts` | THE VEER: the first rock that does not hold its lane |
| `packages/sim/src/lock.ts` | THE LOCK: the hand player 1 already has on the field, read a second way |
| `packages/sim/src/mid-beat.ts` | **Where a thing stands between two beats**, in thousandths of a tile |
| `packages/sim/src/mine.ts` | THE MINE: a wisp standing still, answered by a thumb instead of a bolt |
| `packages/sim/src/scene-aim.ts` | The three acts a film aims rather than writes down, resolved against a world |
| `packages/sim/src/scout-arena.ts` | What the scout is touching, and the two ways an arena ends badly |
| `packages/sim/src/scout-fly.ts` | One tick of the flight, and the four things that decide how it feels |
| `packages/sim/src/scout-hash.ts` | What THE SCOUT puts into `hashWorld`, and nothing else |
| `packages/sim/src/scout-hand.ts` | The two counts `scoutLoad` reads, as little of `SimConfig` as it needs |
| `packages/sim/src/scout-round.ts` | THE SCOUT's clock: the three phases, the way in and the way out |
| `packages/sim/src/scout-open.ts` | **Standing THE SCOUT up**: where home is, and one arena set out as authored |
| `packages/sim/src/scout.ts` | THE SCOUT: the ship puts something small out into the dark, and only one of you is holding it |
| `packages/sim/src/scuttle-hash.ts` | What THE SCUTTLE puts into `hashWorld`, and nothing else |
| `packages/sim/src/scuttle-hand.ts` | **The pilot's thumb on a part THE SCUTTLE already let go of**, off the wire, on the tick |
| `packages/sim/src/scuttle-shot.ts` | **A shot that nothing on the field stopped, leaving through the top** under THE SCUTTLE |
| `packages/sim/src/scuttle-step.ts` | THE SCUTTLE's clock — the count, the detachment, the throw, the wind-up and the collapse |
| `packages/sim/src/scuttle.ts` | THE SCUTTLE: a boss racing you to its own death |
| `packages/sim/src/boss-round.ts` | Stand the boss on a numbered round, through that fight's own way into one |
| `packages/sim/src/config-strand.ts` | THE STRAND's three numbers: the default length of a thread, and what a bead and a whole thread are worth |
| `packages/sim/src/config-stare.ts` | THE STARE's numbers — how long the eye is turned away, how much warning a turn gives |
| `packages/sim/src/config-scout.ts` | THE SCOUT's numbers — how the little ship flies |
| `packages/sim/src/config-scuttle.ts` | THE SCUTTLE's numbers — how many sockets the frame has and how many of the parts in them are pods |
| `packages/sim/src/config-slow.ts` | THE SLOW's two numbers — the fraction of wall-clock rate a slowed tick is consumed at, and how long an ordinary window runs |
| `packages/sim/src/config-sinew.ts` | THE SINEW's numbers — how many fibres the tendon has, how deep a hand may pull |
| `packages/sim/src/config-surge.ts` | THE SURGE's numbers — how many notches the seam has, how fast a hand charges the bulb and how fast it leaks |
| `packages/sim/src/config-spool.ts` | THE SPOOL's tuning: how far the brake travels, how fast and how slow the line runs at either end of it |
| `packages/sim/src/creature-state-strand.ts` | **THE STRAND's three fields**, and the whole of what one bead remembers |
| `packages/sim/src/events-strand.ts` | THE STRAND's three: a bead shrivelling, a raisin swelling back, and the thread itself parting |
| `packages/sim/src/events-stare.ts` | **Everything THE STARE does that neither screen already says**, as one event |
| `packages/sim/src/events-splice.ts` | **Everything THE SPLICE does that neither screen already says**, as events |
| `packages/sim/src/events-spool.ts` | What THE SPOOL says as it happens, one line per thing the picture and the sound answer |
| `packages/sim/src/events-sinew.ts` | **Everything THE SINEW does that neither screen already says**, as events |
| `packages/sim/src/events-surge.ts` | **Everything THE SURGE does that neither screen already says**, as events |
| `packages/sim/src/events-scuttle.ts` | **Everything THE SCUTTLE does that neither screen already says**, as events |
| `packages/sim/src/events-scout.ts` | **What THE SCOUT's two hands on its picture do that neither screen already says** |
| `packages/sim/src/events-snake.ts` | **What SNAKE's two hands on the body do that neither screen already says** |
| `packages/sim/src/strand-round.ts` | What **happens** to a thread: the shot that meets a bead, and the thread parting once nothing on it is alive |
| `packages/sim/src/strand.ts` | THE STRAND: what a thread of beads is — where they stand, what colour each carries, and which one may be shot |
| `packages/sim/src/creature-state-veer.ts` | **THE VEER's two fields**, a side and a width |
| `packages/sim/src/slow-fall.ts` | The bodies that come down **slower than a tile a beat** |
| `packages/sim/src/slow.ts` | you want a span of beats played slowly on both devices at once — `openSlow`, and the two hashed beats that bound it |
| `packages/sim/src/strand-shape.ts` | THE STRAND's shape, as arithmetic |
| `packages/sim/src/strand-spawn.ts` | How a thread comes onto the field: one queue entry in, two to five bodies out |
| `packages/sim/src/throb.ts` | the throb's clockwise turn, which half a shot met, and what it costs |
| `packages/sim/src/throat-hash.ts` | What THE THROAT puts into `hashWorld`, and nothing else |
| `packages/sim/src/throat-hand.ts` | **THE THROAT's two hands on the gullet itself** — the cinch and the haul |
| `packages/sim/src/throat-pull.ts` | **The pull**: what standing in THE THROAT's column does to a body |
| `packages/sim/src/throat-step.ts` | THE THROAT's clock, and the two things that change its health |
| `packages/sim/src/throat-clock.ts` | **THE THROAT's cadence**: how often the gullet inhales, how long the pair has until it does |
| `packages/sim/src/throat-feed.ts` | **The two things that change THE THROAT's health**, and they are opposite gestures — which is the boss |
| `packages/sim/src/throat.ts` | THE THROAT: the one boss you answer by **giving it something** |
| `packages/sim/src/taster-hash.ts` | What THE TASTER puts into `hashWorld`, and nothing else |
| `packages/sim/src/taster-hand.ts` | **THE TASTER's three thumbs on its own fan**, off the wire, on the tick |
| `packages/sim/src/taster-shot.ts` | **What a shot does to THE TASTER**, which is the whole of the inverted rule |
| `packages/sim/src/taster-step.ts` | THE TASTER's clock — the crest arriving, a blade coming out of it, its colour setting on the ledger |
| `packages/sim/src/taster.ts` | THE TASTER: what you have already spent |
| `packages/sim/src/boss-entries.ts` | **What a wave authors when it wants a boss** — twelve shapes, the union of them |
| `packages/sim/src/boss-entries-round.ts` | **What a wave authors when it wants a round** — the bosses that take the panel away |
| `packages/sim/src/boss-entries-clocks.ts` | **What a wave authors when it wants a boss that is a clock** |
| `packages/sim/src/boss-entries-clocks-b.ts` | **The tail of `boss-entries-clocks.ts`** |
| `packages/sim/src/boss-entries-b.ts` | **The last three entries `boss-entries.ts` had room for**: THE MAZE, THE WELL and THE REPRISE |
| `packages/sim/src/boss-kinds.ts` | a tool asks which bosses exist, or whether one is the whole wave — `BOSS_KINDS`, a wire value appended never inserted, and `bossFillsWave` |
| `packages/sim/src/boss-others.ts` | **One beat of whichever boss is not the queen**, which is now thirteen of the fourteen |
| `packages/sim/src/boss-others-b.ts` | **The tail of `boss-others.ts`**, cut off it on 22 September 2026 when THE GIMBAL's branch took that page… |
| `packages/sim/src/boss-off-beat.ts` | **The six bosses the field's beat never reaches**, and why each one is not an oversight |
| `packages/sim/src/boss-union.ts` | The boss a wave installed, whichever one it is |
| `packages/sim/src/boss-answer.ts` | **The column the boss is answered from, this beat** — or none |
| `packages/sim/src/boss-phases.ts` | **Every boss's phases, in one table**, for the director's STATES sheet |
| `packages/sim/src/boss-hands.ts` | **The choreographed bosses' hands, read on the tick** |
| `packages/sim/src/config-crawler.ts` | THE CRAWLER's five numbers: how long a worm is when the wave does not say, how fast it walks |
| `packages/sim/src/crawler-beat.ts` | **A beat of every worm on the field**: the step it takes, the shield it may walk into |
| `packages/sim/src/crawler-round.ts` |  |
| `packages/sim/src/crawler.ts` | THE CRAWLER: a maggot that walks the ship's own surface, and the first body |
| `packages/sim/src/creature-state-crawler.ts` | **THE CRAWLER's three fields**, and the whole of what one link remembers |
| `packages/sim/src/events-crawler.ts` | THE CRAWLER's three: a ring coming apart, the worm cleared, and the worm getting in |
| `packages/sim/src/events-crystal.ts` | **Everything THE CRYSTAL does**, as events: it turns at a wall, its shell catches a wrong shot, the right one breaks it in two |
| `packages/sim/src/events-ghost.ts` | THE GHOST's three: the body letting go, a wall turned at, and the dive |
| `packages/sim/src/events-gum.ts` | **Everything THE GUM does**, as events: it is flung — its landing is a `breach` |
| `packages/sim/src/events-gorge.ts` | **Everything THE GORGE does that neither screen already says**, as events |
| `packages/sim/src/events-gauge.ts` | **What THE GAUGE's dial does that neither screen already says**, as four events (`gauge.ts`, `gauge-hand.ts`) |
| `packages/sim/src/events-gimbal.ts` | What THE GIMBAL says as it happens, one line per thing the picture and the sound answer |
| `packages/sim/src/kind-code.ts` | **A kind as a number**, and the compile-time proof that every kind has one |
| `packages/sim/src/lure-exit.ts` | **THE LURE leaving on its own**, which is the one thing in this game a body does at the end of a beat for no… |
| `packages/sim/src/config-crystal.ts` | THE CRYSTAL's numbers: how it crosses the field, what splitting one is worth, what a whole one costs |
| `packages/sim/src/creature-roster.ts` | **The fixed order every kind is written into the world fingerprint in.** Cut out of `creature-kinds.ts` when… |
| `packages/sim/src/grippable.ts` | **Whether a hand may be put on a body at all**, and the fourteen refusals that answer it |
| `packages/sim/src/hull-damage.ts` | **A breach: the scar, the weight and the wave lost.** The hull has no points; a hit fails the wave (`wave-fail.ts`) |
| `packages/sim/src/config-fence.ts` | THE FENCE's two numbers: how wide each way through it is |
| `packages/sim/src/config-filament.ts` | THE FILAMENT's tuning: the window between the thumbs, and the clocks around a filament rather than along it |
| `packages/sim/src/creature-state-fence.ts` | **THE FENCE's two fields**, and both of them are sets of columns: the ways through the wave authored |
| `packages/sim/src/events-fence.ts` | **What THE FENCE does**, as events: the wire going over the ship, and a bolt cutting a way through it |
| `packages/sim/src/events-fleet.ts` | **Everything THE FLEET does that neither screen already says**, as events |
| `packages/sim/src/events-filament.ts` | What THE FILAMENT says as it happens, one line per thing the picture and the sound answer |
| `packages/sim/src/fence.ts` | THE FENCE: a live line the width of the field, with gaps burnt through it |
| `packages/sim/src/config-malfunction.ts` | THE MALFUNCTION's four numbers: how often a broken control acts by itself |
| `packages/sim/src/config-maze-grip.ts` | THE MAZE's grip: the heart holding the right shot until it is torn out by hand (`maze-hand.ts` |
| `packages/sim/src/config-mirror.ts` | THE MIRROR's tuning: how far a carry goes before it is one, how long the pin is held |
| `packages/sim/src/config-view.ts` | **The numbers only the picture reads.** Every field here is taken off `SimConfig` by `packages/render` |
| `packages/sim/src/config-vane.ts` | **THE VANE's second and third gestures**: how long a thumb may hold the arm before the sweep tears it free |
| `packages/sim/src/fault-surface.ts` | Every name THE MALFUNCTION puts on `@neon-spore/sim`'s surface, written out |
| `packages/sim/src/fault-clock.ts` | The beat a fault is on and how often it acts — the one clock every malfunction reads and none of them keeps |
| `packages/sim/src/fault-placed.ts` | **A FAULT IS A PENCIL ON THE MAP**: a kind, the beat it enters the wave on, and the number of beats it holds |
| `packages/sim/src/malfunction.ts` | THE MALFUNCTION: a wave in which one of the two seats does not have its control any more — the control has it |
| `packages/sim/src/magnet.ts` | THE MAGNET: the first body in this game that cannot be answered from the column it is standing in |
| `packages/sim/src/moult.ts` | THE MOULT: one body that is a rock half the time and a cargo the other half |
| `packages/sim/src/events-magnet.ts` | **What THE MAGNET does**, as events: a bolt turned away by the plate slung under the body |
| `packages/sim/src/grip-push.ts` | THE PUSH: the hand on a rock, carried sideways — one column, then a beat of quiet |
| `packages/sim/src/grip-push-dir.ts` | **Which way a carried body has been earned a column** |
| `packages/sim/src/gorge-hash.ts` | What THE GORGE puts into `hashWorld`, and nothing else |
| `packages/sim/src/gorge-hand.ts` | **The two hands on THE GORGE**: player 1's pinch on a full intake and player 2's pry on the mouth |
| `packages/sim/src/gorge-step.ts` | THE GORGE's clock — the vent, the spit, the mouth feeding itself and the beats after the beam |
| `packages/sim/src/gorge-slow.ts` | **THE SLOW on THE GORGE spans its asks exactly** (`docs/decisions.md` #33) |
| `packages/sim/src/gorge-pry.ts` | **The pry's own clock, and the bead a spit is**: what `gorge-step.ts` runs on the beat for player 2's thumb |
| `packages/sim/src/gorge-mouth.ts` | **A bead in, a bead out, and THE GORGE's mouth**: what a shot does to an intake that takes it as a bead |
| `packages/sim/src/gorge.ts` | THE GORGE: what not to do |
| `packages/sim/src/gimbal-hand.ts` | Two hands on THE GIMBAL, one ring each, and **the same turn means two different things** |
| `packages/sim/src/gimbal-hash.ts` | What THE GIMBAL puts into `hashWorld`, and nothing else |
| `packages/sim/src/gimbal-shot.ts` | **THE GIMBAL's one target**: the spark leaking from the drum's seam once two tooth pairs are off (§18, row 9) |
| `packages/sim/src/gimbal-step.ts` | THE GIMBAL's clock: the marks lighting, the hold being counted, the shear, the seam, and the hatch |
| `packages/sim/src/gimbal.ts` | THE GIMBAL: a sealed drum hung inside two nested rings set at right angles |
| `packages/sim/src/hash-creature-held.ts` | **The fields a hand writes**, folded into the fingerprint |
| `packages/sim/src/config-claw.ts` | THE CLAW's numbers — the rail, the clock, and what a bad grab costs |
| `packages/sim/src/config-cling.ts` | THE LIMPET's and THE LEECH's numbers: how many beats a control may stand still with one on it before it goes… |
| `packages/sim/src/snake-hash.ts` | What SNAKE puts into `hashWorld`, and nothing else |
| `packages/sim/src/coil.ts` | THE COIL: a rock sitting inside a dome of its own |
| `packages/sim/src/config-coil.ts` | THE COIL's numbers: how far it crosses the field each beat, how far it sinks at a wall |
| `packages/sim/src/events-coil.ts` | **THE COIL's two**: a dome coming off, and the charge it was holding leaving for the next one |
| `packages/sim/src/own-step.ts` | **The bodies that move by a rule of their own instead of falling** |
| `packages/sim/src/orrery-gap.ts` | **Where a gap is on the field**, as opposed to where it is in the beat |
| `packages/sim/src/orrery-hash.ts` | What THE ORRERY puts into `hashWorld`, and nothing else |
| `packages/sim/src/orrery-hand.ts` | **The pilot's hand on a ring**: the one thing in this fight that can move a gap off a beat the pair has… |
| `packages/sim/src/orrery-shot.ts` | What a shot that left the top of a column does when THE ORRERY is up |
| `packages/sim/src/orrery-step.ts` | THE ORRERY's clock: the core's own fire, the organs that come off a broken ring, and the going out |
| `packages/sim/src/orrery-beat.ts` | **THE ORRERY in the beat**: where each gap stands on a beat that has not happened |
| `packages/sim/src/orrery.ts` | THE ORRERY: whether you can agree on **when** |
| `packages/sim/src/creature-state-gyre.ts` | **THE GYRE's four**: the two the hub carries and the two a body on its rim does |
| `packages/sim/src/index-bodies.ts` | **The four bodies that wear something**, narrowed to what render/ and the tools actually ask of each |
| `packages/sim/src/pod-effects.ts` | What a pod *gives*, once the mouth has closed on it |
| `packages/sim/src/pod-entry.ts` | Where a pod is left hanging — the one thing a wave authors that is not a body |
| `packages/sim/src/pod-intake.ts` | **The mouth**: whether it is open, and what happens to a cargo that reaches it either way |
| `packages/sim/src/pod-arrive.ts` | **A pod arriving**: what happens on the tick a falling pod reaches the hull |
| `packages/sim/src/reach.ts` | THE CLAW's arm: the cannon's column, reached up instead of fired along |
| `packages/sim/src/index-creatures.ts` | one creature's own rules, as the rest of the repository reads them |
| `packages/sim/src/index-run.ts` | the world, the clock, a wave's start and end, and the fingerprint |
| `packages/sim/src/index-ship.ts` | the ship and what a thumb does to it, as a reading |
| `packages/sim/src/instar-hand.ts` | A thumb on one of THE INSTAR's marks |
| `packages/sim/src/instar-hash.ts` | What THE INSTAR puts into `hashWorld`, and nothing else |
| `packages/sim/src/instar-marks.ts` | What happens to one mark: armed, answered, done, slipped |
| `packages/sim/src/instar-step.ts` | THE INSTAR's clock: the morph, the window, the landing, the next pose |
| `packages/sim/src/instar.ts` | THE INSTAR: a body over the field that will not move on until the pair has done what its own picture asks |
| `packages/sim/src/bullet-hit-lure.ts` | What a shot does when it meets THE LURE |
| `packages/sim/src/bullet-hit-shut.ts` | **The bodies a bolt never kills**, and what each of them does with one instead |
| `packages/sim/src/bullet-refused.ts` | **A body the cannon cannot answer still stops the bolt**, and what each of them does with it |
| `packages/sim/src/creature-kinds-many.ts` | the five kinds that are more than one body, answered a part at a time |
| `packages/sim/src/creature-kinds-handed.ts` | **The two bodies answered by a hand from each seat at once** |
| `packages/sim/src/creature-kinds-fixtures.ts` | The four bodies a wave never sends: the queen, the ring, the line it lowers and the pile, installed where they stand rather than queued |
| `packages/sim/src/creature-kinds-standing.ts` | **The two bodies that stand on a tile**, and the only two whose answer is a square rather than a column |
| `packages/sim/src/creature-state-heading.ts` | the four kinds that carry a direction, and the beats attached to it |
| `packages/sim/src/events-veil.ts` | THE VEIL's three events: the turn, the rebuff and the tear |
| `packages/sim/src/events-vane.ts` | **What THE VANE's second and third hands do that neither screen already says** |
| `packages/sim/src/hash-creature-late.ts` | the tail of one body's fingerprint, cut at a position and never a subject |
| `packages/sim/src/hash-creature-tail.ts` | **The end of one body's fingerprint**, from THE BALLOON's eight to THE CRYSTAL's leg |
| `packages/sim/src/hash-faults.ts` | the fault half of the world fingerprint |
| `packages/sim/src/hash-pods.ts` | The pods on the field, folded into the world hash |
| `packages/sim/src/hasp-hand.ts` | **The two hands on THE HASP**, off the wire, on the tick — and the gate between them, which is the whole boss |
| `packages/sim/src/hasp-hash.ts` | What THE HASP puts into `hashWorld`, and nothing else |
| `packages/sim/src/hasp-shot.ts` | **THE HASP's one target**: the bolt the second hasp's spring throws loose (§20, row 7) |
| `packages/sim/src/hasp-step.ts` | THE HASP's clock: the latches lighting, the heat burning a hand off, the wheel seizing and coming free |
| `packages/sim/src/hasp.ts` | THE HASP: three sealed clasps down the middle of the field, each a lobed cover over a wheel-hub |
| `packages/sim/src/fence-crack.ts` |  |
| `packages/sim/src/hand.ts` | you are deciding what a finger on the field is worth — a brake on a rock, an aim on anything living, nothing where it would be neither |
| `packages/sim/src/handover.ts` | **THE HANDOVER's clock, and nothing else**: when the two panels change screens, how long they stay changed, and how many beats of warning first — no state, nothing hashed, no command swallowed |
| `packages/sim/src/harpoon.ts` | **THE LEECH and THE LIMPET as malfunctions** |
| `packages/sim/src/hive-hash.ts` | What THE HIVE puts into `hashWorld`, and nothing else |
| `packages/sim/src/hive-hand.ts` | **Two thumbs on THE HIVE's underside**, off the wire, on the tick |
| `packages/sim/src/hive-shot.ts` | **A shot that nothing on the field stopped, leaving through the top** under THE HIVE |
| `packages/sim/src/hive-step.ts` | THE HIVE's clock — the look, the swell, the openings and the spill |
| `packages/sim/src/hive-lobe.ts` | **One lobe of THE HIVE's underside, and the two gestures it answers to.** `hive.ts` is the mass: where it is |
| `packages/sim/src/hive.ts` | THE HIVE: close the source, not the spill |
| `packages/sim/src/coil-state.ts` | **What a coil is right now**: which way it is going, whether it is still wearing its dome |
| `packages/sim/src/config-rock-cross.ts` | **A crossing rock's two numbers**: how far along its row it goes each beat |
| `packages/sim/src/rock-cross.ts` | **A rock authored to cross the field instead of holding its lane** |
| `packages/sim/src/ratchet-hand.ts` | **The two hands on THE RATCHET**, off the wire, on the tick — and the gate between them |
| `packages/sim/src/ratchet-hash.ts` | What THE RATCHET puts into `hashWorld`, and nothing else |
| `packages/sim/src/ratchet-shot.ts` | **THE RATCHET's one target**: the bolt the second clean advance shakes loose (§22, row 8) |
| `packages/sim/src/ratchet-step.ts` | THE RATCHET's clock: the pawl lighting, a window running out, the rack climbing, the one bolt |
| `packages/sim/src/ratchet.ts` | THE RATCHET: a toothed rack down the middle of the field, in full view of both seats |
| `packages/sim/src/choir-gesture.ts` | **The hand on THE CHOIR**, which is the half of that creature nothing else in this game has |
| `packages/sim/src/choir.ts` | THE CHOIR: three dots in one membrane, and the first body in this game that **no button can reach** |
| `packages/sim/src/choke.ts` | THE CHOKE: the cannon strip dead and the cannon walking wall to wall by itself, a column every few beats, for the whole wave |
| `packages/sim/src/config-choir.ts` | THE CHOIR's numbers: how far a hand has to carry an arrow, how long the pair has between the two of them |
| `packages/sim/src/config-choke.ts` | THE CHOKE's one number: how many beats the steer fault takes per column of the cannon's walk |
| `packages/sim/src/config-curtain.ts` | THE CURTAIN's numbers — the row the fabric hangs at, how much of it must stay on the field |
| `packages/sim/src/events-choir.ts` | **THE CHOIR's three**: an arrow out, both in, and the window gone |
| `packages/sim/src/events-cling.ts` | **Everything THE LIMPET and THE LEECH do**, as events: one takes hold of a control, is shaken a move looser |
| `packages/sim/src/events-curtain.ts` | **Everything THE CURTAIN does that neither screen already says**, as events |
| `packages/sim/src/command-round.ts` | **The rounds' own verbs**, as their half of the `Command` union |
| `packages/sim/src/command-locks.ts` | **Every way a press is refused before it is read**, in one place |
| `packages/sim/src/command-leave.ts` | **The two presses that leave a run**, read above every lock a boss or a fault puts on a press |
| `packages/sim/src/config-pulse.ts` | THE PULSE's numbers — the step grid, the two windows a press is judged in |
| `packages/sim/src/pulse-chart.ts` | THE PULSE's chart, as arithmetic: where a note is in time, which note a press is aimed at |
| `packages/sim/src/pulse-controls.ts` | The four verbs of the round — and the first round in the game where both seats have all of them |
| `packages/sim/src/pulse-hash.ts` | What THE PULSE puts into `hashWorld`, and nothing else |
| `packages/sim/src/pulse-hand.ts` | **THE PULSE's hand on the bar** — the one gesture in this round that is not a step |
| `packages/sim/src/pulse-round.ts` | THE PULSE's clock: the count-in, the song, and the one way the hull pays |
| `packages/sim/src/pulse.ts` | THE PULSE: the same song on two screens, and neither of you can read all of it |
| `packages/sim/src/pulse-open.ts` | Opening a stage, and opening the round — the two places a `PulseState` is written from nothing |
| `packages/sim/src/lance-burn.ts` | **THE LANCE going off**: the lobe coming full, and the column burning on that tick |
| `packages/sim/src/ledger-bead.ts` | **What a bill is**: one hit down the seam, and one return on the cord |
| `packages/sim/src/ledger-hash.ts` | What THE LEDGER puts into `hashWorld`, and nothing else |
| `packages/sim/src/ledger-hand.ts` | **THE LEDGER's four hands on its own cord**, off the wire, on the tick |
| `packages/sim/src/ledger-shot.ts` | **What a shot costs against THE LEDGER**, which is the boss: the seam takes the hit |
| `packages/sim/src/ledger-step.ts` | THE LEDGER's clock — the returns coming down the cord, the root walking along the hull, and the tear |
| `packages/sim/src/ledger-gates.ts` | **What THE LEDGER's four hands are offering, this tick** — one question per movement |
| `packages/sim/src/ledger.ts` | THE LEDGER: whose body takes it |
| `packages/sim/src/lead-hash.ts` | What THE LEAD puts into `hashWorld`, and nothing else |
| `packages/sim/src/lead-hand.ts` | **The navigator's thumb on THE LEAD's stalk**, off the wire, on the tick |
| `packages/sim/src/lead-shot.ts` | **A shot that nothing on the field stopped, leaving through the top** under THE LEAD |
| `packages/sim/src/lead-step.ts` | THE LEAD's clock — the pace, the judgment, the run's litter, the still and the pass |
| `packages/sim/src/lead.ts` | THE LEAD: where it will be |
| `packages/sim/src/shot-reach.ts` | **What a shot meets on a stretch of a column**, and the one place that question is answered |
| `packages/sim/src/ship-verbs.ts` | **Which commands are a seat talking to the ship**, as against the host talking to the run |
| `packages/sim/src/beatbox-round.ts` | **What happens to a soundbox**: the thumb that lands on it, the run being committed |
| `packages/sim/src/beatbox.ts` | THE BEATBOX: a soundbox that swells on every beat |
| `packages/sim/src/config-beatbox.ts` | THE BEATBOX's numbers: how many beats one asks for, how near the beat a tap has to land |
| `packages/sim/src/creature-state-beatbox.ts` | **THE BEATBOX's three fields**, and the whole of what one box remembers: how many beats it is asking for |
| `packages/sim/src/events-beatbox.ts` | **What THE BEATBOX does**, as events: a tap landing on the beat |
| `packages/sim/src/balloon-pull.ts` | **The two hands on THE BALLOON**, which is the half of that creature nothing else in this game has |
| `packages/sim/src/balloon-clock.ts` | THE BALLOON's clocks, read and never stored: the swell, which beat is a step and how far along it the picture draws the body, and how far through the hold at full stretch the pair has got |
| `packages/sim/src/balloon-rub.ts` | What a balloon does once both hands have reached it: the hold, then the split into two halves that both climb, or the pop |
| `packages/sim/src/balloon-entry.ts` | **WHERE A BALLOON COMES IN**, which the owner rewrote on 14 September 2026 |
| `packages/sim/src/balloon.ts` | THE BALLOON: the first body in this game that does not come down |
| `packages/sim/src/baton-hash.ts` | What THE BATON puts into `hashWorld`, and nothing else |
| `packages/sim/src/baton-hand.ts` | **THE BATON's two thumbs on its own arm** |
| `packages/sim/src/baton-press.ts` | THE BATON's presses: the launch, the strike, the take and the lock |
| `packages/sim/src/baton-pair.ts` | THE BATON's second bead: its lighting and the merge that ends it |
| `packages/sim/src/baton-step.ts` | THE BATON's clock: the unfold, the landing, the settle and the fold |
| `packages/sim/src/baton-shed.ts` | **THE BATON's arm giving way** — the swell, the shell that drops and the rock it becomes |
| `packages/sim/src/baton-slow.ts` | THE SLOW on THE BATON, spanning its asks: a swelling shell, the draw's window, the crossing |
| `packages/sim/src/baton-bead.ts` | Where a bead of THE BATON is on a tick |
| `packages/sim/src/baton-cross.ts` | THE BATON's crossing: the merged bead's last flight |
| `packages/sim/src/baton.ts` | THE BATON: whose turn is it |
| `packages/sim/src/config-balloon.ts` | THE BALLOON's numbers: how long one swells before it moves, how fast it climbs |
| `packages/sim/src/config-baton.ts` | THE BATON's numbers — how many sockets the arm has, how long a bead is in the air |
| `packages/sim/src/creature-state-balloon.ts` | **THE BALLOON's six**, and the seventh group carried out of `creature-state.ts` along the seam that file's… |
| `packages/sim/src/creature-state-mine.ts` | **THE MINE's two fields**, a count and a seat, and between them they are the whole of a body that never moves |
| `packages/sim/src/drag-targets.ts` | **Every thing on this field a hand may take hold of**, as a closed list of names |
| `packages/sim/src/drag-targets-b.ts` | **Every thing on this field a hand may take hold of, the second page** — the names from THE FLEET's chart on |
| `packages/sim/src/drag-targets-c.ts` | **Every thing on this field a hand may take hold of, the third page** — the names from THE TASTER's fan on |
| `packages/sim/src/drag-targets-d.ts` | **Every thing on this field a hand may take hold of, the fourth page** — the names from THE HIVE's underside on |
| `packages/sim/src/difficulty.ts` | **EASY, MEDIUM and HARD**, and the one number they move: the tempo, which on this field is the falling speed of everything |
| `packages/sim/src/diastole-hash.ts` | what THE DIASTOLE puts into the world fingerprint, and nothing else |
| `packages/sim/src/diastole-hand.ts` | **The one hand on THE DIASTOLE**: the clamp, player 1's thumb on the right chamber while it beats alone |
| `packages/sim/src/diastole-step.ts` | THE DIASTOLE's four phases, and the one shot that takes a chamber |
| `packages/sim/src/diastole-open.ts` | **When THE DIASTOLE can be hurt** — the one question the beam asks |
| `packages/sim/src/diastole.ts` | THE DIASTOLE's shape and its questions — which column, which colour, which seat, and whether a chamber is contracting on a given beat |
| `packages/sim/src/events-balloon.ts` | **THE BALLOON's three**: one given, one popped, one gone off at the top |
| `packages/sim/src/events-baton.ts` | **Everything THE BATON does that neither screen already says**, as events |
| `packages/sim/src/events-bosses.ts` | **The choreographed bosses' arms of `SimEvent`**, as one union |
| `packages/sim/src/events-undertow.ts` | **Everything THE UNDERTOW does that neither screen already says**, as events |
| `packages/sim/src/events-taster.ts` | **Everything THE TASTER does that neither screen already says**, as events |
| `packages/sim/src/events-throat.ts` | **What THE THROAT's two hands do that neither screen already says**, as three events (`throat-hand.ts`) |
| `packages/sim/src/events-ledger.ts` | **Everything THE LEDGER does that neither screen already says**, as events |
| `packages/sim/src/events-lead.ts` | **Everything THE LEAD does that neither screen already says**, as events |
| `packages/sim/src/events-antiphon.ts` | **Everything THE ANTIPHON does that neither screen already says**, as events |
| `packages/sim/src/events-hive.ts` | **Everything THE HIVE does that neither screen already says**, as events |
| `packages/sim/src/events-hasp.ts` | What THE HASP says as it happens, one line per thing the picture and the sound answer |
| `packages/sim/src/events-instar.ts` | What THE INSTAR says as it happens, one line per thing the picture and the sound answer |
| `packages/sim/src/events-queen.ts` | **What THE BULB QUEEN reports**, off the beat and the thumb |
| `packages/sim/src/events-diastole.ts` | **What THE DIASTOLE's clamp does that neither screen already says**, as two events (`diastole-hand.ts`) |
| `packages/sim/src/events-warden.ts` | THE WARDEN's hold, throw and slam events — what the second and third hands do that neither screen already says |
| `packages/sim/src/events-well.ts` | **Everything THE WELL does that neither screen already says**, as events |
| `packages/sim/src/events-pinball.ts` | **What PINBALL's two hands on the table do that neither screen already says** |
| `packages/sim/src/events-pulse.ts` | **What THE PULSE's hand on the bar does that neither screen already says**, as three events (`pulse-hand.ts`) |
| `packages/sim/src/events-rounds.ts` | **THE MIRROR's five and THE MAZE's five** |
| `packages/sim/src/events-ratchet.ts` | What THE RATCHET says as it happens, one line per thing the picture and the sound answer |
| `packages/sim/src/crank.ts` | THE CLAW's crank: the arm is **wound** home by a finger going round, and a bearing becomes rope |
| `packages/sim/src/crystal.ts` | THE CRYSTAL: two bodies in one shell, three tiles wide |
| `packages/sim/src/bosses-round.ts` | The rounds, as their half of the boss barrel |
| `packages/sim/src/bosses-clocks.ts` | **The bosses that are a clock**, as their half of the boss barrel |
| `packages/sim/src/bosses-clocks-b.ts` | **The bosses that are a clock, the second page** — the clock half of the boss barrel from THE SCUTTLE on |
| `packages/sim/src/bosses-clocks-c.ts` | **The bosses that are a clock, the third page** — THE WARDEN's openness |
| `packages/sim/src/bosses-scout.ts` | **THE SCOUT's names**, cut off `bosses.ts` the day the round gained a second axis of state and took that… |
| `packages/sim/src/bosses-ledger.ts` | **THE LEDGER's names, in the boss barrel** — its state, its phases |
| `packages/sim/src/config-rounds.ts` | The rounds' numbers, as one block of `SimConfig` |
| `packages/sim/src/config-run.ts` | The run's own numbers: the rest after a wave, the pause after a hit |
| `packages/sim/src/config-ratchet.ts` | THE RATCHET's tuning: how deep the catch counts as set |
| `packages/sim/src/config-weight.ts` | THE WEIGHT's one number |
| `packages/sim/src/config-well.ts` | THE WELL's numbers — how long the face stands still, how far it slips a beat |
| `packages/sim/src/config-warden.ts` | THE WARDEN's throw: how far the swipe has to travel and how many beats the hatch stands open |
| `packages/sim/src/config-undertow.ts` | THE UNDERTOW's numbers — how many times it pushes up through the floor in each part of the fight |
| `packages/sim/src/config-throat.ts` | **THE THROAT's numbers**: how many rings the gullet has, where its mouth hangs |
| `packages/sim/src/config-taster.ts` | THE TASTER's numbers — how many blades the fan holds |
| `packages/sim/src/config-orrery.ts` | **THE ORRERY's numbers**: three orbits, the beat they first come together on |
| `packages/sim/src/config-ledger.ts` | THE LEDGER's numbers — how wide the body stands, how many hits part it |
| `packages/sim/src/config-lead.ts` | THE LEAD's numbers — how many segments the stalk has, how far ahead of the body a shot has to be put |
| `packages/sim/src/config-antiphon.ts` | THE ANTIPHON's numbers — how many contours the body can grow and how they fall into families |
| `packages/sim/src/config-hive.ts` | THE HIVE's numbers — how many breach sites the underside has, how long it hangs before the first opens |
| `packages/sim/src/config-hasp.ts` | THE HASP's tuning: how long a grip lasts before it burns the hand off, how long the burn holds |
| `packages/sim/src/config-instar.ts` | THE INSTAR's tuning: the rules that hold across every step of a scene |
| `packages/sim/src/countdown.ts` | THE COUNT: a body that can only be hit on **zero**, and only the pilot can read the count |
| `packages/sim/src/codex.ts` | **THE CODEX: the fault that takes nothing away and changes what everything means.** The other three faults… |
| `packages/sim/src/curtain-hash.ts` | What THE CURTAIN puts into `hashWorld`, and nothing else |
| `packages/sim/src/curtain-hand.ts` | **The one hand on THE CURTAIN that is not the shove**: the hem |
| `packages/sim/src/curtain-shot.ts` | The two moments a shot meets THE CURTAIN, both on the **tick**: a bolt into the fabric |
| `packages/sim/src/curtain-shove.ts` | **The shove**: two hands on the sheet, carrying it along its rail |
| `packages/sim/src/curtain-step.ts` | THE CURTAIN's clock — the soft lobes redrawn, the roll-back, the core's fire, the beats after the last hit |
| `packages/sim/src/curtain.ts` | THE CURTAIN: what it is standing in front of |
| `packages/sim/src/step-round.ts` | The rounds' own tick, and the one thing all five of them have in common |
| `packages/sim/src/stare-hash.ts` | What THE STARE puts into `hashWorld`, and nothing else |
| `packages/sim/src/stare-hand.ts` | **The one hand on THE STARE**: the lid, pulled down over the eye by the seat it is not looking at |
| `packages/sim/src/stare-step.ts` | THE STARE's clock, and the one press that costs the hull |
| `packages/sim/src/stare.ts` | THE STARE: a thing in the sky that looks at one of you, and whatever it catches the hull pays for |
| `packages/sim/src/surge-hand.ts` | **The two thumbs on THE SURGE**, off the wire, on the tick |
| `packages/sim/src/surge-hash.ts` | What THE SURGE puts into `hashWorld`, and nothing else |
| `packages/sim/src/surge-seam.ts` | **The three ends of a charge**: the vent, the burst and the loss |
| `packages/sim/src/surge-step.ts` | THE SURGE's clock — the charge, the leak, the feeding, the burst at the top of the gauge, the eversion |
| `packages/sim/src/surge-rock.ts` | **The rock THE SURGE spits while the pair is charging it** — the fight's third gesture |
| `packages/sim/src/surge.ts` | THE SURGE: whether you can stop |
| `packages/sim/src/pinball-shot.ts` | One shot of PINBALL: where the ball waits, what firing it does, and putting the loop back to the start |
| `packages/sim/src/pinball-hand.ts` | **PINBALL's two hands on the table itself**: player 1 winding a spring his own last shot left slack |
| `packages/sim/src/pinball-hash.ts` | What PINBALL puts into `hashWorld`, and nothing else |
| `packages/sim/src/pinball-open.ts` | **Standing PINBALL up**: one round opened, the board loaded onto the table |
| `packages/sim/src/beatbox-picture.ts` | **THE BEATBOX's readings that decide nothing**: how long ago a thumb counted, how long ago one missed |
| `packages/sim/src/beat-clock.ts` | Converting between the tick line and the beat, in the one place that may |
| `packages/sim/src/bearing.ts` | **A bearing**: where a hand is round a circle, in thousandths of a turn clockwise from the top |
| `packages/sim/src/undertow-hash.ts` | What THE UNDERTOW puts into `hashWorld`, and nothing else |
| `packages/sim/src/undertow-hand.ts` | THE UNDERTOW's two hands, both the navigator's: a pin that plates a lobe, and the thumb that gives an unseated pilot his seat back |
| `packages/sim/src/undertow-press.ts` | THE UNDERTOW's presses: the maw, the beam and the unseat |
| `packages/sim/src/undertow-step.ts` | THE UNDERTOW's clock: the push, the bow, the lobe coming through, the widening, the withdrawal |
| `packages/sim/src/undertow-slow.ts` | THE SLOW on THE UNDERTOW, spanning its asks: a lobe standing, the floor under the cannon, the last lobe |
| `packages/sim/src/undertow.ts` | THE UNDERTOW: where you are being hit from |
| `packages/sim/src/antiphon-hash.ts` | What THE ANTIPHON puts into `hashWorld`, and nothing else |
| `packages/sim/src/antiphon-hand.ts` | **A thumb resting on THE ANTIPHON's organ**, off the wire, on the tick |
| `packages/sim/src/antiphon-rail.ts` | **What grows and what she is shown beside it** — one cycle's organs and the rail they are hidden on |
| `packages/sim/src/antiphon-shot.ts` | **A shot that nothing on the field stopped, leaving through the top** under THE ANTIPHON |
| `packages/sim/src/antiphon-step.ts` | THE ANTIPHON's clock — the rise, the growth, the window, the sinking, the still and the ship, and the collapse |
| `packages/sim/src/antiphon.ts` | THE ANTIPHON: describing a thing that has no name |

### packages/content

| Path | One line |
|---|---|
| `packages/content/src/creatures.ts` | what a creature demands: `CreatureDef`, radar owner, category — the table itself is in `creatures-table.ts` |
| `packages/content/src/waves.ts` | the barrel: every act's array concatenated in order, never a save target |
| `packages/content/src/queue.ts` | wave to spawn queue, seeded per wave |
| `packages/content/src/shapes.ts` | contour maths, shared by canvas and SVG |
| `packages/content/src/silhouettes.ts` | the style guide's tuned shape parameters |
| `packages/content/src/silhouettes-clubbed.ts` | The one body whose contour is **walked** |
| `packages/content/src/silhouettes-cling.ts` | **THE LIMPET and THE LEECH, off the shape sheet.** **THE LIMPET is HOOK COLONY's body** |
| `packages/content/src/silhouettes-countdown.ts` | **THE COUNT: the COUNTDOWN draft's disc**, taken off the shape sheet whole |
| `packages/content/src/own-motion.ts` | how a body sways while going nowhere — the one copy of it |
| `packages/content/src/long-axis.ts` | which way a body is long, and the quarter turn a motion written along one takes |
| `packages/content/src/control-sets.ts` | a control set: the whole panel, both players at once, for one wave |
| `packages/content/src/controls.ts` | every button either player can be given, one row each, listed rather than switched on |
| `packages/content/src/creatures-table.ts` | adding a creature means adding one entry here |
| `packages/content/src/hull-shape.ts` | the hull's own geometry, split out of `shapes.ts` when that file hit its size cap |
| `packages/content/src/light.ts` | where the light is — the one named direction every sheen, crater and glow reads against |
| `packages/content/src/maze-rounds.ts` | THE MAZE's drum, copied wall for wall off the sheet the owner sent, and the five rounds played against it |
| `packages/content/src/mechanics-table.ts` | the rows themselves, lifted out of `mechanics.ts` when that file crossed the 250-line limit |
| `packages/content/src/mechanics-worn.ts` | a slick or a bulb wearing something that has to come off first — one sentence said six ways |
| `packages/content/src/mechanics-bosses.ts` | the four bosses, and the line the warden throws — a rule change each, not a body |
| `packages/content/src/mechanics.ts` | every mechanic the game has, so that something can be said about all of them at once |
| `packages/content/src/motions.ts` | the motions themselves: one record per body that has one, and the pairing of a kind to its own |
| `packages/content/src/ship-silhouettes.ts` | the ship's own shapes: the hull it is drawn as, the two lobes that stand on it, and the maw one turns into |
| `packages/content/src/warden-shape.ts` | THE WARDEN's body, and the only silhouette in the game with a hole in it |
| `packages/content/src/wave-types.ts` | what a wave is made of |
| `packages/content/src/waves-demo.ts` | which wave to open to see each mechanic, and what the run has to be switched to before it shows |
| `packages/content/src/waves/act-1.ts` | act one: the tutorial arc |
| `packages/content/src/waves/act-2.ts` | act two: the first six bosses, back to back, nothing else |
| `packages/content/src/waves/act-3.ts` | act three: new mechanics after the first five bosses, one more boss among them (THE VANE) |
| `packages/content/src/living-look.ts` | which kinds are drawn as a body of their own, and the contour and own-motion of each — one row per kind, so a forgotten one is a build error |
| `packages/content/src/living-look-handed.ts` | **How the bodies answered by two hands are drawn** |
| `packages/content/src/living-look-stroked.ts` | a creature is not a blob — the nine kinds a radial contour cannot describe, each `null` with the reason its shape needs a path of its own |
| `packages/content/src/waves/act-4.ts` | act four, opening on THE WISP; filled the day THE GYRE was written |
| `packages/content/src/waves/act-4b.ts` | The tail of act four, cut off `act-4.ts` at ten lines under the 250-line ceiling rather than at it |
| `packages/content/src/ghost-shape.ts` | THE GHOST's contour, which is the third family of them in this package |
| `packages/content/src/gimbal-script.ts` | THE GIMBAL's three alignments: where each ring's mark sits on the true wheel |
| `packages/content/src/snake-rounds.ts` | SNAKE's rounds: three maps, and the map is the fight |
| `packages/content/src/creatures-worn.ts` | the five bestiary rows for bodies drawn as something else — a slick or a bulb under a disguise, plating, a membrane, weather or nothing but a smaller size |
| `packages/content/src/controls-round.ts` | The buttons that belong to a round rather than to the ship |
| `packages/content/src/pinball-rounds.ts` | PINBALL's boards, one per round, **drawn rather than listed** |
| `packages/content/src/waves/act-5.ts` | you are adding a wave — this is the act new ones land in, act four having filled |
| `packages/content/src/lid-shape.ts` | you are tuning THE LID's outline — two arcs meeting at a corner, the fourth contour family here |
| `packages/content/src/scenes.ts` | you are authoring or retiming the rehearsal a guide shows — arrivals, tempo and the acts a ghost thumb plays |
| `packages/content/src/scene-script.ts` | A rehearsal turned into the two things the runner takes: a command track and a whole `SceneScript` |
| `packages/content/src/scene-types.ts` | The shapes a rehearsal is written in |
| `packages/content/src/scene-turn.ts` | **A hand that turns rather than carries**, and there are two of them: THE CLAW's crank on the panel |
| `packages/content/src/scenes/first-step.ts` | FIRST STEP's rehearsal: the game's first exchange, in eleven seconds |
| `packages/content/src/scenes/the-hand.ts` | THE HAND's rehearsal: the one verb neither seat owns |
| `packages/content/src/scenes/the-handover.ts` | THE HANDOVER's rehearsal: the panels trade while the pair is watching |
| `packages/content/src/scenes/the-husk.ts` | THE HUSK's rehearsal: a mark drawn on one seat's screen and not the other's, and a thumb that must not land |
| `packages/content/src/scenes/the-hive.ts` |  |
| `packages/content/src/scenes/the-rock.ts` | THE ROCK's rehearsal: the first thing in the game neither of them can do alone |
| `packages/content/src/scenes/the-torch.ts` | TORCH's rehearsal: the warning strip, and the fact that only one of them has it |
| `packages/content/src/scenes/the-dart.ts` | THE DART's rehearsal: the column you were given is the column it has already left |
| `packages/content/src/scenes/the-diastole.ts` | THE DIASTOLE's rehearsal: a count said out loud, and then two of them |
| `packages/content/src/scenes/the-lure.ts` | THE LURE's rehearsal: the shot you are waiting for must never come |
| `packages/content/src/scenes/the-throb.ts` | THE THROB's rehearsal: the wave where firing on sight is the miss |
| `packages/content/src/scenes/the-throat.ts` | THE THROAT's rehearsal: what it takes, and the one thing that hurts it |
| `packages/content/src/scenes/the-veil.ts` | THE VEIL's rehearsal: the colour you were given goes stale while you are loading it |
| `packages/content/src/scenes/the-veer.ts` | THE VEER's rehearsal: the column stops being true while you are saying it |
| `packages/content/src/scenes/salvage.ts` | SALVAGE's rehearsal: shooting something is only half of getting it |
| `packages/content/src/scenes/the-clasp.ts` | THE CLASP's rehearsal: the shield opens the enemy instead of stopping it |
| `packages/content/src/scenes/the-rind.ts` | THE RIND's rehearsal: the shot that lands does not close the column |
| `packages/content/src/scenes/the-third-shot.ts` | THE SHELL's rehearsal: the shot that worked twice is the miss |
| `packages/content/src/scenes/the-taster.ts` | THE TASTER's rehearsal: the colour you keep firing is the colour that stops working |
| `packages/content/src/scenes/the-echo.ts` | THE ECHO's rehearsal: the slowest thing on the field is the one to take first |
| `packages/content/src/scenes/the-ghost.ts` | THE GHOST's rehearsal: waiting to see it is the miss |
| `packages/content/src/scenes/the-purge.ts` | THE PURGE's rehearsal: the field is cleared by swallowing, not by shooting |
| `packages/content/src/scenes/the-pulse.ts` | THE PULSE's rehearsal: four buttons each, the same four |
| `packages/content/src/scenes/the-ward.ts` | THE WARD's rehearsal: the shield answers a rock with nobody triggering it |
| `packages/content/src/scenes/the-gyre.ts` | THE GYRE's rehearsal: the column you were told is the right one for a single beat |
| `packages/content/src/scenes/the-recoil.ts` | THE RECOIL's rehearsal: your own shot is what makes the call wrong |
| `packages/content/src/scenes/the-reprise.ts` | THE REPRISE's rehearsal: a stretch of wave falls seen, and then falls again with nothing drawn |
| `packages/content/src/scenes/the-vane.ts` | THE VANE's rehearsal: the column you were told is never the column it lands in |
| `packages/content/src/scenes/the-wisp.ts` | THE WISP's rehearsal: you call the square it is still falling toward |
| `packages/content/src/scenes/bulb-queen.ts` | BULB QUEEN's rehearsal: the first boss, and the first film with no shot in it |
| `packages/content/src/scenes/the-mirror.ts` | THE MIRROR's rehearsal: Simon Says, played on the pair's own controls |
| `packages/content/src/scenes/the-mine.ts` | THE MINE's rehearsal: the square crosses the room as words, and a finger finds it |
| `packages/content/src/control-command.ts` | What pressing a control *says*, for every control on every panel — one copy, here |
| `packages/content/src/scenes/snake.ts` | SNAKE's rehearsal: the ship is the body, and the one who can see it cannot steer it |
| `packages/content/src/scenes/the-fleet.ts` | THE FLEET's rehearsal: the only one who can see the ships is the one who cannot move the sights |
| `packages/content/src/scenes/the-flip.ts` | THE FLIP's rehearsal: a screen that turns, shown by turning and then by being believed |
| `packages/content/src/waves/act-3b.ts` | The second half of act three, cut off `act-3.ts` when that file reached the 250-line ceiling on `THE VEIL` |
| `packages/content/src/intro.ts` | WHAT THIS GAME IS, IN ONE SCENE |
| `packages/content/src/index-shapes.ts` | Every shape on `@neon-spore/content`'s surface — contours, outlines and stacks — split off the barrel by subject |
| `packages/content/src/instar-script.ts` | THE INSTAR's script: five poses, and what the pair does to each |
| `packages/content/src/scenes/the-lance.ts` | THE LANCE's rehearsal: one shot instead of three |
| `packages/content/src/scenes/pinball.ts` | PINBALL's rehearsal: the thing you fire from is the thing you have to catch it with |
| `packages/content/src/scenes/the-gauge.ts` | THE GAUGE's rehearsal: neither of them has more than half a dial |
| `packages/content/src/scenes/the-lid.ts` | THE LID's rehearsal: doing your half first is the same as not doing it |
| `packages/content/src/scenes/the-leak.ts` | THE LEAK's rehearsal: the thumb stays down and the ring never closes |
| `packages/content/src/scenes/the-lead.ts` | THE LEAD's rehearsal: a shot at where it is, four at where it will be, and the beam standing in its way |
| `packages/content/src/scenes/the-ledger.ts` | THE LEDGER's rehearsal: two hits landed, two bills paid |
| `packages/content/src/scenes/the-maze.ts` | THE MAZE's rehearsal: he turns the wheel and she fires, and neither can do the other half |
| `packages/content/src/scenes/the-magnet.ts` | THE MAGNET's rehearsal: the column the body is in is the one place a shot cannot come from |
| `packages/content/src/scenes/the-moult.ts` | THE MOULT's rehearsal: the answer you agreed on expires while it falls |
| `packages/content/src/scenes/the-warden.ts` | THE WARDEN's rehearsal: he holds the door open and she has to be quick enough to shoot through it |
| `packages/content/src/scenes/the-weight.ts` | THE WEIGHT's rehearsal: a thumb held alone looks exactly like two thumbs held together |
| `packages/content/src/scenes/the-well.ts` | THE WELL's rehearsal: the same field, drawn two ways, and the seam |
| `packages/content/src/creatures-bare.ts` | The three bodies with **nothing laid over them at all**: a slick or a bulb drawn small, drawn large |
| `packages/content/src/mechanics-rocks.ts` | The six rocks' rows, lifted out of `mechanics-table.ts` when THE VOLLEY took that file past its 250-line… |
| `packages/content/src/scenes/the-carom.ts` | THE CAROM's rehearsal: a shape, then an order |
| `packages/content/src/scenes/the-cairn.ts` | THE CAIRN's rehearsal: the rock you did not pull is the one that lands |
| `packages/content/src/scenes/the-candle.ts` | THE CANDLE's rehearsal: the field goes black, and the pair fights by the light of its own shots |
| `packages/content/src/control-sets-table.ts` | Every panel in the game, as a table |
| `packages/content/src/scenes/cyan.ts` | CYAN's rehearsal: the second button, and the cost of the first one |
| `packages/content/src/scenes/two-rocks.ts` | TWO ROCKS' rehearsal: the plate becomes something player 2 can carry |
| `packages/content/src/waves/act-6.ts` | Act six, and it opens with a rock that will not hold its lane |
| `packages/content/src/scenes/the-volley.ts` | THE VOLLEY's rehearsal: a ward that works is not a body that is gone |
| `packages/content/src/scenes/catch-and-aim.ts` | CATCH AND AIM's rehearsal: the hand aims, so the cannon does not have to |
| `packages/content/src/waves/act-1b.ts` | The last of act one, cut off `act-1.ts` when that file reached the 250-line ceiling on `CATCH AND AIM` |
| `packages/content/src/waves/act-10.ts` | Act ten, opened for THE REPRISE — `act-9.ts` had twenty-odd lines left under the 250-line ceiling |
| `packages/content/src/waves/act-11.ts` | Act eleven, opened for THE SPOOL on 22 September 2026 |
| `packages/content/src/maze-drawn.ts` | The four sheets THE MAZE plays after the owner's own, drawn by `bun run maze` and printed here |
| `packages/content/src/body-path.ts` | one living body's contour — a blob, or the walk that puts clubs on its rim |
| `packages/content/src/body-path-clubbed.ts` | a creature is not a blob — the walked rim of balls on stalks THE THROB and THE BEATBOX wear, and the four numbers it is sampled at |
| `packages/content/src/body-form.ts` | `walkedSilhouette`: a silhouette that carries a form's contour whole, with rx and ry taken off the walked outline once |
| `packages/content/src/crystals.ts` | the angular family — the rock, the torch and the queen's shell, which do not live |
| `packages/content/src/crawler-shape.ts` | THE CRAWLER's contour: one link of a worm, and the fifth family of contour in this package |
| `packages/content/src/creatures-fixtures.ts` | **The three bodies a wave never sends** |
| `packages/content/src/mechanics-run.ts` | **The five mechanics that are not a thing the field sends**, and the whole of `reach: "run"` |
| `packages/content/src/wave-entry.ts` | **What one arrival is**, and the half of a wave that grows |
| `packages/content/src/wave-entry-fence.ts` | **THE FENCE's three fields**: where a wall is open, and where it can be cut |
| `packages/content/src/wave-faults.ts` | **A fault as an author writes it**: the kind, the beat row it enters on, and how many beat rows it holds |
| `packages/content/src/creatures-hazards.ts` | **The arrivals with nothing alive in them**: the five speed tiers, THE VEER, the torch — and THE FENCE |
| `packages/content/src/creatures-split.ts` | The three bodies **one seat cannot see whole** that wear nothing to do it — the dart, the wisp and the ghost |
| `packages/content/src/mechanics-split.ts` | The five bestiary rows for bodies one seat cannot see whole — the lure, the dart, the veil, the wisp and the ghost |
| `packages/content/src/control-fault.ts` | **What a wave's fault does to the panel it is played on**, and the one place either half of it is decided |
| `packages/content/src/mechanics-wave.ts` | **The two mechanics a wave turns on without putting a body on the field**, and the whole of `reach: "wave"` |
| `packages/content/src/silhouettes-spare.ts` | **The two contours next door that are not a body on the roster**: one retired, one a capsule |
| `packages/content/src/waves/act-7.ts` | Act seven, and it opens on the first body in this game that cannot be answered from the column it is standing in |
| `packages/content/src/magnet-shape.ts` | THE MAGNET's contour, as numbers rather than as drawing |
| `packages/content/src/veer-clown-shape.ts` | **THE VEER's rider, as geometry**: where every disc of the clown sits on the rock, and the loops it comes to |
| `packages/content/src/veer-clown-figure.ts` | THE VEER's rider **placed**: where every disc of the clown falls on a rock of a given centre and radius |
| `packages/content/src/scenes/the-claw.ts` | THE CLAW's rehearsal: one of you has every button and none of the map |
| `packages/content/src/control-sets-waves.ts` | The three questions a **wave** asks about a panel |
| `packages/content/src/scene-step-types.ts` | a page of a rehearsal, and the thing its words point at |
| `packages/content/src/scene-span.ts` | **Where a page of a film begins and ends**, and which one is showing |
| `packages/content/src/scenes/the-cut.ts` | THE CUT's rehearsal: a wall with no way through, and the crack that is the only place a shot goes through it |
| `packages/content/src/scenes/the-curtain.ts` | THE CURTAIN's rehearsal: a bounce, a soft lobe shot, a shove, a carry of four, the core bared and hit — every act the pilot's hand |
| `packages/content/src/scenes/the-fence.ts` | THE FENCE's rehearsal: a wall the width of the field, and the one thing that has to be true when it lands |
| `packages/content/src/scenes/the-gap.ts` | THE GAP's rehearsal: the wall moves its opening, and only one of them can see where it went |
| `packages/content/src/scenes/the-gum.ts` | THE GUM's rehearsal: a still thumb moves nothing, a swipe flings it out, and one nobody takes splashes on the ship |
| `packages/content/src/scenes/the-gorge.ts` | THE GORGE's rehearsal: the sack eats every shot, and the pair feeds one part of it on purpose |
| `packages/content/src/control-sets-keys.ts` | Whether a panel answers a command — what the desk keyboard is gated by |
| `packages/content/src/control-sets-groups.ts` | **The panel half of the coverage rule**, and nothing else |
| `packages/content/src/control-sender.ts` | **Which control sent this command** — the table next door read backwards |
| `packages/content/src/waves/act-7b.ts` | The second half of act seven, cut off `act-7.ts` when THE COIL was split into two waves and that file reached… |
| `packages/content/src/waves/act-7a.ts` | Three waves between the two halves of act seven: THE CHOKE (the steer fault), THE LIMPET and THE LEECH |
| `packages/content/src/waves/act-7c.ts` | The third page of act seven, cut off `act-7b.ts` when THE STARE took that file twenty-one lines over the… |
| `packages/content/src/waves/act-7d.ts` | The fourth page of act seven, cut off `act-7c.ts` on 20 September 2026 — THE DIASTOLE and THE BATON, when that page had no room left and no letter to give |
| `packages/content/src/waves/act-7e.ts` | The fifth page of act seven, cut off `act-7c.ts` when THE THROAT and THE BATON landed on it within an hour… |
| `packages/content/src/waves/act-7f.ts` | The sixth page of act seven, cut off `act-7e.ts` on 19 September 2026 when THE TASTER and THE SINEW needed a page between it and the old `act-7e.ts` |
| `packages/content/src/waves/act-7g.ts` | The seventh page of act seven, cut off `act-7e.ts` when THE LEAD would have taken it over the 250-line… |
| `packages/content/src/scenes/the-coil.ts` | THE COIL's rehearsal: the shield is stuck open, and the plate is what opens the dome |
| `packages/content/src/keys-desk.ts` | **The desk keyboard is a panel too**, and this is where a key finds out what it means |
| `packages/content/src/control-aim.ts` | Which way a control points, and which rig of keys answers it |
| `packages/content/src/scenes/the-choir.ts` | THE CHOIR's rehearsal: the one gesture that is on no panel at all |
| `packages/content/src/scenes/the-crawler.ts` | THE CRAWLER's rehearsal: nothing is falling, and standing still loses it |
| `packages/content/src/scenes/the-crossing.ts` | THE CROSSING's rehearsal: the lane you are aiming up is only yours until something walks across it |
| `packages/content/src/scenes/the-crystal.ts` | THE CRYSTAL's rehearsal: a lane, a light, and four thumbs at once |
| `packages/content/src/scenes/the-strand.ts` | THE STRAND's rehearsal: two beads, and neither seat can name one alone |
| `packages/content/src/scenes/the-stare.ts` | THE STARE's rehearsal: two looks played right, and a thumb landing under the third |
| `packages/content/src/scenes/the-splice.ts` | THE SPLICE's rehearsal: the number is at the other end of the straw, and only one of you can see it |
| `packages/content/src/scenes/the-spool.ts` | THE SPOOL's rehearsal: a brake held at the wrong depth, a word from the other screen, and the right depth |
| `packages/content/src/scenes/the-sinew.ts` | THE SINEW's rehearsal: two hands pulling one tendon, and a number only one of them can see |
| `packages/content/src/scenes/the-surge.ts` | THE SURGE's rehearsal: three holds on one bulb |
| `packages/content/src/scenes/the-scuttle.ts` | THE SCUTTLE's rehearsal: one part let go, nineteen struck where they hang |
| `packages/content/src/scenes/the-scout.ts` | THE SCOUT's rehearsal: one of them flies blind and the other reads the map |
| `packages/content/src/scenes/the-jam.ts` | THE JAM's rehearsal: the trigger is gone and the aim is all that is left |
| `packages/content/src/scenes/the-balloon.ts` | THE BALLOON's rehearsal: two hands on one body, or nothing at all |
| `packages/content/src/scenes/the-baton.ts` | THE BATON's rehearsal: a launch nobody answers, then three handovers |
| `packages/content/src/scenes/the-beatbox.ts` | THE BEATBOX's rehearsal: the tap you do not make is the one that counts |
| `packages/content/src/scenes/the-undertow.ts` | THE UNDERTOW's rehearsal: the floor bows, and the pair answers it downward |
| `packages/content/src/scenes/the-antiphon.ts` | THE ANTIPHON's rehearsal: a wrong candidate first, then six organs described across the two seats |
| `packages/content/src/scenes/the-orrery.ts` | THE ORRERY's rehearsal: three rings cracked on counted beats and wound off by hand, every rock they shed guarded |
| `packages/content/src/scenes-choreographed.ts` | The rehearsals of the bosses designed on `docs/spec/bosses-choreographed.md` |
| `packages/content/src/scenes-faults.ts` | The rehearsals of the malfunctions — the waves whose lesson is a fault placed on the beat map rather than a… |
| `packages/content/src/scenes-owed.ts` | The rehearsals that were owed: the films `docs/spec/briefings.md` §3.2 listed as *a film nobody has written* |
| `packages/content/src/pulse-stages.ts` | THE PULSE's stages — the charts, and so far there is one of them |
| `packages/content/src/pulse-steps.ts` | A chart, written as bars of text, and the reader that turns one into notes |
| `packages/content/src/mechanics-rounds.ts` | The rounds that are not the field, as mechanic rows |
| `packages/content/src/metaball-spread.ts` | spreading a fixed number of points across a subject that may be in pieces — the shape sheet's need, not the game's |
| `packages/content/src/metaball.ts` | the outline of a metaball field, as however many closed loops it has — what SYMBIOSIS and THE CHOIR are drawn with |
| `packages/content/src/scene-drag.ts` | **A hand carrying a handle**, turned into the stream of `drag` messages a rehearsal's runner sends — how far |
| `packages/content/src/scene-act-types.ts` | one moment of a rehearsal — a thumb on a control or a hand on the field, and a field for every gesture the film can show |
| `packages/content/src/scout-arenas.ts` | THE SCOUT's arenas: two of them, and the arena is the fight |
| `packages/content/src/screen-words.ts` | The sentences a player reads outside a wave: the card a bad line puts up |
| `packages/content/src/creatures-beatbox.ts` | THE BEATBOX's row, cut out of `creatures-table.ts` when it took that file past its 250-line limit |
| `packages/content/src/mechanics-beatbox.ts` | THE BEATBOX's row, cut out of `mechanics-table.ts` when it took that file past its 250-line limit |
| `packages/content/src/silhouettes-beatbox.ts` | Beatbox: a rounded cabinet, and the one body on this roster whose contour is *architecture* rather than an… |
| `packages/content/src/silhouettes-gum.ts` | **THE GUM in the air: THE WEIGHT's sac**, taken off the shape sheet whole |
| `packages/content/src/silhouettes-weight.ts` | **THE WEIGHT: the slumped sac**, the louder of the two hanging drafts, taken off the shape sheet whole |
| `packages/content/src/silhouettes-mine.ts` | **THE MINE is REACHER**, off the shape sheet: *four soft arms |
| `packages/content/src/waves/act-8.ts` | Act eight, opened for THE BEATBOX rather than for a chapter |
| `packages/content/src/waves/act-8b.ts` | Act eight's second page: THE WELL and THE HANDOVER, cut off `act-8.ts` at the ceiling |
| `packages/content/src/waves/act-9.ts` | Act nine: THE LEAK, the fault that takes the hold rather than a button, on the figure THE LANCE was taught on |
| `packages/content/src/balloon-shape.ts` | THE BALLOON's contour: a skin with a knot under it, and the fifth family of contour in this package |
| `packages/content/src/creatures-handed.ts` | **The bodies answered by hands alone**, and today there is one of them |
| `packages/content/src/creatures-held.ts` | a creature needs a hand on it *and* the trigger — the lid, the magnet and the choir, and why each still names `aim` |
| `packages/content/src/creatures-joined.ts` | The body that is **two bodies in one shell** |
| `packages/content/src/creatures-cling.ts` | **THE LIMPET and THE LEECH — the bodies that take a control and go off if it stands still.** Next door to… |
| `packages/content/src/cairn-shape.ts` | THE CAIRN's stack: how seven rocks are arranged, in one place |
| `packages/content/src/mechanics-handed.ts` | The keys of the table below, checked against the roster |
| `packages/content/src/queue-boss.ts` | A wave's boss, remapped onto the field the pair is actually playing |
| `packages/content/src/motions-event.ts` | The two motions that are events rather than idles |
| `packages/content/src/motions-retired.ts` | The motions nothing in the game carries any more |
| `packages/content/src/motion-bank.ts` | BANK, the slick's own motion: two slow drifts on periods with no common multiple, the body leaning into its own travel — the answer the owner took on 9 September 2026 |
| `packages/content/src/balloon-parts.ts` | **What is alive inside THE BALLOON**, and hanging under it: veins, a ring of lit beads |
| `packages/content/src/surface.ts` | where a mark placed at a longitude and latitude lands, how the tangent plane foreshortens it, and its own normal against `KEY` |
| `packages/content/src/studded.ts` | A body whose whole rim is broken by the same feature repeated: knobs, spines or hairs — the contour alone |
| `packages/content/src/rooted.ts` | A bulb held down by roots: a round body with narrow tendrils reaching from its underside |
| `packages/content/src/antiphon-contours.ts` | **THE ANTIPHON's table of contours** — the sixteen shapes the body can grow |
| `packages/content/src/filament-script.ts` | THE FILAMENT's seven filaments: where each hangs, and the line it makes |

### packages/render

| Path | One line |
|---|---|
| `packages/render/src/palette.ts` | style guide as values |
| `packages/render/src/panel-plan.ts` | where the controls stand on the panel, as a record — the rows, the radius and each seat's spread, read by the layout and by bandLobes so drawing and touch move together |
| `packages/render/src/glow.ts` | glow without shadowBlur |
| `packages/render/src/layout.ts` | screen geometry, shared with input hit-testing |
| `packages/render/src/layout-stage.ts` | **Where the game is drawn, before anything is placed inside it.** Cut out of `layout.ts` when THE WELL's roll… |
| `packages/render/src/field.ts` | background, grid pulse, radar strip |
| `packages/render/src/hull.ts` | the ship; cannon and shield as lobes of one contour |
| `packages/render/src/mirror.ts` | the same ship, flipped and in the wrong colours — THE MIRROR |
| `packages/render/src/mirror-grip-fx.ts` | The pin landing and the pin lost: a ring thrown off both of THE MIRROR's lobes, cleared with `MirrorFx` |
| `packages/render/src/mirror-grip.ts` | THE MIRROR's two lobes as a control: the pair's grab circles upside down, rings per seat, the pin and its count |
| `packages/render/src/mirror-chamber.ts` | THE MIRROR'S INSIDES — the chamber under its hull, the way the pair's own ship has one under theirs |
| `packages/render/src/mine-tap.ts` | **A finger on a bare square of the field**, from the seat that cannot see what is standing on it |
| `packages/render/src/mine.ts` | THE MINE, drawn: the body on one seat, the **count** on both |
| `packages/render/src/simon-fx.ts` | the count-in, the handover, and what the row is showing |
| `packages/render/src/simon-row.ts` | the row of slots: a control, or a question mark |
| `packages/render/src/simon-verdict.ts` | the sequence flying into whichever ship earned it |
| `packages/render/src/simon-ghost.ts` | the shots THE MIRROR drops while demonstrating |
| `packages/render/src/simon-glyph.ts` | one control, drawn small enough for a row of six |
| `packages/render/src/controls.ts` | the band's buttons, drawn at any size — band and sequence share them |
| `packages/render/src/boss-draw.ts` | whichever boss is on the field, drawn among the creatures |
| `packages/render/src/boss-draw-clocks.ts` | **The clock bosses, drawn** — the ones from `docs/spec/bosses-choreographed.md` whose whole difficulty is a… |
| `packages/render/src/boss-draw-clocks-b.ts` | **The clock bosses, drawn — page two**: the ones whose picture keeps something that outlives a frame |
| `packages/render/src/boss-draw-clocks-c.ts` | **The clock bosses, drawn — page three**: the pairs asked for by name |
| `packages/render/src/boss-cue-draw.ts` | **The cue this screen is owed, drawn**: the frame on the mark, and the two lines beside it |
| `packages/render/src/boss-cue-read-b.ts` | **What THE TASTER and THE VANE are asking for** — page two of the readings |
| `packages/render/src/boss-cue-read-c.ts` | **What THE LEAD is asking for** — page three of the readings, its page alone |
| `packages/render/src/boss-cue-read-d.ts` | **What the bosses whose ask is a stop are asking for** — page four of the readings: THE STARE and THE SPLICE |
| `packages/render/src/boss-cue-read-e.ts` | **What the rounds are asking for** — page five of the readings: THE MIRROR and THE MAZE |
| `packages/render/src/boss-cue-read-f.ts` | **What the bosses with a handle on the field are asking for** — page six of the readings |
| `packages/render/src/boss-cue-read-g.ts` | **What the rounds drawn as a chart are asking for** — page seven of the readings, opened for THE FLEET |
| `packages/render/src/boss-cue-read-h.ts` | **What the round that kept the ship is asking for** — page eight of the readings, opened for PINBALL |
| `packages/render/src/boss-cue-read-i.ts` | **What THE BATON is asking for** — page nine of the readings |
| `packages/render/src/boss-cue-read-i-b.ts` | **THE BATON's `passing`** — the second half of page nine, and the readings' first cut *within* a boss |
| `packages/render/src/boss-cue-read-j.ts` | **What THE UNDERTOW is asking for** — page ten of the readings |
| `packages/render/src/boss-cue-read-k.ts` | **What THE THROAT is asking for** — page eleven of the readings |
| `packages/render/src/boss-cue-read-l.ts` | **What THE ORRERY is asking for** — page twelve of the readings |
| `packages/render/src/boss-cue-read-m.ts` | **What THE CANDLE is asking for** — page thirteen of the readings, and its own page for page twelve's reason |
| `packages/render/src/boss-cue-read-n.ts` | **What THE GORGE is asking for** — page fourteen of the readings |
| `packages/render/src/boss-cue-read-o.ts` | **What THE LEDGER is asking for** — page fifteen of the readings |
| `packages/render/src/boss-cue-read-p.ts` | **What THE ANTIPHON is asking for** — page sixteen of the readings |
| `packages/render/src/boss-cue-read-q.ts` | **What THE CAIRN is asking for** — page seventeen of the readings |
| `packages/render/src/boss-cue-read-r.ts` | **What THE WELL is asking for** — page eighteen of the readings |
| `packages/render/src/boss-cue-read-s.ts` | **What THE REPRISE is asking for** — the readings' page `s` |
| `packages/render/src/boss-cue-read-t.ts` | **What THE SCUTTLE is asking for** — the readings' page `t` |
| `packages/render/src/boss-cue-read-u.ts` | **What THE DIASTOLE is asking for** — the readings' page `u` |
| `packages/render/src/boss-cue-read-v.ts` | **What THE HIVE is asking for** — the readings' page `v`, a letter rather |
| `packages/render/src/boss-cue-read-w.ts` | **What THE GAUGE is asking for** — the readings' page `w` |
| `packages/render/src/boss-cue-read-x.ts` | **What THE VANE is asking for** — page twenty-four, and its own |
| `packages/render/src/boss-cue-read-y.ts` | **What THE GIMBAL is asking for** — page twenty-five of the readings |
| `packages/render/src/boss-cue-read-z.ts` | **What THE HASP is asking for** — page twenty-six of the readings, and THE GIMBAL's arrangement next door |
| `packages/render/src/boss-cue-read-za.ts` | **What THE SPOOL is asking for** — page twenty-seven of the readings, and the shortest: one handle, one seat |
| `packages/render/src/boss-cue-read-zb.ts` | **What THE RATCHET is asking for**: page twenty-eight of the readings, and THE HASP's arrangement again |
| `packages/render/src/boss-cue-read.ts` | **What THE GORGE, THE CURTAIN and BULB QUEEN are asking for** |
| `packages/render/src/boss-cue-text.ts` | **A cue's two lines, drawn**: the verb under the mark, the kind of action over it |
| `packages/render/src/boss-cue-field.ts` | **The one word the boss wants, drawn separately from `drawBodies` and after `drawShip`** (`canvas2d.ts`) |
| `packages/render/src/boss-cue-instar.ts` | **THE INSTAR's marks, read as cues** — for the desk's `3` key, and for nothing that draws |
| `packages/render/src/boss-cue-shape.ts` | what a cue is — `CueKind`, `BossCue`, and which screen is owed one |
| `packages/render/src/boss-cue.ts` | **THE CUE**: the one word the field says at the moment it wants something |
| `packages/render/src/boss-hurt.ts` | The shake and red glow any boss shows for a moment after the pair lands a sequence |
| `packages/render/src/swallow.ts` | taking a pod in, as a two-part clock |
| `packages/render/src/maw.ts` | swallowing a pod: the skin coming apart, then the flash |
| `packages/render/src/pods.ts` | the pod, hanging and as a burning wreck |
| `packages/render/src/creatures.ts` | silhouettes and their own-motion |
| `packages/render/src/creature-place.ts` | where a creature is on screen, and what a finger is pointing at |
| `packages/render/src/touch.ts` | the control scheme: a point on the layout, and what the ship is told |
| `packages/render/src/grip.ts` | the grip drawn: a ring on every held body, a beam and arrows on a rock, and whose hand it is |
| `packages/render/src/lance.ts` | the lance drawn: the button filling, and the mark that puts on a column |
| `packages/render/src/torch.ts` | the torch: a rock drawn at whatever width its body carries, with an ember ring and a tail |
| `packages/render/src/torch-alarm.ts` | the role-aware banner and pulsing band a torch in the queue triggers |
| `packages/render/src/torch-ember.ts` | THE TORCH's flame, such as it is left: a faint ring just outside the stone |
| `packages/render/src/torch-look.ts` | THE ONE RECORD A CANDIDATE TORCH FLAME PATCHES |
| `packages/render/src/torch-fire.ts` | THE TORCH's fire: a ball of flame with a rock at the heart of it |
| `packages/render/src/torch-ball.ts` | THE BALL OF FIRE A TORCH FALLS INSIDE — everything outside the stone |
| `packages/render/src/torch-veil.ts` | THE ONE RECORD A CANDIDATE **VEIL** PATCHES |
| `packages/render/src/bullets.ts` | shots and their tails |
| `packages/render/src/effects.ts` | every transient the field keeps past its frame, and where each one is kept |
| `packages/render/src/effects-frame.ts` | **What `Effects` does with a frame**, as opposed to what it owns |
| `packages/render/src/sparks.ts` | the particles every impact spends, thrown out or drawn in |
| `packages/render/src/balance.ts` | the screen after the run, drawn: the clock largest, then retries, waves and SYNC |
| `packages/render/src/hud.ts` | the run line (time and retries), beat, the guard balance, overlays |
| `packages/render/src/band.ts` | the two control strips, trigger and colours |
| `packages/render/src/canvas2d.ts` | the renderer, orchestrating the above |
| `packages/render/src/canvas2d-takeover.ts` | **The two frames that are not the field**, and the clocks that run whether or not one of them is up |
| `packages/render/src/renderer.ts` | the interface a PixiJS version would implement |
| `packages/render/src/arrivals.ts` | Which impacts have actually landed, as far as the picture is concerned |
| `packages/render/src/assets.d.ts` | Bun's bundler emits an imported binary as a file and hands back its URL |
| `packages/render/src/backdrop.ts` | The field's back: two depths of drifting motes, a slow wash, and the horizon they sit in front of |
| `packages/render/src/backdrop-look.ts` | THE ONE RECORD A CANDIDATE **BACKDROP** PATCHES |
| `packages/render/src/banner.ts` | The one-word receipt for what a pod just gave, and the colour it reads in |
| `packages/render/src/briefing.ts` | How a wave opens, drawn: first its introduction, then its guide |
| `packages/render/src/break-look.ts` | THE ONE RECORD A CANDIDATE **BREAK** PATCHES |
| `packages/render/src/break-piece.ts` | How one piece of a broken body is painted |
| `packages/render/src/breach-hue.ts` | **The colour a breach is drawn in**, and the one copy of it |
| `packages/render/src/breach-hammer.ts` | The blow, drawn as a blow: a white core at the point and one crest running away from it along the membrane in… |
| `packages/render/src/breach-look.ts` | THE ONE RECORD A CANDIDATE **STRIKE** PATCHES |
| `packages/render/src/breach-strike.ts` | **The hit that loses the wave, seen happening.** One `breach` event |
| `packages/render/src/breach-either.ts` | **Which of the two pictures this breach gets.** The owner took `rend` and `hammer` together out of the three… |
| `packages/render/src/breach-rend.ts` | The plating giving way |
| `packages/render/src/cannon-maw.ts` | Laying the shot: `maw.ts` run backwards |
| `packages/render/src/clasp-break.ts` | THE CLASP's shield failing |
| `packages/render/src/clasp-lattice.ts` | The honeycomb inside THE CLASP's bubble |
| `packages/render/src/clasp-strike.ts` | The ward reaching up the column and taking a clasp's shield off it |
| `packages/render/src/clasp-frames.ts` | THE CLASP's hand-painted shield, held for a host that wants to offer it |
| `packages/render/src/clasp.ts` | THE CLASP's shield: the bubble a slick or a bulb falls inside, and the way it comes apart when the ward opens |
| `packages/render/src/cling.ts` | THE LIMPET and THE LEECH, drawn in their two states: a body coming down a lane |
| `packages/render/src/cleared.ts` | The screen over the rest between two waves: the wave just cleared, the clock and the retries, rising out as the next guide's header falls in |
| `packages/render/src/comms-glyphs.ts` | The three marks the whole game says "one of you can see this" with: an eye on the strip, a speech bubble over |
| `packages/render/src/comms.ts` | Which arrivals make the two of them talk, and which way round |
| `packages/render/src/craters.ts` | A rock's own mark: not the whole rock's silhouette, only the sliver of it that was ever inside the skin |
| `packages/render/src/crater-geom.ts` | What a crater *is*, and the two heights everything about one is measured against |
| `packages/render/src/crater-look.ts` | THE ONE RECORD A CANDIDATE **CRATER** PATCHES |
| `packages/render/src/crater-pit.ts` | The hole itself: a bound and three layers — the lid, the plates, the dark of what is gone, and the seam |
| `packages/render/src/crater-spall.ts` | The ring of plates a hole tears out of the skin around it, in the seat's own colours |
| `packages/render/src/creature-detail.ts` | Core and trailing filaments |
| `packages/render/src/dart-look.ts` | WHAT A DART'S THRUST LOOKS LIKE, as a record rather than as the body of one function |
| `packages/render/src/dart-path.ts` | Where a dart is going, drawn for the seat that is allowed to know: two dotted legs and a hollow body standing |
| `packages/render/src/dart.ts` | Everything about a dart that is a picture rather than a rule: the lean that says where it is going, the jet |
| `packages/render/src/deflect-look.ts` | How a catch reads, as a record rather than as numbers typed into the draw call |
| `packages/render/src/deflect-stone.ts` | The torch, bounced: the grey stone and its ember ring |
| `packages/render/src/deflect.ts` | Seconds into the press-and-release that opens every bounce (capped at `DEFLECT_LOOK.pressLife`); ordinary |
| `packages/render/src/depth.ts` | THE FIELD HAS A NEAR EDGE AND A FAR ONE |
| `packages/render/src/debris.ts` | The pieces a broken body left, still in the air |
| `packages/render/src/desk-seat.ts` | **Whose hand a desk's one mouse is**, on the screen that shows both seats |
| `packages/render/src/desk-grab.ts` | **A press on the screen that shows both seats**, where the desk's one mouse has not been told whose hand it is |
| `packages/render/src/effects-body.ts` | The transients that belong to **one body** and outlive it by less than a beat: a lure folding to a point, the |
| `packages/render/src/effects-boss.ts` | The transients that belong to **one boss** and are read above the loop |
| `packages/render/src/effects-boss-roster.ts` | **The roster**: one field per boss that keeps something between frames |
| `packages/render/src/effects-breach.ts` | What a breach looks like — the one event whose answer is not a burst at a point, because the thing that |
| `packages/render/src/effects-break.ts` | Turning a `destroy` into a body coming apart |
| `packages/render/src/effects-spark.ts` | The events whose whole visible answer is a handful of particles |
| `packages/render/src/egg-contour.ts` | The cloaca's own shape, for one frame — split out of `cannon-maw.ts` so that file's `LAY_LOOK.draw` stays a |
| `packages/render/src/egg-curve.ts` | The cannon's wind-up, as pure arithmetic — no canvas anywhere near it |
| `packages/render/src/frame-passes.ts` | The four passes `Canvas2DRenderer.draw` assembles a frame from, in the order a reader looks for them: the |
| `packages/render/src/gauge-round.ts` | THE GAUGE over the whole stage |
| `packages/render/src/gauge-title.ts` | THE GAUGE's header: the name, the one sentence that teaches this seat its half, and where the other half is |
| `packages/render/src/gauge-grip.ts` | **THE GAUGE's two thumbs on the dial itself**: the pilot's on the needle while the valve is dead |
| `packages/render/src/gauge-button.ts` | THE GAUGE's three presses, as faces on the band's own lobes |
| `packages/render/src/gauge-alien.ts` | THE GAUGE's enemy: a big alien ship hung over ours with its mouth open round it — the owner |
| `packages/render/src/gauge-cannon.ts` | THE GAUGE's cannon: the ship's own, standing on the crown where it always stands and **turning** through the… |
| `packages/render/src/gauge-load.ts` | **Which colour THE GAUGE's cannon is loaded with** — cyan, then red, turn about with every hit |
| `packages/render/src/gauge-shot.ts` | What a call looks like: the cannon fires, the bolt crosses the mouth |
| `packages/render/src/gauge-wound.ts` | THE GAUGE's wound: where the band is, drawn as a place the alien's armour is torn open and the flesh under it… |
| `packages/render/src/gauge.ts` | THE GAUGE's picture: the order the ship, the pod, the line and the claw go down in, and which screen sees the pod |
| `packages/render/src/glide.ts` | A spring that chases a value |
| `packages/render/src/gland-cord.ts` | THE STRINGS RUNNING UP FROM THE BUTTONS — PLASM's, kept |
| `packages/render/src/gland-fluid.ts` | THE FLUID UNDER THE CONTROLS — the two things the owner picked out of PLASM and EMBEDDED on 11 September 2026… |
| `packages/render/src/gland-join.ts` | HOW A SHIP MEETS ITS PANEL WITHOUT A LINE — the baseline every whole-ship card is built on |
| `packages/render/src/gland-organ.ts` | A BUTTON GROWN AS AN ORGAN — the flesh it swells out of, the veins that feed it |
| `packages/render/src/gland-tube.ts` | A TUBE AND A CURVE — the two pieces of vector arithmetic every grown thing on VERSUS is drawn out of |
| `packages/render/src/gland-wet.ts` | WET SKIN — the ship as a clear, light-reflecting surface, with **no grain** |
| `packages/render/src/handles.ts` | The handles: the things drawn **on the field** that a hand takes hold of and carries, as opposed to the |
| `packages/render/src/handles-pairs.ts` | **The two handles that come in pairs** — THE CHOIR's arrows against the two walls |
| `packages/render/src/handles-cords.ts` | **The three cords**: THE MAZE's string, THE WARDEN's rope and THE LID's cord |
| `packages/render/src/hex.ts` | Two `#rrggbb` colours mixed, as a `#rrggbb` colour |
| `packages/render/src/hull-frame.ts` | The hull's shape for one frame — split out of `hull.ts` so the geometry model (this file) and the drawing |
| `packages/render/src/key-light.ts` | THE KEY LIGHT, ON A CANVAS |
| `packages/render/src/light-shafts.ts` | SUN FALLING INTO DEEP WATER |
| `packages/render/src/lobe.ts` | One lobe of the membrane, as a bump on the contour |
| `packages/render/src/lure-alarm.ts` | The alarm player 2 sees over a lure, and player 1 never does |
| `packages/render/src/lure-vanish.ts` | A lure going, and the one moment of this creature both screens show identically |
| `packages/render/src/maze-draw.ts` | THE MAZE's picture: a real maze of rings turning over the ship, with the one gap in its rim lit when it has clicked onto a column |
| `packages/render/src/maze-string.ts` | THE MAZE's lever, and the way it goes: the one thing in this round either player can put a hand on |
| `packages/render/src/meteor.ts` | The rock |
| `packages/render/src/muzzle.ts` | The fire opening — the one place on the hull that two different things now draw into |
| `packages/render/src/other-hand.ts` | THE OTHER HAND: the cheapest presence a two-device co-op game can show — not what a control is doing, only |
| `packages/render/src/queen-egg.ts` | Never quite zero — a degenerate radius is what `frame.test.ts` exists to catch |
| `packages/render/src/queen-glyph.ts` | Points around the contour — the same count `blobPath` itself walks |
| `packages/render/src/queen-grip.ts` | **THE BULB QUEEN's marks as a control**, for the two phases that ask a thumb for them (`QUEEN_GESTURES` |
| `packages/render/src/queen-weakpoint.ts` | Breath speed at full health, out of bloom |
| `packages/render/src/queen.ts` | How much faster the outer body's wobble gets by her last petal |
| `packages/render/src/raster-caps.ts` | What the browser in front of us can actually do with a baked animation |
| `packages/render/src/raster-load.ts` | Getting a baked atlas into a shape `drawImage` will take |
| `packages/render/src/raster-probe.ts` | Two tiny images whose only job is to be decoded |
| `packages/render/src/ready-circles.ts` | The ready gate a guide ends on: two circles, filling, and the wave waits until both say READY |
| `packages/render/src/rock-impact.ts` | How long a missed rock sits sunk into the hull before it starts to drift off |
| `packages/render/src/rock-impact-state.ts` | One rock on its way into, or off, the hull — the record `rock-impact.ts` keeps per impact |
| `packages/render/src/scars.ts` | A breach stays, and it stays *in the skin* |
| `packages/render/src/scuttle-draw.ts` | **THE SCUTTLE**: a dark slab of a frame hung over the top of the field above row 0, plated with its parts |
| `packages/render/src/scuttle-fx.ts` | What THE SCUTTLE leaves behind a frame: the **jolt** a throw puts through the frame |
| `packages/render/src/scuttle-shape.ts` | **Where THE SCUTTLE is**, in field pixels: the frame of sockets hung over the top of the field above row 0 |
| `packages/render/src/scuttle-grip.ts` | **THE SCUTTLE's hanging parts as controls**: a ring on each one a thumb may still carry |
| `packages/render/src/scuttle-metal.ts` | **What THE SCUTTLE is made of**: a slab of dark rock |
| `packages/render/src/scuttle-plate.ts` | **THE SCUTTLE's parts** (`scuttle-metal.ts` has the slab they are seated in): a plate of rock |
| `packages/render/src/scout-button.ts` | THE SCOUT's four presses, as faces on the band's own lobes |
| `packages/render/src/scout-draw.ts` | THE SCOUT's arena, drawn: the little ship, what it is there to collect, what would end it |
| `packages/render/src/scout-round.ts` | THE SCOUT over the whole stage |
| `packages/render/src/scout-ship.ts` | THE SCOUT's little ship, drawn |
| `packages/render/src/scout-grip.ts` | **THE SCOUT's two hands on its own picture** |
| `packages/render/src/sheen.ts` | The light inside the membrane, and the film on top of it |
| `packages/render/src/shell-draw.ts` | THE SHELL's plating: the picture the sim's own bitmask (`Creature.shell`) has no shape for |
| `packages/render/src/shell-plate.ts` | WHAT A PLATE IS MADE OF — the paint over the geometry next door |
| `packages/render/src/shell-cut.ts` | WHERE A PLATE SITS ON A BODY — THE SHELL's armour as geometry and nothing else |
| `packages/render/src/shell-look.ts` | the one record a candidate SHELL patches |
| `packages/render/src/shell-bare.ts` | The half that has already been chipped: no plate |
| `packages/render/src/shield-flash.ts` | The shield's ambient flashes: a soft bright patch popping briefly above the rim, at a random spot and a |
| `packages/render/src/shield-spark.ts` | The shield's ambient arcs: a few thin discharges thrown outward from the rim, gone almost as soon as they |
| `packages/render/src/shield.ts` | The shield, as a body rather than a plate |
| `packages/render/src/siren-seats.ts` | The two chips that flank the siren: which seat, and what that seat has to do about the thing on the field |
| `packages/render/src/siren-dial.ts` | the siren's dial — housing, ticks, the ring that breathes, two bars and the turning core — beside `siren-seats.ts` |
| `packages/render/src/siren.ts` | The warning siren, top right of the field beside the strip, and the two seats' jobs under it |
| `packages/render/src/sinew-band.ts` | **The strain band**: a collar around the tendon on its way down, and the one place the split is drawn |
| `packages/render/src/sinew-draw.ts` | **THE SINEW**: a tendon from the top edge down to a mass, a handle on each side of the mass — one per seat |
| `packages/render/src/sinew-fibres.ts` | **The tendon**: a bundle of fibres from the root to the mass, inside a translucent sheath |
| `packages/render/src/sinew-fx.ts` | What THE SINEW leaves behind a frame: the whip a snap-back puts through the mass and its handles |
| `packages/render/src/sinew-flesh.ts` | **What THE SINEW is made of**: a tendon of wet cords, each lit along one side, in a sheath of membrane |
| `packages/render/src/sinew-handles.ts` | **THE SINEW's two handles**, one either side of the mass and one per seat |
| `packages/render/src/sinew-shape.ts` | **Where THE SINEW is**, in field pixels: the root the tendon hangs from, the mass on the end of it |
| `packages/render/src/sinew-word.ts` | **What THE SINEW is asking of one hand**, and the three silences that are the fight |
| `packages/render/src/slime-look.ts` | WHAT HANGS OFF THE MEMBRANE INTO THE CHAMBER, AS A RECORD |
| `packages/render/src/slow-look.ts` | **THE SLOW's window, as a picture** — the record the look is one field on, and the pass that reads it |
| `packages/render/src/slow-intake-aim.ts` | Where the body a window is about stands and how wide it is, and how far up the look stands this frame |
| `packages/render/src/slow-intake-streams.ts` | The light running inward all the way round the boss, stopping at its skin and never crossing it |
| `packages/render/src/slow-intake.ts` | THE SLOW's window as it ships: the streams round the boss, then the bar over them |
| `packages/render/src/sprite-burst.ts` | A baked animation, played from an atlas, over the field |
| `packages/render/src/tether.ts` | THE WARDEN's rope, and the handle on it: the one thing on this field either player can put a hand on |
| `packages/render/src/tether-look.ts` | THE ONE RECORD A CANDIDATE **TETHER** LOOK PATCHES |
| `packages/render/src/tether-looks.ts` | THE FOUR THINGS A ROPE CAN BE, and the one the field draws |
| `packages/render/src/tether-cord.ts` | CORD — the rope is round, and it has a side the light is on |
| `packages/render/src/tether-sinew.ts` | SINEW — the rope is a piece of the boss, and pulling it is felt all the way up |
| `packages/render/src/tether-twist.ts` | TWIST — the rope is two strands laid round each other, and the twist is what the tension does |
| `packages/render/src/tether-track.ts` | **Where THE WARDEN's rope can be pulled**, as the channel `pull-track.ts` draws |
| `packages/render/src/vane-draw.ts` | THE VANE, drawn: an arm sweeping the top of the field, and the bearing it turns on |
| `packages/render/src/vane-spar.ts` | THE VANE's lever, as metal — the spar, its bracing, the counterweight and the fork |
| `packages/render/src/vane-bearing.ts` | THE VANE's bearing — the mount, the hub and the bolt circle the pair is spending |
| `packages/render/src/vane-grip.ts` | **THE VANE's two hands**, and the geometry the drawing and the hit test share |
| `packages/render/src/veil-bolt.ts` | THE VEIL's lightning: small bolts that break out of the cloud's own border, scattered round it, each in its |
| `packages/render/src/veil-marks.ts` | What stands over a cloud, and it is a different thing in each seat |
| `packages/render/src/veil-mass.ts` | THE VEIL's cloud, filled: what a thunderhead is made of between its rim and its lightning |
| `packages/render/src/veil-shape.ts` | THE VEIL's *form*: the silhouette a cloud has, and the vapour standing around it |
| `packages/render/src/veil-strata.ts` | STRATA — a kept look for THE VEIL's cloud, drawn only on the SHAPES page's LIBRARY |
| `packages/render/src/veil-tear.ts` | A cloud coming apart, and the body inside it visible for the first and last time |
| `packages/render/src/veil-look.ts` | THE ONE RECORD A CANDIDATE THUNDERHEAD PATCHES |
| `packages/render/src/veil-foam.ts` | FOAM — a kept look for THE VEIL's cloud, drawn only on the SHAPES page's LIBRARY |
| `packages/render/src/veil-vortex.ts` | VORTEX — a kept look for THE VEIL's cloud, drawn only on the SHAPES page's LIBRARY |
| `packages/render/src/veil.ts` | THE VEIL's cloud: the thunderhead a slick or a bulb falls inside |
| `packages/render/src/warden-eye.ts` | THE WARDEN's door, and the eye behind it |
| `packages/render/src/eye.ts` | you are drawing an eye — the wet film round it and the lashes and cilia off it, shared by THE LID and THE WARDEN; the lens itself is `eye-lens.ts` |
| `packages/render/src/warden-fx.ts` | The one thing about THE WARDEN that outlives a frame |
| `packages/render/src/warden.ts` | THE WARDEN, drawn: a ring with a hole you can see the field through |
| `packages/render/src/wave-intro.ts` | The first of the two states a wave opens in: its number, `TRY n` on a retry, its name and its sentence |
| `packages/render/src/wrap-text.ts` | Greedy wrap against the measured width |
| `packages/render/src/gradient-slot.ts` | A cache slot for one gradient that depends only on layout — never on time or an eased value |
| `packages/render/src/gradient-held.ts` | `heldGradient`: a gradient whose every argument is a radius and a constant, built once and reused — never one keyed on `time` |
| `packages/render/src/never.ts` | The one way this repository closes a `switch` — a `default` that only type-checks once `x` has narrowed to |
| `packages/render/src/effects-ingest.ts` | Everything `ingestOne` needs to act on a single event, gathered rather than passed one field at a time — the |
| `packages/render/src/touch-lobe.ts` | What pressing a lobe says |
| `packages/render/src/dart-query.ts` | Player 1's half of THE DART: two arrows and a question mark |
| `packages/render/src/coord-grid.ts` | you are changing the lettered grid, its axes, or what brings it up |
| `packages/render/src/coord-axes.ts` | THE NAMES ON THE LATTICE: what a column and a row are called, and the two axes that write them on the field |
| `packages/render/src/wisp.ts` | you are timing a wisp's jump against the beat, or deciding which screen sees one |
| `packages/render/src/ghost-glitch.ts` | THE GHOST's camouflage: the thing it is wearing instead of being invisible |
| `packages/render/src/ghost-release.ts` | A ghost let go of, and the one moment both screens carry this creature |
| `packages/render/src/ghost-row.ts` | What player 1 gets instead of the body: a box scanning the row it is in, and nothing whatever about the column |
| `packages/render/src/ghost.ts` | THE GHOST, drawn — a dome with a hem of tails, wearing a camouflage that is coming apart in horizontal bands |
| `packages/render/src/fleet-chart.ts` | THE FLEET's chart: the lattice of squares the whole fight is named against |
| `packages/render/src/fleet-hulls.ts` | THE FLEET's ships — the pilot's alone, until one goes down in front of both of them |
| `packages/render/src/fleet-hull-body.ts` | what one of THE FLEET's ships is — its contour, its bridge and the plate the key lights |
| `packages/render/src/fleet-hull-detail.ts` | what is on a fleet hull — seams on the squares' own lines, deck, keel, glass and lamp |
| `packages/render/src/fleet-marks.ts` | THE FLEET's shared half: every square already spent, and the sights standing on one |
| `packages/render/src/band-control.ts` | One control of the band, drawn — a lobe or a strip, whichever the set says |
| `packages/render/src/view-role.ts` | Whose screen this is, and what that seat is allowed to be shown |
| `packages/render/src/view-role-clocks.ts` | **The clock bosses' halves** — what each seat is shown of THE DIASTOLE onward |
| `packages/render/src/view-role-clocks-b.ts` | **The clock bosses' halves, page two** |
| `packages/render/src/view-role-clocks-c.ts` | **The clock bosses' halves, page three** |
| `packages/render/src/snake-body.ts` | The body: where it is between two tiles, and what it looks like |
| `packages/render/src/snake-button.ts` | SNAKE's four presses, as faces on the band's own lobes |
| `packages/render/src/snake-draw.ts` | SNAKE's arena, and everything standing on a tile of it |
| `packages/render/src/snake-round.ts` | SNAKE over the whole stage |
| `packages/render/src/living-draw.ts` | one lobed body, filled and lit — the draw path every blob creature takes, and the Throb's two sizes |
| `packages/render/src/living-skin.ts` | What a living body is *made of*, as a record rather than as three lines in the middle of `drawLiving` |
| `packages/render/src/echo.ts` | the seam and the strain — what tells the pair a body is about to come apart, and which way |
| `packages/render/src/echo-look.ts` | The one record a candidate ECHO patches — the furrow, so a second answer to the mark can sit beside the shipped one |
| `packages/render/src/echo-buds.ts` | BUDS — two lit nuclei under one skin, pulling apart along the axis, with the seam as the dark between them |
| `packages/render/src/pinball-round.ts` | PINBALL over the whole stage |
| `packages/render/src/pinball-table.ts` | PINBALL's table: the frame it is played inside, and everything standing on it |
| `packages/render/src/round-draw.ts` | Which bosses replace the whole picture, and what draws each |
| `packages/render/src/snake-head.ts` | The head, shut and open |
| `packages/render/src/snake-panel.ts` | Around the arena: what this screen is told, the clock, the buttons |
| `packages/render/src/snake-shot.ts` | The shot: the one thing in this round both screens see the same way |
| `packages/render/src/gyre-wind.ts` | you are drawing the pull between the ship and a wheel — the wind that says the maw is worth spending |
| `packages/render/src/gyre-wheel.ts` | **One wheel, drawn**: the membrane around it, the two rim bands through the six bodies |
| `packages/render/src/gyre.ts` | you are drawing the wheel under THE GYRE's six bodies — membrane, rim, bowed spokes and the organelle they meet at, behind everything they carry |
| `packages/render/src/target-lock.ts` | THE TARGET LOCK: the one marking in this game that means *an instrument has picked this body out, and it |
| `packages/render/src/taster-blade.ts` | **One blade of THE TASTER's fan**, as a shape and as a paint |
| `packages/render/src/taster-crest.ts` | **The ridge THE TASTER's blades stand out of**, and the two things the pair can do to it |
| `packages/render/src/taster-draw.ts` | THE TASTER, drawn: a low crest hugging the top of the field with a fan of blades standing out of it |
| `packages/render/src/taster-fx.ts` | What THE TASTER leaves behind a frame: a blade coming off the crest |
| `packages/render/src/taster-flesh.ts` | **What THE TASTER is made of**: blades of whetted steel standing in a gum of wet flesh |
| `packages/render/src/taster-read.ts` | **What is written about THE TASTER's fan, and which seat is shown it.** Its own file beside `taster-draw.ts` |
| `packages/render/src/taster-grip.ts` | **THE TASTER's three thumbs on its own fan**: the pilot's pin on a blade that has not decided |
| `packages/render/src/wisp-body.ts` | you are drawing the wisp's bell — its contour, its spectrum fill, its core, and how the jump squashes it |
| `packages/render/src/wisp-ground.ts` | you are drawing what a jumping wisp leaves on the field — its pool of light, its dotted arc, the tile it will land on |
| `packages/render/src/wisp-land.ts` | you are drawing the gather before a wisp leaves a tile or the shock that goes out when it lands on one |
| `packages/render/src/wisp-look.ts` | THE ONE RECORD A CANDIDATE WISP FRINGE PATCHES |
| `packages/render/src/wisp-tentacles.ts` | you are drawing the wisp's streamers — how they gather, trail and splash across a jump |
| `packages/render/src/wisp-static.ts` | you are changing how a wisp comes through in bands — the interference that says one screen does not have it |
| `packages/render/src/wisp-search.ts` | you are changing the box that blinks across the grid on the pilot's screen while a wisp is out — the seat that cannot see one |
| `packages/render/src/lure-hole.ts` | THE HOLE THROUGH A LURE, and what is coming out of it |
| `packages/render/src/ghost-eyes.ts` | THE GHOST's eyes, and they are the whole of what makes the shape a face rather than a bell |
| `packages/render/src/ghost-trail.ts` | Where THE GHOST has just been: the body stamped again at the places it stood a moment ago, fading out behind |
| `packages/render/src/ghost-look.ts` | the one record a candidate GHOST patches — the interior under the camouflage, and the camouflage inside the outline |
| `packages/render/src/ghost-latitude.ts` | THE GHOST's camouflage, coming apart on a **surface** rather than on a flat plane |
| `packages/render/src/ghost-swarm.ts` | SWARM — the nebula is not a gradient but a *population* |
| `packages/render/src/wisp-aim.ts` | you are drawing the square a wisp is going to and the dotted arc to it — the navigator's whole sentence |
| `packages/render/src/wisp-arms.ts` | ARMS — four oral arms under the bell, each a ruffled ribbon with a width, instead of eight threads with none |
| `packages/render/src/lid-string.ts` | you are drawing or hit-testing the cord beside an armoured eye — the handle's circle lives here |
| `packages/render/src/lid-look.ts` | you are offering a second answer to the lid's armour — the one record a candidate for the plates patches |
| `packages/render/src/lid-plates.ts` | the shipped plates over the lid's lens — two grey rectangles sliding apart, and the lit seam between them |
| `packages/render/src/lid-bevel.ts` | BEVEL — a kept look for THE LID's armour, drawn only on the GRAPHICS page's LIBRARY |
| `packages/render/src/lid-iris.ts` | IRIS — six armour leaves overlapping like a diaphragm |
| `packages/render/src/lid.ts` | you are drawing the armoured eye itself — the lens, the sliding plates and the fringe |
| `packages/render/src/ease.ts` | The one easing curve `render/` uses, and the one place it is written out |
| `packages/render/src/hash.ts` | The one repeatable 0..1 in `render/`, and the one place its two magic numbers are written down |
| `packages/render/src/hasp-draw.ts` | **THE HASP**: three sealed clasps down the middle of the field |
| `packages/render/src/hasp-fx.ts` | What THE HASP leaves behind a frame: the **dim** of a wheel seizing under the navigator's hand |
| `packages/render/src/hasp-parts.ts` | THE HASP's two halves, one to a seat: **the wheel** on the navigator's screen and **the latch** on the… |
| `packages/render/src/hasp-pose.ts` | **How far through a pose THE HASP is**, and how far each clasp stands open |
| `packages/render/src/hasp-shape.ts` | **Where THE HASP is**: three clasps down the middle column, each a hinged shell over a hub |
| `packages/render/src/hasp-grip.ts` | **The two thumbs on THE HASP** — half two of the look lane |
| `packages/render/src/guard-lapse.ts` | How long the guard button (`band.ts`) keeps fading after its own window closes, in milliseconds |
| `packages/render/src/handle-draw.ts` | you are changing the shape of a handle — the ring, the gauge, the rest mark and the sag, shared by every one of them |
| `packages/render/src/gyre-core.ts` | you are drawing the surface in the middle of a gyre wheel — the organelle, its fluid and its nucleus |
| `packages/render/src/gyre-place.ts` | you are asking where a gyre's hub, rim or mounts are drawn between beats — the arc, the ease and the jam |
| `packages/render/src/gyre-look.ts` | THE ONE RECORD A CANDIDATE GYRE CORE PATCHES |
| `packages/render/src/gyre-orbit.ts` | ORBIT, drawn: one band of light girdles the ball at a tilt, and the ball is in the way of half of it |
| `packages/render/src/touch-field.ts` | you are adding something a hit test needs to know about the wave or the world — the shape `touch.ts` reads |
| `packages/render/src/pinball-aim.ts` | you are changing what PINBALL's aim shows — the real flight path out of the bucket, and the strength bar beside the table |
| `packages/render/src/pinball-piece.ts` | you are drawing what stands on PINBALL's table — a peg as a living cell, a block as a slab of the same tissue |
| `packages/render/src/snake-skin.ts` | What the body is made of: its contour, its light and its scales |
| `packages/render/src/snake-mouth.ts` | What is in the mouth: the space itself, the fangs hung in it, and the tongue |
| `packages/render/src/rind-shed.ts` | the event of a layer coming off a rind — which body, how big it was and is — handed to `RIND_LOOK` to draw |
| `packages/render/src/rind-skin.ts` | the shipped picture of a rind losing a layer — the outline crushed onto the smaller body, the skin thrown out as a ring |
| `packages/render/src/rind-slough.ts` | SLOUGH — a kept look for THE RIND's shed, drawn only on the GRAPHICS page's LIBRARY |
| `packages/render/src/rind-look.ts` | you are offering a second answer to the rind — its shed, or the body it wears per layer |
| `packages/render/src/rind-burr.ts` | BURR — a rind wearing knobs, and it loses knobs with its layers |
| `packages/render/src/rind-flakes.ts` | FLAKES — a kept look for THE RIND's shed, drawn only on the GRAPHICS page's LIBRARY |
| `packages/render/src/rind-pod.ts` | POD — a kept look for THE RIND's shed, drawn only on the GRAPHICS page's LIBRARY |
| `packages/render/src/snake-crash.ts` | The pause between two attempts, as a picture |
| `packages/render/src/snake-clock.ts` | SNAKE's world, reduced to the three numbers its drawing runs on |
| `packages/render/src/snake-contour.ts` | Where a body's edge is: the two banks of a tapered ribbon along a run of joints |
| `packages/render/src/snake-items.ts` | What is standing in SNAKE's arena to be spent: the things to shoot and the things to swallow |
| `packages/render/src/snake-ribbon.ts` | What a body looks like once somebody has said where its joints are |
| `packages/render/src/snake-venom.ts` | What the acid does when it stops moving |
| `packages/render/src/snake-emerge.ts` | The body coming out of the ship |
| `packages/render/src/snake-jaw.ts` | What one of SNAKE's jaws is: its outline, what is marked on it |
| `packages/render/src/snake-grip.ts` | **SNAKE's two hands on its own body** |
| `packages/render/src/ship-hand.ts` | the ring round the swelling a finger has hold of, and which colour a lift would fire |
| `packages/render/src/touch-hold.ts` | what a hit test hands back: what a drag and a lift go on meaning after the press |
| `packages/render/src/touch-ship.ts` | the ship as a control: both lobes answered where they are drawn on the hull |
| `packages/render/src/field-pose.ts` | the ship's eased pose: where the two lobes are and how the membrane feels, shared by the field and a guide's mini-screens |
| `packages/render/src/field-flip.ts` | THE FLIP, as a screen sees it: |
| `packages/render/src/filament-draw.ts` | **THE FILAMENT**: a body over the top of the field made of loose filaments the way a nerve is a bundle |
| `packages/render/src/filament-fx.ts` | What THE FILAMENT leaves behind a frame: the **whip** of a filament snapping back to its free end |
| `packages/render/src/filament-grip.ts` | **A thumb on THE FILAMENT's line**: the pilot's on the head, the navigator's on the tail |
| `packages/render/src/filament-shape.ts` | **Where THE FILAMENT is**, in field pixels: the body hung over the top of the field above row 0 — a bundle |
| `packages/render/src/fire-vein.ts` | **A shot, running from the thumb to the cannon**: the button's flash, a pulse up its cord in the shot's colour, the release at the top of the cannon |
| `packages/render/src/guide-scene.ts` | a guide's rehearsal at full size: the state — which page, which seat, whether it has finished — beside the slide and the page it draws |
| `packages/render/src/guide-thumb.ts` | the ghost hand a rehearsal is driven by, placed from `bandLobes` and the strips and never authored |
| `packages/render/src/guide-tide-caption.ts` | The words, the ring and the scrim |
| `packages/render/src/guide-tide-caption-box.ts` | Where a page's caption plate goes, and what is written in it |
| `packages/render/src/guide-tide-companion.ts` | The second thing a page is about, ringed and never written on |
| `packages/render/src/guide-tide-membrane.ts` | The living top: three sheets of fluid lying over each other, each with its own drift |
| `packages/render/src/guide-tide-plate.ts` | TIDE's one body, and the shape every piece of its chrome is cut from: a square with the corners taken off |
| `packages/render/src/guide-tide-bar.ts` | TIDE's bar, and the two of its three that are not on it |
| `packages/render/src/guide-tide.ts` | the band across the top of every page of a guide: the living top, and the badge naming the seat |
| `packages/render/src/guide-seat.ts` | one seat's screen inside a guide's rehearsal, drawn through the shipping four passes |
| `packages/render/src/guide-switch.ts` | the slide from one player's screen to the other in a tutorial: the lit seam, and what the band naming the seat has to be told |
| `packages/render/src/guide-slide.ts` | The move from one seat's screen to the other, drawn |
| `packages/render/src/band-channel.ts` | A STRIP, AS A CHANNEL CUT IN THE TISSUE |
| `packages/render/src/band-ground.ts` | WHAT THE CONTROL PANEL IS MADE OF |
| `packages/render/src/band-seam.ts` | WHERE THE SHIP ENDS AND THE PANEL BEGINS — WHICH IS NOWHERE |
| `packages/render/src/band-slime.ts` | WHAT RUNS OFF THE MEMBRANE, AND WHAT REACHES DOWN FROM IT |
| `packages/render/src/lobe-shell.ts` | WHAT A BUTTON ON THE PANEL SITS IN, AND WHAT IT IS SHAPED LIKE |
| `packages/render/src/lobe-look.ts` | what a button stands in and shines with, as a record — the socket under a face and the gloss over it, so a candidate panel can grow its buttons as pores |
| `packages/render/src/recoil-vent.ts` | The jet THE RECOIL leaves behind: fire vented **downward** out of the tile a shot met it in |
| `packages/render/src/recoil.ts` | THE RECOIL's cage: the sprung frame a slick or a bulb falls inside |
| `packages/render/src/guide-nav.ts` | the geometry of the bar a stepped guide is turned by — the boxes, the hit test, and the two numbers other drawings measure off |
| `packages/render/src/guide-play.ts` | The clock a rehearsal runs on, and the page it is running |
| `packages/render/src/guide-plate.ts` | The body under the tutorial's corner plate: the panel's button recipe stretched to a plate, split from `guide-switch.ts` |
| `packages/render/src/opening-fx.ts` | The clocks a wave's opening keeps between frames — the page's, the wave's — and the blobs a READY throws |
| `packages/render/src/opening-key.ts` | Which page of a wave's opening is up, as a string only the clocks compare |
| `packages/render/src/orrery-draw.ts` | THE ORRERY, drawn: a core in the middle column held inside three flattened orbits of organs |
| `packages/render/src/orrery-shaft.ts` | **The shaft**: a corridor of light straight down the core's column, on the one beat a shot can reach the core |
| `packages/render/src/orrery-shape.ts` | **Where THE ORRERY's three orbits are on the screen**, and nothing about how they are painted |
| `packages/render/src/orrery-grab.ts` | **The ring under the pilot's thumb**: where he may take hold of it, what a turn of it says |
| `packages/render/src/orrery-flesh.ts` | **What THE ORRERY is made of**: organs like wet beads strung on their orbits |
| `packages/render/src/ready-page.ts` | The last page of a stepped guide: the wave's own name, and the button that says this seat has finished reading |
| `packages/render/src/ready-words.ts` | **The words on the ready page**: what a circle is called, the question over them |
| `packages/render/src/rock-drift.ts` | **How a rock leaves the ship it broke** — the press into its hole, the waiting and the rolling |
| `packages/render/src/rock-wake-fire.ts` | What burns behind a rock: `tongue` and `flame`, the two fire shapes the three meteor looks are built from |
| `packages/render/src/rock-wake.ts` | What a burning rock leaves behind it — puffs of smoke, chips, threads and the phase that keeps them on the rock — shared by the three meteor looks |
| `packages/render/src/rock-window.ts` | THE PART OF THE SCREEN A ROCK'S FIRE CAN REACH |
| `packages/render/src/rock-size.ts` | how big a rock is on screen and which way it faces — `rockRadius`, `torchRadius`, `torchRotation` — four numbers and nothing drawn |
| `packages/render/src/rock-scuffs.ts` | the small, fading marks a rock grinds into the skin rolling off the hull — a char smudge, a scratch in the rock's colour and two chips |
| `packages/render/src/rock-fall.ts` | **A rock touches the skin on the tick the hull breaks, and not before.** The owner, 25 September 2026 |
| `packages/render/src/ship-marks.ts` | The marks round the cup: what letting go of this swelling would do |
| `packages/render/src/touch-hand.ts` | What a hand on the ship should be *shown* as — the cup that says which swelling is under the finger |
| `packages/render/src/guide-prose.ts` | A guide with no rehearsal, read a page at a time on the game's own screen |
| `packages/render/src/text-drop.ts` | A line of type falling into place, and the one rule the owner attached to it |
| `packages/render/src/egg-skin.ts` | What the cloaca is *made of*: depth, neon, wet, and the colour it burns off a shot in |
| `packages/render/src/lay-echo.ts` | The part of the cannon's mouth that outlives a frame: the follow-through, and the burn's own clock |
| `packages/render/src/seat-skin.ts` | WHICH SHIP THIS IS: player one's violet, player two's amber |
| `packages/render/src/nav-button.ts` | One button on a guide's bar, and the contour every one of them is cut from |
| `packages/render/src/nav-feeder.ts` | What feeds a button from the bar's own membrane |
| `packages/render/src/nav-slab.ts` | The slab the guide's bar stands on |
| `packages/render/src/seat-name.ts` | What to call a seat on a screen a person is reading |
| `packages/render/src/seam-line.ts` | WHERE THE MEMBRANE MAY SWING — the numbers, and nothing that draws |
| `packages/render/src/hover.ts` | WHAT A MOUSE IS RESTING ON, LIT |
| `packages/render/src/recoil-cage-break.ts` | THE RECOIL's cage coming apart: the shot that spends the last bounce, drawn as the frame failing all at once |
| `packages/render/src/recoil-calyx.ts` | CALYX — a kept look for THE RECOIL's cage, drawn only on the GRAPHICS page's LIBRARY |
| `packages/render/src/radar-blip.ts` | Which arrivals this screen's warning strip is carrying, and where each one sits on it |
| `packages/render/src/ratchet-draw.ts` | **THE RATCHET**: a strut down the middle of the field, a rack of seven plates climbing inside it past a pawl |
| `packages/render/src/ratchet-fx.ts` | What THE RATCHET leaves behind a frame |
| `packages/render/src/ratchet-parts.ts` | THE RATCHET's fittings round the rack: **the lock** at the top of the strut with its five pins |
| `packages/render/src/ratchet-pose.ts` | **How far through a pose THE RATCHET is** — the clock the rack is posed off (§22, *Animation*) |
| `packages/render/src/ratchet-shape.ts` | **Where THE RATCHET is**: a strut down the middle column, a rack of seven plates sliding up inside it |
| `packages/render/src/ratchet-grip.ts` | **The two thumbs on THE RATCHET**: half two of the look lane |
| `packages/render/src/caption-anchor.ts` | Where a caption's subject is on the screen |
| `packages/render/src/caption-anchor-boss.ts` | **Where a boss's own fixture is** — the one anchor `caption-anchor.ts` answers per boss rather than per kind… |
| `packages/render/src/caption-anchor-boss-b.ts` | **Where the fixtures of THE LEAD, THE SCUTTLE, THE ANTIPHON, THE ORRERY and THE SCOUT are** |
| `packages/render/src/caption-anchor-boss-c.ts` | **Where the fixtures of THE CANDLE, THE BATON and THE DIASTOLE are** — the third of `caption-anchor-boss.ts` |
| `packages/render/src/caption-anchor-boss-d.ts` | **Where the fixtures of THE GORGE, THE FLEET, THE MIRROR and THE STARE are** |
| `packages/render/src/caption-anchor-boss-e.ts` | **Where the fixtures of THE LEDGER and THE SPLICE are** — the fifth of `caption-anchor-boss.ts` |
| `packages/render/src/caption-anchor-boss-f.ts` | **Where the fixtures of THE GAUGE, THE MAZE and THE REPRISE are** — the sixth of `caption-anchor-boss.ts` |
| `packages/render/src/caption-anchor-box.ts` | **The ring round a boss's fixture** — the two shapes every line of `caption-anchor-boss*.ts` answers with |
| `packages/render/src/guide-hand.ts` | The hands that are **not** on the panel: one held on something falling |
| `packages/render/src/guide-film.ts` | Where a rehearsal's film stands on its stage — phone-shaped and centred, less the nav bar — and the hands drawn on it |
| `packages/render/src/guide-welcome.ts` | The page before a device's first tutorial: what the stepper is |
| `packages/render/src/guide-look.ts` | The tutorial's furniture, as one record: the band across the top that says TUTORIAL and whose screen this is |
| `packages/render/src/gum.ts` | THE GUM, drawn in its two states: a heavy drop coming down a lane |
| `packages/render/src/gum-splash.ts` | **A gum landing on the ship, remembered.** One event — a `breach` carrying the gum's own kind |
| `packages/render/src/baked.ts` | Every cache in render/ that holds baked work between frames, in one place that can empty them all |
| `packages/render/src/stage-point.ts` | WHERE A POINTER ON THE CANVAS ACTUALLY LANDS |
| `packages/render/src/stare-draw.ts` | THE STARE, drawn: the cowled eye over the top of the field, turned away, coming round, looking |
| `packages/render/src/stare-fx.ts` | What THE STARE leaves behind a frame: the **flash** of a press it caught |
| `packages/render/src/stare-shape.ts` | **Where THE STARE is, and how far it has turned** — the numbers the drawer |
| `packages/render/src/stare-lid.ts` | **THE STARE's lid**: the one thing on the eye a hand takes hold of |
| `packages/render/src/intro-parts.ts` | The parts the intro's picture is built out of: a plate, a body, a hull |
| `packages/render/src/intro-pair.ts` | THE PICTURE THE WHOLE INTRO IS: two people, two phones, and a word crossing between them |
| `packages/render/src/intro-player.ts` | ONE OF THE TWO PEOPLE IN THE SCENE |
| `packages/render/src/intro-scene.ts` | WHAT THIS GAME IS, ON THE GAME'S OWN SCREEN: one scene, and no stepper |
| `packages/render/src/intro-shout.ts` | THE WORD CROSSING THE ROOM, which is the one thing the intro is about |
| `packages/render/src/intro-share.ts` | **ONE SHIP'S CONTROLS, WITH A SEAM DOWN THE MIDDLE.** The picture the intro is about, since 15 September 2026 |
| `packages/render/src/render-state.ts` | EVERYTHING A RENDERER HOLDS BETWEEN ONE FRAME AND THE NEXT |
| `packages/render/src/carom.ts` | THE CAROM's crust: a meteor with a window cut in it, and the streak it drags |
| `packages/render/src/chute.ts` | THE CHUTE, drawn: the thrust that throws a body out of a cracked carom |
| `packages/render/src/carom-window.ts` | THE CAROM's window: a hole punched clean through the rock, a bezel round it |
| `packages/render/src/carom-look.ts` | THE ONE RECORD A CANDIDATE **CAROM** CRUST PATCHES |
| `packages/render/src/carom-facet.ts` | THE CAROM's crust cut into lit faces, nose along its heading — the base every capsule candidate draws on |
| `packages/render/src/carom-marks.ts` | A rescue capsule's markings on those faces: rivets, chevrons, a beacon on the beat, a scorched shield |
| `packages/render/src/carom-capsule.ts` | THE CAROM's shipped crust: the rescue capsule the owner picked — stripe on the rear faces, rivets, scorched nose, beacon on the tail |
| `packages/render/src/controls-fleet.ts` | THE FLEET's own two controls, and the crosshair only they still wear |
| `packages/render/src/ship-air.ts` | THE AIR THE SHIP IS SITTING IN |
| `packages/render/src/ship-nerves.ts` | what runs from a control to the organ it drives, as a record — drawn under the controls and across the membrane; ships empty, a candidate ship wires it |
| `packages/render/src/ship-gland.ts` | GLAND's parts: EMBEDDED's arrangement with everything the owner asked for laid over it |
| `packages/render/src/ship-top-chrome.ts` | How far down the ship's own chrome reaches at the top of a screen |
| `packages/render/src/ship-top-rows.ts` | The rows the two alarm bands are written on, stacked under the siren |
| `packages/render/src/volley.ts` | THE VOLLEY's shell: the rock plating a slick or a bulb is sealed inside |
| `packages/render/src/band-lobes.ts` | Where the round buttons on the band stand, for one seat and one panel |
| `packages/render/src/band-lock.ts` | The band, put out — the whole of it, or one seat's half |
| `packages/render/src/band-join.ts` | THE ONE RECORD A CANDIDATE SHIP-AND-PANEL JOIN PATCHES |
| `packages/render/src/band-filaments.ts` | Threads off the band's roof with a drop at the tip — the one part of POLYP the owner took, drawn over the pendants (12 September 2026) |
| `packages/render/src/volley-seams.ts` | **The pattern painted on THE VOLLEY's shell**: the four seams a basketball has |
| `packages/render/src/volley-stone.ts` | **The shipped paint of THE VOLLEY's shell**, in the two passes `volley-look.ts` names |
| `packages/render/src/volley-shards.ts` | THE VOLLEY's broken pieces: curved fragments of the ball a ward takes off it, and the core's skin when it hatches — thrown, falling on the skin, kept in `Effects` |
| `packages/render/src/meteor-look.ts` | The `MeteorLook` record — body, pit, shell, halo — with `STONE_LOOK`, the grey stone the rocks were before they burned, kept for THE VOLLEY's ball |
| `packages/render/src/meteor-looks.ts` | The three things a rock can be — BLAZE, COMET, SMOULDER — as `MeteorLook` records, and `meteorLookFor`, the pick each rock makes by its own id |
| `packages/render/src/meteor-blaze.ts` | BLAZE: a scorched, cratered stone inside a torch's fireball, glowing pieces coming away up the wake; the look the owner had built in |
| `packages/render/src/meteor-comet.ts` | COMET: a rusted iron stone white-hot underneath with a long plume of fire behind it and chips of rock tumbling up it |
| `packages/render/src/meteor-smoulder.ts` | SMOULDER: a black stone white-hot along its underside under a column of dark smoke, ash and the odd ember tumbling up it |
| `packages/render/src/chute-cut.ts` | A chute shot down under its canopy: the canopy cut loose and the body dropping out from under it |
| `packages/render/src/chute-canopy.ts` | THE CANOPY'S GEOMETRY: the one shape a chute hangs under, and the two lengths that put it where it is |
| `packages/render/src/chute-look.ts` | THE ONE RECORD A CANDIDATE **CHUTE** PATCHES |
| `packages/render/src/chute-vane.ts` | VANE — the canopy turns slowly as it comes down, and its surface goes round |
| `packages/render/src/warden-cilia.ts` | THE WARDEN's fringe: the half of CILIATE that stands **outside** the rim |
| `packages/render/src/warden-plates.ts` | THE WARDEN's armour, and the only place on the field that says how far in the pair is |
| `packages/render/src/warden-skin.ts` | THE WARDEN's skin: the veins under it, the wet film over it |
| `packages/render/src/warden-surface.ts` | THE WARDEN's whole surface as one field — veins, eyelets, fringe, edges and armour, in the order a solid is built |
| `packages/render/src/warden-veins.ts` | What lies **under** THE WARDEN's surface: the veins running in from its rim, and the wet film over them |
| `packages/render/src/warden-look.ts` | THE ONE RECORD A CANDIDATE WARDEN PATCHES |
| `packages/render/src/warden-mantle.ts` | MANTLE — a kept look for THE WARDEN, drawn only on the SHAPES page's LIBRARY |
| `packages/render/src/warden-roll-tube.ts` | THE WARDEN's material as a **tube**: the ring read as a torus seen face-on |
| `packages/render/src/warden-roll.ts` | ROLL — a kept look for THE WARDEN, drawn only on the SHAPES page's LIBRARY |
| `packages/render/src/warden-whorl.ts` | WHORL — a kept look for THE WARDEN, drawn only on the SHAPES page's LIBRARY |
| `packages/render/src/warden-grip-fx.ts` | THE WARDEN's thumb landing, hatch thrown and hatch slamming, each a ring off the eye |
| `packages/render/src/warden-grip.ts` | THE WARDEN's eye as a control: player 2's thumb under NARROW, player 1's swipe under GLARE |
| `packages/render/src/weight.ts` | **THE WEIGHT under a thumb, and the one thing on this field a player is shown that their partner is not.**… |
| `packages/render/src/well-draw.ts` | THE WELL's board and the bodies on it, in place of the flat field's two field passes |
| `packages/render/src/well-face.ts` | THE WELL's clock face: the bowl, the lanes, the rings and the seam — the empty board, in the round |
| `packages/render/src/well-flesh.ts` | THE WELL as a throat: the bowl deepening to the hub, a lobed lip, grooves, a socket, a film |
| `packages/render/src/well-ship.ts` | THE WELL's ship: the hull as a ring at the middle of the clock |
| `packages/render/src/well-arrivals.ts` | THE WELL's warnings: the flat field's strip, bent into a ring outside the rim, and the crossing rock's mark |
| `packages/render/src/well-body.ts` | Where a body stands on THE WELL — the one spelling of the well's placement, in its own file so `creature-place.ts` can read it |
| `packages/render/src/well-roll.ts` | THE WELL's roll, as a screen sees it — the angle on the layout, so a frame and a finger cannot disagree |
| `packages/render/src/well.ts` | THE WELL's projection: columns to hours, rows to radii, and the seam the two walls meet at |
| `packages/render/src/wet-socket.ts` | **A wet hollow in whatever surface a body stands on**: darker than the water round it, darkest at the bottom |
| `packages/render/src/queen-drop.ts` | NEXT TO FALL: the flank the queen's next torch comes off, said on player 2's screen and nowhere else |
| `packages/render/src/queen-figure.ts` | Where the parts of the queen sit on her, and where the screen puts them |
| `packages/render/src/queen-facet.ts` | FACET — a kept look for THE BULB QUEEN's shell, drawn only on the GRAPHICS page's LIBRARY |
| `packages/render/src/queen-look.ts` | THE ONE RECORD A CANDIDATE **QUEEN** PATCHES |
| `packages/render/src/queen-carapace.ts` | CARAPACE — a kept look for THE BULB QUEEN's shell, drawn only on the GRAPHICS page's LIBRARY |
| `packages/render/src/queen-crane.ts` | THE CRANE — what holds each flank torch to the queen: an arm of two segments with a claw on the end |
| `packages/render/src/queen-scutes.ts` | SCUTES — THE BULB QUEEN's shell as the game draws it since 11 September 2026 |
| `packages/render/src/maze-walls.ts` | THE MAZE's walls: the circles, the gaps cut in them, and the radial walls that make the corridors turn |
| `packages/render/src/maze-shot.ts` | The shot inside THE MAZE: where it stands, the corridors behind it, and what it found when it stopped |
| `packages/render/src/maze-heart.ts` | What is in the middle of THE MAZE: a heart, beating |
| `packages/render/src/volley-cracks.ts` | **The damage on THE VOLLEY's shell**: the fractures a ward leaves across the stone that is still there |
| `packages/render/src/volley-core.ts` | THE VOLLEY's core: a smaller glossy ball of the body's colour, wearing the shell's seams, drawn inside the shell once a ward has opened it |
| `packages/render/src/volley-cut.ts` | THE VOLLEY's inside where a ward has cut the stone away: the two flat faces of a cutaway planet, the strata on them and the socket the core sits in |
| `packages/render/src/volley-look.ts` | THE ONE RECORD A CANDIDATE VOLLEY LOOK PATCHES |
| `packages/render/src/volley-ember.ts` | EMBER — THE VOLLEY's seams as the game draws them since 11 September 2026 |
| `packages/render/src/volley-pitted.ts` | PITTED — a kept look for THE VOLLEY's stone, drawn only on the SHAPES page's LIBRARY |
| `packages/render/src/volley-pieces.ts` | how THE VOLLEY's shell comes apart — the arc-sector pieces a sector is cut into, and the speed and turn each leaves with — beside `volley-shards.ts`, which throws and draws them |
| `packages/render/src/volley-ward.ts` | **THE VOLLEY wears the shield's own band on the face the shield will meet.** The owner asked for it on 15… |
| `packages/render/src/maze-door.ts` | THE MAZE's way in, and the light that comes out of it when it is standing on the ship's column |
| `packages/render/src/maze-blood.ts` | What THE MAZE's heart leaves on the floor of its room when it is hit, and why it is still there next round |
| `packages/render/src/eye-lens.ts` | you are changing the shape of an open eye — the two lid curves, the corners, and the pupil they cut |
| `packages/render/src/eye-look.ts` | the one record a candidate EYE patches, on the two bodies that share one |
| `packages/render/src/veer-clown.ts` | THE VEER's rider: a clown sitting on the rock, and the reason the rock does not fall straight |
| `packages/render/src/veer-marks.ts` | THE VEER's two half-pictures: the arrow over the rider on player 1's screen, and the *ask* on player 2's |
| `packages/render/src/veer-look.ts` | THE ONE RECORD A CANDIDATE VEER LOOK PATCHES |
| `packages/render/src/veer-rider.ts` | **The shipped rider**: the colours, the light and the order THE VEER's clown is drawn in |
| `packages/render/src/lock-mark.ts` | THE LOCK, drawn: the frame that says *the cannon has this one* |
| `packages/render/src/lost-screen.ts` | A lost wave stops on a friendly screen: RETRY WAVE or QUIT |
| `packages/render/src/lost-shut.ts` | The lost screen: plates that shut, and a wound where the hull was broken |
| `packages/render/src/lost-look.ts` | THE ONE RECORD A CANDIDATE **LOST SCREEN** WOULD PATCH |
| `packages/render/src/lost-answer.ts` | What the pair does about a lost wave: RETRY WAVE and GO TO MENU |
| `packages/render/src/lost-words.ts` | The words of the lost screen: WAVE 7 LOST, and under it the wave's name and how many tries the run has taken |
| `packages/render/src/lost-wound.ts` | Where the ship was broken, drawn as a wound: a ragged hole in the plates with a focus ring round it |
| `packages/render/src/lost-bleed.ts` | What bleeds out of the wound: the pool standing inside its lower rim |
| `packages/render/src/lost-boxes.ts` | Where the lost screen's buttons are: the one geometry the picture (`lost-answer.ts`) and the thumb… |
| `packages/render/src/lost-ribbon.ts` | The shapes the blood out of the lost screen's wound is drawn from: a centre line |
| `packages/render/src/creature-tint.ts` | The three colours a body carries, and what they are mid-turn |
| `packages/render/src/recoil-ribs.ts` | One rib of THE RECOIL's cage, and the piece of hoop it carries |
| `packages/render/src/recoil-look.ts` | THE ONE RECORD A CANDIDATE **RECOIL** PATCHES |
| `packages/render/src/recoil-leap.ts` | THE RECOIL's knock-back as a **throw**: one beat long from the instant of the hit |
| `packages/render/src/recoil-foam.ts` | FOAM — a kept look for THE RECOIL's cage, drawn only on the GRAPHICS page's LIBRARY |
| `packages/render/src/recoil-globe.ts` | GLOBE — THE RECOIL's cage as the game draws it since 11 September 2026 |
| `packages/render/src/recoil-moons.ts` | MOONS — a kept look for THE RECOIL's cage, drawn only on the GRAPHICS page's LIBRARY |
| `packages/render/src/intro-flash.ts` | THE LOUD HALF OF THE INTRO: a headline on a lit slab, a price-tag flash |
| `packages/render/src/intro-controls.ts` | THE TWO CONTROLS A SHOUT ASKS FOR, and the thumb landing on them |
| `packages/render/src/intro-ear.ts` | **AN EAR, AND NOTHING BUT AN EAR.** The other half of the owner's instruction of 16 September 2026 |
| `packages/render/src/intro-mouth.ts` | **A MOUTH, AND NOTHING BUT A MOUTH.** The owner, 16 September 2026, on the intro's two people |
| `packages/render/src/instar-draw.ts` | **THE INSTAR**: a larva the size of the field |
| `packages/render/src/instar-fx.ts` | What THE INSTAR leaves behind a frame: the **jolt** of a landing and of the last |
| `packages/render/src/instar-glyphs.ts` | **The gesture, drawn inside the ring** — one glyph per member of `INSTAR_GESTURES` |
| `packages/render/src/instar-limbs.ts` | **What THE INSTAR holds and grows**, pose by pose: the two arms and their clawed hands |
| `packages/render/src/instar-marks.ts` | **THE INSTAR's marks: the only control on the screen.** A red ring on the part the script wants moved |
| `packages/render/src/instar-mark-grip.ts` | THE INSTAR's marks under a thumb — the hit test alone |
| `packages/render/src/instar-mark-feedback.ts` | **Which mark is wanted, and by whom**: the halo on this seat's open mark, the turning ring on the partner's |
| `packages/render/src/instar-poses.ts` | **THE INSTAR's poses**, one `Figure` each: the body as it enters, the five the script names |
| `packages/render/src/instar-shape.ts` | **Where THE INSTAR is**, as one figure of numbers: the head, the jaws, the two hands and what they hold |
| `packages/render/src/instar-sway.ts` | **THE INSTAR swings**, and everything of it swings together |
| `packages/render/src/instar-word.ts` | **The word over a mark, in a scanner box** — one or two words naming the gesture the ring under it wants |
| `packages/render/src/instar-together.ts` | **The two clocks a mark lives under**, and the one of them the picture kept to itself |
| `packages/render/src/instar-track.ts` | **A swipe is drawn as the way the thumb goes, not as a place to press.** The owner, 24 September 2026 |
| `packages/render/src/instar-chain.ts` | The chain up out of the frame: four segments from above the top of the grid down to the back of the head |
| `packages/render/src/instar-eggs.ts` | THE INSTAR's clutch, one egg per swipe, and the egg each counted swipe drops to the hull |
| `packages/render/src/creature-body.ts` | Which body draw a kind gets, as a lookup a stray statement cannot sever |
| `packages/render/src/effects-spark-silent.ts` | The events that are deliberately not a burst, and why each one is not |
| `packages/render/src/effects-spark-silent-boss.ts` | The choreographed bosses' events that are deliberately not a burst, a family at a time |
| `packages/render/src/effects-spark-silent-boss-b.ts` | **The bosses' half of the not-a-burst list, the second page** — from THE FILAMENT on |
| `packages/render/src/effects-spark-silent-boss-c.ts` | **The bosses' half of the not-a-burst list, the third page** — THE GAUGE's four and THE WELL's four |
| `packages/render/src/effects-spark-handed.ts` | The bursts for the bodies answered by hands alone (`creatures-handed.ts`) |
| `packages/render/src/effects-spark-worn.ts` | The bursts for a covering coming off a body that is still there (shell, clasp, coil, carom, crystal, volley), each colour argued against the others |
| `packages/render/src/maze-fall.ts` | THE MAZE coming apart, which is what a dead end looks like |
| `packages/render/src/maze-stage.ts` | How far through THE MAZE the pair is: one cell per stage, top right where the hull bar was |
| `packages/render/src/lure-blast.ts` | A LURE GOING UP, AND THE WHOLE SCREEN WITH IT |
| `packages/render/src/eye-rim.ts` | **The eye's box, and the rim hung on it.** The third piece of one eye — `eye.ts` holds the wet parts |
| `packages/render/src/eye-iris.ts` | **The machinery inside an eye**: an aperture ring around the pupil and a ring of spokes turning slowly… |
| `packages/render/src/eye-ball.ts` | The inside of an eye as a **ball**: lit across its whole face |
| `packages/render/src/fleet-clock.ts` | How long THE FLEET has left, as a bar and as a number |
| `packages/render/src/fleet-fx.ts` | THE FLEET's one transient: a salvo between the muzzle and the square |
| `packages/render/src/fleet-impact.ts` | What a shell does when it arrives: a rocket into a hull, or a column of water where there was nothing |
| `packages/render/src/fleet-shell.ts` | A salvo in the air: the shell arcing out of the cannon, and its shadow walking the water underneath it |
| `packages/render/src/fleet-water.ts` | The water THE FLEET's chart stands on, and what closes over a hull that has gone down in it |
| `packages/render/src/fleet-grip-draw.ts` | **What the wound looks like while it is being worked** — the plume out of it, the state's own clock under it |
| `packages/render/src/fleet-grip-fx.ts` | **The five moments of THE FLEET's wound** — the water coming in, the thumb that keeps it coming |
| `packages/render/src/fleet-grip.ts` | **THE FLEET's three thumbs on the chart** — the plume, the rake and the wreck |
| `packages/render/src/frame-field.ts` | The two passes that are about the field: the empty board, and the bodies on it |
| `packages/render/src/frame-ship.ts` | The two passes that are about the ship: the hull with its controls, and the overlays |
| `packages/render/src/frame-on-ship.ts` | a body sticks to the finished ship — the fifth pass, between the ship and the overlays: the fence's burn, the gums, the choke's coils, the clingers, in that order |
| `packages/render/src/strand-bead.ts` | The two bodies THE STRAND draws that are **not** a slick or a bulb |
| `packages/render/src/strand.ts` | THE STRAND's thread, and the mark on the bead that has to be shot next |
| `packages/render/src/strand-reel.ts` | THE STRAND's reel: the clock it rolls on, and the bad monitor over it |
| `packages/render/src/strand-raisin.ts` | THE STRAND's raisin: a shot bead, small and dark, drawn on both screens — the pair's one readout of how far along the thread they are |
| `packages/render/src/strand-mark.ts` | THE STRAND's two marks: the bead that has to be shot next on the navigator's screen |
| `packages/render/src/duty.ts` | The one word (or two) a seat owes the other while a split body is on the field |
| `packages/render/src/duty-harpoon.ts` | **What a harpooned control says under the dial of the seat that cannot move it** |
| `packages/render/src/duty-fence.ts` | THE FENCE's own duty word, which is the only one in the table that the world picks rather than the table |
| `packages/render/src/duty-mine.ts` | THE MINE's word, which of the two dials it goes under decided by the field rather than by the table |
| `packages/render/src/throb.ts` | where THE THROB's far half lies — the seam meridian this instant and the region the paint clips to |
| `packages/render/src/throb-look.ts` | THE ONE RECORD A CANDIDATE THROB LOOK PATCHES |
| `packages/render/src/throb-pores.ts` | THE THROB's surface, PORES — a middle with no ammunition colour, black and white pores pinned round the ball, the two colours on the rim |
| `packages/render/src/throat-draw.ts` | THE THROAT, drawn: a gullet of ring muscles hanging from the top of the frame |
| `packages/render/src/throat-mouth.ts` | The mouth, the lip, and the column of field the inhale is holding |
| `packages/render/src/throat-shape.ts` | Where every part of THE THROAT is, as numbers — no canvas in this file |
| `packages/render/src/throat-evert.ts` | **The eversion**: with every ring slack the tube can no longer hold its own shape |
| `packages/render/src/throat-lock.ts` | NEXT INHALE: the column the mouth will be standing in on the beat it next takes something |
| `packages/render/src/throat-grip.ts` | **THE THROAT's two hands**, and the two circles the drawing and the hit test share |
| `packages/render/src/throat-flesh-lip.ts` | **What THE THROAT's mouth is made of**, and the inside it turns out through it at the end |
| `packages/render/src/throat-flesh.ts` | **What THE THROAT is made of**: a wet gullet of ring muscle, lit from above and to the left |
| `packages/render/src/crawler-fx.ts` | THE CRAWLER's three transients — the burst ring's splash, the swept lane, the burrow's mound |
| `packages/render/src/crawler.ts` | THE CRAWLER, drawn — a maggot lying along the ship's surface, its rings overlapping |
| `packages/render/src/crawler-ring.ts` | **One ring of a maggot, as a shape** — the three sets of proportions the parts of a worm are drawn at |
| `packages/render/src/crawler-skin.ts` | **The wet on a maggot, and the little on its face** |
| `packages/render/src/living-frame.ts` | Where a living body is standing this frame, and the transform that puts a pen in its own local units |
| `packages/render/src/living-pose.ts` | where a living body sits and which way it faces on this beat — the own-motion's sway, the throb's turn, the dart's lean and flip |
| `packages/render/src/strand-thread.ts` | Which beads of THE STRAND are on one thread, and in what order along it |
| `packages/render/src/crawler-marks.ts` | What each ring of THE CRAWLER is owed — a crosshair on every one, the shield's mark over the dome's |
| `packages/render/src/crawler-place.ts` | Where a ring of THE CRAWLER actually sits on screen, and how much bigger it draws for being that near |
| `packages/render/src/crawler-look.ts` | THE ONE RECORD A CANDIDATE CRAWLER SURFACE PATCHES |
| `packages/render/src/crawler-gut.ts` | GUT — the ring is a bag with something in it: a dark organ seen through translucent skin |
| `packages/render/src/fence-gate.ts` | The way through a fence, on the screen that is shown it |
| `packages/render/src/fence.ts` | THE FENCE: a live line the width of the field, and the two different pictures of it the two screens carry |
| `packages/render/src/spline.ts` | A contour, written into a `Path2D` as numbers |
| `packages/render/src/splinter.ts` | The splinters a break throws off the faces it opened |
| `packages/render/src/splice-draw.ts` | THE SPLICE, drawn — and drawn differently on each screen, which is the fight |
| `packages/render/src/splice-straws.ts` | THE SPLICE's straws, as geometry and as lines |
| `packages/render/src/splice-flesh.ts` | What THE SPLICE's straws and mouths are made of: ringed tubes and puckered lips |
| `packages/render/src/effects-ingest-silent.ts` | **The events that leave nothing behind in `Effects`**, and why each one does not |
| `packages/render/src/effects-ingest-silent-boss.ts` | **The bosses' half of the silent list**, and nothing else |
| `packages/render/src/effects-ingest-silent-boss-b.ts` | **The bosses' half of the silent list, the second page** — from THE ANTIPHON on |
| `packages/render/src/effects-ingest-silent-boss-c.ts` | **The bosses' half of the silent list, the third page** — THE WELL's four and THE GIMBAL's ten |
| `packages/render/src/effects-ingest-pod.ts` | **What the mouth leaves on screen**, for the two cargoes that leave anything |
| `packages/render/src/malfunction-look.ts` | **What a broken control looks like**, and what the button that holds it off looks like beside it |
| `packages/render/src/magnet-break.ts` | A magnet coming apart: the two arms thrown the way the bolt was going, and the plate falling loose |
| `packages/render/src/magnet.ts` | THE MAGNET, drawn: a horseshoe on two coloured poles with an armoured plate slung under it |
| `packages/render/src/magnet-alarm.ts` | THE MAGNET's call, and the second alarm in this game that reads differently depending on who is looking |
| `packages/render/src/fence-arc.ts` | The current jumping both ways between a wall coming down and the dome under it |
| `packages/render/src/fence-sweep.ts` | What the navigator gets instead of the doorways: a reading head crossing the wire |
| `packages/render/src/fence-wire.ts` | What a stretch of live wire looks like, and how far above the ship it hangs |
| `packages/render/src/shield-outage.ts` | The shield's line burnt out in places, which is what a wall costs instead of a scar |
| `packages/render/src/shatter-fall.ts` | Where a piece is, some time after the body came apart |
| `packages/render/src/shatter.ts` | Cutting a body into the pieces it came apart into |
| `packages/render/src/magnet-bounce.ts` | A shot turned away by the plate under a magnet, coming back down |
| `packages/render/src/fence-shards.ts` | The pieces of wall a bolt knocks out of a column it cuts |
| `packages/render/src/fence-strike.ts` | A wall landing on the ship, remembered: the outage and the shock it leaves |
| `packages/render/src/hull-shock.ts` | The whole ship conducting for a moment after a wall earthed through the dome |
| `packages/render/src/hull-sheen.ts` | what the ship's skin is made of, as a record — the five sheen passes as one material a candidate ship can replace |
| `packages/render/src/hull-skin.ts` | the colours a ship is painted in — `HullSkin`, the player's own and THE MIRROR's; a seat's is `seat-skin.ts` |
| `packages/render/src/hull-splash.ts` | What the thing that broke the hull left on it: a splash, in its own colour, that stays for the rest of the run |
| `packages/render/src/bolt.ts` | **One discharge drawn between two points**, and the one place the shape of a bolt in this game is decided |
| `packages/render/src/coil-jump.ts` | The charge leaving a dome that has just failed and crossing the field to the next one |
| `packages/render/src/coil-look.ts` | THE ONE RECORD A CANDIDATE **COIL** LOOK PATCHES |
| `packages/render/src/coil-prongs.ts` | PRONGS — the dome has terminals, and the charge sprays off them |
| `packages/render/src/coil-flight.ts` | THE COIL's freed rock drawn thrown from the dome's tile to the far wall's hull from the frame the dome went, its tail from the dome and the line lit a moment after the hit |
| `packages/render/src/coil.ts` | THE COIL's dome: the shell a rock crosses the field inside, and the three studs the charge leaves it by |
| `packages/render/src/reach-arm.ts` | THE CLAW's arm, drawn out of the swelling that was the gun |
| `packages/render/src/reprise-draw.ts` | THE REPRISE, drawn: the top edge of the field torn open, the wave that has just come down still inside it |
| `packages/render/src/reprise-fx.ts` | **The one thing THE REPRISE's picture has to remember**: that the count of owed bodies just went down |
| `packages/render/src/reprise-flesh.ts` | What THE REPRISE's tear is made of: a torn lip, a throat with depth, a glossed mass and fangs for the count |
| `packages/render/src/comms-talker.ts` | one row per creature: which seat has to say something about it |
| `packages/render/src/corner-light.ts` | One rounded light in the bottom-right corner of the sky |
| `packages/render/src/countdown.ts` | THE COUNT: the disc, `showsCount`, and the notches it wore — NOTCHES on the LIBRARY |
| `packages/render/src/countdown-look.ts` | THE COUNT's look as a record VERSUS can patch: `over` on both screens, `count` on the pilot's — IRIS filled in |
| `packages/render/src/countdown-dial.ts` | DIAL — a kept look for THE COUNT, drawn only on the SHAPES page's LIBRARY |
| `packages/render/src/countdown-fuse.ts` | FUSE — a kept look for THE COUNT, drawn only on the SHAPES page's LIBRARY |
| `packages/render/src/countdown-iris.ts` | IRIS — what THE COUNT wears: a socket and core on both screens, blades over it on the pilot's, a hole on zero |
| `packages/render/src/codex.ts` | **THE CODEX, seen: the air over the field going wrong.** While the key is turned over |
| `packages/render/src/fence-bolt.ts` | **One line of current between the wall and the dome.** Cut out of `fence-arc.ts` when the warning skull took… |
| `packages/render/src/fence-crack.ts` | **The breaking point in a wall, on the screen that is shown it.** A gap is a hole the dome is steered into; a… |
| `packages/render/src/fence-exit.ts` | **A wall leaving the ship it did not touch.** A fence that finds the dome standing in one of its ways through… |
| `packages/render/src/fence-skull.ts` | **The skull the current draws over the dome when the wall above it is shut.** A fence is answered by the… |
| `packages/render/src/fault-emitter.ts` | the malfunction's visible cause: the LANTERN emitter hanging from the top of the field and its beam down to the button, dome or muzzle the fault has taken on this screen |
| `packages/render/src/fault-beam-ends.ts` | Where the fault's beam lands on this screen — GUARD or the dome, the colour lobes or the muzzle, the cannon strip's node for THE CHOKE |
| `packages/render/src/grip-arrows.ts` | THE PUSH, said before it happens: the two white arrows beside a held rock, and the beat they go out for |
| `packages/render/src/grip-beam.ts` | The beam of a brake — the one part of a hand on a rock that is visible from across the room |
| `packages/render/src/grip-rings.ts` | The three rings a thumb on a boss's picture is drawn with: asked for, held, thrown off — the queen's and the mirror's |
| `packages/render/src/grip-verdict.ts` | **Was that right?** — answered on the thing the thumb touched, the moment the simulation has judged it |
| `packages/render/src/gorge-draw.ts` | THE GORGE, drawn: a translucent sack across seven columns above the top of the field, breathing on the beat |
| `packages/render/src/gorge-fx.ts` | What THE GORGE leaves behind a frame: the beads leaving at the end |
| `packages/render/src/gorge-flesh-torn.ts` | THE GORGE's openings: the intake puckered under every lobe, and the flaps of a lobe the beam has torn open |
| `packages/render/src/gorge-flesh.ts` | **What THE GORGE is made of**: a sack of wet membrane, thin enough to see through, veined |
| `packages/render/src/gorge-lobe.ts` | One lobe of THE GORGE: the intake puckered under it, the beads hanging in it |
| `packages/render/src/gorge-grip.ts` | **THE GORGE's two thumbs**: the pinch on a full intake and the pry on the mouth |
| `packages/render/src/gimbal-draw.ts` | **THE GIMBAL**: a sealed drum hung in a yoke over the middle of the field inside two rings set at right… |
| `packages/render/src/gimbal-drum.ts` | **The sealed drum the two rings hang round, and the clock the whole scene is posed off** (§18, *Animation*) |
| `packages/render/src/gimbal-ring.ts` | **The half of THE GIMBAL a hand is on**: one ring, drawn on the screen of the seat that grips it |
| `packages/render/src/gimbal-shape.ts` | **Where THE GIMBAL is**, in field pixels: the yoke it hangs from |
| `packages/render/src/gimbal-fx.ts` | What THE GIMBAL leaves behind a frame: the **kick** of the whole cradle as a tooth shears off it |
| `packages/render/src/gimbal-grip.ts` | **The ring under each thumb**: where a hand may take hold of it, what a turn of it says |
| `packages/render/src/effects-ship.ts` | the ship's own clocks: the swallow, the fire opening, the deflection flash, the queen's shudder |
| `packages/render/src/strand-still.ts` | One live bead on the navigator's screen that **no shot can answer this instant**: the reel drawn as a grey outline |
| `packages/render/src/strand-fuse-draw.ts` | The three pictures a burning thread is made of (`strand-fuse.ts`): a front eating its way along the line |
| `packages/render/src/strand-fuse.ts` | THE STRAND's thread going, drawn as a fuse |
| `packages/render/src/strip-look.ts` | what a strip looks like, as a record — the trough, its lip, the rail, the stations and the block, lifted out of band-channel so a candidate panel can draw a rail as something else |
| `packages/render/src/strip-band.ts` | HOW FAR OFF A STRIP A THUMB MAY LAND AND STILL MEAN IT |
| `packages/render/src/maze-timer.ts` | THE MAZE's clock, drawn on the outside of the heart |
| `packages/render/src/choir-arrows.ts` | **THE CHOIR's two arrows**: the way to open a membrane on a device that cannot tell you it has been shaken |
| `packages/render/src/choir-prompt.ts` | **The instruction over a membrane**: a scan frame around the middle dot with the gesture written under it |
| `packages/render/src/choir-quake.ts` | the whole screen shaking, and the only thing in this renderer that moves the picture rather than something in it |
| `packages/render/src/choir.ts` | THE CHOIR as it stands before the pilot's gesture |
| `packages/render/src/maze-drips.ts` | The half of a refused shot that lands on the ship: a pool across the top of the hull |
| `packages/render/src/maze-spill.ts` | What a shot the heart refuses throws back, and how far it gets |
| `packages/render/src/maze-look.ts` | the one record a candidate MAZE patches — the drum standing still |
| `packages/render/src/maze-lever.ts` | THE MAZE's lever, drawn: an arm bolted to the drum's rim with a knob on its end |
| `packages/render/src/maze-relief.ts` | THE MAZE's drum given depth: a floor under every corridor, and a wall that stands on it |
| `packages/render/src/maze-pulse.ts` | the numbers THE MAZE's heart runs on — which blood the round is on, the double thump, the tempo from whole to hurt, how long a wound lasts — beside `maze-heart.ts` |
| `packages/render/src/maze-plate.ts` | THE MAZE's drum as a made thing: a bezel and bolts round the rim, gloss over the plate, and the socket the heart sits in |
| `packages/render/src/maze-grip-fx.ts` | **The thumb landing on the heart, and the thumb leaving it** |
| `packages/render/src/maze-grip.ts` | **THE MAZE's heart as a control**, for the one gesture that asks a thumb for it: the tear (`grip` |
| `packages/render/src/pulse-fall.ts` | The arrows themselves: what is falling, what is standing on the line |
| `packages/render/src/pulse-lane.ts` | Where THE PULSE's four lanes are, and where the line across them is |
| `packages/render/src/pulse-meter.ts` | The one meter, the tally under it, and the verdict |
| `packages/render/src/pulse-round.ts` | THE PULSE over the whole stage |
| `packages/render/src/pulse-button.ts` | THE PULSE's four lanes, as a face on one of the band's own lobes |
| `packages/render/src/pulse-drop.ts` | An arrow nobody answered falls into the ship |
| `packages/render/src/pulse-shape.ts` | What falls down each of THE PULSE's four lanes, and what colour it is |
| `packages/render/src/pulse-shape.ts` | What an arrow in THE PULSE is made of: its hue, its heading and its contour |
| `packages/render/src/lance-flash.ts` | The whole screen going white, then the ammunition colour, then nothing |
| `packages/render/src/landing.ts` | Where a body's last glide ends: half-sunk in the ship's skin, so the beat it is seen to touch the hull is the beat the hull answers |
| `packages/render/src/label-box.ts` | The box a guide writes in: a solid ground, a two-pixel edge in the pod's colour, sixteen-point Courier |
| `packages/render/src/ledger-cord.ts` | **The cord**, and the one hole in the ship it goes into |
| `packages/render/src/ledger-draw.ts` | **THE LEDGER**: a tall split body high in the field on a single thick cord running down into the pair's own… |
| `packages/render/src/ledger-fx.ts` | What THE LEDGER leaves behind a frame: the pulse a warded return throws back **up** the cord |
| `packages/render/src/ledger-read.ts` | **What is written about the cord, and which seat is shown it** — *his clock, her column* |
| `packages/render/src/ledger-root.ts` | **The navigator's half of THE LEDGER, on the finished ship** |
| `packages/render/src/ledger-shape.ts` | **Where THE LEDGER is**, in field pixels: the two halves of the body, the cord between it and the hull |
| `packages/render/src/ledger-grip.ts` | **The navigator's two hands on THE LEDGER's root**: the foot of the cord while it is still paying out |
| `packages/render/src/ledger-haul.ts` | **The pilot's carry on the taut cord** |
| `packages/render/src/ledger-pull.ts` | **The pilot's two hands on THE LEDGER's cord**: his thumb on the soonest return |
| `packages/render/src/ledger-metal.ts` | **What THE LEDGER is made of**: plating — two halves of dark metal |
| `packages/render/src/lead-draw.ts` | THE LEAD drawn: the ridge, the stalk of beads, the mound or the sill, the lock and the flights, split by seat |
| `packages/render/src/lead-fx.ts` | What THE LEAD leaves behind a frame: the spring the lean rides, the whip, the tumbling bead, the bursts |
| `packages/render/src/lead-flesh.ts` | **What THE LEAD is made of**, the living part |
| `packages/render/src/lead-shape.ts` | Where THE LEAD is in field pixels: the ridge, the foot, the stalk's length and the angle each seat is asked for |
| `packages/render/src/lead-grip.ts` | **THE LEAD's stalk as a control**, for the one movement that asks a thumb for it: the still |
| `packages/render/src/lead-word.ts` | **What THE LEAD is asking of the navigator's thumb while it stands still** |
| `packages/render/src/lead-rock.ts` | **THE LEAD's ridge**: dark rock, lit along its top edge and gone to the deep under it |
| `packages/render/src/body-mark.ts` | One living body, at a size, with no world around it |
| `packages/render/src/body-interior.ts` | **What a living body has inside it**: one record per kind, so the slick's two dots can be argued with |
| `packages/render/src/body-inset.ts` | what is inside a living body is clipped to the body drawn a sixth smaller, so an interior borrowed from one contour never crosses another's rim |
| `packages/render/src/body-bloom.ts` | THE SLICK's interior — a nucleus that sends something out along its veins |
| `packages/render/src/body-burst.ts` | **A body bursting on the plating it just reached**, like a balloon full of water, in the colour it was wearing |
| `packages/render/src/body-spores.ts` | THE BULB's interior — the body is full, and it is a spore case |
| `packages/render/src/body-strike.ts` | A body on the beat it is struck, drawn where it stood after it is gone |
| `packages/render/src/body-hit.ts` | What happens to a living body **when a shot lands on it** |
| `packages/render/src/body-hit-afterglow.ts` | THE DART's strike: the cores burn out and the outline hangs as an afterimage |
| `packages/render/src/body-hit-pop.ts` | THE BULB's strike: the film tears from where the bolt met it and pops |
| `packages/render/src/body-hit-rupture.ts` | THE RIND's strike: the skin peels back in petals and the gel stains the ship |
| `packages/render/src/body-hit-scatter.ts` | THE WISP's strike: lit motes rise and blink out, nothing lands |
| `packages/render/src/body-hit-shock.ts` | THE THROB's strike: pressed flat by the blow, then rings run down the column |
| `packages/render/src/body-hit-splash.ts` | THE ECHO's strike: a crown of drops thrown up and a puddle on the skin |
| `packages/render/src/body-hit-defuse.ts` | DEFUSE — THE MINE's, and the one kill in this game that is not a kill |
| `packages/render/src/pulse-body.ts` | One arrival falling down a lane, and the two ways of drawing one that cannot be read |
| `packages/render/src/choir-shape.ts` | where THE CHOIR's two bodies stand and the skin traced over them — the shape half, with no light or colour in it |
| `packages/render/src/choir-skin.ts` | **The light THE CHOIR throws and the film it wears** — the surface half of this creature |
| `packages/render/src/choir-look.ts` | THE ONE RECORD A CANDIDATE CHOIR SURFACE PATCHES |
| `packages/render/src/choke-coil.ts` | **The coil, which is THE CHOKE's one word said in two places.** On the field the choke is wound round the… |
| `packages/render/src/choke-strip.ts` | **Player 1's cannon strip while THE CHOKE has the cannon.** Drawn over the strip the band has just drawn |
| `packages/render/src/choke-hull.ts` | THE CHOKE's grip on the cannon over the finished hull — the loops round the swelling while the steer fault has it, and the pilot's light toward the next column |
| `packages/render/src/action-face.ts` | Player 1's action buttons, showing the ship doing the thing instead of spelling its name |
| `packages/render/src/after-image.ts` | **THE CANDLE's after-image**: which columns of a dark field were lit, by what |
| `packages/render/src/antiphon-draw.ts` | **THE ANTIPHON**: a smooth violet body hung over the top of the field above row 0 |
| `packages/render/src/antiphon-fx.ts` | What THE ANTIPHON leaves behind a frame |
| `packages/render/src/antiphon-flesh.ts` | **What THE ANTIPHON is made of**: a long mantle of membrane |
| `packages/render/src/antiphon-shape.ts` | **Where THE ANTIPHON is**, in field pixels: the body hung over the top of the field above row 0 |
| `packages/render/src/antiphon-grip.ts` |  |
| `packages/render/src/antiphon-rail-grip.ts` | **THE ANTIPHON's second handle: the rail, on the one screen it hangs on** — a ring on every candidate… |
| `packages/render/src/beatbox-marks.ts` | THE BEATBOX's two half-pictures: the **count** over the box on player 1's screen |
| `packages/render/src/beatbox-tap.ts` | **Player 2's thumb on a soundbox**, and the first press in this game that lands on a *body* and is over the… |
| `packages/render/src/beatbox-wave.ts` | **The wave of sound a miscounted box sends at the ship**, and the picture this creature is named for |
| `packages/render/src/beatbox-wash.ts` | **The colour laid over a soundbox**, which is the half of this creature that is about *when* rather than… |
| `packages/render/src/beatbox.ts` | **How big a soundbox is drawn this instant**, which is the whole of what this creature says |
| `packages/render/src/creature-body-worn.ts` | **The two body draws that read their own record rather than calling a draw function directly** |
| `packages/render/src/balloon-handles.ts` | **THE BALLOON's two handles**: the one thing on this field that two people take hold of at the same time |
| `packages/render/src/balloon.ts` | THE BALLOON, drawn — a skin with a knot under it, filling where it appears, leaning the way it climbs |
| `packages/render/src/creature-body-in.ts` | **What a body draw is handed.** Cut out of `creature-body.ts` when THE BALLOON's row took that file over its… |
| `packages/render/src/creature-body-rock.ts` | The three rock body draws: the plain tiers, the torch, and the coil drawn as the burning torch it will become |
| `packages/render/src/creature-body-living.ts` | The ordinary living body, on its own so the kinds that wear it can reach it without reaching the table |
| `packages/render/src/creature-under.ts` | The creature under this seat's finger on the flat field — the touch layer's hit test, by the flat placement |
| `packages/render/src/creature-over.ts` | what is laid over a body after the body is drawn — the veil's cloud, the veer's rider, the carom's crust, the chute, the volley's shell, the recoil's cage, the coil's dome, the clasp's shield — one `if` per covering |
| `packages/render/src/creature-axes.ts` | **How wide and how tall a body is actually drawn** — the other half of `creatureRadius` |
| `packages/render/src/handle-place.ts` | **Where a handle is standing**, as against where a finger may grab it |
| `packages/render/src/handle-place-boss.ts` | **Where a boss's handle is standing** — `handle-place.ts`' question |
| `packages/render/src/handle-word.ts` | you are changing the word under a handle, or which seat reads which half of it |
| `packages/render/src/handover-look.ts` | **THE HANDOVER's announcement**: the plate on the lip of the band that counts the trade down and counts the panels back, in the same words on both screens |
| `packages/render/src/handover-hull.ts` | THE HANDOVER on the ship itself: two lobes on the hull handing one height back and forth for the length of the window, under the shipped plate |
| `packages/render/src/handover.ts` | **Which seat this device is playing** — its own, or the other one's while THE HANDOVER has the panels traded. One function, called by the renderer on a frame and by the host on the layout a finger is tested against |
| `packages/render/src/harpoon-danger.ts` | **THE CONTROL HEATING UP UNDER A HARPOON.** The owner's point 6, on 14 September 2026 |
| `packages/render/src/harpoon-line.ts` | **THE LINE**: the thing at the top of the field firing a body at a control |
| `packages/render/src/harpoon-mark.ts` | **WHAT IS ON THE CONTROL, WRITTEN ON IT.** The owner's point 2 of 14 September 2026 |
| `packages/render/src/harpoon-place.ts` | **Where each harpooned body is drawn**, for the two passes that draw something attached to one |
| `packages/render/src/crank-dial.ts` | THE CLAW's crank, drawn: the winder that brings the arm home |
| `packages/render/src/crystal.ts` | THE CRYSTAL: a craft three tiles wide with an electric field round it — the order its parts go on in |
| `packages/render/src/crystal-craft.ts` | THE CRYSTAL's craft: the `SHELL` saucer, the red and cyan engine pods and the canopy over the middle |
| `packages/render/src/crystal-field.ts` | THE CRYSTAL's electric field: arcs crawling round the whole craft, and the hole they open underneath while the shield stands there |
| `packages/render/src/crystal-keel.ts` | THE CRYSTAL's keel: the join's colour on the **underside** of the middle |
| `packages/render/src/touch-drag.ts` | What a hand that already has hold of something says when it moves — a handle carried, a crank turned |
| `packages/render/src/touch-well.ts` | THE WELL's screen as a control: the same two questions `touch.ts` asks of the flat field |
| `packages/render/src/touch-band.ts` | A press on the panel below the field: the buttons, and the two strips |
| `packages/render/src/tile-seed.ts` | The seed a picture of one tile is drawn from |
| `packages/render/src/dart-torch.ts` | WHAT A DART'S THRUST IS DRAWN AS, in a file of its own beside `dart-look.ts` |
| `packages/render/src/dart-shock.ts` | SHOCK — the flame has **structure inside it**: three bright knots strung down its axis |
| `packages/render/src/diastole-draw.ts` | you are drawing THE DIASTOLE — the two chambers above row 0, which seat is shown which one beating, and the bridge parting |
| `packages/render/src/diastole-bridge.ts` | the bundle between THE DIASTOLE's two chambers, and why it never lights on the coincidence |
| `packages/render/src/diastole-clamp.ts` | **THE DIASTOLE's clamp**: the one thing on the twin lobe a hand takes hold of |
| `packages/render/src/diastole-flesh.ts` | **What THE DIASTOLE's chambers are made of**: muscle, lit from above |
| `packages/render/src/magnet-coil.ts` | WHAT THE MAGNET IS DRAWN AS: a solid horseshoe, poles lit from their tips |
| `packages/render/src/magnet-lanes.ts` | Where an intake lane starts and ends, in body radii from the centre |
| `packages/render/src/magnet-look.ts` | THE ONE RECORD A CANDIDATE MAGNET LOOK PATCHES |
| `packages/render/src/magnet-ore.ts` | ORE — THE MAGNET's body as the game draws it since 11 September 2026 |
| `packages/render/src/mount-look.ts` | THE ONE RECORD A CANDIDATE **MOUNT** PATCHES |
| `packages/render/src/mount-bearing.ts` | Where on its wheel a mount stands, for a look that turns with it |
| `packages/render/src/mount-rasp.ts` | RASP — a kept look for THE GYRE's mounts, drawn only on the GRAPHICS page's LIBRARY |
| `packages/render/src/mount-taproot.ts` | TAPROOT — THE GYRE's mount as the game draws it since 11 September 2026 |
| `packages/render/src/moult-ghost.ts` | **What it turns into next, and when** — the navigator's half of THE MOULT |
| `packages/render/src/moult-shape.ts` | **THE MOULT's one contour**: the rock's facets and the pod's blob, blended vertex by vertex |
| `packages/render/src/moult.ts` | THE MOULT, drawn: the form it is wearing **now** on both screens |
| `packages/render/src/balloon-alive.ts` | **What makes THE BALLOON alien**: the film that travels over its skin |
| `packages/render/src/balloon-burst.ts` | **THE BALLOON popping**: the skin the pair stretched, torn into shreds that fly outward and fade in the air |
| `packages/render/src/baton-draw.ts` | THE BATON, drawn: an arm of sockets hanging down the middle column |
| `packages/render/src/baton-bead-draw.ts` | THE BATON's bead — and its second, and the one the two become |
| `packages/render/src/baton-grip.ts` | **THE BATON's own arm as a control**: the shell a thumb strips off a swelling socket |
| `packages/render/src/baton-socket-draw.ts` | **One socket of THE BATON's arm**, drawn |
| `packages/render/src/baton-flesh.ts` | **What THE BATON's arm is made of**: a tendon hung from above the field |
| `packages/render/src/pulse-wash.ts` | **The whole ship lit, by the one body that got past.** A body answered too late is not answered |
| `packages/render/src/pulse-grip.ts` | **THE PULSE's hand on the bar**: the rectangle the meter is drawn in, the box a thumb is answered in |
| `packages/render/src/pull-track.ts` | **A pull is drawn as the way the hand goes, and a big circle where it starts** — every pull handle's thin channel, filling green behind the hand, closed round for a turn |
| `packages/render/src/pull-knob.ts` | **Where a pull starts**: the big circle a thumb goes on (`drawPullKnob`), and `PULL_GRAB`, how far outside it a press is still taken |
| `packages/render/src/pinball-blast.ts` | PINBALL's two loud moments: a ball that hit the ship, and a target taken |
| `packages/render/src/pinball-button.ts` | PINBALL's two presses, as faces on the band's own lobes |
| `packages/render/src/pinball-grip.ts` | **PINBALL's two hands on the table itself**: player 1 winding a spring his own last shot left slack |
| `packages/render/src/pinball-socket.ts` | **The wet socket every piece on PINBALL's table stands in.** The owner, 18 September 2026 |
| `packages/render/src/plate-gap.ts` | A plate of the hull that is **gone**, drawn as a hole in the outline |
| `packages/render/src/beatbox-air.ts` | **The air a soundbox is moving**, which is the half of this creature that has no number in it at all |
| `packages/render/src/hull-light.ts` | who lights the ship, as a record — the seam a candidate light is patched onto, and the one that won |
| `packages/render/src/hull-barrel.ts` | THE SHIP LIT BY ITS OWN NORMAL, instead of by a straight ramp across its box |
| `packages/render/src/hull-break-look.ts` | THE ONE RECORD A CANDIDATE **BREAK IN THE HULL** PATCHES |
| `packages/render/src/hull-break-gape.ts` | The hole shown to have an inside: ribs of the frame standing in the dark where the skin used to be |
| `packages/render/src/hull-break.ts` | **What the ship wears where something went through it.** One call per open hole |
| `packages/render/src/hull-mood.ts` | what the ship is doing this frame — `HullMood`, the eased state of its membrane, and `LobePositions`, where its lobes stand — re-exported from `hull-frame.ts` |
| `packages/render/src/husk-deflate.ts` | **A husk refused: a balloon let go.** The owner asked for this by name on 15 September 2026 |
| `packages/render/src/husk-mark.ts` |  |
| `packages/render/src/husk-look.ts` | How a husk is told from a pod — the one record VERSUS can offer a second answer through |
| `packages/render/src/hive-draw.ts` | **THE HIVE**: the waxen mass over row 0 with a site in every lobe of its underside — the breach's colour on the pilot's screen, the swell on the navigator's |
| `packages/render/src/hive-fx.ts` | What THE HIVE leaves behind a frame: the clench of a wrong colour, the jolt of a seal, and its receipts' bursts |
| `packages/render/src/hive-shape.ts` | Where THE HIVE is, in field pixels: the mass, its sites, the swell's drop, the fade, and every path the drawer strokes |
| `packages/render/src/hive-grip.ts` | **THE HIVE's one handle, offered to whichever seat the mass's state is for** |
| `packages/render/src/hive-hold.ts` | **THE HIVE's two held states, in field pixels**: how far a clench has drawn the mass up out of reach |
| `packages/render/src/hive-cell.ts` | **THE HIVE's lobes and breaches, as wax** (`hive-wax.ts` is the mass) |
| `packages/render/src/hive-wax.ts` | **What THE HIVE is made of**: wax — a dark mass of it, lit from the upper left and gone to the deep beneath |
| `packages/render/src/hit.ts` | **How far past its drawn edge a circle answers a thumb.** Every ring, lobe |
| `packages/render/src/splash-trail.ts` | **Slime off the end of a mouse** — the ink a desk's pointer leaves, as blobs that swell, sag and add up |
| `packages/render/src/beatbox-count.ts` | **What the counter over a soundbox is saying**, as a shape rather than as a drawing — how many slots |
| `packages/render/src/beatbox-silence.ts` | **A soundbox going quiet**, which is the one thing on this creature that goes right and until now was the… |
| `packages/render/src/canvas2d-takeover.ts` | **The two frames that are not the field**, and the clocks that run whether or not one of them is up |
| `packages/render/src/canvas2d-stage.ts` | **The letterbox**: what is drawn in the window but outside the game — the paint either side of a phone-shaped stage, and the hairline saying where the phone ends |
| `packages/render/src/canvas2d-held.ts` | **What a host may reach of the renderer's state**, as the class `Canvas2DRenderer` stands on |
| `packages/render/src/candle-dark.ts` | **THE CANDLE's dark**: the field going black |
| `packages/render/src/candle-glow.ts` | **THE CANDLE's glow**: its health, and the only steady light in the field |
| `packages/render/src/candle-grip.ts` | THE CANDLE's wick: the stem, the ring on the flame and the ember after it |
| `packages/render/src/candle-flame.ts` | **What THE CANDLE's flame is made of**: a flame, the shape a candle's is — a drop standing on its round end |
| `packages/render/src/cairn-settle.ts` | The lane THE CAIRN is about to drop a rock into, drawn on player 1's screen and on nothing player 2 is shown |
| `packages/render/src/cairn-hand.ts` | The hand on THE CAIRN, drawn over the stack by the boss pass — the ordinary ring closed round every stone still standing, and the word PULL |
| `packages/render/src/cairn-look.ts` | THE ONE RECORD A CANDIDATE **PILE** PATCHES |
| `packages/render/src/cairn-pile.ts` | THE CAIRN's pile as the game draws it: seven live fires under one clip |
| `packages/render/src/cairn-slime.ts` | What holds THE CAIRN together: a slime coat, lit seams, strands and a film |
| `packages/render/src/cairn-units.ts` | Where THE CAIRN's stones stand, and the outline they make together |
| `packages/render/src/cairn.ts` | THE CAIRN, drawn: the field's own two-tile rocks stacked in courses, clipped to one silhouette so the seams between them stay countable |
| `packages/render/src/curtain-draw.ts` | THE CURTAIN, drawn: a translucent violet-grey membrane hung across seven columns at `curtainRow` |
| `packages/render/src/curtain-fx.ts` | What THE CURTAIN leaves behind a frame: the sheet falling once it is torn off the rail |
| `packages/render/src/curtain-flesh.ts` | **What THE CURTAIN is made of**: a wet membrane hung from a gathered top edge |
| `packages/render/src/curtain-sheet.ts` | THE CURTAIN's two shapes: the membrane with its hem, and the core |
| `packages/render/src/curtain-grip.ts` | **THE CURTAIN's hem**: the one part of this boss a single thumb takes hold of |
| `packages/render/src/effects-frame.ts` | **What `Effects` does with a frame**, as opposed to what it owns |
| `packages/render/src/splash-blob.ts` | ONE BLOB OF THE MOUSE'S INK — its size, its sag, and how it is put down |
| `packages/render/src/spool-brake.ts` | **The pilot's brake**: a rail hanging outside the brake's flange, a knob on it at the depth his thumb has it |
| `packages/render/src/spool-draw.ts` | **THE SPOOL**: a thread-spool slung sideways across the top of the field |
| `packages/render/src/spool-fx.ts` | What THE SPOOL leaves behind a frame: the **shudder** of the casing when the line slips its zone |
| `packages/render/src/spool-gauge.ts` | **The navigator's gauge**: a track under the barrel, the zone as a bracket in the middle of it |
| `packages/render/src/spool-grip.ts` | **The thumb on THE SPOOL's brake** — half two of the look lane |
| `packages/render/src/spool-line.ts` | **The line**, from the underside of the winding to the hull |
| `packages/render/src/spool-pose.ts` | **How far through a pose THE SPOOL is** — the clock the whole scene is posed off (§21, *Animation*) |
| `packages/render/src/spool-shape.ts` | **Where THE SPOOL is**, in field pixels: the barrel slung sideways across the top of the field |
| `packages/render/src/surface-clear.ts` | **Wiping an overlay whatever transform is on it** — a `clearRect` under a ratio below one misses the right edge |
| `packages/render/src/surge-draw.ts` | **THE SURGE**: a ribbed bulb hung high over the middle of the field with a seam round its equator |
| `packages/render/src/surge-fx.ts` | What THE SURGE leaves behind a frame: the row the bulb sinks through after a vent |
| `packages/render/src/surge-flesh.ts` | **What THE SURGE is made of**: a sac of membrane blown tight |
| `packages/render/src/surge-gauge.ts` | **THE SURGE's seam**: the dark line round the bulb's equator, and the gauge read along it by seat (§11.28) |
| `packages/render/src/surge-grip.ts` | **THE SURGE's one handle, taken by both seats**: the bulb itself |
| `packages/render/src/surge-shape.ts` | **Where THE SURGE is**, in field pixels: the bulb's centre, its two radii, its outline |
| `packages/render/src/surge-word.ts` | **What THE SURGE is asking of one thumb**, and the three silences beside the one that shipped |
| `packages/render/src/unseen.ts` | **A frame with the bodies neither screen may draw taken out of it** — once, for every pass under it |
| `packages/render/src/undertow-draw.ts` | THE UNDERTOW, on the ship: the plate bowing, the seams lit, the breach parted |
| `packages/render/src/undertow-lobe.ts` | THE UNDERTOW's lobes and, once, its body — the half of the boss that is *above* the hull line |
| `packages/render/src/undertow-shape.ts` | THE UNDERTOW's geometry: how far a plate has risen, how high a lobe stands, how wide a breach is |
| `packages/render/src/undertow-seam.ts` | THE UNDERTOW's seam: the skin lifted between two x's, the violet light under it |
| `packages/render/src/undertow-fx.ts` | What THE UNDERTOW leaves behind a frame: **the plate closing** under a cannon slid off in time |
| `packages/render/src/undertow-flesh.ts` | **What THE UNDERTOW is made of** where it comes up through the plating: a slime lobe, wet |
| `packages/render/src/undertow-grip.ts` | **THE UNDERTOW's two hands**, and the circles the drawing and the hit test share |
| `packages/render/src/undertow-grip-place.ts` | **THE UNDERTOW's two hands**, and the circles the drawing and the hit test share |

### packages/net

| Path | One line |
|---|---|
| `packages/net/src/protocol.ts` | every message that crosses the wire, and how to distrust one |
| `packages/net/src/lockstep.ts` | delayed lockstep: the promise each device makes to the other |
| `packages/net/src/lockstep-options.ts` | What a `Lockstep` is built with, and the one bound it enforces on the peer |
| `packages/net/src/clock.ts` | four-timestamp clock sync, median, moved gently |
| `packages/net/src/desync.ts` | the fingerprint ledger — where `hash.ts` finally gets used |
| `packages/net/src/status.ts` | what the network indicator may say, and nothing else may |
| `packages/net/src/seat-hold.ts` | how long a room holds a seat for a socket that has stopped answering — `SEAT_HELD_MS`, read by the room that evicts and by the phone that reaches back across the same window |
| `packages/net/src/room-code.ts` | the four characters two people read to each other |
| `packages/net/src/command-codec.ts` | Every `Command` variant, checked field by field, before it ever reaches a `Lockstep` or a simulation tick |
| `packages/net/src/command-fields.ts` | the shape of every field a `Command` can carry on the wire — a colour, a column, a tick, a signed pull — one predicate each, for the decoder to ask for by name |
| `packages/net/src/delay.ts` | How far ahead of the screen a press is scheduled — chosen from the link that is actually there, rather than |
| `packages/net/src/nickname.ts` | A player's name: what the other phone calls them |
| `packages/net/src/protocol-decode.ts` | The distrusting half of the wire |

### packages/audio

| Path | One line |
|---|---|
| `packages/audio/src/types.ts` | what a sound is made of: layers, families, `bound` or `spare` |
| `packages/audio/src/grain.ts` | the grains — the instruments every sound is stacked from |
| `packages/audio/src/band.ts` | the speech band, kept clear, as something that can fail |
| `packages/audio/src/plan.ts` | a sound flattened to voices with absolute times — pure, so it is testable |
| `packages/audio/src/engine.ts` | the only file with an `AudioContext` in it |
| `packages/audio/src/catalogue.ts` | every sound in one list, and the only way to reach one |
| `packages/audio/src/bind.ts` | one `SimEvent` to one cue: id, pan, pitch |
| `packages/audio/src/mixer.ts` | the game's ear: events, plus the state the sim never reports |
| `packages/audio/src/memory.ts` | the one frame of world the mixer remembers, and why clearing it matters |
| `packages/audio/src/sounds/` | the catalogue itself, one file per family |
| `packages/audio/src/bind-creatures.ts` | What one **body** did, as a sound: armour chipping, a covering coming off, a disguise leaving on its own, a |
| `packages/audio/src/music/cells.ts` | The instruments a theme is played on |
| `packages/audio/src/music/deep-cells.ts` | The three cells the deep-water pieces added, and nothing else |
| `packages/audio/src/music/deep.ts` | Three pieces for a deep sea underground: TIDE, CAVERN, SILT |
| `packages/audio/src/music/drift.ts` | `line` and `pulse`, with the grid taken out |
| `packages/audio/src/music/model.ts` | A piece of music, written the way a sound is: numbers, not a recording |
| `packages/audio/src/music/player.ts` | Playing a theme, one second at a time |
| `packages/audio/src/music/themes.ts` | Nine pieces of music, none of which the game plays — the six below, and the three `deep.ts` adds |
| `packages/audio/src/mixer-boss.ts` | the bosses' clocks, heard by comparing frames rather than by an event |
| `packages/audio/src/bind-carom.ts` | **What THE CAROM and the body it throws out sound like**: a wall, a crack, an ejection and a canopy |
| `packages/audio/src/bind-candle.ts` | THE CANDLE's seven, in a file of their own for `bind-undertow.ts`' reason |
| `packages/audio/src/bind-volley.ts` | **What THE VOLLEY sounds like**: a ward that sends it back |
| `packages/audio/src/bind-fleet.ts` | **What THE FLEET sounds like**: a salvo leaving the cannon, and the water |
| `packages/audio/src/bind-breach.ts` | What a hull breach sounds like, split by what it cost rather than by what hit |
| `packages/audio/src/bind-crawler.ts` | THE CRAWLER's two endings, as sounds |
| `packages/audio/src/bind-lookups.ts` | The two id-to-id tables `bind.ts` reads, and the only *data* in a file that is otherwise a switch |
| `packages/audio/src/bind-ledger.ts` | THE LEDGER's eleven, in a file of their own for `bind-taster.ts`' reason |
| `packages/audio/src/bind-lead.ts` | THE LEAD's fourteen, in a file of their own for `bind-gorge.ts`' reason |
| `packages/audio/src/bind-fence.ts` | **What THE FENCE sounds like**: the wire going over the ship, and a bolt cutting a way through it |
| `packages/audio/src/bind-filament.ts` | THE FILAMENT's ten, in a file of their own for `bind-gorge.ts`' reason |
| `packages/audio/src/bind-place.ts` | **Where a sound is**: a column as a stereo position, and a row as a pitch |
| `packages/audio/src/bind-pod.ts` | **What the one thing on the field that is *taken* sounds like** |
| `packages/audio/src/bind-pinball-hand.ts` | PINBALL's two hands on the table, in a file of their own for `bind-snake-body.ts`' reason |
| `packages/audio/src/bind-pulse-hand.ts` | THE PULSE's hand on the bar, in a file of their own for `bind-scout-hand.ts`' reason — `bind.ts` is full |
| `packages/audio/src/bind-coil.ts` | **THE COIL's two, as sounds**: a dome coming off, and the charge it was holding leaving for the next one |
| `packages/audio/src/bind-cue.ts` | **What one sound-to-be is**: an id out of the catalogue, where it sits in the stereo field |
| `packages/audio/src/bind-curtain.ts` | THE CURTAIN's thirteen, in a file of their own for `bind-gorge.ts`' reason |
| `packages/audio/src/bind-veil.ts` | THE VEIL's three, as sounds |
| `packages/audio/src/bind-vane.ts` | THE VANE's two hands on its own mechanism, in a file of their own for `bind-warden-hand.ts`' reason |
| `packages/audio/src/bind-choir.ts` | THE CHOIR's three, in a file of its own |
| `packages/audio/src/bind-choreographed.ts` | The choreographed bosses' events (`docs/spec/bosses-choreographed.md`) |
| `packages/audio/src/bind-choreographed-b.ts` | **The hands the §6.2 lanes added to bosses that had already shipped** |
| `packages/audio/src/bind-choreographed-c.ts` | **The tail of `bind-choreographed.ts`** |
| `packages/audio/src/bind-cling.ts` | THE LIMPET's and THE LEECH's four, in a file of their own on `bind-gum.ts`'s pattern |
| `packages/audio/src/mixer-pulse.ts` | THE PULSE's song, played off the simulation's own clock |
| `packages/audio/src/mixer-handover.ts` | THE HANDOVER, heard: the beat the panels change screens, and the beat they come back |
| `packages/audio/src/bind-beatbox.ts` | THE BEATBOX's three, in a file of its own — `bind-choir.ts` is the pattern and this is the fourth of them |
| `packages/audio/src/bind-balloon.ts` | THE BALLOON's three, in a file of its own — `bind-choir.ts` is the pattern and this is the fourth of them |
| `packages/audio/src/bind-baton.ts` | THE BATON's sixteen, in a file of their own because `bind.ts` is at its limit |
| `packages/audio/src/bind-gum.ts` | THE GUM's one, in a file of its own on `bind-balloon.ts`'s pattern |
| `packages/audio/src/bind-gorge.ts` | THE GORGE's nine, in a file of their own for `bind-candle.ts`' reason |
| `packages/audio/src/bind-gauge.ts` | THE GAUGE's four, in a file of their own for `bind-pulse-hand.ts`'s reason |
| `packages/audio/src/bind-gimbal.ts` | THE GIMBAL's ten, in a file of their own for `bind-gorge.ts`' reason |
| `packages/audio/src/bind-mirror.ts` | THE MIRROR's four and THE MAZE's four |
| `packages/audio/src/bind-handed.ts` | The bodies a hand answers, heard: a weight giving between two thumbs and a pile losing a rock, pulled or shed |
| `packages/audio/src/bind-hasp.ts` | THE HASP's fourteen, in a file of their own for `bind-gorge.ts`' reason |
| `packages/audio/src/bind-hive.ts` | THE HIVE's twelve, in a file of their own for `bind-gorge.ts`' reason |
| `packages/audio/src/bind-splice.ts` | **What THE SPLICE sounds like**: a straw drawn on, and what comes down it |
| `packages/audio/src/bind-spool.ts` | THE SPOOL's eleven, in a file of their own so the page that routes them stays a switch |
| `packages/audio/src/bind-sinew.ts` | THE SINEW's thirteen, in a file of their own for `bind-gorge.ts`' reason |
| `packages/audio/src/bind-surge.ts` | THE SURGE's thirteen, in a file of their own for `bind-gorge.ts`' reason |
| `packages/audio/src/bind-scuttle.ts` | THE SCUTTLE's ten, in a file of their own for `bind-gorge.ts`' reason |
| `packages/audio/src/bind-scout-hand.ts` | THE SCOUT's two hands on its picture, in a file of their own for `bind-pinball-hand.ts`' reason |
| `packages/audio/src/bind-stare.ts` | THE STARE's three, in a file of their own for `bind-gorge.ts`' reason |
| `packages/audio/src/bind-snake-body.ts` | SNAKE's two hands on its own body, in a file of their own for `bind-vane.ts`' reason — `bind.ts` is full |
| `packages/audio/src/bind-impact.ts` | **What a shot meeting a body sounds like** — the six the whole game is made of |
| `packages/audio/src/bind-instar.ts` | THE INSTAR's eleven, in a file of their own for `bind-gorge.ts`' reason |
| `packages/audio/src/bind-warden.ts` | THE WARDEN's four, cut out of `bind.ts` when THE BATON took that file past its 250-line limit |
| `packages/audio/src/bind-warden-hand.ts` | THE WARDEN's hold, throw and slam, cued at the hatch's column |
| `packages/audio/src/bind-well.ts` | THE WELL's four, in a file of their own for `bind-gauge.ts`'s reason — `bind-choreographed-b.ts` is full |
| `packages/audio/src/bind-undertow.ts` | THE UNDERTOW's nine, in a file of their own for `bind-baton.ts`' reason — and along the seam the fight has |
| `packages/audio/src/bind-taster.ts` | THE TASTER's twelve, in a file of their own for `bind-gorge.ts`' reason |
| `packages/audio/src/bind-throat.ts` | THE THROAT's two hands on the gullet itself, in a file of their own for `bind-vane.ts`' reason |
| `packages/audio/src/bind-antiphon.ts` | THE ANTIPHON's ten, in a file of their own for `bind-scuttle.ts`' reason |
| `packages/audio/src/bind-diastole.ts` | THE DIASTOLE's two, in a file of their own for `bind-gorge.ts`' reason |
| `packages/audio/src/bind-ratchet.ts` | THE RATCHET's twelve, in a file of their own for `bind-gorge.ts`' reason |

### apps/game

| Path | One line |
|---|---|
| `apps/game/src/main.ts` | wiring: world, renderer, input, loop |
| `apps/game/src/main-shell.ts` | What `main.ts` hands `bindShell` — beside `main.ts` rather than inside it, `shell-menu.ts`'s own reason |
| `apps/game/src/main-world.ts` | **The world's opening**: the config this build plays at, the world built on it |
| `apps/game/src/waves.ts` | the two ways a wave starts, and the banner that names it |
| `apps/game/src/welcome.ts` | the page before a device's first tutorial: once per device, pressed away, the film held on its first frame under it |
| `apps/game/src/audio.ts` | the mixer wired to the loop: unlock on a gesture, clear on a restart, M to mute |
| `apps/game/src/at-a-desk.ts` | **Whether the person holding this is at a desk**, asked in one place |
| `apps/game/src/awake.ts` | Keeping the screen on while the world ticks |
| `apps/game/src/loop.ts` | fixed timestep; the only place wall-clock time exists |
| `apps/game/src/lost.ts` | The two presses on a lost wave's screen: RETRY WAVE and QUIT (`render/lost-screen.ts`) |
| `apps/game/src/viewport.ts` | the window's size, and the stage and layout derived from it |
| `apps/game/src/input.ts` | pointers and capture; what a touch *means* is `touch.ts` |
| `apps/game/src/field-input.ts` | Everything a finger on the glass reaches: the field itself, a shake |
| `apps/game/src/keys.ts` | commands from the keyboard — the test rig, not the game |
| `apps/game/src/testing.ts` | pause, wave skip and the tuning sliders |
| `apps/game/src/link.ts` | solo or two devices: the clock, the scheduler, beat zero |
| `apps/game/src/relay.ts` | the socket, and only the socket |
| `apps/game/src/join.ts` | the room screen, paired with the network indicator (`join-chip.ts`) — four steps, one question each |
| `apps/game/src/menu.ts` | the main menu, which is the front door: three rows, the link, the seat and the two-step in front of LEAVE ROOM |
| `apps/game/src/menu-view.ts` | the shell, the root page's entries, and the seat as three cards |
| `apps/game/src/briefing.ts` | the thumb on a wave's guide |
| `apps/game/src/back-ask.ts` | **The phone's back gesture asks rather than leaves**: three answers over the field, on one history entry pushed back on every pop |
| `apps/game/src/demo-menu.ts` | the DEMOS page: one row per mechanic, read out of `DEMONSTRATIONS` |
| `apps/game/src/guide-swipe.ts` | a thumb dragged across a guide, read as a page turn: left is back, right is next |
| `apps/game/src/handle.ts` | `window.neonSpore` — the handle a headless check drives the game by |
| `apps/game/src/handle-press.ts` | **The handle's two verbs about a press**: sending one, and asking first whether it would be heard |
| `apps/game/src/key-hint.ts` | a keyboard hint for the player who sits at a PC with no panel to read the keys off |
| `apps/game/src/raster.ts` | the baked burst, in the real game, behind a flag |
| `apps/game/src/view.ts` | the view switch, always on screen |
| `apps/game/src/install.ts` | The home-screen shortcut, and the service worker that makes one possible |
| `apps/game/src/link-run.ts` | Beats between fingerprint exchanges |
| `apps/game/src/link-run-types.ts` | The run's two shapes — what it is built from and what it answers |
| `apps/game/src/link-socket.ts` | Milliseconds before a socket that went away is reached for again |
| `apps/game/src/link-refusal.ts` | What a room turning this device away means, as three rules and no state |
| `apps/game/src/hold.ts` | the card that comes up when the line goes bad, with a clock on it |
| `apps/game/src/join-words.ts` | the words the network wears — the chip's, the room screen's, the seat pills' |
| `apps/game/src/link-report.ts` | what the screen is told about the link, gathered in one place |
| `apps/game/src/menu-pages.ts` | the menu's two jump lists, and the level page whose heading says whose tempo it is |
| `apps/game/src/menu-parts.ts` | the pieces every menu page is made of, and the wordmark's spore |
| `apps/game/src/run-state.ts` | whether the world ticks, and which of the four holds is on it |
| `apps/game/src/shell.ts` | everything around the field: menu, room screen, bad-line card, and the link |
| `apps/game/src/shell-menu.ts` | What the shell hands the menu — beside `shell.ts` rather than inside it |
| `apps/game/build.ts` | What `bun build ./index.html --outdir=dist --minify --sourcemap` used to be, as a script |
| `apps/game/preview.ts` | Which checkout this one serves |
| `apps/game/src/confirm.ts` | A button that hangs up on somebody else, and asks once before it does |
| `apps/game/src/coalesced.ts` | Every position a `pointermove` actually carries, not just the last one |
| `apps/game/src/canvas-sheets.ts` | The two pages drawn on the game's own canvas over a frame |
| `apps/game/src/link-clock.ts` | The room's wall clock: the only part of the game that asks what time it is |
| `apps/game/src/progress.ts` | How far this device has got, kept on this device |
| `apps/game/src/press-lag-page.ts` | `?lag=1`: the wait between a thumb and the field answering it, in the corner |
| `apps/game/src/press-lag.ts` | How long a thumb waits for the field: the touch event's own time to the frame that shows its tick, worst of the last hundred |
| `apps/game/src/menu-entries.ts` | The rows on the menu's three lists — the front page, the PLAY page and the rig — in the order they are read |
| `apps/game/src/haptics.ts` | A buzz for the two things a player must not miss |
| `apps/game/src/hello.ts` | THE FIRST THING A DEVICE IS ASKED, ONCE THE SCENE HAS PLAYED |
| `apps/game/src/hidden-hold.ts` | **The tab going away is a hold** (`run-state.ts`), and this is where it is put down and taken off |
| `apps/game/src/settings.ts` | The things a player turns on and off, kept on their own device |
| `apps/game/src/link-types.ts` | What a link is asked for, and what it offers back |
| `apps/game/src/link-ask.ts` | **What a phone asks the room for**, and nothing it is told |
| `apps/game/src/last-room.ts` | **The room this device was in a moment ago.** A phone that reloads loses everything about the room it was… |
| `apps/game/src/join-name.ts` | "What are you called?", asked once, on the room screen |
| `apps/game/src/join-link.ts` | a room's code and the two things that happen to one on a phone — drawn fresh, or read off the link the page was opened on |
| `apps/game/src/join-step-view.ts` | the chrome around whichever of the room screen's four steps is up — the blocks, the heading, the one way back |
| `apps/game/src/join-steps.ts` | the room screen one step at a time — which of the four a device is on, and what that step says |
| `apps/game/src/join-room-step.ts` | What step 4 can ask of the link — the room-shaping half of `JoinBindings` |
| `apps/game/src/join-room.ts` | The rules of step 4, THE ROOM: who may shape it, and what each READY circle is doing |
| `apps/game/src/join-chip.ts` | The corner chip: the network indicator, and the door back into the room screen for a player already in one |
| `apps/game/src/nickname.ts` | This device's player name: asked once, kept here, carried into every room |
| `apps/game/src/origin.ts` | Where the server lives, for both things that talk to it |
| `apps/game/src/pairing.ts` | The way *back* into a room, for two people who have played before |
| `apps/game/src/partners.ts` | WHAT A DEVICE REMEMBERS ABOUT THE PEOPLE IT HAS PLAYED WITH, and the rules for changing that list |
| `apps/game/src/menu-settings.ts` | The one durable place for "things about me" |
| `apps/game/src/menu-controls.ts` | what a thumb does, every panel the game has, the field itself, then the keys |
| `apps/game/src/input-bindings.ts` | what the pointer rig is handed, and why each of it is read fresh |
| `apps/game/src/input-buffer.ts` | the queue every listener in the app writes into, drained a tick at a time |
| `apps/game/src/ship-hand.ts` | what this device's own hand is doing on the ship, between the event and the frame |
| `apps/game/src/tally.ts` | the run mark — wave, clock, retries — up to the room every few seconds |
| `apps/game/src/menu-link.ts` | what a link changes on the front page: eight entries, the progress line, the seat lock |
| `apps/game/src/menu-seats.ts` | the seat, as three cards with the job written on each, and the lock a room puts on them |
| `apps/game/src/menu-sign-in.ts` | The settings row that makes a name survive the phone |
| `apps/game/src/menu-steps.ts` | the questions the menu asks in place — LEAVE ROOM's and the one in front of each difficulty — and the two moments they are put away again |
| `apps/game/src/keys-guide.ts` | What a key means while a wave's guide is up, at a desk |
| `apps/game/src/intro.ts` | THE ONE SCENE A PAIR SEES BEFORE THEY HAVE CHOSEN ANYTHING |
| `apps/game/src/frame.ts` | WHAT HAPPENS EVERY TICK, AND WHAT HAPPENS EVERY FRAME |
| `apps/game/src/fullscreen.ts` | **The browser's own furniture, off the screen** — one call |
| `apps/game/src/interpolate.ts` | the picture drawn between ticks rather than on them, behind `?interpolate=1` |
| `apps/game/src/perf-page.ts` | The readout `?perf=1` puts on the screen |
| `apps/game/src/perf-sweep.ts` | The performance sweep, run **inside the page**, on the device the game is for |
| `apps/game/src/menu-idle.ts` | `?menuidle=<hz>` — how often the field is repainted while the main menu is up |
| `apps/game/src/menu-door.ts` | Whether a URL opens on the menu or goes straight to the field |
| `apps/game/src/menu-bindings.ts` | **What the menu is handed, and what it hands back** — the shape, away from the knot that reads one |
| `apps/game/src/menu-who.ts` | The line at the top of the PLAY page saying who this phone is |
| `apps/game/src/menu-wave-filter.ts` | The filter over the JUMP TO WAVE list |
| `apps/game/src/menu-rows.ts` | the rows an entry list is drawn as, and the map that finds one again by key — beside `menu-view.ts` |
| `apps/game/src/menu-rejoin.ts` | **The way straight back into the room this device was just in**, at the top of the front page |
| `apps/game/src/menu-toggles.ts` | SETTINGS' switches: the three things about this device a person may turn on and off |
| `apps/game/src/keys-grip.ts` | what the desk rig's grip key takes hold of, and how it carries it |
| `apps/game/src/keys-slide.ts` | The desk keys that slide a swelling, and keep sliding while held |
| `apps/game/src/keys-turn.ts` | The desk keyboard's two keys that stand in for a hand **going round in a circle** |
| `apps/game/src/shake.ts` | the device being shaken, which is THE CHOIR's control and the only input that is not a finger on the glass |
| `apps/game/src/sign-in-config.ts` | The Firebase project the game signs in against — the owner's to paste |
| `apps/game/src/sign-in-standin.ts` | A signed-in person with no Google behind them, so a check can be one |
| `apps/game/src/sign-in.ts` | Who is holding this phone, proved by Google or by an email link |
| `apps/game/src/safe-area.ts` | The strips of the screen the phone keeps for itself, in numbers |
| `apps/game/src/trail.ts` | The surface the mouse's ink is drawn on, over every sheet, and nothing at all on a phone |
| `apps/game/src/tick-rate.ts` |  |
| `apps/game/src/quit.ts` | Who pressed QUIT on the lost screen, for the menu to say |

### apps/server

| Path | One line |
|---|---|
| `apps/server/src/index.ts` | the worker: `/room/:code` and `/net/health` |
| `apps/server/src/room.ts` | the Durable Object — seats, beat zero, relay, clock sync |
| `apps/server/src/seat.ts` | A seat, and everything one does to a socket that holds one |
| `apps/server/dev.ts` | `wrangler dev`, on a port that belongs to this tree |
| `apps/server/src/start-gate.ts` | The two presses that stand between a full room and beat zero |
| `apps/server/src/sign-in.ts` | Who signed in, read off a Firebase ID token — checked here, never trusted |
| `apps/server/src/room-start.ts` | The gate's two sockets-facing halves: telling both phones who has pressed |
| `apps/server/src/room-seat.ts` | **Who holds which seat, once the pair have a say in it.** A seat was the room's arrival order |
| `apps/server/src/names.ts` | The name registry: one Durable Object holding every claimed name |
| `apps/server/src/room-open.ts` | Everything that must be true before a socket is worth accepting, in the order it is worth being false in |
| `apps/server/src/room-tally.ts` | The tally's storage half, and giving up on a run nobody is playing |
| `apps/server/src/room-tell.ts` | **What the room tells its seats** when somebody arrives or leaves: the welcome, and the count after a seat goes |
| `apps/server/src/room-route.ts` | what the room does with each message a seat sends — answer a ping, relay an input, take a press, keep a level or a tally — the one switch that grows per message |
| `apps/server/src/room-acts.ts` | **The three acts that change what the room remembers** — a tempo, a seat, a tally |
| `apps/server/src/room-memory.ts` | **What a room remembers**: the six facts that must outlive hibernation |
| `apps/server/src/tally.ts` | What a pair got to, kept by the room they share: the further wave, then fewer retries, then less time |

### tools

| Path | One line |
|---|---|
| `tools/director/src/grid.ts` | the beat grid a wave is placed on |
| `tools/director/src/stage.ts` | the wave, playing, in the shape the phone draws |
| `tools/director/src/stage-touch.ts` | the stage played rather than edited — the game's own controls |
| `tools/director/src/brushes.ts` | the palette's rows — a label, a stroke, subjects and a note per brush |
| `tools/director/src/palette.ts` | the brush bar drawn from `brushes.ts`, grouped and with `hidden` applied |
| `tools/director/src/entry-fields.ts` | what one arrival can say about itself: a rock's speed and width, a body's colour |
| `tools/director/src/cell-config.ts` | those fields as rows under the selected cell |
| `tools/director/src/balance.ts` | the live balance sheet, as numbers |
| `tools/director/src/ship.ts` | what the ship can do, read off SimConfig |
| `tools/director/src/boss.ts` | the boss panel: which boss the wave carries, and its knobs |
| `tools/director/src/simon-editor.ts` | THE MIRROR's rounds, edited as lists of controls |
| `tools/director/src/roster.ts` | the unbuilt bestiary and the bosses, parsed out of the spec |
| `tools/director/src/roster-parse.ts` | the bestiary table and the act order's paragraph, read into rows, and `isBuilt` — whether the simulation has a name the spec argues about |
| `tools/director/src/sound-page.ts` | THE SOUND CATALOGUE sheet: every sound, playable, bound or unspent |
| `tools/director/src/sound-link.ts` | what a sound is attached to, and the five that are attached to nothing |
| `tools/director/src/sound-art.ts` | that subject drawn — a contour or a control glyph, never an invented icon |
| `tools/director/src/sound-plot.ts` | a sound as time against frequency, with the speech band shaded |
| `tools/director/src/backlog-page.ts` | the NOT BUILT YET sheet, and which panel each of its tabs is |
| `tools/director/src/backlog.ts` | the one page NOT BUILT YET is arranged into, cut to what is not implemented yet |
| `tools/director/src/backlog-api.ts` | `GET /api/backlog`: two spec files read, parsed and joined into one response |
| `tools/director/src/sections.ts` | the "## N Title — tail" shape shared by several spec files |
| `tools/director/src/concepts.ts` | couplings, assist forms, unbuilt systems and the idea store |
| `tools/director/src/shapes-panel.ts` | the shape catalogue: drafts, then spare, then spent |
| `tools/director/src/shapes-motion.ts` | a sway in tiles turned into a card that does not clip |
| `tools/director/src/serialize.ts` | one act's wave array, written back into its own `waves/act-*.ts` |
| `tools/director/src/waves-api.ts` | `GET`/`PUT /api/waves`, and the base-revision token that refuses a clobber |
| `tools/director/src/waves-io.ts` | the page's half of that: load, save, and the token it holds in between |
| `tools/shape-sheet/src/subjects.ts` | every silhouette as a function of time |
| `tools/shape-sheet/src/catalogue.ts` | drawn, spare and drafted — which shapes are spendable |
| `tools/shape-sheet/src/candidates.ts` | EVERY CONTOUR CANDIDATE, AS A SHAPE THAT CAN BE MEASURED |
| `tools/shape-sheet/src/forms/` | contour forms the game has no creature for yet |
| `tools/shape-sheet/src/motions.ts` | the spare motions, unclaimed by anything |
| `tools/shape-sheet/src/drafts/` | a shape per open idea, and what each is offered to |
| `tools/orphans/orphans.ts` | a mechanic that is built and reached by nothing, with where to fix it |
| `tools/director/src/orphans-panel.ts` | the ORPHANS sheet, painted red the moment the count leaves zero |
| `tools/land/land.ts` | whether a lane can land on a linear trunk, and what that would do |
| `tools/land/ledger-merge.ts` | merging the ledger when a lane and the trunk both appended; a record loses no row |
| `tools/land/notes.ts` | a landed commit turned into a release note, and where it goes in the file |
| `tools/land/notes-merge.ts` | Merging `docs/release-notes.md` when two trunks both moved This conflict is not between two lanes and the… |
| `tools/land/note-commit.ts` | The two files a landing writes at the moment `main` moves, and the one commit that carries them |
| `tools/land/worktree.ts` | removing a worktree on Windows, verified rather than trusted, and when |
| `tools/director/src/notes.ts` | `docs/release-notes.md` parsed into entries, grouped by day |
| `tools/director/src/notes-page.ts` | the RELEASE NOTES sheet — read-only, no buttons, no count |
| `tools/director/src/dom.ts` | `el` and `button`, the two helpers every panel builds rows out of |
| `tools/ports.ts` | which port a server takes, and whose tree it serves |
| `tools/relay-check/check.ts` | two headless devices against a real relay |
| `tools/relay-check/all.ts` | **The four relay checks, against a wrangler this script starts and stops.** `bun run relay:check` wants a… |
| `tools/delegate/run.ts` | the one command that hands a spec to the worker |
| `tools/delegate/mentions.ts` | the paths a spec names, handed over read-only |
| `tools/delegate/ignored.ts` | what `.aiderignore` keeps out of the worker's reach |
| `tools/build-stamp.ts` | The day the bundle in front of you was built |
| `tools/delegate/timeout.ts` | Aider has no run-level limit of its own |
| `tools/dev/supervise.ts` | `bun run dev` — a hot server, and a hand on its shoulder |
| `tools/dev/tree-moves.ts` | When the working tree was rewritten under a running server, and by whom |
| `tools/dev/here.ts` | `bun run here` — say which tree the next `director-here` or `game-here` should serve |
| `tools/dev/preview-here.ts` | `bun run preview:here` — the built game, from the tree `bun run here` last named |
| `tools/director/build.ts` | Builds the director the way `apps/game/preview.ts` builds the game: a static bundle |
| `tools/director/server.ts` | The director's server |
| `tools/director/shapes-page.ts` | Build the shape catalogue into one self-contained page |
| `tools/director/shapes-still.ts` | Draw a skin without starting anything |
| `tools/director/src/backlog-tabs.ts` | The tabs of the NOT BUILT YET sheet that are drawn on first sight rather than on first open |
| `tools/director/src/backlog-entry.ts` | One card on the NOT BUILT YET page: the name, its frame, the plain-English rows |
| `tools/director/src/backlog-bosses.ts` | The BOSSES page of the NOT BUILT YET sheet: what is left to do on a boss |
| `tools/director/src/boss-cycles.ts` | The two boss panels that are mostly a cycle, and the chrome all of them share |
| `tools/director/src/boss-nothing.ts` | **The bosses with nothing on this panel to author**, and the reason for each |
| `tools/director/src/boss-states.ts` | **Every state every boss can be in**, by name |
| `tools/director/src/boss-hands-beats.ts` | **The pair's hands on the bosses a beat answers** — THE DIASTOLE, THE BATON, THE THROAT |
| `tools/director/src/boss-hands-shots.ts` | **The pair's hands on the bosses a shot answers** — THE WARDEN, THE VANE, THE ORRERY, THE CANDLE |
| `tools/director/src/boss-hands-snake.ts` | **SNAKE's own hand** — the body has no bearing to steer by, THE MAZE's or THE SCOUT's kind |
| `tools/director/src/boss-hands-spool.ts` | **THE SPOOL played right**, for the STATES sheet: the brake held at the depth this leg's rate asks for |
| `tools/director/src/boss-hands-scout.ts` | **THE SCOUT's own hand** — the flight test's stupid autopilot, holding any burn that two beats of flying on would be caught after |
| `tools/director/src/boss-hands-clocks.ts` | **The pair's hands on the bosses that keep a ledger of their own** — THE TASTER, THE LEDGER, THE LEAD |
| `tools/director/src/boss-hands-field.ts` | **The pair's hands on the bosses of the field** — THE GORGE, THE CURTAIN, THE SCUTTLE |
| `tools/director/src/boss-hands-handles.ts` | **The pair's hands on the bosses a handle answers** — THE SINEW, THE SURGE, THE INSTAR |
| `tools/director/src/boss-hands-hasp.ts` | **THE HASP played right**, for the STATES sheet: the latch kept down and the wheel kept turning |
| `tools/director/src/boss-hands-takes.ts` | **The pair's hands on the bosses a taking answers** — THE CAIRN, THE SPLICE, THE UNDERTOW, THE ANTIPHON |
| `tools/director/src/boss-hands-rounds.ts` | **The pair's hands on the rounds a hand has to play** — THE MAZE, THE MIRROR's pin |
| `tools/director/src/boss-hands-ratchet.ts` | **THE RATCHET played right, and played blind**, for the STATES sheet |
| `tools/director/src/boss-hands-queen.ts` | **The pair's hands on THE BULB QUEEN** |
| `tools/director/src/boss-hands-well.ts` | **The pilot's thumb on THE WELL's seam** |
| `tools/director/src/boss-hands-gauge.ts` | **THE GAUGE's hands**, in a file of their own |
| `tools/director/src/boss-hands-gimbal.ts` | **THE GIMBAL played right**, for the STATES sheet: both rings carried onto their own marks and held there |
| `tools/director/src/boss-hand-fleet.ts` | **The pair's hands on THE FLEET**, a `Hand` (`poses-bosses-kit.ts`) |
| `tools/director/src/boss-hand-hive.ts` | **The pair's hands on THE HIVE**, a `Hand` (`poses-bosses-kit.ts`) |
| `tools/director/src/boss-type-field.ts` | **Special or normal**, on the waves that carry a boss — the picker and the sentence saying what the pick means |
| `tools/director/src/brush-art.ts` | A brush's own picture, kept: the body it paints, drawn by the shipping renderer, on nothing |
| `tools/director/src/brush-category.ts` | Which brush categories (`BRUSH_GROUPS` in brush-groups.ts — CANNON, SHIELD, MIXED |
| `tools/director/src/brush-frame.ts` | The frame a brush's specimen is photographed through, and the places a crop can be centred on |
| `tools/director/src/brush-groups.ts` | How the palette is divided into sections |
| `tools/director/src/brush-poses.ts` | The moment each brush is photographed at |
| `tools/director/src/brush-tooltip.ts` | How big the hover card's picture is |
| `tools/director/src/brush-trim.ts` | Cutting a drawn body out of the black it was drawn on |
| `tools/director/src/brush-wave.ts` | Which wave a brush is first seen in, and how to get there |
| `tools/director/src/cell-panel.ts` | The panel under the map: what the selected cell holds, and what can be done to it |
| `tools/director/src/column-resize.ts` | Every top-level column of `<main>` can be dragged wider or narrower by its right-hand edge |
| `tools/director/src/column-width.ts` | A column's dragged width, in pixels |
| `tools/director/src/columns.ts` | Every top-level column in the director's `<main>` can be put away as one unit |
| `tools/director/src/concept-art.ts` | The picture beside a planned concept |
| `tools/director/src/controlsets-page.ts` | CONTROLS: every registered panel, drawn, plus the things the pair touches on the field itself |
| `tools/director/src/documentation-rooms.ts` | DOCUMENTATION's lazy rooms, bound in one place |
| `tools/director/src/difficulty-picker.ts` | **THE THREE TEMPI A PAIR CAN CHOOSE, beside the field rather than behind a slider.** The owner asked for this… |
| `tools/director/src/field-controls-page.ts` | The other half of the CONTROLS tab (`controlsets-page.ts`) — split out on line count |
| `tools/director/src/field-controls-pulse.ts` | **THE PULSE's bar**, in a file of its own, the split every boss since THE INSTAR has made |
| `tools/director/src/field-controls-pinball.ts` | **PINBALL's two hands on its own table**, in a file of its own, the split every boss since THE INSTAR has made |
| `tools/director/src/fleet-editor.ts` | THE FLEET's placement, edited on the chart the pair will play it on |
| `tools/director/src/glows/aura.ts` | A ring standing clear of the body, pulsing |
| `tools/director/src/glows/bloom.ts` | Optical glare: bright pixels bleeding softly into what is around them |
| `tools/director/src/glows/corona.ts` | A halo made of rays rather than of haze |
| `tools/director/src/glows/emissive.ts` | The body as a light source rather than as a lit thing |
| `tools/director/src/glows/halo.ts` | A soft luminous outline standing off the contour |
| `tools/director/src/glows/pulse.ts` | Rings leaving the body, over and over, on the page's beat |
| `tools/director/src/glows/sparks.ts` | A particle system: motes leaving the body on seeded paths |
| `tools/director/src/glows/swarm.ts` | One soft cloud under the whole figure, rather than a halo per body |
| `tools/director/src/glows/trail.ts` | A luminous tail that lingers behind the body as it moves |
| `tools/director/src/glows/types.ts` | What a glow is, and what it is told |
| `tools/director/src/guide-fields.ts` | The GUIDE section `rail.ts` shows directly under SENTENCE: the three lines a wave's guide is made of |
| `tools/director/src/guide-scene-note.ts` | the rehearsal a wave's guide plays, named over the GUIDE fields with a caption per page |
| `tools/director/src/hits/dim.ts` | The body simply goes dark for a beat |
| `tools/director/src/hits/flash.ts` | One bright frame, then gone |
| `tools/director/src/hits/ring.ts` | A circle leaving the body and fading — the shockwave |
| `tools/director/src/hits/shake.ts` | The figure jitters on impact and settles |
| `tools/director/src/hits/shards.ts` | A burst of short strokes thrown outward and falling away |
| `tools/director/src/hits/squash.ts` | The body flattens on impact and springs back |
| `tools/director/src/hits/telegraph.ts` | A glow building over the beats before the hit, snapping off the instant it lands |
| `tools/director/src/hits/types.ts` | What a hit is, and what it is told |
| `tools/director/src/hits/leap.ts` | A ball of light thrown at the body over the beats before the hit, on a bowed path from off the frame |
| `tools/director/src/keep-alive.ts` | The page telling its server that somebody still has it open |
| `tools/director/src/key-help.ts` | The keybindings, shown rather than remembered — "for the time being," in the owner's own words |
| `tools/director/src/keys.ts` | Both roles on one keyboard, so a wave can be tried the moment it is placed |
| `tools/director/src/main.ts` | The director: one screen where a wave is placed, played and judged — not |
| `tools/director/src/main-tempo.ts` | **THE TEMPO HAS TWO CONTROLS AND THEY ARE ONE NUMBER.** TUNING's first slider moves `bpm` two points at a… |
| `tools/director/src/markdown.ts` | The little of markdown the spec actually writes, turned into DOM: headings, paragraphs, bullets |
| `tools/director/src/mobile-menu.ts` | On a phone the director opens on a menu, not on a wave |
| `tools/director/src/music-page.ts` | MUSIC: six pieces nobody has decided to use |
| `tools/director/src/music-plot.ts` | A theme drawn: the whole piece on one axis, time across, frequency up |
| `tools/director/src/notes-api.ts` | `GET /api/notes` — the release notes, and the two facts VERSUS votes against |
| `tools/director/src/paint.ts` | The edits: what a click does to a wave, and what takes it back |
| `tools/director/src/paint-fault.ts` | **A fault, laid across a beat row.** The column is ignored on purpose: a malfunction has none |
| `tools/director/src/pair-panel.ts` | The one switch that exists because the game has two people in front of it |
| `tools/director/src/pinball-editor.ts` | PINBALL's boards, painted on the grid the round is played on |
| `tools/director/src/pose-art.ts` | A posed world, drawn — one frame of the shipping renderer, cut down to the part of the phone the pose is about |
| `tools/director/src/pose-kit.ts` | The apparatus behind a posed frame: a world put into one named state |
| `tools/director/src/poses-field.ts` | The states of the things a wave puts on the field: the creatures, and the two bosses that exist |
| `tools/director/src/poses-field-controls.ts` | The states the ON THE FIELD tab needed a picture of and the gallery did not have |
| `tools/director/src/poses-field-controls-surge.ts` | THE SURGE with both thumbs on the bulb and the pressure climbing |
| `tools/director/src/poses-field-controls-sinew.ts` | THE SINEW with both hands on it and the sum somewhere on the band |
| `tools/director/src/poses-field-controls-spool.ts` | THE SPOOL's brake under the pilot's thumb — one picture, where THE GIMBAL and THE HASP next door each need two |
| `tools/director/src/poses-field-controls-antiphon.ts` | THE ANTIPHON with the pilot's thumb on the organ, a quarter turn in |
| `tools/director/src/poses-field-controls-instar.ts` | THE INSTAR in its first pose, the gape, with the pilot's thumb halfway down the lower jaw |
| `tools/director/src/poses-field-controls-gimbal.ts` | THE GIMBAL's two rings, one under each seat's thumb |
| `tools/director/src/poses-field-controls-hasp.ts` | THE HASP's two hands, one under each seat's thumb |
| `tools/director/src/poses-field-controls-ratchet.ts` | THE RATCHET's two hands, one under each seat's thumb, and **two instants rather than one** |
| `tools/director/src/poses-mechanics.ts` | What those hands add up to on the field: a hand on something falling, a shot in the air |
| `tools/director/src/poses-ship.ts` | What a player's own hands put the ship into |
| `tools/director/src/poses-surface.ts` | The states a candidate for a **surface** is judged on |
| `tools/director/src/poses-struck.ts` | A living body over the ship with a matching bolt still climbing at it: the kill itself, replayed |
| `tools/director/src/poses-slow.ts` | THE INSTAR's wave run until THE SLOW opens a window — the `slow:window` slot's pose, and the only card where `slowing` is true |
| `tools/director/src/poses.ts` | Every state the STATES sheet draws, in reading order |
| `tools/director/src/query.ts` | What is in a wave: the questions, with no answer that changes anything |
| `tools/director/src/rail.ts` | The wave list and the fields every wave must carry |
| `tools/director/src/scene-art.ts` | The unbuilt half of a scene, drawn over a real frame of the game |
| `tools/director/src/scene-box.ts` | `⌖ ON THE FIELD`, beside a backlog entry: the idea drawn where it happens |
| `tools/director/src/scene-panel.ts` | A scene, assembled: a real frame of the game with an unbuilt idea standing in it |
| `tools/director/src/scene-world.ts` | The *built* half of a scene: a real world with the game's own creatures run to where the scene wants them… |
| `tools/director/src/selection.ts` | Which cell of the map is under the cursor's attention — one beat and one column, or nothing |
| `tools/director/src/serialize-pinball.ts` | PINBALL's boards, written back out as the pictures they were drawn as |
| `tools/director/src/session.ts` | Where you are in the director, kept in the URL — and nothing else is |
| `tools/director/src/shape-figure.ts` | One contour, fitted into a frame and animated |
| `tools/director/src/shape-fit.ts` | How big a frame a shape needs, and which way round the shape is |
| `tools/director/src/shape-loop.ts` | The page's one clock, and every figure hanging off it |
| `tools/director/src/shapes-all.ts` | The transpose of the SHAPES tab: one body, drawn once per option, on one screen |
| `tools/director/src/shapes-axes.ts` | How the body is drawn: a skin, a motion and a light, each picked once for the whole page |
| `tools/director/src/shapes-build-state.ts` | BUILD's own state: the base, the attachments, and the recipe text they add up to |
| `tools/director/src/shapes-build.ts` | BUILD — a live composer over `grown()`, for trying a recipe before it is one |
| `tools/director/src/shapes-controls.ts` | The control rows on SHAPES: which view, and — on COMPOSE only — a skin, a motion, a light and a glow stack |
| `tools/director/src/shapes-effect-axes.ts` | The three effect axes on COMPOSE: GLOW, HIT and TAIL |
| `tools/director/src/shapes-grid.ts` | One grid, written once and walked per axis |
| `tools/director/src/shapes-page-app.ts` | The shape catalogue as a page that can be handed to somebody |
| `tools/director/src/shapes-pair.ts` | One card's picture, at whatever the page's controls currently say |
| `tools/director/src/shapes-state.ts` | What every card on the SHAPES tab is wearing, and the only place it is written |
| `tools/director/src/shapes-picker.ts` | The body picker: one button per catalogue name, and the button is the body |
| `tools/director/src/shapes-trigger.ts` | The page's hit clock: when the next one lands, and where in it we are |
| `tools/director/src/shapes-widgets.ts` | The two things every control row is built out of: a button, and a named group around a row of them |
| `tools/director/src/ship-fields.ts` | Every `SimConfig` field, sorted into the card that explains it to a person standing at the ship |
| `tools/director/src/ship-groups.ts` | The cards the ship's dials are divided into: their names, the order they are read in |
| `tools/director/src/ship-groups-wave.ts` | **Which cards belong beside the wave rather than beside the ship.** The last rows of `ship-groups.ts` |
| `tools/director/src/shipped.ts` | The two things the *build* decides about the director, rather than the session running it |
| `tools/director/src/silhouette.ts` | Case-insensitive: callers pass a creature's spec name, not a SUBJECTS key |
| `tools/director/src/skin-still.ts` | One card, drawn at one moment, as a string |
| `tools/director/src/skins/carapace.ts` | CARAPACE — few, large, geometric plates separated by dark seams |
| `tools/director/src/skins/chamber-packing.ts` | How CHAMBER is packed, and the elements it packs with |
| `tools/director/src/skins/chamber.ts` | A body packed with compartments, each holding its own level, and a scatter of swellings over them |
| `tools/director/src/skins/cilia.ts` | CILIA — a hundred short strands at the rim, and a sparser handful over the interior |
| `tools/director/src/skins/contour-ruler.ts` | Where a point is, a given fraction of the way around a contour |
| `tools/director/src/skins/core.ts` | MEMBRANE with a value gradient under it, falling outward to the card's own dark rather than to the rim colour |
| `tools/director/src/skins/crater.ts` | TURN's machinery over a meteorite: a pitted landscape, rims catching the key light and floors in shadow |
| `tools/director/src/skins/light.ts` | The key light: one direction, four constructs, one line that hangs them on a body |
| `tools/director/src/skins/light-axis.ts` | **The key light's axis**: where the light is, the stops along it |
| `tools/director/src/skins/line.ts` | The outline, and nothing else |
| `tools/director/src/skins/membrane.ts` | A dark fill and the game's own layered aura |
| `tools/director/src/skins/mounted.ts` | The projection every turning skin shares, in one place |
| `tools/director/src/skins/nacre-film.ts` | The film's colour arithmetic — where iridescence stops being a material and starts being a rainbow |
| `tools/director/src/skins/nacre.ts` | NACRE — mother-of-pearl |
| `tools/director/src/skins/parts.ts` | The passes more than one skin draws |
| `tools/director/src/skins/pore.ts` | PORE — a frog's skin: bumps scattered without a lattice, dense in places and sparse in others |
| `tools/director/src/skins/scale.ts` | SCALE — many small, soft plates, laid in offset rows around the body's own centre and shrinking toward the rim |
| `tools/director/src/skins/scatter.ts` | **Dart-throwing inside a contour** — blue noise, placed against a density field the caller supplies |
| `tools/director/src/skins/seed.ts` | Determinism, for skins |
| `tools/director/src/skins/setae.ts` | SETAE — a girdle of short bristles round the body, pinned by longitude and carried round as it turns |
| `tools/director/src/skins/sucker.ts` | SUCKER — an octopus arm: concentric rings, largest along a spine and falling off to either side |
| `tools/director/src/skins/turn.ts` | The first skin that turned |
| `tools/director/src/skins/types.ts` | What a skin is, and what it is told |
| `tools/director/src/skins/vein-pulse.ts` | VEIN again, with the strands breaking the surface and a pulse running out along them |
| `tools/director/src/skins/vein-pulse-tree.ts` | **VEIN PULSE's tree**: the branching filaments grown once |
| `tools/director/src/skins/vein.ts` | CORE with filaments under the skin, clipped to the body |
| `tools/director/src/skins/veil.ts` | The body stays a hole, and the **membrane around it** is what has thickness |
| `tools/director/src/skins/wind.ts` | WIND — the same turning body, but the phase varies along it |
| `tools/director/src/skins/wrinkle.ts` | WRINKLE — meridians of fold that come up across the body on the beat and smooth away again |
| `tools/director/src/snake-editor.ts` | SNAKE's arena, edited on the grid the pair will play it on |
| `tools/director/src/stage-afterrun.ts` | The after-run screen honours its own instruction |
| `tools/director/src/stage-handle.ts` | The handle headless checks drive the stage through |
| `tools/director/src/stage-loop.ts` | The stage's clock: a fixed-timestep loop of its own rather than the game's |
| `tools/director/src/stage-repeat.ts` | A cleared wave stops and asks, rather than starting itself again |
| `tools/director/src/stage-transport.ts` | The buttons under the field: `⏸`/`▶`, `↺ WAVE` and the three role switches |
| `tools/director/src/state.ts` | The edits and the questions moved out when this file went over the line limit |
| `tools/director/src/states-page.ts` | DOCUMENTATION: the four reference rooms in one full-screen sheet, and the sheet's own wiring |
| `tools/director/src/states-section.ts` | One STATES group: heading, note and a row of cards filled on scroll or click, named `data-group`/`data-pose` |
| `tools/director/src/subcols.ts` | A finer-grained collapse than `columns.ts`'s whole-section one |
| `tools/director/src/svg-dom.ts` | The smallest document a skin can be built into, outside a browser |
| `tools/director/src/tabs.ts` | Buttons carrying `data-tab`, pages with the matching `<prefix><name>` id |
| `tools/director/src/tails/embers.ts` | Sparks shed off the body and falling away behind it |
| `tools/director/src/tails/haloes.ts` | A short string of fading halos above the body |
| `tools/director/src/tails/ribbon.ts` | One continuous stroke tapering away above the body — the classic trail renderer |
| `tools/director/src/tails/smoke.ts` | A soft plume widening away above the body |
| `tools/director/src/tails/streak.ts` | A hard bright line straight up from the body — the bullet's tail, put on a falling body |
| `tools/director/src/tails/types.ts` | What a body leaves behind it as it falls |
| `tools/director/src/tails/wedge.ts` | A tapering gradient wedge running away above the body — **what a torch wears in the game today** |
| `tools/director/src/tuning.ts` | The numbers a wave is judged against, movable while it plays |
| `tools/director/src/versus-controls.ts` | The generic widgets a live ALTERNATIVES screen runs on — a toggle button and a rate picker |
| `tools/director/src/versus-hash.ts` | FNV-1a over every byte — not a cryptographic claim, only "did two renders match" |
| `tools/director/src/versus-page.ts` | The ALTERNATIVES list: every open candidate as a door, and nothing drawn |
| `tools/director/src/versus-pair.ts` | One phone pair, one world, one frame — the engine half of the ALTERNATIVES sheet |
| `tools/director/src/versus-pair-freeze.ts` | Stopping a VERSUS pair on a moment somebody chose |
| `tools/director/src/versus-pose.ts` | Which pose puts a slot's own animation on screen |
| `tools/director/src/versus-probe.ts` | **The probe's own clock**: how far apart its samples stand, how many it takes |
| `tools/director/src/versus-seat.ts` | Whether a candidate needs the other seat drawn beside it — decided once, honestly, rather than guessed |
| `tools/director/src/versus-shot.ts` | The two query parameters that make a VERSUS pair photographable |
| `tools/director/src/waves-commit.ts` | A save in the wave editor is a commit |
| `tools/frames/capture.ts` | One picture, or a short strip of them, off the running game |
| `tools/frames/chrome.ts` | Which browser `tools/frames` opens, and where it lives on the two machines this repository runs on |
| `tools/frames/hold.ts` | `--hold` on the command line: the one thing this tool could not photograph |
| `tools/frames/hold-targets.ts` | Which handle is whose, what it is called on the wire, and what it needs |
| `tools/frames/hold-targets-b.ts` | The forty-three handles `--hold` caught up with the wire's list on, one row each: seat, wire name, id, lift |
| `tools/frames/hand.ts` | `--hand` on the command line: **this phone's own finger on the ship** |
| `tools/frames/opening.ts` | Getting a wave's own opening out of the way, so a capture can start on the field |
| `tools/frames/run.ts` | `bun run frames <sha> --wave N` — a before-and-after picture for a landing |
| `tools/frames/serve.ts` | Getting one *revision* of this game running, so a frame can be taken off it: a scratch worktree, an install |
| `tools/frames/shot.ts` | `bun run shot <#selector> <out.png> [--serve] [--open "≡ RELEASE NOTES"] [--tab GRAPHICS]` — one element of the running director |
| `tools/frames/spec.ts` | What a capture is asked for, and what it finds in the page when it gets there |
| `tools/frames/svg.ts` | `bun run png <in.svg> <out.png>` — turn a sheet into something a phone shows |
| `tools/hooks/guard.ts` | The PreToolUse guard: a handful of Bash commands that are wrong in this repo specifically |
| `tools/hooks/scope.ts` | The Stop hook typechecks unconditionally and then decides which test directories can possibly have moved |
| `tools/hooks/shell-words.ts` | A command line, split the way the rules in `guard.ts` need to read it: into commands |
| `tools/icons/run.ts` | `bun run icons` — the home-screen icons, from `apps/game/icon.svg` |
| `tools/index/run.ts` | `bun run index` — completes `docs/INDEX.md`'s "## Code" table: every in-scope source file gets a row |
| `tools/index/refresh.ts` | a row that was its file's header sentence follows the header when it changes; one a person wrote stays |
| `tools/land/git.ts` | The two ways `land` talks to git — one that swallows failure into `""` for questions where "unknown" and… |
| `tools/land/idle.ts` | How long a merged worktree is left standing, and how long it has been since anybody worked in one |
| `tools/land/index-merge.ts` | Keeping a lane's own rows when `docs/INDEX.md` is resolved by regenerating it |
| `tools/land/orphans.ts` | The litter left behind when a removal was trusted instead of verified |
| `tools/land/run.ts` | `bun run land` — put this lane on the trunk, linearly, and leave nothing behind |
| `tools/land/sweep.ts` | Everything that happens after the fast-forward and does not touch a ref: the release note |
| `tools/orphans/run.ts` | `bun run orphans` — what is built and reached by nothing |
| `tools/queue/claim.ts` | Who is already working on a queue item |
| `tools/queue/queue.ts` | The technical queue: what a session found and did not do, written in a shape a fresh session can pick up cold |
| `tools/queue/repo.ts` | every `git` the queue runs: the branches, a claim made and dropped, the trunk's own copy of the file |
| `tools/queue/run.ts` | `bun run queue` — what is waiting, and what somebody is already on |
| `tools/raster/pack.ts` | `bun run raster:pack <dir> [--size N] [--quality Q] [--stills N]` |
| `tools/raster/run.ts` | `bun run raster` — regenerates every baked asset in `assets/raster/` |
| `tools/raster/src/apng.ts` | An APNG, assembled from still PNGs a browser already encoded |
| `tools/raster/src/burst-art.ts` | One frame of the burst, drawn into a 2D context |
| `tools/raster/src/png.ts` | The parts of the PNG container an animator needs, and nothing else |
| `tools/raster/src/render.ts` | Draws the burst in a real browser and brings the bytes back |
| `tools/raster/src/spec.ts` | The one description of the burst — the only place its numbers are written |
| `tools/raster/src/webp.ts` | An animated WebP, assembled from still WebPs a browser already encoded |
| `tools/raster/verify.ts` | `bun run raster:verify` — opens the generated assets in a real browser and says whether they decode |
| `tools/shape-sheet/src/contour.ts` | An open contour must not be filled — SVG would close it across the ends |
| `tools/shape-sheet/src/drawn-size.ts` | The 20–26 px floor `docs/spec/graphics.md` sets for a body to stay nameable |
| `tools/shape-sheet/src/free-contours.ts` | The spare contours: a picture with no behaviour behind it |
| `tools/shape-sheet/src/grown-bodies.ts` | Fourteen bodies that are nothing but a base blob and a handful of parts |
| `tools/shape-sheet/src/hull-subjects.ts` | The hull, and the window onto its own contour |
| `tools/shape-sheet/src/iso.ts` | The outline of a field, as however many closed loops it actually has |
| `tools/shape-sheet/src/jelly-bodies.ts` | Eight bodies that swim |
| `tools/shape-sheet/src/main.ts` | The SVG test sheet |
| `tools/shape-sheet/src/metrics.ts` | Numbers about a silhouette, so that judging one does not always cost a look |
| `tools/shape-sheet/src/motion.ts` | The motion sheet: the shape sheet's answer to animation |
| `tools/shape-sheet/src/motions/borrowed.ts` | The spare motions read off other games — `docs/tower-defence.md` |
| `tools/shape-sheet/src/motions/depth.ts` | The motions that claim a third dimension, out of four numbers that have none |
| `tools/shape-sheet/src/motions/plane.ts` | The spare motions that happen in the picture plane |
| `tools/shape-sheet/src/motions/pose.ts` | A pose, positionally |
| `tools/shape-sheet/src/motions/pulse.ts` | The four that pulse, as opposed to the one that breathes |
| `tools/shape-sheet/src/motions/offered.ts` | GLIDE and FLOAT, the two motions offered against the slick on VERSUS and kept as pictures when BANK was taken |
| `tools/shape-sheet/src/nameability.ts` | The three axes a silhouette is told apart on, and the rule that says when two kinds are the same word |
| `tools/shape-sheet/src/parts-sheet.ts` | The parts sheet: every secondary form drawn on its own, grouped, labelled |
| `tools/shape-sheet/src/parts/alien.ts` | ALIEN — the parts that are not biology |
| `tools/shape-sheet/src/parts/base.ts` | Where the base body is, and where its rim is in any direction |
| `tools/shape-sheet/src/parts/drift.ts` | DRIFT — what hangs under a swimming bell |
| `tools/shape-sheet/src/parts/geometry.ts` | The four constructions every part is built out of |
| `tools/shape-sheet/src/parts/grown.ts` | A body assembled out of a base contour and a list of parts |
| `tools/shape-sheet/src/parts/growth.ts` | GROWTH — the parts that are *made of* the body rather than reaching out of it |
| `tools/shape-sheet/src/parts/limbs.ts` | REACH — the parts that leave the body |
| `tools/shape-sheet/src/parts/registry.ts` | Every secondary form, in one list |
| `tools/shape-sheet/src/parts/rim.ts` | RIM — the parts that only bend the outline |
| `tools/shape-sheet/src/parts/swim.ts` | A swimming bell's contraction, as a function of time |
| `tools/shape-sheet/src/parts/types.ts` | A **part** is a secondary form attached to somebody else's rim: a tentacle, a spore, a crystal, a fin |
| `tools/shape-sheet/src/recipe.ts` | A body written as a base and a list of parts |
| `tools/shape-sheet/src/report.ts` | The shape sheet in numbers |
| `tools/shape-sheet/src/retired.ts` | Shapes that were in the catalogue under their own heading and are not any more |
| `tools/shape-sheet/src/ring.ts` | The ring: the one contour in this game with a hole through it |
| `tools/shape-sheet/src/scene.ts` | A scene: an unbuilt idea's *mechanic*, drawn on the field it would happen on |
| `tools/shape-sheet/src/scenes/bosses.ts` | The bosses, placed on the field |
| `tools/shape-sheet/src/scenes/creatures.ts` | The creature ideas, placed on the field |
| `tools/shape-sheet/src/svg.ts` | Cell geometry and page furniture, shared by the shape sheet and the motion sheet |
| `tools/shape-sheet/src/swim-sheet.ts` | The swim sheet: one pulse cycle of every jelly, left to right |
| `tools/versus/run.ts` | `bun run versus` — which slots are open, and what a vote on each one would reach |
| `tools/versus/record-edit.ts` | Writing one candidate's field values into the shipped record, in the file |
| `tools/versus/registry.ts` | The registry, derived from the directories rather than typed out |
| `tools/versus/root.ts` | Where the repository is, from inside this directory |
| `tools/versus/seed.ts` | One seeded random stream, so the only thing that can differ between the two sides of a VERSUS frame is the… |
| `tools/versus/scaffold.ts` | `bun run versus new <slot> <name>` — the candidate, spelled out |
| `tools/versus/slots.ts` | A slot and its answers, read off the directory names and nothing else |
| `tools/versus/variant.ts` | VERSUS — the place a second answer to an existing shape can live |
| `tools/versus/decide.ts` | What happens after the owner has looked |
| `tools/versus/decided-md.ts` | `DECIDED.md` — the answers, after the slot they were given to has gone |
| `tools/versus/list.ts` | `bun run versus` — which slots are open, and what deciding one would reach |
| `tools/versus/text.ts` | How a value and a paragraph are spelled where VERSUS talks to a person |
| `tools/versus/take-function-fs.ts` | Taking a function-valued field, the half that looks at the tree: which sibling files move where, the plan `adopt` writes in one go, and whether anything still imports what the record used to point at |
| `tools/versus/take-function.ts` | Taking a function-valued field, the text work: which identifier a candidate gives the field and which sibling it comes from, where the file lands, and its imports rewritten for the package it moves into |
| `tools/versus/take-record.ts` | The record side of taking a function-valued field: the field pointed at the moved function, with its import added, and the old value taken out of the imports |
| `tools/versus/by-hand.ts` | The four steps `adopt` prints when it will not take a slot itself |
| `tools/versus/pose-row.ts` | The row a slot has in the director's `SLOT_POSE` map, taken out with the slot |
| `tools/index/drift.ts` | Whether a row in `docs/INDEX.md` still describes the file it names |
| `tools/index/doc.ts` | **The shape of `docs/INDEX.md` around its Code table**: the heading and markers the table is anchored on |
| `tools/index/sentence.ts` | **The one line a row carries**, read off the file's own header comment and cut to something a table can hold |
| `tools/index/place.ts` | where a new row goes: beside the rows whose names it shares a beginning with |
| `tools/index/generate.ts` | `docs/INDEX.md` as a function of a checkout |
| `tools/index/base.ts` | the files this checkout changed, as they were at its merge base with `main` and at `HEAD` — what `refresh.ts` measures against |
| `tools/land/claims.ts` | Which of the branches a landing finds merged are really queue claims |
| `tools/director/src/waves-acts.ts` | The act files, and the save that writes a wave list back across them |
| `tools/director/src/waves-act-files.ts` | **Where the waves live on disk**, and nothing about writing them |
| `tools/director/src/waves-baseline.ts` | A save runs `baseline:blank` in a fresh process before it commits, so a wave changed under its baseline row cannot land `main` red |
| `tools/director/src/wordings-glossary.ts` | The words on the WORDINGS page that have no one place on the picture — the list under the two labelled screens |
| `tools/director/src/wordings-page.ts` | DOCUMENTATION → WORDINGS: an ordinary screen with every part of it named |
| `tools/director/src/wordings-world.ts` | The one ordinary screen the WORDINGS page names things on |
| `tools/director/src/wordings.ts` | DOCUMENTATION → WORDINGS: what each thing on an ordinary screen is called |
| `tools/hooks/after-sim-edit.ts` | Determinism is the one thing a reviewer cannot see by looking |
| `tools/hooks/check-on-stop.ts` | The last thing before Claude hands the turn back |
| `tools/hooks/format-edited.ts` | Formatting is not a conversation |
| `tools/hooks/file-size.ts` | The ~250-line ceiling, its exempt list and which paths it reaches — read by the test that enforces it and the hook that warns |
| `tools/hooks/payload.ts` | The shape of a hook payload, read once |
| `tools/director/src/brush-cards.ts` | What one brush's **card** says: the colour it is stroked in, the shape-sheet subjects it draws |
| `tools/director/src/stage-point.ts` | WHERE A CLICK ON THE DIRECTOR'S CANVAS ACTUALLY LANDS |
| `tools/director/src/stage-opening.ts` | A press on the stage while a wave's opening is up |
| `tools/director/src/tried-controls-page.ts` | TRIED AND SET ASIDE — the other list on the CONTROLS tab, and the smaller one |
| `tools/frames/launch.ts` | Getting the *wave's arrival* out of the picture |
| `tools/director/src/ship-notes.ts` | The paragraph under each card's heading, and nothing else |
| `tools/land/push.ts` | `bun run push` — put the trunk on `origin`, because somebody asked |
| `tools/land/pose-merge.ts` | Merging the director's `SLOT_POSE` map when a lane and the trunk both changed its rows… |
| `tools/land/specs.ts` | The spent-delegate-spec half of the sweep |
| `tools/hooks/lane-finished.ts` | The turn is over and the lane is finished: land it on the local trunk, and put the rest to the owner |
| `tools/director/src/control-set-note.ts` | The roster under the wave editor's control-set picker: every button on the panel, seat by seat |
| `tools/director/src/rail-marks.ts` | The small glyphs in front of a wave's name in the rail: a boss, a panel, a guide |
| `tools/land/say.ts` | What a landing says about itself before and after it happens |
| `tools/maze/draw.ts` | Draw a sheet for THE MAZE: the walls of one circular maze |
| `tools/maze/run.ts` | `bun run maze` — draw a sheet for THE MAZE, ready to paste into `packages/content/src/maze-rounds.ts` |
| `tools/frames/page.ts` | Getting a tab to the moment the world is the capture's, before the first tick |
| `tools/maze/carve.ts` | The walls of THE MAZE's grid: which of them are opened |
| `tools/director/src/maze-editor.ts` | THE MAZE's five stages, walked through one at a time |
| `tools/land/refusal.ts` | Why a push was refused, said in full — git's own words and where the trunk stands |
| `tools/land/replay.ts` | the rebase, and the generated and record files whose conflicts it settles on its own |
| `tools/land/remote-branch.ts` | The lane's branch on `origin`, after the landing has taken it locally |
| `tools/land/red-check.ts` | What a landing says when `bun run check` comes back red |
| `tools/land/reconcile.ts` | **The other rebase: the trunk against `origin/main`.** `land`'s replay covers a lane landing onto the trunk |
| `tools/land/reconcile-run.ts` | `bun run reconcile` — bring the local trunk up to `origin/main` by itself |
| `tools/land/record-merge.ts` | Merging a **record**: a file of `##` entries that one tool appends to and nobody ever edits |
| `tools/frames/press.ts` | `--press`: the verbs a held thumb cannot reach |
| `tools/frames/crop.ts` | Cropping and magnifying a captured frame, so a change the size of a creature can be seen |
| `tools/frames/crop-png.ts` | you have a screenshot and want to look closer — `bun run crop` cuts a rectangle out and magnifies it by whole pixels |
| `tools/frames/pair-png.ts` | you have a before and an after and may send one picture — `bun run pair` joins them with a grey gutter |
| `tools/frames/wave.ts` | Which wave `--wave` names, answered against the right commit's own list |
| `tools/frames/opening-hold.ts` | Standing *in* a wave's opening, rather than getting past it |
| `tools/frames/offline.ts` | **A capture reaches the preview and nothing else.** Since the sign-in landed |
| `tools/land/queue-guard.ts` | A landing must not put back a queue entry another lane took out |
| `tools/land/queue-merge.ts` | Merging `docs/queue.md` when a lane and the trunk both wrote to it |
| `tools/hooks/session-start.ts` | Pin bun to a version new enough for this repo on the web, and name a bun below the pin anywhere |
| `tools/director/src/brush-poses-echo.ts` | THE ECHO's specimen, split out of `brush-poses.ts` when THE CAROM took that file over its 250-line limit |
| `tools/land/state.ts` | the facts a landing is decided from, read off git — `run.ts` moves refs, `land.ts` decides |
| `tools/land/stamp.ts` | The `*Measured:` line a landing stamps under a time-log entry — the elapsed from the lane's first commit to the trunk moving, beside the session's own estimate |
| `tools/land/shallow.ts` | A shallow clone, which is what a cloud session lands from |
| `tools/director/src/entry-fields-rock.ts` | **A rock's two numbers**: how fast it falls and how wide it arrives |
| `tools/frames/exec.ts` | The three things every part of this tool needs before it can do anything: where the checkout is |
| `tools/frames/scratch.ts` | The throwaway checkouts `bun run frames` works out of: made, used, and — the part that was missing |
| `tools/frames/scout-press.ts` | **THE SCOUT's flying, written on the press line** — the pilot's three held verbs, and one recorded flight that works |
| `tools/land/crlf.ts` | The line endings on disk, asked before `bun run check` is asked anything |
| `tools/retry.ts` | Removing something from disk and then *asking* whether it went — the policy |
| `tools/running.ts` | Where a server that took an OS-assigned port writes the number down |
| `tools/land/race.ts` | Whether some other lane landed while this one was in `bun run check` |
| `tools/land/unverified.ts` | what a landing could not check, turned into a queue entry a later session drains |
| `tools/land/unverified-run.ts` | `bun run unverified <sha> --unverified "<what>" [--unverified "<what>" ...]` |
| `tools/land/toolchain.ts` | Where a landing meets the bun it runs on rather than the tree it lands: the pin's refusal and the frozen install |
| `tools/director/src/cell-config-gaps.ts` | THE FENCE's row under the map: one chip per column, lit where the wall is open |
| `tools/perf/compare.ts` | What a performance run *is*, and what two of them say when held side by side |
| `tools/perf/measure.ts` | One performance run, taken off a real browser driving the real bundle |
| `tools/perf/run.ts` | `bun run perf` — what a frame costs, wave by wave, at phone speed |
| `tools/perf/run-types.ts` | **What a performance run is, written down**: one wave's cost, a whole run of them |
| `tools/perf/waves.ts` | which waves a run covers, from `--wave` to a list of indices |
| `tools/director/src/entry-fields-fence.ts` | **Where a fence is open**, read and written on one arrival |
| `tools/perf/say.ts` | what a run looks like when it is printed — the table, the summary, the comparison |
| `tools/perf/arrivals.ts` | WHAT A WAVE SENDS, in one short string a stale baseline row can be caught by |
| `tools/perf/noise.ts` | WHEN A MEASUREMENT CAN BE TRUSTED, and by how much it has to move before anybody is told about it |
| `tools/frames/browser.ts` | THE ONE PLACE A BROWSER IS OPENED, and the one place it is shut |
| `tools/frames/browser-cdp.ts` | THE SECOND WAY IN, for a machine where `chromium.launch()` cannot open one |
| `tools/frames/boss.ts` | `--boss`, `--boss-json` and `--creature` read off the command line |
| `tools/frames/boss-install.ts` | Writing `--boss`, `--boss-json` and `--creature` on the world, in the page |
| `tools/frames/boss-check.ts` | Whether `--boss`, `--boss-json` and `--creature` may be written |
| `tools/tmp-litter.ts` | The directories a browser run leaves under `.claude/tmp`, and when one of them is spent |
| `tools/perf/shape.ts` | PUTTING TWO RUNS ON THE SAME FOOTING, and one row from one of them into the other |
| `tools/perf/sweep-timing.ts` | The numbers a paint is sampled with, and the statistics taken off the sample |
| `tools/director/src/serialize-boss.ts` | **A wave's boss, written back out**, and the nine shapes it can take |
| `tools/director/src/serialize-entry.ts` | one arrival and one pod of a wave, written back out — every optional field only when it is there, so a saved wave never loses one |
| `tools/director/src/field-control-def.ts` | **What one row of the ON THE FIELD tab is**, and nothing that fills one in |
| `tools/shape-sheet/src/veer-subject.ts` | **THE VEER**: the meteor with its rider on it, the one card made of a shape already on the sheet plus something over the top |
| `tools/shape-sheet/src/rock-subjects.ts` | Everything on this sheet that is faceted rather than grown: the builder that draws a crystal |
| `tools/director/src/poses-versus.ts` | The states a candidate look is judged on — one per slot that had none |
| `tools/director/src/poses-volley.ts` | THE VOLLEY, warded three times by a hand that never misses |
| `tools/director/src/poses-bodies.ts` | The pose a candidate for a *body* is judged on, as opposed to one for a mechanism firing |
| `tools/director/src/poses-bosses-clocks.ts` | **The clock bosses' states** — a body or a fixture over the ordinary field |
| `tools/director/src/poses-bosses-first.ts` | **The state every field boss opens in**, and the one or two that come on their own after it |
| `tools/director/src/poses-bosses-kit.ts` | **How a boss state is posed**: its own wave, run until the state arrives |
| `tools/director/src/poses-bosses-queen.ts` | THE BULB QUEEN's three states — the oldest boss |
| `tools/director/src/poses-bosses-rounds.ts` | **The rounds' states** — the bosses that take the field away and hand the pair a screen of their own… |
| `tools/director/src/poses-bosses-rounds-b.ts` | **The rounds' states, the second page** — PINBALL's and THE PULSE's |
| `tools/director/src/poses-bosses-hands-beats.ts` | **The states a beat earns** — THE DIASTOLE's chambers, THE BATON's crossing, THE THROAT's inhale |
| `tools/director/src/poses-bosses-hands-shots.ts` | **The states a shot earns** on the clock bosses — THE WARDEN's plates, THE VANE's pins, THE ORRERY's rings |
| `tools/director/src/poses-bosses-hands-clocks.ts` | **The states the pair's hands bring on the bosses that keep a ledger of their own** — THE TASTER's fan |
| `tools/director/src/poses-bosses-hands-field.ts` | **The states the pair's hands bring on the bosses of the field** — THE FLEET's chart, THE GORGE's mouth |
| `tools/director/src/poses-bosses-hands-handles.ts` | **The states a handle brings on** — THE SINEW's tendon pulled, THE SURGE's bulb held and let go |
| `tools/director/src/poses-bosses-hands-takes.ts` | **The states a taking brings on** — a rock out of THE CAIRN, a number down THE SPLICE's straw |
| `tools/director/src/poses-bosses-hands-ratchet.ts` | **THE RATCHET's five states**, posed with a hand on the controls (`boss-hands-ratchet.ts`) |
| `tools/director/src/poses-bosses.ts` | **The BOSSES category of the STATES sheet**: one group per boss, in the order the simulation numbers them |
| `tools/director/src/poses-casing.ts` | The states a candidate for what a body **wears** is judged on |
| `tools/director/src/poses-cage.ts` | The pose a candidate for THE RECOIL's cage is judged on |
| `tools/director/src/poses-cairn.ts` | THE CAIRN standing whole, before the pair has pulled anything off it |
| `tools/director/src/poses-crossing.ts` | The two states a candidate for a body that **goes somewhere** is judged on |
| `tools/director/src/poses-count.ts` | COUNT · THREE BLADES LEFT — the pose THE COUNT's looks were judged on, player 1's screen |
| `tools/director/src/poses-damage.ts` | The two poses about **damage** — a rock being marked, and a body being destroyed |
| `tools/director/src/poses-rounds.ts` | The states a candidate for an **interlude** is judged on |
| `tools/director/src/poses-layers.ts` | the states a layer over a body is judged giving way in — a rind under fire, a lid under a hand — with `Pose.hand` |
| `tools/director/src/poses-link.ts` | The two states a candidate for something that **joins two things** is judged on |
| `tools/director/src/poses-hold.ts` | The two bodies that hold a control and **go off if it stands still** — THE LIMPET on the plate |
| `tools/director/src/poses-handover.ts` | the state `handover:notice` is judged on — the pilot's screen a beat before THE HANDOVER warns, replayed once a window |
| `tools/director/src/poses-husk.ts` | The state a candidate for `pod:husk-tell` is judged on |
| `tools/director/src/poses-guide.ts` | A page of a tutorial's film, on player 1's phone |
| `tools/director/src/versus-app.ts` | `versus.html` — the page a VERSUS door opens into, and the whole of its routing |
| `tools/director/src/versus-advance.ts` | **One tick of a pose's world**, and the one thing four tests and the seat probe want out of `versus-pair.ts`… |
| `tools/director/src/versus-one.ts` | One candidate, alone, on a page of its own — the live half of VERSUS |
| `tools/director/src/versus-open.ts` | Where a look opens, and how a page links to it |
| `tools/director/src/versus-tab.ts` | The VERSUS tab: every look offered beside what the field already draws, never in place of it |
| `tools/director/src/place.ts` | Where you are in the director, as a value — and the two functions that turn it into a URL and back |
| `tools/director/src/plain-words.ts` | The plain-English half of an unbuilt entry: what the thing does, what each seat does about it |
| `tools/queue/edit.ts` | Editing `docs/queue.md` and `docs/parked.md` in place: the claim written into an entry |
| `tools/queue/git.ts` | The queue's git: one runner, and the one piece of plumbing that writes a commit onto a branch nothing has… |
| `tools/queue/stale.ts` | Whether an entry has gone stale: written before something landed on the files it names |
| `tools/queue/status.ts` | `bun run queue status` — DONE, IDLE or BUSY, and who is on what |
| `tools/queue/skipped.ts` | **Why `next` stepped past a free entry**, counted for the listing's foot |
| `tools/queue/spent.ts` | A claim a lane on this machine made, landed and walked away from |
| `tools/queue/show.ts` | `bun run queue show <n|title>` — the prompt `next` prints, and nothing else |
| `tools/queue/where.ts` | Which kind of session is running the queue, and which items it may take |
| `tools/queue/problems.ts` | What makes an entry one a cold session could act on, and the refusal when it is not |
| `tools/queue/prompt.ts` | The brief a fresh session reads before it opens a queue item — the branch, the size decision, the entry's body, and what to do when it is green |
| `tools/queue/asking.ts` | Whether an entry is still waiting on the owner, and what the listing says about it |
| `tools/queue/needs.ts` | Whether an entry is waiting on another entry, and what the listing says about it |
| `tools/queue/mark.ts` | The `Taken:` line's own text: what one says, and the two branches to read out of it |
| `tools/queue/tree.ts` | Where this checkout is, and what refs it has |
| `tools/queue/lapsed.ts` | A claim with nothing left holding it up |
| `tools/queue/list.ts` | `bun run queue` with no command: every entry, who holds it, and what the owner is asked |
| `tools/frames/press-plan.ts` | when each `--press` is sent, and the tick that must run after it |
| `tools/perf/renumber.ts` | a merged baseline put back on today's wave numbers |
| `tools/perf/held.ts` | WHAT A MEASUREMENT PRESSES, AND ON WHICH WAVE |
| `tools/perf/peak.ts` | STANDING A WAVE WHERE IT IS MEASURED |
| `tools/perf/unmeasured.ts` | A BASELINE ROW FOR A WAVE NOBODY HAS MEASURED |
| `tools/perf/blank.ts` | `bun run baseline:blank` — brings the baseline up to the waves the game ships today; opens no browser and measures nothing, so it is not spelled `perf` and any session may run it |
| `tools/director/src/cell-config-rows.ts` |  |
| `tools/director/src/grid-cell-art.ts` | What one cell of the map draws: the creature that arrives on that beat, and the pod that hangs in that column |
| `tools/director/src/rail-filter.ts` | The filter over the wave list: one field above it, matching a wave's prose and everything it sends |
| `tools/director/src/rail-steps.ts` | **The two arrows over the WAVE column**, and the two keys that are the same step without the mouse |
| `tools/director/src/rail-symbols.ts` | **THE ROW OF SYMBOLS OVER THE FILTER**: the rail's own four marks, made pressable |
| `tools/director/src/rail-list.ts` | ONE ROW OF THE WAVE LIST, AND WHAT IS ON IT |
| `tools/director/src/rail-open.ts` | THE THREE WAYS OUT OF A ROW IN THE WAVE LIST |
| `tools/director/src/reprise-editor.ts` | THE REPRISE's panel, which is one number |
| `tools/director/src/remembered.ts` | The wave filter, its pressed marks and the sounds status, kept in localStorage across a reload |
| `tools/director/src/cell-config-pod.ts` | The rows under the selected cell that configure the **pod** in it: the row it hangs at |
| `tools/director/src/cell-config-mine.ts` | **THE MINE's two rows under the selected cell** |
| `tools/director/src/cell-config-moult.ts` | **THE MOULT's one row under the selected cell** |
| `tools/director/src/grid-note.ts` | The line of arithmetic under the map: how many entries and pods the wave carries, how long it runs |
| `tools/director/src/grid-gestures.ts` | **Everything a hand can do to one cell of the map**: point at it, paint it, drag a stroke across it |
| `tools/director/src/grid-rows.ts` | The map's beat labels — a number that seeks — and the two row edits behind them, a beat opened and a beat taken out, with the asking a removal does first |
| `tools/director/src/grid-row-acts.ts` | The row verbs as things you can see: a line between two rows that opens a beat where it is drawn, and a trash at the row's right end, both worn by the row under the pointer or the row of the cell being edited |
| `tools/director/src/grid-follow.ts` | The map follows the beat that is playing, keeping the next few rows on screen too, in steps rather than by the beat — and stands aside as soon as a hand scrolls |
| `tools/director/src/grid-metrics.ts` | The map's own arithmetic: the width of a cell, of the beat numbers, of the strip of row buttons, and what the nine tracks add up to |
| `tools/director/src/held.ts` | **What the author is carrying**: the brush that is armed, and — while a drag is in the air |
| `tools/director/src/brush-hints.ts` | SHOW DESCRIPTIONS: whether each brush in the palette carries its sentence |
| `tools/director/src/brush-lists.ts` | which strings are brushes and which kind each one paints — the lists, not the palette's rows |
| `tools/director/src/scene-marks.ts` | The marks: everything a scene draws that is not a body |
| `tools/director/src/scene-overlay.ts` | **Drawing a scene's bodies**, once the placing next door has said where each of them stands |
| `tools/director/src/stage-world.ts` | A fresh run of the wave being edited, stood up the way the game stands one up |
| `tools/port.ts` | `bun run port` — which port this checkout's servers answer on |
| `tools/servers.ts` | The two servers this repository starts and settles a port with, described once |
| `tools/probe/example.ts` | The worked example, and the thing to copy |
| `tools/probe/run.ts` | `bun run probe [file]` — run a script that needs a live world |
| `tools/probe/world.ts` | A world, stood up and stepped, for a question that only a running one answers |
| `tools/director/src/stage-panel.ts` | **What the stage panel is, as a contract**, and nothing about how it is driven |
| `tools/frames/guide-film.ts` | **Driving a rehearsal**, which is a clock of its own and not the world's |
| `tools/director/src/ship-fields-round.ts` | The rounds' own dials, sorted into their cards |
| `tools/director/src/sound-link-pulse.ts` | Why none of THE PULSE's twelve sounds has a picture |
| `tools/director/src/sound-link-none.ts` | The sounds that are wired up and have nothing to draw, with the reason |
| `tools/director/src/sound-link-none-b.ts` | The sounds wired up with nothing to draw, the second page — from THE SCUTTLE on |
| `tools/director/src/sound-link-none-c.ts` | The sounds wired up with nothing to draw, the third page — from THE GAUGE on |
| `tools/director/src/sound-row.ts` | **One sound, as a row of the catalogue sheet.** Its own file beside `sound-page.ts` |
| `tools/director/src/pose-type.ts` | What a pose *is* — the shape of one, and the two things a caller can ask of one without building it |
| `tools/director/src/pose-commands.ts` | the commands a pose presses, spelled short — `aim`, `ward`, `guard`, `suck`, `prime`, `shoot`, `pullCord`, `hold` — one builder per verb, re-exported by the kit |
| `tools/director/src/phone-view.ts` | WHICH OF THE THREE VIEWS THE PHONE IS SHOWING, AS ONE OWNER |
| `tools/director/src/versus-crop.ts` | One side of a VERSUS pair: a whole phone, drawn, shown through the window its pose's own `crop` cuts in it |
| `tools/director/src/versus-diff.ts` | How two pictures of the same frame are compared — the pixel arithmetic behind `versus-seat.ts` |
| `tools/hooks/after-svg-edit.ts` | A drawn picture is the one thing a session cannot check by reading it back |
| `tools/director/src/skins/glass.ts` | GLASS — a body you see *into*, rather than one with things drawn on it |
| `tools/director/src/entry-fields-balloon.ts` | **THE BALLOON's one authored fact**: how fast it climbs |
| `tools/director/src/entry-fields-mine.ts` | **THE MINE's two per-arrival facts**, and the first pair in this game that are not about how a body moves or… |
| `tools/director/src/entry-fields-moult.ts` | **THE MOULT's one per-arrival fact**: what it is carrying for the beats it is wearing its cargo rather than… |
| `tools/director/src/field-controls-balloon.ts` | THE BALLOON's two handles, in a file of their own |
| `tools/director/src/field-controls-baton.ts` | THE BATON's two thumbs on its own arm, in a file of their own — `field-controls-page.ts` is at its limit |
| `tools/director/src/field-controls-bosses.ts` | **Every boss's own rows** on the ON THE FIELD tab, in the order they were built |
| `tools/director/src/field-controls-gum.ts` | THE GUM's one gesture, in a file of its own on `field-controls-balloon.ts`'s pattern |
| `tools/director/src/field-controls-gorge.ts` | THE GORGE's two thumbs, in a file of their own — `field-controls-page.ts` is at its limit |
| `tools/director/src/field-controls-gauge.ts` | THE GAUGE's two thumbs on the dial, in a file of their own — `field-controls-page.ts` is at its limit |
| `tools/director/src/field-controls-gimbal.ts` | THE GIMBAL's two rings, as rows of the ON THE FIELD tab |
| `tools/director/src/field-controls-rows.ts` | How one row of the ON THE FIELD tab is drawn |
| `tools/director/src/field-controls-ratchet.ts` | THE RATCHET's catch and pawl, as rows of the ON THE FIELD tab |
| `tools/director/src/field-controls-tether.ts` | THE WARDEN'S rope in each of the four looks the game keeps, drawn under its row on the ON THE FIELD tab |
| `tools/director/src/field-controls-throat.ts` | **THE THROAT's two hands**, in a file of its own, the split every boss since THE INSTAR has made |
| `tools/director/src/field-controls-taster.ts` | **THE TASTER's three thumbs on its own fan**, in a file of its own |
| `tools/director/src/field-controls-orrery.ts` | THE ORRERY's ring, as a row of the ON THE FIELD tab — its own file for `field-controls-balloon.ts`'s reason |
| `tools/director/src/field-controls-sinew.ts` | THE SINEW's two handles, in a file of their own |
| `tools/director/src/field-controls-surge.ts` | THE SURGE's one handle, in a file of its own |
| `tools/director/src/field-controls-stare.ts` | THE STARE's lid, in a file of its own — `field-controls-page.ts` is at its limit |
| `tools/director/src/field-controls-scuttle.ts` | **THE SCUTTLE's hanging part**, in a file of its own, the split every boss since THE INSTAR has made |
| `tools/director/src/field-controls-scout.ts` | **THE SCOUT's two hands on its own picture**, in a file of its own |
| `tools/director/src/field-controls-snake.ts` | **SNAKE's two hands on its own body**, in a file of its own, the split every boss since THE INSTAR has made |
| `tools/director/src/field-controls-spool.ts` | THE SPOOL's brake, as one row of the ON THE FIELD tab |
| `tools/director/src/field-controls-antiphon.ts` | THE ANTIPHON's one handle, in a file of its own |
| `tools/director/src/field-controls-instar.ts` | THE INSTAR's marks, in a file of their own |
| `tools/director/src/field-controls-filament.ts` | THE FILAMENT's line, in a file of its own |
| `tools/director/src/field-controls-fleet.ts` | **THE FLEET's three thumbs on the chart**, in a file of their own |
| `tools/director/src/field-controls-queen.ts` | THE BULB QUEEN's marks, in a file of their own — `field-controls-page.ts` is at its limit |
| `tools/director/src/field-controls-mirror.ts` | THE MIRROR's lobes, in a file of their own — `field-controls-page.ts` is at its limit |
| `tools/director/src/field-controls-maze.ts` | THE MAZE's two handles, in a file of their own — `field-controls-page.ts` is at its limit |
| `tools/director/src/field-controls-diastole.ts` | THE DIASTOLE's clamp, in a file of its own — `field-controls-page.ts` is at its limit |
| `tools/director/src/field-controls-warden.ts` | THE WARDEN's thumb and swipe, the director's two rows |
| `tools/director/src/field-controls-well.ts` | **THE WELL's seam**, in a file of its own, the split every boss since THE INSTAR has made |
| `tools/director/src/field-controls-candle.ts` | THE CANDLE's wick: the ON THE FIELD row for the one handle taken hold of in the dark |
| `tools/director/src/field-controls-curtain.ts` | **THE CURTAIN's hem**, in a file of its own, the split every boss since THE INSTAR has made |
| `tools/director/src/field-controls-hive.ts` | **THE HIVE's underside**, in a file of its own, the split every boss since THE INSTAR has made |
| `tools/director/src/field-controls-hasp.ts` | THE HASP's latch and wheel, as rows of the ON THE FIELD tab |
| `tools/director/src/field-controls-lead.ts` | **THE LEAD's stalk**, in a file of its own, the split every boss since THE INSTAR has made |
| `tools/director/src/field-controls-ledger.ts` | **The navigator's two hands on THE LEDGER's root**, in a file of its own |
| `tools/director/src/field-controls-vane.ts` | **THE VANE's two hands**, in a file of its own, the split every boss since THE INSTAR has made |
| `tools/director/src/field-controls-undertow.ts` | **THE UNDERTOW's two thumbs**, in a file of its own, the split every boss since THE INSTAR has made |
| `tools/director/src/ship-fields-balloon.ts` | THE BALLOON's eight numbers, sorted into their card |
| `tools/director/src/ship-fields-choreo.ts` | **The choreographed bosses' dials**, sorted into their cards |
| `tools/director/src/ship-fields-choreo-b.ts` | **The choreographed bosses' dials, the second page** — THE LEDGER and every boss built after it |
| `tools/director/src/ship-fields-choreo-c.ts` | **The choreographed bosses' dials, the third page** — THE SPOOL and every boss built after it |
| `tools/director/src/ship-notes-round.ts` | The paragraph under each **round's** card |
| `tools/director/src/ship-notes-hold.ts` | The paragraph under each card for a **body that has a control of the ship's** — THE GUM on the plating |
| `tools/director/src/ship-notes-hidden.ts` | The paragraph under each card for a **body one seat is not drawn at all**: THE WISP |
| `tools/director/src/ship-notes-boss.ts` | The paragraph under each **boss's** card — the ones played on the field |
| `tools/director/src/ship-notes-twice.ts` | The paragraph under each card for a **body one landed answer does not finish**: THE ECHO, THE RIND |
| `tools/director/src/ship-notes-choreo.ts` | The paragraph under each **choreographed boss's** card |
| `tools/director/src/ship-notes-choreo-b.ts` | The paragraph under each **choreographed boss's** card, the second page |
| `tools/director/src/ship-notes-choreo-c.ts` | The paragraph under each **choreographed boss's** card, the third page |
| `tools/director/src/ship-boss-group.ts` | **The boss group each `BossEntry` kind shows.** It arrived in `ship-groups.ts` with THE CLAW |
| `tools/style-guide/src/colour.ts` | the swatch grid and the hue dial — every colour under its rule, and the twelve body hues at their measured angles |
| `tools/style-guide/src/families.ts` | Every swatch in `PALETTE`, filed under the rule it belongs to |
| `tools/style-guide/src/form.ts` | the drawn panels: the stroke build-up, the size ladder down to 11 px, and the five living silhouettes |
| `tools/style-guide/src/main.ts` | `bun run style-guide` — the specimen sheet for `docs/style-guide.md` |
| `tools/style-guide/src/page.ts` | Page furniture for the style-guide specimen sheet |
| `tools/style-guide/src/depth.ts` | the posed body beside the placed one, through half a turn — why an affine can never bring a mark out from behind |
| `tools/director/src/tails/plume.ts` | A filled tongue back along the body's own axis, three soft balls down it and a near-white root |
| `tools/director/src/tails/wake.ts` | Four short bars lying **across** the line behind the body, shrinking and fading with age |
| `tools/director/src/tails/braid.ts` | Two ribbons of flame wound round one axis half a turn apart and rolling on the beat |
| `tools/director/src/tails/cinders.ts` | Eight cooling embers hanging back down the line the body came along |
| `tools/director/src/tails/flame.ts` | A flame that leaves the body narrow, opens into a belly a third of the way back and frays out into nothing |
| `tools/director/src/typing.ts` | Whether the keyboard belongs to a field rather than to the director |
| `tools/director/src/stage-balloon-both.ts` | **Both of THE BALLOON's handles off one mouse**, and only under TEST |
| `tools/director/src/style-colour.ts` | The colour half of the STYLE page: every swatch in `PALETTE`, filed under the rule it belongs to |
| `tools/director/src/style-form.ts` | The form half of the STYLE page: how a body is drawn, how big it ships, what makes one nameable |
| `tools/director/src/style-page.ts` | DOCUMENTATION → STYLE: the whole visual language on one page, drawn live |
| `tools/frames/press-command.ts` | What one `--press` actually sends, once the line has been taken apart |
| `tools/frames/press-column.ts` | what a column in `--press` points at, said before the capture |
| `tools/frames/press-spec.ts` | **What a caller sends into the page**, as opposed to what it asks the page for |
| `tools/frames/press-standing.ts` | what the wave sends into a pressed column, and whether any of it is above the hull on that beat |
| `tools/frames/press-seats.ts` | whose thumb a `--press` claims to be, asked of the panel being photographed rather than of a table here |
| `tools/hooks/after-depth-edit.ts` | a depth claim is the drawing mistake that looks like a success — names the projection to call and the cues to check |
| `tools/hooks/after-compact.ts` | What a session is told the moment its conversation has been compacted |
| `tools/hooks/after-edit-size.ts` | One line on the edit that takes a file within 88% of the line ceiling, so the seam is chosen before the check goes red |
| `tools/hooks/heredoc.ts` | The guard's one rule about a heredoc body: a doubled backslash the Bash tool would halve is refused, with the two ways that work |
| `tools/hooks/bun-pin.ts` | The bun this repository is pinned to, read off `.bun-version`, and what to say to a session running an older one |
| `tools/hooks/written-paths.ts` | The files a bash command wrote, read out of the command line itself |
| `tools/shape-sheet/src/cues.ts` | `bun run shapes:cues` — the motion half of `report.ts`, with a placed surface as its last row |
| `tools/shape-sheet/src/depth-cues.ts` | the numbers for motion: drawn aspect, the period count on width and sway, how far a cycle is from mirroring itself, and whether anything is revealed |
| `tools/frames/crank.ts` | A turn of THE CLAW's crank, expanded from one `--press` into the stream of bearings that winds rope |
| `tools/frames/drive.ts` | The three verbs a capture drives the page with, and the rule each of them carries |
| `tools/frames/director-serve.ts` | GETTING A DIRECTOR RUNNING SO A PICTURE CAN BE TAKEN OFF IT |
| `tools/frames/flags.ts` | Every `--hold` on the command line rather than the first, and the one tick line the ticked ones join |
| `tools/frames/fault.ts` | `--fault <kind>[:<numbers>]` — the wave's fault, written on the world from outside it |
| `tools/frames/frame-files.ts` |  |
| `tools/frames/page-handle.ts` | The handle `window.neonSpore` installs, as this tool sees it — every field, and the build that added it |
| `tools/frames/page-said.ts` | What the page said while `shot.ts` waited for it — its throws and console errors, printed above *is the tab right?* |
| `tools/frames/pixels.ts` | **A screenshot read back as the picture it is**, rather than as the file it arrived in |
| `tools/frames/picture.ts` | encoding a decoded PNG again, and magnifying a rectangle of one pixel for pixel — what `bun run crop` is made of |
| `tools/frames/pair.ts` | two pictures as one, before first, stacked or side by side by the shape a phone reads best |
| `tools/frames/report.ts` | What a finished capture prints, including the `world.tick` each frame was actually taken at |
| `tools/frames/relay-up.ts` | **The relay, up and then down again**, for a tool that needs one for the length of one run |
| `tools/frames/reach.ts` | **How the first picture's tick is reached** — the presses on their way |
| `tools/frames/result.ts` | **What a capture answers with** — the paths, the digest of each whole frame, the tick each was taken at and what fired on the way; the mirror of `spec.ts` |
| `tools/frames/room-shot.ts` | `bun run room-shot <out-prefix> [--size 390x844] [--scale 2] [--names "ADA,BEN"]` |
| `tools/frames/room-phones.ts` | A PHONE IN A ROOM, as `room-shot.ts` and a throwaway probe both drive one |
| `tools/frames/ring.ts` | **A turn of THE ORRERY's ring, written on the press line.** The crank's own case, one boss over |
| `tools/frames/shot-usage.ts` | What `bun run shot` prints when it is called with nothing to photograph |
| `tools/frames/shot-state.ts` | Getting the page into the state that is worth photographing |
| `tools/frames/shot-flags.ts` | READING `bun run shot`'s COMMAND LINE — every flag it takes |
| `tools/frames/sheet.ts` | **A STRIP OF FRAMES AS ONE PICTURE**, so a scene can be watched rather than read a frame at a time |
| `tools/frames/snake-press.ts` | **SNAKE's two hands on the body, written on the press line.** Past `snakeGorgeTiles` the jaws stick and the… |
| `tools/frames/tall.ts` | An element taller than the window, photographed whole rather than black below the fold |
| `tools/frames/versus-shot.ts` | `bun run versus:shot` — one PNG of one VERSUS candidate |
| `tools/frames/versus-element.ts` | What `versus:shot --at` is measured against: the window the pose cuts, not the stage |
| `tools/frames/menu-shot.ts` | `bun run menu-shot <out.png> [--page "SETTINGS > CONTROLS"] [--back] [--screen "#backAsk.on"]` — a page of the game's menu, or the card its back gesture opens, off a preview it starts itself |
| `tools/frames/menu-stamps.ts` | WHAT THE CAMERA ARRIVES AS: the browser storage a menu shot is taken with |
| `tools/frames/menu-trail.ts` | WHICH PAGE OF THE MENU A PICTURE IS OF, what is typed into it and which back gestures got there, read off three flags |
| `tools/frames/menu-device.ts` | WHAT KIND OF DEVICE THE MENU IS PHOTOGRAPHED AS — a thumb by default, a mouse only when asked |
| `tools/frames/menu-press.ts` | which button a word in a `--page` trail means, on whichever screen is up — the menu, or what a press on it opened |
| `tools/frames/until.ts` | **Stopping on the tick something happened, instead of on a number.** `--ticks` is an absolute `world.tick` |
| `tools/frames/until-flags.ts` | **`--until` and the two numbers that ride on it, read off the command line**: how far to look |
| `tools/director/src/stage-trail.ts` | THE MOUSE'S OWN INK, ON THE DIRECTOR'S FIELD |
| `tools/director/src/stage-draft.ts` | **What the wave being edited says about itself**, read fresh on every call |
| `tools/director/src/stage-field.ts` | **What the stage hands a hit test**, and nothing else |
| `tools/director/src/stage-cue-key.ts` | **`3` does what the field is asking**, for both seats at once |
| `tools/director/src/stage-cue-gesture.ts` | **What the held `3` does next**, on the one boss whose marks are not a press |
| `tools/director/src/stage-cue-hand.ts` | **The desk's two thumbs**: what `3` has hold of, and what it does with it on every tick it stays down |
| `tools/director/src/stage-step.ts` | **one tick of the stage's world and one frame of its picture** — what the loop next door calls, and the first of the stage's own running `bun test` can drive |
| `tools/director/src/splice-editor.ts` | THE SPLICE's rounds, which are one number each |
| `tools/check/installed.ts` | Whether this worktree's install is still the one the tree needs |
| `tools/check/run.ts` | The preflight `bun run check` runs before the typecheck |
| `tools/check/reap.ts` | **A runner's children go when it does.** A `check:fast` sent SIGTERM on 23 September 2026 left its `bun test`… |
| `tools/check/fast-scope.ts` | Which tests `bun run check:fast` runs — the diff's reach, plus the tree-wide sweeps |
| `tools/check/fast.ts` | The test half of `bun run check:fast` — decide, say, run |
| `tools/check/profile-report.ts` | The reading half of `bun run test:profile`: a JUnit report from `bun test` turned into the slowest files and cases |
| `tools/check/profile.ts` | `bun run test:profile [paths...] [--top N]` — which test files carry the minutes |
| `tools/check/shard.ts` | `bun test`, in several processes at once — the test half of `bun run check` |
| `tools/check/shards.ts` | The arithmetic of a sharded `bun test`: which file goes in which bin, how many bins, and the pool that runs them a few at a time |
| `tools/check/slots.ts` | How many `bun test` shards this machine runs at once, counted across every worktree together rather than within one check |
| `tools/check/junit.ts` | The shards' JUnit reports, read and merged: each header's tally, the merge the profile reads as one run, and the first failing case |
| `tools/check/closing.ts` | **What `shard.ts` prints once every shard is in**: the counts, the first failure under them |
| `tools/breaks/src/main.ts` | `bun run breaks` — every break the engine can make, drawn across time |
| `tools/breaks/src/page.ts` | Page furniture for the break sheet |
| `tools/breaks/src/sheet.ts` | Every break the bench knows, drawn across time |
| `tools/breaks/src/subjects.ts` | The breaks this bench draws, and the one place a new one is added |
| `tools/director/src/fillings/bloom.ts` | BLOOM — a nucleus that sends something out along its veins |
| `tools/director/src/fillings/chambers.ts` | CHAMBERS — the lobes are rooms |
| `tools/director/src/fillings/filament.ts` | FILAMENT — one thread wound round the inside |
| `tools/director/src/fillings/gut.ts` | GUT — one tube, coiled, threaded through both sacs |
| `tools/director/src/fillings/lattice.ts` | LATTICE — a rigid frame inside a soft body |
| `tools/director/src/fillings/lantern.ts` | LANTERN — the body is a ball under the key light |
| `tools/director/src/fillings/nucleus.ts` | NUCLEUS — one heavy thing loose in a shell |
| `tools/director/src/fillings/parts.ts` | What every filling is built out of |
| `tools/director/src/fillings/roe.ts` | ROE — the sacs are full of eggs |
| `tools/director/src/fillings/sediment.ts` | SEDIMENT — something heavy has settled in the bottom of each sac |
| `tools/director/src/fillings/spores.ts` | SPORES — the body is full, and it is a spore case |
| `tools/director/src/fillings/types.ts` | What is *inside* a body, as against what its surface is made of |
| `tools/director/src/fillings/vent.ts` | VENT — a mouth on the surface, opening and closing |
| `tools/director/src/fillings/vortex.ts` | VORTEX — the inside is a throat, not a ball |
| `tools/director/src/fillings/hollow.ts` | HOLLOW — the body is a bell of glass, lit on the inside of its far wall, with a heart hanging inside it |
| `tools/director/src/fillings/helix.ts` | HELIX — something coiled is growing inside the ball, and it is winding |
| `tools/director/src/fillings/orbit.ts` | ORBIT — one band of light girdles the ball at a tilt, and the ball is in the way of half of it |
| `tools/director/src/fillings/yolk.ts` | YOLK — nine granules suspended in a lit mass, carried round by the turn, and a pale nucleus that does not move |
| `tools/director/src/fault-config.ts` | **The rows under the map that configure the faults on the selected row**: how many beats each one holds |
| `tools/director/src/fault-notes.ts` | **What a fault is called, and the sentence an author needs while placing one.** Every word the malfunction… |
| `tools/director/src/library-panel.ts` | The LIBRARY view on SHAPES: the game's own looks, each on a card, drawn by the game's own code |
| `tools/director/src/library/types.ts` | What an asset in the LIBRARY is, and what it is told |
| `tools/director/src/library/wisp-assets.ts` | THE WISP's four fringes — what hangs under the bell |
| `tools/director/src/library/wisp-comb.ts` | COMB — eight comb rows under the hem, each a run of paddles beating one after the next |
| `tools/director/src/library/wisp-skirt.ts` | SKIRT — one continuous veil hanging from the whole hem, scalloped at its foot, with folds that go round |
| `tools/director/src/library/wisp-stage.ts` | The game's own wisp, drawn on a card wearing a fringe of the caller's choosing |
| `tools/director/src/library/warden-assets.ts` | THE WARDEN's four surfaces — everything on the ring between its material and the door over its eye |
| `tools/director/src/library/warden-stage.ts` | The game's own warden, drawn on a card wearing a surface of the caller's choosing |
| `tools/director/src/library/volley-assets.ts` | THE VOLLEY's three shells — what the stone is and what a seam is |
| `tools/director/src/library/volley-stage.ts` | The game's own volley, drawn on a card wearing a shell of the caller's choosing |
| `tools/director/src/library/veil-assets.ts` | THE VEIL's four clouds — what the weather is made of between its rim and its lightning |
| `tools/director/src/library/veil-stage.ts` | The game's own veil, drawn on a card with a cloud mass of the caller's choosing |
| `tools/director/src/library/lid-assets.ts` | THE LID's three armours — what stands between the pair and the lens, and how it gets out of the way |
| `tools/director/src/library/lid-stage.ts` | The game's own lid, drawn on a card wearing armour of the caller's choosing |
| `tools/director/src/library/mount-assets.ts` | THE GYRE's mounts — the two contours offered for a body that stands on a turning rim |
| `tools/director/src/library/mount-stage.ts` | One of THE GYRE's mounts, drawn on a card with a contour of the caller's choosing |
| `tools/director/src/library/queen-assets.ts` | THE BULB QUEEN's four shells — what the biggest body on any field is made of |
| `tools/director/src/library/queen-stage.ts` | THE BULB QUEEN's shell, drawn on a card by a look of the caller's choosing |
| `tools/director/src/library/recoil-assets.ts` | THE RECOIL's five cages — the frame round a body that turns its colour over on every bounce |
| `tools/director/src/library/recoil-stage.ts` | The game's own recoil, drawn on a card inside a cage of the caller's choosing |
| `tools/director/src/library/rind-assets.ts` | THE RIND's four sheds — the half-second in which a layer comes off |
| `tools/director/src/library/rind-stage.ts` | The game's own rind, losing its layers on a card, each one drawn coming off by a shed of the caller's choosing |
| `tools/director/src/library/countdown-assets.ts` | THE COUNT's four counts — how a body says how many beats are left, on the one screen that is shown it |
| `tools/director/src/library/countdown-stage.ts` | The game's own count, drawn on a card wearing a look of the caller's choosing |
| `tools/imports/classify.ts` | Which of a file's characters are code rather than a comment or a string |
| `tools/imports/imports.ts` | Dropping the names a file split strands in an import list, and refusing to delete a statement |
| `tools/imports/run.ts` | `bun run imports` — drop the names a file split stranded in an import list |
| `tools/imports/scan.ts` | Where a file's import statements are: which names each one binds, and what text binds them |
| `tools/words/clean.ts` | The waves and mechanics whose player-facing text already reads cleanly |
| `tools/words/measure.ts` | What makes a line of player-facing text readable, as numbers a test can hold |
| `tools/words/run.ts` | `bun run words` — every line a player reads, measured against the rules in `.claude/skills/game-words` |
| `tools/words/text.ts` | Every string in `packages/content` that a player reads, collected once |

<!-- index:code:end -->
