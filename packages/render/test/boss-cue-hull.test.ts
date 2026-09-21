import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, WAVES } from "@neon-spore/content";
import { createWorld, startWave, step, type World } from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { cueWordY } from "../src/boss-cue-text.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **No boss writes its verb into the ship** (`BossCue.wordFloor`).
 *
 * Eight of them park a mark on the hull line — the cannon is the carry they
 * all ask for, and THE LEDGER's socket is `l.hullY` exactly — and the verb
 * hangs `halfH + 18` under the mark, which is forty-two pixels inside the
 * plating. Drawing the cue after the ship stopped the hull painting the word
 * out and did not make it readable: eleven-point rock grey over lit plating
 * with the hull's own stalks through it is a smear on a real frame. The word
 * goes over the mark instead, and this is the rule that says so, asked of
 * every boss in the campaign rather than of the eight that were caught.
 *
 * **Played rather than posed**, unlike its neighbours here: the bug is a
 * *place*, and a cue built in a test is a cue standing where the test put it.
 * So every wave with a boss is stepped with nobody pressing anything, and
 * every cue that comes back is held to the rule. Nothing is asserted about
 * which cue a boss gives on which beat — that is each `boss-cue-*.test.ts`'s
 * own subject.
 */

beforeAll(installCanvasGlobals);

/** Long enough for every boss to reach its first phase or two unaided. */
const TICKS = 1200;

const ROLES: ViewRole[] = ["p1", "p2"];

/** Cues seen over one wave, at most one per tick, kept once per place. */
function cuesOver(index: number, l: Layout): BossCue[] {
  const world: World = createWorld(CFG, 5);
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const seen = new Map<string, BossCue>();
  for (let i = 0; i < TICKS; i++) {
    step(world, []);
    const cue = bossCue(l, world, 0, () => l.hullY);
    if (cue === null) continue;
    seen.set(`${cue.word}@${Math.round(cue.x)},${Math.round(cue.y)}`, cue);
  }
  return [...seen.values()];
}

describe("a cue standing on the hull line", () => {
  for (const role of ROLES) {
    it(`writes no verb into the plating, on any boss, for ${role}`, () => {
      const l = computeLayout(VIEWPORT, CFG, role);
      let held = 0;
      // Named rather than counted: a run that broke the rule should say which
      // boss said which word and how far into the plating it went, because the
      // next person to read this will be looking at a frame of that wave.
      const into: string[] = [];
      for (const [index, wave] of WAVES.entries()) {
        if (wave.boss === undefined || wave.boss === null) continue;
        for (const cue of cuesOver(index, l)) {
          held++;
          const top = cue.wordFloor ?? l.hullY;
          const y = cueWordY(cue);
          if (y > top) into.push(`${wave.name} ${cue.word} ${Math.round(y - top)}px under`);
        }
      }
      expect(into).toEqual([]);
      // The campaign has bosses and they do speak: a run that read none of
      // them would pass this file by saying nothing. Sixteen places for p1 and
      // seventeen for p2, today.
      expect(held).toBeGreaterThanOrEqual(12);
    });
  }

  it("keeps the verb under the mark wherever there is room under it", () => {
    const l = computeLayout(VIEWPORT, CFG, "p1");
    let under = 0;
    for (const [index, wave] of WAVES.entries()) {
      if (wave.boss === undefined || wave.boss === null) continue;
      for (const cue of cuesOver(index, l)) {
        if (cueWordY(cue) > cue.y) under++;
      }
    }
    // #34 puts the verb under the mark and the hull line is the one exception;
    // a rule that had flipped every cue in the game would pass the case above.
    // Nine of p1's sixteen stay under today, and seven flip.
    expect(under).toBeGreaterThanOrEqual(6);
  });
});
