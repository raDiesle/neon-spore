# THE BLISTER — a body you knock back down

> **Status: TAP, HOLD and SWIPE built — TAP's simulation (lane 1) and its look
> (lane 2, 8 October 2026: ROOTED CLOVER, the pore, the bulge and the tap help);
> HOLD (lane 4) the same day; SWIPE (lane 5) on 9 October 2026.** Asked
> for by the owner on 7 October 2026: a creature
> on the principle of whack-a-mole, removed by several taps on the screen, with
> variants removed by a hold, a swipe, a turn round it and other gestures that
> also work with a mouse; the director's brush settings say whether player 1,
> player 2 or both may remove it; one picture for every variant, with only the
> help for the gesture it wants drawn over and round it. The work is cut into
> eight lanes. Lanes 1 to 3 went through `docs/queue.md`; lane 4 (HOLD)
> landed the same day, lane 5 (SWIPE) the next, and lanes 6 to 8 are on the
> queue.

## In one sentence

**A blister swells up out of a pore in the field, stays up for a beat or two,
and sinks again — and only the hand allowed to knock it down can do it, while
only the other seat sees where it will come up next.**

## What it does

- **It does not fall.** It surfaces at a pore — a tile of the field — stays up
  for `blisterUpBeats`, and sinks. While it is down nothing can touch it; the
  cannon's bolt passes over the pore. It is not the cannon's and not the
  shield's: `controls: []`, a handle on the field is neither group
  (`.claude/skills/new-creature`).
- **Unanswered, it comes up nearer.** Each time it sinks without being knocked
  out it surfaces again `blisterSinkRows` lower, in a column the seeded `Rng`
  picks. A blister that surfaces on the hull row breaks the hull at its column,
  a scar like any other arrival, and is gone. The first surfacing is high
  enough to keep the four seconds from visible to impact.
- **It takes several blows, and keeps count across surfacings.** `count` on the
  wave entry is how many: taps for TAP, beats for HOLD, strokes for SWIPE and
  RUB, turns for TURN. A tap that lands while it is up is one off the count,
  and the count does not grow back while it is down — that is the mole: you
  wait for it, you hit it, it goes, you wait again. A HOLD's blow is a whole
  beat held: the beats already held are kept across a sink as taps are, and
  the beat in progress is lost on a release or a sink — the only reading under
  which a count larger than the up-time can be won (`sim/blister-hold.ts`).
  A TURN started and not finished before it sinks starts again from nothing
  next time.
- **Where it comes up next is the talking.** A beat before it surfaces the
  pore swells — a bulge in the membrane, on **one screen only**: the seat that
  is *not* the one knocking it down. The hand that can do it sees the blister
  when it is up and not the bulge before; its partner sees the bulge and cannot
  touch it. With an up-time of a beat or two, a hand that waits to see it
  arrives late: *"left, third row — now."* That is the communication test
  answered twice — new information, and new timing.

## The gestures

Every one of them is one pointer, so a mouse does it as well as a thumb: a
click, a press held, a drag. Pinch, two thumbs, a chord and a shake are left
out on purpose — a desk with a mouse has none of them.

| Gesture | The player reads | What the hand does | What the simulation counts | Its help, called and not redrawn |
|---|---|---|---|---|
| **TAP** (the plain mole) | `TAP` | taps the blister while it is up | taps; `tap {id}` routed to the blister as it is to the soundbox | `drawInstarGlyph`'s flaring dots, and one pip round the body for each tap still owed |
| **HOLD** | `HOLD` | presses and keeps the press | ticks held, from `grip` on to `grip` off; a release resets | `drawHoldMark`, with `drawGripDial` running round it |
| **SWIPE** | `SWIPE` | drags across the body the way the arrow points | one stroke when the drag passes `blisterSwipeMilli` (one tile) in that direction, judged on the lift | `drawInstarTrack` — a bar, never a ring (the owner, 24 September 2026) |
| **TURN** (the circle) | `TURN` | drags a full turn round the body, the way the channel points | thousandths of a turn, as the crank's bearing is | `drawMazeLever`, the one turn for every wave (the owner, 5 October 2026) |
| **RUB** | `RUB` | scrubs back and forth over it | reversals, as `packages/render/src/rub-turns.ts` counts them | `drawRubMark` |

**The body is the same in all five.** Only the help round it changes, so a
wave can mix them and the pair reads *which* from the help, never from the
shape. Whose it is, was it right and how far it has got are the shared pieces
too: `drawMarkHalo` on the seat that may act, `drawMarkWait` on the seat that
may not, `GripVerdicts` and `drawVerdictRing` on every stroke, the green
progress ring a held mark wears. **The partner's screen never shows the
gesture** (`docs/controls-catalogue.md`, *Not allowed*) — it shows the bulge
before and the waiting clock during.

## The look, as built

**ROOTED CLOVER** (`content/silhouettes-blister.ts`): BULB · CLOVER's four
deep lobes with SINKER's roots on the underside, drawn a little larger than
the plain footprint so it is told apart from THE LEECH and THE MINE, the two
other fours. It comes up out of a dark pore over a third of a beat, clipped at
the pore's mouth, and goes back in the same way (`render/blister.ts`).

On the screen of the seat that may not knock it down, the pore is drawn shut
while it is under — *where* — and swells into a dome on the last beat —
*when*; the hand that can do it is drawn neither. On the beat it sinks the
pore glides to the next one, which the simulation picks on that beat.

The TAP help is the shared set (`render/blister-help.ts`): on the seat that may
tap, `drawMarkHalo` and the tap glyph; on the other, `drawMarkWait`; on both,
THE MINE's ring of pips, one per blow still owed (`render/pip-ring.ts`). Every
blow that counts is a `blisterBlow` event, answered with the green verdict ring
(`render/blister-verdicts.ts`) and THE GORGE's bubble-press cue pitched up a
step a blow (`audio/bind-blister.ts`).

The SWIPE help replaces the tap's on the seat that may stroke it: THE INSTAR's
swipe track (`render/instar-track.ts`) laid across the body along its way, a
bar with its chevrons pointing the way and its fill the furthest stroke still
open (`blisterSwipeShare`). The other seat is drawn the waiting clock, never
the way. The press is a `blisterSwipe` drag (`render/blister-tap.ts`), the lift
carries how far the hand went, and `sim/blister-swipe.ts` judges it.

## The director's settings

Under the selected cell, the way THE MINE's SEES row is (`tools/director/src/cell-config-mine.ts`). **BY, GESTURE and COUNT are built** (lane 3, 8 October 2026: `cell-config-blister.ts`, `entry-fields-blister.ts`): GESTURE offers TAP, HOLD and SWIPE (lane 4, the same day: `gesture: "hold"` on the entry, TAP written as no field; lane 5, 9 October 2026: `gesture: "swipe"`), and WAY is offered only for a gesture that has one — SWIPE's four arrows, `→` written as no field. A HOLD is the ordinary `grip`, so a mouse's press is a thumb's, and a hand left on one that sinks is let go of on the tick.


| Row | Choices | Default |
|---|---|---|
| **BY** | `P1`, `P2`, `BOTH` | `P2` |
| **GESTURE** | `TAP`, `HOLD`, `SWIPE`, `TURN`, `RUB` | `TAP` |
| **COUNT** | 1–8 | 3 |
| **WAY** | `←`, `→`, `↑`, `↓` for SWIPE; `⟳`, `⟲` for TURN; absent otherwise | `→`, `⟳` |

**BY** is whose hand counts. `BOTH` means either seat may, and their blows go
on one count: two hands on one blister finish it twice as fast. The bulge
follows BY: P1 knocks down, P2 sees the bulge, and the other way round.
With `BOTH` both screens show the bulge — the setting with the least to
say, for a guide's first page or a crowded wave, never for the wave that
teaches the talking.

Each field lives on `WaveEntry` and `SpawnEntry`, is copied in the content
queue, set on spawn, and hashed — the ghost's `path` is the worked example
from end to end.

## What it is not

- **Not a contest.** The whack-a-mole of the Hazelight games is a race between
  two people on one screen, and `docs/borrowed.md` says why that does not come
  over. This one is co-op: one sees, the other strikes.
- **Not travel.** Nothing the pair controls moves; the hand acts on a body in
  place, as THE MINE's tap and every boss's mark already do.
- **Not a microphone.** Nothing listens.

## Left open

- Whether a blow on an empty pore — a tap where it was, a beat late — costs
  anything. The draft says no: the late tap is its own punishment.
- `blisterUpBeats` and `blisterSinkRows`: the guide's wave measures them; the
  draft is 2 beats and 3 rows. Lane 1 added two more: `blisterDownBeats`, the
  beats under between surfacings (2, the last of them the bulge's), and
  `blisterBlows`, the count when a wave names none (3).
- Whether a wave may carry several blisters up at once. The draft allows it and
  the first wave does not use it.

## Lanes 5 to 8

Lane 4, HOLD, landed on 8 October 2026, and lane 5, SWIPE, on 9 October. TURN, RUB and the real guide
had been postponed here, and the owner put them back on the queue the same
evening: each is an entry in `docs/queue.md` titled *THE BLISTER, lane N*,
worked in order.
