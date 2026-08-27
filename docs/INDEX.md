# Context map

One line per file, so a session can open the two it needs instead of searching.
Keep this current — it is the cheapest file in the repo and it saves the most.

## Decisions and architecture

| File | Read it when |
|---|---|
| `docs/decisions.md` | you are about to change a technology or a structural rule |
| `docs/architecture.md` | you touch the sim/render boundary, determinism or the tick |
| `docs/working-with-claude.md` | you are setting up a session, a skill or a hook |
| `docs/verification.md` | you land work a sandbox could not look at, or come back to look at it |
| `docs/token-budget.md` | you wonder why files are small and docs are split |
| `docs/delegating.md` | you hand implementation to the worker model |
| `docs/delegation-cost.md` | you wonder whether delegating is worth it — it was measured |
| `docs/delegation-pitfalls.md` | you turn delegation back on for more tasks — the failure modes already hit |
| `docs/asset-catalogue.md` | you are looking for a shape to spend, or adding one |
| `CONVENTIONS.md` | you change what the worker is allowed to do or must know |

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
| `docs/spec/transfers-bosses.md` | you are designing a boss, or looking for a body for an empty act slot |

The German original has been translated in full and deleted; it is in the git
history if the wording of a rejected idea is ever needed.

## Code

| Path | One line |
|---|---|
| `packages/sim/src/config.ts` | every tunable number, `ticksPerBeat`, `hullRow` |
| `packages/sim/src/rng.ts` | the only permitted source of randomness |
| `packages/sim/src/types.ts` | creatures, bullets, scars, commands |
| `packages/sim/src/world.ts` | the world and the single `step` function |
| `packages/sim/src/beat.ts` | the beat: spawning, gliding, the hull, the guard rule |
| `packages/sim/src/commands.ts` | what a press does: the cannon, the shield, the trigger, the grip |
| `packages/sim/src/grip.ts` | THE GRIP: a hand held on something falling, and how much it slows |
| `packages/sim/src/boss.ts` | the Bulb Queen, and which boss a beat belongs to |
| `packages/sim/src/queen-geometry.ts` | how wide her reach is with both flank torches counted in |
| `packages/sim/src/simon.ts` | THE MIRROR's vocabulary: what a step is, what it remembers |
| `packages/sim/src/mirror.ts` | THE MIRROR's choreography: count in, perform, listen |
| `packages/sim/src/mirror-round.ts` | how a round ends: the echo strike, the break, the bait |
| `packages/sim/src/entries.ts` | what a wave hands the sim: spawns, pods, either boss |
| `packages/sim/src/bullets.ts` | firing and tile-wise travel |
| `packages/sim/src/pods.ts` | pods: hanging, shot loose, falling, taken in |
| `packages/sim/src/balance.ts` | the balance sheet: joint moments, SYNC, the streak |
| `packages/sim/src/hash.ts` | world fingerprint — desync detection |
| `packages/sim/src/replay.ts` | the test format: inputs in, fingerprint out |
| `packages/net/src/protocol.ts` | every message that crosses the wire, and how to distrust one |
| `packages/net/src/lockstep.ts` | delayed lockstep: the promise each device makes to the other |
| `packages/net/src/clock.ts` | four-timestamp clock sync, median, moved gently |
| `packages/net/src/desync.ts` | the fingerprint ledger — where `hash.ts` finally gets used |
| `packages/net/src/status.ts` | what the network indicator may say, and nothing else may |
| `packages/net/src/room-code.ts` | the four characters two people read to each other |
| `packages/content/src/creatures.ts` | bestiary and control-visibility table |
| `packages/content/src/waves.ts` | authored waves, 7-column coordinates |
| `packages/content/src/queue.ts` | wave to spawn queue, seeded per wave |
| `packages/content/src/shapes.ts` | contour maths, shared by canvas and SVG |
| `packages/content/src/silhouettes.ts` | the style guide's tuned shape parameters |
| `packages/content/src/own-motion.ts` | how a body sways while going nowhere — the one copy of it |
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
| `apps/game/src/main.ts` | wiring: world, renderer, input, loop, wave progression |
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
| `apps/server/src/index.ts` | the worker: `/room/:code` and `/net/health` |
| `apps/server/src/room.ts` | the Durable Object — seats, beat zero, relay, clock sync |
| `tools/director/src/grid.ts` | the beat grid a wave is placed on |
| `tools/director/src/stage.ts` | the wave, playing, in the shape the phone draws |
| `tools/director/src/stage-touch.ts` | the stage played rather than edited — the game's own controls |
| `tools/director/src/palette.ts` | the creature palette — the brushes are the bestiary |
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
| `tools/director/src/sections.ts` | the "## N Title — tail" shape shared by several spec files |
| `tools/director/src/concepts.ts` | couplings, assist forms, unbuilt systems and the idea store |
| `tools/director/src/shapes-panel.ts` | the shape catalogue: drafts, then spare, then spent |
| `tools/director/src/shapes-motion.ts` | a sway in tiles turned into a card that does not clip |
| `tools/director/src/serialize.ts` | the WAVES array, written back into waves.ts |
| `tools/shape-sheet/src/subjects.ts` | every silhouette as a function of time |
| `tools/shape-sheet/src/catalogue.ts` | drawn, spare and drafted — which shapes are spendable |
| `tools/shape-sheet/src/forms.ts` | contour forms the game has no creature for yet |
| `tools/shape-sheet/src/motions.ts` | the spare motions, unclaimed by anything |
| `tools/shape-sheet/src/drafts/` | a shape per open idea, and what each is offered to |
| `tools/checks/trailers.ts` | the `Check:` trailer: what a commit says nobody has looked at |
| `tools/checks/ledger.ts` | `docs/verified.md` — the half nothing can derive |
| `tools/checks/checks.ts` | history joined to ledger: what is outstanding, which branches are spent |
| `tools/checks/repo.ts` | the git and file calls behind it |
| `tools/director/src/checks-page.ts` | the TO CHECK sheet, and the buttons that decide a check |
| `tools/ports.ts` | which port a server takes, and whose tree it serves |
| `tools/relay-check/check.ts` | two headless devices against a real relay |
| `tools/delegate/run.ts` | the one command that hands a spec to the worker |
| `tools/delegate/mentions.ts` | the paths a spec names, handed over read-only |
| `tools/delegate/ignored.ts` | what `.aiderignore` keeps out of the worker's reach |
