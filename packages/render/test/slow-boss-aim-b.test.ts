import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  filamentBoss,
  grindstoneBoss,
  sinewBoss,
  stareBoss,
  startWave,
  surgeBoss,
  type World,
} from "@neon-spore/sim";
import { filamentHeart } from "../src/filament-heart.js";
import { filamentStrands } from "../src/filament-shape.js";
import { grindstoneArrived, grindstoneFree, grindstoneShut } from "../src/grindstone-pose.js";
import { grindstoneAxleAt, grindstoneReach } from "../src/grindstone-shape.js";
import { computeLayout } from "../src/layout.js";
import { rimeCentre, rimeRadius } from "../src/rime-shape.js";
import { sinewMassCentre, sinewMassRx, sinewMassRy } from "../src/sinew-shape.js";
import { aim } from "../src/slow-intake-aim.js";
import { spoolBarrelHalf, spoolFlangeR, spoolHome } from "../src/spool-shape.js";
import { stareEye, stareReach, stareSwell, swollenEye } from "../src/stare-shape.js";
import { surgeBulbCircle } from "../src/surge-shape.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE SLOW's light stands round the bosses on page two**
 * (`slow-boss-aim-b.ts`): each row the point its own shape file names, and
 * the ones that move read at the beat they are asked at.
 */

const L = computeLayout(VIEWPORT, CFG, "p1");

/** `kind`'s wave stood, and nothing stepped. */
function stood(kind: Parameters<typeof waveWith>[0]): World {
  const world = createWorld(CFG, 5);
  const index = waveWith(kind);
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  return world;
}

const round = (at: { x: number; y: number }, r: number) => ({
  x: at.x,
  y: at.y,
  r,
  ax: at.x,
  ay: at.y,
});

function need<T>(s: T | null, kind: string): T {
  if (s === null) throw new Error(`the ${kind} wave stood no boss`);
  return s;
}

describe("THE SLOW's aim at a boss, page two", () => {
  it.each([
    ["rime", () => round(rimeCentre(L, CFG), Math.max(rimeRadius(L).rx, rimeRadius(L).ry))],
    ["spool", () => round(spoolHome(L, CFG), Math.max(spoolBarrelHalf(L, 0), spoolFlangeR(L)))],
  ] as const)("stands round THE %s's whole body, over the field", (kind, want) => {
    const at = aim(stood(kind), L, 0, 0);
    expect(at).toEqual(want());
    expect(at.y).toBeLessThan(L.hullY - 2 * L.tile);
  });

  it("stands round THE STARE's cowl, swollen as far as the charge has come", () => {
    const world = stood("stare");
    const s = need(stareBoss(world), "stare");
    s.phase = "charge";
    s.phaseBeat = 0;
    const beat = CFG.stareChargeBeats;
    const e = swollenEye(stareEye(L, CFG), stareSwell(s, CFG, beat, 0));
    const at = aim(world, L, beat, 0);
    expect(at).toEqual(round({ x: e.cx, y: e.cy }, stareReach(e)));
    expect(e.rx).toBeGreaterThan(stareEye(L, CFG).rx);
  });

  it("stands round THE GRINDSTONE's wheel where it stands, as wide as its caliper", () => {
    const world = stood("grindstone");
    const s = need(grindstoneBoss(world), "grindstone");
    const axle = grindstoneAxleAt(
      L,
      CFG,
      grindstoneArrived(s, CFG, 0, 0),
      grindstoneFree(s, CFG, 0, 0),
    );
    const at = aim(world, L, 0, 0);
    expect(at).toEqual(round(axle, grindstoneReach(L, grindstoneShut(world, s, 0, 0))));
    expect(at.y).toBeLessThan(L.hullY - 2 * L.tile);
  });

  it("stands round THE SURGE's bulb, as wide as a thumb is answered in", () => {
    const world = stood("surge");
    const c = surgeBulbCircle(L, CFG, need(surgeBoss(world), "surge"));
    expect(aim(world, L, 0, 0)).toEqual(round(c, c.r));
  });

  it("stands round THE SINEW's mass where it hangs, not the root it hangs from", () => {
    const world = stood("sinew");
    const s = need(sinewBoss(world), "sinew");
    const r = Math.max(sinewMassRx(L, CFG), sinewMassRy(L));
    const beat = world.beat;
    expect(aim(world, L, beat, 0.5)).toEqual(round(sinewMassCentre(L, CFG, s, beat, 0.5), r));
  });

  it("stands round THE FILAMENT's heart, as big as the filaments left make it", () => {
    const world = stood("filament");
    const s = need(filamentBoss(world), "filament");
    const heart = filamentHeart(L, CFG, filamentStrands(s, CFG, world.beat, 0));
    const at = aim(world, L, world.beat, 0);
    expect(at).toEqual(round(heart, Math.max(heart.rx, heart.ry)));
    expect(at.r).toBeGreaterThan(filamentHeart(L, CFG, 0).rx);
  });
});
