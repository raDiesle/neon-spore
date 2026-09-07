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
the **column**, and what locks is the cannon lobe itself.

**There is no lance button.** The owner took it off the panel on 7 September
2026, and with it the panel that carried it: the fill is on the trigger, so
player 2 **holds** red or cyan instead of tapping it and the cannon lobe fills
over `lancePrimeBeats` — for as long as her thumb stays down **and player 1
keeps the cannon still**. At the top of the fill the shot goes by itself: a
lance in the colour that was held, at half speed, through up to `lancePierce`
bodies of that colour. A thumb that lifts early fires the ordinary shot instead
and the fill is gone.

**Each player has their own, differently shaped part, as warding does.** One
holds a colour down and gets nothing for three beats; the other has to keep a
column he cannot fire from. That is a coupling of two silences rather than two
presses, and it can only be arranged out loud: "column four, hold cyan, don't
let go."

The cost is the hold and nothing else — six ordinary shots not fired while it
fills. A cannon that must not move is a cannon that cannot answer another
column, so a pair that starts one while rocks are falling has decided to take
one. **Sliding never eats the shot**: the fill drops to nothing and starts
again, and the lift still fires the bolt it was always owed. Player 1 moves the
cannon on every wave in the game, and a trigger whose shots vanished when he
did would be a broken trigger rather than a coupling.

In the code: `packages/sim/src/lance.ts`, drawn by `packages/render/src/lance.ts`
(the beam gathering in the column), `packages/render/src/lance-beam.ts` (the
shot itself) and `packages/render/src/lance-flash.ts` (the whole screen taking
the ammunition's colour as it leaves).

**Still open.** The bulb's "mark, then colour" role ([bestiary](bestiary.md))
and "keeping watch" ([assists](assists.md)) were written against the beam and
have not been re-grounded on this.

## 3. Announcing — partly built

One piece of information sits with the person who cannot act on it: the radar,
the veil's colour, the boss target mix. The radar is built and THE VEIL is
built; the boss target mix is not.

THE VEIL is the sharpest version of it the game has, because what it hands the
pilot is not merely information the navigator lacks — it is information that
**goes stale while it is being said**. `veilMorphBeats` is set at one spoken
exchange (docs/spec/latency.md), so a call that leaves the pilot's mouth in
time and arrives late is wrong rather than slow, which is the whole difference
between a game about knowing and a game about saying. This is the whole reason for
[the information split](systems.md#52-information-split--partly-built) and it needs two
devices.
