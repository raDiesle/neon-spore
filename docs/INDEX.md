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
| `docs/token-budget.md` | you wonder why files are small and docs are split |
| `docs/delegating.md` | you hand implementation to the worker model |
| `docs/delegation-cost.md` | you wonder whether delegating is worth it — it was measured |
| `docs/delegation-pitfalls.md` | you turn delegation back on for more tasks — the failure modes already hit |
| `docs/claude-vs-chatgpt.md` | you are wondering whether the subscription paying for the agent should change — task by task, with a verdict column |
| `docs/borrowed.md` | you are mining It Takes Two or Split Fiction for a mechanic — the verdict column says what can reach this game |
| `docs/tower-defence.md` | you want a slick, a bulb or a meteor to be played differently, or a weapon or helping system — read off 2D tower defence, with pictures |
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
| `packages/sim/src/grip.ts` | THE GRIP: a hand held on something falling, and how much it slows |
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
| `packages/sim/src/config-creatures.ts` | what one creature costs and how long its own clock runs |
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
| `packages/sim/src/maze-wheel.ts` | THE MAZE's wheel as a *written-down thing*: what a round author types, and what is wrong if they typed it wrong |
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

### packages/content

| Path | One line |
|---|---|
| `packages/content/src/creatures.ts` | what a creature demands: `CreatureDef`, radar owner, category — the table itself is in `creatures-table.ts` |
| `packages/content/src/waves.ts` | the barrel: every act's array concatenated in order, never a save target |
| `packages/content/src/queue.ts` | wave to spawn queue, seeded per wave |
| `packages/content/src/shapes.ts` | contour maths, shared by canvas and SVG |
| `packages/content/src/silhouettes.ts` | the style guide's tuned shape parameters |
| `packages/content/src/own-motion.ts` | how a body sways while going nowhere — the one copy of it |
| `packages/content/src/long-axis.ts` | which way a body is long, and the quarter turn a motion written along one takes |
| `packages/content/src/control-sets.ts` | a control set: the whole panel, both players at once, for one wave |
| `packages/content/src/controls.ts` | every button either player can be given, one row each, listed rather than switched on |
| `packages/content/src/creatures-table.ts` | adding a creature means adding one entry here |
| `packages/content/src/hull-shape.ts` | the hull's own geometry, split out of `shapes.ts` when that file hit its size cap |
| `packages/content/src/light.ts` | where the light is — the one named direction every sheen, crater and glow reads against |
| `packages/content/src/maze-rounds.ts` | THE MAZE's wheels, one per round |
| `packages/content/src/mechanics-table.ts` | the rows themselves, lifted out of `mechanics.ts` when that file crossed the 250-line limit |
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
| `packages/content/src/creatures-rocks.ts` | you are adding a rock tier or changing what one of the six says about itself |
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
| `packages/content/src/scenes/two-colours.ts` | TWO COLOURS' rehearsal: the wrong colour, then the right one |
| `packages/content/src/scenes/the-dart.ts` | THE DART's rehearsal: the column you were given is the column it has already left |
| `packages/content/src/scenes/the-lure.ts` | THE LURE's rehearsal: the shot you are waiting for must never come |
| `packages/content/src/scenes/the-throb.ts` | THE THROB's rehearsal: the wave where firing on sight is the miss |
| `packages/content/src/scenes/the-veil.ts` | THE VEIL's rehearsal: the colour you were given goes stale while you are loading it |
| `packages/content/src/scenes/salvage.ts` | SALVAGE's rehearsal: shooting something is only half of getting it |
| `packages/content/src/scenes/the-clasp.ts` | THE CLASP's rehearsal: the shield opens the enemy instead of stopping it |
| `packages/content/src/scenes/the-rind.ts` | THE RIND's rehearsal: the shot that lands does not close the column |
| `packages/content/src/scenes/the-third-shot.ts` | THE THIRD SHOT's rehearsal: the shot that worked twice is the miss |
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
| `packages/content/src/scenes/shield-then-cannon.ts` | SHIELD, THEN CANNON's rehearsal: the other way to reach everything |
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
| `packages/content/src/control-sets-table.ts` | Every panel in the game, as a table |
| `packages/content/src/scenes/cyan.ts` | CYAN's rehearsal: the second button, on its own |
| `packages/content/src/scenes/two-rocks.ts` | TWO ROCKS' rehearsal: the plate becomes something player 2 can carry |

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
| `packages/render/src/grip.ts` | the grip drawn: beam, ring, and whose hand it is |
| `packages/render/src/lance.ts` | the lance drawn: the button filling, and the mark that puts on a column |
| `packages/render/src/torch.ts` | the torch: three-tile crystal, amber core, its own afterimages |
| `packages/render/src/torch-alarm.ts` | the role-aware banner and pulsing band a torch in the queue triggers |
| `packages/render/src/bullets.ts` | shots and their tails |
| `packages/render/src/effects.ts` | deflection, shockwave, DEFLECTED, the swallow's timing |
| `packages/render/src/sparks.ts` | the particles every impact spends, thrown out or drawn in |
| `packages/render/src/balance.ts` | the screen after the run, drawn |
| `packages/render/src/hud.ts` | hull, score, beat, the guard balance, overlays |
| `packages/render/src/band.ts` | the two control strips, trigger and colours |
| `packages/render/src/canvas2d.ts` | the renderer, orchestrating the above |
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
| `packages/render/src/maze-draw.ts` | THE MAZE's picture: a closed drum of rings turning over the ship, with the mouth that has clicked onto a |
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
| `packages/render/src/eye.ts` | you are drawing an eye — the film, the lens that opens from a slit, the breathing pupil, the lashes and the cilia, shared by THE LID and THE WARDEN |
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
| `packages/render/src/ghost-row.ts` | What player 1 gets instead of the body: a band across the row it is in, and nothing whatever about the column |
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
| `packages/render/src/wisp-search.ts` | you are changing the box that walks the grid on the pilot's screen while a wisp is out — the seat that cannot see one |
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
| `packages/render/src/pinball-bucket.ts` | you are drawing PINBALL's bucket — the ship's own skin in another shape, and the ball waiting in its mouth |
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
| `packages/render/src/volley-seams.ts` | **The pattern painted on THE VOLLEY's shell**: the four seams a basketball has |
| `packages/render/src/band-lobes.ts` | Where the round buttons on the band stand, for one seat and one panel |

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

### apps/game

| Path | One line |
|---|---|
| `apps/game/src/main.ts` | wiring: world, renderer, input, loop |
| `apps/game/src/waves.ts` | the two ways a wave starts, and the banner that names it |
| `apps/game/src/audio.ts` | the mixer wired to the loop: unlock on a gesture, clear on a restart, M to mute |
| `apps/game/src/loop.ts` | fixed timestep; the only place wall-clock time exists |
| `apps/game/src/viewport.ts` | the window's size, and the stage and layout derived from it |
| `apps/game/src/input.ts` | pointers and capture; what a touch *means* is `touch.ts` |
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
| `apps/game/src/keys-round.ts` | The keys that belong to a round rather than to the field |
| `apps/game/src/snake.ts` | The host's half of SNAKE: the four thumbs that play it |
| `apps/game/src/pinball.ts` | The host's half of PINBALL: the four thumbs that play it |
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
| `tools/director/src/docs-api.ts` | The GET routes that only read a document off disk — `docs/borrowed.md`, `docs/tower-defence.md` |
| `tools/director/src/field-controls-page.ts` | The other half of the CONTROLS tab (`controlsets-page.ts`) — split out on line count |
| `tools/director/src/fleet-editor.ts` | THE FLEET's placement, edited on the chart the pair will play it on |
| `tools/director/src/gallery-clips.ts` | "COLLECTED LOOKS" on the OTHER GRAPHICS tab: hand-painted frame sequences from outside this repo |
| `tools/director/src/gallery-page.ts` | "COLLECTED LOOKS": external hand-painted frame sequences |
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
| `tools/director/src/grid-pods.ts` | The two things under the map that are about the wave rather than about one cell: the list of pods |
| `tools/director/src/guide-fields.ts` | The GUIDE section `rail.ts` shows directly under SENTENCE: the three lines a wave's guide is made of |
| `tools/director/src/guide-gallery.ts` | Every guide in the game, drawn in both roles side by side |
| `tools/director/src/guide-order.ts` | How one wave opens, drawn in order: the introduction, then its guide |
| `tools/director/src/guide-page.ts` | A GUIDES tab, added to the NOT BUILT YET sheet |
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
| `tools/director/src/poses.ts` | Every state the STATES sheet draws, in reading order |
| `tools/director/src/query.ts` | What is in a wave: the questions, with no answer that changes anything |
| `tools/director/src/rail.ts` | The wave list and the fields every wave must carry |
| `tools/director/src/raster-cards.ts` | The card builders for "THE BURST, THREE WAYS" and the caps table for "WHAT THIS BROWSER CAN DO" |
| `tools/director/src/raster-demos.ts` | The three canvas demos on the RASTER tab — the atlas driven by hand, outside a `World` |
| `tools/director/src/raster-field.ts` | A real wave, playable, with the baked burst on a switch |
| `tools/director/src/raster-page.ts` | The OTHER GRAPHICS tab: every look offered beside what the field already draws, never in place of it |
| `tools/director/src/raster-play.ts` | "PLAY IT" — the section that puts the burst where it would actually live |
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
| `tools/director/src/spec.ts` | The SPEC tab: every file in `docs/spec/` verbatim, one expander each |
| `tools/director/src/stage-afterrun.ts` | The after-run screen honours its own instruction |
| `tools/director/src/stage-gauge.ts` | A ROUND THAT IS NOT THE FIELD ANSWERS A MOUSE |
| `tools/director/src/stage-handle.ts` | The handle headless checks drive the stage through |
| `tools/director/src/stage-loop.ts` | The stage's clock: a fixed-timestep loop of its own rather than the game's |
| `tools/director/src/stage-pinball.ts` | PINBALL'S SLABS, ANSWERED BY THE DIRECTOR'S MOUSE |
| `tools/director/src/stage-rounds.ts` | Every round that is not the field, bound to the director's canvas at once |
| `tools/director/src/stage-snake.ts` | SNAKE'S SLABS, ANSWERED BY THE DIRECTOR'S MOUSE |
| `tools/director/src/stage-transport.ts` | The buttons under the field: `⏸`/`▶`, `↺ WAVE` and the three role switches |
| `tools/director/src/state.ts` | The edits and the questions moved out when this file went over the line limit |
| `tools/director/src/states-page.ts` | GAME MECHANICS: the topbar's four reference doors — STATES, CONTROL SETS, SHIP and DEMOS |
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
| `tools/director/src/versus-page.ts` | The ALTERNATIVES section: a contact sheet, not an instrument |
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
| `tools/land/orphans.ts` | The litter left behind when a removal was trusted instead of verified |
| `tools/land/retry.ts` | Removing something from disk and then *asking* whether it went — the policy |
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

<!-- index:code:end -->
