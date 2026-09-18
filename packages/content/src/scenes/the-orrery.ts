import type { GuideScene } from "../scene-types.js";

/**
 * THE ORRERY's rehearsal: three shots on three counted beats, every rock the
 * rings shed guarded one a beat, and the beam standing in the naked core.
 *
 * A core in the middle column with three rings of organs turning around it,
 * one gap each: eight organs on the outer ring, six on the middle turning
 * the other way, four on the inner (`sim/orrery.ts`). A shot up the middle
 * column reaches the core only on a beat every standing ring's gap is at the
 * bottom of its orbit, and only in the colour the core is showing — which
 * changes every time a ring comes off. The outer ring is true on both
 * screens, the middle on the pilot's alone, the inner and the core's colour
 * on the navigator's alone (`render/view-role-clocks.ts`): no seat can count
 * the beat by itself, which is the fight. A ring off sheds three of its
 * organs as rocks and the core spits one of its own every four beats down
 * the gap of the innermost ring standing, never down its own column
 * (`sim/orrery-step.ts`). With every ring gone only the beam takes it.
 *
 * **The beats are the arithmetic.** The rings are anchored to meet first on
 * beat 12 (`orreryFirstBeats`), so the first shot leaves on beat 11 to be
 * judged on beat 12 — the bolt's sixty-five ticks to the top fall in the
 * next beat (`sim/orrery-shot.ts` reads `world.beat` when it leaves the
 * field). With the outer ring off, six and four meet every twelve beats:
 * beat 24, in the colour the core turned to. With the middle off the inner
 * alone opens every four: beat 28. Naked from there, red is held from beat
 * 29 and the beam stands by beat 32 (`lancePrimeBeats`); it goes out over
 * the five beats after, slowed, and is gone on beat 36. THE SLOW opens on
 * the beat before every alignment, so the three windows are each three
 * seconds of real time (`docs/decisions.md` #33).
 *
 * **Every rock is warded where it lands**, and there are eleven: nine shed
 * — one a beat from each break — and two spat, on beats 16 and 20; the
 * core is silent on an open beat and while a ring is still coming off. Each
 * ward is a shield strip marked `atBody` five ticks into the beat before the
 * rock reaches the plating, when that rock is the lowest thing on the field
 * (`sim/scene-aim.ts`, `arrivingFirst`), with a guard seven ticks after it.
 * The columns are the seed's and none is authored: the outer ring's organs
 * come down in 6, 2 and 8, the middle's in 6, 3 and 7, the inner's in 6, 7
 * and 3, and the two spat rocks in 7 and 3. The field is clear on beat 45.
 *
 * **What the film does not show.** The pilot's hand on a ring
 * (`sim/orrery-hand.ts`) — the pair here take the alignments as the anchors
 * give them, which is the fight as the guide tells it; a film that turned a
 * ring would be a second film. And the picture found the sim wrong before a
 * frame of it was written: the three organs off a ring were let go on one
 * beat and landed on one beat in three columns, one more than the shield
 * has, and the wave failed on the first ring. They come off one a beat now
 * and the core's spit clock restarts at a break (`sim/orrery-step.ts`).
 */
export const THE_ORRERY: GuideScene = {
  ticks: 3000,
  bpm: 120,
  seed: 1,
  entries: [],
  boss: { kind: "orrery" },
  acts: [
    // The middle column, and nothing else all fight.
    { tick: 540, control: "cannon", col: 3 },
    // Beat 12, cyan: the outer ring.
    { tick: 660, control: "fireCyan" },
    // Beat 24, red: the middle ring. The outer ring's first organ lands on
    // beat 27, the others on 28 and 29.
    { tick: 1380, control: "fireRed" },
    { tick: 1565, control: "shield", col: 0, atBody: true },
    { tick: 1572, control: "guard" },
    // Beat 28, cyan: the inner ring, on her word alone.
    { tick: 1620, control: "fireCyan" },
    { tick: 1625, control: "shield", col: 0, atBody: true },
    { tick: 1632, control: "guard" },
    { tick: 1685, control: "shield", col: 0, atBody: true },
    { tick: 1692, control: "guard" },
    // Naked: red held from beat 29, standing by beat 32.
    { tick: 1740, control: "fireRed", until: 2100 },
    // The rock spat on beat 16 lands on beat 31, the one from beat 20 on 35.
    { tick: 1805, control: "shield", col: 0, atBody: true },
    { tick: 1812, control: "guard" },
    { tick: 2045, control: "shield", col: 0, atBody: true },
    { tick: 2052, control: "guard" },
    // The middle ring's organs, beats 39 to 41, and the inner's, 43 to 45.
    { tick: 2285, control: "shield", col: 0, atBody: true },
    { tick: 2292, control: "guard" },
    { tick: 2345, control: "shield", col: 0, atBody: true },
    { tick: 2352, control: "guard" },
    { tick: 2405, control: "shield", col: 0, atBody: true },
    { tick: 2412, control: "guard" },
    { tick: 2525, control: "shield", col: 0, atBody: true },
    { tick: 2532, control: "guard" },
    { tick: 2645, control: "shield", col: 0, atBody: true },
    { tick: 2652, control: "guard" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "THREE RINGS · ONE GAP EACH", anchor: { at: "hull" } },
    { tick: 240, seat: 2, text: "THE INNER ONE IS YOURS ALONE", anchor: { at: "hull" } },
    {
      tick: 420,
      seat: 1,
      text: "SAY YOUR GAP · SHE SAYS HERS",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 600,
      seat: 2,
      text: "TWELVE · ITS COLOUR · CYAN",
      anchor: { at: "control", control: "fireCyan" },
    },
    { tick: 840, seat: 1, text: "A RING OFF · IT SHEDS THREE", anchor: { at: "hull" } },
    {
      tick: 1260,
      seat: 2,
      text: "TWO RINGS · NOW IT IS RED",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 1440,
      seat: 1,
      text: "ITS ROCKS · GUARD ONE A BEAT",
      anchor: { at: "control", control: "guard" },
    },
    {
      tick: 1620,
      seat: 2,
      text: "YOUR RING ALONE · CYAN",
      anchor: { at: "control", control: "fireCyan" },
    },
    {
      tick: 1800,
      seat: 2,
      text: "NAKED · HOLD RED · THE BEAM",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 1980,
      seat: 1,
      text: "HOLD THE MIDDLE · IT STANDS",
      anchor: { at: "control", control: "cannon" },
    },
    { tick: 2160, seat: 1, text: "OUT · THE BEAM IN THE SHAFT", anchor: { at: "hull" } },
    {
      tick: 2400,
      seat: 1,
      text: "WHAT IT SHED STILL FALLS",
      anchor: { at: "control", control: "guard" },
    },
    { tick: 2700, seat: 2, text: "NOTHING LEFT IN ORBIT", anchor: { at: "hull" } },
  ],
};
