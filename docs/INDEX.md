# Context map

One line per file, so a session can open the two it needs instead of searching.
Keep this current — it is the cheapest file in the repo and it saves the most.
The Code table below is completed by `bun run index`, which adds a row for
any in-scope source file that does not have one yet; a hand-written row is
never overwritten, so improve one by editing its text in place.

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
| `docs/parked.md` | you are stopping mid-way through something, or picking up what a session left half-done — work only, never ideas |
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
| `packages/sim/src/world.ts` | the world and the single `step` function |
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

### packages/content

| Path | One line |
|---|---|
| `packages/content/src/creatures.ts` | bestiary and control-visibility table |
| `packages/content/src/waves.ts` | authored waves, 7-column coordinates |
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
| `packages/content/src/waves/act-2.ts` | act two: the first five bosses, back to back, nothing else |
| `packages/content/src/waves/act-3.ts` | act three: new mechanics after the first five bosses, one more boss among them (THE VANE) |
| `packages/content/src/living-look.ts` | which kinds are drawn as a body of their own, and the contour and own-motion of each — one row per kind, so a forgotten one is a build error |
| `packages/content/src/creatures-rocks.ts` | you are adding a rock tier or changing what one of the six says about itself |
| `packages/content/src/waves/act-4.ts` | you are adding a wave — this is the act new ones land in |
| `packages/content/src/ghost-shape.ts` | THE GHOST's contour, which is the third family of them in this package |
| `packages/content/src/snake-rounds.ts` | SNAKE's rounds: three maps, and the map is the fight |
| `packages/content/src/creatures-worn.ts` | the five bestiary rows for bodies drawn as something else — a slick or a bulb under a disguise, plating, a membrane, weather or nothing but a smaller size |
| `packages/content/src/controls-round.ts` | The buttons that belong to a round rather than to the ship |
| `packages/content/src/pinball-rounds.ts` | PINBALL's boards, one per round, **drawn rather than listed** |
| `packages/content/src/waves/act-5.ts` | you are adding a wave — this is the act new ones land in, act four having filled |

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
| `packages/render/src/flare.ts` | A starting point for a future creature, cloned from the torch's original look before the torch itself was |
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
| `packages/render/src/wisp.ts` | you are drawing a wisp, its teleport, or deciding which screen sees one |
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
| `packages/render/src/gyre.ts` | you are drawing the wheel under THE GYRE's six bodies — hub, rim and spokes, behind everything they carry |
| `packages/render/src/target-lock.ts` | THE TARGET LOCK: the one marking in this game that means *an instrument has picked this body out, and it |

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
| `packages/audio/src/music/themes.ts` | Six pieces of music, none of which the game plays |

### apps/game

| Path | One line |
|---|---|
| `apps/game/src/main.ts` | wiring: world, renderer, input, loop |
| `apps/game/src/waves.ts` | the two ways a wave starts, and the banner that names it |
| `apps/game/src/audio.ts` | the mixer wired to the loop: unlock on a gesture, clear on a restart, M to mute |
| `apps/game/src/loop.ts` | fixed timestep; the only place wall-clock time exists |
| `apps/game/src/viewport.ts` | the window's size, and the stage and layout derived from it |
| `apps/game/src/input.ts` | pointers and capture; what a touch *means* is `render/touch.ts` |
| `apps/game/src/keys.ts` | commands from the keyboard — the test rig, not the game |
| `apps/game/src/testing.ts` | pause, wave skip and the tuning sliders |
| `apps/game/src/link.ts` | solo or two devices: the clock, the scheduler, beat zero |
| `apps/game/src/relay.ts` | the socket, and only the socket |
| `apps/game/src/join.ts` | the room screen and the network indicator, which are one thing |
| `apps/game/src/menu.ts` | the main menu, and the rule that keeps it out of a tester's way |
| `apps/game/src/menu-view.ts` | its three pages: the entries, the authored waves, the keys |
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

### apps/server

| Path | One line |
|---|---|
| `apps/server/src/index.ts` | the worker: `/room/:code` and `/net/health` |
| `apps/server/src/room.ts` | the Durable Object — seats, beat zero, relay, clock sync |

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
| `tools/director/src/backlog.ts` | the six spec-derived groups, and where `queue`/`designs` are stitched in |
| `tools/director/src/backlog-api.ts` | `GET /api/backlog`: ten files read, parsed and joined into one response |
| `tools/director/src/design-docs.ts` | `docs/versus.md`, `teaching.md`, `alive.md` as backlog, one group per file |
| `tools/director/src/sections.ts` | the "## N Title — tail" shape shared by several spec files |
| `tools/director/src/concepts.ts` | couplings, assist forms, unbuilt systems and the idea store |
| `tools/director/src/shapes-panel.ts` | the shape catalogue: drafts, then spare, then spent |
| `tools/director/src/shapes-motion.ts` | a sway in tiles turned into a card that does not clip |
| `tools/director/src/serialize.ts` | the WAVES array, written back into waves.ts |
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

<!-- index:code:end -->
