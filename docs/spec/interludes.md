# Rounds that are not the field

> **Status: two are built and both are boss waves.** THE GAUGE is
> `packages/sim/src/gauge.ts` (the dial) and `packages/sim/src/gauge-round.ts`
> (its clock), its picture is `packages/render/src/gauge.ts` and
> `gauge-round.ts`, and it is reached by one line in `waves.ts`:
> `boss: { kind: "gauge" }`. SNAKE is `packages/sim/src/snake.ts` and its four
> neighbours, its picture is `packages/render/src/snake-draw.ts` and
> `snake-round.ts`, and it is reached the same way — `boss: { kind: "snake",
> rounds: SNAKE_ROUNDS }`, with the rounds authored in
> `packages/content/src/snake-rounds.ts`. The other ten candidates are in
> [the idea store](ideas.md#interludes); where they came from is
> [transfers-hazelight](transfers-hazelight.md). One thing in the game already
> had this shape without being called it —
> [THE MIRROR](bosses.md#113-the-mirror--your-own-ship-asking-for-your-moves-back),
> which suspends the field, plays Simon Says on the pair's own controls and
> hands the field back.
>
> **The file is still called `interludes.md`, and the word is history.** These
> were designed as *interludes*: a fourth kind of thing beside the wave, the
> boss and the pod, sitting in the gap between two acts and reached from a
> table of its own. That category was retired by the owner in August 2026 and
> every trace of it is out of the code —
> [`docs/decisions.md` #20](../decisions.md) has the argument and what it cost.
> The page keeps its name so the links into it still work; what it describes is
> a **round**.

## What a round is

A **short encounter with its own rules, its own controls and its own picture**,
in which the field is gone and nothing falls. It has a beginning, one rule,
four or five repetitions of that rule, and an end. It is over in about ninety
seconds. Nothing it teaches is used again.

Three things make it one, and all three are required:

1. **The field is gone.** Not decorated, not re-skinned, not paused behind a
   panel — gone. Eleven columns and fifteen rows are what the pair spends a run
   learning to talk about, and a round that borrowed the grid is a wave with a
   costume on.
2. **Neither player can play it alone.** Each holds half the information or
   half the verbs, and the round does not resolve without both. This is filter
   6 in [transfers-hazelight](transfers-hazelight.md#the-filter) and it is the
   one that most candidates fail.
3. **It is learnt in one sentence.** Its briefing card is that sentence, split
   in half like every other card: no tutorial, no legend. The pair looks at two
   devices, one of them says what they can see, and that is the teaching.

## It is a boss wave, and that is the whole of how it is reached

A round holds a boss slot the way any boss does. `waves.ts` names it,
`startWave` installs it, `world.boss` holds it, and when the round is over the
boss goes and the wave clears on the next beat like an empty field. There is no
gap table, no `cfg.interludes`, no second meaning for `needWave` and no
`interludeDone`.

That is not a small saving and it is the reason the category went. Each of
those was a place the rest of the game had to learn about something it did not
otherwise care about, and each of them would have been paid eleven more times.
What a round costs now:

| Part | Where it goes |
|---|---|
| The wave | one entry in `packages/content/src/waves.ts`, `boss: { kind: … }` |
| What it is made of | `packages/sim/src/<round>.ts`, integers, the seeded `Rng`, the tick counter |
| Its clock and its hull cost | `packages/sim/src/<round>-round.ts` |
| Its numbers | `packages/sim/src/config-<round>.ts`, spread into `DEFAULT_CONFIG` |
| Its panel | one `ControlSet` of slabs in `packages/content/src/control-sets.ts` |
| Its picture | `packages/render/src/<round>.ts`, one file per round |
| Its card | one row in `packages/content/src/briefings.ts` |

**Nothing needs a third home.** A round's *tuning* is `SimConfig`, split into a
block of its own; a round's *authored content* — if it has any — is the `boss:`
entry, the way `{ kind: "maze", rounds: MAZE_ROUNDS }` is. THE GAUGE has none:
its entry is `{ kind: "gauge" }` and every number about it is tuning. If a round
seems to want a place that is neither, its data is on the wrong side of that
line.

## The three decisions the shape makes

Settled when THE GAUGE was built, revisited when it became a boss, and the next
eleven inherit them. Each was a real fork; the argument matters more than the
answer.

### A mode of one world, not a world of its own

`world.boss` is a field on `World` and the round is an early return in `step`.
The alternative — a second `World` with its own `step` — was rejected because of
the seam rather than the rules: two worlds need a supervisor holding the switch
between them, and that supervisor is the one piece of state no fingerprint
covers. Two devices could then agree about everything inside a round while
disagreeing about *which round they are in*. One world keeps one `step`, one
`hashWorld`, one replay format and one command stream.

The price — the word "round" meaning two things — is paid where it is
cheapest. `step` returns before it reaches a single rule of the field, so
`bullets.ts`, `beat.ts` and `hull.ts` never learn the round exists.

**The clock keeps running, the wave does not.** `world.beat` advances through a
round exactly as it does through THE FORK — the metronome is the game's
heartbeat and the ear would notice ninety seconds of silence — but `onBeat`'s
field work does not run, so nothing spawns, falls or reaches the hull.
`world.waveBeat` stands still.

It is also the one boss stepped on the **tick** rather than on the beat, and
from `step` rather than from `stepBoss`. A valve that only answered on the beat
would feel like a queue rather than a hand on something.

### A round ends on its own clock, and failing costs the hull

Three phases: a `lead` of four beats so the pair can read two screens that have
just stopped being the field, `play`, and a `verdict` of five beats. Each round
answers one question inside `play` — passed, out of time, or still going.

**Failing breaks the hull.** This is the one rule that was reversed rather than
carried over. The old category said a round may never end the run — *"a run ends
on the field, on a hull that reached zero, in the coordinate system the pair has
been naming out loud all evening"* — and that sentence is **retired**. A boss
that costs nothing is not a boss, it is a screen you wait out. So: the round
does not draw a hull and the hull is still at stake. `world.hullMilli` persists
underneath the round's picture, running out of time takes `cfg.damage<Round>`
off it in the middle column — the round has no columns of its own — and the
scar is still there when the field comes back. A run can end in a round.

What failure costs is a number in `SimConfig` and it is the owner's to turn.

What a round **may** do is give — a pod or two for the act about to start
([systems](systems.md#57-power-ups--the-pod-built)). That is not built. Pods are
wave content and `startWave` replaces `podQueue` wholesale, so the giving needs
a seam into `startWave` that the first round with something to give should cut.

### Its own controls, and not the same ones on both screens

Neither player's band is the answer. A round draws **slabs** instead: whole,
per-seat buttons that replace the band rather than sitting in it.

They are a **control set**, registered in `packages/content/src/control-sets.ts`
beside the field's own. That file used to refuse them, on the ground that the
thing reaching for them was a round and not a wave; a round is a wave now, so
the objection is gone. A set's kind — `band` or `slabs` — is *derived* from the
controls in it (`panelForm`), never declared beside them: the field's own sets
say nothing new, a round's set is a slab panel by virtue of what is in it, and a
set that mixed the two is not a panel and throws.

`slabPanel` in `packages/render/src/slabs.ts` places them, dividing a seat's
width by however many that seat has — so a seat with one button gets one wide
button rather than a gap where two others used to be. **Three readers, one
layout**: the draw, the game's hit test and the director's all ask it, so a
control is never drawn where it is not answered. That property is worth more
than the file it lives in; it was the bug the round shipped with once already.

Two screens showing the same controls would be the field with a different sprite
on it. In THE GAUGE, `showsGaugeMarks` and `showsGaugeValve` are what make them
different, and they are role predicates in render/ for the same reason
`showsQueenHint` is: the information split is a fact about a screen, not about
the world. Which seat may send which command is checked in the simulation.

SNAKE splits both halves at once and it is worth reading as a pattern rather
than as a second example. The **verbs** are split by axis — player 1 has left
and right, player 2 up and down, and a turn only counts across the way the body
is already going, so a corner is physically two seats in an agreed order. The
**information** is split to match: `showsSnakeFood` gives player 1 the food and
both ends of the body, `showsSnakeBody` gives player 2 everything between those
ends and no food. Each seat's extra button then belongs to the half it can see
— the flip to the seat that can see the tail, the brake to the seat watching
what the head is about to hit. A round whose two splits pointed in different
directions would be two puzzles played at once.

## Where they sit in the run

In the act table, as bosses. Ten acts is ten boss slots and twelve rounds is
more than that, so **the run grows more acts** rather than the rounds squeezing
between numbers — which is the other half of what the conversion bought. A
round takes a wave number like anything else, and save points
([structure](structure.md), open question 11) hang off the numbering without
having to know a round is different.

**Wave zero never carries one.** The first thing a pair meets in a run is the
field, or the game has taught them a round whose rules it then throws away.
That is now an authoring rule rather than a check in the simulation, which is
the right place for it: it is a statement about the act table.

THE MIRROR is filed as a boss because it is one — it has a body, it takes
damage, it can kill you — and its Simon Says section is a round *inside* it.
Both readings are true and the distinction is still worth keeping: a boss may
contain a round, and a round is now also a boss.

## The question the whole page hung on, now answered

`CLAUDE.md` rule: **on the field, nothing the players control travels.** No
flight, thrust, dodge or jump. It is the sentence that makes this game the game
it is, and it is the reason the cannon slides along a fixed hull instead of
flying.

Every idea in [the idea store's group](ideas.md#interludes) was written on the
reading that the rule is about **the hull, on the field**, and that a round with
no hull and no field is outside its scope. **That reading is the correct one**,
and [`docs/decisions.md` #21](../decisions.md) says so.

What the rule is for is keeping the field a place where two people talk about
**columns** — everything there has one, and "column four, on the three" is a
complete instruction because of it. None of that reasoning reaches a round with
no columns, and it does not start reaching one because the round is now spelled
`boss:` in the wave list. THE CLAW, THE BELT and THE WELL are not asking for a
relaxation and never were; they are outside the sentence.

THE GAUGE still went first, and for a better reason than caution: it is the
smallest, so the shape it dragged in was the visible part of the work.

## What a round is drawn out of

One rule, and it costs no new art: **slabs and glyphs, never blobs.**

The shape catalogue already carries `slab`, a superellipse described as "made
rather than grown", and `glyphed`, a rim of travelling notches
([the asset catalogue](../asset-catalogue.md)). The field is soft closed
contours with lobes; machinery is hard-edged and labelled. A pair that has
spent an act among blobs knows from the first frame that this is a different
kind of thing, and nothing had to say so. The panel is made of the same word:
a round's buttons are `slab`s in `control-sets.ts` too.

The colours stay: violet and white for the ship's own, red and cyan for the two
that a shot can be ([graphics](graphics.md)). THE GAUGE's band is `pod` amber,
which is already what this game spends on "here, this is the thing"; a call
that landed is `good` green and one that did not is `sparkDim`, which are
already right and wrong everywhere else. A round that invented a third pair
would be teaching a colour vocabulary for ninety seconds.

The two hard rules do not soften: `sim` never imports `render`, and nothing in
`sim` or `content` touches a wall clock, `Math.random` or the DOM. A round
whose difficulty is a wobble in wall-clock time cannot exist here — which rules
out the reflex minigames both reference games are full of, and is why every
candidate hangs off the beat.

**The state it keeps is hashed and cleared.** Every field of the round is in
`hashWorld`, under the boss tag, exactly as the queen's and the maze's are. On
the render side there is nothing to clear: the draw is stateless, so
`Effects.reset()` has none of it to lose.

## Answered, now that one exists

- **Does a run see all twelve, or a few?** All of them, in fixed slots. A draw
  from a pool would break the randomness rule
  ([structure](structure.md#73-the-randomness-rule--built)), which is older than
  this page. What *is* drawn from the rng is what one player knows and the other
  does not — in THE GAUGE, where the band lands and which way it drifts.
- **Does the pair keep a record?** No. The round reports how it went in its
  verdict and nothing outlives it but the damage. A per-pair best is still worth
  having and is still one field; a per-player score is the thing
  [transfers-hazelight](transfers-hazelight.md#refused-with-the-reason) refused.
- **Are they optional?** No, and the question dissolved with the category: a
  boss wave is not optional, it is the wave.

## Still open

- **What happens on a disconnect mid-round?** Better than it was, and not
  solved. A round is world state and is in the fingerprint, so two devices in
  lockstep agree about it tick by tick and the desync ledger watches it like
  everything else. What is missing is a resume: a wave has a beat number to come
  back at, and nothing in [net](../architecture.md) knows a boss wave with no
  field in it needs a different one.
- **What does one sound like?** Nothing yet. The catalogue is built and
  [`bind.ts`](../../packages/audio/src/bind.ts) is exhaustive over `SimEvent`,
  so a round that wants a sound has to earn an event first — deliberately,
  because the first one said everything it needed to say through state alone.
  It now also breaks the hull, which does have a sound, so the first thing a
  pair hears from a round may be the thing they did wrong.
- **What is `damageGauge` actually worth?** Twenty points, chosen so the round
  is not free and defended no further. It is the owner's to turn once they have
  lost one. `damageSnake` is the same twenty for the same event — a round the
  pair did not finish — and `damageSnakeCrash` is eight, which is the number
  with the least behind it on this page: a wall has to cost enough that the
  walls are real and little enough that the round is not over at the first one.
