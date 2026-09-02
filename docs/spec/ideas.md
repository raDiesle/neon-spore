# Idea store

> **Status: none of it built.** Accepted in principle. Most of it is now worked
> out far enough that a session could start on one without having to decide the
> design first — none of it is a commitment. An idea leaves this page by being
> designed into [bestiary](bestiary.md), [systems](systems.md) or
> [wave-design](wave-design.md), or by being rejected in
> [open questions](open-questions.md).

## Accepted, not yet worked out

**What an entry is.** A one-line idea is a mood, and a mood cannot be picked up
by somebody who was not in the room when it was had. So an entry says three
things: what the thing is, where it attaches to the controls that actually
exist — the cannon's column, the shield's two halves, the maw, the beat, the
radar split — and what is still **unworked out**, written as questions rather
than left as a silence. The third part is the one that earns the page. An entry
with no open questions left is either finished, in which case it belongs in
another file, or it is lying.

Most of what follows has a **shape drawn at it** — a silhouette and an
own-motion, offered to the idea and not yet accepted by it. They are on the
director's SHAPES tab beside the contours the game already draws; see
[the asset catalogue](../asset-catalogue.md). A shape is not a name and a
suggestion is not a decision: an idea is free to refuse the one drawn for it.

An idea's sub-heading says **what it would become**, not how far along it is —
nothing on this page is built. A creature is a thing that falls down the field
and gets a silhouette; a mechanic is a rule the field plays by; a control is a
change to what a player's own hands do; a boss is a whole encounter waiting for
one of the slots in [bosses](bosses.md). The director's backlog page groups by
these four, so an idea that is filed wrongly is one edit here away from being
filed rightly, and there is no second list to change.

### Creatures

- **Echo** — the one creature the two players do not see at the same moment: it
  is drawn on the pilot's field one beat ahead of where it is, and on the
  navigator's at its true row. The pilot, who cannot fire, is the one who sees
  it first, so the only thing that kills it on time is a sentence — the
  [announcing](couplings.md) coupling with nothing invented for it. One beat
  rather than the original's one second, because the beat is the shared clock
  and 625 ms is a quantity both players can count ([latency](latency.md)). The
  lead is a **render** offset and never a second position in the simulation:
  `World` holds one creature at one row and each device draws its own role's
  view of it, or two devices disagree about where something is. Unworked out:
  whether the navigator sees the lead copy at all, faintly (which makes the
  pair's disagreement legible) or not (which makes it real); whether a shot
  fired into the ghost's row hits anything; whether the lead stays one beat all
  the way down or grows as it falls
- **Reverb** — one body that arrives twice: it takes a hit without dying and
  dies one beat later, and a second shot fired inside that beat is spent on
  something that is already gone. A different thing from the Echo, which is
  about *seeing* twice; see the name clash in
  [bestiary](bestiary.md#103-examined-and-rejected). The delay is in the motion
  as well — travel, stop, wait, travel — so the pair can read the rhythm before
  they have to shoot against it. Unworked out: whether a pending death still
  costs the hull if the beat runs out at row 14, and it should, or the last beat
  of a wave is free; how the pending state is drawn, since the draft has no
  marker for it and a hit that visibly does nothing reads as a miss; whether the
  wasted second shot costs score or only time
- **Countdown creature** — can only be hit at zero, and only one player can
  read the count. The marks are cut into the rim, one fewer each pass, and they
  are legible on the pilot's screen while the navigator sees a blank rim — so
  the sentence the pair already says for warding, "column four, I trigger on the
  three", comes out of the other mouth and aims the cannon instead of the
  shield. It hangs off the beat, which [systems](systems.md) 5.3 already says
  countdown creatures do. Unworked out: what a hit off zero does, where nothing
  is safe and dull and a reset is a punish that can push a creature past row 14
  and strand a wave; whether the count runs in beats or in passes; whether a
  wave holding one has to be authored so a zero always falls above the hull,
  which would be the first thing `packages/content` checks rather than the
  author remembering
- **Moulting** — it changes which control answers it, halfway down. It falls
  armoured and faceted and shots only crater it, exactly as the meteor already
  does (`holes`, [systems](systems.md) 5.6); on a fixed beat the shell comes off
  and the soft body inside is killable for a bounded window, in a colour nobody
  knew until the moult. The shed shell keeps falling as a rock, so one arrival
  needs the cannon and then the shield, in that order. Control visibility needs
  no new rule for it: a wave holding one shows both groups from the start, and
  the pair sees the second half coming before they know why
  ([systems](systems.md) 5.1). Unworked out: whether the shell is a real second
  body spawned mid-field, which nothing in `entries.ts` does today, or debris
  that only looks like one; whether the moult is on a beat count or is provoked
  by damage; the colour has to be drawn from the seeded rng at spawn, or the two
  devices disagree the instant it is revealed
- **Symbiosis** — two bodies in one membrane, vulnerable only while they are
  apart, and they part on a period rather than on a timer, so the window is a
  shape both players watch arrive instead of a number one of them holds. The
  talking comes from the columns: the two bodies sit in different ones, the
  cannon is in one column at a time, and both have to be hit inside the same
  opening — the pilot slides while the navigator fires twice against a half-beat
  cooldown. Unworked out: whether hitting one alone re-merges and heals the
  pair, which is what would make the order matter; how far apart is far enough
  to read at 26 px, now that the cluster form genuinely parts and nobody has
  watched one at creature size ([the asset catalogue](../asset-catalogue.md));
  whether it is one
  creature spanning columns, as the torch's `colSpan` already does, or two that
  share a fate
- **Camouflage** — goes out when you take aim, so you have to aim beside it.
  Written for an aim beam that no longer exists; in the raster the aim is a
  column, so the re-grounding is that it dims on the **pilot's** field while the
  cannon stands in its column, and stays bright on the navigator's. The player
  who can see it cannot move the cannon, and the player holding the column has
  to be talked into staying on a piece of field that looks empty. Dims rather
  than disappears: every creature's position is present for both, disturbed or
  incomplete but never absent ([systems](systems.md) 5.2), and that ground rule
  is what stops this being a hit nobody could have taken. Unworked out: whether
  the radar blip goes out with it; whether it re-lights the moment the cannon
  leaves, which makes hunting it a wobble, or after a delay, which makes it a
  decision; whether the navigator can lose it too once a shot is in the air
- **The Colony** — it spreads while it falls, and it is the first creature that
  adds work rather than presenting it. Five small bodies in one skin with a root
  hanging under them; on the accented beat it hatches a dart into a neighbouring
  column. Ignoring it is a decision the pair has to make out loud, because
  everything else on the field is a fixed amount of work and this one is not.
  Unworked out: a mid-field spawn breaks the radar's promise, since the strip is
  a warning and a hatched dart arrives without one — either the brood shows on
  the strip as a second row, or the strip stops meaning what it means; the
  hatching needs a cap and a stop condition, or a wave runs away from a pair
  that is already losing; whether cutting the root is what ends it, which is the
  version where the tendril in the catalogue is a target and not a decoration
- **Prism** (working name only — "Mirror" is taken by [THE MIRROR](bosses.md),
  and the name **The Mirror** was already examined and rejected as a creature
  for an unrelated reason, [bestiary](bestiary.md#103-examined-and-rejected))
  — falls like a creature but is never destroyed by a hit: a shot that lands
  on it re-launches sideways, left or right, depending on which way the object
  is angled at that moment. Aim becomes two steps — where the shot goes in is
  not where it does damage — and it could be the answer for a creature sitting
  in a column with no clean line. Unworked out: what sets the angle (fixed at
  spawn, or does it flip on a timer or by column — the beat is right there);
  whether the redirected bolt keeps the shooter's colour; whether it can be
  wounded at all or is a pure router
- **Wave gate** — a creature that, unlike every other one, is not removed by
  reaching the hull: reaching it does no damage and does not count toward
  clearing the wave, and it holds there or loops back to the top for another
  pass. Only a hit removes it. It is the pod turned inside out — the pod is
  named as never blocking a wave's end ([systems](systems.md) 5.7); this one
  would exist for no other reason than to block it, forcing a queue to be
  beaten rather than merely outlasted. Unworked out: whether an arrival that
  loops back reads as different enough from an ordinary miss that the pair
  learns "that one comes back" rather than assuming the game glitched
  (`resolveHull` treats every arrival alike today); whether it loops forever
  or a bounded number of times, so a bad wave cannot soft-lock a run
- **Notch** — it steers for the damage already done, and it is the first
  creature on the field that changes lane at all. Hull scars are permanent and
  visible to **both** players ([systems](systems.md) 5.8); today they are
  history, and this is the one thing that would turn them into a target list.
  Red and answered by the cannon, exactly like a slick — everything new about
  it lives in one integer, the column it is heading for.

  **The rule, in whole columns.** It glides one tile per beat and holds its
  column between accents. On every accented beat — every fourth, the one the
  pair already hears — it re-picks: it counts the scars standing in each
  column, takes the deepest, and moves **one** column toward it, by the sign of
  the difference and never by a fraction. Ties go to the column nearest its
  own, and after that to the lower index, so the whole choice is a total order
  and two devices cannot round it apart. Fourteen beats from the top is three
  accents, so a Notch reaches at most three columns from where it spawned;
  that is the number a wave author has to hold in their head, and it is small
  enough to author against. The accent itself is `beat % 4` in
  `packages/audio/src/bind.ts` and nowhere else — a sim that spells the same
  arithmetic out a second time is precisely the drift `purity.test.ts` keeps a
  table against, so the accent moves into `sim` and the mixer reads it there.

  **The scars it reads are the recent ones.** `world.scars` is a list of
  events capped at `maxScars` (30) with the oldest shifted off, not a depth per
  column — so "deepest" is a count over a rolling window, and a column stops
  being the target once its damage has aged out behind thirty newer ones. That
  is not an implementation detail to be tidied away later: it is what keeps a
  long run recoverable, because a hull that has been hit everywhere would
  otherwise doom every later Notch to the same corner.

  **An unscarred hull leaves it going straight.** With nothing to steer for it
  holds its spawn column and reads as a slick wearing the wrong outline. The
  first one a pair ever meets is harmless and every one after it is worse,
  which is the teaching order for free — and it is honest, because the pair can
  *see* that it went straight rather than being told it was going to.

  **The sentence is what changes.** A column named across a 0.5–2 s voice delay
  ([latency](latency.md)) can be stale by the time it is heard, so "it's in six"
  is a worse sentence than "it's in six, going to four". Position splits the
  usual way — an `aim` kind, radar `p2`, so the navigator sees it coming and the
  pilot holds the cannon (`docs/decisions.md` #15) — but the *destination* does
  not split at all: the scars are on the hull and both players are looking at
  them. It is the first creature whose target is public while its position is
  private, and that asymmetry is what lets the pair compute the prediction
  together instead of one of them reading it out.

  **The tell has to arrive a beat early.** On the beat before an accent the body
  leans toward the column it is about to take. The lean is a render offset fed
  by the sim's target column and never a second position (CLAUDE.md rule 1), and
  it never leaves the lane (5.8): the shape carries the direction, the tile
  carries the placement. That is also why the drafts drawn at it — NOTCH 1 and
  NOTCH 2, in [the asset catalogue](../asset-catalogue.md) — are the only
  contours in that catalogue with a facing at all. There are two because there
  are two ways to say "that way" with an outline and nobody knows which one
  survives a phone: NOTCH 1 puts the direction in a barb, which is unmistakable
  and is exactly the size of thing that vanishes at 26 px, and NOTCH 2 puts it
  in the whole mass, which cannot vanish and may read as one more wobble. They
  commit on the same beats, so the page is asking one question and not two.

  **What it would cost.** One integer on `Creature`, a re-pick in `beat.ts` on
  the accent, the accent itself moved into `sim`, and a lean in
  `packages/render/src/creatures.ts` reading the target. One further edit, worth
  naming now rather than discovering mid-build: `livingKindForColor` maps a
  colour to exactly one living kind, so a *third* kind carrying red means a wave
  entry has to be able to name its kind and let the colour follow, instead of
  the other way round. Nothing else in the bestiary has needed that yet.

  Unworked out: whether a lean reads as a lean at 26 px, where the bulb already
  sways and the slick already tilts and a small body has only so many ways to
  move — an eye's question, and the two NOTCH drafts are the two candidate
  answers to it rather than one proposal and a caveat; and whether a wave
  holding one has to be authored so that a scar already exists, or whether the
  inert first one is the better teaching after all
- **Husk** — a pod that should be refused, and the cheapest new object in the
  store: a fourth `PodKind` beside `mend`, `purge` and `ward`. No new list, no
  new category, no new control, no new gesture. It hangs amber at a fixed column
  and row and does nothing; it is never cleared and never blocks the end of a
  wave; it is a pod in every respect ([systems](systems.md) 5.7) except what it
  gives.

  **It is freed the same way and costs the same to free.** The pilot holds the
  column, the navigator fires, either colour. That price is paid *before*
  anybody knows what they bought — a shot and half a beat of cooldown, which on
  a wave carrying rocks is a rock left unanswered. A husk that could be read
  while it still hung would be free to ignore, and free to ignore is not a
  decision.

  **Taking it in inverts the receipt.** `mend` gives `podRepair` hull back and a
  husk takes the same number away; there is no flash, and the ship darkens from
  inside instead of lighting. Player 1 learns the answer the way they learn
  every other one, from the ship rather than from a number.

  **Refusing costs no hull and a great deal of everything else.** A husk that
  arrives with the maw shut breaks on the skin exactly as a missed pod does: no
  damage, no scar. So a pair who simply never open the maw are safe from it —
  and give up `purge`, which sweeps the field, and `ward`, which holds the
  shield armed without a trigger. Those are the two pods that answer a wave, so
  a standing refusal is not a safe strategy, it is a wave surrendered. The husk
  invents no punishment; it only has to make an existing gift into a question.

  **The tell is the core, not the strip.** The idea store first said radar, and
  the radar does not carry pods at all: the strips are owned per creature kind
  (`docs/decisions.md` #15) and a pod is not a creature. Putting pods on a strip
  to hold one bit is a large change for a small purpose. What is already drawn
  is better. Every pod's core carries a **glyph** — `mend` a heart, `purge` a
  bomb, `ward` a shield — because a pair chasing one down the field has to name
  it before deciding whether it is worth chasing
  (`packages/render/src/pods.ts`). A husk wears the heart. It is a `mend` that
  has died, and the heart is what makes it a lie. What it does not do is
  **beat**: a hanging pod's core pulses and its whole body bobs, and a husk's
  core sits at one dead brightness and its body hangs still.

  **So the split is workload, not information.** Both players can see the core.
  Only one of them has the attention to watch it for a beat: the pilot in the
  last stretch is holding a column and an 800 ms window at once, while the
  navigator, having fired it loose, has nothing to do until the catch resolves.
  Nothing is hidden from anybody, which keeps 5.2 intact — every position is
  present for both, disturbed or incomplete but never absent — and it is the
  first time the game separates the pair by how busy they are rather than by
  what they are shown.

  **And the body sags.** A pod is taut; a husk is the same capsule with its mass
  gone to the bottom. That is a second and slower tell, for a pair who have met
  one before, and it is the one thing here drawn *at the edge of legibility on
  purpose* — a husk that announces itself while it still hangs is free to
  ignore. So [the asset catalogue](../asset-catalogue.md) carries two, and they
  are the same question at two strengths. HUSK 1 is the pod's own skin with the
  mass moved down and no landmark touched, which may leave an eye nothing to
  point at. HUSK 2 adds one fallen shoulder — a dent about a quarter of the
  radius deep across a quarter of the outline, off-centre so it reads as damage
  rather than as something the thing was built with. Somewhere between those two
  is the line, and the page is where it gets found. Below it the dead core
  carries the whole tell alone; above it the husk stops being a gamble.

  Unworked out: whether the first husk of a run is taught
  ([briefings](briefings.md)) — the world explains itself everywhere else, which
  argues for teaching it and letting the trap be per-pod rather than per-run;
  and whether a husk may share a wave with a `mend`, since two identical amber
  hearts falling together is either the whole idea or one coin-flip too many

### Bosses

Six encounters, in two batches. The first three were worked out far enough to
be worth keeping and set aside when
[The Warden](bosses.md#114-the-warden--the-eye-that-takes-a-hand-off-you) took
the slot they were competing for. The last three came out of reading the two
reference games at boss scale — see [transfers-bosses](transfers-bosses.md),
which also says what each of the first three looks like on a second reading.
Each names the slot it would fit.

- **THE WEIGHT** — a boss held up by hands alone. A heavy sagging sac on a taut
  stalk, the only boss that descends continuously instead of holding a row, and
  the only one with no weak point at all until it has been dragged below a
  line. Two hands stop it dead, but two hands on the field is nobody firing, so
  it falls again the moment you let go to shoot; it sheds ballast rocks while
  held, so holding is never free. The whole fight is the rhythm of hands on and
  off, negotiated out loud. Its animation — the contour deforming toward the
  finger, the skin going taut and bright along the line of pull — was taken for
  the Warden's tether, so what is left here is the mechanic. Slot: The Heart
  (60), whose pillar it fits better than a pulse would
- **THE CHOIR** — warding turned into a weapon. Three small bodies suspended in
  one soap-film membrane, drifting apart and snapping back into a single merged
  contour when they sing in unison. Immune to shots: it takes damage only when
  the navigator's shot **lands on the same beat** the pilot hits the guard
  trigger — the built warding coupling ("column four, I trigger on the three")
  pointed upward instead of down. The Whisperer's pillar
  ([bestiary](bestiary.md#102-newly-accepted)) at boss scale, and the one idea
  here that needs no new rule at all. Slot: The Choir (40)
- **THE CODEX** — it rewrites what a colour means. A slab-bodied thing whose
  skin carries a scrolling glyph pattern, the Glyph creature grown up. It swaps
  what red and cyan *do* for one player without telling them, and the current
  key is legible only on the boss's own skin, which only the *other* player can
  read. Grounds **Interference** and the **Codebook table** below in one object
  rather than two systems. Slot: The Codex (80)
- **THE VANE** — the boss that bends the field instead of the beat. An open
  contour with no inside, a pendulum arm sweeping the top, and at the end of
  each sweep it reverses one player's column order: column four on their device
  is column eight on the other, until the arm comes back. Its pivot is exposed
  only at the far end of a sweep, the end belonging to the player who was just
  rolled — so the one who has to shoot is the one whose numbers stopped
  matching, and the other has to talk them into a column they cannot read. It
  costs the simulation nothing: the roll is a transform on one device's picture
  and its touch mapping, so both worlds stay identical. Spaceteam's wormhole,
  and the pendulum already drawn for THE CONDUCTOR is the picture. Slot: The
  Conductor (30), whose deferral asked for a boss that bends something other
  than the tempo. Drawn, as `vane`: the arm with the bearing it turns on, which
  is the only part of it that can be hit. Unworked out: whether The Flip should
  run at wave scale first, and how a roll ends so it stays a passage rather
  than a state
- **THE TITHE** — it always takes something and the pair chooses what. Two
  rocks a cycle in two columns on the same beat, one shield, and one lit plate
  in a third column wanting the cannon on that beat: two hands, three demands,
  so every cycle is a sentence about what to give up and the scars are the
  record of it. The first boss where the right play is to take damage on
  purpose. From the rotating shield in Lovers in a Dangerous Spacetime, which
  is the one thing its bosses do that nothing here does — every boss so far is
  careful never to ask for the shield and the cannon at once. A body mostly
  edge: a slab across seven columns with a row of plates under it. Slot: The
  Kernel (100). Unworked out: it is one edit from merely mean, so the choice
  has to be legible a cycle ahead and a pair eating one scar a cycle has to
  finish alive. Drawn, as `plated`: the live plate reaches rather than lights,
  since a silhouette has no colours, and each of the seven is exactly one
  column wide
- **THE CAIRN** — a boss built out of the field's own rocks: seven angular
  units in one outline, the first drawn with the crystal contour rather than a
  blob, and nothing about it can be shot. You take it apart with hands — a grip
  drags a unit out of the pile, and once loose it falls as an ordinary rock to
  be warded like any other — so the boss dismantles into the game the pair
  already knows and the whole fight is rate: pull two at once and you have two
  rocks and one shield. It asks how much your partner can absorb right now,
  which is the question Lovers in a Dangerous Spacetime asks constantly and
  none of the three built bosses asks at all. Slot: it wants The Heart (60) and
  so does THE WEIGHT; they are the same pillar and both should not be built.
  Drawn, as `pile`: the faceted tracing this asked for exists, the units are
  rocks at `METEOR`'s own size and facet count, and the pile is one outline
  until a unit is dragged clear and exactly two after. Unworked out: what stops
  a pair pulling nothing and waiting; and whether a person can count seven
  rocks in the silhouette, which is the whole mechanic and needs an eye

### Mechanics

- **Reverse wave** — a wave from below, and the reason nothing was drawn at it
  is that a direction is not a shape. The breach is what would give it one:
  something comes up out of a hole in the hull, and since the hull is the bottom
  row, a reverse wave is not an arrival from off-screen at all — it is the
  ship's own damage turning into enemies. Unworked out, and this is the crux:
  the cannon fires straight up from the hull, so a thing **below** the hull line
  cannot be shot at all. Either it climbs first and the fight starts when it is
  level with the field like everything else, or the pair has an arrival with no
  answer, which is a different game. The radar is the top edge only
  ([systems](systems.md) 5.8), so the warning has to appear somewhere it never
  has; and [the 4-second rule](latency.md) is measured from the top, so
  something that starts at the hull has no budget at all until it has climbed
- **The breach** — a column scarred past a threshold stops being cosmetic and
  opens. Scars are already permanent, already at a column and already drawn
  (`Scar`, `maxScars`); this is the single rule that would make them structural
  instead of a record. What an open column *does* is deliberately not settled
  here: it could let the next arrival through for nothing, it could be where a
  reverse wave comes from, it could be the thing a repair pod is finally for.
  Unworked out: whether the hull's slow regeneration (`hullRegenPerSecond`)
  closes one, which decides whether a run can recover or only decay; how many
  arrivals in one column is the threshold, and whether the pair can watch it
  approach, since a hull that gives way without warning reads as the game
  cheating; whether a breach is per column or per neighbouring pair, because
  eleven independent columns is eleven small collapses and not one crisis;
  and **The Patch** below is the same scar from the other side, so whichever
  is built first decides what the other one means
- **Light traces** — a line that lags whatever drew it, so it says where
  something **was**. This is a rule broken on purpose: there are no path
  indicators in the field, not even for meteors, and the only line is your own
  cannon's column ([systems](systems.md) 5.8). A trace has to earn that, and it
  earns it by being past tense and by belonging to one player — history for the
  one who cannot act, the present for the one who can, the mirror image of the
  Thread and its future. Unworked out: whether a trace belongs to a creature, a
  wave or a pod; whether the trace of a thing that glides one tile per beat says
  anything at all, since a straight lane makes a straight trace and a straight
  trace is a repetition rather than information — which may mean this idea has
  to wait for the first creature that changes lane, and the Notch above is it
- **The Needle** — a geometric corridor, and the first thing on the field that
  is not in a lane. Drawn rather than grown, crossing columns, and it does not
  so much occupy a column as close it: a shot has to pass a gap that only lines
  up with the cannon on some beats. Position from player 1, moment from the
  beat — warding's shape pointed at firing instead of defence. Unworked out:
  whether it stops bullets, creatures or both; how it is stored, because the
  simulation holds integers and a diagonal has to be a per-column table of open
  and closed rather than a line equation, and choosing the wrong one of those is
  a rounding disagreement between two devices; whether it moves at all, or is
  fixed wave furniture the pair works around
- **The Patch** — a scar you can hold shut. Damage is a number today; here a
  fresh scar leaves its column open — the cannon cannot fire through it, or a
  hit there costs double — until somebody holds a hand on it for a few beats.
  It is [THE GRIP](assists.md#64-the-grip--keep-watch-built) pointed inward at
  your own hull, so it needs no new gesture, and it is one answer to
  [open question 17](open-questions.md#from-the-raster-round), which asks
  whether the hull stays mute. Taken from the breaches in Lovers in a Dangerous
  Spacetime; see [transfers](transfers.md). **The breach** above is the same
  scar left alone rather than held shut. Unworked out: whether the open
  column blocks your own shots or only doubles the damage, and how long a patch
  holds
- **The Flip** — the field's column order reverses for one player, so column
  four on one device is column eight on the other, and every announcement has
  to be turned around out loud. Spaceteam's wormhole. This is the shape that
  was rejected as The Mirror and The Translator
  ([bestiary](bestiary.md#103-examined-and-rejected)), and it comes back on one
  condition: the world explains it. A field that visibly rolls over, for a
  bounded number of beats, with both devices told which of them turned, is a
  mechanic; a silent disagreement between two screens is a bug the pair will
  report. Unworked out: how long it lasts, and what triggers it. [THE VANE](bosses.md#115-the-vane--the-arm-that-decides-where-you-are-hit)
  proposed this exact roll and built something else instead — folding where
  things land in the simulation rather than rolling the render — because a
  flip the simulation never hears about has nothing to hash, nothing to
  replay and nothing the director can show. The roll is still unbuilt and
  still worth having; the lesson from the boss that almost was it is to prove
  it at wave scale first, in `layout.ts` and `touch.ts`, where a bad answer
  costs one wave, and let a boss claim it afterwards only if it survives
- **The Fork** — the run stops between waves and continues only when both
  thumbs are down, and the pair chooses which of two routes to take with half
  the knowledge each: the pilot the rock traffic, the navigator the colour mix.
  The only announcement in the game with no falling object over it, and the
  only moment that belongs to the pair rather than to the clock. From
  Spaceteam's warp jump and the forking levels of Lovers in a Dangerous
  Spacetime. Unworked out: what a fork does to wave numbering and the save
  points ([structure](structure.md), open question 11)
- **Cracks in the cockpit** — a downward spiral, moved here from "Deliberately
  deferred" rather than deleted: nothing about it was ever argued down, it was
  only ungrounded, written for a version of this game with an aim beam and a
  cockpit view to crack. What survives the name is a picture rather than a
  score — the field's own read on things going wrong deepening visibly as they
  do, the way a windscreen spreads a new crack with every impact rather than
  reporting one more hit as a number. The hull already has exactly this
  machinery, `Scar` and `hullMilli`, drawn as the ship's own damage
  ([systems](systems.md) 5.7). Unworked out, and this is most of it: whether
  "cockpit" means anything once the field is drawn from outside the ship
  rather than from within one, or whether the idea is really about the hull's
  own picture and the name is the free-flight assumption that has to go;
  what would spiral rather than accumulate, since the existing scars are a
  flat record and a spiral wants the *rate* to worsen with the damage; and
  whether it is a second decay track or the same `Scar`s read differently at
  higher counts

### Controls

- **Interference** — one player's colours are swapped and they do not know it.
  The navigator chooses the colour and fires, so the swap lives on their
  swatches: they say red and cyan comes out. Nobody is told; the pair finds out
  through the contradiction between what one of them says and what the other
  sees, which makes it the only mechanic here that is *discovered* rather than
  announced. It is a fact in the simulation and a mapping in the renderer — the
  sim knows which colour was fired, each device draws its own role's labels, and
  the one-way flow stays intact. Unworked out: how it ends, where the
  interesting answer is that the pilot ends it, being the one who can see it and
  the one with a spare hand on the trigger; how long it may run before it stops
  being a joke and becomes a lost wave; how a briefing ([briefings](briefings.md))
  teaches a thing whose whole point is not being told
- **Bearing waves** — a coordinate grid, which is a change to the sentence
  rather than to the controls. Columns are counted today, so an announcement is
  a number both players derive the same way and neither can get wrong. A ring
  with a mark on it gives a zero that can be named without counting, two right
  of the mark, and the mark turns on the beat, so the same column has a
  different name a moment later. Unworked out: whether both players see the
  ring, because if they do it is a rename and nothing else, and if only one does
  then the other cannot check the sentence they were handed; whether eleven
  columns can be named off a ring at a glance on a phone; whether the turn is on
  the beat, which makes it countable, or continuous, which makes it a race
- **Codebook table** — the key is on the ship, and only the other player can
  read it. A plate on the hull carries a mapping from something said to
  something done: a word to a column, a mark to a colour. It is the Glyph
  creature's other half ([bestiary](bestiary.md) 10.1) and the ground THE CODEX
  stands on. Unworked out: how many rows stay legible on a phone beside
  everything else on the screen, which is probably a very small number; whether
  the lookup costs time, because a key readable at a glance is free and a free
  key changes nothing; whether it is fixed for a run, redrawn per wave or
  rewritten mid-wave, which is the difference between learning a table and
  reading one
- **Inverted instructions** — the Spaceteam principle: a control that does the
  opposite of what it says, for a bounded time. The Choke
  ([bestiary](bestiary.md) 10.1) already shuts a control down; this is the
  milder and more talkative version, and the ship says so by drawing a span of
  its own membrane reversed. Not every control can take it — the trigger is a
  moment, and an inverted moment is only a miss, so the honest candidates are
  the cannon strip, where left is right, and the shield's queued move. Unworked
  out: whether the inversion is shown to the player it happens to, making it a
  puzzle, or only to the other one, making it a conversation; whether it
  survives control visibility, since a wave that hides a control group cannot
  invert it ([systems](systems.md) 5.1); how it is undone
- **Call signs** — the eleven columns get names instead of numbers, chosen the
  way Spaceteam chooses its words: to be unmistakable when shouted across a
  laggy channel. Naming rule 3 ([bestiary](bestiary.md#naming)) applies to
  creatures and was never applied to the field, where "seven" and "eleven"
  share a vowel and an ending. The trade cuts both ways — numbers carry order
  for free and names have to be learnt — so the likely answer is partial: fix
  the collisions, or name the few columns that matter and count from them
- **The Other Hand** — your hull shows that your partner's thumb is down, never
  what it is doing. A lobe brightens while they hold something and goes out
  when they let go. It is what survives of the single shared screen in Lovers
  in a Dangerous Spacetime, deliberately narrowed: knowing their column would
  replace a sentence, knowing only that their hands are full changes which
  sentence you say. If it gives away too much it belongs in
  [assists](assists.md) with a price on it, like sharing sight
- **Handover** — the two control sets trade owners in the middle of a wave.
  Roles are picked before a run and kept, with separate high scores per split as
  the incentive to swap ([roles](roles.md)); this makes the swap something that
  happens *inside* a wave, announced by the ship rather than agreed beforehand.
  Everything each player has learned about their own half becomes something they
  have to say out loud to somebody who is now holding it. Unworked out: whether
  radar ownership travels with the controls, and it almost certainly must, since
  the whole point of the split is that the one who knows is not the one who acts
  ([systems](systems.md) 5.2); whether a shield move already queued survives the
  handover; whether it reads as exciting rather than as simply losing the wave,
  which is a question a prototype answers and a paragraph does not

### Weapons

A power-up changes what the cannon fires, never how it is aimed: the cannon
still slides one column at a time and a press still stands it in the column an
announcement named; only the shape of what leaves it differs, for a bounded
time, picked up the way the game's other power-ups already are.

- **Spread shot** — a shot that lands across more than one column at once,
  under a power-up rather than as the standard weapon. Refused once as a plain
  replacement: the standard shot (`docs/spec/systems.md` 5.5) is a single
  bubble in a single column, and aiming's whole discipline is standing the
  cannon in the *one* column an announcement names — "it slides along the hull
  and never aims sideways… standing in the column is the whole of aiming"
  (`docs/spec/briefings.md`, step 3). A shot that lands across several columns
  removes the reason the standard one is exact, because the pair no longer has
  to agree on a single column, only on being near it. A power-up scopes that
  cost to a bounded pickup instead of to the whole game: the controls stay
  identical, only the shot leaving them changes, for as long as it lasts.
  Unworked out: how wide the spread is, and whether it is announced as "the
  wide gun" rather than by column at all while it runs, since a spread shot
  still answering to a single-column announcement half-defeats the point of
  carrying one; what kind of pod grants it, since nothing today changes what
  the cannon fires; how long it lasts, and what a spread shot already in
  flight does when it expires

### Rounds

Twelve short rounds that are not the field: their own rules, their own
controls, their own picture, over in about ninety seconds, and nothing they
teach is used again. The category comes from reading Hazelight's two co-op
games — see [transfers-hazelight](transfers-hazelight.md) — and what a
round is allowed to be is [interludes](interludes.md). THE MIRROR
([bosses](bosses.md) 11.4) is the one the game already has without calling it
that, and it is the only one.

Each entry says whether it needs the no-travel rule relaxed. Most do not, and
that is deliberate: a round that survives either answer to
[the question the category hangs on](interludes.md#the-question-the-whole-page-hangs-on)
is worth more than a better one that is waiting on it.

- **THE CLAW** — a salvage machine over a wreck field, and the strongest
  argument that this category costs almost nothing. The pilot slides a claw
  along a rail above the wreckage — the cannon's exact verb, one tile per
  press, on a rail that is a hull by another name, so **no relaxation is
  needed**. The navigator sees what the pilot cannot: the wreck field's
  contents, cell by cell, pods and rocks mixed. The pilot sees only the claw,
  the rail and the dark. Every drop is a sentence, and a wrong one comes back
  holding a rock. What it gives is `mend`, `purge` and `ward`
  ([systems](systems.md) 5.7) for the act about to start, which is the whole of
  its stakes: nothing is lost by fishing badly, and an act begins better or
  plainer. Unworked out: whether the pilot ever sees a cell resolve, since a
  claw that comes up empty and says nothing is a round with no feedback in it;
  whether the navigator's map is fixed at the start or is revealed a column at
  a time as the claw passes, which turns one long announcement into eight short
  ones; how many drops a round gets, which is the only difficulty knob it has
- **THE LATHE** — one of you describes a shape and the other builds it blind,
  and it is made entirely out of maths the game already has. The navigator's
  device shows a target contour and no controls. The pilot's shows four
  numbered knobs and a contour that is not the target: lobe count, radius,
  bump depth, bump position — the parameters `blobPath` and `hullRadiusMul`
  already take (`packages/content/src/shapes.ts`). Neither sees the other's
  screen, and the only channel is the sentence "three lobes, fatter at the
  top". It is [announcing](couplings.md) with the falling object removed, which
  is the one condition under which the pair finds out how bad their shared
  vocabulary actually is. **No relaxation needed** — nothing moves at all. The
  design vocabulary is fixed and this round is where a pair discovers whether
  it works: lobe is the word, and if two people cannot use it to agree on a
  shape in ninety seconds then the word is wrong and the bestiary has a problem
  ([bestiary](bestiary.md) naming). Unworked out: how close is close enough,
  which has to be an integer distance between two contours computed the same
  way on both devices, and there is no such function today; whether the knobs
  are shared or split, since four knobs on one device is one person working
  while the other talks; whether a round is one shape or three
- **THE VAULT** — pairs, played across two devices, with the faces on the wrong
  one. A grid of slabs, face down on both screens. Each player can read the
  faces of the cells **the other one is able to turn**, and neither can read
  their own. So every turn is dictated: you are told what you are about to
  reveal and by whom, and a pair that stops narrating loses the board
  immediately. It is the cleanest expression of the information split in the
  whole store — no timing, no aim, no clock, nothing but what each of you can
  see. **No relaxation needed.** Unworked out: whether a wrong pair costs a
  turn or costs nothing, where costing nothing makes it a memory exercise and
  costing a turn makes it a memory exercise with a punish; the grid size, which
  is the entire difficulty and has to fit a portrait phone twice; whether the
  faces are glyphs the pair already knows — the six control glyphs
  (`packages/render/src/simon-glyph.ts`) are drawn and legible small — or new
  symbols, which would be a vocabulary lesson inside a minute
- **THE GAUGE** — the smallest one, and the one to build first if any of them
  is built. A single needle between two marks. Each player holds a valve that
  pushes it one way, both valves are always pushing, and the needle sits still
  only while the two are matched. Only the navigator sees the dial. Only the
  pilot's valve is strong enough to move it quickly. The target band drifts on
  the beat, so the pair is never done, only currently right. Ninety seconds of
  "ease off, ease off, now hold" and nothing else. **No relaxation needed** —
  a needle is not a thing that travels a field, it is a number in thousandths.
  Unworked out: whether the drift is authored or drawn from the seeded rng at
  the start, where authored is repeatable and drawn is fairer to a second
  playthrough; whether letting the needle hit an end costs the round or only
  time; whether it is a gauge at all or is the same round drawn as two hands on
  a rope, which is the picture everybody already understands
- **THE ACCORD** — eight beats, two dials, no picture in common. Each of you
  has a dial showing a number neither of you chose, and the round ends when
  both dials read the same. Neither can see the other's. There is no correct
  answer, only an agreed one, so the whole round is two people inventing a
  protocol for meeting in the middle and then executing it before the count
  runs out. It is the shortest thing the category can hold and it is the one
  that would go in the first gap of a run, before the pair has learnt anything
  else. **No relaxation needed.** Unworked out: whether the dials wrap, which
  turns "go up" into an ambiguity the pair has to notice on their own and is
  probably the best thing in it; whether the count is eight beats or sixteen;
  whether it repeats three times with a tighter count each time, which is how
  it becomes a round rather than a moment
- **THE DUET** — the beat, played rather than counted, and the one round built
  to spend an asset that is finished and unheard. The audio catalogue is built
  ([audio](audio.md)), the speech band is deliberately kept clear, and no
  design has yet asked the pair to *listen* to anything. Here a phrase runs
  past on the beat and each player holds half of its notes — the pilot's pads
  and the navigator's, never the same one twice — so a phrase can only be
  played by two people taking turns inside a bar. Each device shows only its
  own half, which means the handover is announced, out loud, in a channel the
  sound was designed not to occupy. **No relaxation needed.** Unworked out:
  whether a phrase is authored or generated, where authored is the only version
  that can be *good*; what a wrong note does, since silence is a poor answer and
  a buzzer is a sound in the speech band; whether 625 ms per beat
  ([latency](latency.md)) is a musical tempo or merely the game's, which is a
  question somebody has to hear before it can be answered
- **THE SPLICE** — a nest of tangled cable, two ends, and the colour on the
  wrong device. The navigator sees where each strand enters; the pilot sees
  where each leaves; the tangle in between is drawn on both and legible on
  neither. Cutting the right strand takes a call from one and a press from the
  other, and cutting the wrong one re-tangles the rest. It is the classic
  asymmetric puzzle and the reason it is here rather than in
  [transfers](transfers.md) with Keep Talking is that it needs no manual: both
  halves are pictures, and neither is a page of rules somebody has to read
  aloud. **No relaxation needed.** Unworked out: whether the strands may cross
  at all, since a tangle that is genuinely unreadable is a round decided by
  who has better eyes; whether the two colours are the game's red and cyan,
  which would collide with what a shot means everywhere else; how a re-tangle
  is drawn so that it reads as a consequence and not as a bug
- **THE BELT** — the first thing in this game that moves sideways, and it is
  worth building for that alone. A horizontal line of slabs travels across both
  devices at one tile per beat. Each carries a mark that is legible on the
  navigator's device and blank on the pilot's, and the levers that sort them
  are the pilot's alone. Everything in the game falls; a pair that has spent an
  act reading a vertical field has to re-learn where to look, and the
  re-learning is the round. **No relaxation needed** — nothing the pair
  controls moves, the belt does. It is also the one candidate that is close to
  a genre this design has already refused, and the refusal is worth
  re-reading before anybody starts: a sorting line under time pressure is a
  reflex game, and reflex games are what the beat exists to prevent. Unworked
  out: whether the pressure is the belt's speed, which makes it a reflex game
  and disqualifies it, or the number of slabs in flight, which does not;
  whether a mis-sorted slab comes back round; whether the marks are the control
  glyphs or something new
- **THE REPRISE** — one of you plays, and then the other has to live inside the
  recording. The pilot performs a short pattern of presses over four beats. It
  is recorded — `packages/sim/src/replay.ts` already stores inputs and returns
  a fingerprint, so a minigame built on recorded input is nearly free in an
  engine that is lockstep anyway — and then it replays, on a loop, while the
  navigator has to do their own half around it. The pilot cannot intervene: it
  is their own past, and they watch it get in the way. It is the nearest this
  design gets to It Takes Two's best verb pair, rewind and clone
  ([transfers-hazelight](transfers-hazelight.md)), without either player
  touching time. **No relaxation needed.** Unworked out: what the navigator is
  actually doing around the loop, which is the whole design and is not decided
  — the honest answer is that this is a mechanism looking for a round; whether
  the pilot records blind or is told what the loop will have to accommodate,
  where blind is crueller and much funnier; whether the loop is four beats or a
  bar of the pair's own choosing
- **THE EDGE** — one space, two projections, and the pair has to work out that
  they are looking at the same thing. The navigator sees a field from above,
  the way the game is always drawn. The pilot sees it edge on: one row of
  eleven columns with depth carried as brightness, so two objects in the same
  column at different rows are one bright mark and one dim one. Neither view is
  wrong and neither is sufficient. It comes from Split Fiction's habit of
  giving the two players genuinely different cameras on one room. **No
  relaxation needed.** Unworked out: whether brightness can carry fifteen rows
  legibly, which is an eye's question and probably answers "no, so use fewer";
  whether this is a round at all or is a *veil* — a way of showing the
  ordinary field, which would make it a system rather than a round, and
  [systems](systems.md) 5.2 already governs what may be disturbed and what may
  never be absent; what the pair is doing in it, which like THE REPRISE is not
  yet decided
- **THE WELL** — the field turned inside out: the hull at the centre, the
  creatures falling inward from a rim, and eleven columns become eleven
  positions on a clock face. Nothing in `packages/sim` changes at all — a
  creature is still `(col, row)` and the rules are the rules; only
  `packages/render` projects it differently, which is legal precisely because
  render changes nothing (`CLAUDE.md` rule 1). What changes is the **sentence**:
  "column four" stops being a phrase and "four o'clock" starts being one, and a
  pair that has spent four acts building one vocabulary discovers it was
  building a vocabulary about a picture rather than about a game. **No
  relaxation needed**, and it is the cheapest large change in the store. It
  also plainly **fails the first test of a round** — the field is not
  gone, it is re-drawn — and that failure is the useful part: its real home may
  be the modifier slot that [wave-design](wave-design.md) already reserves for
  waves 8 and 9 of an act, where inverting something is the point. Unworked
  out: which of the two it is, which is the only question it has and is worth
  answering before the drawing starts; whether both devices flip or only one,
  where only one is The Flip ([ideas](ideas.md), Mechanics) wearing a different
  hat; whether the radar strip survives a polar field at all
- **SNAKE** — **built**, and this bullet is what the old one promised would
  replace it. `packages/sim/src/snake.ts` and its four neighbours, drawn by
  `packages/render/src/snake-draw.ts`, played on the `snake` control set, one
  wave in `act-4.ts`. What it settled: a snake is one body that travels, which
  is the shape the field's central rule forbids — and a round is outside that
  rule, which
  [the page that hung on the question](interludes.md#the-question-the-whole-page-hung-on-now-answered)
  had already answered before this was written. So the answer was not a
  relaxation; it was that the rule is about the field and this is not the
  field. What makes it a Neon Spore round rather than a game for one person is
  the axis split: player 1 has left and right, player 2 has up and down, and a
  turn only counts *across* the way the body is already going — a corner is
  physically two seats in an order they have to agree out loud. Both sketches
  the old entry named are in it and they turned out to be the same idea seen
  twice: the food is on one device and the body on the other. The two extra
  buttons follow — the flip is player 1's because the tail is the end they can
  see, the brake is player 2's because they are watching what the head is about
  to hit. Three rounds, each wanting more points in less time at a shorter
  step; a wall or a bite costs the hull and puts the body back; the clock
  running out costs the hull more and ends it.

## Deliberately deferred

- **THE CONDUCTOR, bending the tempo** — a boss drawn as a pendulum arm
  sweeping the top of the field, an open contour rather than a body, whose arm
  position *is* the tempo: it speeds the beat up and slows it down, and the grid
  pulse, the shield's queued move and the fire cooldown all follow. Deferred
  rather than rejected, and deferred for one reason — the shared beat is what
  makes an announcement survive a 0.5–2 s voice delay
  ([latency](latency.md), `docs/decisions.md` #2), so a boss that bends it is
  attacking the load-bearing wall. The slot keeps the name; the pendulum shape
  is already spent, though — THE VANE ([bosses](bosses.md#115-the-vane--the-arm-that-decides-where-you-are-hit))
  drew it first, for a boss that bends the field instead of the beat. Anything
  built at this slot from here needs a picture of its own

## Note

Several of these were written for free flight and assume an aim beam or
evasion. Three of them have been re-grounded above: **Camouflage** is now
about the cannon's column rather than a beam, **Bearing waves** is about the
sentence rather than a heading to steer on, and **Cracks in the cockpit** has
moved up to Mechanics still mostly ungrounded, on the reasoning that an idea
nobody has argued with belongs with the others waiting to be worked out
rather than in a list for the ones that were turned down. The rule holds for
anything else that moves off this page — the communication idea inside an old
entry usually survives the control model and the gesture does not, so it has
to be re-grounded in the cannon, the shield and the beat before it is designed
in.
