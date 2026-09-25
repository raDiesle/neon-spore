import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type Creature,
  createWorld,
  NO_SHELL,
  startWave,
  step,
  type ThroatState,
  throatBoss,
  throatMouthCol,
  throatMouthRow,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { bossCue } from "../src/boss-cue.js";
import { computeLayout } from "../src/layout.js";
import { throatReceipt } from "../src/throat-receipt.js";
import { RING_DOWN, RING_HEALS, SWALLOWED, THROAT_WHY } from "../src/throat-say.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE THROAT's reasons and receipts** (`throat-say.ts`, `throat-receipt.ts`):
 * the line under each verb saying what it is for, and the words by the mouth
 * saying what the last thing into it did. The owner could not tell a gum from
 * a body, or a swallow that heals from one that does not (25 September 2026).
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const P1 = computeLayout(VIEWPORT, CFG, "p1");

function opened(): { world: World; t: ThroatState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("throat");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB; i++) step(world, []);
  const t = throatBoss(world);
  if (t === null) throw new Error("the throat's wave installed no boss");
  return { world, t };
}

function gum(world: World, col: number, row: number): void {
  world.creatures.push({
    id: world.nextId++,
    kind: "gum",
    col,
    row,
    fromRow: row,
    color: null,
    holes: 0,
    petals: 0,
    dragMilli: 0,
    shell: NO_SHELL,
  } as Creature);
}

describe("the line under each verb", () => {
  it("is carried by the cue the pilot is given", () => {
    const { world, t } = opened();
    const away = throatMouthCol(CFG, t, world.beat) === 0 ? 1 : 0;
    gum(world, away, throatMouthRow(CFG) - 1);
    const c = bossCue(P1, world, 0, () => P1.hullY);
    expect(c?.word).toBe("WAIT");
    expect(c?.why).toBe(THROAT_WHY.WAIT);
  });

  it("never says a column, a colour or a count", () => {
    for (const line of Object.values(THROAT_WHY)) {
      expect(line).toMatch(/^[A-Z0-9 ·]+$/);
      expect(line).not.toMatch(/RED|CYAN|LEFT|RIGHT|COLUMN/);
      // `P2` is the screen, the one number a mark may carry (`game-words`).
      expect(line.replace("P2", "")).not.toMatch(/[0-9]/);
    }
  });
});

describe("the receipt by the mouth", () => {
  it("says a ring went down for two beats after a gum", () => {
    const { t } = opened();
    t.chokedBeat = 10;
    expect(throatReceipt(t, 10, 0)).toBe(RING_DOWN);
    expect(throatReceipt(t, 11, 0.9)).toBe(RING_DOWN);
    expect(throatReceipt(t, 12, 0)).toBeNull();
  });

  it("says the ring heals when a body is swallowed with one slack", () => {
    const { t } = opened();
    t.phase = "slide";
    t.chokedBeat = 10;
    t.fedBeat = 14;
    expect(throatReceipt(t, 14, 0)).toBe(RING_HEALS);
  });

  it("says only swallowed while nothing is slack to heal", () => {
    const { t } = opened();
    t.fedBeat = 4;
    expect(throatReceipt(t, 4, 0)).toBe(SWALLOWED);
  });

  it("says nothing before anything went in, or while it everts", () => {
    const { t } = opened();
    expect(throatReceipt(t, 3, 0)).toBeNull();
    t.chokedBeat = 3;
    t.phase = "everts";
    expect(throatReceipt(t, 3, 0)).toBeNull();
  });
});
