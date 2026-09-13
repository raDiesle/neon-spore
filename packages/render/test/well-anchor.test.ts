import { describe, expect, it } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, startWave, step, type World } from "@neon-spore/sim";
import { anchorPoint } from "../src/caption-anchor.js";
import { creatureCenter, flatCenter } from "../src/creature-place.js";
import { glidePhase } from "../src/depth.js";
import { computeLayout } from "../src/layout.js";
import { wellBodyAt } from "../src/well-body.js";
import { waveWith } from "./frame-harness.js";

/**
 * WHERE A CAPTION ABOUT A BODY POINTS ON THE WELL.
 *
 * THE WELL's film says *player 1 sees four o'clock* over a body, and the ring
 * that goes with those words has to be round the body where the well draws
 * it — on its hour, on its row's circle — not where the flat field would
 * have drawn it, which on the pilot's screen is the empty middle of the
 * picture. The placement is `wellBodyAt`, the same call `drawWellBodies`
 * draws by, so the ring and the shape cannot come apart; on the navigator's
 * screen, which never shows the well, nothing changes.
 */

const CFG = DEFAULT_CONFIG;
const PILOT = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");
const NAVIGATOR = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p2");
const SET = controlSet("default");

/** THE WELL with its first body on the field, six rows down. */
function wellWorld(): World {
  const wave = waveWith("well");
  const world = createWorld(CFG, 4);
  startWave(world, wave, buildQueue(wave, CFG.cols), [], buildBoss(wave, CFG.cols));
  for (let t = 0; t < 2000 && !world.creatures.some((c) => c.row >= 6); t++) step(world, []);
  if (!world.creatures.some((c) => c.row >= 6)) throw new Error("no body came down");
  return world;
}

describe("a caption about a body on THE WELL", () => {
  it("rings the body where the well draws it, on the pilot's screen", () => {
    const world = wellWorld();
    const top = [...world.creatures].sort((a, b) => a.row - b.row)[0];
    if (!top) throw new Error("no body");
    const at = anchorPoint(PILOT, world, SET, { at: "body" }, 0.5);
    if (!at) throw new Error("no anchor");
    const drawn = wellBodyAt(PILOT, CFG, top, glidePhase(CFG, world.beat, top, 0.5));
    expect(at.x).toBeCloseTo(drawn.x, 6);
    expect(at.y).toBeCloseTo(drawn.y, 6);
    // And not where the flat field would have put it.
    const flat = flatCenter(PILOT, top, glidePhase(CFG, world.beat, top, 0.5));
    expect(Math.hypot(at.x - flat.x, at.y - flat.y)).toBeGreaterThan(PILOT.tile);
  });

  it("rings the body on the flat field on the navigator's screen", () => {
    const world = wellWorld();
    const top = [...world.creatures].sort((a, b) => a.row - b.row)[0];
    if (!top) throw new Error("no body");
    const at = anchorPoint(NAVIGATOR, world, SET, { at: "body" }, 0.5);
    if (!at) throw new Error("no anchor");
    const flat = creatureCenter(NAVIGATOR, world, top, glidePhase(CFG, world.beat, top, 0.5));
    expect(at.x).toBeCloseTo(flat.x, 6);
    expect(at.y).toBeCloseTo(flat.y, 6);
  });
});
