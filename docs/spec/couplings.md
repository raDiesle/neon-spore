# The three couplings

> **Status: two of three built.** Warding and marking are in the game.
> Announcing needs creatures and a second device that do not exist yet.

Everything essential follows from these three patterns.

## 1. Warding — built

Position (player 2, moves the shield) AND trigger (player 1, at the moment of
contact). Neither can do it alone.

Each player has **their own, differently shaped part** of one defence: one sets
up in space, the other hits in time. The announcement is not "now" — it is
"column four, I trigger on the three". That produces more to talk about, and it
is visible afterwards who missed their half.

This is the argument that decided the control model. Under a 0.5–2 s voice
delay, a shared instantaneous action is unplayable: the word "now" is already
wrong when it arrives. A shared *beat* is a shared clock, and an announcement
against it survives the trip. See [latency](latency.md) and
`docs/decisions.md` #2.

## 2. Marking — built, as THE LANCE

The original: player 1 holds the aim beam on a creature until the mark locks
in; player 2 fires the matching colour.

There is no aim beam in the raster — the cannon has a column. So the mark is on
the **column**, and what locks is the cannon lobe itself. Player 1 holds a
third button, the lance, and the lobe fills over `lancePrimeBeats` for as long
as the thumb stays down **and the cannon does not move**. Player 2 has no new
button at all: whatever is in the lobe leaves with their next shot. Full, and
it is a lance — half speed, through up to `lancePierce` bodies of its own
colour. Still filling, and the shot is an ordinary one and the fill is gone.

**Each player has their own, differently shaped part, as warding does.** One
holds a place open; the other has to *not act* until it is. That second half is
the new thing — every other coupling in the game is two presses, and this one
is a press and a silence, which can only be asked for out loud: "column four,
holding, don't fire yet."

The cost is the hand, the same rule as [THE GRIP](assists.md#64-the-grip--keep-watch-built).
A thumb on the lance is a thumb off the trigger, and a cannon that must not
move is a cannon that cannot answer another column — so priming while rocks
are falling is a decision to take one.

In the code: `packages/sim/src/lance.ts`, drawn by `packages/render/src/lance.ts`.

**Still open.** The bulb's "mark, then colour" role ([bestiary](bestiary.md))
and "keeping watch" ([assists](assists.md)) were written against the beam and
have not been re-grounded on this. Nor has a wave been authored that needs a
lance — nothing in `packages/content` stacks a column deep enough to be worth
one yet, so today the lance is a thing the pair *can* do rather than a thing a
wave asks for.

## 3. Announcing — not built

One piece of information sits with the person who cannot act on it: the radar,
the veil's colour, the boss target mix. This is the whole reason for
[the information split](systems.md#52-information-split--partly-built) and it needs two
devices.
