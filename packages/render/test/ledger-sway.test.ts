import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type LedgerState,
  ledgerBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { ledgerBodyY } from "../src/ledger-shape.js";
import { LEDGER_LEAN, ledgerLean, ledgerLeaned } from "../src/ledger-sway.js";
import { FRAME_TIMEOUT_MS, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE LEDGER's lean (`ledger-sway.ts`): the top of the plating wanders more
 * than half a tile each way and never past its cap, the underside — the
 * cord's root and the seam's mouth — does not move at all, and the plating is
 * still once the boss is out and hushed under THE SLOW.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, "p1");
const QUARTERS = Array.from({ length: 4 * 240 }, (_, q) => q);

function rooted(): { world: World; t: LedgerState } {
  const world = createWorld(CFG, 7);
  const index = waveWith("ledger");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < ticksPerBeat(CFG) * (CFG.ledgerRootBeats + 1); i++) step(world, []);
  const t = ledgerBoss(world);
  if (t === null) throw new Error("the ledger wave paid out no cord");
  return { world, t };
}

const leans = (world: World, t: LedgerState) =>
  QUARTERS.map((q) => ledgerLean(world, t, Math.floor(q / 4), (q % 4) / 4));

describe("THE LEDGER leans on its root", () => {
  it("moves the top of the plating more than half a tile each way, never past its cap", () => {
    const { world, t } = rooted();
    const { top, bottom } = ledgerBodyY(L);
    const at = leans(world, t).map((s) => ledgerLeaned({ x: 0, y: top }, s, bottom).x / L.tile);
    expect(Math.max(...at)).toBeGreaterThan(0.5);
    expect(Math.min(...at)).toBeLessThan(-0.5);
    expect(Math.max(...at.map(Math.abs))).toBeLessThanOrEqual(LEDGER_LEAN + 1e-9);
  });

  it("never moves the underside, where the cord is rooted and the mouth opens", () => {
    const { world, t } = rooted();
    const { bottom } = ledgerBodyY(L);
    for (const s of leans(world, t)) expect(ledgerLeaned({ x: 7, y: bottom }, s, bottom).x).toBe(7);
  });

  it("is still a beat into `out`, and hushed under THE SLOW", () => {
    const { world, t } = rooted();
    const out = { ...t, outBeat: 0 };
    for (const q of QUARTERS.filter((q) => q >= 4)) {
      expect(ledgerLean(world, out, Math.floor(q / 4), (q % 4) / 4)).toBe(0);
    }
    const slow = { ...world, slowFromBeat: 0, slowToBeat: 1000 };
    const hushed = leans(slow, t).slice(8).map(Math.abs);
    expect(Math.max(...hushed)).toBeLessThanOrEqual((0.1 * LEDGER_LEAN) / 3.3 + 1e-9);
  });
});
