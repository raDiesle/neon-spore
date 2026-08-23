# Systems

> **Status: mixed.** Control visibility, the beat, damage and the grid
> behaviour are built. The information split, weapons, destruction and
> power-ups are design only. Each section says which.

## 5.1 Control visibility (Principle A) — built

Every creature type declares which control group it demands:

```ts
{ slick: ["aim"], bulb: ["aim"], meteor: ["guard"] }
```

A wave shows **only the union** of its creatures' groups. If no meteors occur,
the shield controls are invisible **and disabled**. If only one group is
active, it gets the full width and larger controls.

New creature types need nothing but an entry in that table — waves are not
touched. The assist controls ([assists](assists.md)) follow the same rule.

In the code: `CREATURES` and `controlsForKinds` in
`packages/content/src/creatures.ts`, drawn by `packages/render/src/band.ts`.

> The German original wrote this group set with a third group, `dodge`, for the
> rock. `dodge` died with free flight; the meteor's group is `guard`. See
> [roles](roles.md#there-is-no-ship-movement).

## 5.2 Information split — not built

One device today, so both players see the same screen.

| Information | Pilot | Navigator |
|---|---|---|
| Position of all creatures | ✔ | ✔ |
| Colours (normal) | ✔ | ✔ |
| Veil: the colour inside | ✔ (only at the flash) | ✘ |
| Radar: which are coming (the queue) | ✔ | ✘ |
| Radar: where they are coming (traces) | ✘ | ✔ |
| Target mix (boss "The Vessel") | ✘ | ✔ |
| Mark + target colour | ✔ | ✔ |

Radar lines: length = remaining time until arrival; a warning before the
creature is visible. The veil appears on the radar as a question mark.

**Ground rule:** every creature's position is present for both. It may be
incomplete or disturbed (see *The Blind One*, [bestiary](bestiary.md)), but
never absent — otherwise a hit is arbitrary for the person who took it.

## 5.3 The beat — partly built

- ~100 beats/min, every fourth accented, keeps running through pauses
- Sync window = the same beat, instead of an invisible 250 ms
- Teleport jumps, the throb and countdown creatures hang off the beat
- **No soundtrack** — only a sparse click track below the speech range, so it
  does not compete with the voice
- Separate tones for: colour loaded, locked on, manoeuvre succeeded, missed
  shot, damage. Both hear everything — a tone is faster than a sentence
- Silent mode: a pulsing screen border as a visible substitute

Built: the clock itself at **96 BPM** (`bpm`, `ticksPerBeat`), and the beat as
something you can see — grid lines and crossing points light up on every beat
and fade, four beat dots in the HUD, a ring on the shield. **Not built:** the
audio. There is no click track and no tones yet, so the shared clock is
currently visual only.

## 5.4 Bubbles as ammunition — not built

- Shots are bubbles: slow, weaving, growing
- The weave increases with distance, giving a natural range limit
- **Merging:** two bubbles of different colours that catch up with each other
  in flight become one mixed bubble (fresh bubbles are faster than old ones)
- Charging by holding: bigger but more sluggish — a real trade, not a pure
  upgrade

The prototype's shots are grid-snapped and fast by comparison: 12 tiles per
beat, minimum gap half a beat (`bulletTilesPerBeat`, `fireEveryBeats`). The
original's conflict — "while charging, the thumb is blocked for evasion" — no
longer exists, because there is no evasion.

## 5.5 Weapons — not built

Switchable at any time, with **1.5 s of re-arming without firepower** — which
has to be announced, because player 1 must cover the gap.

| Weapon | Effect |
|---|---|
| Standard | single bubble |
| Drill | punches through up to 3 segments in a line, slower |
| Sticky mine | sticks, detonates on the next hit of a *different* colour |

## 5.6 Destruction and damage — partly built

Design:

- Every creature is a polygon; hits cut real pieces out of it
- 3–6 splinters fly off, the broken edge glows briefly
- **The meteor:** craters up to ~15 % material loss, then a hard core is exposed —
  further hits only make sparks. Teaches the rule visually
- Destroyed creatures leave drifting debris
- Impacts leave permanent scars on the shell (open question)
- Limit: ~40 splinters, 12 pieces of debris at once

Built: scars on the hull, which are permanent and visible (`Scar`, `maxScars`),
and craters on the meteor, which keeps its size and stays indestructible
(`holes`, `maxHoles`). Not built: polygon clipping, splinters, debris. The
clipping algorithm is chosen but unimplemented — see `docs/decisions.md`.

## 5.7 Power-ups — not built

- **Slow motion** and **autopilot** (one evasive manoeuvre without sync)
- Visible to both; player 1 has to fly to it, which keeps him from aiming
- The moment is choreographed, **position and escape direction are random**
- Path: in from below, circles beneath the middle, exits sideways
- Does not block the end of a wave

"Player 1 has to fly to it" assumes free flight. Collection needs re-designing
for a cannon that only slides along one row.

## 5.8 Overall behaviour in the raster — built

**Grid.** 11 columns × 15 rows (`cols`, `rows`; the tuning panel allows 7–15
columns). The bottom row is the hull, so a creature walks `rows - 1` = 14
beats — 8.75 s at 96 BPM, which satisfies [the 4-second rule](latency.md).

**Creature movement.** They **glide evenly**, not in steps: exactly one tile
per beat, linearly interpolated, with no pause between tiles. On every beat
they stand exactly on a tile centre. The phase comes straight from the beat
accumulator, so all creatures move in exact sync and without a stutter at the
beat boundary.

Measured in the prototype: 0.945 px per frame, deviation zero; speed 1.600
tiles/s against a target of 1.600.

**Lane fidelity.** The first two creature types (slick, bulb) hold their
column — no lane changes, no turning in towards the hull. Variety is **purely
optical**: the bulb sways in its lane and pumps, the slick glides,
tilts and ripples, meteors drift slightly. None of it touches the tile —
the path stays exactly readable. Lane changing is reserved for later types.

**Damage.**

| Event | Effect |
|---|---|
| Creature reaches the hull | 12 damage, scar at that column |
| Meteor, shield in the wrong column or not triggered | 20 damage, scar |
| Meteor, shield right **and** triggered | 0 damage, deflected |
| Shot hits a meteor | crater; size unchanged, indestructible |

The hull regenerates slowly (`hullRegenPerSecond`).

**Visibility of a deflection.** A successful ward must be unmissable, or the
pair never learns the timing. Built: the shield changes from a thin, permeable
strip to a closed bright dome, the meteor visibly bounces up out of the
picture, a shockwave runs outwards, there is an afterflash, "DEFLECTED"
appears, and a balance runs in the HUD. The denominator is **every** meteor
that reached the hull, not only those with the shield in the column. Failures
with the right position but the wrong moment are counted separately — they are
the interesting failure class (`GuardStats`).

**Shots.** Snap to tile centres, 12 tiles per beat, half a beat of cooldown.
Both hang off the beat, not off each other — otherwise firing faster
accidentally becomes continuous fire.

**Radar.** Only along the top edge, in the object's colour. Height shows the
order: the closer to the edge, the sooner it arrives. There are **no** path
indicators in the field itself, not even for meteors. The only line left is
your own cannon column.

**Keeping watch** ([assists](assists.md)) is **not** implemented in the raster
model: slowing something down would mean skipping a beat here. The mechanic
would have to be re-thought rather than badly translated.
