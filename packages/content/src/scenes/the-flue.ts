import type { GuideScene } from "../scene-types.js";

/**
 * THE FLUE's rehearsal: one level called and shot, then the seats swapped
 * and the next called the other way round (the owner, 6 October 2026: *have
 * a brief tutorial which explains, that one needs to tell*).
 *
 * Two slow red-then-cyan bolt levels, so the film is the call and not the
 * speed. The spore waits at the left end for the first two beats, lights at
 * tick 120 and crosses the sight every 270 ticks from 180; the shot is
 * pressed on the second crossing, so the pages before it have time, and it
 * leaves on the half beat at 480 and meets the spore at 534. The flue rests,
 * and the rest is the second level's — the panels trade there
 * (`sim/flue.ts`, `flueTraded`), so the film's own phones swap halves with no
 * hand on anything: player 2's page shows the spore from then on, and player
 * 1's the trigger (`render/handover.ts`, `handedSeat`). The second level
 * lights at 600 and its spore crosses at 930, where player 1 shoots.
 *
 * **What the words carry** is what no mark on the field says: who talks and
 * who listens, and that it turns round. The fight writes `CALL`/`NOW` at the
 * sight and `FIRE` at the hull itself (`render/boss-cue-read-zo.ts`), and the
 * siren names the jobs; the film is the lesson that the shot is the other
 * person's word. **The film shows no miss.** Not shown: a shot spent, the
 * beam, THE SLOW.
 */
export const THE_FLUE: GuideScene = {
  ticks: 1200,
  bpm: 120,
  chargeBeats: 0.5,
  seed: 1,
  entries: [],
  boss: {
    kind: "flue",
    levels: [
      { weapon: "bolt", color: "red", speedMilli: 2000, slowMilli: 1000 },
      { weapon: "bolt", color: "cyan", speedMilli: 2000, slowMilli: 1000 },
    ],
  },
  acts: [
    // Player 2's thumb on the second crossing, the panel still their own.
    { tick: 450, control: "fireRed" },
    // The same panel, traded onto player 1's phone (`flueTraded`).
    { tick: 930, control: "fireCyan" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "PLAYER 1 SEES THE SPORE", anchor: { at: "boss" } },
    { tick: 180, seat: 1, text: "PLAYER 1 SAYS WHEN TO SHOOT", anchor: { at: "boss" } },
    // The mirage in the gullet is this page's picture (`flue-mirage.ts`).
    { tick: 360, seat: 2, text: "PLAYER 2 SHOOTS WHEN TOLD", anchor: { at: "boss" } },
    // The panels are traded by now: player 2's phone shows the spore.
    { tick: 560, seat: 2, text: "NEXT LEVEL · ROLES SWAP", anchor: { at: "boss" } },
    { tick: 740, seat: 1, text: "PLAYER 1 SHOOTS WHEN TOLD", anchor: { at: "boss" } },
  ],
};
