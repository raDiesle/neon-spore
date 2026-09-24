import type { GuideScene } from "../scene-types.js";

/**
 * THE LEAD's rehearsal: a shot at where it is, four at where it will be, and
 * the beam standing in its way.
 *
 * A body paces the top of the field on a stalk of five segments, a column a
 * beat, turning at the walls, and a shot out of the top hangs a beat in the
 * air before it is judged against the column the body is in *then*
 * (`sim/lead-step.ts`): the sum is her column plus his lean, twice — once
 * for the climb up the field and once for the beat in the air. A hit takes a
 * segment; a beat every shot missed turns it round. From the fourth segment
 * it runs, two columns a beat, and drops a torch in the column it left and a
 * rock in the column a shot has to be put in; on the last segment it stops
 * dead, then makes a pass that only the beam standing in its column ends.
 * The navigator is shown the column and never the lean, the pilot the lean
 * and never the column (`render/view-role-clocks.ts`).
 *
 * **The film is the mistake first.** The first shot goes where the body
 * *is* — column 7, which an author can write — and is judged two beats on
 * against a body two columns further along: a miss, and it doubles back.
 * The four that follow are `atBoss` strips (`sim/boss-answer.ts`
 * `leadLead`): the sum itself, where the body will be when a shot pressed
 * now is judged, one walk for the climb and one for the air. The strip and
 * the fire are in one beat, five and twenty ticks in, because the bolt's
 * sixty-five ticks to the top must fall in the next beat and not the one
 * after — a fire late in the beat is judged a beat later, against a column
 * the sum did not count. Every hit falls where the probe put it: the walk's
 * lead is two, the run's four, and nothing is rolled.
 *
 * **The litter is the field.** The run drops a rock in the very column the
 * next shot has to leave by, on every fourth beat, and a rock stands in a
 * column for the fourteen beats it takes to fall (`fallTilesPerBeat`): a shot
 * through it makes a hole and never leaves the top. So the presses are laid
 * so that no shot is judged the beat after a rock, and the columns the body
 * runs back through are ones no rock stands in. The two torches are warded
 * where they land, the first over columns 4 and 5 by the shield at 5, the
 * second at 2 — and the rock at 2, which lands three beats after the body
 * is down, is warded by the same shield with a second guard.
 *
 * **And the two pages the field took over.** It says `STILL` on the body for
 * the four beats nothing can touch it and `BURN` on it through the pass
 * (`render/boss-cue-read-c.ts`), so the page that said *it stops dead* says why
 * nothing lands instead, and the page that said *hold the beam in its way* says
 * whose lane the beam leaves by. Everything with a number or a direction in it
 * stays written, and there is a great deal of it: this boss's split is the
 * strictest in the game, so the field says no column and no lean at all and the
 * sum is the whole rehearsal.
 *
 * **The pass and the beam.** With one segment the body stops dead at the
 * right wall and the stalk stands upright; on the still's last beat it leans
 * the pass's way. The cannon is put in column 8 and a colour held three beats
 * early, so the beam is standing when the pass comes through at three
 * columns a beat: 10 to 7, across 8, and the body is down where the beam
 * caught it. Every page is on a control or on the hull: the body is a
 * fixture and no anchor names one (`docs/queue.md`, the gauge item).
 */
export const THE_LEAD: GuideScene = {
  ticks: 1500,
  bpm: 120,
  seed: 1,
  entries: [],
  boss: { kind: "lead" },
  acts: [
    // Where it is: column 7 on beat 2, judged on beat 4 against column 9.
    { tick: 125, control: "cannon", col: 4 },
    { tick: 140, control: "fireRed" },
    // Where it will be, at a walk: two ahead of column 8 going left is 6.
    { tick: 305, control: "cannon", col: 0, atBoss: true },
    { tick: 320, control: "fireRed" },
    // At a run, from column 4 going left: 2 then 0, and 0 is the wall.
    { tick: 485, control: "cannon", col: 0, atBoss: true },
    { tick: 500, control: "fireRed" },
    // The torch dropped in column 4 as it ran, warded at 5.
    { tick: 560, control: "shield", col: 3 },
    { tick: 570, control: "guard" },
    // From column 4 going right: 6 then 8; and from 6, 8 then 10.
    { tick: 725, control: "cannon", col: 0, atBoss: true },
    { tick: 740, control: "fireRed" },
    // The torch dropped in column 2, warded there.
    { tick: 745, control: "shield", col: 1 },
    { tick: 755, control: "guard" },
    { tick: 785, control: "cannon", col: 0, atBoss: true },
    { tick: 800, control: "fireRed" },
    // The beam, in column 8, standing when the pass comes through from 10.
    { tick: 970, control: "cannon", col: 5 },
    { tick: 980, control: "fireRed", until: 1250 },
    // The rock dropped in column 2 on beat 8, landing on beat 21.
    { tick: 1230, control: "guard" },
  ],
  steps: [
    { tick: 0, seat: 2, text: "IT PACES · SAY THE COLUMN", anchor: { at: "boss" } },
    { tick: 180, seat: 1, text: "WHERE IT IS · A MISS · TURN", anchor: { at: "boss" } },
    {
      tick: 360,
      seat: 2,
      text: "TWO AHEAD · FIRE · A SEGMENT",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 540,
      seat: 1,
      text: "IT RUNS · THE LEAD IS FOUR",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 720,
      seat: 1,
      text: "TORCH · SHIELD · TWO MORE",
      anchor: { at: "control", control: "guard" },
    },
    // `STILL` stands on the body for the four beats it does (`boss-cue-read-c.ts`),
    // so the page says the part the word cannot: *why* nothing lands.
    { tick: 900, seat: 2, text: "NOTHING TOUCHES IT NOW", anchor: { at: "boss" } },
    {
      tick: 1080,
      seat: 2,
      // `BURN` stands on the body through the pass, so what is left to write is
      // whose lane the beam leaves by — the other half of the one gesture.
      text: "OUT BY THE CANNON'S COLUMN",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 1260,
      seat: 1,
      text: "DOWN · ITS ROCK STILL FALLS",
      anchor: { at: "control", control: "guard" },
    },
  ],
};
