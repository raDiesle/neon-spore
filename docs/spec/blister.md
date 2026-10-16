# THE BLISTER — a body you knock back down

> **Status: built** — the seven gestures, their looks, the director's settings,
> the guide and two waves. TAP's simulation (lane 1) and its look (lane 2, 8
> October 2026: ROOTED CLOVER, the pore, the bulge and the tap help); HOLD
> (lane 4) the same day; SWIPE (lane 5), TURN (lane 6), RUB (lane 7) and the
> guide and waves (lane 8) on 9 October 2026; COMBO's and LEVER's simulation and
> help on 15 October 2026, their bodies `blister:combo` and `blister:lever` slots after them — COMBO's took BUD and CURL, one per blister, the same day, and RUB's (`blister:rub`) URCHIN, WASHBOARD and PURR, and SWIPE's SLUG and ZIP, its stroke two tiles long, and LEVER's BELL, ROOT and TAFFY, and TAP's MOLE, RIDER and CRADLE. Asked for by the owner on 7
> October 2026: a creature on the principle of whack-a-mole, removed by
> several taps on the screen, with variants removed by a hold, a swipe, a turn
> round it and other gestures that also work with a mouse; the director's
> brush settings say whether player 1, player 2 or both may remove it; one
> picture for every variant, with only the help for the gesture it wants drawn
> over and round it. The work was cut into eight lanes, each an entry in
> `docs/queue.md`.
>
> **One blow since 15 October 2026.** The owner: *once player executed
> correct, it should not appear again, and if time ran out, the wave is lost
> immediately … slightly increase the time players have before lost,
> especially for tapping.* The count, the sinking and the coming up nearer
> are gone; TAP and HOLD stay up three beats, the rest four.
>
> **No border marks since 16 October 2026, and twice the time.** The owner:
> *for "controls" brushes to not show the early indicator on the borders of
> screen … but increase for all "controls" brushes the time players have to
> succeed it, at least double.* `radar: "none"` — no strip mark, no wall
> mark, on either screen; TAP and HOLD stay up six beats, the rest eight.

## In one sentence

**A blister swells up out of a pore in the field and stays up for a few beats
— only the hand allowed to knock it down can do it, only the other seat sees
where it will come up, and if nobody does it in time the wave is lost.**

## What it does

- **It does not fall.** It arrives under a pore — a tile of the field — for
  `blisterDownBeats`, comes up, and stays up for `blisterUpBeats` (TAP and
  HOLD, six) or `blisterUpBeatsLong` (SWIPE, TURN, RUB, COMBO and LEVER,
  eight: more for a thumb that has to carry somewhere once it is there).
  Neither screen marks it on the strip or the wall before it comes up; the
  pore's swell is the only warning. While it is under nothing can touch it; the cannon's bolt passes
  over the pore. It is not the cannon's and not the shield's: `controls: []`,
  a handle on the field is neither group (`.claude/skills/new-creature`).
- **One blow knocks it out.** A tap for TAP, a beat held for HOLD, a stroke
  for SWIPE, a whole turn for TURN, the first turn back for RUB, the knob
  held in the band for LEVER, a press and then a pull for COMBO. It does not
  come back.
- **Unanswered, it loses the wave.** Still up when its beats run out, it
  breaks the hull in its own column — a scar like any other arrival — and the
  wave is lost on that tick (`sim/blister.ts` `stepBlister`). Until 15 October
  2026 it sank instead, came up again `blisterSinkRows` nearer the hull and
  kept a count of blows across its surfacings; four chances, ten seconds.
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
| **TAP** (the plain mole) | `TAP` | taps the blister while it is up | the tap; `tap {id}` routed to the blister as it is to the soundbox | THE PRESS LAB's yellow drop (`press-drop.ts`), STEPS' water one terrace |
| **HOLD** | `HOLD` | presses and keeps the press | ticks held, from `grip` on to `grip` off; a release resets | `drawHoldMark`, with `drawGripDial` running round it |
| **SWIPE** | `SWIPE` | drags across the body the way the arrow points | one stroke the moment the drag passes `blisterSwipeMilli` (two tiles) in that direction, or on the lift that got it there — the one generic PULL (`sim/pull.ts`); let go short, refused out loud (`pullShort`) | the PULL LAB's knob on its channel, never a ring (the owner, 24 September and 13 October 2026) |
| **TURN** (the circle) | `TURN` | drags a full turn round the body, the way the channel points | thousandths of a turn, as the crank's bearing is | `drawMazeLever`, the one turn for every wave (the owner, 5 October 2026) |
| **RUB** | `RUB` | scrubs back and forth over it | reversals, as `packages/render/src/rub-turns.ts` counts them | `drawRubDrop` |
| **LEVER** | `LEVER` | carries the knob down its groove into the band, and holds it there | ticks in the band (`blisterLeverFromMilli`..`blisterLeverToMilli`) towards `blisterLeverBeats`; out of it the count starts again, and a lift before it is done is refused (`pullShort`) | THE LEVER LAB's groove and band (`render/lever-groove.ts`), the PULL LAB's knob, and the handle dial while it is held |
| **COMBO** | `COMBO` | presses it, then pulls the knob that comes in its place, to the right | the press as a `tap` (`blisterPressed`), then SWIPE's stroke; the two are the one blow | the tap's help, then SWIPE's pull in the same place — THE COMBO LAB's PRESS, THEN PULL |

**The body is the same in all seven.** Only the help round it changes, so a
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
*when*; the hand that can do it is drawn neither. When its time runs out it
goes back into the pore over the last third of a beat, and the hull breaks.

The TAP help is the shared set (`render/blister-help.ts`): on the seat that may
tap, `drawMarkHalo` and the press drop; on the other, `drawMarkWait`. The ring
of pips that counted blows owed went with the count. The blow is a
`blisterBlow` event, answered with the green verdict ring
(`render/blister-verdicts.ts`) and THE GORGE's bubble-press cue
(`audio/bind-blister.ts`), and the ordinary kill on the same tick.

The SWIPE help replaces the tap's on the seat that may stroke it: the PULL
LAB's pull every pull wears (`render/pull-knob.ts`, `render/pull-track.ts`) —
the knob on the body with the way in it, riding the furthest stroke still open
(`blisterSwipeShare`), on a channel a stroke long out that way, filling green
behind it. The owner, 13 October 2026: *also should use default pull control
we have, no custom one*. The other seat is drawn the waiting clock, never
the way. The press is a `blisterSwipe` drag (`render/blister-tap.ts`), the lift
carries how far the hand went, and `sim/blister-swipe.ts` judges it.

The TURN help is THE MAZE's turn round the body (`render/blister-turn-help.ts`):
a closed channel a lever's length out, the lever bolted to the body's rim and
THE MAZE's knob on its end, resting at the top with a one-headed arrow the way
the turn counts. The knob goes round with the turn in progress and the channel
fills green behind it; a whole ring is the blow.
The press is a `blisterTurn` drag about the body's centre, read the crank's way
(`render/blister-tap.ts`, `touch-drag.ts` `turnAbout`), and
`sim/blister-turn.ts` counts it.

The RUB help is the game's one rub mark (`render/rub-drop.ts` `drawRubDrop`)
on the body: THE RUB LAB's drop with ZIGZAG on it, one stroke for its one
blow, and the halo round it while nobody is rubbing. The press sends
nothing; the host counts
the reversals (`render/rub-turns.ts`) and every count is a `blisterRub` drag
whose `id` is the count and whose `fromMilli` is the body (`render/rub.ts`) —
the one target that rides it there, because the count already holds `id`.
`sim/blister-rub.ts` deals the blow on the first fresh reversal while it is
up.

The LEVER help is THE LEVER LAB's lever, called and not redrawn: the groove,
its quarter notches and its band are `render/lever-groove.ts`, which the lab
draws from too, laid straight down from the body's centre, `blisterLeverMilli` long; the PULL LAB's
channel runs only to the band's middle, where to hold, and its knob stands
where the thumb put it (`render/blister-lever-help.ts`). While it is held in
the band the band is green and the handle dial sweeps round the knob. The
press is a `blisterLever` drag, every move the carry down the groove
(`render/blister-tap.ts`), and `sim/blister-lever.ts` counts it on the tick.

The COMBO help is THE COMBO LAB's PRESS, THEN PULL, called and not redrawn:
the tap's help until the press lands — a `tap {id}`, which on a COMBO blister
deals nothing and sets `blisterPressed` — and then SWIPE's pull in the same
place, to the right, which is the lab's way (`render/blister-help.ts`). The
pull is SWIPE's `blisterSwipe` stroke, judged by `sim/blister-swipe.ts` once
`blisterStrokes` says the press is done, and the two are the one blow.

## The director's settings

Under the selected cell, the way THE MINE's SEES row is (`tools/director/src/cell-config-mine.ts`). **BY and GESTURE are built** (lane 3, 8 October 2026: `cell-config-blister.ts`, `entry-fields-blister.ts`): GESTURE offers TAP, HOLD and SWIPE (lane 4, the same day: `gesture: "hold"` on the entry, TAP written as no field; lane 5, 9 October 2026: `gesture: "swipe"`; lane 6, the same day: `gesture: "turn"`; lane 7, the same day: `gesture: "rub"`), and WAY is offered only for a gesture that has one — SWIPE's four arrows, `→` written as no field, and TURN's two, `⟳` written as no field. A way the new gesture does not go is dropped when the gesture changes. A HOLD is the ordinary `grip`, so a mouse's press is a thumb's. COUNT, the blows it took, was a row too until 15 October 2026.

**No GESTURE row since 16 October 2026.** The owner: *from brush configs of
e.g. "hold" remove that i can reconfigure it on the map editor to change the
"gesture"*. The CONTROLS brush a blister was painted with is its gesture;
painting another CONTROLS brush over it is the one way to change it, and it
keeps BY.


| Row | Choices | Default |
|---|---|---|
| **BY** | `P1`, `P2`, `BOTH` | `P2` |
| **WAY** | `←`, `→`, `↑`, `↓` for SWIPE; `⟳`, `⟲` for TURN; absent otherwise | `→`, `⟳` |

**BY** is whose hand counts. `BOTH` means either seat may, and the first to
finish the gesture knocks it out; on HOLD two hands fill the beat twice as
fast, and on TURN they wind the one turn between them. The bulge
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
- Whether six beats for TAP and HOLD and eight for the rest (3.75 s and
  5 s at THE BLISTER's 96 bpm, after a swell beat on the partner's
  screen, and with no border mark) is the right pressure *at tempo*, two
  people talking — nobody has seen it yet. It was three and four until 16
  October 2026, and two beats, 1.25 s, with four surfacings before that.
  SURGE's bursts throw SWIPE blisters into its own columns, and a missed one
  there now loses the wave too.
- Whether a wave may carry several blisters up at once. The draft allows it;
  THE BLISTER does not use it, and FIVE BLISTERS ends on two a beat apart,
  one for each hand.

## Its guide and its waves

**THE BLISTER** stands in act nine, straight after THE MINE
(`content/src/waves/`): the mine's split — one seat sees it, the other's
finger answers it on the field — with a clock put on it. Two blisters, the
navigator's, one tap each. Its guide is a film of two pages
(`content/scenes/the-blister.ts`): the pilot sees the pore swell, *say
where*; the navigator, called early, taps it once a beat after it is up,
and it is gone.

**FIVE BLISTERS** stands where THE BLISTER first did, in act fourteen
(`content/src/waves/`): one of each gesture in turn, by turns the
navigator's and the pilot's, and a SWIPE up for the pilot a beat after the
RUB goes up for the navigator. No guide: the help round each body says which
gesture, which is the point of drawing them all on one body.
