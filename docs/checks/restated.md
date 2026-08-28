# Checks, in plainer words

The `Check:` trailers are the record and cannot be edited — they live in commit
messages on a linear `main` that is pushed. This file sits beside them and says
the same thing in a way a person can act on cold, weeks later, without having
seen the code.

Each entry is keyed by the commit's sha and the trailer's own text, exactly the
way `docs/verified.md` keys its decisions, so a restatement cannot drift onto
the wrong check. Three fields, and none of them replaces the trailer:

- **subject** — the thing being judged, named: a creature, a wave, a boss, a sheet.
- **changed** — what is new, in a clause, so the difference from *before* is imaginable.
- **decide** — the question, with a yes and a no. A check whose failure cannot be
  pictured never gets ticked either.
- **where** — the command, and the wave or tab inside it.

---

## `d5df018` — the swallow

> the wider mouth still reads as swallowing rather than as a flash, not merely smaller — looked at one catch in preview, not the shape sheet

- **subject** the cannon's fire opening while it takes a pod in
- **changed** the opening used to stretch downwards, past the edge of the field; it now widens sideways and rounds out inside, at 99.8% of the same area
- **decide** does the wider shape still read as *effort* — a mouth working — or does it read as a flash that happens to be bigger?
- **where** `bun run preview`, any wave with a pod; shoot the pod loose and catch it

> whether activating at the centre (already instant) still feels like a reward arriving now that the mouth reads wider and shallower

- **subject** the moment a power-up starts working
- **changed** nothing in the timing — it was already instant; only the mouth around it changed
- **decide** does the reward still land *with* the swallow, or does the shallower mouth make it feel early?
- **where** same wave, same catch

## `ada7090` — the shot wind-up

> the wind-up reads as laying rather than as lag — the mouth working, not the trigger answering late

- **subject** the cannon between the press and the bolt leaving
- **changed** a shot used to exist the instant you pressed; it now gathers for half a beat and is extruded, so your partner can see it coming
- **decide** does the pause read as the ship *doing something*, or as the button not responding?
- **where** `bun run preview`, fire on any wave. Compare against the old behaviour by setting the Shot lay slider to 0 in the TEST panel

> at 0, 0.125, 0.25, 0.5, 0.75 and 1 beat on the Shot lay slider, which values feel like rhythm and which like a dead trigger

- **subject** the length of the wind-up
- **changed** it is a slider now, defaulting to half a beat (312 ms at 96 BPM)
- **decide** which values feel like rhythm and which feel broken — this is the number the mechanic stands on
- **where** `bun run preview`, TEST panel, Shot lay slider

> a maw held open while a shot is laid still reads as one mouth rather than two effects fighting — worth looking at beside the reshaped swallow

- **subject** the same opening doing both jobs at once
- **changed** two lanes landed into this one aperture on the same evening — a swallow that widens it and a wind-up that swells it
- **decide** one mouth with two behaviours, or two effects competing for one place on the hull?
- **where** `bun run preview` — catch a pod and fire during the catch

> whether losing a laid shot by sliding the cannon during the wind-up reads as a mistake the pair made or as the game eating a press

- **subject** what happens when the cannon moves mid-charge
- **changed** there was nothing to lose before, because the shot left immediately
- **decide** does losing it feel like your error, or like the game stealing an input?
- **where** `bun run preview` — press fire, then immediately slide the cannon

## `a30c565` — THE GAUGE

> the dial reads as machinery and not as a wave with a costume on

- **subject** the first round that is not the field
- **changed** everything — this round has its own rules, its own controls and its own picture
- **decide** does it read as a different kind of thing, or as the field wearing a hat?
- **where** `bun run preview`; it opens in the gap before wave 10

> ninety seconds is the right length for one needle and two marks

- **subject** how long a gauge round runs
- **changed** 128 beats, five marks to pass
- **decide** too long, too short, or right?
- **where** same round, played through

> LEFT and RIGHT are reachable by one thumb on a phone in portrait

- **subject** the pilot's two controls in that round
- **changed** an interlude has its own controls rather than reusing the band
- **decide** can one thumb hold either without shifting grip?
- **where** the preview at phone width, or a real phone

## `cf34c47` — the two silences

> ship.forkOpen reads as a room going quiet, not a chime or an alarm

- **subject** the sound when the run stops between waves
- **changed** it was silent; there is now a sub-tone and a soft tick
- **decide** does it settle, or does it announce?
- **where** `bun run dev`, the ♪ SOUND sheet — play `ship.forkOpen`

> impact.wrongTarget is heard as wrong beside impact.destroyRed/Cyan, not as a kill

- **subject** the sound of shooting the Runt, which you must not shoot
- **changed** it used to spend the ordinary destroy cue, so a mistake sounded like a success
- **decide** played next to the two real destroy sounds, does it read as *wrong*?
- **where** `bun run dev`, ♪ SOUND — play all three in a row

> the runt's grey burst reads as wrong beside a real destroy burst, on a real screen

- **subject** the particles when the Runt is hit
- **changed** grey, eight particles, never red or cyan — against destroy's twelve coloured ones
- **decide** does it read as a mistake rather than as a smaller kill?
- **where** `bun run preview`, the wave THE RUNT

## `62d728f` — the two creatures

> THE RUNT reads as small and helpless beside a slick at 26 px, and not merely as a slick drawn smaller — `bun run shapes:report`

- **subject** the Runt's silhouette and motion
- **changed** it is 0.55× the size of a slick and now trembles on three incommensurate frequencies instead of tilting
- **decide** helpless, or just small?
- **where** `bun run dev`, ▣ SHAPES — and see `docs/versus.md` for a second motion already written, not yet built

> the Throb's swell is legible as "wait for it" at tempo rather than as a flicker, which is the whole of what tells the pair when to fire

- **subject** the Throb's beat-driven open and shut
- **changed** its own-motion was reduced to almost nothing, so the swell is the only thing it says
- **decide** does the swell tell you when to fire, or is it noise?
- **where** `bun run dev`, ▣ SHAPES — note the still sheet cannot show this; only the animated page can

## `f2e0d6d` — opening a demonstration

> a demonstration opened from the game's own menu reads as landing on a wave that was always going to open that way, not as a jump with something flipped behind it — bun run preview:once, ?menu=1, DEMOS, any row

- **subject** the game's own main menu, opening a mechanic from its new DEMOS page
- **changed** DEMOS is new: picking a row calls `openDemonstration`, which mutates the run's `cfg` in place and jumps to the named wave in one motion, the same close-the-menu-and-play the WAVES page already does
- **decide** does the wave arrive the way any other menu pick would, or does the config flip read as a visible jolt — a banner, a briefing card, a beat grid appearing a step late?
- **where** `bun run preview:once`, confirm the tree at `/__preview`, then `?menu=1` → DEMOS → any row

> the director's DEMOS sheet and its OPEN button read as belonging beside the pair panel and wave rail rather than as a bolted-on modal — DIRECTOR_HOST=127.0.0.1 bun run dev, then click DEMOS

- **subject** the director's new DEMOS sheet (`tools/director/src/demo-panel.ts`), styled after the existing ORPHANS sheet
- **changed** a full-screen sheet listing every mechanic; OPEN sets the wave rail's selection and the pair panel's switches together, closing itself on success
- **decide** does the sheet's shell, the row styling and the OPEN button read as one more tool that already lived here, or as a screen dropped in from somewhere else?
- **where** `DIRECTOR_HOST=127.0.0.1 bun run dev`, click ▶ DEMOS in the header, then OPEN on a few rows

## `9d9e58e` — the pose clock, and seven phases

> the runt's tremor now runs on the beat clock and its three frequencies moved to 8.3/12.7/5.9 — does it still read as debris caught in the wave rather than as something moving with it? `bun run preview`, the wave named THE RUNT.

- **subject** the Runt's shiver, the one creature the pair must not shoot
- **changed** its tremor used to be sampled on the page's own wall clock, which knew nothing about the beat; it is now on `world.beat`, where 5.3 rad/s would have sat within a few percent of the beat's own 5.03 — so the triple was moved out to 8.3 / 12.7 / 5.9, the only number in this change that is not a unit conversion
- **decide** does the runt still read as debris the wave is carrying — arrhythmic, helpless, not part of the formation — or does its shiver now look locked to the same pulse everything else moves on, which would make it look like a target?
- **where** `bun run preview`, the wave named THE RUNT; watch the colourless body in column 3 against the cyan one that arrives a beat later

> every body's phase is now a hash of its id spread over eight beats rather than one of seven fixed values — does a full row read as in time but not in step, or does it now read as merely scattered? `bun run preview`, the wave named CROWDED.

- **subject** how a row of creatures idles together
- **changed** each body's place in its cycle was `(id % 7) * 0.9` — seven phases on an eleven-column field, so neighbours in perfect step were routine and n and n + 1 were always exactly 0.9 apart; it is now an integer hash of the id, every body different, spread across eight beats
- **decide** the field is meant to be *in time* without being *in step*: every creature still moves one row on the same instant, but nothing idles in unison. Does a full row now read that way — one wave, many bodies — or has the extra spread tipped it into looking like unrelated things that happen to be side by side?
- **where** `bun run preview`, the wave named CROWDED, which is the widest row in the run; compare against ALTERNATING, which is sparse enough that phase hardly shows

## `7490495` — four marks on the ship, and two interlude bodies

> the four hull marks are new — nothing was ever drawn on the membrane before except the shield. The ship raises a lobe for exactly one thing today. Does HULL · HELD's lobe (6.0 px, a full column wide) read as a *different* claim from HULL · ARMED's shield (7.5 px, two thirds of a column), or does any lump on the hull just mean "shield"? Yes and both ideas are cheap; no and The Other Hand needs a mark somewhere off the membrane. `bun run dev`, NOT BUILT YET → SHAPES.

- **subject** HULL · HELD, the draft offered to *The Other Hand* — a lobe that stands up while the partner's thumb is down
- **changed** the ship's silhouette has only ever carried two features, the cannon lobe and the shield; this is the first third thing, and it deliberately borrows the shield's register because there is nowhere else on a membrane to say something
- **decide** does the held lobe say something the shield does not, or does the eye file both as "the shield"? Shorter and a full column wide against taller and narrower is the entire margin
- **where** `bun run dev`, NOT BUILT YET → SHAPES; put HULL · HELD and HULL · ARMED on screen together

> HULL · MENDED's welt is flat-topped with shoulders a fifth of a column, against the shield's long-shouldered swelling — that contrast is the whole margin and it was chosen, not measured against an eye. Does a held seam read as *made* beside a shield that reads as *grown*, at card size? `bun run dev`, SHAPES, with HULL · ARMED in view at the same time.

- **subject** HULL · MENDED, the draft offered to *The Patch* — a scar held shut by a hand
- **changed** the welt is 7.0 px over a flat plateau half a column wide with shoulders a fifth of one; the armed shield is 7.5 px, round, over two thirds of a column. Nearly the same height on purpose: shape is meant to be the difference, not size
- **decide** does a flat top with square shoulders read as something *put there* rather than something the ship grew? If not, a patch cannot live on the membrane
- **where** `bun run dev`, SHAPES, with HULL · ARMED in view at the same time

> HULL · TORN is the first shape in the catalogue drawn as two open strokes instead of one. Does a 23 px hole in a 150 px line read as a breach, or as the hull having been drawn badly? `bun run dev`, SHAPES.

- **subject** HULL · TORN, the draft offered to *The breach* — a column whose skin is gone
- **changed** every other contour in the catalogue is one closed body or one open sweep; this one stops and starts again, so its edge is 20.4 px *shorter* than the bare span it was cut from. The lips curl 8 px up at the tear
- **decide** does the break read as damage the ship took, or as a drawing mistake — a stroke that failed to close?
- **where** `bun run dev`, SHAPES; compare against HULL · PASSIVE, which is the same span whole

> THE CLAW and THE SPLICE are the first interlude bodies, and an interlude is meant to be legible as *not the field* from the first frame. Put them beside the creature cards: do they read as machinery, or as two more organisms? `bun run dev`, SHAPES.

- **subject** THE CLAW and THE SPLICE, the first two shapes drawn for a round that is not the field
- **changed** `docs/spec/interludes.md` promises the pair knows from the first frame that this is a different kind of thing, and rests that promise on slabs and glyphs against blobs. Neither of these is a slab: one is a jointed machine, one is a wandering line, and both are new material
- **decide** scrolled past the creature cards, do these two land as *machinery* — hard, made, not alive — or do they read as two more creatures with unusual outlines?
- **where** `bun run dev`, SHAPES

> THE SPLICE crosses itself between one and four times, which is measured, and the round dies if a player can trace the strand by eye anyway. At card size, is the tangle genuinely unfollowable, or can you get from one end to the other? `bun run dev`, SHAPES.

- **subject** THE SPLICE's tangle, the thing the round's whole difficulty rests on
- **changed** the strand's sideways wander and its backtrack run at 2 and 2.5 turns over its length, a ratio picked so the two never fall into step; at whole ratios the loop degenerates into a cusp and the strand is briefly untangled every cycle
- **decide** at the size a phone would draw it, can a person follow one end to the other? If yes the round has no puzzle in it and the tangle needs more strands, not more writhe
- **where** `bun run dev`, SHAPES

## `5a0b25b` — an interlude gets a panel

> the dial itself was only read from World state (needleMilli,
markMilli) through the headless bridge, never seen drawn — does the needle
and band actually read on the stage canvas the way THE MIRROR and the
bosses already do, in both the navigator's and the pilot's role? Where to
stand: `DIRECTOR_HOST=127.0.0.1 bun run dev`, INTERLUDE tab, wave 10, ▶ PLAY,
then P1 and P2 role buttons.

- **subject** THE GAUGE's picture, drawn by the shipping renderer on the director's own stage
- **changed** the INTERLUDE tab can now open the round on the live World (a PLAY button calling `startInterlude` directly) and drive it with VALVE/CALL buttons of its own
- **decide** does the needle and the band read as a dial worth turning, in both the navigator's role (the marks) and the pilot's (the valve, nothing else drawn)?
- **where** `DIRECTOR_HOST=127.0.0.1 bun run dev`, INTERLUDE tab, wave 10, ▶ PLAY, then the P1 and P2 role buttons

> the moveField's number input has no bound tying it to the wave
actually holding the entry once two interludes exist — does adding a second
kind ever let one gap's MOVE collide with another's key silently? Where to
stand: add a second entry in INTERLUDE_DEFAULTS, try moving one onto the
other's wave number.

- **subject** `moveField` in `interlude-panel.ts`, the "plays before wave #" reassignment
- **changed** nothing stops a MOVE from overwriting a second gap already sitting at the target wave number — today there is exactly one entry in `GAPS` so it cannot happen yet
- **decide** should a second interlude ever be added, does moving one onto an occupied wave silently drop the one that was there, or does the panel need to refuse it?
- **where** add a second entry to `INTERLUDE_DEFAULTS` in `interlude-panel.ts`, place two gaps, try moving one onto the other's wave number

## `4daad39` — the bulb's lobes deepen

> the bulb's lobes still count at 26 px on a phone — beside a throb

- **subject** `BULB` in `packages/content/src/silhouettes.ts`, the nine-lobe contour
- **changed** `BULB.depth` moved from 0.1 to 0.13, deepening the lobe amplitude while `lobes: 9` stays untouched; measured at ~2.1 px of lobe amplitude at ~11 px spacing rather than the near-circle depth 0.1 gave
- **decide** at 26 px on a phone, does the bulb's nine lobes still count as nine, distinct from THROB's six, rather than downsampling to a shared round blob?
- **where** `bun run shapes:report` for the numbers; `bun run shapes` or the director's SHAPES tab for the eye, BULB beside THROB

## `93d3f24` — the first versus slot opens

> versus ship:hull-skin is open — an amber `warm` candidate now sits beside the shipped violet OWN_SKIN, so does a warm hull still read as the player's own ship with red ammunition falling onto it, or does it merge into the red? Decide at the director's VERSUS tab once the pair lands; `bun run versus` names the slot and every reader of OWN_SKIN meanwhile.

- **subject** `ship:hull-skin`, the first VERSUS slot, and the amber candidate offered against the ship the game draws today
- **changed** `tools/versus/candidates/ship-hull.warm` now patches `OWN_SKIN`'s four body stops, rim, edge and muzzle from violet to amber — the shipped record is untouched, and nothing outside the tool knows the candidate exists
- **decide** at 26 px, with red creatures falling down the field, does an amber hull read as the player's own ship, or do the ship and the ammunition it is being shot with become one colour?
- **where** the director's VERSUS tab, `ship:hull-skin`, once the pair lands — until then `bun run versus` names the slot and greps every reader of `OWN_SKIN`

## `0063231` — the versus pair draws

> the VERSUS tab draws two 380 x 820 phones side by side where before there was no tab at all — do the two phones read as one picture drawn twice, so the only thing an eye finds is the hull's colour, and does BLINK at 1 Hz sit still enough that the amber jumps out rather than the whole frame flickering? `DIRECTOR_HOST=127.0.0.1 bun run dev`, the backlog sheet's VERSUS tab, `ship:hull-skin` on SLICK · FALLING, then the BLINK button.

- **subject** the VERSUS tab on the director's backlog sheet, and the pair of live phones it draws for the `ship:hull-skin` slot
- **changed** there was no VERSUS tab; there is now one showing one open slot as two `Canvas2DRenderer`s at 380 × 820 uncapped, stepping a single `World` and sharing a single `ViewState`, with `Math.random` seeded the same on both sides — measured as byte-identical everywhere except the hull band at y 533–615
- **decide** do the two sides read as one picture drawn twice with only the hull's colour differing, and does BLINK at 1 Hz hold still enough that the amber is what jumps out rather than the whole frame?
- **where** `DIRECTOR_HOST=127.0.0.1 bun run dev`, the backlog sheet's VERSUS tab, `ship:hull-skin` on the SLICK · FALLING pose, then the BLINK button

## `b859b08` — the veins surface and beat

> PULSE draws VEIN's filaments twice — the whole tree dim under the membrane as before, and a seeded third of the segments again above the rim, brighter and wider, lifting hardest as a front of light crosses the body every two beats. Does that second copy read as a strand standing proud of the skin and going under again, or does it just read as two line weights on one texture? Stand at `DIRECTOR_HOST=127.0.0.1 bun run dev`, NOT BUILT YET → SHAPES, and press the PULSE button in the skin bar, flipping back to VEIN to compare.

- **subject** `PULSE`, a fifth skin in `tools/director/src/skins/vein-pulse.ts`, sitting beside VEIN rather than replacing it
- **changed** VEIN clips every filament flat under the membrane at one opacity and never moves; PULSE draws the same seeded tree twice — all of it dim under the membrane, and a depth-weighted subset again above the aura and rim, brighter and 0.7×weight wide — and runs a front of brightness out along the strands by arc length once every two beats (1.25 s), crossing the tree in 0.40 s and dark again by 0.79 s
- **decide** does the second, brighter copy read as a strand standing proud of the skin and going under again, or merely as two line weights printed on one texture?
- **where** `DIRECTOR_HOST=127.0.0.1 bun run dev`, NOT BUILT YET → SHAPES, the PULSE button in the skin bar, flipping back to VEIN to compare

## `b859b08` — the pulse's front is a time, not a speed

> the pulse's front is a fixed *time* rather than a fixed speed — 0.40 s to cross whatever body it is on — so it covers about 30 px on a 92 px creature card and about 165 px on the 620 px hull card, roughly 75 px/s against 410 px/s. On the largest cards, does the front still read as something travelling out along the veins, or does it become a wipe passing over the whole body at once? If it is a wipe, the fix is not a slower `TRAVEL` — that would put the small cards' fronts out of step with the big ones — but a longer `LEAD` and `TAIL`, so more of the tree is lit at once. Stand at `DIRECTOR_HOST=127.0.0.1 bun run dev`, NOT BUILT YET → SHAPES, PULSE in the skin bar, and compare a wide hull card against a creature card in the same page.

- **subject** `TRAVEL` in `tools/director/src/skins/vein-pulse.ts`, and what it does to the widest cards
- **changed** the front's crossing is held at 0.40 s for every card, so that the whole page lights and darkens together the way the shared `beat` intends; the consequence is that its pixel speed scales with the body — about 75 px/s on a 92 px creature card and about 410 px/s on the 620 px hull card
- **decide** on the largest cards, does the front still read as travelling out along the veins, or does it flatten into a wipe over the whole body at once?
- **where** `DIRECTOR_HOST=127.0.0.1 bun run dev`, NOT BUILT YET → SHAPES, PULSE in the skin bar, a wide hull card beside a creature card

## `533ff82` — the light gives a body volume, or does not

> LIGHT gives each card a focal-point sphere ramp — four stops with a core shadow darker than the base and a bounce off the shadowed rim — where CORE gave a gradient falling evenly outward; at 92 px does a lit body read as volume, or as a flat shape with a gradient on it? `DIRECTOR_HOST=127.0.0.1 bun run dev`, NOT BUILT YET → SHAPES, the LIGHT button in the skin bar, flipping back to CORE to compare

- **subject** `terminatorPass` in `tools/director/src/skins/light.ts`, and the LIGHT skin it is the first pass of
- **changed** CORE fills the body with a radial gradient centred on the shape and falling outward in two steps; LIGHT pushes the focus 0.60 R toward a fixed upper-left key light and runs four stops off it, derived from the geometry rather than typed — 0% at the focus, 31.98% halfway from the centre to the terminator, 43.96% at the terminator, 53.33% at the shadow rim. Composited over a card those measure 106 / 50 / 19 / 57 in luminance against a base of 35, so the core shadow is darker than the base and the bounce comes back above it without passing the mid-tone
- **decide** at 92 px, does a lit body read as volume, or as a flat shape with a gradient painted on it?
- **where** `DIRECTOR_HOST=127.0.0.1 bun run dev`, NOT BUILT YET → SHAPES, the LIGHT button in the skin bar, flipping back to CORE to compare

## `533ff82` — the rim light and the aura on one body

> the rim light is one thin cool stroke over the outline on the shadow side while `auraPass` draws three wide soft strokes of the body colour around the whole contour; do those read as two things on one body, or as one smear that would be better with the aura dropped under LIGHT? `DIRECTOR_HOST=127.0.0.1 bun run dev`, NOT BUILT YET → SHAPES, the LIGHT button, on a wide hull card where the shadow-side stroke is longest

- **subject** `rimLightPass` in `tools/director/src/skins/light.ts`, sitting on the same contour as `auraPass` in `parts.ts`
- **changed** LIGHT draws the aura and outline exactly as the other skins do and then adds a stroke 0.9× the line weight over the top, painted by a gradient along the key axis that is nothing until 62% and full by 88% — so it exists only on the shadow half and fades out before the terminator at 50%. Neither width nor position separates it from the aura: what does is that it is cool and brighter than the body colour where the aura is the body colour exactly, and hard where the aura is soft
- **decide** do the rim and the aura read as two things on one body, or as one smear — and if the latter, should LIGHT drop the aura rather than thin the rim?
- **where** `DIRECTOR_HOST=127.0.0.1 bun run dev`, NOT BUILT YET → SHAPES, the LIGHT button, on a wide hull card where the shadow-side stroke is longest

## `f031ecd` — scale and carapace, one lattice trick or two materials

> SCALE lays many soft rounded petals in shrinking offset rows; CARAPACE lays a handful of hard straight-edged wedges in three seamed rings with a KEY-lit edge on each. Do the two read as different materials, or as one lattice repeated at two scales? Stand at `DIRECTOR_HOST=127.0.0.1 bun run dev`, NOT BUILT YET → SHAPES, and press SCALE then CARAPACE in the skin bar to compare them directly.

- **subject** `SCALE` and `CARAPACE`, the two new skins in `tools/director/src/skins/scale.ts` and `carapace.ts`
- **changed** both lay their lattice once in polar coordinates — an angle and a fraction of `ctx.reach` — and clip the whole group to a path that is handed a fresh `d` every frame, so neither allocates per frame nor drifts off the body as it wobbles. SCALE places many small rounded petals (roughly ten thousand path segments on a large card) in six offset rows, shrinking from the centre toward the rim. CARAPACE places a small number of hard, straight-edged wedges (well under two thousand path segments on the same card) in three rings — a cap and two staggered bands — each seamed in dark stroke and given a bright outer-edge highlight only where that edge's own direction agrees with `KEY`, the same key-light constant `light.ts` uses everywhere else
- **decide** do the two read as different materials — soft and many against hard and few — or does CARAPACE end up looking like SCALE's lattice repeated at a second, coarser scale?
- **where** `DIRECTOR_HOST=127.0.0.1 bun run dev`, NOT BUILT YET → SHAPES, the SCALE and CARAPACE buttons in the skin bar

## `2698efb` — a turning body, or a texture sliding

> a surface feature now narrows to nothing at the silhouette and reappears at the other edge, on a cosine of its own longitude, over a worm that swings left and right and hangs at each reversal — does the body read as turning, or as a texture sliding under a hole? Yes if a band crossing the middle visibly outruns one near the edge; no if the whole field drifts at one pace. DIRECTOR_HOST=127.0.0.1 bun run dev, NOT BUILT YET → SHAPES, the TURN button on the skin switcher.

- **subject** `TURN`, a ninth skin in `tools/director/src/skins/turn.ts`, and the projection in `mount`/`spin` that CRATER also uses
- **changed** every other skin paints a texture in the card's own plane; TURN gives each of 3 meridian bands and 12 patches a fixed longitude and latitude on a ball of radius `reach`, and every frame places it at x = reach·cos(lat)·sin(lon+θ) with a horizontal scale of cos(lon+θ) and the far hemisphere not drawn. Measured on the page: 900 features over 60 cards, scale x spanning 0.0023 to 1.0000 and never negative; at equal 5° steps a feature moves 5.06 units near the facing meridian and 0.22 at the limb, a ratio of 23:1. θ is A·tanh(1.6·sin ωt)/tanh 1.6 over twelve beats, so the sweep runs at 1.74× a plain sine's rate and each reversal hangs at 0.26×
- **decide** does the body read as turning, or as a texture sliding under a hole — a band crossing the middle visibly outrunning one near the edge, or the whole field drifting at one pace?
- **where** `DIRECTOR_HOST=127.0.0.1 bun run dev`, NOT BUILT YET → SHAPES, the TURN button on the skin switcher, flipping to LIGHT to see the same body not turning

## `2698efb` — a meteorite rotating, or a pitted texture

> the same projection carries a field of lit-rim, dark-floor craters round a body tumbling one way at constant angular speed — does it read as a meteorite rotating, or as a pitted texture sliding under a hole? Yes if a pit crawls for a long time near either edge and crosses the middle quickly; no if it travels evenly and keeps its width to the edge. DIRECTOR_HOST=127.0.0.1 bun run dev, NOT BUILT YET → SHAPES, the CRATER button on the skin switcher.

- **subject** `CRATER` in `tools/director/src/skins/crater.ts`, and the constant-rate tumble it uses instead of TURN's oscillation
- **changed** up to 13 pits are scattered by area and thinned by angular separation, each a bowl running dark at the end facing `KEY` and pale at the end away from it — the far interior wall is the one a light inside a pit can actually reach — under a lip stroked bright exactly where the floor is darkest. The field is carried by TURN's own projection, so a pit foreshortens to nothing at the limb; the body turns one way at 2π over sixteen beats with no easing at all, so the only thing varying its apparent speed is cos α. Measured on the page: 780 features over 60 cards, 377 of them on the near side, scale x from 0.0023 to 1.0000
- **decide** does it read as a meteorite rotating, or as a pitted texture sliding under a hole — a pit crawling near either edge and crossing the middle quickly, or travelling evenly and keeping its width to the edge?
- **where** `DIRECTOR_HOST=127.0.0.1 bun run dev`, NOT BUILT YET → SHAPES, the CRATER button on the skin switcher, beside TURN for the oscillating case
## `f0d5c66` — cilia, a hundred strands off the live contour

> CILIA adds a hundred-strand rim fringe, re-sampled off the live contour every frame with getPointAtLength, plus a sparser interior set, both leaning against a velocity read off the body's own motion transform. Do a hundred strands at card size read as a fringe or as fur, and is the count right? The build was confirmed clean — no console errors, the expected path count on the card — but the sway, the travelling ripple and the lean itself are unverified: the headless pane never composited a frame while backgrounded, so requestAnimationFrame never ran even once and no motion was actually seen. Stand at DIRECTOR_HOST=127.0.0.1 bun run dev, NOT BUILT YET → SHAPES, and press CILIA in the skin bar.

- **subject** `CILIA`, an eleventh skin in `tools/director/src/skins/cilia.ts`
- **changed** a hundred rim strands and a sparser sixteen interior strands are drawn as short curved paths whose *base* is read every frame off an invisible extra contour path via `getPointAtLength` — never a fixed coordinate — so the fringe stays welded to the wobbling outline; each rim strand's phase comes from its own fraction of the perimeter, giving a travelling ripple rather than unison sway; and every strand leans against a velocity read by differencing `translate(dx, dy)` off `ctx.body.transform.baseVal` frame to frame, the own-motion transform `shape-figure.ts` already writes onto the skin's own group — no second `poseAtSecond` and no change to `SkinFrame`
- **decide** do a hundred strands at card size read as a fringe or as fur, and is the count right?
- **where** `DIRECTOR_HOST=127.0.0.1 bun run dev`, NOT BUILT YET → SHAPES, the CILIA button in the skin bar

## `d8b2859` — depth or only brightness, with the light off

> with the light off, does the page lose depth or only lose brightness — the SHAPES tab, the same skin toggled, on a round body and a long one

- **subject** the new LIT toggle beside the skin switcher in `tools/director/src/shapes-panel.ts`, and the four `light.ts` passes it gates
- **changed** the switcher stays exclusive for the skin choice; LIT is a second, independent button in the same bar, so any skin that composes the light — LIGHT itself, and now TURN and CRATER — can be seen with it and without it without switching to a different look. Measured, not judged: on TURN and on CRATER the page goes from 360 gradient elements to 120 when LIT is switched off; a round body and a long one on TURN both go from 6 gradients to 2, the 2 left being TURN's own surface texture rather than the light's. MEMBRANE, which composes no light, drew 0 gradients in both states — the toggle reaches only what actually uses it
- **decide** does the body still read as round with the light off, or does it flatten to a silhouette — i.e. is the terminator/contact/specular/rim combination carrying real depth information, or is it only adding brightness on top of a shape that was already reading fine?
- **where** `DIRECTOR_HOST=127.0.0.1 bun run dev`, NOT BUILT YET → SHAPES, the LIT button beside the skin switcher, on TURN and CRATER, on a round card and a wide one

## `ea4fdfc` — grown skin, or spots on a circle

> PORE and SUCKER are both wired into the switcher and LIT correctly gates PORE's per-bump highlight — the open question is whether PORE reads as grown skin or as spots scattered on a circle, yes it holds together or no it needs the hotspots pulled tighter; stand at DIRECTOR_HOST=127.0.0.1 bun run dev, NOT BUILT YET → SHAPES, and toggle the PORE and SUCKER buttons on the switcher to look.

- **subject** `PORE` and `SUCKER`, the soft group's two skins in `tools/director/src/skins/pore.ts` and `sucker.ts`
- **changed** PORE dart-throws bumps against a handful of seeded density hotspots, rejecting a candidate too close to one already kept, so the field crowds in some places and thins in others rather than tiling; each bump is a flat disc plus, only when `ctx.lit`, a small highlight offset toward `KEY` and a shadow offset away from it, sharing two `objectBoundingBox` gradients across every bump on the card. SUCKER reuses the same `poissonScatter` (exported from `pore.ts`) with a different density field — a single seeded line through the body — so rings grow largest near that axis and fall off to either side, which is the one thing keeping the two from converging. Measured on the page: PORE totals roughly 38,200 circle/path elements over the catalogue's 60 non-trivial cards (max 687 with LIT on, 233 with LIT off, confirming the per-bump highlight and shadow are gated), SUCKER totals roughly 15,600 (max 261) — a clearly different count and a differently-shaped scatter
- **decide** does PORE read as grown skin or as spots scattered on a circle — do the hotspots need to be pulled tighter, or does the scatter already hold together?
- **where** `DIRECTOR_HOST=127.0.0.1 bun run dev`, NOT BUILT YET → SHAPES, the PORE and SUCKER buttons on the skin switcher

## `7c7df97` — a body turning in depth, or a body being squashed

> with the light on, does the turned body read as rotating in depth or as being squashed flat — the SHAPES tab, TURN beside TURN IN DEPTH, and then the same pair with the light off

- **subject** `TURN IN DEPTH`, and the three other dimensional counterparts beside it in `tools/shape-sheet/src/motions/depth.ts`
- **changed** a pose is `{ dx, dy, rot, sx, sy }` with no z in it, so TURN IN DEPTH does not rotate — it projects a body that does. `sx` is `√(cos²α + 0.55²·sin²α)`, the exact shadow of an ellipse in plan, running 0.550 to 1.000 at TURN's own rate, with `rot` untouched; `dx` is the body's centre going round an axis 0.13 tiles to one side of it, so the width repeats twice a revolution (9.14 beats) and the swing once (18.28), which a squash cannot do at any amplitude. Measured offline against `skins/turn.ts`'s real projection, same body, same 5° steps: the projection carries a mark across the facing meridian 22.9× faster than one at the limb — matching the 23:1 that skin measured on the page — where the pose manages 1.10:1 between a mark at the body's middle and one at its edge, which is the absence of the asymmetry rather than a weak version of it. The width curve is not where the difference lives either: the ellipse law and a raised cosine of the same range never differ by more than 3.3% of the body's width. APPROACH, PITCH and CRAWL sit beside SWELL, CANT and SLITHER on the same argument, and `docs/dimensional.md` carries the ceiling, what each technique costs, and which seven of the eleven have no dimensional reading at all
- **decide** does the turned body read as rotating in depth, or as being squashed flat — and does taking the light off change the answer? An `sx` cosine with no shading is a coin; the same numbers under a light whose `KEY` stays put are a surface travelling under a lit shoulder that does not move. Both halves are expected to fail alone, so a yes needs the pair
- **where** `DIRECTOR_HOST=127.0.0.1 bun run dev`, NOT BUILT YET → SHAPES, TURN beside TURN IN DEPTH, then the `LIT` toggle off for the same pair. The motion cards themselves are on the standalone page — `bun run shapes:page`, then `tools/director/dist/shapes.html` — which has no skin switcher, so putting the pair under one light is still one line away: a draft entry naming the new motion, or a Spare motions section on the SHAPES tab

## `bfebee6` — the motion bar that makes the pairing askable

> a motion bar now sits beside the skin bar on the SHAPES tab, so 8487648's question — does a turned body read as rotating or as squashed, TURN beside TURN IN DEPTH, with the light on and off — can finally be asked as its own where row describes; does it hold up when looked at (yes, the pairing reads as intended — no, one of the two reads as a coin or a squash even under the light)? Stand at DIRECTOR_HOST=127.0.0.1 bun run dev, open SHAPES, force TURN and then TURN IN DEPTH with LIT on and off.

- **subject** the motion bar in `tools/director/src/shapes-panel.ts`, and the `motion` option `tools/director/src/shape-figure.ts` threads beside `lit`
- **changed** an OWN button plus one per `MOTIONS` entry joined the skin bar in the same host element, one piece of page state (`motion: OwnMotion | undefined`) defaulting to `undefined` — each card keeping its own catalogue motion, unchanged from before the bar existed. `shapeFigure` now takes an optional `motion` that overrides `entry.motion` for both the fitted frame's bounds and the transform `tick()` writes every frame, so forcing a motion moves the fitting as well as the animation rather than just one of them. Measured on the page: forcing TURN IN DEPTH changed the fitted frame `transform` on all 60 cards (0 matched their OWN-state transform), and every card's caption switched to TURN IN DEPTH's note, then back to each card's own note when OWN was clicked again
- **decide** does a turned body read as rotating in depth or as being squashed flat, and does taking the light off change the answer — the question `7c7df97` could not put on one page until this bar existed to choose TURN IN DEPTH under a skin that carries `LIT`
- **where** `DIRECTOR_HOST=127.0.0.1 bun run dev`, NOT BUILT YET → SHAPES, TURN and TURN IN DEPTH forced from the new motion bar, `LIT` toggled on and off for each — motion itself unverified in this sandbox since `requestAnimationFrame` never composited a frame; the fitted-frame and caption measurements above are static, not motion seen

## `955ce9a` — a scale going round the far side, or sliding across a face

> on a turning body, does a scale go round the far side and come back, or does it slide across a face — the SHAPES tab, SCALE beside MOUNTED SCALE, with LIT on

- **subject** `MOUNTED SCALE`, and the three mounted siblings beside it — `MOUNTED CARAPACE`, `MOUNTED PORE`, `MOUNTED SUCKER` — in `tools/director/src/skins/`
- **changed** the projection `turn.ts` was written to demonstrate now lives in `mounted.ts` and is imported by TURN, CRATER and the four new skins, so there is one copy of the cosine and it is not inside a skin. Each of the four flat scatters keeps its own seeded layout untouched and gains a sibling in which a position is a place on a *sphere*: SCALE's rows become circles of latitude about the turn axis, CARAPACE's three courses become colatitude bands of gores, and PORE and SUCKER run their own `poissonScatter` unchanged with each point read onto the ball through a Lambert azimuthal equal-area map. The judgement is that a scale is not a dot: a plate is drawn about its own origin in tangent coordinates, so `scale(cos α, cos lat)` foreshortens it across its width *and* swings its long axis. Measured offline at lat 0, α from the facing meridian: a feature at bearing 45° reads at 45.0°, 63.4°, 80.1° and 90.0° at α = 0/60/80/90 while its length falls 1.000 → 0.707; a SCALE plate's across:along runs 1.200 → 0.600 → 0.208 → 0.000, its long axis flipping from east–west to north–south at 33.6° off the meridian; a ring or a bump goes 1.000 → 0.000. Apparent speed is still 22.9 : 1 facing-to-limb, matching `docs/dimensional.md`. Equal-area was checked against a uniform-on-sphere sample over 328k points, worst bin 0.22 points, and SUCKER's spine comes out a great circle to 1.2e-16. CARAPACE cannot be a single `scale()` at all — its plates span fifty degrees of arc — so `spinPlates` carries each outline round vertex by vertex and folds a far vertex onto the limb, verified to 1.4e-14, with one outer gore's drawn area running 0.402 R² facing, 0.029 at θ=1.2 and hidden past θ=1.57
- **decide** does a scale go round the far side of a turning body and come back, or does it slide across a face — yes if a plate narrows to a vertical spike and vanishes at the silhouette while new plates arrive from the other edge, no if the row keeps its proportions and simply travels. Nothing here was watched moving: `requestAnimationFrame` never fired in the sandbox, so the built DOM is all that was checked
- **where** `DIRECTOR_HOST=127.0.0.1 bun run dev`, NOT BUILT YET → SHAPES, the `MOUNTED SCALE` button at the right-hand end of the skin bar with `LIT` on, flipping back to `SCALE` for the flat reading, and `MOUNTED CARAPACE` for the plate that gets cut by the silhouette

> MOUNTED PORE keeps tempo on a full SHAPES tab, or its 420 bumps a card have to come down — DIRECTOR_HOST=127.0.0.1 bun run dev, SHAPES, PORE then MOUNTED PORE, watch for stutter

- **subject** the per-frame cost of `MOUNTED PORE`, the densest of the four
- **changed** a flat bump is drawn once and never touched again; a mounted one is a group that takes a `transform` every frame, and an opacity too whenever the light is on. PORE scatters up to 420 bumps a card. Measured on the running page rather than guessed: the whole SHAPES tab under MOUNTED PORE carries 6227 near-side groups and 32k circles, and one `spin`-shaped pass of attribute writes over all of them costs 5.72 ms — inside a 16.7 ms frame, but with the repaint unaccounted for and no frame ever composited to check. `spin` already skips the opacity write when the light is off, and writes `display` only on the transition
- **decide** does the tab still run at tempo with MOUNTED PORE selected, or does it visibly stutter — yes and the density stands, no and the mounted variant's target comes down from 420, which is a one-line change and a deliberate departure from "the scatter itself does not change"
- **where** `DIRECTOR_HOST=127.0.0.1 bun run dev`, NOT BUILT YET → SHAPES, `PORE` then `MOUNTED PORE`, scrolled to a full section so every card is drawing
