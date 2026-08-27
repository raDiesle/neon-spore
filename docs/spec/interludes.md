# Interludes — a round that is not the field

> **Status: not built, and not accepted.** One thing in the game already has
> this shape without being called it — [THE MIRROR](bosses.md#113-the-mirror--your-own-ship-asking-for-your-moves-back),
> which suspends the field, plays Simon Says on the pair's own controls and
> hands the field back. This page is the frame that would let there be a
> second. The twelve candidates are in [the idea store](ideas.md#interludes);
> where they came from is [transfers-hazelight](transfers-hazelight.md).

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

## Where it sits in the run

Between acts, in the gap [The Fork](transfers.md#the-fork) already identifies:
the run stops, and it continues when both thumbs are down. Ten acts is nine
gaps, which is more interludes than anybody should build and exactly the right
number of slots to have.

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

## What failing costs

**Time, and nothing else.** Not hull, not score, not a scar. This is the whole
reason the round can be strange: a pair that has just lost four hull to an act
boss will not thank the game for a novelty round that can also kill them.

What it may do is **give**. A pod is the game's existing reward object —
`mend`, `purge` and `ward`, [systems](systems.md#57-power-ups--the-pod-built) —
and an interlude that hands the next act one or two of them has stakes without
having a punishment. Winning well gives more. Losing gives none and takes
nothing, and the pair walks into the next act exactly as they walked out of the
last one.

The one thing an interlude must never do is **end the run**. A run ends on the
field, on a hull that reached zero, in the coordinate system the pair has been
naming out loud all evening. It does not end because somebody misread a dial.

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

**It needs a decision in `docs/decisions.md` before any interlude is built, and
the decision is not this page's to make.** Written down here so that the
candidates are read as what they are. Each of them says whether it needs the
relaxation, and most say no — a design that survives either answer is worth
more than a better one that is waiting on it. The snake being built beside this
page is the first that genuinely needs it, and is therefore the first real test
of the question rather than of itself.

## What an interlude is drawn out of

One rule, and it costs no new art: **slabs and glyphs, never blobs.**

The shape catalogue already carries `slab`, a superellipse described as "made
rather than grown", and `glyphed`, a rim of travelling notches
([the asset catalogue](../asset-catalogue.md)). The field is soft closed
contours with lobes; machinery is hard-edged and labelled. A pair that has
spent an act among blobs knows from the first frame that this round is a
different kind of thing, and nothing had to say so.

The colours stay: violet and white for the ship's own, red and cyan for the two
that a shot can be ([graphics](graphics.md)). An interlude that invented a
third pair would be teaching a colour vocabulary for ninety seconds.

## What it is built out of

Nothing here needs a new package, and that is most of the argument for the
category being cheap.

| Part | Where it would live |
|---|---|
| The rules of one interlude | `packages/sim` — integers, the seeded `Rng`, the tick counter, exactly as a wave |
| Its picture | `packages/render`, one file per interlude, the same way each boss has one |
| Which interlude sits in which gap | `packages/content` — data, beside the waves |
| Its sounds | `packages/audio`, whose catalogue is built and largely unheard |

The two hard rules do not soften: `sim` never imports `render`, and nothing in
`sim` or `content` touches a wall clock, `Math.random` or the DOM. A round
whose difficulty is a wobble in wall-clock time cannot exist here, interlude or
not — which rules out the reflex minigames both reference games are full of,
and is why every candidate below hangs off the beat.

**The state it keeps must be cleared.** `world.beat`, `world.tick` and
`world.nextId` all restart at zero, and anything in render/ that outlives a
frame belongs in `Effects` and is cleared by `Effects.reset()`
(`CLAUDE.md`, `packages/render/test/restart.test.ts`). An interlude is a second
way a round can start over, and it gets that wrong for free unless it is built
inside that machinery rather than beside it.

## The open questions the category has, before any single design

- **Are they optional?** Split Fiction's side stories are, and the option is
  half of what makes them feel like a gift rather than a gate. Optional here
  means a screen with two buttons and a pair who have to agree — which is
  itself the game, and is also one more thing between an act and the next act.
- **Does a run see all nine, or a few?** The randomness rule is deliberate:
  same wave, same run, and only what one player knows and the other does not
  stays random ([structure](structure.md#73-the-randomness-rule--built)).
  Nine fixed interludes in nine fixed gaps obeys it. A draw from a pool of
  twelve does not, and the rule is older than this page.
- **Does the pair keep a record?** A score on an interlude is a number two
  people can compete over, which is the thing
  [transfers-hazelight](transfers-hazelight.md#refused-with-the-reason)
  refused. A *pair's* best is not. The distinction is one field and it decides
  what the round feels like the second time.
- **What happens on a disconnect mid-interlude?** A wave has a beat number to
  resume at. An interlude has its own clock, and nothing in
  [net](../architecture.md) knows about a second kind of round yet.
