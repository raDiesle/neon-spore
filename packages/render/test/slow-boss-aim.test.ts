import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildBoss, buildQueue, WAVES } from "@neon-spore/content";
import {
  BOSS_KINDS,
  type BossKind,
  createWorld,
  governorBoss,
  HASP_COUNT,
  haspBoss,
  OUTER,
  oculusBoss,
  startWave,
  step,
  ticksPerBeat,
  trivetBoss,
  type World,
} from "@neon-spore/sim";
import { gimbalCentre, gimbalRingR } from "../src/gimbal-shape.js";
import { governorStanding } from "../src/governor-pose.js";
import { haspCentre, haspShellRadius } from "../src/hasp-shape.js";
import { computeLayout } from "../src/layout.js";
import { mantleCentre, mantleReach } from "../src/mantle-shape.js";
import { oculusCentre, oculusRadius } from "../src/oculus-shape.js";
import { plumbCore, plumbHook, plumbSacMiddle } from "../src/plumb-shape.js";
import { bossAim } from "../src/slow-boss-aim.js";
import { aim } from "../src/slow-intake-aim.js";
import { trivetCentre, trivetReach } from "../src/trivet-shape.js";
import { valveCentre, valveReach } from "../src/valve-shape.js";
import { viseCentre, viseRadius } from "../src/vise-shape.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE SLOW's light stands round the boss that opened it** (`slow-boss-aim.ts`):
 * PRISM splits a point as wide as it is far from the aim, so a boss aimed at
 * the cannon's column is the thing split widest. A boss with a row is aimed
 * at its own body; one without falls through to the cannon, as before.
 */

const L = computeLayout(VIEWPORT, CFG, "p1");

/** THE OCULUS stood and its first pair lit, the step a window opens on. */
function lens(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("oculus");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < ticksPerBeat(CFG) * (CFG.oculusStillBeats + 1); i++) step(world, []);
  const s = oculusBoss(world);
  if (s === null) throw new Error("the oculus wave stood no lens");
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.cursor = 0;
  return world;
}

/** `kind`'s wave stood, and nothing stepped: every row but THE HASP's reads no state. */
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

describe("THE SLOW's aim at a boss", () => {
  it("stands on THE OCULUS's lens, as wide as its rim, rather than on the cannon", () => {
    const world = lens();
    const at = aim(world, L, world.beat, 0);
    const mid = oculusCentre(L, CFG);
    expect(at).toEqual({ x: mid.x, y: mid.y, r: oculusRadius(L).rim, ax: mid.x, ay: mid.y });
    expect(at.y).toBeLessThan(L.hullY - 2 * L.tile);
  });

  it.each([
    ["gimbal", () => round(gimbalCentre(L, CFG), gimbalRingR(L, OUTER))],
    ["mantle", () => round(mantleCentre(L, CFG), Math.max(mantleReach(L).rx, mantleReach(L).ry))],
    ["valve", () => round(valveCentre(L, CFG), Math.max(valveReach(L).rx, valveReach(L).ry))],
    ["vise", () => round(viseCentre(L, CFG), Math.max(viseRadius(L).rx, viseRadius(L).ry))],
    ["trivet", () => round(trivetCentre(L, CFG), trivetReach(L))],
    [
      "plumb",
      () => {
        const hook = plumbHook(L, CFG);
        const mid = plumbSacMiddle(L);
        const core = plumbCore(L);
        return round({ x: hook.x + mid.x + core.x, y: hook.y + mid.y + core.y }, core.r);
      },
    ],
  ] as const)("stands round THE %s's whole body, over the middle column", (kind, want) => {
    const at = aim(stood(kind), L, 0, 0);
    expect(at).toEqual(want());
    expect(at.y).toBeLessThan(L.hullY - 2 * L.tile);
  });

  it("stands round the clasp THE HASP is being worked on, and moves up the door with it", () => {
    const world = stood("hasp");
    const s = haspBoss(world);
    if (s === null) throw new Error("the hasp wave stood no door");
    const r = haspShellRadius(L);
    expect(aim(world, L, 0, 0)).toEqual(round(haspCentre(L, CFG, 0), r));
    s.hasps = HASP_COUNT - 1;
    const next = aim(world, L, 0, 0);
    expect(next).toEqual(round(haspCentre(L, CFG, 1), r));
    expect(next.y).not.toBe(haspCentre(L, CFG, 0).y);
  });

  it("stands round THE TRIVET's hub swung over in a lurch, as wide as before", () => {
    const world = stood("trivet");
    const s = trivetBoss(world);
    if (s === null) throw new Error("the trivet wave stood no stand");
    s.phase = "lit";
    s.cursor = s.steps.findIndex((x) => x.ask === "tip");
    const home = trivetCentre(L, CFG);
    const at = aim(world, L, 0, 0);
    expect(at.x).toBeLessThan(home.x - L.tile);
    expect(at).toEqual(round({ x: at.x, y: home.y }, trivetReach(L)));
  });

  it("has no row for a field with no boss, which still aims at the cannon's column", () => {
    const world = createWorld(CFG, 5);
    expect(bossAim(world, L)).toBeNull();
    expect(aim(world, L, world.beat, 0).y).toBe(L.hullY);
  });
});

/**
 * The boss kinds whose simulation opens THE SLOW: a kind with a file of its
 * own (`governor-step.ts`, `lead.ts`) that calls `openSlow(`, read off the
 * sources so a new boss is on this list the day it opens a window.
 */
function opensSlow(): BossKind[] {
  const src = join(import.meta.dir, "../../sim/src");
  const kinds = new Set<string>(BOSS_KINDS);
  const out = new Set<BossKind>();
  for (const file of readdirSync(src)) {
    const kind = file.replace(/[-.].*$/, "");
    if (!kinds.has(kind)) continue;
    if (readFileSync(join(src, file), "utf8").includes("openSlow(")) out.add(kind as BossKind);
  }
  return [...out].sort();
}

describe("every boss that opens THE SLOW has a row", () => {
  const playable = opensSlow().filter((kind) => WAVES.some((w) => w.boss?.kind === kind));

  it("reads the list off the simulation, THE GOVERNOR on it", () => {
    expect(playable).toContain("governor");
    expect(playable.length).toBeGreaterThan(30);
  });

  it.each(playable)("aims THE %s's light at its body, not the cannon at the hull", (kind) => {
    const at = aim(stood(kind as Parameters<typeof waveWith>[0]), L, 0, 0);
    expect(at.y).toBeLessThan(L.hullY - L.tile);
  });

  it("leaves THE GOVERNOR's whole flywheel out of the split", () => {
    const world = stood("governor");
    const s = governorBoss(world);
    if (s === null) throw new Error("the governor wave stood no flywheel");
    const d = governorStanding(L, CFG, s, 0, 0);
    const sharp = aim(world, L, 0, 0).sharp;
    if (sharp === undefined) throw new Error("THE GOVERNOR's light leaves nothing whole");
    expect(sharp.x).toBeLessThan(d.cx - d.r);
    expect(sharp.x + sharp.w).toBeGreaterThan(d.cx + d.r);
    expect(sharp.y + sharp.h).toBeGreaterThan(d.cy + d.r * d.tilt);
    expect(sharp.y).toBeLessThan(d.cy - d.r * d.tilt);
  });
});
