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
| `docs/choosing-a-model.md` | you are writing a prompt and picking a model and a thinking effort |
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
| `docs/queue.md` | you found a technical improvement and are not doing it now, or you are opening a session to drain one — `bun run queue` |
| `docs/parked.md` | you are stopping mid-way through something, or picking up what a session left half-done — the front of the same queue, work only, never ideas |
| `docs/performance.md` | you added a shape or an animation, or you want to know what a frame costs and where the time goes — `bun run perf` |
| `docs/token-budget.md` | you wonder why files are small and docs are split |
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
| `docs/spec/structure.md` | you touch waves, score, saving or randomness |
| `docs/spec/briefings.md` | you teach the pair a mechanic or a creature |
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
| `docs/spec/transfers-bosses.md` | you are designing a boss, or looking for a body for an empty act slot |

The German original has been translated in full and deleted; it is in the git
history if the wording of a rejected idea is ever needed.

## Code

Every `.ts` file under `packages/*/src/**` and `apps/*/src/**` (barrels and
tests excepted) needs a row here; `tools/index/test/index.test.ts` fails and
names the path when one is missing or a row's file has been deleted. Run
`bun run index` to add the missing rows, then edit the new row's text in
place — the generator keeps whatever is there.

<!-- index:code:start -->

### packages/sim

| Path | One line |
|---|---|
| `packages/sim/src/config.ts` | every tunable number, `ticksPerBeat`, `hullRow` |
| `packages/sim/src/rng.ts` | the only permitted source of randomness |
| `packages/sim/src/types.ts` | creatures, bullets, scars, commands |
| `packages/sim/src/world.ts` | the `World` shape and `createWorld`; `step` itself lives in `step.ts` |
| `packages/sim/src/beat.ts` | the beat: spawning, gliding, the hull, the guard rule |
| `packages/sim/src/commands.ts` | what a press does: the cannon, the shield, the trigger, the grip, the lance |
| `packages/sim/src/grip.ts` | THE GRIP: a hand held on a rock, and how much it slows |
| `packages/sim/src/boss.ts` | the Bulb Queen, and which boss a beat belongs to |
| `packages/sim/src/simon.ts` | THE MIRROR's vocabulary: what a step is, what it remembers |
| `packages/sim/src/mirror.ts` | THE MIRROR's choreography: count in, perform, listen |
| `packages/sim/src/mirror-round.ts` | how a round ends: the echo strike, the break, the bait |
| `packages/sim/src/entries.ts` | what a wave hands the sim: spawns, pods, either boss |
| `packages/sim/src/bullets.ts` | firing and tile-wise travel |
| `packages/sim/src/bullet-hit.ts` | what a shot does when it meets something, and whether it goes on |
| `packages/sim/src/lance.ts` | THE LANCE: a lobe filled by one player, spent by the other |
| `packages/sim/src/pods.ts` | pods: hanging, shot loose, falling, taken in |
| `packages/sim/src/balance.ts` | the balance sheet: joint moments, SYNC, the streak |
| `packages/sim/src/hash.ts` | world fingerprint — desync detection |
| `packages/sim/src/replay.ts` | the test format: inputs in, fingerprint out |
| `packages/sim/src/boss-state.ts` | everything the Bulb Queen encounter remembers between beats |
| `packages/sim/src/briefing.ts` | how a wave opens, and the only part of it the simulation owns |
| `packages/sim/src/clasp.ts` | THE CLASP: a slick or a bulb inside a shield of its own, becoming a different creature instead of dying |
| `packages/sim/src/command-types.ts` | what a press *is*, as a flat union — so that a replay is a list of these and nothing else |
| `packages/sim/src/config-boss.ts` | the numbers the bosses own |
| `packages/sim/src/config-creatures.ts` | how long one creature's own clock runs, and the shapes it moves |
| `packages/sim/src/config-gauge.ts` | THE GAUGE's numbers — the first of the twelve rounds, and its whole difficulty |
| `packages/sim/src/config-pair.ts` | the switch that exists because the game has two people in front of it |
| `packages/sim/src/config-shot.ts` | everything about a shot, as numbers: speed, rate, hold value, which moments it may leave on |
| `packages/sim/src/creature-kinds.ts` | every body that can stand on the field, as a name, in the fixed order the world fingerprint writes it in |
| `packages/sim/src/creature-rules.ts` | the state machines the bestiary asks for that are small enough to be one function each |
| `packages/sim/src/dart.ts` | THE DART: the first body that does not hold its lane |
| `packages/sim/src/events.ts` | everything the simulation reports about a tick, and the whole of what it says to anybody |
| `packages/sim/src/gauge-round.ts` | THE GAUGE's clock: the three phases, the way in and the way out |
| `packages/sim/src/gauge.ts` | THE GAUGE: one needle, two marks, one of you reading and the other turning |
| `packages/sim/src/hash-boss.ts` | the boss half of the world fingerprint |
| `packages/sim/src/hull-types.ts` | what the hull remembers: where it broke, and how the pair have been doing at stopping it breaking |
| `packages/sim/src/hull.ts` | the row the shield answers a rock on: one above the ship's own |
| `packages/sim/src/kinds.ts` | what a `CreatureKind` *means*: colour, fall speed, width, whether a hand may be put on it |
| `packages/sim/src/maze-clock.ts` | THE MAZE's clock: how long each part of a round stands, in beats |
| `packages/sim/src/maze-controls.ts` | THE MAZE's two verbs, and they are the whole of what the pair can do |
| `packages/sim/src/maze-round.ts` | the round the pair plays against THE MAZE, and what it costs them |
| `packages/sim/src/maze-wheel.ts` | THE MAZE's drum as a *written-down thing*: its circles, walls and openings, and what is wrong with them if they were typed wrong |
| `packages/sim/src/maze.ts` | THE MAZE's wheel, as arithmetic |
| `packages/sim/src/queen-mark.ts` | the mark itself: the two vulnerable spots cradled under her middle, only one ever real |
| `packages/sim/src/run.ts` | the run, as opposed to the beat |
| `packages/sim/src/shell-round.ts` | the round the pair plays against THE SHELL, which is two rounds and the turn between them |
| `packages/sim/src/shell.ts` | THE SHELL's armour, as arithmetic |
| `packages/sim/src/shot-charge.ts` | the shot is laid, not fired |
| `packages/sim/src/step.ts` | advance exactly one tick |
| `packages/sim/src/vane-cycle.ts` | THE VANE's cycle, as arithmetic |
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
| `packages/sim/src/fleet.ts` | THE FLEET: one seat holds the map, the other holds the sights, and neither can reach the other's half |
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
| `packages/sim/src/config-gyre.ts` | you are retuning the wheel — how fast the rim turns, how much the maw takes off it, how far the diamond sinks |
| `packages/sim/src/pod-types.ts` | you need what a pod *is* rather than what one does — the shape, lifted out of `types.ts` beside `hull-types.ts` |
| `packages/sim/src/hash-creature.ts` | you added a field to `Creature` and have to put it in the fingerprint |
| `packages/sim/src/field.ts` | taking a body off the field — the counterpart to `spawn.ts` |
| `packages/sim/src/config-derived.ts` | what the config implies: ticks per beat, ms to ticks, the hull row, the middle column |
| `packages/sim/src/bullet-hit-boss.ts` | a shot met the queen or the warden and you want to know which half of the pair a rejection is charged to |
| `packages/sim/src/bullet-types.ts` | you need what a bullet *is* rather than what one does — the shape, lifted out of `types.ts` beside `pod-types.ts` |
| `packages/sim/src/lid.ts` | you are working on the armoured eye — the cord, how far the plates have parted, and what a shot into it does |
| `packages/sim/src/config-ghost.ts` | THE GHOST's numbers: what one is worth, the row a crossing one prowls along, how far it goes each beat, how |
| `packages/sim/src/boss-surface.ts` | Every name the boss code puts on `@neon-spore/sim`'s surface, written out |
| `packages/sim/src/handle-pull.ts` | a hand is carrying a handle and you need to know how far it may go — the taut length, the field it may not leave, and how taut is measured |
| `packages/sim/src/wave-end.ts` | How a wave ends, in one place, because two paths reach it |
| `packages/sim/src/warden-rope.ts` | you are working on THE WARDEN's line — the hand on it, how taut it is, and when it is lowered or cut |
| `packages/sim/src/snake-open.ts` | Opening a round and starting an attempt over — the two places a `SnakeState` is written from nothing |
| `packages/sim/src/scene.ts` | you are changing what a guide's rehearsal is — a small world, built from a script and looped |
| `packages/sim/src/ready-gate.ts` | you are changing the two circles a guide ends on — what fills one, what empties it, and how long the hold is |
| `packages/sim/src/config-recoil.ts` | THE RECOIL's numbers: how many times a shot fails to kill it |
| `packages/sim/src/creature-types.ts` | What a **body on the field** is made of |
| `packages/sim/src/recoil.ts` | THE RECOIL: a slick or a bulb inside a sprung cage, and the first body a landed shot sends the **wrong way** |
| `packages/sim/src/guide-steps.ts` | A guide the pair turns the pages of, one seat at a time |
| `packages/sim/src/carom.ts` | THE CAROM: a slick or a bulb sealed inside a hurtling rock crust |
| `packages/sim/src/config-carom.ts` | THE CAROM's numbers: how steeply it crosses the field, what cracking one open is worth |
| `packages/sim/src/impact.ts` | **What one body costs the hull when it reaches it**, for everything the shield was never offered |
| `packages/sim/src/creature-state.ts` | **The state one kind carries and no other does.** Every field here is optional |
| `packages/sim/src/chute.ts` | THE CHUTE: the slick or the bulb thrown clear of a cracked carom |
| `packages/sim/src/events-carom.ts` | **Everything THE CAROM and the body it throws out do**, as events |
| `packages/sim/src/config-pod.ts` | THE POD's numbers: how a capsule shot loose falls, how it steers itself into the maw |
| `packages/sim/src/config-volley.ts` | THE VOLLEY's numbers: how steeply it comes in, how far a ward throws it back up the field |
| `packages/sim/src/cross.ts` | **A body crossing the field and turning at its side walls** |
| `packages/sim/src/events-volley.ts` | **What THE VOLLEY does**, as events: a ward that sends it back |
| `packages/sim/src/volley.ts` | THE VOLLEY: a rock coming in on a diagonal with a body sealed inside it |
| `packages/sim/src/ward.ts` | **What the shield does with a body it turns**, which used to be one answer and is now two |
| `packages/sim/src/colour-armour.ts` | What a shot of the wrong colour leaves behind on an ordinary body: a window in which nothing at all reaches it |
| `packages/sim/src/maze-solve.ts` | The way through THE MAZE's drum, worked out from the walls rather than typed beside them |
| `packages/sim/src/maze-hash.ts` | What THE MAZE puts into `hashWorld`, and nothing else |
| `packages/sim/src/maze-verdict.ts` | How an attempt on THE MAZE ends, and what it costs |
| `packages/sim/src/hull-guard.ts` | **The shield's own arithmetic**: where it stands, how long its window is open |
| `packages/sim/src/config-veer.ts` | THE VEER's two numbers: how far apart the rows it changes lane on are, and the widest a single change can reach |
| `packages/sim/src/creature-state-held.ts` | **The state a hand writes**, as opposed to the state the beat writes |
| `packages/sim/src/veer.ts` | THE VEER: the first rock that does not hold its lane |
| `packages/sim/src/lock.ts` | THE LOCK: the hand player 1 already has on the field, read a second way |
| `packages/sim/src/mid-beat.ts` | **Where a thing stands between two beats**, in thousandths of a tile |
| `packages/sim/src/scene-aim.ts` | The three acts a film aims rather than writes down, resolved against a world |
| `packages/sim/src/boss-round.ts` | Stand the boss on a numbered round, through that fight's own way into one |
| `packages/sim/src/config-strand.ts` | THE STRAND's three numbers: the default length of a thread, and what a bead and a whole thread are worth |
| `packages/sim/src/creature-state-strand.ts` | **THE STRAND's three fields**, and the whole of what one bead remembers |
| `packages/sim/src/events-strand.ts` | THE STRAND's three: a bead shrivelling, a raisin swelling back, and the thread itself parting |
| `packages/sim/src/strand-round.ts` | What **happens** to a thread: the shot that meets a bead, and the thread parting once nothing on it is alive |
| `packages/sim/src/strand.ts` | THE STRAND: what a thread of beads is — where they stand, what colour each carries, and which one may be shot |
| `packages/sim/src/creature-state-veer.ts` | **THE VEER's two fields**, a side and a width |
| `packages/sim/src/slow-fall.ts` | The bodies that come down **slower than a tile a beat** |
| `packages/sim/src/strand-shape.ts` | THE STRAND's shape, as arithmetic |
| `packages/sim/src/strand-spawn.ts` | How a thread comes onto the field: one queue entry in, two to five bodies out |
| `packages/sim/src/throb.ts` | the throb's clockwise turn, which half a shot met, and what it costs |
| `packages/sim/src/boss-entries.ts` | **What a wave authors when it wants a boss** — nine shapes, the union of them |
| `packages/sim/src/config-crawler.ts` | THE CRAWLER's five numbers: how long a worm is when the wave does not say, how fast it walks |
| `packages/sim/src/crawler-beat.ts` | **A beat of every worm on the field**: the step it takes, the shield it may walk into |
| `packages/sim/src/crawler-round.ts` |  |
| `packages/sim/src/crawler.ts` | THE CRAWLER: a maggot that walks the ship's own surface, and the first body |
| `packages/sim/src/creature-state-crawler.ts` | **THE CRAWLER's three fields**, and the whole of what one link remembers |
| `packages/sim/src/events-crawler.ts` | THE CRAWLER's three: a ring coming apart, the worm cleared, and the worm getting in |
| `packages/sim/src/events-ghost.ts` | THE GHOST's three: the body letting go, a wall turned at, and the dive |
| `packages/sim/src/kind-code.ts` | **A kind as a number**, and the compile-time proof that every kind has one |
| `packages/sim/src/lure-exit.ts` | **THE LURE leaving on its own**, which is the one thing in this game a body does at the end of a beat for no… |
| `packages/sim/src/config-creature-scores.ts` | what one creature pays and what one costs, priced against each other |
| `packages/sim/src/creature-roster.ts` | **The fixed order every kind is written into the world fingerprint in.** Cut out of `creature-kinds.ts` when… |
| `packages/sim/src/grippable.ts` | **Whether a hand may be put on a body at all**, and the fourteen refusals that answer it |
| `packages/sim/src/hull-damage.ts` | **What the hull loses, and what it gets back.** Cut out of `hull.ts` when THE GRATE's own answer took that… |
| `packages/sim/src/config-fence.ts` | THE FENCE's two numbers: how wide each way through it is |
| `packages/sim/src/creature-state-fence.ts` | **THE FENCE's two fields**, and both of them are sets of columns: the ways through the wave authored |
| `packages/sim/src/events-fence.ts` | **What THE FENCE does**, as events: the wire going over the ship, and a bolt cutting a way through it |
| `packages/sim/src/fence.ts` | THE FENCE: a live line the width of the field, with gaps burnt through it |
| `packages/sim/src/config-malfunction.ts` | THE MALFUNCTION's four numbers: how often a broken control acts by itself |
| `packages/sim/src/config-view.ts` | **The numbers only the picture reads.** Every field here is taken off `SimConfig` by `packages/render` |
| `packages/sim/src/fault-surface.ts` | Every name THE MALFUNCTION puts on `@neon-spore/sim`'s surface, written out |
| `packages/sim/src/malfunction.ts` | THE MALFUNCTION: a wave in which one of the two seats does not have its control any more — the control has it |
| `packages/sim/src/magnet.ts` | THE MAGNET: the first body in this game that cannot be answered from the column it is standing in |
| `packages/sim/src/events-magnet.ts` | **What THE MAGNET does**, as events: a bolt turned away by the plate slung under the body |
| `packages/sim/src/grip-push.ts` | THE PUSH: the hand on a rock, carried sideways — one column, then a beat of quiet |
| `packages/sim/src/hash-creature-held.ts` | **The fields a hand writes**, folded into the fingerprint |
| `packages/sim/src/config-claw.ts` | THE CLAW's numbers — the rail, the clock, and what a bad grab costs |
| `packages/sim/src/snake-hash.ts` | What SNAKE puts into `hashWorld`, and nothing else |
| `packages/sim/src/coil.ts` | THE COIL: a rock sitting inside a dome of its own |
| `packages/sim/src/config-coil.ts` | THE COIL's numbers: how far it crosses the field each beat, how far it sinks at a wall |
| `packages/sim/src/events-coil.ts` | **THE COIL's two**: a dome coming off, and the charge it was holding leaving for the next one |
| `packages/sim/src/own-step.ts` | **The bodies that move by a rule of their own instead of falling** |
| `packages/sim/src/creature-state-gyre.ts` | **THE GYRE's four**: the two the hub carries and the two a body on its rim does |
| `packages/sim/src/index-bodies.ts` | **The four bodies that wear something**, narrowed to what render/ and the tools actually ask of each |
| `packages/sim/src/pod-effects.ts` | What a pod *gives*, once the mouth has closed on it |
| `packages/sim/src/reach.ts` | THE CLAW's arm: the cannon's column, reached up instead of fired along |
| `packages/sim/src/index-creatures.ts` | one creature's own rules, as the rest of the repository reads them |
| `packages/sim/src/index-run.ts` | the world, the clock, a wave's start and end, and the fingerprint |
| `packages/sim/src/index-ship.ts` | the ship and what a thumb does to it, as a reading |
| `packages/sim/src/bullet-hit-lure.ts` | What a shot does when it meets THE LURE |
| `packages/sim/src/creature-kinds-many.ts` | the five kinds that are more than one body, answered a part at a time |
| `packages/sim/src/creature-state-heading.ts` | the four kinds that carry a direction, and the beats attached to it |
| `packages/sim/src/events-veil.ts` | THE VEIL's three events: the turn, the rebuff and the tear |
| `packages/sim/src/hash-creature-late.ts` | the tail of one body's fingerprint, cut at a position and never a subject |
| `packages/sim/src/fence-crack.ts` |  |
| `packages/sim/src/hand.ts` | you are deciding what a finger on the field is worth — a brake on a rock, an aim on anything living, nothing where it would be neither |
| `packages/sim/src/coil-state.ts` | **What a coil is right now**: which way it is going, whether it is still wearing its dome |
| `packages/sim/src/config-rock-cross.ts` | **A crossing rock's two numbers**: how far along its row it goes each beat |
| `packages/sim/src/rock-cross.ts` | **A rock authored to cross the field instead of holding its lane** |
| `packages/sim/src/choir-gesture.ts` | **The hand on THE CHOIR**, which is the half of that creature nothing else in this game has |
| `packages/sim/src/choir.ts` | THE CHOIR: three dots in one membrane, and the first body in this game that **no button can reach** |
| `packages/sim/src/config-choir.ts` | THE CHOIR's numbers: how far a hand has to carry an arrow, how long the pair has between the two of them |
| `packages/sim/src/events-choir.ts` | **THE CHOIR's three**: an arrow out, both in, and the window gone |
| `packages/sim/src/command-round.ts` | **The rounds' own verbs**, as their half of the `Command` union |
| `packages/sim/src/config-pulse.ts` | THE PULSE's numbers — the step grid, the two windows a press is judged in |
| `packages/sim/src/pulse-chart.ts` | THE PULSE's chart, as arithmetic: where a note is in time, which note a press is aimed at |
| `packages/sim/src/pulse-controls.ts` | The four verbs of the round — and the first round in the game where both seats have all of them |
| `packages/sim/src/pulse-hash.ts` | What THE PULSE puts into `hashWorld`, and nothing else |
| `packages/sim/src/pulse-round.ts` | THE PULSE's clock: the count-in, the song, and the one way the hull pays |
| `packages/sim/src/pulse.ts` | THE PULSE: the same song on two screens, and neither of you can read all of it |
| `packages/sim/src/pulse-open.ts` | Opening a stage, and opening the round — the two places a `PulseState` is written from nothing |
| `packages/sim/src/lance-burn.ts` | **THE LANCE going off**: the lobe coming full, and the column burning on that tick |
| `packages/sim/src/shot-reach.ts` | **What a shot meets on a stretch of a column**, and the one place that question is answered |
| `packages/sim/src/beatbox-round.ts` | **What happens to a soundbox**: the thumb that lands on it, the run being committed |
| `packages/sim/src/beatbox.ts` | THE BEATBOX: a soundbox that swells on every beat |
| `packages/sim/src/config-beatbox.ts` | THE BEATBOX's numbers: how many beats one asks for, how near the beat a tap has to land |
| `packages/sim/src/creature-state-beatbox.ts` | **THE BEATBOX's three fields**, and the whole of what one box remembers: how many beats it is asking for |
| `packages/sim/src/events-beatbox.ts` | **What THE BEATBOX does**, as events: a tap landing on the beat |
| `packages/sim/src/balloon-pull.ts` | **The two hands on THE BALLOON**, which is the half of that creature nothing else in this game has |
| `packages/sim/src/balloon.ts` | THE BALLOON: the first body in this game that does not come down |
| `packages/sim/src/config-balloon.ts` | THE BALLOON's numbers: how long one swells before it moves, how fast it climbs |
| `packages/sim/src/creature-state-balloon.ts` | **THE BALLOON's six**, and the seventh group carried out of `creature-state.ts` along the seam that file's… |
| `packages/sim/src/drag-targets.ts` | **Every thing on this field a hand may take hold of**, as a closed list of names |
| `packages/sim/src/events-balloon.ts` | **THE BALLOON's three**: one given, one popped, one gone off at the top |
| `packages/sim/src/crank.ts` | THE CLAW's crank: the arm is **wound** home by a finger going round, and a bearing becomes rope |
| `packages/sim/src/config-tell.ts` | THE TELL's numbers, which are two: what a lost rung costs and what running the ladder's clock out costs… |
| `packages/sim/src/tell-hash.ts` | What THE TELL puts into `hashWorld`, and nothing else |
| `packages/sim/src/tell-round.ts` | THE TELL's clock: the lead-in, the ladder, and the two ways the hull pays |
| `packages/sim/src/tell-rules.ts` | The ring, and who wins an exchange |
| `packages/sim/src/tell.ts` | THE TELL: rock, paper, scissors against a boss that shows you its hand |
| `packages/sim/src/bosses-round.ts` | The rounds, as their half of the boss barrel |
| `packages/sim/src/config-rounds.ts` | The rounds' numbers, as one block of `SimConfig` |
| `packages/sim/src/step-round.ts` | The rounds' own tick, and the one thing all five of them have in common |
| `packages/sim/src/pinball-shot.ts` | One shot of PINBALL: where the ball waits, what firing it does, and putting the loop back to the start |
| `packages/sim/src/beatbox-picture.ts` | **THE BEATBOX's readings that decide nothing**: how long ago a thumb counted, how long ago one missed |

### packages/content

| Path | One line |
|---|---|
| `packages/content/src/creatures.ts` | what a creature demands: `CreatureDef`, radar owner, category — the table itself is in `creatures-table.ts` |
| `packages/content/src/waves.ts` | the barrel: every act's array concatenated in order, never a save target |
| `packages/content/src/queue.ts` | wave to spawn queue, seeded per wave |
| `packages/content/src/shapes.ts` | contour maths, shared by canvas and SVG |
| `packages/content/src/silhouettes.ts` | the style guide's tuned shape parameters |
| `packages/content/src/silhouettes-clubbed.ts` | The one body whose contour is **walked** |
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
| `packages/content/src/waves/act-4.ts` | act four, opening on THE WISP; filled the day THE GYRE was written |
| `packages/content/src/ghost-shape.ts` | THE GHOST's contour, which is the third family of them in this package |
| `packages/content/src/snake-rounds.ts` | SNAKE's rounds: three maps, and the map is the fight |
| `packages/content/src/creatures-worn.ts` | the five bestiary rows for bodies drawn as something else — a slick or a bulb under a disguise, plating, a membrane, weather or nothing but a smaller size |
| `packages/content/src/controls-round.ts` | The buttons that belong to a round rather than to the ship |
| `packages/content/src/pinball-rounds.ts` | PINBALL's boards, one per round, **drawn rather than listed** |
| `packages/content/src/waves/act-5.ts` | you are adding a wave — this is the act new ones land in, act four having filled |
| `packages/content/src/lid-shape.ts` | you are tuning THE LID's outline — two arcs meeting at a corner, the fourth contour family here |
| `packages/content/src/scenes.ts` | you are authoring or retiming the rehearsal a guide shows — arrivals, tempo and the acts a ghost thumb plays |
| `packages/content/src/scene-script.ts` | A rehearsal turned into the two things the runner takes: a command track and a whole `SceneScript` |
| `packages/content/src/scene-types.ts` | The shapes a rehearsal is written in |
| `packages/content/src/scenes/first-step.ts` | FIRST STEP's rehearsal: the game's first exchange, in eleven seconds |
| `packages/content/src/scenes/the-hand.ts` | THE HAND's rehearsal: the one verb neither seat owns |
| `packages/content/src/scenes/the-rock.ts` | THE ROCK's rehearsal: the first thing in the game neither of them can do alone |
| `packages/content/src/scenes/the-torch.ts` | TORCH's rehearsal: the warning strip, and the fact that only one of them has it |
| `packages/content/src/scenes/the-dart.ts` | THE DART's rehearsal: the column you were given is the column it has already left |
| `packages/content/src/scenes/the-lure.ts` | THE LURE's rehearsal: the shot you are waiting for must never come |
| `packages/content/src/scenes/the-throb.ts` | THE THROB's rehearsal: the wave where firing on sight is the miss |
| `packages/content/src/scenes/the-veil.ts` | THE VEIL's rehearsal: the colour you were given goes stale while you are loading it |
| `packages/content/src/scenes/salvage.ts` | SALVAGE's rehearsal: shooting something is only half of getting it |
| `packages/content/src/scenes/the-clasp.ts` | THE CLASP's rehearsal: the shield opens the enemy instead of stopping it |
| `packages/content/src/scenes/the-rind.ts` | THE RIND's rehearsal: the shot that lands does not close the column |
| `packages/content/src/scenes/the-third-shot.ts` | THE SHELL's rehearsal: the shot that worked twice is the miss |
| `packages/content/src/scenes/the-echo.ts` | THE ECHO's rehearsal: the slowest thing on the field is the one to take first |
| `packages/content/src/scenes/the-ghost.ts` | THE GHOST's rehearsal: waiting to see it is the miss |
| `packages/content/src/scenes/the-purge.ts` | THE PURGE's rehearsal: the field is cleared by swallowing, not by shooting |
| `packages/content/src/scenes/the-ward.ts` | THE WARD's rehearsal: the shield answers a rock with nobody triggering it |
| `packages/content/src/scenes/the-gyre.ts` | THE GYRE's rehearsal: the column you were told is the right one for a single beat |
| `packages/content/src/scenes/the-recoil.ts` | THE RECOIL's rehearsal: your own shot is what makes the call wrong |
| `packages/content/src/scenes/the-vane.ts` | THE VANE's rehearsal: the column you were told is never the column it lands in |
| `packages/content/src/scenes/the-wisp.ts` | THE WISP's rehearsal: you call the square it is still falling toward |
| `packages/content/src/scenes/bulb-queen.ts` | BULB QUEEN's rehearsal: the first boss, and the first film with no shot in it |
| `packages/content/src/scenes/the-mirror.ts` | THE MIRROR's rehearsal: Simon Says, played on the pair's own controls |
| `packages/content/src/control-command.ts` | What pressing a control *says*, for every control on every panel — one copy, here |
| `packages/content/src/scenes/snake.ts` | SNAKE's rehearsal: the ship is the body, and the one who can see it cannot steer it |
| `packages/content/src/scenes/the-fleet.ts` | THE FLEET's rehearsal: the only one who can see the ships is the one who cannot move the sights |
| `packages/content/src/waves/act-3b.ts` | The second half of act three, cut off `act-3.ts` when that file reached the 250-line ceiling on `THE VEIL` |
| `packages/content/src/intro.ts` | WHAT THIS GAME IS, IN SIX PAGES |
| `packages/content/src/scenes/the-lance.ts` | THE LANCE's rehearsal: one shot instead of three |
| `packages/content/src/scenes/pinball.ts` | PINBALL's rehearsal: the thing you fire from is the thing you have to catch it with |
| `packages/content/src/scenes/the-gauge.ts` | THE GAUGE's rehearsal: neither of them has more than half a dial |
| `packages/content/src/scenes/the-lid.ts` | THE LID's rehearsal: doing your half first is the same as not doing it |
| `packages/content/src/scenes/the-maze.ts` | THE MAZE's rehearsal: he turns the wheel and she fires, and neither can do the other half |
| `packages/content/src/scenes/the-warden.ts` | THE WARDEN's rehearsal: he holds the door open and she has to be quick enough to shoot through it |
| `packages/content/src/creatures-bare.ts` | The three bodies with **nothing laid over them at all**: a slick or a bulb drawn small, drawn large |
| `packages/content/src/mechanics-rocks.ts` | The six rocks' rows, lifted out of `mechanics-table.ts` when THE VOLLEY took that file past its 250-line… |
| `packages/content/src/scenes/the-carom.ts` | THE CAROM's rehearsal: a shape, then an order |
| `packages/content/src/control-sets-table.ts` | Every panel in the game, as a table |
| `packages/content/src/scenes/cyan.ts` | CYAN's rehearsal: the second button, and the cost of the first one |
| `packages/content/src/scenes/two-rocks.ts` | TWO ROCKS' rehearsal: the plate becomes something player 2 can carry |
| `packages/content/src/waves/act-6.ts` | Act six, and it opens with a rock that will not hold its lane |
| `packages/content/src/scenes/the-volley.ts` | THE VOLLEY's rehearsal: a ward that works is not a body that is gone |
| `packages/content/src/scenes/catch-and-aim.ts` | CATCH AND AIM's rehearsal: the hand aims, so the cannon does not have to |
| `packages/content/src/waves/act-1b.ts` | The last of act one, cut off `act-1.ts` when that file reached the 250-line ceiling on `CATCH AND AIM` |
| `packages/content/src/maze-drawn.ts` | The four sheets THE MAZE plays after the owner's own, drawn by `bun run maze` and printed here |
| `packages/content/src/body-path.ts` | one living body's contour — a blob, or the walk that puts clubs on its rim |
| `packages/content/src/crystals.ts` | the angular family — the rock, the torch and the queen's shell, which do not live |
| `packages/content/src/crawler-shape.ts` | THE CRAWLER's contour: one link of a worm, and the fifth family of contour in this package |
| `packages/content/src/creatures-fixtures.ts` | **The three bodies a wave never sends** |
| `packages/content/src/mechanics-run.ts` | **The five mechanics that are not a thing the field sends**, and the whole of `reach: "run"` |
| `packages/content/src/wave-entry.ts` | **What one arrival is**, and the half of a wave that grows |
| `packages/content/src/creatures-hazards.ts` | **The arrivals with nothing alive in them**: the five speed tiers, THE VEER, the torch — and THE FENCE |
| `packages/content/src/creatures-split.ts` | The three bodies **one seat cannot see whole** that wear nothing to do it — the dart, the wisp and the ghost |
| `packages/content/src/mechanics-split.ts` | The five bestiary rows for bodies one seat cannot see whole — the lure, the dart, the veil, the wisp and the ghost |
| `packages/content/src/control-fault.ts` | **What a wave's fault does to the panel it is played on**, and the one place either half of it is decided |
| `packages/content/src/mechanics-wave.ts` | **The two mechanics a wave turns on without putting a body on the field**, and the whole of `reach: "wave"` |
| `packages/content/src/silhouettes-spare.ts` | **The two contours next door that are not a body on the roster**: one retired, one a capsule |
| `packages/content/src/waves/act-7.ts` | Act seven, and it opens on the first body in this game that cannot be answered from the column it is standing in |
| `packages/content/src/magnet-shape.ts` | THE MAGNET's contour, as numbers rather than as drawing |
| `packages/content/src/veer-clown-shape.ts` | **THE VEER's rider, as geometry**: where every disc of the clown sits on the rock, and the loops it comes to |
| `packages/content/src/scenes/the-claw.ts` | THE CLAW's rehearsal: one of you has every button and none of the map |
| `packages/content/src/control-sets-waves.ts` | The three questions a **wave** asks about a panel |
| `packages/content/src/scene-step-types.ts` | a page of a rehearsal, and the thing its words point at |
| `packages/content/src/scenes/the-cut.ts` | THE CUT's rehearsal: a wall with no way through, and the crack that is the only place a shot goes through it |
| `packages/content/src/scenes/the-fence.ts` | THE FENCE's rehearsal: a wall the width of the field, and the one thing that has to be true when it lands |
| `packages/content/src/scenes/the-gap.ts` | THE GAP's rehearsal: the wall moves its opening, and only one of them can see where it went |
| `packages/content/src/control-sets-keys.ts` | Whether a panel answers a command — what the desk keyboard is gated by |
| `packages/content/src/waves/act-7b.ts` | The second half of act seven, cut off `act-7.ts` when THE COIL was split into two waves and that file reached… |
| `packages/content/src/scenes/the-coil.ts` | THE COIL's rehearsal: the shield is stuck open, and the plate is what opens the dome |
| `packages/content/src/keys-desk.ts` | **The desk keyboard is a panel too**, and this is where a key finds out what it means |
| `packages/content/src/control-aim.ts` | Which way a control points, and which rig of keys answers it |
| `packages/content/src/scenes/the-choir.ts` | THE CHOIR's rehearsal: the one gesture that is on no panel at all |
| `packages/content/src/pulse-stages.ts` | THE PULSE's stages — the charts, and so far there is one of them |
| `packages/content/src/pulse-steps.ts` | A chart, written as bars of text, and the reader that turns one into notes |
| `packages/content/src/mechanics-rounds.ts` | The rounds that are not the field, as mechanic rows |
| `packages/content/src/metaball-spread.ts` | spreading a fixed number of points across a subject that may be in pieces — the shape sheet's need, not the game's |
| `packages/content/src/metaball.ts` | the outline of a metaball field, as however many closed loops it has — what SYMBIOSIS and THE CHOIR are drawn with |
| `packages/content/src/scene-drag.ts` | **A hand carrying a handle**, turned into the stream of `drag` messages a rehearsal's runner sends — how far |
| `packages/content/src/creatures-beatbox.ts` | THE BEATBOX's row, cut out of `creatures-table.ts` when it took that file past its 250-line limit |
| `packages/content/src/mechanics-beatbox.ts` | THE BEATBOX's row, cut out of `mechanics-table.ts` when it took that file past its 250-line limit |
| `packages/content/src/silhouettes-beatbox.ts` | Beatbox: a rounded cabinet, and the one body on this roster whose contour is *architecture* rather than an… |
| `packages/content/src/waves/act-8.ts` | Act eight, opened for THE BEATBOX rather than for a chapter |
| `packages/content/src/balloon-shape.ts` | THE BALLOON's contour: a skin with a knot under it, and the fifth family of contour in this package |
| `packages/content/src/creatures-handed.ts` | **The bodies answered by hands alone**, and today there is one of them |
| `packages/content/src/mechanics-handed.ts` | The keys of the table below, checked against the roster |
| `packages/content/src/tell-rungs.ts` | THE TELL's ladder: five rungs, and what makes each of them a different question |
| `packages/content/src/queue-boss.ts` | A wave's boss, remapped onto the field the pair is actually playing |
| `packages/content/src/motions-event.ts` | The two motions that are events rather than idles |
| `packages/content/src/motions-retired.ts` | The motions nothing in the game carries any more |
| `packages/content/src/balloon-parts.ts` | **What is alive inside THE BALLOON**, and hanging under it: veins, a ring of lit beads |
| `packages/content/src/surface.ts` | where a mark placed at a longitude and latitude lands, how the tangent plane foreshortens it, and its own normal against `KEY` |

### packages/render

| Path | One line |
|---|---|
| `packages/render/src/palette.ts` | style guide as values |
| `packages/render/src/glow.ts` | glow without shadowBlur |
| `packages/render/src/layout.ts` | screen geometry, shared with input hit-testing |
| `packages/render/src/field.ts` | background, grid pulse, radar strip |
| `packages/render/src/hull.ts` | the ship; cannon and shield as lobes of one contour |
| `packages/render/src/mirror.ts` | the same ship, flipped and in the wrong colours — THE MIRROR |
| `packages/render/src/simon-fx.ts` | the count-in, the handover, and what the row is showing |
| `packages/render/src/simon-row.ts` | the row of slots: a control, or a question mark |
| `packages/render/src/simon-verdict.ts` | the sequence flying into whichever ship earned it |
| `packages/render/src/simon-ghost.ts` | the shots THE MIRROR drops while demonstrating |
| `packages/render/src/simon-glyph.ts` | one control, drawn small enough for a row of six |
| `packages/render/src/controls.ts` | the band's buttons, drawn at any size — band and sequence share them |
| `packages/render/src/boss-draw.ts` | whichever boss is on the field, drawn among the creatures |
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
| `packages/render/src/bullets.ts` | shots and their tails |
| `packages/render/src/effects.ts` | every transient the field keeps past its frame, and where each one is kept |
| `packages/render/src/effects-frame.ts` | **What `Effects` does with a frame**, as opposed to what it owns |
| `packages/render/src/sparks.ts` | the particles every impact spends, thrown out or drawn in |
| `packages/render/src/balance.ts` | the screen after the run, drawn |
| `packages/render/src/hud.ts` | hull, score, beat, the guard balance, overlays |
| `packages/render/src/band.ts` | the two control strips, trigger and colours |
| `packages/render/src/canvas2d.ts` | the renderer, orchestrating the above |
| `packages/render/src/canvas2d-takeover.ts` | **The two frames that are not the field**, and the clocks that run whether or not one of them is up |
| `packages/render/src/renderer.ts` | the interface a PixiJS version would implement |
| `packages/render/src/arrivals.ts` | Which impacts have actually landed, as far as the picture is concerned |
| `packages/render/src/assets.d.ts` | Bun's bundler emits an imported binary as a file and hands back its URL |
| `packages/render/src/backdrop.ts` | The field's back: two depths of drifting motes, a slow wash, and the horizon they sit in front of |
| `packages/render/src/banner.ts` | The one-word receipt for what a pod just gave, and the colour it reads in |
| `packages/render/src/briefing.ts` | How a wave opens, drawn: first its introduction, then its guide |
| `packages/render/src/cannon-maw.ts` | Laying the shot: `maw.ts` run backwards |
| `packages/render/src/clasp-break.ts` | THE CLASP's shield failing |
| `packages/render/src/clasp-lattice.ts` | The honeycomb inside THE CLASP's bubble |
| `packages/render/src/clasp-strike.ts` | The ward reaching up the column and taking a clasp's shield off it |
| `packages/render/src/clasp.ts` | THE CLASP's shield: the bubble a slick or a bulb falls inside, and the way it comes apart when the ward opens |
| `packages/render/src/comms-glyphs.ts` | The three marks the whole game says "one of you can see this" with: an eye on the strip, a speech bubble over |
| `packages/render/src/comms.ts` | Which arrivals make the two of them talk, and which way round |
| `packages/render/src/craters.ts` | A rock's own mark: not the whole rock's silhouette, only the sliver of it that was ever inside the skin |
| `packages/render/src/creature-detail.ts` | Core and trailing filaments |
| `packages/render/src/dart-look.ts` | WHAT A DART'S THRUST LOOKS LIKE, as a record rather than as the body of one function |
| `packages/render/src/dart-path.ts` | Where a dart is going, drawn for the seat that is allowed to know: two dotted legs and a hollow body standing |
| `packages/render/src/dart.ts` | Everything about a dart that is a picture rather than a rule: the lean that says where it is going, the jet |
| `packages/render/src/deflect-look.ts` | How a catch reads, as a record rather than as numbers typed into the draw call |
| `packages/render/src/deflect.ts` | Seconds into the press-and-release that opens every bounce (capped at `DEFLECT_LOOK.pressLife`); ordinary |
| `packages/render/src/depth.ts` | THE FIELD HAS A NEAR EDGE AND A FAR ONE |
| `packages/render/src/effects-body.ts` | The transients that belong to **one body** and outlive it by less than a beat: a lure folding to a point, the |
| `packages/render/src/effects-breach.ts` | What a breach looks like — the one event whose answer is not a burst at a point, because the thing that |
| `packages/render/src/effects-spark.ts` | The events whose whole visible answer is a handful of particles |
| `packages/render/src/egg-contour.ts` | The cloaca's own shape, for one frame — split out of `cannon-maw.ts` so that file's `LAY_LOOK.draw` stays a |
| `packages/render/src/egg-curve.ts` | The cannon's wind-up, as pure arithmetic — no canvas anywhere near it |
| `packages/render/src/frame-passes.ts` | The four passes `Canvas2DRenderer.draw` assembles a frame from, in the order a reader looks for them: the |
| `packages/render/src/gauge-round.ts` | THE GAUGE over the whole stage |
| `packages/render/src/gauge.ts` | THE GAUGE's picture: a half-round dial, a needle, and two marks that only one of the two screens carries |
| `packages/render/src/glide.ts` | A spring that chases a value |
| `packages/render/src/handles.ts` | The handles: the things drawn **on the field** that a hand takes hold of and carries, as opposed to the |
| `packages/render/src/hex.ts` | Two `#rrggbb` colours mixed, as a `#rrggbb` colour |
| `packages/render/src/hull-frame.ts` | The hull's shape for one frame — split out of `hull.ts` so the geometry model (this file) and the drawing |
| `packages/render/src/key-light.ts` | THE KEY LIGHT, ON A CANVAS |
| `packages/render/src/light-shafts.ts` | SUN FALLING INTO DEEP WATER |
| `packages/render/src/lobe.ts` | One lobe of the membrane, as a bump on the contour |
| `packages/render/src/lure-alarm.ts` | The alarm player 2 sees over a lure, and player 1 never does |
| `packages/render/src/lure-vanish.ts` | A lure going, and the one moment of this creature both screens show identically |
| `packages/render/src/maze-draw.ts` | THE MAZE's picture: a real maze of rings turning over the ship, with the one gap in its rim lit when it has clicked onto a column |
| `packages/render/src/maze-string.ts` | THE MAZE's string, and the handle on it: the one thing in this round either player can put a hand on |
| `packages/render/src/meteor.ts` | The rock |
| `packages/render/src/muzzle.ts` | The fire opening — the one place on the hull that two different things now draw into |
| `packages/render/src/other-hand.ts` | THE OTHER HAND: the cheapest presence a two-device co-op game can show — not what a control is doing, only |
| `packages/render/src/queen-egg.ts` | Never quite zero — a degenerate radius is what `frame.test.ts` exists to catch |
| `packages/render/src/queen-glyph.ts` | Points around the contour — the same count `blobPath` itself walks |
| `packages/render/src/queen-weakpoint.ts` | Breath speed at full health, out of bloom |
| `packages/render/src/queen.ts` | How much faster the outer body's wobble gets by her last petal |
| `packages/render/src/raster-caps.ts` | What the browser in front of us can actually do with a baked animation |
| `packages/render/src/raster-load.ts` | Getting a baked atlas into a shape `drawImage` will take |
| `packages/render/src/raster-probe.ts` | Two tiny images whose only job is to be decoded |
| `packages/render/src/ready-circles.ts` | The ready gate a guide ends on: two circles, filling, and the wave waits until both say READY |
| `packages/render/src/rock-impact.ts` | How long a missed rock sits sunk into the hull before it starts to drift off |
| `packages/render/src/scars.ts` | A breach stays, and it stays *in the skin* |
| `packages/render/src/sheen.ts` | The light inside the membrane, and the film on top of it |
| `packages/render/src/shell-draw.ts` | THE SHELL's plating: the picture the sim's own bitmask (`Creature.shell`) has no shape for |
| `packages/render/src/shell-plate.ts` | One plate of THE SHELL's armour, as geometry |
| `packages/render/src/shield-flash.ts` | The shield's ambient flashes: a soft bright patch popping briefly above the rim, at a random spot and a |
| `packages/render/src/shield-spark.ts` | The shield's ambient arcs: a few thin discharges thrown outward from the rim, gone almost as soon as they |
| `packages/render/src/shield.ts` | The shield, as a body rather than a plate |
| `packages/render/src/siren-seats.ts` | The two chips that flank the siren: which seat, and what that seat has to do about the thing on the field |
| `packages/render/src/siren.ts` | The warning siren, top right of the field beside the strip, and the two seats' jobs under it |
| `packages/render/src/slabs.ts` | The other kind of panel: slabs, for a round that has taken the field away |
| `packages/render/src/sprite-burst.ts` | A baked animation, played from an atlas, over the field |
| `packages/render/src/tether.ts` | THE WARDEN's rope, and the handle on it: the one thing on this field either player can put a hand on |
| `packages/render/src/vane-draw.ts` | THE VANE, drawn: an arm sweeping the top of the field, and the bearing it turns on |
| `packages/render/src/veil-bolt.ts` | THE VEIL's lightning: small bolts that break out of the cloud's own border, scattered round it, each in its |
| `packages/render/src/veil-marks.ts` | What stands over a cloud, and it is a different thing in each seat |
| `packages/render/src/veil-shape.ts` | THE VEIL's *form*: the silhouette a cloud has, and the vapour standing around it |
| `packages/render/src/veil-tear.ts` | A cloud coming apart, and the body inside it visible for the first and last time |
| `packages/render/src/veil.ts` | THE VEIL's cloud: the thunderhead a slick or a bulb falls inside |
| `packages/render/src/warden-eye.ts` | THE WARDEN's door, and the eye behind it |
| `packages/render/src/eye.ts` | you are drawing an eye — the wet film round it and the lashes and cilia off it, shared by THE LID and THE WARDEN; the lens itself is `eye-lens.ts` |
| `packages/render/src/warden-fx.ts` | The one thing about THE WARDEN that outlives a frame |
| `packages/render/src/warden.ts` | THE WARDEN, drawn: a ring with a hole you can see the field through |
| `packages/render/src/wave-intro.ts` | The first of the two states a wave opens in: its number, its name and its sentence, as |
| `packages/render/src/wrap-text.ts` | Greedy wrap against the measured width |
| `packages/render/src/gradient-slot.ts` | A cache slot for one gradient that depends only on layout — never on time or an eased value |
| `packages/render/src/never.ts` | The one way this repository closes a `switch` — a `default` that only type-checks once `x` has narrowed to |
| `packages/render/src/effects-ingest.ts` | Everything `ingestOne` needs to act on a single event, gathered rather than passed one field at a time — the |
| `packages/render/src/touch-lobe.ts` | What pressing a lobe says |
| `packages/render/src/dart-query.ts` | Player 1's half of THE DART: two arrows and a question mark |
| `packages/render/src/coord-grid.ts` | you are changing the lettered grid, its axes, or what brings it up |
| `packages/render/src/wisp.ts` | you are timing a wisp's jump against the beat, or deciding which screen sees one |
| `packages/render/src/ghost-glitch.ts` | THE GHOST's camouflage: the thing it is wearing instead of being invisible |
| `packages/render/src/ghost-release.ts` | A ghost let go of, and the one moment both screens carry this creature |
| `packages/render/src/ghost-row.ts` | What player 1 gets instead of the body: a box scanning the row it is in, and nothing whatever about the column |
| `packages/render/src/ghost.ts` | THE GHOST, drawn — a dome with a hem of tails, wearing a camouflage that is coming apart in horizontal bands |
| `packages/render/src/fleet-chart.ts` | THE FLEET's chart: the lattice of squares the whole fight is named against |
| `packages/render/src/fleet-hulls.ts` | THE FLEET's ships — the pilot's alone, until one goes down in front of both of them |
| `packages/render/src/fleet-marks.ts` | THE FLEET's shared half: every square already spent, and the sights standing on one |
| `packages/render/src/band-control.ts` | One control of the band, drawn — a lobe or a strip, whichever the set says |
| `packages/render/src/view-role.ts` | Whose screen this is, and what that seat is allowed to be shown |
| `packages/render/src/snake-body.ts` | The body: where it is between two tiles, and what it looks like |
| `packages/render/src/snake-draw.ts` | SNAKE's arena, and everything standing on a tile of it |
| `packages/render/src/snake-round.ts` | SNAKE over the whole stage |
| `packages/render/src/living-draw.ts` | one lobed body, filled and lit — the draw path every blob creature takes, and the Throb's two sizes |
| `packages/render/src/living-skin.ts` | What a living body is *made of*, as a record rather than as three lines in the middle of `drawLiving` |
| `packages/render/src/snake-morph.ts` | The ship becoming the snake, and it is the real ship |
| `packages/render/src/echo.ts` | the seam and the strain — what tells the pair a body is about to come apart, and which way |
| `packages/render/src/pinball-round.ts` | PINBALL over the whole stage |
| `packages/render/src/pinball-table.ts` | PINBALL's table: the frame it is played inside, and everything standing on it |
| `packages/render/src/round-draw.ts` | Which bosses replace the whole picture, and what draws each |
| `packages/render/src/snake-head.ts` | The head, shut and open |
| `packages/render/src/snake-panel.ts` | Around the arena: what this screen is told, the clock, the buttons |
| `packages/render/src/snake-shot.ts` | The shot: the one thing in this round both screens see the same way |
| `packages/render/src/gyre-wind.ts` | you are drawing the pull between the ship and a wheel — the wind that says the maw is worth spending |
| `packages/render/src/gyre.ts` | you are drawing the wheel under THE GYRE's six bodies — membrane, rim, bowed spokes and the organelle they meet at, behind everything they carry |
| `packages/render/src/target-lock.ts` | THE TARGET LOCK: the one marking in this game that means *an instrument has picked this body out, and it |
| `packages/render/src/wisp-body.ts` | you are drawing the wisp's bell — its contour, its spectrum fill, its core, and how the jump squashes it |
| `packages/render/src/wisp-ground.ts` | you are drawing what a jumping wisp leaves on the field — its pool of light, its dotted arc, the tile it will land on |
| `packages/render/src/wisp-land.ts` | you are drawing the gather before a wisp leaves a tile or the shock that goes out when it lands on one |
| `packages/render/src/wisp-tentacles.ts` | you are drawing the wisp's streamers — how they gather, trail and splash across a jump |
| `packages/render/src/wisp-static.ts` | you are changing how a wisp comes through in bands — the interference that says one screen does not have it |
| `packages/render/src/wisp-search.ts` | you are changing the box that blinks across the grid on the pilot's screen while a wisp is out — the seat that cannot see one |
| `packages/render/src/lure-hole.ts` | THE HOLE THROUGH A LURE, and what is coming out of it |
| `packages/render/src/ghost-eyes.ts` | THE GHOST's eyes, and they are the whole of what makes the shape a face rather than a bell |
| `packages/render/src/ghost-trail.ts` | Where THE GHOST has just been: the body stamped again at the places it stood a moment ago, fading out behind |
| `packages/render/src/wisp-aim.ts` | you are drawing the square a wisp is going to and the dotted arc to it — the navigator's whole sentence |
| `packages/render/src/lid-string.ts` | you are drawing or hit-testing the cord under an armoured eye — the handle's circle lives here |
| `packages/render/src/lid.ts` | you are drawing the armoured eye itself — the lens, the sliding plates and the fringe |
| `packages/render/src/ease.ts` | The one easing curve `render/` uses, and the one place it is written out |
| `packages/render/src/hash.ts` | The one repeatable 0..1 in `render/`, and the one place its two magic numbers are written down |
| `packages/render/src/guard-lapse.ts` | How long the guard button (`band.ts`) keeps fading after its own window closes, in milliseconds |
| `packages/render/src/handle-draw.ts` | you are changing how a handle reads — the ring, the gauge, the rest mark, the sag and the word, shared by all three |
| `packages/render/src/gyre-core.ts` | you are drawing the surface in the middle of a gyre wheel — the organelle, its fluid and its nucleus |
| `packages/render/src/gyre-place.ts` | you are asking where a gyre's hub, rim or mounts are drawn between beats — the arc, the ease and the jam |
| `packages/render/src/touch-field.ts` | you are adding something a hit test needs to know about the wave or the world — the shape `touch.ts` reads |
| `packages/render/src/pinball-aim.ts` | you are changing what PINBALL's aim shows — the real flight path out of the bucket, and the strength bar beside the table |
| `packages/render/src/pinball-piece.ts` | you are drawing what stands on PINBALL's table — a peg as a living cell, a block as a slab of the same tissue |
| `packages/render/src/snake-skin.ts` | What the body is made of: its contour, its light and its scales |
| `packages/render/src/snake-mouth.ts` | What is in the mouth: the space itself, the fangs hung in it, and the tongue |
| `packages/render/src/rind-shed.ts` | A layer coming off THE RIND — the owner's picture of it: it should look like it is shrinking, hit with a |
| `packages/render/src/snake-crash.ts` | The pause between two attempts, as a picture |
| `packages/render/src/snake-items.ts` | What is standing in SNAKE's arena to be spent: the things to shoot and the things to swallow |
| `packages/render/src/snake-ribbon.ts` | What a body looks like once somebody has said where its joints are |
| `packages/render/src/snake-venom.ts` | What the acid does when it stops moving |
| `packages/render/src/ship-hand.ts` | the ring round the swelling a finger has hold of, and which colour a lift would fire |
| `packages/render/src/touch-hold.ts` | what a hit test hands back: what a drag and a lift go on meaning after the press |
| `packages/render/src/touch-ship.ts` | the ship as a control: both lobes answered where they are drawn on the hull |
| `packages/render/src/field-pose.ts` | the ship's eased pose: where the two lobes are and how the membrane feels, shared by the field and a guide's mini-screens |
| `packages/render/src/guide-scene.ts` | a guide's rehearsal at full size: the clock, which seat is showing, and the switch between them |
| `packages/render/src/guide-thumb.ts` | the ghost hand a rehearsal is driven by, placed from `bandLobes` and the strips and never authored |
| `packages/render/src/guide-caption.ts` | a tutorial step's words and highlight, placed beside the body, control or bar they are about |
| `packages/render/src/guide-seat.ts` | one seat's screen inside a guide's rehearsal, drawn through the shipping four passes |
| `packages/render/src/guide-switch.ts` | the slide from one player's screen to the other in a tutorial — the lit seam and the banner naming it |
| `packages/render/src/band-channel.ts` | A STRIP, AS A CHANNEL CUT IN THE TISSUE |
| `packages/render/src/band-ground.ts` | WHAT THE CONTROL PANEL IS MADE OF |
| `packages/render/src/band-seam.ts` | WHERE THE SHIP ENDS AND THE PANEL BEGINS — WHICH IS NOWHERE |
| `packages/render/src/band-slime.ts` | WHAT RUNS OFF THE MEMBRANE, AND WHAT REACHES DOWN FROM IT |
| `packages/render/src/lobe-shell.ts` | WHAT A BUTTON ON THE PANEL SITS IN, AND WHAT IT IS SHAPED LIKE |
| `packages/render/src/recoil-vent.ts` | The jet THE RECOIL leaves behind: fire vented **downward** out of the tile a shot met it in |
| `packages/render/src/recoil.ts` | THE RECOIL's cage: the sprung frame a slick or a bulb falls inside |
| `packages/render/src/guide-nav.ts` | BACK, the page number, and NEXT: the bar a stepped guide is turned by |
| `packages/render/src/guide-play.ts` | The clock a rehearsal runs on, and the page it is running |
| `packages/render/src/opening-fx.ts` | The two things a wave's opening remembers between frames: how long the page that is up has been up |
| `packages/render/src/ready-page.ts` | The last page of a stepped guide: the wave's own name, and the button that says this seat has finished reading |
| `packages/render/src/rock-drift.ts` | **How a rock leaves the ship it broke** — the waiting and the rolling, and the arithmetic of both |
| `packages/render/src/ship-marks.ts` | The marks round the cup: what letting go of this swelling would do |
| `packages/render/src/touch-hand.ts` | What a hand on the ship should be *shown* as — the cup that says which swelling is under the finger |
| `packages/render/src/guide-prose.ts` | A guide with no rehearsal, read a page at a time on the game's own screen |
| `packages/render/src/text-drop.ts` | A line of type falling into place, and the one rule the owner attached to it |
| `packages/render/src/egg-skin.ts` | What the cloaca is *made of*: depth, neon, wet, and the colour it burns off a shot in |
| `packages/render/src/lay-echo.ts` | The part of the cannon's mouth that outlives a frame: the follow-through, and the burn's own clock |
| `packages/render/src/seat-skin.ts` | WHICH SHIP THIS IS: player one's violet, player two's amber |
| `packages/render/src/nav-button.ts` | One button on a guide's bar, and the contour every one of them is cut from |
| `packages/render/src/seat-name.ts` | What to call a seat on a screen a person is reading |
| `packages/render/src/hover.ts` | WHAT A MOUSE IS RESTING ON, LIT |
| `packages/render/src/recoil-cage-break.ts` | THE RECOIL's cage coming apart: the shot that spends the last bounce, drawn as the frame failing all at once |
| `packages/render/src/radar-blip.ts` | Which arrivals this screen's warning strip is carrying, and where each one sits on it |
| `packages/render/src/caption-anchor.ts` | Where a caption's subject is on the screen |
| `packages/render/src/guide-hand.ts` | The hands that are **not** on the panel: one held on something falling |
| `packages/render/src/baked.ts` | Every cache in render/ that holds baked work between frames, in one place that can empty them all |
| `packages/render/src/stage-point.ts` | WHERE A POINTER ON THE CANVAS ACTUALLY LANDS |
| `packages/render/src/intro-figure.ts` | THE SIX PICTURES ON THE INTRO'S PAGES |
| `packages/render/src/intro-page.ts` | WHAT THIS GAME IS, ON THE GAME'S OWN SCREEN |
| `packages/render/src/intro-parts.ts` | The parts the intro's six pictures are built out of: a plate, a body, a hull |
| `packages/render/src/intro-screens.ts` | The two pictures that are about the *pair* rather than about the field |
| `packages/render/src/render-state.ts` | EVERYTHING A RENDERER HOLDS BETWEEN ONE FRAME AND THE NEXT |
| `packages/render/src/carom.ts` | THE CAROM's crust: a meteor with a window cut in it, and the streak it drags |
| `packages/render/src/chute.ts` | THE CHUTE, drawn: the thrust that throws a body out of a cracked carom |
| `packages/render/src/carom-window.ts` | THE CAROM's window: a hole punched clean through the rock, a bezel round it |
| `packages/render/src/controls-fleet.ts` | THE FLEET's own two controls, and the crosshair only they still wear |
| `packages/render/src/ship-air.ts` | THE AIR THE SHIP IS SITTING IN |
| `packages/render/src/volley.ts` | THE VOLLEY's shell: the rock plating a slick or a bulb is sealed inside |
| `packages/render/src/band-lobes.ts` | Where the round buttons on the band stand, for one seat and one panel |
| `packages/render/src/volley-seams.ts` | **The pattern painted on THE VOLLEY's shell**: the four seams a basketball has |
| `packages/render/src/meteor-look.ts` | WHAT A ROCK IS MADE OF, as a record rather than as the body of one function |
| `packages/render/src/chute-cut.ts` | A chute shot down under its canopy: the canopy cut loose and the body dropping out from under it |
| `packages/render/src/warden-cilia.ts` | THE WARDEN's fringe: the half of CILIATE that stands **outside** the rim |
| `packages/render/src/warden-plates.ts` | THE WARDEN's armour, and the only place on the field that says how far in the pair is |
| `packages/render/src/warden-skin.ts` | THE WARDEN's skin: the veins under it, the wet film over it |
| `packages/render/src/warden-veins.ts` | What lies **under** THE WARDEN's surface: the veins running in from its rim, and the wet film over them |
| `packages/render/src/queen-drop.ts` | NEXT TO FALL: the flank the queen's next torch comes off, said on player 2's screen and nowhere else |
| `packages/render/src/queen-figure.ts` | Where the parts of the queen sit on her, and where the screen puts them |
| `packages/render/src/maze-walls.ts` | THE MAZE's walls: the circles, the gaps cut in them, and the radial walls that make the corridors turn |
| `packages/render/src/maze-shot.ts` | The shot inside THE MAZE: where it stands, the corridors behind it, and what it found when it stopped |
| `packages/render/src/maze-heart.ts` | What is in the middle of THE MAZE: a heart, beating |
| `packages/render/src/volley-cracks.ts` | **The damage on THE VOLLEY's shell**: the fractures a ward leaves across the stone that is still there |
| `packages/render/src/maze-door.ts` | THE MAZE's way in, and the light that comes out of it when it is standing on the ship's column |
| `packages/render/src/maze-blood.ts` | What THE MAZE's heart leaves on the floor of its room when it is hit, and why it is still there next round |
| `packages/render/src/eye-lens.ts` | you are changing the shape of an open eye — the two lid curves, the corners, and the pupil they cut |
| `packages/render/src/veer-clown.ts` | THE VEER's rider: a clown sitting on the rock, and the reason the rock does not fall straight |
| `packages/render/src/veer-marks.ts` | THE VEER's two half-pictures: the arrow over the rider on player 1's screen, and the *ask* on player 2's |
| `packages/render/src/lock-mark.ts` | THE LOCK, drawn: the frame that says *the cannon has this one* |
| `packages/render/src/creature-tint.ts` | The three colours a body carries, and what they are mid-turn |
| `packages/render/src/recoil-ribs.ts` | One rib of THE RECOIL's cage, and the piece of hoop it carries |
| `packages/render/src/intro-flash.ts` | THE LOUD HALF OF THE INTRO: a headline on a lit slab, a price-tag flash |
| `packages/render/src/creature-body.ts` | Which body draw a kind gets, as a lookup a stray statement cannot sever |
| `packages/render/src/effects-spark-silent.ts` | The events that are deliberately not a burst, and why each one is not |
| `packages/render/src/maze-fall.ts` | THE MAZE coming apart, which is what a dead end looks like |
| `packages/render/src/maze-stage.ts` | How far through THE MAZE the pair is: one cell per stage, under the ship's own hull bar |
| `packages/render/src/lure-blast.ts` | A LURE GOING UP, AND THE WHOLE SCREEN WITH IT |
| `packages/render/src/eye-rim.ts` | **The eye's box, and the rim hung on it.** The third piece of one eye — `eye.ts` holds the wet parts |
| `packages/render/src/eye-iris.ts` | **The machinery inside an eye**: an aperture ring around the pupil and a ring of spokes turning slowly… |
| `packages/render/src/fleet-clock.ts` | How long THE FLEET has left, as a bar and as a number |
| `packages/render/src/fleet-fx.ts` | THE FLEET's one transient: a salvo between the muzzle and the square |
| `packages/render/src/fleet-impact.ts` | What a shell does when it arrives: a rocket into a hull, or a column of water where there was nothing |
| `packages/render/src/fleet-shell.ts` | A salvo in the air: the shell arcing out of the cannon, and its shadow walking the water underneath it |
| `packages/render/src/fleet-water.ts` | The water THE FLEET's chart stands on, and what closes over a hull that has gone down in it |
| `packages/render/src/frame-field.ts` | The two passes that are about the field: the empty board, and the bodies on it |
| `packages/render/src/frame-ship.ts` | The two passes that are about the ship: the hull with its controls, and the overlays |
| `packages/render/src/strand-bead.ts` | The two bodies THE STRAND draws that are **not** a slick or a bulb |
| `packages/render/src/strand.ts` | THE STRAND's thread, and the mark on the bead that has to be shot next |
| `packages/render/src/strand-reel.ts` | THE STRAND's reel: the clock it rolls on, and the bad monitor over it |
| `packages/render/src/strand-mark.ts` | THE STRAND's two marks: the bead that has to be shot next on the navigator's screen |
| `packages/render/src/duty.ts` | The one word (or two) a seat owes the other while a split body is on the field |
| `packages/render/src/throb.ts` | the plating over a throb's armoured half — the green that means a shot does nothing |
| `packages/render/src/throb-look.ts` | THE ONE RECORD A CANDIDATE THROB LOOK PATCHES |
| `packages/render/src/crawler-fx.ts` | THE CRAWLER's three transients — the burst ring's splash, the swept lane, the burrow's mound |
| `packages/render/src/crawler.ts` | THE CRAWLER, drawn — a maggot lying along the ship's surface, its rings overlapping |
| `packages/render/src/crawler-ring.ts` | **One ring of a maggot, as a shape** — the three sets of proportions the parts of a worm are drawn at |
| `packages/render/src/crawler-skin.ts` | **The wet on a maggot, and the little on its face** |
| `packages/render/src/living-frame.ts` | Where a living body is standing this frame, and the transform that puts a pen in its own local units |
| `packages/render/src/strand-thread.ts` | Which beads of THE STRAND are on one thread, and in what order along it |
| `packages/render/src/crawler-marks.ts` | What each ring of THE CRAWLER is owed — a crosshair on every one, the shield's mark over the dome's |
| `packages/render/src/crawler-place.ts` | Where a ring of THE CRAWLER actually sits on screen, and how much bigger it draws for being that near |
| `packages/render/src/crawler-look.ts` | THE ONE RECORD A CANDIDATE CRAWLER SURFACE PATCHES |
| `packages/render/src/fence-gate.ts` | The way through a fence, on the screen that is shown it |
| `packages/render/src/fence.ts` | THE FENCE: a live line the width of the field, and the two different pictures of it the two screens carry |
| `packages/render/src/spline.ts` | A contour, written into a `Path2D` as numbers |
| `packages/render/src/effects-ingest-silent.ts` | **The events that leave nothing behind in `Effects`**, and why each one does not |
| `packages/render/src/malfunction-look.ts` | **What a broken control looks like**, and what the button that holds it off looks like beside it |
| `packages/render/src/magnet-break.ts` | A magnet coming apart: the two arms thrown the way the bolt was going, and the plate falling loose |
| `packages/render/src/magnet.ts` | THE MAGNET, drawn: a horseshoe on two coloured poles with an armoured plate slung under it |
| `packages/render/src/magnet-alarm.ts` | THE MAGNET's call, and the second alarm in this game that reads differently depending on who is looking |
| `packages/render/src/fence-arc.ts` | The current jumping both ways between a wall coming down and the dome under it |
| `packages/render/src/fence-sweep.ts` | What the navigator gets instead of the doorways: a reading head crossing the wire |
| `packages/render/src/fence-wire.ts` | What a stretch of live wire looks like, and how far above the ship it hangs |
| `packages/render/src/shield-outage.ts` | The shield's line burnt out in places, which is what a wall costs instead of a scar |
| `packages/render/src/magnet-bounce.ts` | A shot turned away by the plate under a magnet, coming back down |
| `packages/render/src/fence-shards.ts` | The pieces of wall a bolt knocks out of a column it cuts |
| `packages/render/src/fence-strike.ts` | A wall landing on the ship, remembered: the outage and the shock it leaves |
| `packages/render/src/hull-shock.ts` | The whole ship conducting for a moment after a wall earthed through the dome |
| `packages/render/src/bolt.ts` | **One discharge drawn between two points**, and the one place the shape of a bolt in this game is decided |
| `packages/render/src/coil-jump.ts` | The charge leaving a dome that has just failed and crossing the field to the next one |
| `packages/render/src/coil.ts` | THE COIL's dome: the shell a rock crosses the field inside, and the three studs the charge leaves it by |
| `packages/render/src/reach-arm.ts` | THE CLAW's arm, drawn out of the swelling that was the gun |
| `packages/render/src/comms-talker.ts` | one row per creature: which seat has to say something about it |
| `packages/render/src/fence-bolt.ts` | **One line of current between the wall and the dome.** Cut out of `fence-arc.ts` when the warning skull took… |
| `packages/render/src/fence-crack.ts` | **The breaking point in a wall, on the screen that is shown it.** A gap is a hole the dome is steered into; a… |
| `packages/render/src/fence-exit.ts` | **A wall leaving the ship it did not touch.** A fence that finds the dome standing in one of its ways through… |
| `packages/render/src/fence-skull.ts` | **The skull the current draws over the dome when the wall above it is shut.** A fence is answered by the… |
| `packages/render/src/grip-arrows.ts` | THE PUSH, said before it happens: the two white arrows beside a held rock, and the beat they go out for |
| `packages/render/src/effects-ship.ts` | the ship's own clocks: the swallow, the fire opening, the deflection flash, the queen's shudder |
| `packages/render/src/strand-still.ts` | One live bead on the navigator's screen that **no shot can answer this instant**: the reel drawn as a grey outline |
| `packages/render/src/maze-timer.ts` | THE MAZE's clock, drawn on the outside of the heart |
| `packages/render/src/choir-arrows.ts` | **THE CHOIR's two arrows**: the way to open a membrane on a device that cannot tell you it has been shaken |
| `packages/render/src/choir-prompt.ts` | **The instruction over a membrane**: a scan frame around the middle dot with the gesture written under it |
| `packages/render/src/choir-quake.ts` | the whole screen shaking, and the only thing in this renderer that moves the picture rather than something in it |
| `packages/render/src/choir.ts` | THE CHOIR as it stands before the pilot's gesture |
| `packages/render/src/maze-drips.ts` | The half of a refused shot that lands on the ship: a pool across the top of the hull |
| `packages/render/src/maze-spill.ts` | What a shot the heart refuses throws back, and how far it gets |
| `packages/render/src/pulse-fall.ts` | The arrows themselves: what is falling, what is standing on the line |
| `packages/render/src/pulse-lane.ts` | Where THE PULSE's four lanes are, and where the line across them is |
| `packages/render/src/pulse-meter.ts` | The one meter, the tally under it, and the verdict |
| `packages/render/src/pulse-round.ts` | THE PULSE over the whole stage |
| `packages/render/src/pulse-button.ts` | THE PULSE's four lanes, as a face on one of the band's own lobes |
| `packages/render/src/pulse-drop.ts` | An arrow nobody answered falls into the ship |
| `packages/render/src/pulse-shape.ts` | What falls down each of THE PULSE's four lanes, and what colour it is |
| `packages/render/src/pulse-shape.ts` | What an arrow in THE PULSE is made of: its hue, its heading and its contour |
| `packages/render/src/lance-flash.ts` | The whole screen going white, then the ammunition colour, then nothing |
| `packages/render/src/body-mark.ts` | One living body, at a size, with no world around it |
| `packages/render/src/pulse-body.ts` | One arrival falling down a lane, and the two ways of drawing one that cannot be read |
| `packages/render/src/choir-shape.ts` | where THE CHOIR's two bodies stand and the skin traced over them — the shape half, with no light or colour in it |
| `packages/render/src/choir-skin.ts` | **The light THE CHOIR throws and the film it wears** — the surface half of this creature |
| `packages/render/src/choir-look.ts` | THE ONE RECORD A CANDIDATE CHOIR SURFACE PATCHES |
| `packages/render/src/action-face.ts` | Player 1's action buttons, showing the ship doing the thing instead of spelling its name |
| `packages/render/src/beatbox-marks.ts` | THE BEATBOX's two half-pictures: the **count** over the box on player 1's screen |
| `packages/render/src/beatbox-tap.ts` | **Player 2's thumb on a soundbox**, and the first press in this game that lands on a *body* and is over the… |
| `packages/render/src/beatbox-wave.ts` | **The wave of sound a miscounted box sends at the ship**, and the picture this creature is named for |
| `packages/render/src/beatbox-wash.ts` | **The colour laid over a soundbox**, which is the half of this creature that is about *when* rather than… |
| `packages/render/src/beatbox.ts` | **How big a soundbox is drawn this instant**, which is the whole of what this creature says |
| `packages/render/src/creature-body-worn.ts` | **The two body draws that read their own record rather than calling a draw function directly** |
| `packages/render/src/balloon-handles.ts` | **THE BALLOON's two handles**: the one thing on this field that two people take hold of at the same time |
| `packages/render/src/balloon.ts` | THE BALLOON, drawn — a skin with a knot under it, filling where it appears, leaning the way it climbs |
| `packages/render/src/creature-body-in.ts` | **What a body draw is handed.** Cut out of `creature-body.ts` when THE BALLOON's row took that file over its… |
| `packages/render/src/handle-place.ts` | **Where a handle is standing**, as against where a finger may grab it |
| `packages/render/src/crank-dial.ts` | THE CLAW's crank, drawn: the winder that brings the arm home |
| `packages/render/src/touch-drag.ts` | What a hand that already has hold of something says when it moves — a handle carried, a crank turned |
| `packages/render/src/tell-body.ts` | THE TELL's body: a blob at the top of the field with the ring on its skin |
| `packages/render/src/tell-ring.ts` | The ring, drawn on the boss's own body — three nodes and the three arrows between them |
| `packages/render/src/tell-round.ts` | THE TELL over the whole stage |
| `packages/render/src/tell-scene.ts` | The reveal: nine little scenes, one per ordered pair of throws |
| `packages/render/src/dart-torch.ts` | WHAT A DART'S THRUST IS DRAWN AS, in a file of its own beside `dart-look.ts` |
| `packages/render/src/magnet-coil.ts` | WHAT THE MAGNET IS DRAWN AS: a solid horseshoe, poles lit from their tips |
| `packages/render/src/magnet-lanes.ts` | Where an intake lane starts and ends, in body radii from the centre |
| `packages/render/src/magnet-look.ts` | THE ONE RECORD A CANDIDATE MAGNET LOOK PATCHES |
| `packages/render/src/balloon-alive.ts` | **What makes THE BALLOON alien**: the film that travels over its skin |
| `packages/render/src/pulse-wash.ts` | **The whole ship lit, by the one body that got past.** A body answered too late is not answered |
| `packages/render/src/pinball-blast.ts` | PINBALL's two loud moments: a ball that hit the ship, and a target taken |
| `packages/render/src/pinball-button.ts` | PINBALL's two presses, as faces on the band's own lobes |
| `packages/render/src/beatbox-air.ts` | **The air a soundbox is moving**, which is the half of this creature that has no number in it at all |
| `packages/render/src/hull-light.ts` | who lights the ship, as a record — the shipped `litBox` reached through a seam a second answer can be held against |
| `packages/render/src/splash-trail.ts` | **Slime off the end of a mouse** — the ink a desk's pointer leaves, as blobs that swell, sag and add up |
| `packages/render/src/beatbox-count.ts` | **What the counter over a soundbox is saying**, as a shape rather than as a drawing — how many slots |
| `packages/render/src/beatbox-silence.ts` | **A soundbox going quiet**, which is the one thing on this creature that goes right and until now was the… |
| `packages/render/src/canvas2d-takeover.ts` | **The two frames that are not the field**, and the clocks that run whether or not one of them is up |
| `packages/render/src/effects-frame.ts` | **What `Effects` does with a frame**, as opposed to what it owns |
| `packages/render/src/splash-blob.ts` | ONE BLOB OF THE MOUSE'S INK — its size, its sag, and how it is put down |

### packages/net

| Path | One line |
|---|---|
| `packages/net/src/protocol.ts` | every message that crosses the wire, and how to distrust one |
| `packages/net/src/lockstep.ts` | delayed lockstep: the promise each device makes to the other |
| `packages/net/src/clock.ts` | four-timestamp clock sync, median, moved gently |
| `packages/net/src/desync.ts` | the fingerprint ledger — where `hash.ts` finally gets used |
| `packages/net/src/status.ts` | what the network indicator may say, and nothing else may |
| `packages/net/src/room-code.ts` | the four characters two people read to each other |
| `packages/net/src/command-codec.ts` | Every `Command` variant, checked field by field, before it ever reaches a `Lockstep` or a simulation tick |
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
| `packages/audio/src/bind-volley.ts` | **What THE VOLLEY sounds like**: a ward that sends it back |
| `packages/audio/src/bind-fleet.ts` | **What THE FLEET sounds like**: a salvo leaving the cannon, and the water |
| `packages/audio/src/bind-breach.ts` | What a hull breach sounds like, split by what it cost rather than by what hit |
| `packages/audio/src/bind-crawler.ts` | THE CRAWLER's two endings, as sounds |
| `packages/audio/src/bind-lookups.ts` | The two id-to-id tables `bind.ts` reads, and the only *data* in a file that is otherwise a switch |
| `packages/audio/src/bind-fence.ts` | **What THE FENCE sounds like**: the wire going over the ship, and a bolt cutting a way through it |
| `packages/audio/src/bind-place.ts` | **Where a sound is**: a column as a stereo position, and a row as a pitch |
| `packages/audio/src/bind-coil.ts` | **THE COIL's two, as sounds**: a dome coming off, and the charge it was holding leaving for the next one |
| `packages/audio/src/bind-cue.ts` | **What one sound-to-be is**: an id out of the catalogue, where it sits in the stereo field |
| `packages/audio/src/bind-veil.ts` | THE VEIL's three, as sounds |
| `packages/audio/src/bind-choir.ts` | THE CHOIR's three, in a file of its own |
| `packages/audio/src/mixer-pulse.ts` | THE PULSE's song, played off the simulation's own clock |
| `packages/audio/src/bind-beatbox.ts` | THE BEATBOX's three, in a file of its own — `bind-choir.ts` is the pattern and this is the fourth of them |
| `packages/audio/src/bind-balloon.ts` | THE BALLOON's three, in a file of its own — `bind-choir.ts` is the pattern and this is the fourth of them |

### apps/game

| Path | One line |
|---|---|
| `apps/game/src/main.ts` | wiring: world, renderer, input, loop |
| `apps/game/src/waves.ts` | the two ways a wave starts, and the banner that names it |
| `apps/game/src/audio.ts` | the mixer wired to the loop: unlock on a gesture, clear on a restart, M to mute |
| `apps/game/src/loop.ts` | fixed timestep; the only place wall-clock time exists |
| `apps/game/src/viewport.ts` | the window's size, and the stage and layout derived from it |
| `apps/game/src/input.ts` | pointers and capture; what a touch *means* is `touch.ts` |
| `apps/game/src/field-input.ts` | Everything a finger on the glass reaches: the field itself, a shake |
| `apps/game/src/keys.ts` | commands from the keyboard — the test rig, not the game |
| `apps/game/src/testing.ts` | pause, wave skip and the tuning sliders |
| `apps/game/src/link.ts` | solo or two devices: the clock, the scheduler, beat zero |
| `apps/game/src/relay.ts` | the socket, and only the socket |
| `apps/game/src/join.ts` | the room screen and the network indicator, which are one thing |
| `apps/game/src/menu.ts` | the main menu, which is the front door, and the `?play` flag past it |
| `apps/game/src/menu-view.ts` | the shell, the root page's entries, and the seat as three cards |
| `apps/game/src/briefing.ts` | the thumb on a wave's guide |
| `apps/game/src/demo-menu.ts` | the DEMOS page: one row per mechanic, read out of `DEMONSTRATIONS` |
| `apps/game/src/gauge.ts` | the host's half of THE GAUGE: the two thumbs that play it |
| `apps/game/src/handle.ts` | `window.neonSpore` — the handle a headless check drives the game by |
| `apps/game/src/key-hint.ts` | a keyboard hint for the player who sits at a PC with no panel to read the keys off |
| `apps/game/src/raster.ts` | the baked burst, in the real game, behind a flag |
| `apps/game/src/view.ts` | the view switch, always on screen |
| `apps/game/src/snake.ts` | The host's half of SNAKE: the four thumbs that play it |
| `apps/game/src/install.ts` | The home-screen shortcut, and the service worker that makes one possible |
| `apps/game/src/link-run.ts` | Beats between fingerprint exchanges |
| `apps/game/src/link-socket.ts` | Milliseconds before a socket that went away is reached for again |
| `apps/game/src/link-refusal.ts` | What a room turning this device away means, as three rules and no state |
| `apps/game/src/hold.ts` | the card that comes up when the line goes bad, with a clock on it |
| `apps/game/src/join-words.ts` | the words the network wears — the chip's, the room screen's, the seat pills' |
| `apps/game/src/link-report.ts` | what the screen is told about the link, gathered in one place |
| `apps/game/src/menu-pages.ts` | the menu's two jump lists, and the page a pair reads first |
| `apps/game/src/menu-parts.ts` | the pieces every menu page is made of, and the wordmark's spore |
| `apps/game/src/run-state.ts` | whether the world ticks, and which of the four holds is on it |
| `apps/game/src/shell.ts` | everything around the field: menu, room screen, bad-line card, and the link |
| `apps/game/build.ts` | What `bun build ./index.html --outdir=dist --minify --sourcemap` used to be, as a script |
| `apps/game/preview.ts` | Which checkout this one serves |
| `apps/game/src/confirm.ts` | A button that hangs up on somebody else, and asks once before it does |
| `apps/game/src/link-clock.ts` | The room's wall clock: the only part of the game that asks what time it is |
| `apps/game/src/progress.ts` | How far this device has got, kept on this device |
| `apps/game/src/menu-entries.ts` | The rows on the menu's two lists of entries, in the order they are read |
| `apps/game/src/haptics.ts` | A buzz for the two things a player must not miss |
| `apps/game/src/settings.ts` | The things a player turns on and off, kept on their own device |
| `apps/game/src/link-types.ts` | What a link is asked for, and what it offers back |
| `apps/game/src/join-name.ts` | "What are you called?", asked once, on the room screen |
| `apps/game/src/nickname.ts` | This device's player name: asked once, kept here, carried into every room |
| `apps/game/src/origin.ts` | Where the server lives, for both things that talk to it |
| `apps/game/src/pairing.ts` | The way *back* into a room, for two people who have played before |
| `apps/game/src/menu-settings.ts` | The one durable place for "things about me" |
| `apps/game/src/menu-controls.ts` | what a thumb does, every panel the game has, the field itself, then the keys |
| `apps/game/src/input-bindings.ts` | what the pointer rig is handed, and why each of it is read fresh |
| `apps/game/src/input-buffer.ts` | the queue every listener in the app writes into, drained a tick at a time |
| `apps/game/src/ship-hand.ts` | what this device's own hand is doing on the ship, between the event and the frame |
| `apps/game/src/tally.ts` | how far this device has got, up to the room every few seconds |
| `apps/game/src/menu-link.ts` | what a link changes on the front page: eight entries, the progress line, the seat lock |
| `apps/game/src/menu-seats.ts` | the seat, as three cards with the job written on each, and the lock a room puts on them |
| `apps/game/src/keys-guide.ts` | What a key means while a wave's guide is up, at a desk |
| `apps/game/src/intro.ts` | THE SIX PAGES A PAIR SEES BEFORE THEY HAVE CHOSEN ANYTHING |
| `apps/game/src/frame.ts` | WHAT HAPPENS EVERY TICK, AND WHAT HAPPENS EVERY FRAME |
| `apps/game/src/interpolate.ts` | the picture drawn between ticks rather than on them, behind `?interpolate=1` |
| `apps/game/src/perf-page.ts` | The readout `?perf=1` puts on the screen |
| `apps/game/src/perf-sweep.ts` | The performance sweep, run **inside the page**, on the device the game is for |
| `apps/game/src/menu-idle.ts` | `?menuidle=<hz>` — how often the field is repainted while the main menu is up |
| `apps/game/src/keys-grip.ts` | what the desk rig's grip key takes hold of, and how it carries it |
| `apps/game/src/keys-slide.ts` | The desk keys that slide a swelling, and keep sliding while held |
| `apps/game/src/shake.ts` | the device being shaken, which is THE CHOIR's control and the only input that is not a finger on the glass |
| `apps/game/src/rounds.ts` | Every round that is not the field, bound to the canvas at once |
| `apps/game/src/keys-crank.ts` | The desk key that turns THE CLAW's crank, which no key can do by itself |
| `apps/game/src/trail.ts` | The surface the mouse's ink is drawn on, over every sheet, and nothing at all on a phone |

### apps/server

| Path | One line |
|---|---|
| `apps/server/src/index.ts` | the worker: `/room/:code` and `/net/health` |
| `apps/server/src/room.ts` | the Durable Object — seats, beat zero, relay, clock sync |
| `apps/server/src/seat.ts` | A seat, and everything one does to a socket that holds one |
| `apps/server/dev.ts` | `wrangler dev`, on a port that belongs to this tree |
| `apps/server/src/start-gate.ts` | The two presses that stand between a full room and beat zero |
| `apps/server/src/room-start.ts` | The gate's two sockets-facing halves: telling both phones who has pressed |
| `apps/server/src/names.ts` | The name registry: one Durable Object holding every claimed name |
| `apps/server/src/room-open.ts` | Everything that must be true before a socket is worth accepting, in the order it is worth being false in |
| `apps/server/src/room-tally.ts` | The tally's storage half, and giving up on a run nobody is playing |
| `apps/server/src/tally.ts` | What a pair got to, kept by the room they share |

### tools

| Path | One line |
|---|---|
| `tools/director/src/grid.ts` | the beat grid a wave is placed on |
| `tools/director/src/stage.ts` | the wave, playing, in the shape the phone draws |
| `tools/director/src/stage-touch.ts` | the stage played rather than edited — the game's own controls |
| `tools/director/src/brushes.ts` | the brush list, derived from the bestiary rather than named by hand |
| `tools/director/src/palette.ts` | the brush bar drawn from `brushes.ts`, grouped and with `hidden` applied |
| `tools/director/src/entry-fields.ts` | what one arrival can say about itself: a rock's speed and width, a body's colour |
| `tools/director/src/cell-config.ts` | those fields as rows under the selected cell |
| `tools/director/src/balance.ts` | the live balance sheet, as numbers |
| `tools/director/src/ship.ts` | what the ship can do, read off SimConfig |
| `tools/director/src/boss.ts` | the boss panel: which boss the wave carries, and its knobs |
| `tools/director/src/simon-editor.ts` | THE MIRROR's rounds, edited as lists of controls |
| `tools/director/src/roster.ts` | the unbuilt bestiary and the bosses, parsed out of the spec |
| `tools/director/src/sound-page.ts` | THE SOUND CATALOGUE sheet: every sound, playable, bound or unspent |
| `tools/director/src/sound-link.ts` | what a sound is attached to, and the five that are attached to nothing |
| `tools/director/src/sound-art.ts` | that subject drawn — a contour or a control glyph, never an invented icon |
| `tools/director/src/sound-plot.ts` | a sound as time against frequency, with the speech band shaded |
| `tools/director/src/backlog-page.ts` | the NOT BUILT YET sheet, and which panel each of its tabs is |
| `tools/director/src/backlog.ts` | the six groups NOT BUILT YET is arranged into: five parsed out of the spec, and `designs` built in `design-docs.ts` |
| `tools/director/src/backlog-api.ts` | `GET /api/backlog`: nine files read, parsed and joined into one response |
| `tools/director/src/design-docs.ts` | `docs/versus.md`, `teaching.md`, `alive.md` as backlog, one group per file |
| `tools/director/src/sections.ts` | the "## N Title — tail" shape shared by several spec files |
| `tools/director/src/concepts.ts` | couplings, assist forms, unbuilt systems and the idea store |
| `tools/director/src/shapes-panel.ts` | the shape catalogue: drafts, then spare, then spent |
| `tools/director/src/shapes-motion.ts` | a sway in tiles turned into a card that does not clip |
| `tools/director/src/serialize.ts` | one act's wave array, written back into its own `waves/act-*.ts` |
| `tools/director/src/waves-api.ts` | `GET`/`PUT /api/waves`, and the base-revision token that refuses a clobber |
| `tools/director/src/waves-io.ts` | the page's half of that: load, save, and the token it holds in between |
| `tools/shape-sheet/src/subjects.ts` | every silhouette as a function of time |
| `tools/shape-sheet/src/catalogue.ts` | drawn, spare and drafted — which shapes are spendable |
| `tools/shape-sheet/src/forms/` | contour forms the game has no creature for yet |
| `tools/shape-sheet/src/motions.ts` | the spare motions, unclaimed by anything |
| `tools/shape-sheet/src/drafts/` | a shape per open idea, and what each is offered to |
| `tools/orphans/orphans.ts` | a mechanic that is built and reached by nothing, with where to fix it |
| `tools/director/src/orphans-panel.ts` | the ORPHANS sheet, painted red the moment the count leaves zero |
| `tools/land/land.ts` | whether a lane can land on a linear trunk, and what that would do |
| `tools/land/notes.ts` | a landed commit turned into a release note, and where it goes in the file |
| `tools/land/worktree.ts` | removing a worktree on Windows, verified rather than trusted, and when |
| `tools/director/src/notes.ts` | `docs/release-notes.md` parsed into entries, grouped by day |
| `tools/director/src/notes-page.ts` | the RELEASE NOTES sheet — read-only, no buttons, no count |
| `tools/director/src/dom.ts` | `el` and `button`, the two helpers every panel builds rows out of |
| `tools/ports.ts` | which port a server takes, and whose tree it serves |
| `tools/relay-check/check.ts` | two headless devices against a real relay |
| `tools/delegate/run.ts` | the one command that hands a spec to the worker |
| `tools/delegate/mentions.ts` | the paths a spec names, handed over read-only |
| `tools/delegate/ignored.ts` | what `.aiderignore` keeps out of the worker's reach |
| `tools/build-stamp.ts` | The day the bundle in front of you was built |
| `tools/delegate/timeout.ts` | Aider has no run-level limit of its own |
| `tools/dev/supervise.ts` | `bun run dev` — a hot server, and a hand on its shoulder |
| `tools/dev/tree-moves.ts` | When the working tree was rewritten under a running server, and by whom |
| `tools/director/build.ts` | Builds the director the way `apps/game/preview.ts` builds the game: a static bundle |
| `tools/director/server.ts` | The director's server |
| `tools/director/shapes-page.ts` | Build the shape catalogue into one self-contained page |
| `tools/director/shapes-still.ts` | Draw a skin without starting anything |
| `tools/director/src/backlog-ideas.ts` | The "accepted in principle, not worked out" half of the backlog — split out of `backlog.ts` on line count |
| `tools/director/src/backlog-tabs.ts` | The tabs of the NOT BUILT YET sheet that are drawn on first sight rather than on first open |
| `tools/director/src/boss-cycles.ts` | The two boss panels that are mostly a cycle, and the chrome all of them share |
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
| `tools/director/src/demo-panel.ts` | DEMOS — one wave and one set of switches per mechanic, opened in one click |
| `tools/director/src/docs-api.ts` | The GET routes that only read a document off disk — `docs/borrowed.md` and the spec directory |
| `tools/director/src/field-controls-page.ts` | The other half of the CONTROLS tab (`controlsets-page.ts`) — split out on line count |
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
| `tools/director/src/guide-gallery.ts` | Every guide in the game, drawn in both roles side by side |
| `tools/director/src/guide-order.ts` | How one wave opens, drawn in order: the introduction, then its guide |
| `tools/director/src/guide-page.ts` | The two review pictures a finished guide is put to, appended under DOCUMENTATION's GUIDES list |
| `tools/director/src/guide-sheet.ts` | GUIDES: every wave that carries a guide, in the order a pair plays them |
| `tools/director/src/guide-waves.ts` | Which waves carry a guide, and a world posed at the moment one opens |
| `tools/director/src/hits/dim.ts` | The body simply goes dark for a beat |
| `tools/director/src/hits/flash.ts` | One bright frame, then gone |
| `tools/director/src/hits/ring.ts` | A circle leaving the body and fading — the shockwave |
| `tools/director/src/hits/shake.ts` | The figure jitters on impact and settles |
| `tools/director/src/hits/shards.ts` | A burst of short strokes thrown outward and falling away |
| `tools/director/src/hits/squash.ts` | The body flattens on impact and springs back |
| `tools/director/src/hits/telegraph.ts` | A glow building over the beats before the hit, snapping off the instant it lands |
| `tools/director/src/hits/types.ts` | What a hit is, and what it is told |
| `tools/director/src/holders-panel.ts` | The BULB QUEEN VARIANTS tab |
| `tools/director/src/holders/collar.ts` | THE COLLAR — the reference picture's own answer, turned on its side |
| `tools/director/src/holders/cradle.ts` | THE CRADLE — she is holding it with herself |
| `tools/director/src/holders/crane.ts` | THE CRANE — the owner's own suggestion: an arm holds the rock out and lets go of it |
| `tools/director/src/holders/hairline.ts` | HAIRLINE — her shell keeps every petal she has lost as a crack across it |
| `tools/director/src/holders/queen-cycle.ts` | The one clock the three whole-body BULB QUEEN VARIANTS run on |
| `tools/director/src/holders/queen-panel.ts` | Mounting for the three whole-body BULB QUEEN VARIANTS |
| `tools/director/src/holders/queen-shared.ts` | What every whole-body BULB QUEEN VARIANT shares |
| `tools/director/src/holders/queen-shell.ts` | The baseline BULB QUEEN body a whole-body draft starts from |
| `tools/director/src/holders/types.ts` | What a holder draft is, and what it is told |
| `tools/director/src/holders/underglow.ts` | UNDERGLOW — the shell stays whole; what changes is the light through it |
| `tools/director/src/holders/withdrawal.ts` | WITHDRAWAL — she hunches, rather than cracking or glowing, as she is hurt |
| `tools/director/src/keep-alive.ts` | The page telling its server that somebody still has it open |
| `tools/director/src/key-help.ts` | The keybindings, shown rather than remembered — "for the time being," in the owner's own words |
| `tools/director/src/keys.ts` | Both roles on one keyboard, so a wave can be tried the moment it is placed |
| `tools/director/src/main.ts` | The director: one screen where a wave is placed, played and judged — not |
| `tools/director/src/markdown.ts` | The little of markdown the spec actually writes, turned into DOM: headings, paragraphs, bullets |
| `tools/director/src/mobile-menu.ts` | On a phone the director opens on a menu, not on a wave |
| `tools/director/src/music-page.ts` | MUSIC: six pieces nobody has decided to use |
| `tools/director/src/music-plot.ts` | A theme drawn: the whole piece on one axis, time across, frequency up |
| `tools/director/src/notes-api.ts` | `GET /api/notes` — the release notes, and the two facts VERSUS votes against |
| `tools/director/src/paint.ts` | The edits: what a click does to a wave, and what takes it back |
| `tools/director/src/pair-panel.ts` | The one switch that exists because the game has two people in front of it |
| `tools/director/src/pinball-editor.ts` | PINBALL's boards, painted on the grid the round is played on |
| `tools/director/src/pose-art.ts` | A posed world, drawn — one frame of the shipping renderer, cut down to the part of the phone the pose is about |
| `tools/director/src/pose-kit.ts` | The apparatus behind a posed frame: a world put into one named state |
| `tools/director/src/poses-field.ts` | The states of the things a wave puts on the field: the creatures, and the two bosses that exist |
| `tools/director/src/poses-mechanics.ts` | What those hands add up to on the field: a hand on something falling, a shot in the air |
| `tools/director/src/poses-ship.ts` | What a player's own hands put the ship into |
| `tools/director/src/poses-surface.ts` | The states a candidate for a **surface** is judged on |
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
| `tools/director/src/ship-groups.ts` | The cards the SHIP tab is divided into: their names, the order they are read in |
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
| `tools/director/src/skins/line.ts` | The outline, and nothing else |
| `tools/director/src/skins/membrane.ts` | A dark fill and the game's own layered aura |
| `tools/director/src/skins/mounted.ts` | The projection every turning skin shares, in one place |
| `tools/director/src/skins/nacre-film.ts` | The film's colour arithmetic — where iridescence stops being a material and starts being a rainbow |
| `tools/director/src/skins/nacre.ts` | NACRE — mother-of-pearl |
| `tools/director/src/skins/parts.ts` | The passes more than one skin draws |
| `tools/director/src/skins/pore.ts` | PORE — a frog's skin: bumps scattered without a lattice, dense in places and sparse in others |
| `tools/director/src/skins/scale.ts` | SCALE — many small, soft plates, laid in offset rows around the body's own centre and shrinking toward the rim |
| `tools/director/src/skins/seed.ts` | Determinism, for skins |
| `tools/director/src/skins/sucker.ts` | SUCKER — an octopus arm: concentric rings, largest along a spine and falling off to either side |
| `tools/director/src/skins/turn.ts` | The first skin that turned |
| `tools/director/src/skins/types.ts` | What a skin is, and what it is told |
| `tools/director/src/skins/vein-pulse.ts` | VEIN again, with the strands breaking the surface and a pulse running out along them |
| `tools/director/src/skins/vein.ts` | CORE with filaments under the skin, clipped to the body |
| `tools/director/src/skins/wind.ts` | WIND — the same turning body, but the phase varies along it |
| `tools/director/src/snake-editor.ts` | SNAKE's arena, edited on the grid the pair will play it on |
| `tools/director/src/spec.ts` | The SPEC tab of DOCUMENTATION: every file in `docs/spec/` verbatim, one expander each |
| `tools/director/src/stage-afterrun.ts` | The after-run screen honours its own instruction |
| `tools/director/src/stage-gauge.ts` | A ROUND THAT IS NOT THE FIELD ANSWERS A MOUSE |
| `tools/director/src/stage-handle.ts` | The handle headless checks drive the stage through |
| `tools/director/src/stage-loop.ts` | The stage's clock: a fixed-timestep loop of its own rather than the game's |
| `tools/director/src/stage-rounds.ts` | Every round that is not the field, bound to the director's canvas at once |
| `tools/director/src/stage-snake.ts` | SNAKE'S SLABS, ANSWERED BY THE DIRECTOR'S MOUSE |
| `tools/director/src/stage-transport.ts` | The buttons under the field: `⏸`/`▶`, `↺ WAVE` and the three role switches |
| `tools/director/src/state.ts` | The edits and the questions moved out when this file went over the line limit |
| `tools/director/src/states-page.ts` | DOCUMENTATION: the topbar's reference doors — STATES, CONTROL SETS, SHIP, DEMOS, GUIDES and SPEC |
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
| `tools/director/src/versus-pose.ts` | Which pose puts a slot's own animation on screen |
| `tools/director/src/versus-seat.ts` | Whether a candidate needs the other seat drawn beside it — decided once, honestly, rather than guessed |
| `tools/director/src/versus-vote.ts` | The vote box: the reason field, the two buttons and the swap-guard banner |
| `tools/director/src/wave-opening.ts` | What the wave being edited puts in front of a pair before it starts |
| `tools/director/src/waves-commit.ts` | A save in the wave editor is a commit |
| `tools/director/src/whole-doc.ts` | The tabs that render one document whole — BORROWED (`docs/borrowed.md`) |
| `tools/frames/capture.ts` | One picture, or a short strip of them, off the running game |
| `tools/frames/chrome.ts` | Which browser `tools/frames` opens, and where it lives on the two machines this repository runs on |
| `tools/frames/hold.ts` | `--hold` on the command line: the one thing this tool could not photograph |
| `tools/frames/opening.ts` | Getting a wave's own opening out of the way, so a capture can start on the field |
| `tools/frames/run.ts` | `bun run frames <sha> --wave N` — a before-and-after picture for a landing |
| `tools/frames/serve.ts` | Getting one *revision* of this game running, so a frame can be taken off it: a scratch worktree, an install |
| `tools/frames/shot.ts` | `bun run shot <#selector> <out.png> [--open "≡ RELEASE NOTES"] [--tab SHAPES] [--wait 2500] [--hold Control]`… |
| `tools/frames/spec.ts` | What a capture is asked for, and what it finds in the page when it gets there |
| `tools/frames/svg.ts` | `bun run png <in.svg> <out.png>` — turn a sheet into something a phone shows |
| `tools/hooks/guard.ts` | The PreToolUse guard: a handful of Bash commands that are wrong in this repo specifically |
| `tools/hooks/scope.ts` | The Stop hook typechecks unconditionally and then decides which test directories can possibly have moved |
| `tools/hooks/shell-words.ts` | A command line, split the way the rules in `guard.ts` need to read it: into commands |
| `tools/icons/run.ts` | `bun run icons` — the home-screen icons, from `apps/game/icon.svg` |
| `tools/index/run.ts` | `bun run index` — completes `docs/INDEX.md`'s "## Code" table: every in-scope source file gets a row |
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
| `tools/versus/prompt.ts` | VERSUS — the text a vote puts on the clipboard, and the only thing it leaves |
| `tools/versus/prompt-changes.ts` | One patch's `old -> new`, the half of a prompt a cold session checks against the files first |
| `tools/versus/prompt-close.ts` | Steps 4 to 7 of a vote prompt: remove the slot, what not to do, check, commit |
| `tools/versus/prompt-steps.ts` | Steps 0 to 3 of a vote prompt: the header, the refusal, the adoption, the readers |
| `tools/versus/prompt-text.ts` | The text layout a vote prompt is set in: the wrapper, the rows, the words for small numbers |
| `tools/versus/run.ts` | `bun run versus` — which slots are open, and what a vote on each one would reach |
| `tools/versus/seed.ts` | One seeded random stream, so the only thing that can differ between the two sides of a VERSUS frame is the… |
| `tools/versus/variant.ts` | VERSUS — the place a second answer to an existing shape can live |
| `tools/index/drift.ts` | Whether a row in `docs/INDEX.md` still describes the file it names |
| `tools/index/sentence.ts` | **The one line a row carries**, read off the file's own header comment and cut to something a table can hold |
| `tools/index/place.ts` | where a new row goes: beside the rows whose names it shares a beginning with |
| `tools/index/generate.ts` | `docs/INDEX.md` as a function of a checkout |
| `tools/land/claims.ts` | Which of the branches a landing finds merged are really queue claims |
| `tools/director/src/waves-acts.ts` | The act files, and the save that writes a wave list back across them |
| `tools/hooks/after-sim-edit.ts` | Determinism is the one thing a reviewer cannot see by looking |
| `tools/hooks/check-on-stop.ts` | The last thing before Claude hands the turn back |
| `tools/hooks/format-edited.ts` | Formatting is not a conversation |
| `tools/hooks/payload.ts` | The shape of a hook payload, read once |
| `tools/director/src/brush-cards.ts` | What one brush's **card** says: the colour it is stroked in, the shape-sheet subjects it draws |
| `tools/director/src/stage-point.ts` | WHERE A CLICK ON THE DIRECTOR'S CANVAS ACTUALLY LANDS |
| `tools/director/src/stage-opening.ts` | A press on the stage while a wave's opening is up |
| `tools/director/src/tried-controls-page.ts` | TRIED AND SET ASIDE — the other list on the CONTROLS tab, and the smaller one |
| `tools/frames/launch.ts` | Getting the *wave's arrival* out of the picture |
| `tools/director/src/ship-notes.ts` | The paragraph under each card's heading, and nothing else |
| `tools/land/push.ts` | `bun run push` — put the trunk on `origin`, because somebody asked |
| `tools/land/specs.ts` | The spent-delegate-spec half of the sweep |
| `tools/hooks/lane-finished.ts` | The turn is over and the lane is finished: put the choice to the owner rather than taking it |
| `tools/director/src/control-set-note.ts` | The roster under the wave editor's control-set picker: every button on the panel, seat by seat |
| `tools/director/src/rail-marks.ts` | The small glyphs in front of a wave's name in the rail: a boss, a panel, a guide |
| `tools/land/say.ts` | What a landing says about itself before and after it happens |
| `tools/maze/draw.ts` | Draw a sheet for THE MAZE: the walls of one circular maze |
| `tools/maze/run.ts` | `bun run maze` — draw a sheet for THE MAZE, ready to paste into `packages/content/src/maze-rounds.ts` |
| `tools/frames/page.ts` | Getting a tab to the moment the world is the capture's, before the first tick |
| `tools/maze/carve.ts` | The walls of THE MAZE's grid: which of them are opened |
| `tools/director/src/maze-editor.ts` | THE MAZE's five stages, walked through one at a time |
| `tools/land/refusal.ts` | Why a push was refused, said in full — git's own words and where the trunk stands |
| `tools/land/replay.ts` | The replay, and the one conflict it settles on its own |
| `tools/land/remote-branch.ts` | The lane's branch on `origin`, after the landing has taken it locally |
| `tools/frames/press.ts` | `--press`: the verbs a held thumb cannot reach |
| `tools/frames/crop.ts` | Cropping and magnifying a captured frame, so a change the size of a creature can be seen |
| `tools/frames/wave.ts` | Which wave `--wave` names, answered against the right commit's own list |
| `tools/frames/opening-hold.ts` | Standing *in* a wave's opening, rather than getting past it |
| `tools/land/queue-guard.ts` | A landing must not put back a queue entry another lane took out |
| `tools/land/queue-merge.ts` | Merging `docs/queue.md` when a lane and the trunk both wrote to it |
| `tools/hooks/session-start.ts` | Pin bun to a version new enough for this repo, in Claude Code on the web |
| `tools/director/src/brush-poses-echo.ts` | THE ECHO's specimen, split out of `brush-poses.ts` when THE CAROM took that file over its 250-line limit |
| `tools/land/state.ts` | the facts a landing is decided from, read off git — `run.ts` moves refs, `land.ts` decides |
| `tools/land/shallow.ts` | A shallow clone, which is what a cloud session lands from |
| `tools/director/src/entry-fields-rock.ts` | **A rock's two numbers**: how fast it falls and how wide it arrives |
| `tools/frames/exec.ts` | The three things every part of this tool needs before it can do anything: where the checkout is |
| `tools/frames/scratch.ts` | The throwaway checkouts `bun run frames` works out of: made, used, and — the part that was missing |
| `tools/land/crlf.ts` | The line endings on disk, asked before `bun run check` is asked anything |
| `tools/retry.ts` | Removing something from disk and then *asking* whether it went — the policy |
| `tools/running.ts` | Where a server that took an OS-assigned port writes the number down |
| `tools/land/race.ts` | Whether some other lane landed while this one was in `bun run check` |
| `tools/director/src/cell-config-gaps.ts` | THE GRATE's row under the map: one chip per column, lit where the wall is open |
| `tools/perf/compare.ts` | What a performance run *is*, and what two of them say when held side by side |
| `tools/perf/measure.ts` | One performance run, taken off a real browser driving the real bundle |
| `tools/perf/run.ts` | `bun run perf` — what a frame costs, wave by wave, at phone speed |
| `tools/perf/waves.ts` | which waves a run covers, from `--wave` to a list of indices |
| `tools/director/src/entry-fields-fence.ts` | **Where a fence is open**, read and written on one arrival |
| `tools/perf/say.ts` | what a run looks like when it is printed — the table, the summary, the comparison |
| `tools/perf/arrivals.ts` | WHAT A WAVE SENDS, in one short string a stale baseline row can be caught by |
| `tools/perf/noise.ts` | WHEN A MEASUREMENT CAN BE TRUSTED, and by how much it has to move before anybody is told about it |
| `tools/frames/browser.ts` | THE ONE PLACE A BROWSER IS OPENED, and the one place it is shut |
| `tools/tmp-litter.ts` | The directories a browser run leaves under `.claude/tmp`, and when one of them is spent |
| `tools/perf/shape.ts` | PUTTING TWO RUNS ON THE SAME FOOTING, and one row from one of them into the other |
| `tools/perf/sweep-timing.ts` | The numbers a paint is sampled with, and the statistics taken off the sample |
| `tools/director/src/fault-fields.ts` | The MALFUNCTION section `rail.ts` shows under the control set |
| `tools/director/src/serialize-boss.ts` | **A wave's boss, written back out**, and the nine shapes it can take |
| `tools/director/src/field-control-def.ts` | **What one row of the ON THE FIELD tab is**, and nothing that fills one in |
| `tools/shape-sheet/src/veer-subject.ts` | **THE VEER**: the meteor with its rider on it, the one card made of a shape already on the sheet plus something over the top |
| `tools/shape-sheet/src/rock-subjects.ts` | Everything on this sheet that is faceted rather than grown: the builder that draws a crystal |
| `tools/director/src/poses-versus.ts` | The states a candidate look is judged on — one per slot that had none |
| `tools/director/src/poses-bodies.ts` | The pose a candidate for a *body* is judged on, as opposed to one for a mechanism firing |
| `tools/director/src/versus-app.ts` | `versus.html` — the page a VERSUS door opens into, and the whole of its routing |
| `tools/director/src/versus-one.ts` | One candidate, alone, on a page of its own — the live half of VERSUS |
| `tools/director/src/versus-open.ts` | Where a look opens, and how a page links to it |
| `tools/director/src/versus-tab.ts` | The VERSUS tab: every look offered beside what the field already draws, never in place of it |
| `tools/director/src/place.ts` | Where you are in the director, as a value — and the two functions that turn it into a URL and back |
| `tools/queue/edit.ts` | Editing `docs/queue.md` and `docs/parked.md` in place: the claim written into an entry |
| `tools/frames/press-plan.ts` | when each `--press` is sent, and the tick that must run after it |
| `tools/perf/renumber.ts` | a merged baseline put back on today's wave numbers |
| `tools/director/src/cell-config-rows.ts` |  |
| `tools/director/src/grid-cell-art.ts` | What one cell of the map draws: the creature that arrives on that beat, and the pod that hangs in that column |
| `tools/director/src/rail-filter.ts` | The filter over the wave list: one field above it, matching a wave's prose and everything it sends |
| `tools/director/src/cell-config-pod.ts` | The rows under the selected cell that configure the **pod** in it: the row it hangs at |
| `tools/director/src/grid-note.ts` | The line of arithmetic under the map: how many entries and pods the wave carries, how long it runs |
| `tools/director/src/grid-gestures.ts` | **Everything a hand can do to one cell of the map**: point at it, paint it, drag a stroke across it |
| `tools/director/src/held.ts` | **What the author is carrying**: the brush that is armed, and — while a drag is in the air |
| `tools/director/src/brush-hints.ts` | SHOW DESCRIPTIONS: whether each brush in the palette carries its sentence |
| `tools/director/src/scene-marks.ts` | The marks: everything a scene draws that is not a body |
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
| `tools/director/src/pose-type.ts` | What a pose *is* — the shape of one, and the two things a caller can ask of one without building it |
| `tools/director/src/versus-crop.ts` | One side of a VERSUS pair: a whole phone, drawn, shown through the window its pose's own `crop` cuts in it |
| `tools/director/src/versus-diff.ts` | How two pictures of the same frame are compared — the pixel arithmetic behind `versus-seat.ts` |
| `tools/hooks/after-svg-edit.ts` | A drawn picture is the one thing a session cannot check by reading it back |
| `tools/director/src/skins/glass.ts` | GLASS — a body you see *into*, rather than one with things drawn on it |
| `tools/director/src/entry-fields-balloon.ts` | **THE BALLOON's one authored fact**: how fast it climbs |
| `tools/director/src/field-controls-balloon.ts` | THE BALLOON's two handles, in a file of their own |
| `tools/director/src/ship-fields-balloon.ts` | THE BALLOON's eight numbers, sorted into their card |
| `tools/director/src/ship-notes-round.ts` | The paragraph under each **round's** card |
| `tools/style-guide/src/colour.ts` | the swatch grid and the hue dial — every colour under its rule, and the twelve body hues at their measured angles |
| `tools/style-guide/src/families.ts` | Every swatch in `PALETTE`, filed under the rule it belongs to |
| `tools/style-guide/src/form.ts` | the drawn panels: the stroke build-up, the size ladder down to 11 px, and the five living silhouettes |
| `tools/style-guide/src/main.ts` | `bun run style-guide` — the specimen sheet for `docs/style-guide.md` |
| `tools/style-guide/src/page.ts` | Page furniture for the style-guide specimen sheet |
| `tools/style-guide/src/depth.ts` | the posed body beside the placed one, through half a turn — why an affine can never bring a mark out from behind |
| `tools/director/src/tails/plume.ts` | A filled tongue back along the body's own axis, three soft balls down it and a near-white root |
| `tools/director/src/tails/wake.ts` | Four short bars lying **across** the line behind the body, shrinking and fading with age |
| `tools/director/src/stage-balloon-both.ts` | **Both of THE BALLOON's handles off one mouse**, and only under TEST |
| `tools/director/src/style-colour.ts` | The colour half of the STYLE page: every swatch in `PALETTE`, filed under the rule it belongs to |
| `tools/director/src/style-form.ts` | The form half of the STYLE page: how a body is drawn, how big it ships, what makes one nameable |
| `tools/director/src/style-page.ts` | DOCUMENTATION → STYLE: the whole visual language on one page, drawn live |
| `tools/frames/press-command.ts` | What one `--press` actually sends, once the line has been taken apart |
| `tools/hooks/after-depth-edit.ts` | a depth claim is the drawing mistake that looks like a success — names the projection to call and the cues to check |
| `tools/shape-sheet/src/cues.ts` | `bun run shapes:cues` — the motion half of `report.ts`, with a placed surface as its last row |
| `tools/shape-sheet/src/depth-cues.ts` | the numbers for motion: drawn aspect, the period count on width and sway, how far a cycle is from mirroring itself, and whether anything is revealed |
| `tools/frames/crank.ts` | A turn of THE CLAW's crank, expanded from one `--press` into the stream of bearings that winds rope |
| `tools/frames/drive.ts` | The three verbs a capture drives the page with, and the rule each of them carries |
| `tools/frames/flags.ts` | Every `--hold` on the command line rather than the first, and the one tick line the ticked ones join |
| `tools/frames/page-handle.ts` | The handle `window.neonSpore` installs, as this tool sees it — every field, and the build that added it |
| `tools/frames/report.ts` | What a finished capture prints, including the `world.tick` each frame was actually taken at |
| `tools/frames/shot-usage.ts` | What `bun run shot` prints when it is called with nothing to photograph |
| `tools/frames/tall.ts` | An element taller than the window, photographed whole rather than black below the fold |
| `tools/director/src/stage-trail.ts` | THE MOUSE'S OWN INK, ON THE DIRECTOR'S FIELD |
| `tools/check/installed.ts` | Whether this worktree's install is still the one the tree needs |
| `tools/check/run.ts` | The preflight `bun run check` runs before the typecheck |

<!-- index:code:end -->
