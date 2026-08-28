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

## `13d76b6` — a comparison, or a page load

> switching skin on the SHAPES tab now redraws in about a fifth of a second instead of seven, and every card still lands in the same frame it had — does flipping between two skins now feel like a comparison rather than a page load, or does something still read as a reload; the director's SHAPES tab, LINE against MOUNTED SCALE, back and forth five times, at the top and scrolled

- **subject** the cost of switching skin on the director's SHAPES tab, the page forty-six outstanding checks send a person to
- **changed** the switch took seven to twelve seconds, which is long enough that nobody flips back and forth, and flipping back and forth is the only thing the page is for. The rebuild was not the culprit and has not been touched: instrumenting `shapeFigure` on the running director gave 6130 ms of frame fit against 112 ms for every `buildSkin` on the page and 2 ms for every element created. The fit — `boundsOver` over a whole wobble, then `transformedBounds` over a hundred and thirty contour samples and six thousand poses — depends only on the contour and the own-motion, not on the skin, the light, or the frame it is drawn into, so sixty identical answers were being recomputed and discarded per switch. `shape-figure.ts` now keeps them, keyed on the entry and the motion. Measured on the director in this worktree with the sheet open and layout forced after each click: at the top of the page LINE 5513 → 12/38/20 ms and MOUNTED SCALE 6551 → 224/246/244 ms; scrolled halfway LINE 7205 → 20/30 ms and MOUNTED SCALE 7353 → 251/225 ms. That the fit is the same fit and not a cheaper one was checked by hashing every card's name, viewBox, frame transform and wide-or-square class before and after — identical, 6712 characters, 1056219730. An IntersectionObserver was considered and rejected: it scales with the ten-odd cards showing, which still leaves half a second a flip and pays it again on every scroll, and a lazy build is the one thing a headless pane cannot verify, since a hidden tab composites no frames and a callback that never fires renders a blank catalogue
- **decide** does flipping between two skins now feel like a comparison rather than a page load — yes and the page is usable for the forty-six checks queued against it, no and something other than the fit is still reading as a reload. Nothing was watched moving: `requestAnimationFrame` never fired in the sandbox, so the times are script and layout, with paint unaccounted for
- **where** `DIRECTOR_HOST=127.0.0.1 bun run dev`, NOT BUILT YET → SHAPES, `LINE` against `MOUNTED SCALE` on the skin bar, five flips at the top of the page and five more scrolled to the middle. The cold pass is deliberately untouched and will still be slow: opening the tab costs about 5.5 seconds once, and the first press of each motion button about 4.7 seconds, dropping to 209 ms on the second press

## `e04dd6a` — a worm twisting, or two halves disagreeing

> the winding runs on a bounded travelling phase rather than one rigid angle — does it read as one body twisting, or as two halves disagreeing — the SHAPES tab in the director, a long body and a round one, WIND beside TURN

- **subject** `WIND`, the new skin in `tools/director/src/skins/wind.ts`, sitting directly after `TURN` on the SHAPES switcher
- **changed** TURN hands a whole body one angle, so every feature mounted on it turns through the same amount at the same instant — a planet. WIND adds one term, `AMP·sin(2πt/WIND_PERIOD − ψ)`, where `ψ` is a band's place along the body, so one end is already coming round while the other has not started and the twist travels. Two things were judged rather than typed. The **bound**: past about a third of a turn end to end the two halves of a body show opposite faces and the silhouette stops reading as one object, so `SPREAD_LIMIT` is that third, `SPREAD` sits at 60% of it and the amplitude is derived from the spread rather than the reverse — sampled at 97 moments over a whole twelve-beat swing the end-to-end difference is 1.2566 rad at every one of them, 20.0% of a turn against the 33.3% ceiling, flat in time because `ψ` covers a whole wave and so always contains both a crest and a trough. A whole wave and not half of one is the other half of that judgement: half a wave puts the ends in antiphase with a single node in the middle, which is a body split once down its centre and exactly the failure this check is asking about, while a whole wave brings the ends back into phase and puts the crest and trough at the quarters, so what travels is a bulge and not a hinge. The **axis**: the long one is not always the tall one — SLICK is 152 × 89 and would wind across its short dimension under a vertical assumption, while BULB at 123 × 118 and RUNT at 41 × 42 would be handed a long axis on a 4% margin by a bare `w > h`. So it comes from the contour's own extent, asked over a whole wobble because seven of the sixty catalogue entries change which way they are longer as they breathe, and only past a quarter again as wide: 24 of 60 are wide. A tall body gets bands at constant latitude and winds top to bottom; a wide one gets bands at constant longitude and the wave runs round its girth, `ψ` being the longitude itself so the wave closes on 2π with no seam. The rotation axis itself stays vertical because `spin`'s does and a second projection in the file would be a copy of the one in `mounted.ts`; turning the mounted group on its side would be truer to a worm and would light its marks from a direction no other card uses, since `mounted.ts` fixes the key light in screen space. Nothing in `mounted.ts` changed — a band is a `Mounted[]` and one `spin` call. Built offline against a stub document at three poses on four shapes: no non-finite transform, 63 marks a body, and the band offsets read straight off the two exported terms
- **decide** does the winding read as one body twisting, or as two halves disagreeing — yes if the marks near one end are visibly ahead of the marks near the other while the whole thing still reads as a single object turning, no if the body appears to hinge in the middle or to break into two counter-rotating halves, in which case `SPREAD` comes down from 60% of the ceiling. The motion itself was never watched: `requestAnimationFrame` did not fire in this sandbox, so only the built DOM and the arithmetic were checked
- **where** `DIRECTOR_HOST=127.0.0.1 bun run dev` — in a worktree, `tools/director/server.ts` by absolute path, and confirm the tree in its startup line — then SHAPES, `WIND` beside `TURN` on the skin bar, with `LIT` on. Look at a long body and a round one: SLICK or a HULL span for the wide reading, BULB or METEOR for the tall one

## `34318f4` — two skins on one card, at full size

> a paired card keeps both frames at 92 px and widens instead of halving, on the reasoning that halving puts 32 of 49 cards under the 26 px floor — is a wider card with two full-size halves the right trade, or is three cards to a row too few to scan the catalogue; the director's SHAPES tab, SCALE against MOUNTED SCALE and then LINE against VEIN, on the smallest card on the page

- **subject** the layout of a paired card on the director's SHAPES tab — `tools/director/src/shapes-pair.ts`, new, and the card built in `tools/director/src/shapes-panel.ts`
- **changed** the skin bar is exclusive, so the question every skin lane landed a check about — does the mounted one go round, or does the flat one already read — could only be answered by flipping, from memory, one look at a time. There is now a B skin beside the A skin: OFF by default, so the page is unchanged until one is picked, and with one picked every card draws its contour twice, same entry, same forced motion, same light. The two halves are in phase for free, because the single loop in `shape-figure.ts` reads `performance.now()` once a frame and hands the same `t` to every figure on the page — so that file is untouched. The judgement was the size and it went against halving: measured over the whole catalogue at the 92 px card, all 49 square cards draw a body of at least 26 px on its long axis, and halving the frame to 46 px puts 32 of them under 26 px and 17 under 20 px, under the floor `docs/spec/graphics.md` sets for a body to stay nameable. So nothing shrinks — the square card grows from 330 to 428 px, and a 1545 px row fits three where it fitted four; the long shapes, already on a 620 px frame, stack their pair instead of splitting it. Confirmed on the running director in this worktree: 60 cards, two `<svg>` each, both measuring 92×92 (620×92 for the long ones), the wide pair sharing a left edge 112 px apart, and OFF restoring one figure and a 330 px card with no inline width left behind. Drawing twice costs about twice and no more, the fit being memoised — a SCALE switch measured 74/127 ms unpaired against 240/246 ms paired
- **decide** is a wider card with two full-size halves the right trade — yes if the pair answers the mounted-versus-flat question at a glance and three cards to a row still scans, no if the catalogue has become a page you scroll rather than survey, in which case the honest alternative is stacking the square pair as the long ones already stack, which costs height instead of width. Nothing was watched moving: `requestAnimationFrame` never fired in the sandbox, so the two halves being in phase is an argument from one shared clock and not something seen
- **where** `DIRECTOR_HOST=127.0.0.1 bun run dev` — in a worktree, `tools/director/server.ts` by absolute path, and confirm the tree in its startup line — then NOT BUILT YET → SHAPES. Pick `SCALE` on the A row and `MOUNTED SCALE` on the B row, then `LINE` against `VEIN`, and read the smallest card on the page: THE NEEDLE, THE TITHE or TENDRIL among the drafts

## `9848df6` — a pulse, or a faster sine

> does the sharp attack read as a pulse against SWELL's breathing, or only as a faster sine — the SHAPES tab, the motion bar, BEAT and HEART and SWELL on one round body

- **subject** `BEAT`, `HEART` and `PERISTALSIS`, the three new spare motions in `tools/shape-sheet/src/motions/pulse.ts`, sitting in `MOTIONS` immediately after `SWELL` and its depth counterpart `APPROACH`
- **changed** the page had exactly one pulsing motion and it was SWELL, a plain sine on both scales at once — a body breathing, which is untouched and stays untouched. The claim these three make is that the difference between breathing and pulsing is the *envelope* and not the amplitude: a sine spends as long getting big as getting small, so there is no instant in it, and an eye reads the attack as the event. Each of the three is asymmetric in time and each says something different in kind. BEAT is one stroke a beat, attack 0.09 release 0.55 and 0.36 beats of rest, 6.1 : 1 rise to fall, uniform in both axes and deliberately **not** volume-preserving because growing both ways reads as filling. HEART is lub-dub over two beats — lub at amplitude 1.0, dub at 0.58 onset 0.42 beats later, so the pair spans 0.42 and the wait after it 1.315, a 3.1 : 1 that is what makes two events read as one — and it is **volume-preserving to the last digit**, `sy = 1/sx`, so the body clenches like a muscle rather than filling like a bag. PERISTALSIS is neither: three beats of traverse and one of rest, `sy` to 1.1400 held while the bulge is inside, `dx` from -0.0924 at t = 0.40 sweeping to +0.0606 at t = 2.30, and length pinned at exactly 1, because fluid moved along a tube does not shorten it — the body preserves its volume and the drawing does not, since a box is fitted to the widest point and not to the mean. A pose is affine, so a ring of thickening is not in its vocabulary any more than depth is in `depth.ts`'s; only the two consequences a bounding box sees are available, and both come out of the one number `u`. The axis is **declared and not derived**, which is the one real cost: `WIND` could ask `boundsOver` over a whole wobble because a skin is handed the body, and `poseAt(t: Beats)` is handed a clock. At WIND's own 1.25 threshold, 25 of the sixty entries are wide so x is right, 27 are round enough to have no long axis at all, and 8 are tall — TENDRIL, THE NEEDLE, RIBBON, THE SPLICE, THE CLAW, POD and the two HUSKs — where the squeeze runs across the body instead of along it. Every envelope was sampled offline at 0.005-beat steps; `requestAnimationFrame` never fired in this sandbox, so nothing was watched moving
- **decide** does the sharp attack read as a pulse or only as a faster sine — yes if BEAT beside SWELL on the same round body reads as a body being *struck* on the clock while SWELL reads as a body breathing, and if HEART's double-tap arrives as one event rather than as two beats; no if all three read as SWELL at a shorter period, in which case the attack times come down and the rests lengthen rather than the amplitudes going up. The separate question PERISTALSIS asks is whether a travelling bulge survives an affine reduction at all, or whether centre-plus-width reads only as a body sliding while it fattens
- **where** `DIRECTOR_HOST=127.0.0.1 bun run dev` — in a worktree, `tools/director/server.ts` by absolute path, and confirm the tree in its startup line — then SHAPES, and the motion bar: `SWELL`, `BEAT`, `HEART` in turn on one round body (BULB or THROB), then `PERISTALSIS` on a long one (SLICK or RIBBON) and again under `WIND` to see whether the twist and the squeeze add or fight

## `dbd327e` — every slot reachable, either seat

> with two slots open, is it obvious that the page holds more than the one on screen — the director's VERSUS tab

- **subject** the VERSUS tab's slot handling in `tools/director/src/versus-page.ts`, and the seat the pair is drawn from
- **changed** the page drew the first open slot and no other, naming the count with no way to reach the rest. A slot switcher now sits above the pair, one button per open slot, built the way the SHAPES skin bar is — every slot a click away, none of them hidden behind a dropdown — and switching one stops the outgoing pair (canvases disposed, its `requestAnimationFrame` cancelled) before the next one starts. Separately, the pose picker fixed a candidate's role to `pose.role ?? "p1"`, so a patch that reads differently from the pilot's half and the navigator's half could only ever be judged from one of them; a P1'S SCREEN / P2'S SCREEN picker now overrides the role on top of whichever pose is chosen. Neither change touches `versus-pair.ts`: the seat is applied by spreading a copy of the selected `Pose` with `role` overridden before handing it to `pair.setPose`, which the pair already accepts. The vote box — the reason field, the two cast buttons, the swap banner and the clipboard prompt — moved to a new `tools/director/src/versus-vote.ts` to make the room, since `versus-page.ts` was already at the 250-line ceiling. Nothing here deletes a slot; decision 24 already settled that
- **decide** with two slots open, is it obvious from the page alone — with no prior knowledge — that there is more than the one on screen, and does the switcher stay legible once a third or fourth slot lands; does the seat picker actually change what a candidate looks like from the navigator's half when the patch touches something role-dependent, or does it silently do nothing
- **where** `DIRECTOR_HOST=127.0.0.1 bun run dev` — in a worktree, `tools/director/server.ts` by absolute path, confirm the tree in its startup line — then the VERSUS tab. Temporarily add a second entry to `tools/versus/candidates/index.ts`'s `VARIANTS` (any existing patch works) to see two slots on the switcher, since only `ship:hull-skin` is open on `main` today; revert the addition afterward. `requestAnimationFrame` does not fire in a headless pane's hidden tab — `window.neonSporeVersus.advance`/`.paint` drive the loop by hand there, same as `versus-pair.ts` already documents

## `040dfdb` — a surface catching light, or a colour animation

> NACRE lays a 26-degree hue film over the body and slides it by the body's own displacement rather than by a clock — does it read as a surface catching light, or as a colour animation playing on a shape; yes if the shift stops dead when a card's sway reaches the end of its swing and reverses with it, so the colour is plainly something the movement is doing to the surface, no if it reads as a hue cycling on its own and the body merely happens to be under it, in which case RATE comes down and the second layer's alpha goes with it. The motion was never watched: `requestAnimationFrame` did not fire in the sandbox, so only the DOM and the hue numbers were checked. `DIRECTOR_HOST=127.0.0.1 bun run dev` — in a worktree, `tools/director/server.ts` by absolute path, confirming the tree in its startup line — then NOT BUILT YET, SHAPES, NACRE on the skin bar with LIT on. Look at a swaying body first (BULB, or SLICK for the lagging tilt), then TREMBLE's runt, then a card with no own-motion at all, which should hold a fixed pattern; then take LIT off and check that what is left still reads as a material rather than as a wash

- **subject** NACRE, the nineteenth skin on the director's SHAPES switcher — `tools/director/src/skins/nacre.ts` and its colour arithmetic in `nacre-film.ts`, both new
- **changed** every skin before this one draws a body as one hue at several brightnesses. NACRE is the first to change the hue itself, and it does it in two places at once: a thin pearlescent film laid over the body as a repeating band gradient, and a second film masked to the lit side of the terminator. Two decisions carry it. The **span** is 26 degrees, ±13 either side of whatever colour the card is stroked in, and the number comes from the repo rather than from taste — `PALETTE.red` sits at hue 345.3 and `PALETTE.cyan` at 185.0, so the callout owns a 160.3-degree gap and the film spends 16% of it, leaving 134.3 degrees between a red card's furthest excursion and a cyan card's. It is also inside the ~30 degrees between adjacent hue *names*, so nothing ever stops being the word it was. The spread is **symmetric**, which is the part `light.ts`'s header leaves room for: that file rejects rotating a body's hue because a fixed rotation is warm for red and cool for cyan, and its objection is to a direction — a spread centred on the body's own hue has none, and red goes as far toward orange as toward magenta. The **slide** ignores the page clock entirely: both gradients move by the body's own frame-to-frame displacement, projected onto each layer's direction and divided by `ctx.reach`, so a card with no own-motion holds a fixed pattern and no card advances while it is still. All of that was measured on the running director in this worktree — the three card colours come out at exactly 26 degrees each (cyan 172.0–198.0, dim 238.6–264.6, gold 26.7–52.7), a cycle's first and last stop are identical so the repeat is seamless, and the LIT toggle keeps no hole: off leaves six paths, one gradient and no mask, on leaves twelve, both gradients and the mask. Nothing was seen moving — `requestAnimationFrame` never fired and the pane would not composite, so `onFrame` did not run once
- **decide** does it read as a surface catching light, or as a colour animation playing on a shape — yes if the shift halts at the end of a sway and reverses with it, so the colour is visibly something the *movement* is doing to the surface; no if the hue reads as cycling on its own with the body merely underneath it, in which case `RATE` comes down and the second layer's alpha with it. A separate and smaller question sits beside it: whether 26 degrees is the right narrowness, or whether at card size it is too subtle to see at all — the honest answer to that one is not a wider span but a higher `FILM_ALPHA`, since widening it is the failure the whole lane is about
- **where** `DIRECTOR_HOST=127.0.0.1 bun run dev` — in a worktree, `tools/director/server.ts` by absolute path, and confirm the tree in its startup line — then NOT BUILT YET → SHAPES, `NACRE` on the skin bar with `LIT` on. A swaying body first (BULB, or SLICK for the tilt that lags its drift), then the runt under TREMBLE, then a card with no own-motion, which must hold still in colour as well as in shape. Then `LIT` off, and again beside `LIGHT` on the B row

## `f56e5ee` — receding, or just bigger

> does the field read as receding, or do the creatures just get bigger — a full wave at tempo, watching one column top to bottom

- **subject** the three depth cues on the field, in `packages/render/src/depth.ts` (new), applied by `packages/render/src/creatures.ts` and `creature-place.ts`, with `depthNearScale` and `depthHaze` as named fields of `SimConfig`
- **changed** the field was a grid seen from nowhere: every body drew at the same size on every row, in the same colours, and which of two overlapping bodies was in front was decided by spawn order. Three cues now, deliberately shipped together because any one alone reads as a trick rather than as a space. **Size** ramps linearly from 1.0 at the top row to 1.125 at the hull — linear rather than the hyperbola a real receding plane gives, because the descent it partners is linear by simulation constraint, and a hyperbolic size over a linear glide is two pictures of different spaces laid over each other. The direction is a constraint and not a preference: never below 1, because `docs/spec/graphics.md`'s floor is a body still nameable at 20–26 px and a shrinking far row walks straight through it. The ~1.15 the brief floated is not what landed, and 1.125 is derived twice — a living body covers 0.8 of a tile, so a fifth of one is the gutter between two neighbouring columns and that gutter *is* the column read the pair talks in; 1.125 spends exactly half of it (0.8 × 1.125 = 0.9 tiles, a tenth still clear) where 1.25 spends all of it and puts two columns' bodies in contact. Independently, the nameability gate's third axis is effective drawn radius including `sizeMul`, SLICK tops out at 26.0 px where BULB starts at 29.4, and a uniform row multiplier stretches every kind's span upward together — so 1.1322 is where those two stop being told apart by drawn size at all, and 1.125 leaves +0.2 px of that gap. Two independent ceilings 0.007 apart, and `packages/render/test/depth.test.ts` asserts both against the constants they came from, so the value cannot be raised past its own justification without going red. That second derivation came with a finding about the gate, which is why it is stated rather than leaned on: **the gate cannot go red on a uniform row multiplier at any value**, because every pair on the living roster is disjoint on the lobe axis as well and `confusable` needs all three axes at once — scaling the whole field to 100× leaves it green, measured rather than reasoned. Drawn size is load-bearing for no pair today, so the axis this change moves is the one the pass/fail is not watching; the TOLD APART BY block still shows the gaps closing, and that is the part worth reading. **Colour** is one mix toward `PALETTE.grid`, the field's own far structure, which pays for dimmer, cooler and lower contrast at once because the target is dark, blue and shared — luminance falls, the warm channel falls faster than the cool one, and a body's fill converges on its rim as it recedes. Quantised into six steps, because `haloSprite` caches one canvas per colour and a tint varying continuously with a gliding row would allocate one per frame forever. **Order** sorts a copy of `world.creatures` by the *drawn* row, farthest first, stable so two bodies on one row keep their order on both devices. Nothing here is simulation: `creatureCenter` stays exactly linear and a test says so, the scale arrives as one ctx transform about each body's centre — which is also how the rock and the torch come along without their own files being opened, and how the style guide's line weights scale with the bodies they outline — and `hashWorld` leaves `cfg` out by construction, so two devices with different values draw two pictures of one world. Driven in a headless Chromium against this worktree's own preview: 2250 painted frames, creatures crossing every row from 0 to 13, no page error
- **decide** does the field read as receding, or do the creatures just get bigger — yes if a body descending one column reads as coming *toward* the hull with the rows above it sitting visibly behind, no if the growth reads as a body swelling in place or the haze reads as a wash somebody laid over the top of the field. If it is only bigger, the honest next move is more haze rather than more scale: `depthNearScale` has 0.007 of headroom before the shape sheet's size axis stops separating SLICK from BULB, and `depthHaze` has the whole range. Nothing was watched — `requestAnimationFrame` never fired in this sandbox and the pane would not composite a screenshot, so the wiring holds and the space is unread
- **where** `bun run preview` — in a worktree, by absolute path inside that tree, reading the port off the server's own startup line and confirming it with `curl -s http://localhost:<port>/__preview` — then a full wave at tempo, watching one column top to bottom. Beside it, `bun run shapes:report` and the TOLD APART BY block, which is unchanged and, per the finding above, would be unchanged whatever this value were

## `af596d8` — arrival, or an old wound

> does the shadow read as a body about to arrive, or as damage already taken — a wave with a scarred hull

- **subject** the contact shadow a falling body throws on the hull, `packages/render/src/contact-shadow.ts` (new), drawn from `canvas2d.ts` after `drawHull`, with `contactShadowLeadRows` and `contactShadowMaxAlpha` as named fields of `SimConfig`
- **changed** a body closing on the hull used to leave no mark on it until the beat it actually landed — the hull gave no warning of its own. Now the last few rows of the fall throw a soft dark ellipse on the hull surface directly below the body, shrinking and darkening as the row closes, so a wide faint patch becomes a small dark one right at the instant of contact. It sits on `l.hullY`, the layout's fixed known y, not on `hull-frame.ts`'s true lobed contour — arithmetic, not projection, and the few pixels of difference are not worth this file importing the frame to chase. Its size is never a second number: `creatureRadius` already carries `depth.ts`'s row scale, so the shadow and the body it belongs to agree by construction, not by two constants that happen to match today. The one constraint the brief was explicit about is that a scar must always win — `scars.ts` draws inside `hull.ts`, and this shadow is drawn after, so the naive version would sit on top of one. Instead `contactShadowFor` refuses to build a shadow at all when the body's column, or an immediate neighbour of it, already carries a scar, using the same column space `occupiesCol` already answers a hit in. `contact-shadow.test.ts` proves this by absence: `drawContactShadows` makes zero draw calls over a scarred column, so there is no pixel there for a scar to lose regardless of which of the two paints first. Nothing here is cached — a fresh `createRadialGradient` every frame, the same as the hull's own body fill — so unlike `depth.ts`'s haze, its darkness needs no quantising
- **decide** does the shadow read as a body about to arrive, or as damage already taken — yes if it plainly sits *under* a falling shape and tracks it in, no if a glance at a scarred hull reads the shadow as one more wound rather than as the warning of a new one, in which case the fix is the exclusion radius around a scar rather than the shadow's own darkness, which was kept well under a crack's near-black stroke on purpose. Nothing was watched: `requestAnimationFrame` never fired in this sandbox's pane, so the tightening and the darkening are proven only as numbers, in `contact-shadow.test.ts`, not as a thing seen closing in
- **where** `bun run preview` — in a worktree, by absolute path inside that tree, reading the port off the server's own startup line and confirming it with `curl -s http://localhost:<port>/__preview` — then a wave with at least one hull hit already scarred, and a fresh body falling down that same column and its neighbours, watched through the last few rows of its fall

## `af596d8` — what the shield seat learns

> from the shield seat, does the shadow say anything the player did not already know

- **subject** the same contact shadow, `packages/render/src/contact-shadow.ts`, considered as a read for player 2 rather than as a picture of depth
- **changed** the shield player already has the radar and the torch alarm, both of which speak in *columns* — which lane, how many beats out. Neither says how close a specific body drawn on the field itself actually is; that has always taken a glance up at the row it is on and a beat's worth of arithmetic. The shadow puts that answer on the hull itself, where the shield player is already looking to place a block, and ties it to the same distance the size and haze cues already carry rather than inventing a fourth. It only appears in the last `contactShadowLeadRows` rows (3 of the field's 14), so it is not shouting from the moment a body spawns — it says something only once there is something worth saying
- **decide** from the shield seat, does the shadow say anything the player did not already know — yes if a glance at the hull tells them which column is closest to costing a point *before* they have consciously read the row a body sits on, no if it only repeats what the size and haze cues already made obvious, in which case its distinct job (a hull-side read rather than a field-side one) has not been earned and the honest fix is widening `contactShadowLeadRows` so it has more of the fall to itself before the other two cues take over. This is the one nobody but a second player at the shield can answer — a solo test view sees both roles and cannot judge what either alone would have known
- **where** `bun run preview` — in a worktree, by absolute path inside that tree, reading the port off the server's own startup line and confirming it with `curl -s http://localhost:<port>/__preview` — then the `p2` role specifically (`?role=p2` or the test view's shield half), a full wave at tempo, asking whether the hull told the shield seat something before the row count would have

## `217c4fd` — a body that knows which way round it is

> the swell runs along TENDRIL, THE NEEDLE, RIBBON, THE SPLICE, THE CLAW, POD and both HUSKs now rather than across them — the drafts panel, PERISTALSIS on each of the eight

- **subject** PERISTALSIS, the travelling swell on the director's motion bar, worn by the eight catalogue bodies that are taller than they are wide
- **changed** the motion is written with its bulge running along x, and until now it ran along x whatever body it was on. Twenty-four catalogue bodies are wide, so x was right; twenty-eight are round to within a quarter and have no long axis to be wrong about; the remaining eight are tall, and on those the swell squeezed *across* the body instead of travelling down it. `OwnMotion` now carries `axis: "long"` and `poseOn` turns the whole gesture a quarter turn on a tall carrier, so the bulge travels head to tail and the widening is sideways. The card's frame is fitted to the turned pose too, so nothing clips. The other seventeen spare motions, and all four the game itself draws, are untouched — they never claimed an axis
- **decide** does a bulge travelling the length of a long thin body read as peristalsis at all, or does an affine pose reduced to centre-plus-width only ever read as a body sliding while it fattens — yes if the eight now read as something swallowed and pushed along; no if the turn merely moved the same unconvincing squeeze onto the other axis, in which case what is wrong is the reduction rather than the axis, and PERISTALSIS is a card that cannot be built out of a pose
- **where** `DIRECTOR_HOST=127.0.0.1 bun run dev` — in a worktree, `tools/director/server.ts` by absolute path, and confirm the tree in its startup line — then SHAPES, `PERISTALSIS` on the motion bar. RIBBON and THE NEEDLE first, since they are the longest; then SLICK, which is wide, to see the same motion the way it always was; then a round body, which is unchanged by construction

> CILIA's fringe and NACRE's bands read the pose instead of its two-decimal printed form, so the drift near a reversal is no longer quantisation noise — worst on THROB, BULB, RUNT, THE CONDUCTOR and THE VANE

- **subject** the lean of CILIA's hundred rim strands, and the slide of NACRE's two interference films
- **changed** both used to take the body's displacement by reading the translate back out of the group's own transform and differencing it. That transform is printed with `toFixed(2)`, so what they differenced was the displacement quantised to a hundredth of a contour unit — and on a slow body the quantum is a large fraction of one frame's step. Replayed over three thousand frames, the lean computed from the printed number and the lean computed from the pose behind it agree on most of the catalogue and diverge near a reversal, where the true velocity is small: worst 1.04 of a unit vector on THROB, and over 0.05 for a tenth of its frames; 0.43 on THE CONDUCTOR, 0.38 on THE VANE, 0.24 on BULB, 0.22 on RUNT; exactly zero on twenty of the twenty-seven bodies that have a motion at all. NACRE's phase is an accumulator, so its two versions drift a whole band cycle apart over the same run. Both now read `f.pose`, the pose the transform was printed from
- **decide** does the fringe still reverse *late*, the way something dragged through water does, or does the unquantised velocity make it snap round at the turn — yes if the lean still visibly lags the sway on BULB and THROB; no if it now flips at the top of the swing, in which case `LEAN_SMOOTH` comes down from 0.12. And for NACRE, whether the bands still stop dead at the end of a sway rather than creeping through it

## `fca8dac` — one body, every skin, every motion

> with twenty skins on one body at once, is it obvious which ones are worth keeping?

- **subject** the new grid on the SHAPES tab that puts one body in every skin at once
- **changed** SHAPES used to show one skin at a time, worn by sixty different bodies. It now also shows one body — THE WEIGHT by default, or any other name you pick from the row above it — wearing all nineteen skins side by side, at the same size as the cards above
- **decide** looking at all nineteen skins on the same body at once, is it obvious which ones are worth keeping and which are a weaker copy of another one, or do they blur into one texture?
- **before** nothing — the skin bar has only ever been able to show one skin on the whole page at a time
- **after** the "EVERY SKIN, ONE BODY" row, under the body picker at the foot of the SHAPES tab
- **where** `bun run dev`, NOT BUILT YET → SHAPES, scroll past TAKEN to "EVERY SKIN, ONE BODY"

> with every motion on one body at once, can you tell two of them apart without reading the labels?

- **subject** the new grid on the SHAPES tab that puts one body through every motion at once
- **changed** there was no page where the eighteen spare motions stood beside each other — seeing one meant forcing it on the whole catalogue and remembering what the last one looked like. THE WEIGHT (or whichever body is picked) now performs all eighteen at once, each labelled underneath
- **decide** covering the labels, can you tell which figure is doing which motion — do enough of the eighteen read as visibly different movements, or do several of them collapse into the same wobble?
- **before** nothing — the motion bar could only ever force one motion on the whole page at a time
- **after** the "EVERY MOTION, ONE BODY" row, below the skins grid on the SHAPES tab
- **where** `bun run dev`, NOT BUILT YET → SHAPES, scroll to "EVERY MOTION, ONE BODY"
- **where** `DIRECTOR_HOST=127.0.0.1 bun run dev` — in a worktree, `tools/director/server.ts` by absolute path, confirming the tree in its startup line — then SHAPES, `CILIA` on the skin bar. THROB first, which is the extreme case and the slowest drift in the catalogue, then BULB and RUNT; then `NACRE`, same three. `requestAnimationFrame` does not fire in a headless pane, so this one needs a real browser

## `b07f480` — water, or only slow

> does TIDE read as water, or only as slow — the director, TIDE then deepCurrent, with the game's own wave sound over it

- **subject** TIDE, the first of three new pieces of music sitting beside the six that were already there. None of them plays in the game; they exist to be chosen between
- **changed** every piece of music here until now put its notes on a beat, so all six could sound *deep* and none of them could sound *fluid* — a thing on a beat is a thing you can count along with, and water is not countable. TIDE is built out of two slow swells whose rhythms are 7 beats and 4.5 beats apart: those two only meet once every 63 beats and the piece is only 22 long, so within one playing they never once land together. There are eighteen notes in thirty-three seconds and each one lasts six, so something is nearly always sounding and nearly nothing ever *arrives*. There are two heartbeats in the whole piece, eleven beats apart, so even the pulse misses. It is also the first piece whose end runs past its own beginning: the last swell is still fading when the piece starts again, so there is no silent moment to hear the join at. Everything in it is either far below a speaking voice or far above one, with an empty middle — which is both what the game's sound rules demand and what deep water actually sounds like
- **decide** does it read as water, or is it just a slow version of the same thing the others do — yes if you stop being able to say where the beat is and start hearing something moving; no if it still feels like a piece with a very slow pulse you could nod to, in which case the two rates are too close together and the answer is to pull them further apart rather than to slow the piece down further
- **before** `deepCurrent`, the existing piece nearest this one in mood: a four-note bass turning over on a strict grid, where you can count along from the second bar
- **after** TIDE, which has no bar to count from at all. Play them back to back, in that order and then the other way round
- **where** the director's MUSIC tab, TIDE then `deepCurrent`. Then play a wave in the game at the same time, so the game's own sounds are over the top of it — the real question is whether TIDE still reads as water when there is something else happening, or whether it disappears
