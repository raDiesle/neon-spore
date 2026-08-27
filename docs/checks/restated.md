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
