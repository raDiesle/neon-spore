import type { GuideScene } from "../scene-types.js";

/**
 * THE LEDGER's rehearsal: two hits landed, two bills paid, and the seam wider
 * for the second one than the pair paid for.
 *
 * The body hangs over the middle column on a cord rooted in the pair's own
 * hull (`sim/ledger.ts`). A bolt of the colour it shows, up the seam down its
 * middle, widens the seam by one and rerolls the colour — and starts a
 * return down the cord that lands in the socket `ledgerCadence` beats later,
 * a beat fewer for every hit. The return is warded the way a rock is: the
 * plate in the socket and the trigger on the beat it lands (`sim/hull.ts`),
 * or the hull takes it and the wave is lost. Every return that reaches the
 * hull walks the socket a column along the ship. From the second hit on the
 * cord charges for every shot fired at anything, and a warded return is
 * thrown back up it and whips the seam wider for nothing.
 *
 * **The film is two returns, both warded, and the seed decides the colours.**
 * The colour the seam shows is rolled at install and after every hit, so
 * this seed's are the ones the two presses below are authored against: cyan
 * first, red after. The socket is where the plate stands, and after the first
 * return it is column 6, which no authored column reaches — so the strip is
 * carried there by `atBoss` (`sim/boss-answer.ts`), which is the socket
 * wherever it has walked to. Each guard press goes off forty ticks before
 * the landing beat, inside `guardWindowMs`, THE CRAWLER's arrangement.
 *
 * **What it shows of the split.** The pilot's screen draws the bead coming
 * down the cord and the beats left beside it; the navigator's draws the
 * socket and its lock (`render/view-role-clocks.ts`). One says *when*, the
 * other says *where*, and the pages are dealt to the seat that can see what
 * the page is about. The colour is on the body and on both screens.
 *
 * **And the page that said *fire it up the seam* no longer does.** The field
 * says `FIRE` on the seam and `MOVE` on the cannon while it is not under it
 * (`render/boss-cue-read-o.ts`), which is the column this rehearsal used to be
 * the only thing carrying. What the page says instead is the part neither word
 * can: the bolt leaves *his* column, so the two of them are one gesture, and
 * the columns either side of the seam are the body's own plating. The colour
 * stays written, because the field never says a colour.
 *
 * **What is prose.** The bill for a shot at anything else, and the fifth
 * return that the plate must *not* stand under: the second is the one
 * gesture in the game that is a thumb lifting off, which no film shows well,
 * and the first is a page about a cost with nothing on the screen to point
 * at. Both are said, in the last two pages, and the guide's own words carry
 * the rest. The film takes no hit and points at no retries.
 */
export const THE_LEDGER: GuideScene = {
  ticks: 1860,
  bpm: 120,
  seed: 4,
  entries: [],
  boss: { kind: "ledger" },
  acts: [
    // The colour the seed rolled, up the seam: the hit is at 552, the return
    // lands four beats later on beat 13, and the trigger goes forty before.
    { tick: 480, control: "fireCyan" },
    { tick: 740, control: "guard" },
    // The socket has walked to column 6, which is the plate's by `atBoss`.
    { tick: 960, control: "shield", col: 3, atBoss: true },
    // The colour the hit rerolled: the second hit opens the seam to two — the
    // whipping phase — and its return lands three beats later, on 23.
    { tick: 1160, control: "fireRed" },
    { tick: 1340, control: "guard" },
  ],
  // The cord, the lock and the body each have an anchor of their own now
  // (`render/caption-anchor-boss-e.ts`, 21 September 2026). Nothing here
  // points at the hull: the cord is rooted in *one* column of it and the lock
  // walks, and the middle of the plating is neither.
  steps: [
    {
      tick: 0,
      seat: 1,
      text: "A CORD ROOTS IN YOUR HULL",
      anchor: { at: "boss", part: "cord" },
    },
    {
      tick: 180,
      seat: 2,
      text: "IT SHOWS CYAN · LOAD IT",
      anchor: { at: "control", control: "fireCyan" },
    },
    {
      tick: 360,
      seat: 2,
      // FIRE now stands on the seam itself (`render/boss-cue-read-o.ts`), so
      // this page says the half of it a word on the body cannot: the bolt
      // leaves *his* column, and the two either side of the seam are plating.
      text: "IT FIRES UP HIS COLUMN",
      anchor: { at: "control", control: "fireCyan" },
    },
    {
      tick: 540,
      seat: 1,
      text: "THE HIT COMES BACK · 4 BEATS",
      anchor: { at: "boss", part: "cord" },
    },
    // GUARD AS IT LANDS stood here and came out (`decisions.md` #34): the
    // fight writes PRESS over the bead riding down the cord and GUARD under
    // it, and the bead's own position is the four beats this page counted.
    // THE FIFTH · LET IT LAND below stays, because the cue is silent there.
    {
      tick: 900,
      seat: 2,
      text: "IT WALKS A COLUMN · SAY IT",
      anchor: { at: "boss", part: "lock" },
    },
    {
      tick: 1080,
      seat: 2,
      text: "SHIELD THERE · FIRE RED",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 1260,
      seat: 1,
      text: "SHIELD · IT WHIPS THE SEAM",
      anchor: { at: "control", control: "guard" },
    },
    { tick: 1440, seat: 1, text: "NOW EVERY SHOT BILLS YOU", anchor: { at: "boss" } },
    {
      tick: 1620,
      seat: 2,
      text: "THE FIFTH · LET IT LAND",
      anchor: { at: "boss", part: "cord" },
    },
  ],
};
