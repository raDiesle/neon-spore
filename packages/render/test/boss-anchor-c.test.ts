import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { controlSet } from "@neon-spore/content";
import {
  type BossEntry,
  batonBoss,
  createWorld,
  DEFAULT_CONFIG,
  startWave,
  step,
  type World,
} from "@neon-spore/sim";
import { socketPoint } from "../src/baton-socket-draw.js";
import { anchorPoint } from "../src/caption-anchor.js";
import { computeLayout } from "../src/layout.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * WHERE A CAPTION ABOUT A BOSS'S OWN FIXTURE POINTS — the film of the third
 * file (`caption-anchor-boss-c.ts`): THE BATON's arm, proved to land where the
 * boss's own draw file puts it (`boss-anchor.test.ts`).
 */

const CFG = DEFAULT_CONFIG;
const PILOT = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");
const NAVIGATOR = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p2");
const SET = controlSet("default");
const BOTH = [PILOT, NAVIGATOR];

beforeAll(installCanvasGlobals);

/** A world with the boss installed, `ticks` in. */
function withBoss(boss: BossEntry, ticks = 60): World {
  const world = createWorld(CFG, 12, []);
  startWave(world, 9, [], [], boss);
  for (let t = 0; t < ticks; t++) step(world, []);
  if (world.boss === null) throw new Error(`no ${boss.kind} was installed`);
  return world;
}

describe("a caption pointed at THE BATON", () => {
  it("rings the whole arm, from the base socket to the last, on both screens", () => {
    const world = withBoss({ kind: "baton" });
    const b = batonBoss(world);
    if (b === null) throw new Error("no baton");
    expect(b.sockets.length).toBeGreaterThan(1);
    for (const l of BOTH) {
      const at = anchorPoint(l, world, SET, { at: "boss" }, 0);
      const first = socketPoint(l, CFG, b, 0);
      const last = socketPoint(l, CFG, b, b.sockets.length - 1);
      expect(at).not.toBeNull();
      expect(at?.y).toBeCloseTo((first.y + last.y) * 0.5);
      // Tall enough to hold every socket on the thread, which is what makes
      // it the arm rather than one bead of it.
      expect(at?.r ?? 0).toBeGreaterThan(Math.abs(last.y - first.y) * 0.5);
    }
  });
});
