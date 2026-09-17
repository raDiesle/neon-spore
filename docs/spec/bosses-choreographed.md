# Choreographed bosses — A Way Out, read against this engine

> **Status: not built, and nothing here is accepted.** Fifteen boss concepts
> and a primitive library, written 16 September 2026 from the owner's brief for
> encounters that read as *interactive action scenes* rather than arcade
> fights, with Hazelight's A Way Out named as the reference. It is the third
> boss-idea page: [transfers-bosses](transfers-bosses.md) mines Spaceteam and
> Lovers in a Dangerous Spacetime, [bosses](bosses.md) holds the worked and
> built designs, and this one mines a game that has **no enemies at all**.
>
> The brief arrived with a twelve-card sheet drawn by another model. Four of
> its premises need correcting against this engine and are corrected below by
> name rather than quietly worked around — though **the slow motion it asks for
> is allowed**, on the owner's ruling of 16 September 2026
> (`docs/decisions.md` #33), which reversed this page's own first answer; six of its twelve cards are re-skins of
> bosses already shipped and are [refused by name](#refused-by-name). What
> survives is worth the page.

## Who is building what, so two sessions do not collide

**Read this before starting any concept on this page.** The owner works several
of these at once, in parallel sessions and separate worktrees, and the page is
the only place that knows which one is already under a hand. A session that
takes a concept writes its row here **before it writes any code**, and the row
goes away when the lane lands — the same discipline `docs/queue.md` uses, kept
here because a boss concept is not a technical finding and does not belong on
that list (`CLAUDE.md`, *an idea for the game is not collected*).

| Concept | State | Lane |
|---|---|---|
| [§7 THE DIASTOLE](#7-the-diastole--two-clocks-at-once) | **built, 16 September 2026** | `claude/neon-spore-boss-design-26ee5e` — the simulation and THE SLOW, then the look. Worked and written up as [bosses](bosses.md) §11.17 |
| [§10 THE BATON](#10-the-baton--whose-turn-is-it) | **built, 16 September 2026** | `claude/boss-implementation-e3cfff` — the simulation, then the look. Worked and written up as [bosses](bosses.md) §11.18 (wave 68) |
| [§1 THE THROAT](#1-the-throat--what-you-feed-it) | **built, 17 September 2026** | `claude/neon-spore-boss-design-26ee5e` then `claude/throat-look`, `claude/throat-lock` — the simulation, the gullet, then the navigator's readout and the eversion. Worked and written up as [bosses](bosses.md) §11.19 (wave 69) |
| [§13 THE UNDERTOW](#13-the-undertow--where-you-are-being-hit-from) | **built, 17 September 2026** | `claude/boss-implementation-e3cfff` — the simulation, then the look: the plate bowing on player 1's screen alone, the lobe up through the plating, the body taken in. Worked and written up as [bosses](bosses.md) §11.20 (wave 69, THE UNDERTOW) |
| [§2 THE ORRERY](#2-the-orrery--whether-you-can-agree-on-when) | **built, 17 September 2026** | `claude/boss-orrery` — the rings landed (wave 70 THE ORRERY, [bosses](bosses.md) §11.21: three orbits anchored so the first alignment is placed rather than hoped for, the shaft, the shot that takes the outermost ring and changes the core's colour, the organs it sheds, the core's own fire and where it may not aim it, THE SLOW over the alignment, the lance that finishes it). Four departures from §2 are argued in §11.21 by name: **the column is never in question** — rings concentric about a core admit exactly one, so the design's *call the column the gap will stand over* is dropped as a second QUEEN — **the orbits are not coprime**, because coprime is the right tool for two cadences and the wrong one for three, **it fills its own wave**, which is the exception THE DIASTOLE's lane allowed for, and **a broken ring sheds three organs rather than eight**. **The hand on the ring landed** on `claude/orrery-hand`: a bearing drag that clicks the outermost unbroken ring one organ per turn and a half of the thumb, writing the ring's *anchor* so every gap stays a function of the beat, with two more departures argued in §11.21 — **the hand moves inward** as rings come off rather than dying with the outer one, and **there is no flywheel**, because a gap moving with nobody's hand on it is what this boss's central rule forbids. **The look landed** on `claude/orrery-look`: three orbits drawn flattened to `ORRERY_FLATTEN` 0.3, because `orreryReach` spans the field's width while the space above row 0 is one tile deep, so a circle could not be drawn and a squashed one would put a ring's near side within a few pixels of its far side; organs arriving in a *rhythm* rather than at a speed, so three cadences can be heard in your own counting; the near arc drawn after the core and the far arc before it; a broken ring left as a dashed line, because the pair have been counting against it; the shaft of light, which is `light-shafts.ts`'s job done with the wrong tool and so has its own file; and the per-seat split as `showsOrreryRing` in `render/view-role.ts` — **the outer ring true on both screens**, which is the calibration the other two are worth saying out loud against. **The handle landed** on `claude/orrery-handle`, and the boss is finished: the ring is hit-tested where it is drawn — an ellipse the width of the field rather than a circle on a body, so the hit test and the knurl that says it turns live in one file (`render/orrery-grab.ts`) — the ellipse is unsquashed before the angle is read, so what a thumb reports is the **slot** under it rather than the pixel angle, and this is the one gesture in the game the fold reaches, because the finger is chasing a body rather than pointing at a column. `FIELD_CONTROLS`, [controls](controls.md) and a gallery pose all carry it. **The three hands that are not hands landed** on `claude/orrery-hands-not-hands`: the desk key (**O**, shift for the other way, a letter of its own for THE CHOIR's shake's reason), `--press T:1:orreryRing=N` in **organs rather than turns**, and a film's ghost thumb authored as the handle it is — all three turning at `orreryTurnPerTickMilli`, one organ a beat, which is the ring's own drift and is derived from the gearing and the tempo rather than chosen. The lane also fixed the defect that made it urgent: `scene-drag.ts`'s `pullsDown` answered *true* for `orreryRing`, so a film would have sent downward pixels at a control reading thousandths of a turn. What is left of THE ORRERY is queued rather than a lane: **the sound**, and it has never been watched at tempo |
| [§14 THE CANDLE](#14-the-candle--whether-you-can-act-in-the-dark) | **built, 17 September 2026** | `claude/boss-implementation-e3cfff` — the glow, then the dark: the field black under a glow of five steps, a shot's flash on player 2's screen and the guard and beam on player 1's, a breach lighting its neighbourhood on both, the after-image as a per-column light rather than a kept frame, the two black beats and the light coming back. Worked and written up as [bosses](bosses.md) §11.22 (wave 72). THE SLOW over the flash beat and the corner light going last are not built: the owner's eye |
| [§3 THE GORGE](#3-the-gorge--what-not-to-do) | **built, 17 September 2026** | `claude/boss-implementation-e3cfff` — the sack (`fb63f2ab`), then the skin (`41f50952`): seven intakes each holding a count of beads of one colour, a shot that meets no creature swallowed into its column's intake, the wrong colour taking a bead back out, an intake full at four and pierced by the fifth or venting a torch after four beats, the sack sinking a row for every four beads, the spat bead as a body only the opposite colour breaks, the mouth after the fourth rupture fed by its own spit and ended by the beam alone; the translucent sack breathing above row 0, the beads stacked in the lobes on both screens, the pilot's violet tally under each and the navigator's ring around the nearest full in its colour, the rupture as two flaps hanging open, THE SLOW as the beads rising over three beats, up to eighty beads leaving at once. Worked and written up as [bosses](bosses.md) §11.23 (wave 73), with five departures argued there. The curtain of step 11 is a sag rather than a shape, and the rupture is not `body-hit-rupture.ts`: the owner's eye |
| [§6 THE CURTAIN](#6-the-curtain--what-it-is-standing-in-front-of) | **built, 17 September 2026** | `claude/boss-implementation-e3cfff` — the membrane and the core (`bfe1bbcb`), then the fabric (`2a78763c`): a boss body seven columns wide at row 1 that both hands carry a column a beat, off the wall as far as its keep, and that rolls back over the core when nobody holds it; seven lobes along the hem as the health, two soft a cycle and taken off by a bolt, a light sheet carried two; the core a column and a colour with no body, a shadow through the fabric, shot only where the fabric is not, each hit in its own colour dropping the nearest lobe and drifting it to a new column and colour, the other colour a rock down the column; a bare hem torn off by the next shove and the naked core firing faster until the third hit; the translucent violet membrane with folds and a scalloped hem, the hem trailing the rail through a shove, the soft lobes lit on the pilot's screen alone and the core's shadow on the navigator's alone, the hand ring over the sheet, the torn sheet falling and crumpling over four beats. Worked and written up as [bosses](bosses.md) §11.24 (wave 74), with six departures argued there. Not built: the sag under a hand rather than a slide, the decoy on the pilot's screen, the hole a shot leaves in the fabric, THE SLOW on the shove, and a real z-order — the core is dimmed by being drawn under the sheet: the owner's eye |
| [§4 THE TASTER](#4-the-taster--what-you-have-already-spent) | **taken, 17 September 2026** | `claude/boss-taster` — **the simulation landed** (`64335006`): the `SpendLedger` on `World` as a rolling per-colour count of the pair's own shots, hashed and read as a pure function of `world.beat`, which is the reusable the page says THE MOTHER has been waiting for; a crest as wide as the field growing eleven blades, each one edged in the colour the pair has been leaning on over the last `SPEND_BEATS` beats and shorn off **only by the colour it is not** — the game's one inverted colour rule, which the wave's guide says out loud rather than leaving discoverable; the soft crest, the fan noticing a lean and re-edging, the interlock, and THE SLOW on the beat a blade's colour crystallises. Worked and written up as [bosses](bosses.md) §11.25 (wave 75, THE TASTER), with four departures argued there — chief of them that the design's step 7 rock throw is **dropped**, because a taster that sent its own bodies would be a boss feeding the ledger it then reads. **The look is the open lane**: nothing of the fan is drawn yet, so every one of its twelve events is on the two silent lists, and the boss has never been watched at tempo |
| [§8 THE SINEW](#8-the-sinew--how-hard-not-when) | **taken, 17 September 2026** | `claude/boss-implementation-e3cfff` — the tendon and the sum (the simulation), then the fibres (the look), landed separately. Chosen as the first scalar the pair has ever had to say to each other, on `balloon-pull.ts`'s handles |
| the other five | free | — |

**THE SLOW is shipped, and the next boss does not have to build it.** It was
THE DIASTOLE's lane that needed it first, so it was built there rather than
as a primitive of its own, but nothing about it is that boss's: it is
`packages/sim/src/slow.ts` (`openSlow`, `slowing`, `slowRateMilli`, two hashed
`World` fields) and one line of `apps/game/src/loop.ts`, which now asks for
the length of a tick once a frame instead of computing it once at the start.
Any concept on this page that says *slow motion* calls `openSlow(world, beats)`
from its own step and is finished — see [THE SLOW and THE DRAG are two
different tools](#the-slow-and-the-drag-are-two-different-tools) for which of
the two a given beat wants, and `docs/decisions.md` #33 for the ruling.

Three things the DIASTOLE lane decided against this page's own text, which a
later concept should not read as still open:

- **A boss on this page is fed by its wave, not by itself.** §7's design had
  the boss spawning its own rocks in a late phase; it ships with
  `bossFillsWave === false` (THE VANE's family), so `act-7c.ts` writes the
  arrivals and the boss only ever answers shots. A concept that truly needs to
  spawn should say so and say why the wave author cannot.
- **Coprime means coprime all the way down.** §7 wanted the left chamber to
  shift from every 3 beats to every 4 at its second phase; 4 against 5
  coincides every 20 beats, which contradicts the design's own headline of a
  window every 15. The shift was dropped rather than the headline.
- **The input delay is still counted in ticks, not in slowed ticks.** A window
  two or four beats wide does not care. A concept whose window is a *moment* —
  one beat or less — inside a slow span has to re-derive it first; that is
  queued, not solved.

And two the THROAT lane decided, which are about **where a moving part lives**
rather than about one boss:

- **A place a boss moves to is an anchor and a function of the beat, never a
  stored position stepped once a beat.** `throatMouthCol(cfg, b, beat)` is the
  shipped shape and `sim/throat.ts` argues it: a stored column has to be
  stepped by *something*, and whatever steps it sits on one side of `onBeat`
  while the bodies that read it sit on the other. Worse, every one of these
  concepts hands one seat a readout of *where the thing will be*, and a stepper
  cannot answer a question about a beat that has not happened. `crossField` is
  still the right call for a body walking its own row; it is the wrong call for
  a part of a boss both screens are reading against.
- **A gesture already means one thing, and a concept may not quietly give it a
  second.** §1's step 12 asks for a hand held on a gum to *brake* it, "THE
  GRIP, unchanged" — but a hand on a gum is already the fling
  (`handMeans` calls it a pull), so that would have changed THE GUM rather than
  left it unchanged. The phase inhales every beat instead. A concept that wants
  a shipped control to mean something new has to say so plainly and price it.

A Way Out is the odd reference on the shelf. Spaceteam and Lovers both hand
two people a machine and let them fail at it; A Way Out hands two people a
**scene** and asks them to perform it. There is no health, no aiming and
almost no failure. What it has instead is the thing the owner asked for: every
ten seconds the picture changes, and the change is something the two of you
did on purpose, in an order somebody wrote down.

That is a real gap in this game. Every boss built here is a **loop** — a
cadence the pair learns and then executes until the body runs out. The Queen
blooms every so many beats forever; THE WARDEN cycles; THE MIRROR asks round
after round of the same question. None of them has a **second act**. A pair
who has beaten the Queen once has seen everything she will ever do, and the
remaining four minutes are execution. Nothing on this page is about making a
boss harder; all of it is about making a boss *go somewhere*.

## The four things the engine says back to the brief

**1. There is no shared screen, but sight may be shared per wave.** The brief
says "the game is played on ONE shared game screen" and the sheet draws both
players' hulls side by side in one frame. That is a different game: two
devices, two views, and talking as the control scheme
([roles](roles.md), `CLAUDE.md`). The owner settled the useful half of this
the same day the brief arrived:

> so in this case, its ok that for some waves or enemies, both can see the
> same, but players might require different actions or do the same action
> together at the same time, or one after another.

So a concept here may show both seats the same field. That is not a new
permission — it is what THE CLAW already does, and [controls](controls.md)
says why in as many words: *"Both seats see everything here. A per-pod 'which
seat is shown this' field was built and then cut, on the owner's word… The
split on this panel is in the hands rather than in the eyes."* The rule this
page works to is therefore: **every boss splits something, and it may split
the hands instead of the eyes.** What is still forbidden is a single frame
containing both hulls, and a gesture that needs to see the other thumb land.

**2. A boss has no health bar, ever.** Every card on the sheet carries a
`BOSS HP` meter across its top. [transfers-bosses](transfers-bosses.md#the-filter-on-top-of-the-other-five)
already forbids it: *"Its health is its silhouette. Petals, plates, a pupil
that ends up permanently wide. No bar, ever."* Each concept below therefore
says what part of its outline goes away, and how many there are.

**3. Slow motion is allowed, it slows the beat, and it is a change to one line
of the loop.** This page first said it could not exist, on
[transfers](transfers.md#the-filter)'s old filter line. The owner overruled
that on 16 September 2026 and supplied the condition that makes the refusal
wrong — *"it doesn't matter if it is in sync or not. Just what matters that
both animations in slow mode start and end at the same time for both players
when visible to both"* — and the ruling, with the mechanism and its two costs,
is `docs/decisions.md` #33. The short version, because the rest of this page
depends on it:

- **What was actually forbidden was a tempo *bend*, not a slow.** The wall this
  game has is not the tempo, it is the tempo being **shared**. A symmetric slow
  is still shared: the pair counts beats, both of them count the same ones, and
  a beat three times longer in wall clock means the 0.5–2 s voice delay covers
  *fewer* beats than usual. **Talking gets easier inside a slow window.** That
  is the opposite of what The Conductor (30) was deferred for.
- **It changes `tickMs` and never `ticksPerBeat`.** `apps/game/src/loop.ts`
  holds the only wall clock in the stack — *"Wall-clock time exists here and
  nowhere below: the simulation only ever hears 'one tick has passed'"* — and
  `startLoop`'s one-off `const tickMs = 1000 / tickHz` becomes a lookup against
  the window's rate. Ticks per beat is simulation and is untouched, so a
  creature still falls exactly as far per beat as it always did.
- **Desync is impossible by construction.** The same integer steps run on the
  same tick numbers, so `hashWorld` cannot tell a slow window from an ordinary
  one. The owner's *start and end together* is satisfied by the window's
  **boundaries** being a hashed field of `World`; only the wall-clock rate
  inside it is local, and two phones 200 ms apart stay 200 ms apart.
- **The metronome slows with it, for free**, because `packages/audio` binds
  cues to simulation events rather than to a wall-clock schedule — and a
  slowing click is the loudest possible signal that a window has opened.
- **Two costs, named in #33**: judder, because at a third of the rate frames
  start outnumbering ticks, which is exactly what the already-written
  `interpolatedBeatPhase` fixes; and the input delay, which is counted in ticks
  and would triple in felt milliseconds at the very moment the drama peaks
  unless it is re-derived against the rate.

### THE SLOW and THE DRAG are two different tools

The ruling leaves the game with **two** ways to make something take longer, and
a concept that reaches for the wrong one gets either drama it did not want or a
mechanic it did not earn. They are not substitutes and every entry below says
which it is using.

**THE SLOW** — the beat's wall-clock rate, for a named span of beats, both
devices. It is **presentation**: the same ticks, the same integers, the same
fingerprint, played back slower. It buys **wall-clock time**, which is why it
is what makes a called one-beat window playable — a 900 ms call inside a
third-rate window has 2.7 s to arrive. It changes no mechanic and costs the
simulation nothing.

**THE DRAG** — a body moving at a fraction of its rate, in beats. It is
**mechanics**: `sim/grip.ts` scaling `grippedFallTiles`, and `slowStep` in
`slow-fall.ts` as the per-kind version. It buys **beats**, which is a different
currency — a body that takes three beats to cross a row is a body the pair has
three beats to answer, and the fingerprint records every one of them.

| Concept | Uses | For what |
|---|---|---|
| 1 THE THROAT | **both** | DRAG on the inhale — three beats a row is three beats for a braking hand. SLOW on a flung gum's last row |
| 2 THE ORRERY | SLOW | a one-beat alignment across a voice delay. The rings keep their integer cadences, which is why this is the better tool |
| 3 THE GORGE | SLOW | the beads rising as an intake goes full — the only warning before a one-beat pierce |
| 4 THE TASTER | SLOW | a blade's colour crystallising: the beat the last conversation is judged |
| 5 THE LEDGER | SLOW | the bead's last beat down the cord |
| 6 THE CURTAIN | SLOW | the shove, and the fabric thinning under two hands |
| 7 THE DIASTOLE | SLOW | the coincidence beat, both chambers open, the beam standing |
| 8 THE SINEW | **both** | SLOW on the fibres parting. DRAG on the final fall — four beats a row is what makes walking it sideways possible |
| 9 THE SURGE | SLOW | the last beat before a notch, which is what makes a one-beat mutual lift fair |
| 10 THE BATON | **DRAG** | the bead genuinely takes three beats between sockets. A permanent SLOW here would be the brief's own refusal — *"do NOT turn the entire game into permanent slow motion"* |
| 11 THE LEAD | SLOW | the bolt's last row: the brief's suspended projectile, literally |
| 12 THE ANTIPHON | neither | the organ turning under a hand is a rotation, not a time effect |
| 13 THE UNDERTOW | SLOW | the hull plate bowing and parting |
| 14 THE CANDLE | SLOW + `AfterImage` | the decaying lit frame is a render buffer; SLOW lengthens the look at it |
| 15 THE SCUTTLE | **DRAG** | three beats of a part hanging by a thread is the window it is shot in |

**Where each earns its keep.** Four of the fifteen want DRAG and eleven want
SLOW, and the four are the ones where the extra time is the *mechanic* — a hand
to arrive, a body to walk sideways, a turn to take, a part to hit while it is
still attached. Everywhere else the pair does not need more beats, it needs
more seconds inside the beat it already has, and that is free.

**4. Red and cyan are ammunition and cannot mean anything else.** The brief
proposes `PURPLE = P1 interaction, BLUE/CYAN = P2 interaction`. Cyan already
means *shoot me with cyan* and red means *shoot me with red*
(`colour-armour.ts`), violet is the ship's own body, and rock grey is armour.
A cyan ring meaning "player 2's thumb goes here" would collide with the one
colour statement the whole game is built on. The language every concept below
uses instead:

| | Means |
|---|---|
| red / cyan | ammunition colour — the only colours that say *shoot this* |
| rock grey | armour: a shot does nothing |
| violet | the ship, and anything of the ship's |
| white | neutral, and the only colour a target lock is drawn in |
| **geometry, not colour** | which seat a handle belongs to |

That last row is the working rule, and it is shipped: THE BALLOON's two
handles are the pilot's and the navigator's, and what says so is that one
hangs off the **left** and one off the **right** — not a colour. THE CHOIR's
two arrows are the same trick against the two walls. **A seat is a side.**

**And one more, smaller.** The brief asks for windows of "1.2 seconds" and
"1.5s". A window for an action the acting player can **see for themselves** may
be that tight. A window for an action that has to be **called across the voice
delay** may not: `guardWindowMs` is 900 ms and
[roles](roles.md#the-raster-model) says exactly why — *"hearing the column,
finding it and pressing is three actions across a voice delay, and 600 ms only
ever fitted two of them."* Every table below marks a window **seen** or
**called**, and no called window is under 900 ms.

## What A Way Out actually does, and what of it survives the trip

| Mechanism | Here already as | Verdict |
|---|---|---|
| An authored beat list; the scene will not advance until the beat is performed | nothing — every boss is a loop | **the whole of this page.** `BossSequenceStep` |
| The two players are given different jobs in the same beat | all three [couplings](couplings.md) | built, and better here |
| A prompt with a shrinking ring | the ready gate's two circles, `queen-drop.ts`'s filling bar | built, reusable as-is |
| Time dilation on the dramatic action | `loop.ts`'s `tickMs`; THE GRIP and `slowStep` for the other kind | **arrives as THE SLOW**, per correction 3 and `decisions.md` #33 |
| A split screen that reframes, zooms and re-composes per beat | nothing; the window is [not the stage](../decisions.md) (#14) | **refused.** Two portrait phones have no second pane to give |
| Alternating turns — one acts, the other watches | nothing does this on purpose | **THE BATON**, below |
| Simultaneous button press on a shared count | [couplings](couplings.md) 1, and SYNC in `balance.ts` | built; worth spending at boss scale |
| Failure rewinds to the last beat, and the scene continues | `wave-fail.ts` — a hit loses the whole wave | **THE STEP BACK**, below, and it is new machinery |
| No enemies, no health, no aiming | the opposite of this game | refused, obviously |
| Cutscene dialogue carrying the plot between beats | the pair's own voices, and nothing else | refused — nothing may be written for them to read aloud |

The fifth row is worth dwelling on because it is the reference game's signature
and it is simply unavailable. A Way Out's camera is the co-op device: it splits,
un-splits, follows one brother and abandons the other. This game's two frames
are two phones in two hands, and `decisions.md` #14 already settled that the
window is not the stage. What replaces a camera move here is what
`render/` already has — the whole-screen shake THE CHOIR's arrow starts, the
tip-over THE MIRROR does on a wrong step, `hull-shock.ts`, `breach-strike.ts`.
**Presentation is the hull's reaction, not the frame's.** Every `Presentation`
line below obeys that.

## The filter these fifteen had to pass

[transfers](transfers.md#the-filter)'s five, then
[transfers-bosses](transfers-bosses.md#the-filter-on-top-of-the-other-five)'s
three — a fourth boss asks a fourth question, a boss holds a row or is a
fixture, its health is its silhouette — and then two this page adds, both of
which killed drafts:

9. **A step is a `Command` or it does not exist.** A gesture that is not in
   `DragTarget` or `Hold["kind"]` is not a control, it is a wish
   (`sim/drag-targets.ts`, `render/touch-hold.ts`). Every concept below names
   the union member it needs, and any state it keeps is a field of `World` and
   therefore in `hashWorld` (`decisions.md` #23).
10. **The sequence is authored, and the author is `content/`.** The brief's
    central rule — *the player should not decide "maybe I should pull this
    now"* — lands here as a data shape, not a behaviour: a boss's beat list is
    written in `packages/content` next to the waves, the way `scene-script.ts`
    already writes a guide's steps, and `sim/` reads it by index. That is the
    same discipline `queue` and `podQueue` get under `decisions.md` #23: the
    script is an input, `spawned` is the cursor, and the cursor is hashed.

One thing the brief asks for is refused outright by an existing design, and it
is worth saying so rather than pretending the conflict away. *"Authored
sequence, not player choice"* is the brief's loudest rule, and
[THE TITHE](transfers-bosses.md#the-tithe--it-always-takes-something-you-choose-what)
is a worked boss whose entire content is a choice made under a clock, three
demands and two hands. Both are good. They are not the same boss and neither
should be built as the other: a choreographed boss is a scene, a tithe is a
sentence about what you are willing to lose. This page builds the first kind.

## The fifteen

Each is a **question no shipped boss asks**, because that is filter 8 and it
is the one that killed the most drafts. Template throughout: the question, the
silhouette and what part of it is the health, the mechanic, the two seats, the
beat list, where THE SLOW or THE DRAG falls, what the hull does instead of a
camera, the
colour statement, the payoff, the cost, and what of it is reusable.

In every beat list, a **seen** window is one the acting seat can judge from
their own frame; a **called** window is one that has to cross the voice delay,
and none of those is under 900 ms (`guardWindowMs`, and the reason is in
[roles](roles.md#the-raster-model)).

---

### 1. THE THROAT — what you feed it

> **Simulation built, 16 September 2026**, on
> `claude/neon-spore-boss-design-26ee5e`, and written up as
> [bosses.md](bosses.md) §11.19 — which is the record of what shipped and
> where it departs from the text below. **The gullet is not drawn yet**: the
> boss plays and is invisible, and the look is the same lane's next piece. Do
> not start either half in a second session — see [who is building
> what](#who-is-building-what-so-two-sessions-do-not-collide).
>
> **Built whole** as of 17 September 2026, in three pieces: the simulation, the
> gullet, and then NEXT INHALE with the eversion. §11.19 is the record.
>
> Three things below are not built, and §11.19 says why for each: the throat
> does not compete with the maw for a **pod** (queued); a hand cannot **brake a
> gum** out of the pull, because a hand on a gum is already the fling; and the
> **inhale is the climb** — one clock rather than a six-beat clock plus a
> three-beat drag, so player 2's *beats until the next inhale* is the deadline
> the pull is measured in.

> The one where its mouth and your maw are the same organ, facing each other.

**Question.** *What you put in on purpose.* Every boss in this game is
answered by taking something away from it. This one is answered by giving it
something, and the pair's own habit — clear the field, shoot the hazard — is
what feeds it.

**Silhouette.** A gullet hanging from the top of the field down a third of it:
five ring muscles stacked and narrowing, each one a closed contour with the
next drawn inside it, ending in a lipped mouth exactly one column wide. No
eyes, no limbs, no face — the whole body is a tube, and the only part of it
that moves laterally is the mouth, which slides along its own row. **Health is
the five rings:** a choked ring goes slack, loses its tension and hangs limp
inside the tube for the rest of the fight, and a tube of five slack rings
cannot swallow.

**Mechanic.** Two clocks and one gesture. *Its* clock: every six beats the
throat inhales its own column, and anything standing there climbs a row a
beat until the mouth takes it. A creature swallowed re-tightens one slack ring
— so the throat repairs itself out of the wave's own arrivals, and a pair who
lets the field run is fighting a boss that heals. *Their* gesture: **THE GUM,
flung**. A gum falls straight down a lane, cannot be shot, is not stopped by
the shield, and carried `gumSwipeMilli` sideways it leaves its lane and flies
level along its row at `gumFlingCols` a beat (`sim/gum.ts`). Flung along the
mouth's row, into the mouth, it chokes a ring. Nothing else on the body can be
hurt at all.

The whole fight is therefore an arithmetic sentence said out loud: a gum falls
a row a beat, the mouth steps a column a beat, and a fling crosses
`gumFlingCols` a beat. *Which beat do I let go?*

**Player 1 — pilot.** Sees the gums coming (a hazard is his radar) and owns the
fling, because the row the gum is on when the thumb lifts is the line it flies
along. He also owns the maw, and the maw is the only thing that answers a pod
the throat would otherwise take.

**Player 2 — navigator.** Sees the mouth: a target lock with a filling bar under
it, `queen-drop.ts`'s exact picture, saying which column the mouth will be in
and how many beats until the next inhale. She sees no gums at all. She holds
both colours, which is the only answer to the creatures the throat is trying to
eat.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **P1 — the mouth stands still** ||||||
| 1 | The tube descends into frame, rings contracting in sequence top to bottom; the mouth opens over the middle column | — | — | — | — | — |
| 2 | One gum enters at the top, one lane off the mouth's column | P1 | swipe the gum toward the mouth | 3 beats, seen | the gum leaves its lane level | it reaches the hull and splashes across the ship |
| 3 | The gum crosses the field level; the mouth's lip flares | — | — | — | ring 1 chokes and goes slack | the gum leaves at the wall |
| 4 | The throat inhales its own empty column, and the sound of it is the tell for the whole fight | — | — | — | nothing there to take | — |
| **P2 — the mouth slides, and the field fills** ||||||
| 5 | The mouth begins stepping a column a beat, turning at the walls; two creatures arrive | P2 | call the mouth's column and the beats to the inhale | 900 ms, called | P1 has a number to swipe against | the gum flies at nothing |
| 6 | A gum and a creature in the air together | P1 | swipe the gum; leave the creature | 3 beats, seen | ring 2 chokes | — |
| 7 | The inhale takes the creature P1 left alone | P2 | fire its colour before the inhale beat | 2 beats, called | the creature is gone and the throat gets nothing | a slack ring re-tightens, and the fight is longer than it was |
| **P3 — two gums, two rows** ||||||
| 8 | Two gums enter on different rows, and only one row meets the mouth | P1 | pick the row and swipe it; let the other hit the hull | 2 beats, seen | ring 3 chokes; the hull takes one gum on purpose | both gums reach the hull |
| 9 | The inhale cadence tightens from six beats to four; the mouth steps two columns a beat | — | — | — | — | — |
| 10 | A gum and a pod arrive in the same lane; the throat wants the pod | P1+P2 | she shoots the pod loose, he opens the maw under it and then swipes the gum | `intakeWindowMs`, called | ring 4 chokes and the pod is aboard | the throat eats the pod and two rings re-tighten |
| **P4 — the tube cannot close** ||||||
| 11 | Four rings slack. The tube can no longer hold its own shape and sags into a curve across the field | — | — | — | — | — |
| 12 | It inhales continuously rather than on a clock, and the pull reaches the ship: every gum on the field is dragged toward the mouth without being flung | P1 | hold a hand on one gum to brake it (THE GRIP, unchanged) | as long as the hand stays | the gum stays out of the mouth | it is swallowed and a ring re-tightens |
| 13 | The last ring, and the mouth is wide open and no longer sliding | P1+P2 | he flings the gum he has been holding; she lances the column behind it | 4 beats, called | — | — |
| 14 | **The throat everts.** With five slack rings and a full inhale it pulls itself through its own mouth — the tube turning inside out from the top down, ring by ring, each one appearing on the outside of the last, and what was the inside of the boss is drawn for the first time as it goes | — | — | — | — | — |

**THE DRAG, then THE SLOW**, and this is the concept that shows most plainly
why they are two tools. **The inhale is a DRAG**: everything in the throat's
column takes three beats to climb a row instead of one, and those are real
beats — a braking hand has three chances to arrive rather than one, and the
fingerprint records every one of them. **The fling is a SLOW**: the gum's level
flight is already the best shot in the fight, so the beat it crosses its last
row is played at a third rate with its trail drawn full length. Nothing about
the flight changes; the pair simply gets to watch it.

**Presentation.** No camera. The inhale is the **hull** answering: `ship-air.ts`
pulled toward the top of the frame, the ship's own nerves drawn taut, and a
single low shudder through `hull-shock.ts` on the beat the mouth closes. A
choked ring is a whole-frame dim for one beat — the tube going dark from that
ring down — and nothing else.

**Animation.** The rings contract in a travelling wave top to bottom, one ring
a beat, which is the thing that makes the six-beat clock readable without a
number. The mouth's lip flares a beat before it takes anything. A slack ring
stops joining the wave, so the wave visibly gets shorter as the fight goes on
— the health, the clock and the picture are one drawing.

**Colour.** The tube is rock grey, because no shot may touch it. The rings'
inner faces are violet — the ship's own colour, which is the joke: it is made
of what it eats. A gum keeps the gum's own colour. The mouth's target lock is
white. **No red and no cyan anywhere on the body**, which is the honest
statement that the cannon is not the answer here.

**Payoff.** Step 14. The eversion is the whole reason to build it: a closed
contour turning through its own opening is something no creature in this game
does, and it is `blobPath` run inside-out with the ring order reversed.

**Cost. Medium.** The gum, the grip, the maw, the pod intake and the target
lock are all shipped; the fling into a *target* is one new hit test. What is
new is the eversion (a render job, and a real one) and `ThroatState`'s five
ring tensions.

**Reusable.** `FeedTarget` — a place on a boss that accepts a body rather than
a shot. `InhaleColumn` — a column that moves bodies up instead of down, which
is THE WELL's projection arithmetic pointed the other way.

---

### 2. THE ORRERY — whether you can agree on when

> The one where three rings turn at three speeds and neither of you can see
> all three.

**Question.** *Whether you can agree on a beat you are each half-blind to.*
The Queen asks *which column*; this asks *which beat*, and it makes the answer
uncomputable from either seat alone.

**Silhouette.** A core two columns wide, held in three concentric rings of
orbiting organs — eight in the outer, six in the middle, five in the inner,
coprime on purpose. Each ring has exactly one gap. The rings are drawn as
beaded arcs rather than solid circles, so a gap is a gap in a *rhythm* and
reads at 26 px. **Health is the rings:** a ring fired through breaks at the
gap, and its organs drift off the orbit and fall as ordinary rocks. Three
rings, three hits, and the core is never touched until all three are open.

**Mechanic.** Each ring steps one organ a beat, the outer clockwise, the middle
anticlockwise, the inner clockwise. The core is exposed only on a beat all
three gaps stand over one column. **The outer ring is drawn true on both
screens. The middle is true only on player 1's and the inner only on player
2's** — on the other screen each is drawn as an unbroken grey arc with no gap
at all. So neither seat can predict the alignment, and the prediction is the
fight.

**And player 1 can turn the outer ring by hand.** A drag on its resting circle
reports a **bearing** in thousandths of a turn, exactly as `crank` does
(`sim/crank.ts`, `sim/drag-targets.ts`), and the ring follows the thumb. That
is THE MAZE's string at boss scale, and it is what turns an arithmetic problem
into a physical one: the alignment can be *brought forward* rather than waited
for.

**Player 1 — pilot.** Sees the middle ring true. Turns the outer ring. Holds the
cannon column and the trigger.

**Player 2 — navigator.** Sees the inner ring true. Holds both colours, and the
core's colour is the one thing about the core either of them can see.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **P1 — one ring, and it is drawn true on both screens** ||||||
| 1 | The orrery unfolds into frame, rings starting from rest one at a time, outer first | — | — | — | — | — |
| 2 | Only the outer ring turns. Its gap crosses the field once every eight beats | P2 | call the column the gap will stand over | 900 ms, called | — | — |
| 3 | The gap stands over a column | P1 | cannon in that column | 1 beat, called | — | the ring steps on |
| 4 | Through the gap, the core is visible for one beat | P2 | fire the core's colour | 1 beat, seen | the outer ring breaks; eight organs drift loose and fall as rocks | nothing; the gap moves on |
| **P2 — the middle ring, and neither of you has the whole picture** ||||||
| 5 | The middle ring spins up anticlockwise. On player 2's screen it is a solid grey arc | P1 | read his gap's column and its direction aloud | 900 ms, called | she can cross it against her own | she is firing at armour |
| 6 | Two gaps approach alignment | P1+P2 | he holds the column; she waits | 2 beats, called | — | — |
| 7 | Two gaps align for one beat | P2 | fire | 1 beat, seen | the middle ring breaks | the rings part and the next alignment is eleven beats off |
| **P3 — three rings, and the hand on the outer one** ||||||
| 8 | The inner ring spins up. Three rings, two gaps hidden per seat, alignment every fifteen beats at best | — | — | — | — | — |
| 9 | The core begins firing down whichever column its own gap faces, a rock a cycle | P1 | slide the shield's column call to her; she stands the plate | `guardWindowMs`, called | the rock is warded | a scar, and the orrery sinks a row |
| 10 | Two gaps aligned, the outer ring's gap four organs away | P1 | **drag the outer ring** to bring its gap over the column | 3 beats, seen | three gaps over one column | the drag overshoots and the alignment is gone |
| 11 | Three gaps, one column, and the shaft all the way to the core is open | P2 | fire | 1 beat, seen | the inner ring breaks; the core is naked | the shaft closes |
| **P4 — the naked core** ||||||
| 12 | The core hangs in the wreck of three orbits, and every organ that ever drifted loose is still falling through the frame | P2 | **hold** a colour | `lancePrimeBeats`, called | the cannon lobe fills | a lift fires one ordinary bolt and the fill is gone |
| 13 | Player 1 must keep the cannon still for the whole fill, in a column full of falling debris | P1 | do nothing, precisely | `lancePrimeBeats`, called | — | the fill drops to nothing |
| 14 | **The beam stands in the column** for `lanceBeamBeats`, burning through the core and every loose organ in the shaft at once | — | — | — | the orrery goes out from the centre outward | — |

**THE SLOW.** One place, and it is the whole design: **the beat the gaps align
is played at a third rate.** Organs trail behind their own arcs, the shaft
through the body opens visibly, and a 900 ms call has 2.7 s to arrive. This is
the concept that proves THE SLOW has to exist before any of these can be built
— a one-beat alignment across a voice delay is otherwise a coin toss. And it is
the clearest case for SLOW over DRAG: three rings on coprime integer cadences
are the entire boss, and stretching the *rings* would break the arithmetic the
pair has been doing. Stretching the **second** breaks nothing.

**Presentation.** The alignment beat brightens the *shaft* rather than the
screen: a corridor of light straight down through three rings to the core, drawn
by `light-shafts.ts`, which is a picture no other boss in this game can make
because no other boss is hollow. A broken ring is `shatter.ts` along one arc.

**Animation.** Three rings at three rates, and the beaded arcs make each rate a
visible rhythm rather than a speed. A hand on the outer ring drags it with
resistance and it keeps a little of the thumb's motion after the lift, which is
what makes the overshoot in step 10 a real failure rather than an unfair one.

**Colour.** Rings rock grey, organs violet. The core carries the ammunition
colour and is the only red or cyan thing in the frame — so the whole fight is
grey machinery around one coloured statement, and the alignment is literally the
pair opening a line of sight to the only colour on screen.

**Payoff.** Step 14: the lance standing in a shaft through three broken orbits,
with the debris of twenty organs falling through the beam.

**Cost. High.** Three ring states, three per-seat visibility masks, a new
bearing-drag target, and an `Effects`-side shaft. The visibility mask is the
expensive part: `render/` has to draw the same ring two ways and
`queen-split.test.ts`'s pattern has to hold both halves shut.

**Reusable.** `PerSeatTruth` — the same body drawn true on one screen and
armoured on the other, generalised out of the Queen's two marks.
`BearingDrag` — `crank`'s thousandths-of-a-turn, on the field rather than the
panel. `AlignmentWindow` — a beat computed from several independent cadences,
which THE DIASTOLE needs too.

---

### 3. THE GORGE — what not to do

> The one that eats your shots, and the only way to hurt it is to overfeed
> exactly one part of it.

**Question.** *What not to do.* Not one boss in this game has ever asked the
pair to stop shooting. This one makes the pair's deepest habit — answer
everything with the cannon — into the failure state, and the correct play is
eleven beats of deliberate restraint.

**Silhouette.** A wide soft mass across the top of the field, seven columns of
it, translucent: a lobed sack with a puckered **intake** drawn under each
column. Inside, the shots it has swallowed hang suspended as red and cyan
beads, visible through the skin, so the boss's state is legible at a glance from
either seat. **Health runs backwards, which is the point:** it starts small and
the pair must keep it small. An intake holding four beads is **full**, goes
transparent, and is the only part of the body a shot can hurt. Pierce a full
intake and that lobe ruptures permanently and hangs open.

**Mechanic.** Every bullet that does not hit a creature is swallowed by the
intake in its column and becomes a bead. That is the whole rule. A pair that
fires freely spreads one bead across seven intakes and fills none of them,
while the sack swells and sinks a row for every four beads it holds. A pair that
fires *into one column on purpose* fills an intake in four shots — and then has
one beat to pierce it, because a full intake **vents** after four beats and the
vent is a torch out of it, the fastest thing in the field.

So the sentence is: *stop shooting, except at column four.*

**Player 1 — pilot.** Holds the cannon still on the chosen column for four shots
in a row, which means the field is answered with the shield and the maw and
nothing else for as long as the fill takes. He is the one shown each intake's
bead count (a violet tally under each lobe, on his screen only).

**Player 2 — navigator.** Fires, and must fire *nothing* at the arrivals. She is
shown which lobe is nearest full, and the colour it will need — and the colours
matter, because an intake fills only on beads of one colour and a wrong-colour
bead **empties it by one**.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **P1 — one intake, an empty field** ||||||
| 1 | The sack drifts down into the top of the frame and settles, seven intakes puckering in turn | — | — | — | — | — |
| 2 | Nothing else is on the field. One intake glows faintly | P2 | four shots of one colour, same column | 8 beats, called | four beads rise into the lobe | a wrong colour takes a bead back out |
| 3 | The lobe goes transparent and swells | P2 | one more shot, same column | 4 beats, seen | **the lobe ruptures** | it vents a torch down that column |
| 4 | If it vented: a torch falls at the torch's own speed | P1+P2 | she stands the plate, he triggers | `guardWindowMs`, called | warded | a scar, and the sack sinks a row |
| **P2 — the field comes back, and the cannon is the wrong answer** ||||||
| 5 | Creatures begin arriving, two a cycle, in the colours the pair is not filling with | P2 | **do not fire at them** | — | the fill survives | every reflex shot is a bead in the wrong intake |
| 6 | A rock among them | P1+P2 | ward it — the shield is the answer now, not the cannon | `guardWindowMs`, called | warded | a scar |
| 7 | A creature reaches the hull because nobody shot it | — | — | — | — | a breach, and it is the *correct* play: the sack is what kills them |
| 8 | Second lobe full | P2 | pierce | 4 beats, seen | second rupture | a second vent |
| **P3 — it feeds itself** ||||||
| 9 | The sack begins **spitting beads back**: a swallowed bead returned down its own column as a bolt of that colour, which only the opposite colour can out-shoot | P2 | fire the opposite colour into it | 2 beats, seen | both bolts go | it reaches the hull |
| 10 | Two intakes at three beads and the arrivals at four a cycle | P1 | hold the column against everything the field is asking for | 6 beats, called | the third fills | — |
| 11 | Third rupture, and the sack can no longer hold its shape: it sags into a curtain across five columns | P2 | pierce | 4 beats, seen | — | — |
| **P4 — everything it ever swallowed** ||||||
| 12 | Four ruptured lobes hanging open. The remaining three intakes fill *by themselves* off the sack's own spat beads | — | — | — | — | — |
| 13 | The last intake goes transparent with every bead the boss has ever held in it at once — dozens, stacked up the lobe | P2 | **hold** a colour; player 1 keeps the column | `lancePrimeBeats`, called | the lobe fills past transparent | the fill drops and the lobe vents everything |
| 14 | **The beam stands in the column.** The sack ruptures along its whole width and every bead it ever swallowed leaves at once, in the colour it was fired in, straight up through the top of the frame and gone | — | — | — | — | — |

**THE SLOW.** One place, and it is the beat an intake goes full: **the four
beads rise through the lobe at a third rate**, the skin going transparent
around them as they climb. That is the tell for the one-beat pierce window and
the only warning the pair gets — and it has to be a SLOW rather than a DRAG,
because an intake that took three beats to fill would be three beats the pair
could spend not firing, which is the one thing this boss must never hand
them.

**Presentation.** A swallowed bolt is answered by the **sack**, not the screen:
the intake puckers and the bead visibly enters, which is a small picture that
happens dozens of times and teaches the rule without a word. A rupture is
`body-hit-rupture.ts` at a size nothing has asked for yet.

**Animation.** The sack breathes on the beat, the whole seven columns of it
rising and falling a third of a tile — which is `Milli` work and the only place
a boss this wide can afford it. Beads drift inside it with a lag, so the body
looks full of fluid.

**Colour.** The sack is violet-grey and translucent. Every red and cyan in the
frame is **the pair's own ammunition, inside the enemy** — which is the whole
statement of the boss, and it means the colour language does no new work at all.

**Payoff.** Step 14. Fifty beads leaving at once in two colours is the loudest
frame on this page and costs one `sprite-burst.ts` pass.

**Cost. Medium.** Bead counts per intake are seven integers. The rupture and the
translucent lobe are render jobs. Nothing new is needed in `touch.ts` at all —
this is the one concept on the page that adds **no gesture**, and it is the
cheapest of the fifteen for that reason.

**Reusable.** `AbsorbColumn` — a column that takes bullets rather than stopping
them, which is `bullet-refused.ts` with a consequence. `RestraintGate` — a
step that is passed by *not* sending a command for N beats, and the one thing on
this page the input layer has never had to express.

---

### 4. THE TASTER — what you have already spent

> The one that grows its armour in whichever colour you have been leaning on.

**Question.** *What you have already spent.* Every other boss is answered inside
its own cycle. This one is answered by how the pair played the **last thirty
beats**, which makes it the first boss in the game with a memory of the pair
rather than of itself.

**Silhouette.** A low, broad, crested body — wider than tall, hugging its row —
with a fan of eleven blades along its back, one per column, each standing up
out of the crest. A blade is armour grey along its body and carries a single
bright line of ammunition colour down its **edge**: the colour it has grown
toward. **Health is the fan.** A blade struck off is gone and the crest under
it is soft; the fan visibly thins from wherever the pair has been working, so
the silhouette records the pair's own colour habits as a shape.

**Mechanic.** It counts the pair's shots over a rolling thirty beats and grows
its next blade in the **majority** colour — and a blade is only struck off by
the colour it is **not**. That is the whole rule, it is fixed and learnable and
announced a full cycle ahead, which is what
[11.1](bosses.md#111-the-mother--reactive-but-announced) demands of any boss
that reacts to the pair at all. It never reacts to *how well* they played, only
to *what* they spent — the other condition from the same section.

The trap is automatic. A pair that finds cyan working uses cyan, and the boss
answers with cyan blades that only red can take, and by the time they need red
their last thirty beats are cyan. **The correct play is to spend the colour you
do not need**, which no shipped wave has ever rewarded.

**Player 1 — pilot.** He is the only one shown the **tally**: a violet ledger
along the hull's inner edge on his screen alone, two bars, thirty beats deep,
sliding. He holds no colour and can change the count by nothing he does — the
one who can see the number cannot move it.

**Player 2 — navigator.** She holds both colours and therefore owns the count
entirely, and sees nothing of it. Her screen shows only the blades: which are
standing and what each one's edge is. So the pair's sentence is the flat
opposite of a warding call — not "column four" but **"you're nine red to four,
give me cyan for the next eight."**

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **P1 — one blade at a time, and the rule stated in the picture** ||||||
| 1 | It rises along its row, crest first, and the fan opens blade by blade from the middle outward | — | — | — | — | — |
| 2 | One blade stands, edged red. Nothing else on the field | P2 | fire cyan at it | 2 beats, seen | the blade shears off | a red shot **thickens** it: the edge widens and it now needs two cyan |
| 3 | The crest under the gap is soft and visibly wet | P1 | cannon into the gap | 1 beat, called | — | — |
| 4 | The next blade grows out of the crest over four beats, and its colour sets on the fourth | P1 | read the tally and call the next eight beats' colour | 900 ms, called | the blade grows in the colour they are *not* about to need, and it is therefore free | it grows in the colour they have been using, and it is now expensive |
| **P2 — the fan, and a field that decides the tally for them** ||||||
| 5 | Three blades standing, and creatures arriving in one colour only | P2 | answer the field, which loads the tally | 6 beats, seen | the field is clear | — |
| 6 | The fan grows three blades in that same colour at once | P1 | call the trade: spend the other colour on nothing | 900 ms, called | the tally turns over inside six beats | the fan is a wall in the colour they have |
| 7 | A blade at the edge of the fan sweeps down and throws a rock | P1+P2 | ward it | `guardWindowMs`, called | warded | a scar |
| 8 | Two blades shear in two beats when the tally has been managed | P2 | two shots, alternating colour | 2 beats, seen | two blades | — |
| **P3 — it tastes faster** ||||||
| 9 | The rolling window shortens from thirty beats to twelve, so the fan now answers the last four shots rather than the last ten | — | — | — | — | — |
| 10 | Every blade the pair leaves standing re-edges itself to the current majority each cycle | P2 | shear a blade in the beat after its edge sets and before it re-sets | 2 beats, seen | a blade | the fan is uniform again |
| 11 | The crest lifts, showing the soft body under the whole fan | P1 | cannon along it, column by column, on his own | 4 beats, seen | the crest is cut and the fan cannot re-edge | — |
| **P4 — the colour it has never tasted** ||||||
| 12 | Two blades left, and the fan **closes over the body** like a hand — the two blades meeting over the crest and interlocking | — | — | — | — | — |
| 13 | The interlocked pair is edged in both colours at once, and neither single shot touches it | P2 | **hold** the colour the tally says she has spent least of, all fight | `lancePrimeBeats`, called | the lobe fills in the one colour the boss has never grown toward | the fill drops, and the closed fan is proof against everything they have |
| 14 | **The beam stands in the column.** The interlock parts, the whole fan unlocks outward at once like a flower opening backwards, and the soft body under it is drawn for the first and last time | — | — | — | — | — |

**THE SLOW.** The beat a blade's colour **sets**: the edge crystallises at a
third rate, the colour running up the blade from the root to the tip, and both
seats watch it happen. That is the tell, the warning and the drama in one
picture, and it is the moment the pair learns whether their last conversation
worked.

**Presentation.** The hull's own light answers the tally: on player 1's screen
the ledger bar brightens as it slides, `hull-light.ts` doing the work, so the
number he has to read aloud is already the brightest thing in his frame. A
sheared blade is `break-piece.ts` and a whole-frame shudder for one beat.

**Animation.** The fan is the animation: eleven blades that rise, lean, sweep
and interlock, and one long travelling shiver along the crest whenever the
majority colour flips — a visible "it noticed."

**Colour.** This is the one boss where red and cyan are doing a *second* job
without ambiguity, because the second job is the same as the first: a blade's
edge says which colour it is vulnerable to, inverted. The rule the pair learns
in four seconds is **"shoot the other one"**, and it is the only inversion in
the game, which is why one boss may have it and no wave may.

**Payoff.** Step 14. A fan of eleven blades unlocking outward in one beat is a
silhouette event, which is the only kind of payoff this game's health rule
permits.

**Cost. Low to medium.** Two counters and a window. Everything else — blades as
armour, colour vulnerability, the lance — is shipped. The expensive part is
honest teaching: an inverted colour rule needs its own guide screen
(`.claude/skills/new-tutorial`), and it is the first mechanic in the game that
would be **wrong** to leave discoverable.

**Reusable.** `SpendLedger` — a rolling per-colour count of the pair's own
commands, hashed, which is the machinery THE MOTHER (11.1) has been waiting for
and never got. `InvertedWeakPoint` — a body vulnerable to the colour it is not.

---

### 5. THE LEDGER — whose body takes it

> The one where every wound you give it arrives on your own hull four beats
> later, and you can see it coming down the cord.

**Question.** *Whose body takes it.* The whole game so far has one direction of
damage: the field hurts the ship. This inverts the consequence without
inverting the control — you still shoot it, it still dies, and the bill is
posted to you.

**Silhouette.** A tall, narrow, bilaterally split body high in the field,
tethered to the ship by a single thick **violet cord** running from its
underside down into a socket in the hull. The cord is not decoration: it is the
mechanism, it is drawn full length, and it is the only thing in the game that
touches both bodies. **Health is the split:** the seam down its middle widens
with each hit and at five the two halves part company entirely.

**Mechanic.** A landed shot takes its share of the seam and sends the same
damage **back down the cord**, arriving in the socket's column four beats
later, `damageGauge`-sized. The guard window intercepts it: the plate in the
socket column, the trigger on the arrival beat — [warding](couplings.md#1-warding--built),
unchanged, against the pair's own shot.

So the fight has a forced order and it is the brief's own diagram, built out of
shipped parts: **act → consequence → answer the consequence → act again.** The
pair always knows exactly when the return lands, because they fired it.

**And the socket moves.** Each return roots the cord one column further along
the hull, so the column to be warded is different every time and the pair is
re-learning the same sentence with a new number every four beats.

**Player 1 — pilot.** Fires nothing and decides everything: the cannon's column
is where the shot goes, and the trigger is the only thing that saves the hull
from it. He is the one shown the **cord's charge** travelling — a bead of violet
light descending the cord on his screen alone.

**Player 2 — navigator.** Owns the shot and the plate, which means she causes the
return and positions against it, and she is the only one shown **where the
socket has moved to**. His clock, her column: warding with the two halves
swapped from every other wave in the game, which is the coupling read from the
other side.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **P1 — one shot, one return** ||||||
| 1 | It descends, the cord paying out of its underside and rooting itself into the hull with a visible shock through the ship | — | — | — | — | — |
| 2 | The seam down its middle glows in one colour | P2 | fire that colour | 2 beats, seen | the seam widens; **a bead of light starts down the cord** | nothing |
| 3 | The bead descends the cord, four beats, in plain sight | P2 | call the socket's column | 900 ms, called | he knows where | he is guarding nothing |
| 4 | The bead reaches the hull | P1 | trigger, in the socket's column | `guardWindowMs`, called | the return is warded and the cord whips | a scar in the socket column, and the cord **roots deeper** — next return comes in three beats, not four |
| 5 | The cord's root slides one column along the hull | — | — | — | — | — |
| **P2 — two shots in the air, two returns on the cord** ||||||
| 6 | She fires again before the first return lands | P2 | fire | 2 beats, seen | two beads on the cord, three beats apart | — |
| 7 | Two returns, two columns, two trigger beats | P1 | trigger twice, on the three and on the six | `guardWindowMs` each, called | both warded | one scar, and the cadence tightens again |
| 8 | Arrivals begin — and every creature shot is **also** a return, because the cord bills for everything the cannon does | P2 | choose what to shoot at all | 6 beats, called | the field is answered and the hull survives it | the cord is carrying four beads and the hull cannot be in four columns |
| **P3 — the cord is full** ||||||
| 9 | The seam is wide and the body is visibly two bodies held together by the cord | — | — | — | — | — |
| 10 | Each half now fires on its own, down its own column, and a warded return **is** the answer to them: the whipped cord throws the return back up | P1 | trigger on the return, aimed rather than defensive | `guardWindowMs`, called | the return goes back up the cord and widens the seam with no bill | a scar, and both halves fire |
| 11 | The cord is carrying beads in both directions | P1+P2 | he times the whip, she keeps the plate in the root column | 3 beats, called | — | — |
| **P4 — the bill they choose to pay** ||||||
| 12 | The seam at four of five. The cord is taut enough to be drawn as a straight line for the first time | — | — | — | — | — |
| 13 | She fires the fifth, and the script does not ask for a ward. **Both seats are shown the bead coming and neither is asked to stop it** | — | — | — | — | — |
| 14 | **The return lands.** The hull takes the worst scar of the fight — and the cord, taut, tears out of the ship and takes the boss's entire underside with it, the two halves finally parting, still joined to a length of the pair's own hull plating | — | — | — | — | — |

**THE SLOW.** The bead's **last beat before it lands**, at a third rate: the
cord's strain pattern brightening up its whole length, the socket opening, the
plate's edge visible against it. Deliberately not a DRAG — the four beats down
the cord are the clock this whole fight is timed against, and buying the pair a
fifth would be giving back the debt the boss exists to collect. That is the brief's shrinking-ring prompt done as
anatomy — a clock that is a body part.

**Presentation.** Every beat of this fight is presented by the **hull**, which
is the correct answer to the brief's camera section and the thing this concept
exists to prove. `hull-shock.ts` on the rooting, `craters.ts` and `scars.ts`
where a return lands, `ship-nerves.ts` lit along the cord's line, and
`lost-blood.ts`'s bleed if the hull gets low. No frame moves; the ship reacts.

**Animation.** The cord: paying out, rooting, sliding its socket, going taut,
whipping, and finally tearing. One drawn object carrying the entire fight is the
cheapest spectacular thing on this page — `tether-sinew.ts` and
`tether-twist.ts` are already the right code.

**Colour.** The cord and its beads are **violet**, because the damage travelling
it is the ship's own, and that single colour choice is the boss's whole
statement. The seam carries the ammunition colour. The socket's target lock is
white.

**Payoff.** Step 14: a deliberate, scripted, unwarded hit that wins the fight. A
pair that has spent the last ten minutes learning that a scar is a failure gets
told, once, to take one.

**Cost. Medium.** The return is a delayed event with a column and a beat — the
queue machinery already does exactly this shape. The cord is drawing. `LedgerState`
is a short list of beads with a beat and a column each, and it is hashed.

**Reusable.** `DelayedConsequence` — a command's effect arriving N beats later
at a named column, which is the single most reusable primitive on this page and
is what makes any *act → reaction → act* choreography possible at all.
`WardableReturn` — the guard window pointed at something the pair caused.

---

### 6. THE CURTAIN — what it is standing in front of

> The one where the boss is not the threat; it is the thing hiding the threat,
> and you shove it aside a column at a time.

**Question.** *What it is standing in front of.* Nothing in this game occludes.
Every creature is drawn where it is and answered where it is drawn. A boss whose
only property is that it is **in the way** asks the pair a question about the
field rather than about itself.

**Silhouette.** A broad membrane stretched across seven columns high in the
field, hung from a rail at the top, semi-opaque, with weighted lobes along its
lower hem — a curtain, drawn as one long slack contour with a bead of mass in
each lobe. Behind it, and only ever as a shadow through the fabric, the **core**:
a small hard body that fires down its own column. **Health is the hem.** A lobe
shot off lightens the curtain and lets it be shoved further per push; a curtain
with no lobes left cannot hold its rail.

**Mechanic.** THE PUSH at boss scale, and the shipped rule is the whole
coupling. A hand held on the membrane and carried a tile sideways moves the
**whole curtain** one column, then it stands still for `gripPushPauseBeats`
before it can be carried again — and **two hands pulling opposite ways cancel
and the body holds** ([assists](assists.md) 6.5, built). So both seats have a
hand on the same object, and the curtain does not move until the two of them
have agreed on a direction out loud. It is the first boss in the game that is
answered by a single shared word: *left.*

Behind it the core fires down whichever column it stands in. Shoving the curtain
does not move the core — it **uncovers** it, and only an uncovered core can be
shot.

**Player 1 — pilot.** Sees the hem's lobes lit for the shot — which lobes are
soft this cycle — and holds the cannon and the trigger. His half of the sentence
is *which side comes away*.

**Player 2 — navigator.** Sees the core's shadow through the fabric, and nothing
of the lobes. Her half is *which way, and how far*. Both push.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **P1 — one direction, one word** ||||||
| 1 | The curtain unrolls down its rail across seven columns, the hem's lobes swinging to rest one after another | — | — | — | — | — |
| 2 | A shadow moves behind the fabric and stops | P2 | call the side it is on | 900 ms, called | he knows which way to pull | — |
| 3 | Both hands on the membrane | P1+P2 | both grab and carry the same way | 3 beats, called | the curtain steps one column | pulling opposite ways **holds** it, and a held curtain sags a row |
| 4 | The core's shadow is now at the curtain's edge, half-uncovered | P1 | cannon into its column | 1 beat, called | — | — |
| 5 | The core, uncovered, in plain sight on both screens | P2 | fire its colour | 2 beats, seen | the core takes one; the curtain's nearest lobe drops off with it | the core fires down its column |
| **P2 — the core fires, and a hand on the curtain is a hand off the shield** ||||||
| 6 | The core fires a rock down its own column | P1+P2 | ward it — which needs both hands off the membrane | `guardWindowMs`, called | warded | a scar, and the curtain re-rolls one column back |
| 7 | The curtain re-rolls itself a column toward covered every four beats if nobody is holding it | P1+P2 | push against the roll on the beat | 4 beats, called | held ground | it is fully covering again |
| 8 | Two lobes soft at once, on opposite ends | P1 | shoot the one on the side they do not want to push toward | 2 beats, seen | that end is light and pushes at double | he shoots the wrong end and the curtain is heavy the way they need it |
| **P3 — two shadows** ||||||
| 9 | A second shadow behind the fabric, and only one of them is the core | P2 | call which of two, by how it moves — the core drifts, the decoy hangs | 900 ms, called | — | they uncover a decoy and the core fires from cover |
| 10 | The curtain is now three columns of fabric and four of open air | P1+P2 | push, ward, shoot, in that order, every cycle | 6 beats, called | the core takes its third | — |
| 11 | The core begins firing **through** the fabric, which tears a hole where it fires — and a hole is a sight line the pair did not have to earn | — | — | — | — | — |
| **P4 — the sheet** ||||||
| 12 | The hem is bare. The curtain hangs from its rail by two corners | P1+P2 | one last shove, all the way to the wall | 3 beats, called | — | — |
| 13 | **It tears off the rail.** The whole membrane falls across the field as a sheet, drifting down over four beats, the core's light coming through it as it goes | — | — | — | — | — |
| 14 | The core stands naked in the middle of an empty field and fires continuously for four beats with nothing between it and the hull | P1+P2 | her plate, his trigger, then everything the cannon has | 4 beats, called | the core goes | the hull takes four rocks in four beats |

**THE SLOW.** The **shove**, played at a third rate: the membrane stretching
against its rail, the fabric thinning where the hands are, and the
shadow behind sharpening as it thins. That is the brief's "objects stretching
through space", and it costs the simulation one `Milli` field.

**Presentation.** The push is answered in the **fabric**, which is the thing the
brief's "shield impact distortion" was reaching for and this game can actually
draw: `veil-tear.ts`, `veil-strata.ts` and `band-slime.ts` are already the right
code. The tear-off in step 13 is the only four-beat event on this page with no
input in it, and it earns the silence.

**Animation.** The hem swings with a lag behind the push and overshoots on the
stop — one spring, eleven lobes, and it is what makes a seven-column object feel
heavy. The re-roll is the same motion reversed and slower, so a pair losing
ground can see themselves losing it.

**Colour.** The membrane is violet-grey and translucent; the core is the only
ammunition colour in the frame and it is dimmed by the fabric in front of it, so
"is it red or cyan" is genuinely hard while it is covered and trivial once it is
not. That is the colour language doing the occlusion work for free.

**Payoff.** Step 13, and it is the most *movie* frame on the page: a sheet the
width of the field coming down over four beats with a light behind it.

**Cost. Medium.** THE PUSH, the cancel rule and the grip are shipped; what is
new is a push that moves a seven-column object rather than a one-tile body, and
occlusion — `render/` has no z-order concept for "drawn dimmer behind a
membrane" and would need one.

**Reusable.** `SharedPush` — one object, two hands, agreement required, which is
the cancel rule promoted from an assist to a mechanic. `Occluder` — a body that
changes what the other bodies look like, which nothing in this renderer does
yet and several ideas in [ideas](ideas.md) want.

---

### 7. THE DIASTOLE — two clocks at once

> **Built, 16 September 2026**, on `claude/neon-spore-boss-design-26ee5e`: the
> simulation, THE SLOW with it, and then the look. What shipped and the three
> places it argues with the design below are [bosses](bosses.md) §11.17 — read
> that rather than this if you are changing it. The page keeps this section
> because the *question* it asks is the reason the boss exists.

> The one with two hearts on two cadences, one each, and the fight is the beat
> they coincide.

**Question.** *Whether the two of you can hold two different times at once.*
The beat is the pair's shared ground and every mechanic in the game hangs off
it. This is the only way to make the beat hard without bending it — which is
what **The Conductor (30) was deferred for**, and this is the safe version of
that ask.

**Silhouette.** A twin-lobed body one row from the top: two chambers side by
side, one column apart, with a bridge of vessels drawn between them. Each
chamber visibly pulses on its own cadence, so the silhouette is *two rhythms* —
and a rhythm is the one thing a contour can carry without colour. **Health is
two chambers.** A stopped chamber collapses inward and stays collapsed, and the
second one is much harder than the first because there is no longer a second
rhythm to count the first against.

**Mechanic.** The left chamber contracts every **3** beats, the right every
**5**. A chamber is vulnerable only on its own contraction. Each seat is shown
only their own chamber's pulse — player 1 the left, player 2 the right, and
**geometry says whose**, the way THE BALLOON's handles do. On the other screen
the far chamber is drawn as a still grey mass.

The kill takes both at once, which happens every **15 beats**, and the pair has
to count to it from two different numbers neither of them can both see. And the
weapon is already built for exactly this: **the lance beam burns a column and
stands in it for `lanceBeamBeats`** — so a beam standing in the *bridge* column
on the coincidence beat takes both chambers. The fill takes `lancePrimeBeats`
and player 1 must keep the cannon still for all of it, which means the hold
starts a fixed number of beats **before** the coincidence, off a count neither
of them owns alone.

**Player 1 — pilot.** The left chamber's pulse, the bridge column, and a cannon
that must not move. His job is arithmetic and then stillness.

**Player 2 — navigator.** The right chamber's pulse, and the thumb that must go
down at the right beat and not come off. [Couplings](couplings.md) 2 calls this
*a coupling of two silences*, and this boss is the one that asks for it against
two clocks.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **P1 — one chamber, one cadence** ||||||
| 1 | The body descends and settles; the left chamber starts beating, three beats, and the right is still | — | — | — | — | — |
| 2 | The left contracts | P1 | call the beat, counting in threes | 900 ms, called | she has the count | — |
| 3 | A contraction | P2 | fire the left chamber's colour into its column | 1 beat, called | the left takes one of three | nothing |
| 4 | Three contractions taken. The left chamber slows to **four** beats — the cadence moves once per phase, so the count is re-learned rather than memorised | — | — | — | — | — |
| **P2 — two cadences, and only the bridge takes both** ||||||
| 5 | The right chamber starts, five beats, drawn true only on her screen | P2 | call her cadence | 900 ms, called | both counts are on the table | — |
| 6 | Single-chamber hits no longer land: each contraction now closes the *other* chamber's window | P1+P2 | find the coincidence beat by talking | 15 beats, called | — | they burn a cycle |
| 7 | Coincidence in `lancePrimeBeats` + 1 | P2 | **thumb down** on a colour | 900 ms, called | the cannon lobe starts filling | a lift fires one bolt and the fill is gone |
| 8 | The fill climbs while both chambers beat | P1 | keep the cannon in the bridge column, still | `lancePrimeBeats`, seen | the fill reaches the top on the coincidence beat | a slide drops the fill to nothing |
| 9 | **Both chambers contract on the same beat and the beam stands in the bridge** | — | — | — | the left chamber stops and collapses | the beam burns one chamber's column and takes one |
| **P3 — one heart, no counter-rhythm** ||||||
| 10 | The left chamber is a collapsed hollow. The right beats alone, and with nothing to count against it the pair has only the metronome | — | — | — | — | — |
| 11 | The right chamber's cadence goes to **7**, and it throws a rock on every beat it does *not* contract | P1+P2 | ward on the off-beats, which are the beats they are also counting | `guardWindowMs`, called | warded | a scar, and the cadence shifts by one |
| 12 | The bridge, with one end dead, begins pumping into the field: a slick out of the collapsed chamber every seven beats | P2 | shoot it, which costs the count | 3 beats, seen | clear | it reaches the hull |
| **P4 — the bridge** ||||||
| 13 | The right chamber contracts one last time and the pair takes it, and both chambers are now dead ends | P1+P2 | the fill again, against one clock this time | `lancePrimeBeats`, called | — | — |
| 14 | **The bridge bursts along its whole length.** With nothing pumping at either end it fills, distends vessel by vessel from both ends toward the middle over four beats, and splits open in the middle column | — | — | — | — | — |

**THE SLOW.** The **coincidence beat**, at a third rate, both chambers at full
contraction while the beam stands in the bridge. A DRAG here would be
self-defeating: the two cadences *are* the boss, and 3 against 5 stops meaning
anything the moment a beat is worth a different number of tiles. The two rhythms that have
been fighting each other all fight stop at the same instant, and that stillness
is the payoff of the count.

**Presentation.** The two chambers pulse the **hull's own light** on their own
screens — `hull-light.ts` breathing at three beats on his phone and five on
hers, so each seat *feels* their own cadence through the ship rather than
reading it. That is the single best idea on this page and it costs one existing
render call.

**Animation.** Contraction: the chamber's contour drawn in, the bridge's vessels
swelling as the fluid goes across, the far chamber bulging a beat later. One
pump, drawn twice at two rates, and the whole boss animates itself off two
integers.

**Colour.** The chambers each carry one ammunition colour and they are **not the
same one**, which is what makes the bridge column the only answer: neither
colour takes both, and the beam takes everything of the colour it is in — so the
pair has to work out that the beam in the bridge reaches both bodies because it
burns a column, not a body. Violet vessels.

**Payoff.** Step 14. A vessel bundle filling from both ends and splitting in the
middle is `gland-fluid.ts` and `gland-tube.ts` at a size they have not been
asked for.

**Cost. Low.** Two integers, two visibility masks and the shipped lance. This is
the cheapest *hard* boss on the page: almost nothing is new code and all of the
difficulty is in the pair's heads.

**Reusable.** `CoprimeCadence` — two clocks and the beat they meet, which is
`AlignmentWindow` from THE ORRERY arrived at from the other direction; they
should be one primitive. `PerSeatPulse` — a cadence expressed through the hull's
light rather than through a number.

---

### 8. THE SINEW — how hard, not when

> The one where the answer is a magnitude, and neither of you can see the whole
> gauge.

**Question.** *How hard.* Every sentence this pair has ever said to each other
is a **column** or a **beat**. Not one is a *quantity*. This boss asks for
"more", "less" and "hold it there", which is a vocabulary the game has never
made them build.

**Silhouette.** One thick fibrous tendon from the top of the field, and a heavy
lobed mass hanging off the bottom of it. The tendon is drawn as a bundle of
visible fibres with a **strain band** round its middle that brightens and
narrows the harder it is pulled. **Health is the fibres:** each one parted is
drawn parted, the bundle visibly thins, and the mass hangs a row lower for every
fibre gone — so the boss gets closer as it dies, the Queen's rule, for the
opposite reason.

**Mechanic.** A handle on each side of the tendon, `sinewLeft` and `sinewRight`,
one per seat — THE BALLOON's arrangement (`sim/balloon-pull.ts`) with the
question changed. A balloon asks for **taut and held**; this asks for a **pull
depth**, and the two seats' depths **add**. The strain band shows a target zone
a few tenths of a tile wide, and a fibre parts only while the sum sits inside
it. Over-pull and the fibre does not part — it **snaps back**, the mass swings,
and a rock comes out of it into a column.

Each seat is shown only **their own half of the band**. So neither can read the
sum, and the only way to find the zone is for one to hold still while the other
talks themselves into it: *"I'm at half. Come up a little. Little more. Stop."*

**Player 1 — pilot.** The left handle, and a cannon he is not using. He is shown
the zone's **position** and not the current sum.

**Player 2 — navigator.** The right handle. She is shown the current **sum** and
not where the zone is. So the one who knows where to go cannot see where they
are, and the one who can see where they are does not know where to go — which is
the information split at its cleanest, and the first time it has been applied to
a scalar.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **P1 — one fibre, a wide zone** ||||||
| 1 | The tendon lowers the mass into frame; the fibres draw taut one at a time with the mass settling between each | — | — | — | — | — |
| 2 | Both handles hang slack, and the strain band is dark | P1+P2 | both take hold | 3 beats, seen | the band lights | — |
| 3 | The band, half on each screen | P1 | call where the zone is | 900 ms, called | she has a target | she is pulling blind |
| 4 | The sum climbs as two thumbs move | P2 | call her number while pulling | continuous, called | the sum enters the zone | it goes past and **snaps back**: the mass swings and throws a rock |
| 5 | Sum in the zone | P1+P2 | both **hold**, `balloonHoldBeats` | 4 beats, seen | one fibre parts; the mass drops a row | a thumb slackens and the hold is given back |
| **P2 — the zone moves, and the field asks for a hand** ||||||
| 6 | The zone slides along the band each cycle | P1 | re-call it | 900 ms, called | — | — |
| 7 | Creatures arrive while both hands are on the tendon | P2 | let go, shoot, take hold again | 6 beats, called | the field is clear and the pull restarts from slack | the pull is kept and the field reaches the hull |
| 8 | The mass, a row lower, is now close enough that its own lobes reach the field's middle rows | P1 | third fibre | 5 beats, called | — | — |
| **P3 — the zone narrows and the tendon fights back** ||||||
| 9 | The zone is a third as wide; the band's brightness is the only feedback | P1+P2 | fine adjustment, spoken | 6 beats, called | fourth fibre | — |
| 10 | The tendon begins **pulling back**: the sum decays toward slack every beat, so a hold is now work rather than stillness | P1+P2 | both pull *into* the decay to keep the sum steady | continuous, called | fifth fibre | the sum falls out of the zone downward, which is new — the failure used to only be too much |
| 11 | A snap-back at this height throws the rock from two rows up, and the ward window is half what it was | P1+P2 | ward | `guardWindowMs`, called | warded | a scar |
| **P4 — the swing** ||||||
| 12 | One fibre left. The mass hangs four rows above the hull and the zone is a sliver at the very top of the band | — | — | — | — | — |
| 13 | The last pull needs more than either seat can reach alone, and the script says so: both handles to their limit, both held | P1+P2 | pull to the stop and hold | 6 beats, called | the last fibre parts | a snap-back at full strain throws three rocks |
| 14 | **The mass comes down — and which column it lands in is the last thing they say to each other.** With the fibre gone it swings on the stub of its own tendon, and the pair keeps pulling to one side as it falls, walking a body the width of three columns away from the middle of their own hull | P1+P2 | keep pulling, one direction, agreed | 4 beats, called | it lands at the wall | it lands on the hull they have been defending for ten minutes |

**THE SLOW, then THE DRAG.** The moment the sum **enters the zone** is a SLOW:
the fibres go half-transparent and part one at a time at a third rate, each
with its own snap, so a success is a small sequence rather than an event. Step
14 is a **DRAG** and has to be — a mass this size takes four real beats to
cross a row, and those four beats are what makes walking it sideways possible
at all. Wall-clock seconds would not do: the pair needs *turns*.

**Presentation.** The strain band **is** the prompt, which is what the brief
asked for in its timing section: the clock is anatomy, it is on the body, and it
is half-drawn on each phone. On a snap-back, `hull-shock.ts` and a full-frame
white flash for one beat.

**Animation.** The tendon: fibres that individually go taut, thin, transparent
and part; the mass swinging with real lag and overshoot; and the whole bundle
shortening visibly as the fight goes on. `tether-sinew.ts` and
`tether-twist.ts` again, and this is the concept they were written for.

**Colour.** No ammunition colour anywhere. The tendon is violet-grey, the strain
band is **white** — neutral, the objective — and the mass is rock grey because
no shot ever touches it. The one boss on this page that the cannon cannot hurt at
all, and its colour says so honestly from the first frame.

**Payoff.** Step 14. Two people talking a three-column mass away from their own
hull, in a game where neither of them can move anything, is the best argument on
this page that the no-travel rule is a feature.

**Cost. Medium.** The handles, the two-seat pull, the hold and the taut
threshold are shipped in `balloon-pull.ts`. What is new is that the pull is a
**sum against a zone** rather than a threshold each, the decay in step 10, and
the swing — and the swing is the expensive one, because a body walked sideways
while falling is motion no `slowStep` branch expresses.

**Reusable.** `PulledMagnitude` — two seats' drag depths summed against a
window, which is the first scalar coupling in the game. `SplitGauge` — a
quantity whose value is on one screen and whose target is on the other.

---

### 9. THE SURGE — whether you can stop

> The one where holding is free and letting go is the entire skill, and you
> both have to let go together.

**Question.** *Whether you can stop.* Every hold in this game is rewarded for
lasting: the grip, the lance's fill, the ready gate, the warden's tether. This
one punishes the last beat of a hold that went one beat too long, which inverts
the most practised gesture in the pair's hands.

**Silhouette.** A bulb high in the field, ribbed, with a **pressure seam** running
right round its equator. It swells while hands are on it and the seam parts
wider the more it is charged, so the silhouette is a single number drawn as a
gap. **Health is the seam:** a successful vent leaves the seam open one notch
permanently, and five notches is a bulb that cannot hold pressure at all.

**Mechanic.** A hand anywhere on the body charges it. **Both seats' charges
add**, and the sum is drawn as the swell. Along the seam are notch marks; a
release with the sum standing at a notch **vents**, and the notch stays. A
release past it **bursts**: a spray of gum across the whole ship — the shipped
splash, the hull takes it, no scar (`sim/gum.ts`). A release short of it does
nothing at all and the charge is lost.

And the two releases must be **within one beat of each other**. That is the
brief's simultaneous action, and it is the only mechanic on this page where the
required input is a *lift* rather than a press.

**Player 1 — pilot.** Shown the **notch marks** and not the pressure. He is the
one who says "now", which is the word [couplings](couplings.md) says can never
work — except that here it is said against the beat: *"let go on the four."*

**Player 2 — navigator.** Shown the **pressure** and not the notches. She reads
the number and he owns the target, which is THE SINEW's split at a different
verb, on purpose: the two should be built together or one of them should not be
built.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **P1 — one notch, and a bulb that only they can inflate** ||||||
| 1 | The bulb descends, deflated and slack, its seam shut and invisible | — | — | — | — | — |
| 2 | Both hands go on it and it starts to swell | P1+P2 | hold | continuous, seen | the seam appears and parts | — |
| 3 | The swell climbs; the first notch is near | P1 | call the release beat | 900 ms, called | she has a beat | she guesses |
| 4 | Pressure at the notch | P1+P2 | **both lift, within one beat** | 1 beat, called | it vents: a jet of violet out of the seam, and the notch stays | past the notch it **bursts** and the ship is covered |
| 5 | One seat lifts and the other does not | — | — | — | — | the charge holds on one hand and climbs alone toward the burst — the failure is a **partner** problem, not a timing one |
| **P2 — two notches, and a field that needs a hand** ||||||
| 6 | The seam's notches are now two, and only the further one counts | P1 | re-call | 900 ms, called | — | — |
| 7 | A rock falls while both hands are on the bulb | P1+P2 | let go early on purpose, ward, take hold again | `guardWindowMs`, called | warded, charge lost, nobody hurt | held through it: a scar, and the bulb is still charging |
| 8 | The bulb's swell now pushes it **down** the field a row per notch, so it is closer every time | — | — | — | — | — |
| **P3 — it charges itself** ||||||
| 9 | With no hands on it the bulb now **holds** its charge instead of decaying, and the field's arrivals add to it: a creature that reaches the bulb is absorbed and is worth a notch of pressure | P2 | shoot the arrivals before they reach it | 4 beats, called | the pressure is theirs to control | it charges past the notch on its own and bursts |
| 10 | Three notches open. The seam is wide enough to see into, and what is inside is drawn: a second, smaller bulb | — | — | — | — | — |
| 11 | The release window narrows to the beat, and the pressure climbs at double | P1+P2 | lift together | 1 beat, called | fourth notch | a burst, and a notch **closes** |
| **P4 — the eversion** ||||||
| 12 | Four notches. The bulb is a cage of ribs round a visible inner body and can barely hold shape | — | — | — | — | — |
| 13 | The last notch sits at the very top of the gauge, one tick under the burst, and there is no margin at all | P1+P2 | charge to the limit and lift on the same beat | 1 beat, called | — | a burst covers the ship and the bulb re-seals a notch |
| 14 | **It everts.** With the seam fully open and no pressure left to hold it, the bulb turns itself inside out through its own equator over five beats — ribs passing through the seam one at a time — and the inner body it has been growing is left standing in the field, naked, deflated and drawn for the first time | — | — | — | — | — |

**THE SLOW.** The **last beat before a notch**, at a third rate: the seam's rim
stretches, the skin goes translucent, and the notch line creeps toward the
pressure mark. That is the release window made visible as tissue, and it is one
of the two clearest cases on this page for THE SLOW — *"let go on the four"* is
a word that has to cross a voice delay and land on a single beat, and it is
only fair if that beat is three seconds long.

**Presentation.** A burst is presented on the **ship**: `gum-splash.ts` across
the whole hull, `splash-blob.ts` and `splash-trail.ts`, and the frame stays
smeared for several beats — a failure the pair has to keep playing through and
looking at. A vent is a clean jet and one bright beat.

**Animation.** The swell, and the seam. A ribbed body inflating is `throb.ts`
and `throb-pores.ts` with a real number behind it; the eversion in step 14 is
THE THROAT's eversion at a different axis, which is the argument for building
one of them and then the other.

**Colour.** No ammunition colour on the body at all; violet skin, white notch
marks, and the pressure mark is white too. The **inner** body revealed at step
10 carries a colour, and that is the promise the last two phases run on.

**Payoff.** Step 14, and then the inner body is a second, smaller encounter the
pair has been watching grow for ten minutes.

**Cost. Medium.** The two-seat hold and the sum are `balloon-pull.ts`. The lift
as a required input needs `touchUp` to be a **command** rather than the end of
one, which `touch.ts` can already say honestly for a colour thumb
(`world.prime`) and cannot yet for a field hold — that is the real work.

**Reusable.** `ReleaseWindow` — a step passed by lifting, not pressing.
`MutualRelease` — two lifts within N beats. `ChargeSum` — shared with THE SINEW.

---

### 10. THE BATON — whose turn is it

> The one where acting locks you out of the next beat, so the two of you have
> to become a metronome.

**Question.** *Whose turn is it.* Nothing in this game has ever forbidden a seat
from acting. THE WARDEN takes a *control* away and THE MALFUNCTION swaps the
panels; neither says "not you, not this beat." Strict alternation is a new
constraint and it makes the pair into one instrument.

**Silhouette.** A segmented arm hanging from the top of the field, eleven
segments long, each one a **socket**, with a single bright bead standing in one
of them. The bead is passed hand to hand down the arm's own length. **Health is
the sockets:** a socket the bead has left and not returned to goes dark and
stays dark, and the arm withers from the top down, so the boss's remaining life
is literally the distance the bead still has to travel.

**Mechanic.** The bead is invulnerable while it sits in a socket and vulnerable
only while it is **moving** between two. It moves when acted on — and **the seat
that acts is dead for the next beat**: their panel greys, which is THE WARDEN's
and THE MALFUNCTION's shipped picture doing new work. So the bead can only be
kept moving by strict alternation, one seat a beat, and the alternation is the
whole boss.

The two seats' acts are deliberately **different verbs at the same cadence**:
player 1's is the trigger, player 2's is a shot. Neither can cover for the other
and neither can double up.

**Player 1 — pilot.** The trigger, on the odd beats. His panel greys on the
evens and he spends those beats reading the arm to her.

**Player 2 — navigator.** A shot, on the even beats. Her panel greys on the
odds. Both seats see the whole arm — this is the concept the owner's *"both can
see the same, players might require different actions… one after another"*
describes exactly, and the split is entirely in the hands.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **P1 — the alternation, taught by the picture** ||||||
| 1 | The arm unfolds downward, socket by socket, one a beat, and the bead lights in the topmost | — | — | — | — | — |
| 2 | The bead sits. Nothing can hurt it | P1 | trigger | 2 beats, seen | the bead leaves its socket and starts across | — |
| 3 | The bead is in flight between two sockets, and player 1's panel is grey | P2 | shoot it | 2 beats, seen | it takes a hit and lands in the next socket down | it lands untouched and the socket **relights** |
| 4 | Her panel greys; his comes back | P1 | trigger | 2 beats, seen | the bead moves again | the bead **settles**, and a settled bead goes back to the top socket |
| 5 | Four handovers in a row, alternating, at two beats each | P1+P2 | alternate | 8 beats, called | four sockets dark | — |
| **P2 — the cadence tightens and the field arrives** ||||||
| 6 | The handover goes to one beat each | P1+P2 | alternate at tempo | continuous, seen | — | one missed beat settles the bead |
| 7 | Creatures arrive, and answering one **is** the act — a shot at a creature is her turn spent | P2 | choose: the bead or the field | 4 beats, called | — | either the bead settles or the field lands |
| 8 | A rock: the ward needs *both* of them, and both of them are locked out on alternate beats | P1+P2 | she stands the plate on her beat, he triggers on his | `guardWindowMs`, called | warded — and it costs them the handover | a scar |
| **P3 — three sockets and a second bead** ||||||
| 9 | A **second bead** lights in the topmost socket, on its own alternation offset by one beat | P1+P2 | keep two beads moving on one alternation | continuous, called | — | either settles and the other is alone |
| 10 | The arm begins **swinging** across three columns, so the flight between sockets crosses a column and the cannon has to follow it | P1 | slide the cannon between his own turns, which are the only beats he can | continuous, seen | — | the shot is in the wrong column |
| 11 | The sockets the beads have darkened begin shedding: a dead segment drops off the arm and falls as a rock | P1+P2 | ward on the shared beat | `guardWindowMs`, called | warded | a scar |
| **P4 — the handover to the ship** ||||||
| 12 | Both beads in the last two sockets, the arm one segment long and hanging by a thread | — | — | — | — | — |
| 13 | The two beads merge into one, twice as bright, and the last flight is **eleven beats long** — the length of the whole arm in one crossing | P1+P2 | eleven alternating acts, no miss | 11 beats, called | the bead crosses | one miss and it goes back to the top of an arm that has grown its sockets back |
| 14 | **The arm hands the bead to the ship.** At the end of its flight the bead drops out of the last socket, falls, and is taken into the cannon lobe — and the shot that leaves is the arm's own, taking it off at every joint at once, eleven segments parting on one beat | P1 | open the maw under it | `intakeWindowMs`, called | — | — |

**THE DRAG**, and emphatically not THE SLOW. Every handover: **the bead's
flight between sockets takes three real beats.** That is what makes a one-beat
alternation legible, turns the whole fight into a visible rhythm, and gives a
called turn somewhere to arrive — without it the boss is a reaction test, which
filter 4 forbids. A SLOW cannot do this job, because the job lasts the whole
fight: slowing the beat for ten minutes is the brief's own refusal, *"do NOT
turn the entire game into permanent slow motion"*. The bead is slow; the clock
is not.

**Presentation.** The **grey panel** is the whole presentation and it is
shipped: `malfunction-look.ts` and `guard-lapse.ts` already draw a dead control.
A pair alternating at tempo watches their own band switch on and off like a
metronome, which is the picture the mechanic wants and costs nothing.

**Animation.** Eleven sockets, one bead, and a swing. The bead's flight arcs
rather than going straight, and it leaves a trail that the next flight crosses —
so the arm accumulates a visible history of its own handovers.

**Colour.** The arm is rock grey and the sockets violet. The bead carries the
ammunition colour and **changes colour on every handover**, alternating, which
is the single cheapest way to tell player 2 which colour her turn needs without
a word — and it means the colour language teaches the alternation for free.

**Payoff.** Step 14: the maw, which is the one thing player 1 finishes alone
([roles](roles.md)), used to end a fight whose whole content was that neither of
them could do anything alone.

**Cost. Low.** A lockout is a beat number per seat in `World`. The grey panel,
the maw, the target lock and the arm's segments are all shipped. This is the
cheapest concept on the page and the one most likely to be worth building first
as a **test of the whole idea** — if alternation is not fun, most of this page is
not either.

**Reusable.** `TurnLock` — a seat forbidden from sending commands for N beats,
which is THE WARDEN's clamp generalised from a control to a seat.
`Alternation` — a step list that requires the acting seat to change, and the
plainest possible `PlayerSpecificAction`.

---

### 11. THE LEAD — where it will be

> The one where you fire at where it is going, and only one of you knows which
> way that is.

**Question.** *Where it will be.* A shot in this game climbs its column tile by
tile (`sim/bullets.ts`) and every boss so far has held still long enough not to
care. This one makes the flight time the whole mechanic, and then splits the two
facts needed to solve it across two phones.

**Silhouette.** A long low body pacing its row — the Queen's motion, one column
a beat, turning at the walls — carrying its one vulnerable organ on a **stalk
that leans ahead of its travel**. The lean is the tell and it is geometry, not
colour: the silhouette itself says which way it is going. **Health is the stalk's
segments:** five, and each one shot off shortens the stalk, so the lean gets
smaller and harder to read exactly as the pair gets better at reading it.

**Mechanic.** The shot takes beats to arrive. The boss steps a column a beat. So
a shot fired at the boss's current column lands behind it, and the pair must fire
at **current column + direction × flight beats**. Neither seat has both terms:

- **Only player 1 sees the lean** — the direction — because the stalk is drawn
  leaning on his screen and drawn upright on hers.
- **Only player 2 sees the column** — the boss is an `aim` kind and the aim
  radar is hers ([roles](roles.md#the-raster-model), `radarOwner`).

So the arithmetic is unavailable to either of them and the sentence is *"column
six, going left, lead it two."*

**And THE LOCK is the tension.** A hand on a body steers every shot into it from
whatever column the cannon is in ([assists](assists.md) 6.6, built) — which
would solve this boss outright. It is refused, because `grippable.ts` refuses a
hand on a boss body and has always refused it, and **that refusal is the reason
this mechanic can exist at all.** It is the first concept in the game whose
design depends on an existing refusal rather than on an existing permission.

**Player 1 — pilot.** The lean, the cannon and the trigger. He is firing at a
column he cannot see the target in.

**Player 2 — navigator.** The column and both colours. She is calling a number
for a body whose direction she cannot see.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **P1 — a slow pace and a long lean** ||||||
| 1 | It enters at a wall and begins pacing, the stalk swinging to lean into the travel a beat after it starts | — | — | — | — | — |
| 2 | Pacing at one column a beat; the flight time is two beats | P2 | call the column | 900 ms, called | he has a number | — |
| 3 | The lean is drawn plainly on his screen | P1 | call the direction, and put the cannon two columns ahead | 900 ms, called | the cannon is where the stalk will be | it is where the stalk is, which is two beats wrong |
| 4 | The shot climbs | P2 | fire | 1 beat, called | the shot and the stalk arrive in the same tile; one segment goes | the shot passes behind it, and **it reverses** — the lean flips and the lead is now the other way |
| 5 | The reversal is the punishment and the lesson in one: a miss does not cost the hull, it costs the pair their model of the boss | — | — | — | — | — |
| **P2 — two columns a beat, and the field between them** ||||||
| 6 | The pace doubles to two columns a beat; the lead is four | P1+P2 | the same sentence with a bigger number | 4 beats, called | second segment | — |
| 7 | It begins dropping a torch off its trailing end — always behind it, so the hazard marks where it *has been* while the pair aims where it will be | P1+P2 | ward | `guardWindowMs`, called | warded | a scar |
| 8 | Rocks fall in the columns the pair must fire through, and a rock stops a shot | P1 | pick a firing column with a clear line, which is a third term in the sentence | 3 beats, called | third segment | the shot is eaten by a rock and the lead is wasted |
| **P3 — the lean lies, once** ||||||
| 9 | The stalk begins **leaning into a turn before it turns**, so the lean now predicts a reversal a beat ahead rather than reporting the current travel | P1 | read the lean as a forecast, not a report | 2 beats, called | fourth segment | — |
| 10 | The stalk is short and the lean is subtle, and it is the only information he has | P1 | describe a few degrees of angle out loud | 900 ms, called | — | — |
| 11 | It paces the full width and back in eight beats, and the flight time is now longer than a quarter of its circuit | P1+P2 | fire at a column it will reach from the other side | 6 beats, called | — | — |
| **P4 — the last pass** ||||||
| 12 | One segment. It stops dead in the middle of the field for four beats, the stalk upright, leaning nowhere — the only beats in the fight where it is honest and the only beats it is invulnerable | — | — | — | — | — |
| 13 | **It commits to one final full-width pass at three columns a beat**, and the stalk lays almost flat with the lean | P2 | **hold** a colour | `lancePrimeBeats`, called | the lobe fills | — |
| 14 | Player 1 must stand the cannon in the one column the boss will be in when the fill tops out — nine columns of lead, computed out loud from her number and his angle, and he cannot move the cannon after the hold starts or the fill drops | P1 | pick the column and do not move | `lancePrimeBeats`, called | **the beam stands there and it walks into it**; the stalk goes, the body follows, and the whole pass ends in one column | the beam burns an empty column and it reaches the wall |

**THE SLOW.** The beat a shot shares a row with the stalk, at a third rate,
with the bolt's full trail drawn. This is the page's literal delivery of the
brief's own ask — a projectile suspended in the air — and it must be a SLOW
rather than a DRAG for the reason the whole boss exists: the lead is computed
from the bolt's flight time in **beats**, so a bolt given extra beats is a bolt
the pair has to re-do their arithmetic for. Give them extra *seconds* to watch
the arithmetic they already did resolve.

**Presentation.** `target-lock.ts` on her screen, `dart-path.ts`'s existing
trail work on the bolt, and the reversal in step 4 is presented by the boss
itself — the stalk whipping over through the upright, which is the most
information-dense single frame in the fight.

**Animation.** Pace, lean, whip, and a stalk that shortens. The lean is a spring
with lag: it overshoots on a direction change and settles, so the honest reading
is available for one beat and the misleading one for the beat before it.

**Colour.** The body is rock grey, the stalk violet, the organ at its tip carries
the ammunition colour — one coloured point on a long grey body, which is what
makes the column question fine rather than obvious. Her target lock is white.

**Payoff.** Step 14: the boss walking into a standing beam nine columns from
where the pair started computing. It is the only payoff on this page that is
purely arithmetic, and it is the one a pair would tell somebody about.

**Cost. Low.** Bullet flight time, a pacing row, a direction and a per-seat
visibility mask. Every part is shipped; the only new thing is drawing the stalk
two ways and the drag on a bolt's last row.

**Reusable.** `LeadWindow` — a target column computed from travel and flight
time, which is the first mechanic in the game where the answer is a *different*
column from the one the target is in. `SplitTerms` — two facts, one per seat,
that must be combined arithmetically; THE VESSEL (11.2) wanted this and never
got the machinery.

---

### 12. THE ANTIPHON — describing a thing that has no name

> The one that grows an organ nobody has ever seen, so there is no word for it
> and you have to invent one.

**Question.** *Whether you can describe a thing you have no name for.*
[Couplings](couplings.md) 3 — **announcing** — is the one coupling still
unbuilt, and its status line says why: *"needs creatures and a second device
that do not exist yet."* The second device exists now. This is the boss that
spends the coupling.

**Silhouette.** A body whose surface **grows a new organ every cycle**, and the
organ is never the same twice: a fresh contour each time, drawn from
`tools/shape-sheet/src/drafts/` or blended from two of them, which is the exact
procedure `CLAUDE.md` already requires of a new shape. There is therefore
nothing for the pair to memorise between cycles and nothing the bestiary's
naming rule can help with. **Health is the organs:** a named one shrivels to a
pit in the surface and the surface keeps every pit, so the boss ends the fight
covered in the record of every shape the pair managed to describe.

**Mechanic.** Player 1's screen shows the new organ's **shape** — its contour,
its lobes, its turn — and nothing about its colour or column. Player 2's screen
shows a rail of **three candidate outlines** with a colour on each, one of which
is the organ. She has to find the one he is describing and fire that colour into
its column.

The whole mechanic is one sentence and the sentence does not exist yet. *"Three
lobes, the bottom one long, pinched in the middle."* The game never listens, never
evaluates, and never scores the words — `CLAUDE.md` rule 5, untouched. It simply
arranges for the pair to have to build a vocabulary in real time and gives them
nothing to build it out of.

**Player 1 — pilot.** Sees one shape and holds the cannon: he has to put the
cannon in the organ's column, which he **also** cannot see — so she has to tell
him where while he is telling her what. Two descriptions crossing in opposite
directions is the boss.

**Player 2 — navigator.** Sees three shapes, three colours and three columns.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **P1 — one organ, three candidates, generous time** ||||||
| 1 | The body rises, its surface smooth and featureless, and swells in one place | — | — | — | — | — |
| 2 | An organ pushes out of the surface over four beats, contour resolving as it comes | P1 | describe it | 6 beats, called | she has something to match | — |
| 3 | Her rail shows three outlines, one of them his | P2 | ask the one question that separates two of them | 6 beats, called | they converge | they converge on the wrong one |
| 4 | Agreed | P2 | call the column and the colour | 900 ms, called | he knows where | — |
| 5 | Cannon in the column | P1+P2 | he holds it, she fires | 2 beats, called | the organ shrivels into a pit | a wrong candidate **hardens all three**, and the next cycle gives four |
| **P2 — the shapes get closer together** ||||||
| 6 | The three candidates are now variants of one contour rather than three different ones, separated by a single lobe | P1 | describe a difference rather than a shape | 6 beats, called | second pit | — |
| 7 | Creatures arrive in the colours of the candidates she rejected, which means a wrong description is also a wrong field read | P2 | answer the field, then the organ | 6 beats, called | — | — |
| 8 | The organ begins **turning slowly in place**, so his description has to say which way up | P1 | describe an orientation | 4 beats, called | third pit | — |
| **P3 — two organs, and a clock** ||||||
| 9 | Two organs at once, on opposite sides of the body, and the rail shows five candidates for the two of them | P1+P2 | two descriptions in one conversation | 10 beats, called | — | one organ times out and **sinks back into the surface healed** |
| 10 | An organ left undescribed for eight beats fires down its own column | P1+P2 | ward | `guardWindowMs`, called | warded | a scar |
| 11 | The rail's candidates now include **a shape the pair has already killed**, and its pit is still on the body for either of them to look at | P1 | say "that's the one from before" — which is the first time in the fight they have a name | 6 beats, called | fourth pit, cheaply | — |
| **P4 — the one shape they both know** ||||||
| 12 | The surface is a field of pits. It stops growing organs and goes smooth and still for four beats | — | — | — | — | — |
| 13 | **The last organ is their own ship.** It pushes out of the surface drawn by `drawHull` — the same function, the same hull, the same violet — and her rail offers three hulls, two of them subtly wrong | P1 | describe his own ship | 4 beats, called | — | — |
| 14 | On the right one: the body cannot hold a shape it has copied, and every pit on its surface opens at once into the shape that made it, all of them at the same time — the whole fight's vocabulary erupting out of the body that took it | P2 | fire | 2 beats, seen | — | — |

**Neither, and it is the one concept that wants no time effect at all.** While
either seat rests a hand on the organ, it turns slowly in place and stops when
the hand lifts — a rotation, not a rate. It is the one place on this page where
the thing being bought is *a second viewing angle* rather than time: a shape being described can be looked at from more than one
angle, which is what makes describing it possible at all, and it is the one place
on this page where a hand on the boss is an aid rather than an action.

**Presentation.** Nothing dramatic, deliberately. This boss's whole presentation
is **two rails of shapes**, one per phone, drawn with the care
`tools/shape-sheet` applies to a sheet. The spectacle is step 14 and nothing
before it competes with the reading.

**Animation.** Organs pushing out of a surface and sinking back into it —
`body-inset.ts` and `metaball.ts` are the right code, and `metaball-spread.ts`
is how an organ merges with the surface it grew from. The turn under a hand is
`long-axis.ts`.

**Colour.** The body is violet and featureless. Every organ carries an ammunition
colour and **only she can see it**, which is the cleanest statement of the split
on this page: he has the shape and no colour, she has the colour and no shape,
and `CLAUDE.md`'s red/cyan language does the work with no additions.

**Payoff.** Step 13 is the better one, and it is the reason the concept is worth
building: after ten minutes of having no words, the pair is handed the one shape
they have both been staring at all evening — and two near-copies of it.

**Cost. High, and the cost is art rather than code.** The mechanic is a rail, a
match and a colour. What is expensive is that every organ must be a **genuinely
new, genuinely readable contour**, three at a time, distinguishable in speech —
which is `bun run shapes:report` and `bun run shapes` work, repeatedly, and the
one concept on this page that cannot be built without the owner's eye.

**Reusable.** `DescribedTarget` — one seat shown a shape, the other shown
candidates, and no channel between them but the voice. This is the announcing
coupling's machinery and building it once builds the third of the three.

---

### 13. THE UNDERTOW — where you are being hit from

> The one that is underneath your hull, so everything you know about the field
> is upside down.

**Question.** *Where you are being attacked from.* Every threat in this game
comes down the field and is answered upward. This one comes up through the
floor, which means the shield is pointing the wrong way, the cannon is pointing
the wrong way, and the only control that faces the hull is the maw.

**Silhouette.** **Nothing above the hull line**, most of the time, and that is
the design: the field is empty and the boss is drawn only where it breaks
through. What is drawn is the hull's own jagged upper edge **lifting** — a plate
bowing up a few tenths of a tile, violet light coming through the seams under it
— and then the lobe itself when it comes. **Health is inverted and it is the best
inversion on the page:** every hole it punches is also a hole to reach into, and
a hole it withdraws from becomes a permanent scar in the pair's own hull. Its
health and the ship's damage are the same drawing.

**Mechanic.** It pushes a lobe up through the hull at a column. For four beats
the lobe stands in the breach, and a lobe in a breach is the only vulnerable
thing in the fight. Then it withdraws, and the breach is a scar.

A lobe in the hull cannot be shot: the cannon fires up its column and the lobe is
*in* the column's floor. So the answer is **the maw** — player 1's, opened over
the breach's column, which takes the lobe in (`resolveIntake`, unchanged,
`intakeWindowMs`) — and for the hard ones, the **lance**, whose beam burns its
whole column standing and therefore reaches the floor of it.

**Player 1 — pilot.** Sees where the next lobe is pushing: the hull bowing, on
his screen only, because the floor is his half the way the rocks are
(`radar: "p1"`). He owns the maw and the cannon's column, which is everything
this fight needs.

**Player 2 — navigator.** Sees the breach the moment it opens, and holds the
**plate over it** — a shield standing on a breach stops it widening, which is the
first time in the game the shield has been asked to face down. And she holds both
colours for the lance.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **P1 — the floor, and an empty sky** ||||||
| 1 | The field is empty. The hull's edge begins to bow upward in one column, and the ship's nerves light along the seam | — | — | — | — | — |
| 2 | The bow deepens over four beats; light through the seams | P1 | call the column | 900 ms, called | she has it | — |
| 3 | **The plate parts and a lobe comes through**, standing a tile above the hull line | P1 | open the maw in that column | `intakeWindowMs`, called | the lobe is taken in and the plate closes | it withdraws, and the breach is a permanent scar |
| 4 | A scar, if missed: the hull is visibly shorter in that column for the rest of the run | — | — | — | — | — |
| **P2 — two columns, and a shield that faces down** ||||||
| 5 | Two bows at once, four columns apart | P1 | call both, and pick which the maw takes | 900 ms, called | one is taken | — |
| 6 | The breach he could not reach begins **widening** a tenth of a tile a beat | P2 | stand the plate on it | 4 beats, called | the widening stops while the plate is there | the breach reaches two columns wide and two lobes come through it |
| 7 | A lobe already through, with the plate elsewhere | P1+P2 | he opens the maw, she moves the plate off the breach to let him | `intakeWindowMs`, called | taken | — |
| 8 | The first arrivals of the fight fall from above, into a field with holes in its floor | P1+P2 | ordinary play, over a floor that is not sound | 6 beats, called | — | a creature through a breach is worth two |
| **P3 — it comes up hard** ||||||
| 9 | A lobe comes up **fast** and stands three tiles high, too big for the maw | P2 | **hold** a colour; he keeps the column | `lancePrimeBeats`, called | the beam burns down the column into the breach and takes it | it withdraws and takes a plate of hull with it |
| 10 | The hull is now four columns shorter than it started and the pair can see the shape of their own losses | — | — | — | — | — |
| 11 | It pushes up under the **cannon itself**, and the cannon must be slid off its own column to let the plate close | P1 | slide the cannon, which drops any fill | 2 beats, seen | the plate closes | the cannon is unseated for four beats |
| **P4 — it comes all the way through** ||||||
| 12 | Every seam in the hull lights at once and the whole edge bows along its full width | — | — | — | — | — |
| 13 | **The last lobe comes up through the middle column and does not withdraw.** It stands, growing, and behind it the whole body is coming | P1 | open the maw and **hold it open** | 6 beats, called | — | it comes through anyway and the hull goes |
| 14 | The body follows the lobe up through the hole — the entire boss drawn for the first and only time, passing through a breach narrower than it is, deforming to fit — and the ship takes it in. The fight ends with the boss **inside the ship**, and the hull closes over it | — | — | — | — | — |

**THE SLOW.** The lobe's four beats in the breach are ordinary beats; what is
slowed is the **hull plate bending** — the edge deforming upward at a third
rate, seams opening, light coming through. That is the brief's "objects stretching through
space" applied to the one object in this game the pair actually cares about.

**Presentation.** This concept is the argument of correction 3 made as a whole
boss: **there is no camera and there does not need to be one, because the ship
is the stage.** `hull-break.ts`, `hull-shock.ts`, `hull-frame.ts`,
`ship-nerves.ts`, `craters.ts`, `scars.ts`, `lost-blood.ts` — every existing
piece of hull drawing gets a fight of its own.

**Animation.** A hull plate bowing, parting, closing and scarring, eleven
columns of it, and a body passing through a hole too small for it. The second is
the expensive one and it is worth the expense.

**Colour.** Violet through the seams — the boss is the same colour as the ship,
which is the fiction: it is coming up out of whatever the ship is standing on.
Rock grey lobes, and the ammunition colour only on the hard lobes that need the
lance, so a colour in the frame means *"this one needs the beam"* and nothing
else.

**Payoff.** Step 14. A boss taken **into** the ship rather than destroyed, and
the run continues with the hull closed over it. That is a finish no other boss on
this page or in the game can have.

**Cost. High.** An empty field with all the action at the hull line means
`render/` draws the hull at a fidelity it has never needed, and the sim needs a
breach that is a *place* rather than a scar — a width, a column and a state, all
hashed. The maw and the lance do the rest.

**Reusable.** `Breach` — a hull column that is open, widening, and answerable,
which [ideas](ideas.md) has wanted for THE HIVE (11.14) and never had.
`DownwardGuard` — the shield used against the floor.

---

### 14. THE CANDLE — whether you can act in the dark

> The one where the field is black and the only light in it is your own
> weapons, and neither of you sees the other's.

**Question.** *Whether you can act in the dark.* Every wave in this game is
fully lit and fully drawn. This one takes the picture away and makes light a
resource that costs ammunition, and it is the only concept on the page where
the pair's problem is **seeing** rather than reaching or timing.

**Silhouette.** Undrawn, most of the time. What is drawn is the **after-image**
of whatever the last flash lit, decaying over three beats. **Health is the boss's
own glow:** it is the only steady light source in the field, it dims a step with
every hit, and it dies at full darkness — so the pair spends the whole fight
putting out the only light they have, and the fight gets harder in exact
proportion to how well they are doing. That is the cruellest health-as-silhouette
available and it needs no bar, no petals and no plates.

**Mechanic.** The field is unlit. Three things light it, all of them shipped
controls:

- **A shot's muzzle flash** lights three columns for one beat (`muzzle.ts`).
- **A shield flash** lights the column the plate stands in (`shield-flash.ts`).
- **The lance beam** lights its whole column for `lanceBeamBeats` — the only
  sustained light either of them can buy, and it costs the fill.

**And a flash is only drawn on the screen of the seat whose control made it.**
He triggers and sees his column; she fires and sees hers; and the two of them are
describing two different half-seconds of the same darkness to each other. That is
the information split arriving not as a mask over a known field but as **two
different partial memories of an unknown one.**

**Player 1 — pilot.** The trigger and the cannon. His light is one column at a
time and he gets it by spending a guard window.

**Player 2 — navigator.** Both colours. Her light is three columns and she gets
it by spending a shot, and every shot she spends on light is a shot not spent on
something she cannot see.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **P1 — the light goes out** ||||||
| 1 | An ordinary lit field, one creature falling. Then the boss arrives and **the field goes black over four beats**, corner light first, and its own glow is the only thing left | — | — | — | — | — |
| 2 | One dim glow high in the field | P2 | fire at it | 2 beats, seen | a hit, and its glow dims a step — and her muzzle flash lights three columns for one beat | — |
| 3 | In that one beat both seats learn the field is not empty | P1 | call what he saw in his three columns | 900 ms, called | — | — |
| 4 | Nothing is drawn but after-images | P1 | trigger to light his column | `guardWindowMs`, seen | one column lit, one guard window spent | — |
| **P2 — the field is full and nobody can see it** ||||||
| 5 | Arrivals in the dark, announced only by the after-images of the flashes that caught them | P1+P2 | alternate flashes deliberately, building a shared map out loud | 8 beats, called | the field is mapped and answered | a creature reaches the hull out of the dark |
| 6 | A rock in the dark, which the cannon cannot answer and the shield must | P1+P2 | ward a column neither of them can see | `guardWindowMs`, called | warded, and the flash lights it | a scar, and the breach's own light shows them the rest of the field for two beats |
| 7 | **A scar is a light source.** A breached hull glows, so damage buys vision, and the pair now has a reason to want a scar | — | — | — | — | — |
| 8 | Its glow dims a third step and the after-images get shorter | — | — | — | — | — |
| **P3 — it puts out their light too** ||||||
| 9 | It begins **eating flashes**: a muzzle flash in the column it faces is swallowed and lights nothing, and the swallowed light re-brightens its own glow | P2 | fire from a column it is not facing, which only he knows | 3 beats, called | light, and a hit | light spent for nothing, and the boss is brighter |
| 10 | The lance: the only sustained light in the game | P2 | **hold** a colour; he keeps the column | `lancePrimeBeats`, called | `lanceBeamBeats` of a fully lit column — the longest look either of them gets | the fill drops and the dark closes |
| 11 | In the beam's light the whole field is visible for the first time in minutes, and it is full | P1+P2 | say everything, fast | `lanceBeamBeats`, called | — | — |
| **P4 — the last glow** ||||||
| 12 | Its glow is a single dim organ, the only thing visible in a black frame, and everything else in the field is inferred | — | — | — | — | — |
| 13 | It stops moving and stops eating flashes. There is nothing left to work out | P2 | fire into it | 4 beats, seen | — | — |
| 14 | **The light goes out.** The frame is fully black for two beats — no after-image, no glow, nothing — and then the wave-end light comes up on a field the pair has never seen, full of everything they answered blind and everything they did not | — | — | — | — | — |

**THE SLOW, over `AfterImage`.** The after-image is not a time effect at all —
**every flash holds its lit frame for three beats as a decaying buffer**, which
is the only reason the mechanic is playable and is `Effects` work. THE SLOW sits
on top of it and does one job: the beat a flash lands is played at a third rate,
so the pair gets three seconds to read a field they are seeing for a fifth of a
beat. Together they are the brief's "particles suspended in air, trails becoming
visible", and the simulation does not know the field is dark.

**Presentation.** `key-light.ts`, `corner-light.ts`, `light-shafts.ts`,
`unseen.ts` and `hover.ts` already exist and this is the boss they were waiting
for. The after-image is an `Effects` buffer, which means it must be cleared in
`Effects.reset()` or `restart.test.ts` will say so.

**Animation.** Almost none, and that is the point: what moves is the light. The
one exception is the boss's glow, which throbs slowly and dims in five visible
steps, so the pair can hear the fight's progress in the only thing they can see.

**Colour.** The one concept where the palette is nearly all absent. Red and cyan
appear **only as muzzle flashes** — so for once the ammunition colours are
literally the pair's light, and which colour was fired is legible from the tint
the after-image decays through. Violet for the ship's own glow, white for the
lance.

**Payoff.** Step 14: two beats of total black, and then the lights up on the
field they fought without seeing. Nothing else in the game can hold an empty
frame and have it mean anything.

**Cost. Medium, and entirely in `render/`.** The simulation is unchanged — this
is the only concept on the page that is purely a rendering boss, and
`packages/render/test/*-budget.test.ts` is where it will be decided, because an
after-image buffer and per-seat light masks are real per-frame cost. Worth a
`bun run perf` before it is committed to, which is the owner's call and not a
lane's.

**Reusable.** `Darkness` — a field-wide light budget, with flashes as the only
sources. `PerSeatLight` — the same world lit differently on two phones, which is
the deepest version of the information split the renderer could express.
`AfterImage` — a decaying frame buffer, which THE GHOST and THE VEIL both want.

---

### 15. THE SCUTTLE — a boss racing you to its own death

> The one that is killing itself, and if it finishes first, you lose.

**Question.** *Whether you can beat a clock that is the boss's own body.*
Every boss in this game is a body the pair empties. This one empties itself, on
a fixed cadence, in plain sight — so for the first time the pair is not
outlasting a boss, they are **racing** it, and the clock is drawn as a
silhouette.

**Silhouette.** A body visibly coming apart on purpose: a segmented mass whose
plates, spines and organs detach one at a time and are thrown down the field as
ordinary arrivals. It begins the fight dense and complete and ends it as a frame
of empty sockets. **Health is what is left of it — and it is spending that health
as a weapon.** There is no distinction between its life and its ammunition,
which is the whole fiction and makes the bar the rule forbids impossible to even
want: the pair can count the parts still attached.

**Mechanic.** It has a fixed number of parts, and it throws one every three
beats, forever, until there are none. **When it throws the last one the wave is
lost** — not to a hit, but to the field: `wave-fail.ts`'s existing loss on a hull
at zero, reached by sheer volume of debris nobody had time to answer.

To kill it the pair must strike a part off **while it is still attached**, and
only one part is live per cycle. So every three beats the pair chooses between
answering what is already falling and reaching for what has not fallen yet, and
the arithmetic is brutal and completely visible.

**Player 1 — pilot.** Sees the parts **still attached** — what is coming, which
is his half — and holds the cannon and the trigger. He is the one who can count
the boss's remaining life, which is the same number as their remaining time.

**Player 2 — navigator.** Sees which attached part is **live** this cycle, and
where the next throw will land. She holds both colours. Neither of them can pick
the target alone: he knows how many are left, she knows which one counts.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **P1 — the cadence, and the count** ||||||
| 1 | It arrives whole, dense and still, and the pair is given four beats to look at it and count | P1 | say the number out loud | 900 ms, called | they have a clock | they play the fight without knowing it has one |
| 2 | It throws its first part: a plate that detaches over three beats, hanging by a thread, then falls as a rock | P1+P2 | ward it | `guardWindowMs`, called | warded | a scar |
| 3 | A part on the body lights as live | P2 | call it | 900 ms, called | he has a column | — |
| 4 | **The three beats of a detachment are the window**: the part is still attached and already loose | P2 | fire the live part while it hangs | 3 beats, called | it is struck off rather than thrown, and the boss loses a part **without** it becoming a threat | it lands in the field as one more thing to answer |
| 5 | Every part struck off is two things won: a part off the clock and a body out of the field | — | — | — | — | — |
| **P2 — two throws a cycle** ||||||
| 6 | Two parts detach at once, and only one is live | P1+P2 | ward one, shoot the other | `guardWindowMs`, called | — | two bodies in the field and the cadence does not wait |
| 7 | The parts it throws are now a **mix** — a rock for the shield, a slick for the cannon, a bulb for the other colour | P1+P2 | ordinary play, at volume, against a clock | 9 beats, called | — | — |
| 8 | A pod among the parts, which is the only thing in the fight that gives time back | P1+P2 | she shoots it loose, he opens the maw | `intakeWindowMs`, called | the cadence slows by a beat for the rest of the fight | it falls through |
| **P3 — it throws faster because it is lighter** ||||||
| 9 | The cadence tightens to two beats as the body thins, and the thinning is why — a lighter body throws faster, which the silhouette says without a word | — | — | — | — | — |
| 10 | The live part is now on the far side of the body from the last one, every cycle, so the cannon crosses the field between them | P1 | slide, hold, slide | 2 beats, seen | — | the shot is one column behind the call |
| 11 | Fewer than a third of the parts left, and the field is fuller than it has been all fight | P1+P2 | choose what not to answer | continuous, called | — | — |
| **P4 — the last part** ||||||
| 12 | One part left, and the boss is a frame of empty sockets holding a single organ | — | — | — | — | — |
| 13 | It does not throw it. It **winds up** — the whole frame drawing back over six beats for a throw the pair can see is the last one, and six beats is exactly `lancePrimeBeats` | P2 | **hold** the colour; he keeps the column | `lancePrimeBeats`, called | the fill tops out on the beat of the throw | the last part is thrown, the field closes over the hull, and the run ends |
| 14 | **The beam stands in the column and the throw never happens.** The last part goes while still in the socket, and with nothing left to hold it together the frame collapses inward through its own outline — every empty socket closing at once — and the only things left falling are the parts it threw minutes ago | — | — | — | — | — |

**THE DRAG.** The **detachment**: three real beats of a part hanging off the
body by a thread, which is simultaneously the window, the warning and the drama.
The whole boss is built around one drag repeated thirty times, and it is the
clearest demonstration on this page that a DRAG is a *mechanic-maker* rather
than a decoration — the three beats are the shot, so they have to be beats the
simulation counts. A SLOW on top of the last one, in step 13, is the only
presentation this fight needs.

**Presentation.** `break-piece.ts`, `shatter-fall.ts`, `debris.ts` and
`splinter.ts` — the destruction work is shipped and this is the boss that spends
all of it. The hull answers nothing special; the spectacle is the field filling
up.

**Animation.** A body that thins. Parts detaching, hanging, tearing free, and
sockets left behind that the light goes through — so late in the fight the boss
is visibly see-through and the backdrop shows between its ribs.

**Colour.** The body is rock grey with violet interiors showing through the
sockets as they empty. Live parts carry the ammunition colour — one coloured
point on a disintegrating grey body, and the colour moves every cycle.

**Payoff.** Step 13 is the real one. A boss that visibly winds up for the throw
that would end the run, for exactly the number of beats the lance takes to fill,
is the tightest piece of authored choreography on this page — and the pair either
started the hold or did not.

**Cost. Medium.** A part list with a live index and a cadence; every part it
throws is an ordinary spawn, which means the sim work is small and mostly
bookkeeping. The thinning body is the render cost and it is the good kind:
`creature-body.ts`'s existing socket work at boss scale.

**Reusable.** `SpentBody` — a boss whose arrivals come out of its own health, so
that its remaining life and the pair's remaining time are one number.
`AttachedWindow` — a target that is vulnerable only while it is coming loose,
which is the single most reusable drag on this page.

---

## Refused by name

The sheet that came with the brief carries twelve cards. Ten of them are things
this game already ships, and saying so by name is the point of filter 8 — *a
fourth boss asks a fourth question*, and
[bosses](bosses.md) says plainly that a second boss on a shipped coupling is a
re-skin. Nothing below is a bad idea; all of it is an idea that has already been
had here, and usually better.

| The card | Already shipped as | Verdict |
|---|---|---|
| **1 TENDRIL LOCK** — both grab a tendril, pull together, keep holding | **THE BALLOON**, exactly: one handle per seat, taut past `balloonTautMilli`, both held together for `balloonHoldBeats`, and a hand that slackens gives it back | refused — this is the shipped creature with a boss's silhouette on it |
| **2 ROTATION RING** — P1 turns the outer ring, P2 the inner, align the core | **THE MAZE's string** (`mazeString`, a bearing drag on a wheel) plus a second wheel | refused as drawn. The *alignment* question is worth having and is rescued as [THE ORRERY](#2-the-orrery--whether-you-can-agree-on-when), where the point is that neither seat can see all three rings — the card's version is two visible dials, which is arithmetic, not a conversation |
| **3 PULL THE HEART** — P1 holds a tendon, P2 shoots the exposed core | **THE WARDEN's tether** and **the Queen's mark**, both built, in that order | refused — it is two shipped mechanics stacked |
| **4 NEON PARASITE ENGINE** — each player sees part of a sequence; communicate | **THE SPLICE** (straws fed in the order the numbers say) and **THE PULSE** (*the same song, and neither of you can read all of it*) | refused — shipped twice |
| **5 THE LIVING TURRET** — shoot the arms, then the exposed core | nothing, and that is the problem | refused on the brief's own rule: *"Do NOT make 15 variations of shoot the weak point"* |
| **6 SLIME COCOON** — P1 sucks the slime away, P2 shoots the weak point | **SALVAGE's pod coupling**: she shoots it loose, he opens the maw | refused, and on a factual error worth correcting — **there is no suction on the field.** The maw is an 800 ms window at the hull (`intakeWindowMs`), not a vacuum that reaches up the screen. Any concept that needs a pull at range needs `InhaleColumn` from [THE THROAT](#1-the-throat--what-you-feed-it) |
| **7 SPINNING CRYSTAL CORE** — opposite rotation, timed release | card 2 with a different body | refused |
| **8 ENERGY BRIDGE** — P1 stands the shield at a node, P2 powers both sides | **warding** ([couplings](couplings.md) 1) for the position-and-trigger half, **THE LANCE** for the beam | refused — and the shield in this game is *passively useless*, so a shield standing somewhere as a conductor contradicts the one rule that makes warding a coupling |
| **9 THE GIANT CRANK** — both turn the crank, stop on the signal | **THE CLAW's `WIND`**, the one control in the game that is turned, `windTilesPerTurn` a turn | refused |
| **10 TUG OF WAR** — both pull a core, together or apart, into a zone | **THE PUSH**, including the cancel rule when two hands pull opposite ways | refused as drawn; the *magnitude* half is the one new thing in it and it is [THE SINEW](#8-the-sinew--how-hard-not-when) |
| **11 THE LOCKER** — P1 turns a mechanism, P2 locks it at the right moment | the turn is THE MAZE's string; **the lock is not anything** | **partly promoted.** A timed *tap* that freezes a continuous *drag* somebody else is making is a verb this game does not have, and it is the only genuinely new input on the sheet. It is not a boss on its own — it is a primitive, and it is `FreezeTap` in the library below |
| **12 THE CHAIN REACTION** — activate nodes in order, each player sees different ones | **THE SPLICE**, again | refused |

**On the sheet's pictures, which are the good part.** The density, the bloom and
the layered ring work are a fair reference for what a boss frame should feel
like, and `docs/style-guide.md` would not disagree with most of it. Three things
on it may not come across: the **HP bar** on every card (correction 2), the
**instruction text** under every card — which the brief's own cinematic rule
forbids, and which the game answers with `target-lock.ts`, `choir-arrows.ts`,
`grip-arrows.ts` and the radar instead — and **both players' hulls in one
frame**, which is the game the brief was imagining rather than this one.

**And one refusal that is the brief's, not the sheet's.** The brief asks for
"camera / presentation: explain how the screen should visually emphasize the
moment," and repeatedly for zoom, framing and camera moves. `decisions.md` #14
settled that the window is not the stage, and two portrait phones have no second
pane to cut to. Every `Presentation` line above therefore answers the question
with the **hull** — shake, shock, light, scar, bleed — which is what this game has
instead of a camera, and it is better for this brief than a camera would be,
because the ship is the thing the pair has feelings about.

---

## The reusable boss mechanic library

The brief asks for the primitives extracted. Here they are, and the useful
finding is that **most of them already exist under another name** — the library
is shorter than the brief expected because this game has been building toward it
for months. Each entry says what it would have to support, where its shipped
ancestor is, and which of the fifteen needs it.

Nothing here is a proposal to build a framework. `decisions.md` #20 is the
warning: THE GAUGE's *interlude* category cost a second door, a `Reach` value, a
director tab and an API route before the second one was built, and the owner
retired it. **A primitive earns its name on the second boss that needs it, not
the first.** The three marked **build first** are the ones two or more concepts
above cannot exist without.

### The step machinery

| Primitive | Must support | Ancestor | Wanted by |
|---|---|---|---|
| **`BossSequenceStep`** — **build first** | One beat of an authored scene: which seat, which gesture, which target, the window in beats, the landed branch, the missed branch, and the next index. Data in `packages/content`, read by index in `sim/`, with the cursor a hashed field the way `spawned` is (`decisions.md` #23) | `scene-script.ts` and `scene-step-types.ts` already do this for a guide's pages; `pulse-steps.ts` and `pulse-stages.ts` do it for a round | all fifteen |
| **`SequentialAction`** | A step that may not be entered until the previous one landed. Falls out of the above for free | `simon.ts`'s step cursor | all fifteen |
| **`SimultaneousAction`** | Two commands inside one window from two seats. The window, not the tick, is the unit — a shared *instant* is what [latency](latency.md) forbids | SYNC in `balance.ts`; THE BALLOON's two handles | 6, 8, 9, 10 |
| **`Alternation`** | A step list that requires the acting seat to change, and refuses a repeat | nothing | 10 |
| **`TurnLock`** | A seat forbidden from sending commands for N beats, drawn as a grey panel | THE WARDEN's clamp, THE MALFUNCTION; `guard-lapse.ts` and `malfunction-look.ts` draw it | 10 |
| **`RestraintGate`** | A step passed by sending *no* command for N beats. The input layer has never had to express an absence | nothing — `world.prime` is the closest thing, and it is a presence | 3 |

### Time

| Primitive | Must support | Ancestor | Wanted by |
|---|---|---|---|
| **`Slow`** — **build first** | A span of beats played at a fraction of its wall-clock rate, on both devices. The **boundaries** are a hashed field of `World` so the two agree which ticks are slow; the rate is `tickMs` in `loop.ts` and nothing below it ever hears about it. **Changes `tickMs`, never `ticksPerBeat`** (`decisions.md` #33). Wants `interpolatedBeatPhase` on inside the window, and the input-delay floor re-derived against the rate | `loop.ts`'s one-off `const tickMs`; `interpolate.ts`, written and behind a flag | eleven of the fifteen; 2, 9 and 11 are unplayable without it |
| **`Drag`** | A named set of bodies moving at a fraction of their rate **in beats**, chosen by the script, hashed. A scale on tiles-per-beat, in thousandths. The other currency entirely: this buys the pair *turns*, where `Slow` buys them *seconds* | `sim/grip.ts` scales `grippedFallTiles`; `slowStep` in `slow-fall.ts` is the same idea as a per-kind rule | 1, 8, 10, 15 — and 10 and 15 are unplayable without it |
| **`AfterImage`** | A decaying frame buffer in `Effects`, cleared in `Effects.reset()` or `restart.test.ts` fails | `trail.ts`, `sparks.ts`, `ghost-trail.ts` | 14, and THE GHOST and THE VEIL want it |
| **`DelayedConsequence`** — **build first** | A command's effect arriving N beats later at a named column, queued and hashed. This is what makes *act → reaction → act* possible at all, which is the brief's central diagram | the wave's own `queue`, read by index; `fault-clock.ts` | 5, 13, and any authored scene with a consequence |
| **`CoprimeCadence`** / **`AlignmentWindow`** | The beat on which several independent cadences coincide, computable ahead and drawn | `queen-drop.ts`'s eight-beat bar; `pulse-chart.ts` | 2, 7 — and these two should be **one** primitive, arrived at from two directions |

### Gesture

Every one of these is a member added to `DragTarget` or `Hold["kind"]`, and
`tools/director/test/on-field-controls.test.ts`'s exhaustive switch means adding
one without documenting it **fails to compile** — which is the cheapest
documentation guarantee in the repository and the reason this table is short.

| Primitive | Must support | Ancestor | Wanted by |
|---|---|---|---|
| **`BearingDrag`** | A hand going round a circle, reporting thousandths of a turn rather than a distance | `crank` in `drag-targets.ts`, `sim/crank.ts` — shipped, on the panel; wanted on the field | 2 |
| **`PulledMagnitude`** / **`ChargeSum`** | Two seats' drag depths or hold durations **summed** against a target window, with each seat shown half the gauge. The first scalar coupling in the game | `balloon-pull.ts` sums nothing — it asks a threshold of each | 8, 9 |
| **`ReleaseWindow`** / **`MutualRelease`** | A step passed by **lifting**, and two lifts within N beats. `touchUp` has to become a command rather than the end of one — `touch.ts` can say this honestly for a colour thumb and not yet for a field hold | `world.prime`'s explicit `touchUp` | 9 |
| **`FreezeTap`** | A timed tap by one seat that holds whatever the other seat is currently dragging. **The one genuinely new verb on the sheet** (card 11) | nothing | none of the fifteen, and it should be built into the first one that wants it rather than speculatively |
| **`SharedPush`** | One object, two hands, opposite pulls cancel — promoted from an assist to a mechanic, at seven columns wide | THE PUSH, `grip-push.ts`, `grip-push-dir.ts` | 6 |
| **`FeedTarget`** | A place on a boss that accepts a **body** rather than a shot | `resolveIntake` accepts a pod at the hull; nothing accepts one anywhere else | 1 |
| **`InhaleColumn`** | A column that moves bodies **up** instead of down | THE WELL's projection arithmetic, pointed the other way | 1, 9 |
| **`AttachedWindow`** | A target vulnerable only while it is coming loose from its parent | `pods.ts`: a pod hangs, is shot loose, falls | 15 |

### Information

| Primitive | Must support | Ancestor | Wanted by |
|---|---|---|---|
| **`PerSeatTruth`** | The same body drawn true on one screen and armoured, still or upright on the other, with a test that holds **both** halves shut | the Queen's two marks, and `queen-split.test.ts` is the test to copy | 2, 7, 8, 11, 12, 15 — the most-wanted primitive on the page |
| **`SplitTerms`** | Two facts, one per seat, that must be combined **arithmetically** rather than just reported. THE VESSEL (11.2) asked for this and never got it | `radarOwner`, `showsRadar` | 11, 12, 15 |
| **`SplitGauge`** | A quantity whose value is on one screen and whose target is on the other | nothing | 8, 9 |
| **`DescribedTarget`** | One seat shown a shape, the other shown candidates, and no channel but the voice. This **is** [announcing](couplings.md#3-announcing--partly-built), the third coupling, still unbuilt | nothing | 12 |
| **`PerSeatLight`** / **`Darkness`** | A field-wide light budget where flashes are the only sources, and the same world lit differently on two phones | `key-light.ts`, `corner-light.ts`, `unseen.ts` | 14 |

### Consequence

| Primitive | Must support | Ancestor | Wanted by |
|---|---|---|---|
| **`StepBack`** — **build first** | A missed step that returns the scene to the previous index rather than losing the wave. The brief's clearest ask — *"FAILURE should usually NOT immediately mean YOU LOSE"* — and the thing the game most conspicuously lacks: `wave-fail.ts` loses the whole wave on a hull hit, and THE MIRROR's own design says a wrong step *"is the wave lost… the whole wave is played again from the top"* | nothing. This is real new machinery and it is what separates a scene from a fight | all fifteen |
| **`Breach`** | A hull column that is open, widening and answerable — a place, not just a scar | `hull-damage.ts`, `scars.ts`, `hull-break.ts` | 13, and THE HIVE (11.14) |
| **`SpendLedger`** | A rolling per-colour count of the pair's own commands, hashed | nothing — and **THE MOTHER (11.1) has been waiting for exactly this since it was designed** | 4, and 11.1 |
| **`SpentBody`** | A boss whose arrivals come out of its own health, so its life and the pair's time are one number | nothing | 15 |
| **`Occluder`** | A body that changes how the bodies behind it are drawn. `render/` has no z-concept for "dimmer, behind a membrane" | `veil-look.ts` comes closest and does not occlude | 6 |
| **`InvertedWeakPoint`** | A body vulnerable to the colour it is **not** | `colour-armour.ts` says which colour hurts a body; this says which does not | 4 |

**The four to build first, and in this order:** `BossSequenceStep`, `Slow`,
`DelayedConsequence`, `StepBack`. Those four are a **choreographed boss engine**
and nothing else on this page is reachable without them. Every one of the fifteen
then costs what `decisions.md` #20 says a round costs — one wave entry, one
`config-<name>.ts` block, one control set — plus its own state and its own
picture.

---

## The five signature candidates, and where half B goes

The brief asks for five showcase encounters at 20+ steps. Naming them is the end
of this half; writing them is the next, and the choice is made on three grounds —
a payoff frame nothing else in the game can make, a split that could not exist on
one screen, and a mechanic that spends shipped machinery rather than inventing
it.

1. **[THE UNDERTOW](#13-the-undertow--where-you-are-being-hit-from)** (13) — the
   ship is the stage, which is this page's answer to the brief's camera section.
   A boss taken *into* the hull is a finish nothing else can have.
2. **[THE CANDLE](#14-the-candle--whether-you-can-act-in-the-dark)** (14) — the
   deepest version of the information split the renderer can express, and two
   beats of black is a frame no other game on a phone would dare.
3. **[THE THROAT](#1-the-throat--what-you-feed-it)** (1) — the only boss answered
   by giving it something, built entirely out of a gesture that shipped two days
   ago, and the eversion is the best single animation on the page.
4. **[THE ORRERY](#2-the-orrery--whether-you-can-agree-on-when)** (2) — the
   concept that proves `Drag` has to exist, and the one whose whole difficulty is
   two people describing two half-pictures of the same machine.
5. **[THE LEDGER](#5-the-ledger--whose-body-takes-it)** (5) — the brief's own
   diagram, *act → consequence → answer it → act*, as a whole boss, and the only
   fight in the game that ends with a scripted hit the pair is told to take.

Two that did not make the five and are worth arguing about: **THE BATON** (10) is
the cheapest thing on the page and the best **test of the whole premise** — if
alternation at tempo is not fun, most of this page is not either, and it should
probably be built before any of the five. And **THE ANTIPHON** (12) would build
[announcing](couplings.md#3-announcing--partly-built), the last unbuilt coupling,
which is worth more to the game than any spectacle on the list — it is off the
five only because its cost is the owner's eye rather than a lane's week.

**Open, and for the owner.** Three things on this page need a decision before any
of it is worth starting, and all three are named rather than guessed at:

- **`StepBack` or not.** A scene that rewinds a step is the brief's design and it
  is not this game's: a hit loses the wave, everywhere, today. Softening that for
  bosses only is a real change to what a wave *is*, and it is the one thing here
  that reaches outside `bosses.md`.
- **~~Whether the slow is allowed at all.~~ Decided: it is.** The owner ruled on
  16 September 2026 and `docs/decisions.md` #33 carries the mechanism. What is
  left of the question is one implementation call somebody has to make rather
  than ask about: **the input-delay floor is counted in ticks**
  (`link-run.ts`), so inside a third-rate window the felt lag from thumb to
  picture triples at exactly the moment the drama peaks. It has to be
  re-derived against the rate, and whoever builds `Slow` owns that or the
  first window will feel broken rather than dramatic.
- **How many of the fifteen are wanted.** [transfers-bosses](transfers-bosses.md)
  already holds THE TITHE and THE WEIGHT unbuilt, [bosses](bosses.md) holds THE
  MOTHER and THE VESSEL waiting on machinery, and the act structure has empty
  slots rather than a shortage of designs. Fifteen more is a store, not a plan.
