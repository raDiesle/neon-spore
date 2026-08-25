# Roles and the control model

> **Status: built.** This is what the prototype runs. The free-flight model
> that the German original presented as a live alternative is retired — see
> `docs/decisions.md` #2.

Both players share the same non-negotiable from
[overview](overview.md#12-non-negotiable--speech-is-never-evaluated) and the
same ground rule: **neither can operate everything.**

## There is no ship movement

The players do not fly, thrust, dodge or jump. Nothing the pair controls
traverses the field. The earlier free-flight prototype had a steerable bubble
with thrust and left/right evasion; all of it is gone. What remains is a fixed
hull, a cannon that slides along it, and a shield.

That matters beyond the controls: **`dodge` is not a control group.** The
groups are `aim` and `guard` (`packages/content/src/creatures.ts`). Any part of
the design that says "evasion wave" or "takes the dodge group away" is written
against a model that no longer exists.

## The raster model

Everything snaps to a grid and hangs off the beat. Instead of one movable
bubble there are **three separate elements**: a fixed hull across the full
width, a freely sliding cannon on it, and a shield.

| | Player 1 — PILOT | Player 2 — NAVIGATOR |
|---|---|---|
| Move the cannon (column strip) | ✔ | |
| **Trigger** the shield | ✔ | |
| **Open the maw** (take a pod in) | ✔ | |
| Choose colour and fire | | ✔ |
| **Move** the shield left/right | | ✔ |
| Radar: rocks + torch (`guard` kinds) | ✔ | |
| Radar: slick, bulb, queen (`aim` kinds) | | ✔ |

**Built.** The radar crosses the controls instead of splitting information
types by *which* vs *where*: player 1 sees the rocks coming (`radar: "p1"` in
`packages/content/src/creatures.ts`) but cannot act on them alone — player 2
holds the shield. Player 2 sees the living creatures coming but cannot act on
them alone — player 1 holds the cannon. Either way, the one who knows has to
say so; a split by information type would let the one who reads the strip also
be the one who acts, which needs no voice channel at all. `radarOwner` and
`showsRadar` are the calls; nothing else may re-derive ownership from
`controls`. See `docs/decisions.md` #15.

**Hull.** Visible across the whole lower width; only its upper, jagged edge
reaches into the picture. It does not move. When a creature reaches it, a piece
breaks out at exactly that column — a permanent, visible scar.

**Cannon.** Slides freely and immediately (*not* on the beat) along the hull
and always fires straight up through its current column. Its position snaps to
column centres, nothing in between. Operated by a strip across the full width:
tap or drag.

**Shield.** **Player 2 moves it alone** — player 1 is not involved. The move is
queued and executed on the next beat, so it stays tied to the clock. The shield
is **passively useless**. A meteor is only deflected if **player 1 triggers at
the moment of contact**. Both halves must arrive: the right column (player 2)
and the right moment (player 1). Against creatures the shield does nothing —
those belong to the cannon.

Trigger window: **900 ms** (`guardWindowMs`). The German original said 260 ms
in this section and 600 ms in its own open questions; the prototype ran 600.
It is 900 now: hearing the column, finding it and pressing is three actions
across a voice delay, and 600 ms only ever fitted two of them. See
`docs/decisions.md` #9.

**Maw.** Player 1's second action. It turns the cannon lobe inside out, and a
pod that reaches the hull is taken in only if the cannon is in its column and
the maw is open — the one thing in the game player 1 finishes alone, and only
because player 2 had to shoot the pod loose in the first place. Window: **800 ms**
(`intakeWindowMs`). See [systems](systems.md) 5.7.

## Role choice

Roles are chosen before the game starts — in the finished game, not in the test
phase — with separate high scores per role split, as an incentive to swap.
**Not built.**
