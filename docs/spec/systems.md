# Systems

> **Status: mixed.** Control visibility, the beat, damage, power-ups and the
> grid behaviour are built. The information split, weapons and destruction are
> design only. Each section says which.

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

## 5.2 Information split — partly built

| Information | Pilot | Navigator |
|---|---|---|
| Position of all creatures | ✔ | ✔ |
| Colours (normal) | ✔ | ✔ |
| Veil: the colour inside | ✔ (only at the flash) | ✘ |
| Radar: rocks + torch (`guard` kinds) | ✔ | ✘ |
| Radar: slick, bulb, queen (`aim` kinds) | ✘ | ✔ |
| Target mix (boss "The Vessel") | ✘ | ✔ |
| Mark: the lance's column and how full it is | ✔ | ✔ |
| Target colour | ✔ | ✔ |

**Built:** the radar rows. The split crosses the controls rather than the
information type ("which" vs "where") the German original proposed — see
`docs/decisions.md` #15 for why. `radarOwner(kind)` in
`packages/content/src/creatures.ts` is the single source; `showsRadar(role,
kind)` in the same file is what `packages/render/src/field.ts`'s `drawRadar`
calls to decide whether a given screen shows an arrival at all.

**Built:** the mark row, as THE LANCE (`primeChargeMilli`, drawn by
`packages/render/src/lance.ts`). It is the one row of this table that is
deliberately *not* split: the player who has to hold the fill and the player
who has to withhold the shot are different people, so both read the same
number.

**Not built:** the veil, target mix and target-colour rows, and the "traces" idea
(where something is coming from) the original table proposed for the
navigator's half — the strip currently shows only that something is coming,
in the colour/kind it will arrive as, at a column.

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

Built: the clock itself at **96 BPM** (`bpm`, `ticksPerBeat`), the beat as
something you can see — grid lines and crossing points light up on every beat
and fade, four beat dots in the HUD, a ring on the shield — and, now, the beat
as something you can hear: `beat.tick` and `beat.accent`, with tones for the
outcomes above. See [audio.md](audio.md), including the part where none of it
has been listened to yet.

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

## 5.5 Weapons — one of three built

Switchable at any time, with **1.5 s of re-arming without firepower** — which
has to be announced, because player 1 must cover the gap.

| Weapon | Effect | |
|---|---|---|
| Standard | single bubble | built |
| Drill | punches through up to 3 segments in a line, slower | built, as THE LANCE |
| Sticky mine | sticks, detonates on the next hit of a *different* colour | not built |

**THE LANCE is the drill, and it is not switched to.** A weapon *selector* would
be a fourth thing on player 2's half, and player 2 already holds both colours;
worse, a weapon chosen once and kept is a state nobody has to say anything
about. So the drill is loaded rather than selected: player 1 fills the cannon
lobe over `lancePrimeBeats` by holding the lance with the cannon still, and the
next shot player 2 fires out of that lobe is the drill — `lancePierce` bodies
of its own colour, at `lanceTilesPerBeat` instead of `bulletTilesPerBeat`.

The original's "1.5 s of re-arming without firepower, which has to be
announced" survives exactly, and is the whole coupling: the fill is roughly two
seconds during which the cannon cannot move and any shot fired spends the fill
on an ordinary bolt. See [couplings](couplings.md) 2 and
`packages/sim/src/lance.ts`.

A rock still stops it and the wrong colour still stops it — a lance is a line,
not a licence ([graphics](graphics.md); a rock cannot be broken because it does
not live).

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

## 5.7 Power-ups — the pod, built

The original design:

- **Slow motion** and **autopilot** (one evasive manoeuvre without sync)
- Visible to both; player 1 has to fly to it, which keeps him from aiming
- The moment is choreographed, **position and escape direction are random**
- Path: in from below, circles beneath the middle, exits sideways
- Does not block the end of a wave

"Player 1 has to fly to it" assumed free flight. **The pod is the re-design.**
Instead of the ship going to the power-up, the power-up comes to the ship, and
the ship has to open for it.

**The pod.** A capsule with a core, amber — neither ammunition colour, so it is
never mistaken for a target that needs a colour called out. It hangs at a fixed
column and row and does nothing at all. It is not an enemy: it is never
cleared, it costs no hull, and it **does not block the end of a wave**, exactly
as the original says.

**Two halves, as everything here has two halves.**

1. **Shooting it loose** needs both players: player 1 holds the column, player 2
   fires. Either colour frees it — a pod is not a creature and has no
   resonance.
2. **Catching it** is player 1 alone, doing two things at once: the cannon in
   the pod's column *and* the maw open at the moment it arrives.

**The fall.** Once loose the pod sinks like a burning wreck — `podFallTilesPerBeat`
(1.5, against a creature's 1) — and slides sideways at `podDriftTilesPerBeat`,
in a **direction drawn from the seeded rng**. That is the original's "escape
direction is random", kept intact: both players see the pod, neither knows
which way it will go until it moves ([structure](structure.md)). A pod freed
near the top of the field takes about **4.2 s** to reach the hull, which
clears [the 4-second rule](latency.md) with nothing to spare — catching one is
meant to be a scramble.

**The maw.** Player 1's second action (`intake`), the sibling of the trigger.
It does not add a part to the ship: it **inverts the cannon lobe**. The same
swelling that fires passes through flat and keeps going, into a throat wider
than the muzzle was tall (`MAW`). Window: `intakeWindowMs`, 800 ms.

**Taking it in.** The skin either side of the maw comes apart while the pod goes
through, and then the whole ship lights from inside and goes out again. The
flash is the receipt — player 1 knows the catch counted without reading a
number. What the pod actually gives is `podRepair` hull points and `scorePod`
score; slow motion and autopilot are still unbuilt and would now be a second
kind of pod rather than a second way of collecting one.

**Missing it costs nothing.** A pod that arrives with the cannon elsewhere, or
with the maw shut, breaks on the skin: no damage, no scar. A missed gift is a
missed gift, not a punishment.

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
