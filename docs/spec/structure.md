# Game structure

> **Status: partly built.** Waves arrive as closed sets with a rest between
> them, and a score exists. Saving, the balance sheet, the leaderboards and the
> first-appearance previews are design only.

- Waves come **all at once as a closed set**, then a short rest, then the next
- Wave length 30–60 s; the rests shrink as the wave number rises
- The hull regenerates slowly during play
- A missed shot in the wrong colour: brief invulnerability
- A shot at an unmarked bulb: bounces off with no effect (has to look visibly
  different from the colour mistake)
- New creature types get a short **animated preview** that pauses the game,
  only on the very first appearance, and both see the same thing. With two
  devices this needs a "both ready" signal

Built: the closed-set arrival, the rest (`waveRestBeats`), and the hull
regeneration. The ten waves that exist are in
`packages/content/src/waves.ts`; they run 10–20 s rather than 30–60, because
they are teaching waves. Not built: invulnerability after a colour mistake, the
bounce-off, the previews.

## 7.1 Saving — not built

- **A save point after every second boss:** wave 20, 40, 60, 80
- Reckoning ~55 s per wave including the rest, twenty waves are about
  18 minutes. For two people coordinating by voice the limit is around 20–25
  minutes in one sitting — long enough to feel earned, short enough for an
  evening
- **Only the wave reached is saved**, not the score — plus the previews already
  seen (creatures and assist forms)
- **The save belongs to the pair, not to the device.** A shared code, otherwise
  one of them has wave 40 and the other wave 20

## 7.2 Score and balance sheet — partly built

- One shared value, a bonus for waves survived, **no breakdown per player**
  (otherwise it becomes an apportioning of blame)
- **SYNC value** after the run: one shared percentage with sub-values (evasion
  sync, colour confidence, timing, reaction consistency). A sub-value from
  which it can be deduced who made the mistake is not one
- **Shared memories** instead of only numbers: longest error-free sequence,
  first boss without damage, fastest joint reaction

Built: the shared score (`scoreDestroy`, `scoreDeflect`, `scoreWave`) and the
ward balance in the HUD, which counts tries, deflections and mistimed attempts
without attributing them (`GuardStats`). Not built: the SYNC value, the
memories. Note that "evasion sync" no longer has anything to measure.

**Two separate leaderboards**, so nobody has to choose between progressing and
the leaderboard. Not built.

| List | Contents |
|---|---|
| **Run** | points from wave 1, without continuing |
| **Progress** | highest wave ever reached |

## 7.3 The randomness rule — built

**The only thing that stays random is what one player knows and the other does
not.**

| random | fixed |
|---|---|
| Veil: the colour inside | positions |
| Target mix (boss "The Vessel") | moments |
| Glyph: the pattern | paths |
| Bulb: the marking colour | order |
| Power-up: position and escape direction\* | colours of normally visible creatures |

**Why:** the core sentence is "talking is the control scheme". If the colour
inside the veil on wave 37 were always blue, the pilot would stop
announcing it on the fourth attempt — both would know it by heart. That is
where the game loses its core, not merely its variety.

\* A deliberate exception: both see the power-up, but nobody knows where it
will fly — which forces a joint decision under incomplete knowledge.

**Struck out:** the small positional scatter. It costs recognisability and
gives nothing back.

In the code: the rule is enforced by construction. `buildQueue`
(`packages/content/src/queue.ts`) seeds an `Rng` from the wave index, so the
same wave always plays the same way, and the authored `WaveEntry` fixes column,
beat and kind. Only a colour written as `"any"` is drawn from the rng.
