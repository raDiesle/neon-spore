# Interludes — a round that is not the field

> **Status: the shell is built, and one interlude with it.** THE GAUGE is in
> `packages/sim/src/gauge.ts` and its picture in `packages/render/src/gauge.ts`;
> the frame every other one enters through is `packages/sim/src/interlude.ts`
> and `packages/render/src/interlude.ts`. One thing in the game already had
> this shape without being called it —
> [THE MIRROR](bosses.md#113-the-mirror--your-own-ship-asking-for-your-moves-back),
> which suspends the field, plays Simon Says on the pair's own controls and
> hands the field back. The other eleven candidates are in
> [the idea store](ideas.md#interludes); where they came from is
> [transfers-hazelight](transfers-hazelight.md).

## What an interlude is

A **short round with its own rules, its own controls and its own picture**, in
which the hull does not exist and nothing falls. It has a beginning, one rule,
four or five repetitions of that rule, and an end. It is over in about ninety
seconds. Nothing it teaches is used again.

Three things make it one, and all three are required:

1. **The field is gone.** Not decorated, not re-skinned, not paused behind a
   panel — gone. Eleven columns and fifteen rows are what the pair spends a run
   learning to talk about, and a round that borrows the grid is a wave with a
   costume on.
2. **Neither player can play it alone.** Each holds half the information or
   half the verbs, and the round does not resolve without both. This is filter
   6 in [transfers-hazelight](transfers-hazelight.md#the-filter) and it is the
   one that most candidates fail.
3. **It is learnt in one sentence.** No briefing, no tutorial, no legend. The
   pair looks at two devices, one of them says what they can see, and that is
   the teaching.

## The four decisions the shell makes

These were settled when THE GAUGE was built, and the next eleven inherit them.
Each was a real fork; the argument matters more than the answer.

### A mode the world enters, not a world of its own

`world.interlude` is a field on `World` and an early return in `step`. The
alternative — a second `World` with its own `step` — keeps the field's rules
from growing a second meaning, and it was rejected because of the seam rather
than the rules: two worlds need a supervisor holding the switch between them,
and that supervisor is the one piece of state no fingerprint covers. Two
devices could then agree about everything inside a round while disagreeing
about *which round they are in*. One world keeps one `step`, one `hashWorld`,
one replay format and one command stream.

The price — the word "round" meaning two things — is paid where it is
cheapest. `step` returns before it reaches a single rule of the field, so
`bullets.ts`, `beat.ts` and `hull.ts` never learn the word "interlude".

### The field is gone, and it costs nothing to make it gone

`Canvas2DRenderer.draw` hands the whole stage to `drawInterlude` and returns.
There is no grid, no hull and no band underneath.

That is free because of *where* the seam is cut: an interlude opens only at a
gap where the field is already empty and the next wave has not started. It
never has to answer what happens to the rock in the air, because there is never
a rock in the air. An interlude that could interrupt a live wave would need an
answer, and there is no good one.

**The clock keeps running, the wave does not.** `world.beat` advances through a
round exactly as it does through THE FORK — the metronome is the game's
heartbeat and the ear would notice ninety seconds of silence — but `onBeat`'s
field work does not run, so nothing spawns, falls or reaches the hull.
`world.waveBeat` stands still: the wave has not begun.

### A round ends on its own clock, and failing costs time

Three phases, and they belong to the shell rather than to any one round: a
`lead` of four beats so the pair can read two screens that have just stopped
being the field, `play`, and a `verdict` of five beats. Each interlude answers
one question inside `play` — passed, out of time, or still going — and inherits
the lead-in, the verdict and the way out.

Passing and failing leave by the same door: `closeInterlude` marks the gap
spent and pushes the `needWave` the round was standing in front of. **No hull,
no score, no scar.** It is less a rule the shell enforces than one it makes easy
to keep: nothing in `interlude.ts` writes to any of them.

What an interlude **may** do is give — a pod or two for the act about to start
([systems](systems.md#57-power-ups--the-pod-built)). That is not built. Pods
are wave content and `startWave` replaces `podQueue` wholesale, so the giving
needs a seam into `startWave` that the first interlude with something to give
should cut.

The one thing an interlude must never do is **end the run**. A run ends on the
field, on a hull that reached zero, in the coordinate system the pair has been
naming out loud all evening. It does not end because somebody misread a dial.

### Its own controls, and not the same ones on both screens

Neither player's band is the answer. THE GAUGE draws its own: two held slabs
for the pilot's valve and one for the navigator's call, laid out by
`interludeControls` in `packages/render/src/interlude.ts` — the one place both
the draw and the hit test read, so a control is never drawn where it is not
answered. They arrive as their own commands, `valve` and `call`, and which seat
may send which is checked in the simulation, not in the picture.

Two screens showing the same controls would be the field with a different
sprite on it. `showsGaugeMarks` and `showsGaugeValve` are what make them
different, and they are role predicates in render/ for the same reason
`showsQueenHint` is: the information split is a fact about a screen, not about
the world.

## Where it sits in the run

Between acts, in the gap [The Fork](transfers.md#the-fork) already identifies:
the run stops, and it continues when both thumbs are down. Ten acts is nine
gaps, which is more interludes than anybody should build and exactly the right
number of slots to have.

The entry is the second meaning of `needWave`. The fork is crossed, the sim
asks for the next wave, and the host asks first whether the gap in front of it
carries a round (`enterInterludeIfDue`, `apps/game/src/interlude.ts`). If it
does, the round opens instead; when the round ends it asks for the *same* wave
again, and the second ask builds it. `world.interludeDone` is what stops the
question looping.

Nothing arranges the order — fork, then interlude, then the wave and its card —
it falls out of a fork being the only way a `needWave` reaches the host between
two waves. And there is no second "both of you press something" gate: the fork
already was one, and stacking two is how a gesture stops meaning anything.

**Wave zero never carries one.** The first thing a pair meets in a run is the
field, or the game has taught them a round whose rules it then throws away.

It is **not** a wave, and this matters for bookkeeping. Waves are numbered,
save points hang off the numbering ([structure](structure.md), open question
11), and an interlude that took a number would shift every save point in the
game by one per act. It sits *between* numbers, or it does not sit anywhere.

It is also not a boss. A boss holds the tenth slot of an act, carries that
act's pillar, and is the exam ([wave-design](wave-design.md)). An interlude
carries no pillar and examines nothing. THE MIRROR is filed as a boss because
it is one — it has a body, it takes damage, it can kill you — and its Simon
Says round is the interlude *inside* it. Both readings are true and the
distinction is worth keeping: a boss may contain an interlude, an interlude is
never a boss.

## The question the whole page hangs on

`CLAUDE.md` rule: **nothing the players control travels the field.** No flight,
thrust, dodge or jump. It is the sentence that makes this game the game it is,
and it is the reason the cannon slides along a fixed hull instead of flying.

Every idea in [the idea store's interlude group](ideas.md#interludes) is
written on the reading that this rule is about **the hull, on the field**, and
that a round with no hull and no field is outside its scope. That reading is
not obviously right. It is not obviously wrong either — the rule exists so that
two people naming a column mean the same column, and an interlude with no
columns has nothing to disagree about.

**It still needs a decision in `docs/decisions.md`, and the shell being built
does not make it.** THE GAUGE was chosen to go first partly because it does not
need the relaxation: a needle is not a thing that travels a field, it is a
number in thousandths. The candidates that do need it are still waiting on the
answer, and the snake is the first that genuinely tests the question rather
than itself.

## What an interlude is drawn out of

One rule, and it costs no new art: **slabs and glyphs, never blobs.**

The shape catalogue already carries `slab`, a superellipse described as "made
rather than grown", and `glyphed`, a rim of travelling notches
([the asset catalogue](../asset-catalogue.md)). The field is soft closed
contours with lobes; machinery is hard-edged and labelled. A pair that has
spent an act among blobs knows from the first frame that this round is a
different kind of thing, and nothing had to say so.

The colours stay: violet and white for the ship's own, red and cyan for the two
that a shot can be ([graphics](graphics.md)). THE GAUGE's band is `pod` amber,
which is already what this game spends on "here, this is the thing"; a call
that landed is `good` green and one that did not is `sparkDim`, which are
already right and wrong everywhere else. An interlude that invented a third
pair would be teaching a colour vocabulary for ninety seconds.

## What it is built out of

Nothing here needs a new package, and that is most of the argument for the
category being cheap.

| Part | Where it lives |
|---|---|
| The shell: phases, the gate, the way in and out | `packages/sim/src/interlude.ts` |
| The rules of one interlude | `packages/sim/src/gauge.ts` — integers, the seeded `Rng`, the tick counter, exactly as a wave |
| Its tunables | `packages/sim/src/config-gauge.ts`, spread into `DEFAULT_CONFIG` |
| The takeover, the controls, the verdict | `packages/render/src/interlude.ts` |
| Its picture | `packages/render/src/gauge.ts`, one file per interlude, the same way each boss has one |
| Which gap carries which round | `apps/game/src/interlude.ts` today; it belongs in `packages/content`, beside the waves |
| Its sounds | `packages/audio` — **not built for any interlude.** The metronome runs through a round and nothing else does |

The two hard rules do not soften: `sim` never imports `render`, and nothing in
`sim` or `content` touches a wall clock, `Math.random` or the DOM. A round
whose difficulty is a wobble in wall-clock time cannot exist here, interlude or
not — which rules out the reflex minigames both reference games are full of,
and is why every candidate hangs off the beat.

**The state it keeps is hashed and cleared.** Every field of an interlude is in
`hashWorld`, including `interludeDone`, which decides whether a `needWave` is
answered with the wave or with the round in front of it — two devices
disagreeing about that would deal themselves different rounds without ever
disagreeing about a tick. On the render side there is nothing to clear:
`drawInterlude` is stateless, so `Effects.reset()` has none of it to lose.

**It is off by default.** `interludes` sits beside `briefings` and
`forkBetweenWaves` in `config-pair.ts` and is on only in `PAIR_ON` and in
`apps/game`. A headless caller has one thumb at most — the director's loop
answers its own `needWave`, a replay walks recorded input, a determinism run
wants the wave — and every one of them would sit at a dial nobody can turn.

## Answered, now that one exists

- **Does a run see all nine, or a few?** All of them, in fixed gaps. A draw from
  a pool would break the randomness rule
  ([structure](structure.md#73-the-randomness-rule--built)), which is older than
  this page. What *is* drawn from the rng is what one player knows and the other
  does not — in THE GAUGE, where the band lands and which way it drifts.
- **Does the pair keep a record?** No. The round reports how it went in its
  verdict and nothing outlives it. A per-pair best is still worth having and is
  still one field; a per-player score is the thing
  [transfers-hazelight](transfers-hazelight.md#refused-with-the-reason) refused.

## Still open

- **Are they optional?** Not built; today the gap either carries one or does
  not. Optional means a screen with two buttons and a pair who have to agree —
  which is itself the game, and is also one more thing between an act and the
  next act.
- **What happens on a disconnect mid-interlude?** Better than it was, and not
  solved. A round is world state and is in the fingerprint, so two devices in
  lockstep agree about it tick by tick and the desync ledger watches it like
  everything else. What is missing is a resume: a wave has a beat number to come
  back at, and nothing in [net](../architecture.md) knows there is a second kind
  of round to come back into.
- **What does one sound like?** Nothing yet. The catalogue is built and
  [`bind.ts`](../../packages/audio/src/bind.ts) is exhaustive over `SimEvent`,
  so an interlude that wants a sound has to earn an event first — deliberately,
  because the first round said everything it needed to say through state alone.
