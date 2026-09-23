import type { GuideScene } from "../scene-types.js";

/**
 * THE ORRERY's rehearsal: three rings cracked on three counted beats and each
 * one wound off by hand, every rock the rings shed guarded one a beat, and the
 * beam standing in the naked core.
 *
 * A core in the middle column with three rings of organs turning around it,
 * one gap each: eight organs on the outer ring, six on the middle turning
 * the other way, four on the inner (`sim/orrery.ts`). A shot up the middle
 * column reaches the core only on a beat every standing ring's gap is at the
 * bottom of its orbit, and only in the colour the core is showing — which
 * changes every time a ring comes off. The outer ring is true on both
 * screens, the middle on the pilot's alone, the inner and the core's colour
 * on the navigator's alone (`render/view-role-clocks.ts`): no seat can count
 * the beat by itself, which is the fight.
 *
 * **A landed shot does not take a ring off; it cracks it.** The gap is
 * knocked `orreryCrackOrgans` short of the bottom and the ring jams there,
 * and the shaft stays shut until the pilot's thumb winds the gap home — one
 * organ a beat, and the detent that lands it at the bottom is what takes the
 * ring away (`sim/orrery-hand.ts`). So every ring costs two gestures off two
 * seats: her count and his trigger, then his thumb. A ring off sheds three of
 * its organs as rocks and the core spits one of its own every four beats down
 * the gap of the innermost ring standing, never down its own column
 * (`sim/orrery-step.ts`). With every ring gone only the beam takes it.
 *
 * **The beats are the arithmetic.** The rings are anchored to meet first on
 * beat 12 (`orreryFirstBeats`), so the first shot leaves on beat 11 to be
 * judged on beat 12 — the bolt's sixty-five ticks to the top fall in the
 * next beat (`sim/orrery-shot.ts` reads `world.beat` when it leaves the
 * field). The crack lands there and the outer ring is off on beat 14, two
 * organs of thumb later. **A crack writes only the cracked ring's anchor**, so
 * the rings still turning keep the arithmetic they had: with the outer ring
 * off, six and four meet every twelve beats — beat 24, in the colour the core
 * turned to, and off on beat 26. With the middle off the inner alone opens
 * every four: beat 28, off on beat 30. Naked from there, red is held from
 * beat 29 and the beam stands by beat 32 (`lancePrimeBeats`); it goes out
 * over the five beats after, slowed, and is gone on beat 36. THE SLOW opens
 * on the beat before every alignment, so the three windows are each three
 * seconds of real time (`docs/decisions.md` #33).
 *
 * **Every rock is warded where it lands**, and there are ten: eight shed —
 * one a beat from each break, the last ring's third never let go because the
 * beam had taken the core by then — and two spat, on beats 19 and 23. The
 * core is silent until a ring is actually off, on an open beat, and while a
 * ring is still coming off. Each ward is a shield strip marked `atBody` five
 * ticks into the beat before the rock reaches the plating, when that rock is
 * the lowest thing on the field (`sim/scene-aim.ts`, `arrivingFirst`), with a
 * guard seven ticks after it. The columns are the seed's and none is
 * authored: the outer ring's organs come down in 6, 8 and 2, the middle's in
 * 6, 3 and 7, the inner's in 6 and 7, and the two spat rocks in 3 and 7. The
 * field is clear on beat 45.
 *
 * **The hand, and where the film lets go of it.** All three rings are wound
 * here, and the third is wound in two pieces (`acts`): a rock comes down in
 * the middle of it, and the hand that winds is the hand that wards. So the
 * thumb comes off the ring, marks the strip and goes back — and what it had
 * already turned is banked across the lift (`windMilli`), which is the only
 * reason the split costs nothing. A clean wind would be the easier picture
 * and the dishonest one: a pair playing this is interrupted every time.
 *
 * **And the picture found the sim wrong before a frame of it was written**:
 * the three organs off a ring were let go on one beat and landed on one beat
 * in three columns, one more than the shield has, and the wave failed on the
 * first ring. They come off one a beat now and the core's spit clock restarts
 * at a break (`sim/orrery-step.ts`).
 */
export const THE_ORRERY: GuideScene = {
  ticks: 3000,
  bpm: 120,
  // Written and proved with no shot grid; on the game's half-beat one
  // half the shed rocks go unwarded and the hull is breached (`scene-types.ts` `chargeBeats`).
  chargeBeats: 0,
  seed: 1,
  entries: [],
  boss: { kind: "orrery" },
  acts: [
    // The middle column, and nothing else all fight.
    { tick: 540, control: "cannon", col: 3 },
    // Beat 12, cyan: the outer ring **cracks**, and the shot is only half of
    // it (`sim/orrery-step.ts`).
    { tick: 660, control: "fireCyan" },
    // The other half: the thumb on the ring, two organs at one a beat, and
    // the detent that brings the gap to the bottom takes the ring off
    // (`sim/orrery-hand.ts`). The hand comes off on the beat it breaks.
    { tick: 740, drag: "orreryRing", until: 860 },
    // Beat 24, red: the middle ring cracks, and it is wound the same way —
    // this one drawn true on his screen alone.
    { tick: 1380, control: "fireRed" },
    { tick: 1460, drag: "orreryRing", until: 1580 },
    // The outer ring's organs land on beats 27, 28 and 29.
    { tick: 1565, control: "shield", col: 0, atBody: true },
    { tick: 1572, control: "guard" },
    // Beat 28, cyan: the inner ring, on her word alone.
    { tick: 1620, control: "fireCyan" },
    { tick: 1625, control: "shield", col: 0, atBody: true },
    { tick: 1632, control: "guard" },
    { tick: 1685, control: "shield", col: 0, atBody: true },
    { tick: 1692, control: "guard" },
    // And the last winding, on the ring he cannot see at all — **let go of
    // halfway through**, because a rock is coming down and the hand that
    // winds is the hand that wards. The bank is kept across the lift
    // (`orreryWoundMilli`), so the second half pays the organ the first half
    // did not.
    { tick: 1700, drag: "orreryRing", until: 1796 },
    // Naked: red held from beat 29, standing by beat 32.
    { tick: 1740, control: "fireRed", until: 2100 },
    { tick: 1805, control: "shield", col: 0, atBody: true },
    { tick: 1812, control: "guard" },
    { tick: 1820, drag: "orreryRing", until: 1850 },
    { tick: 2045, control: "shield", col: 0, atBody: true },
    { tick: 2052, control: "guard" },
    // The middle ring's organs and the inner's, still falling after it is out.
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
    { tick: 0, seat: 1, text: "THREE RINGS · ONE GAP EACH", anchor: { at: "boss" } },
    {
      tick: 240,
      seat: 2,
      text: "THE INNER ONE IS YOURS ALONE",
      anchor: { at: "boss", part: "ring" },
    },
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
    {
      tick: 780,
      seat: 1,
      text: "IT CRACKS · TURN IT OPEN",
      anchor: { at: "boss", part: "ring" },
    },
    { tick: 960, seat: 1, text: "A RING OFF · IT SHEDS THREE", anchor: { at: "boss" } },
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
      text: "NAKED · A BOLT IS SPENT",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 1980,
      seat: 1,
      text: "THE BEAM USES YOUR COLUMN",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 2160,
      seat: 1,
      text: "OUT · THE BEAM IN THE SHAFT",
      anchor: { at: "boss", part: "core" },
    },
    {
      tick: 2400,
      seat: 1,
      text: "WHAT IT SHED STILL FALLS",
      anchor: { at: "control", control: "guard" },
    },
    { tick: 2700, seat: 2, text: "NOTHING LEFT IN ORBIT", anchor: { at: "boss" } },
  ],
};
