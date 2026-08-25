# The three couplings

> **Status: one of three built.** Warding is in the game. Marking and
> announcing need creatures and a second device that do not exist yet.

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

## 2. Marking — not built

Player 1 holds the aim beam on a creature until the mark locks in; player 2
fires the matching colour. The mark goes out as soon as the creature starts its
ramming attack.

Marking was designed for free flight, where player 1 had an aim beam. In the
raster the cannon has a column, not a beam. The gesture needs re-inventing
before the bulb's "mark, then colour" role ([bestiary](bestiary.md)) or
"keeping watch" ([assists](assists.md)) can be built.

## 3. Announcing — not built

One piece of information sits with the person who cannot act on it: the radar,
the veil's colour, the boss target mix. This is the whole reason for
[the information split](systems.md#52-information-split--partly-built) and it needs two
devices.
