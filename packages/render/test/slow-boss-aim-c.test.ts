import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  antiphonBoss,
  batonBoss,
  createWorld,
  curtainBody,
  curtainBoss,
  davitBoss,
  gorgeBoss,
  keelBoss,
  leadBoss,
  ledgerBoss,
  ratchetBoss,
  scuttleBoss,
  slingBoss,
  startWave,
  tasterBoss,
  throatBoss,
  undertowBoss,
  type World,
} from "@neon-spore/sim";
import { antiphonBox } from "../src/antiphon-shape.js";
import { socketPoint, socketReach } from "../src/baton-socket-draw.js";
import { sides, spread } from "../src/caption-anchor-box.js";
import { curtainSheetSpan } from "../src/curtain-grip.js";
import { CURTAIN_HEM_DROP, CURTAIN_RAIL_RISE } from "../src/curtain-sheet.js";
import { davitAngle } from "../src/davit-pose.js";
import { DAVIT_SAG, davitHook, davitHookRadius, davitMast, davitTip } from "../src/davit-shape.js";
import { drawnCol } from "../src/depth.js";
import { gorgeSackBox } from "../src/gorge-draw.js";
import { hiveBox } from "../src/hive-shape.js";
import { keelSegs } from "../src/keel-pose.js";
import { keelPlateHalf } from "../src/keel-shape.js";
import { computeLayout, tileCY } from "../src/layout.js";
import {
  leadAlong,
  leadAskedAngle,
  leadFoot,
  leadRidgeY,
  leadStalkLength,
} from "../src/lead-shape.js";
import { ledgerBodyBox, ledgerGap } from "../src/ledger-shape.js";
import { ratchetLock, ratchetRails } from "../src/ratchet-shape.js";
import { scuttleFrameBox } from "../src/scuttle-shape.js";
import { slingArrived, slingGone, slingTension } from "../src/sling-pose.js";
import { slingCupRadius, slingHandle, slingHome, slingTip } from "../src/sling-shape.js";
import { capsule } from "../src/slow-boss-aim-d.js";
import { type Aim, aim } from "../src/slow-intake-aim.js";
import { tasterFanBox } from "../src/taster-draw.js";
import { GULLET_PAD, throatGullet } from "../src/throat-shape.js";
import { undertowEdgeBox } from "../src/undertow-shape.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE SLOW's light stands round the bosses on page three**
 * (`slow-boss-aim-c.ts`): each row the box its own shape file names, run the
 * long way as a capsule, and never the cannon it used to fall back on.
 */

const L = computeLayout(VIEWPORT, CFG, "p1");

/** `kind`'s wave stood, and nothing stepped. */
function stood(kind: Parameters<typeof waveWith>[0]): World {
  const world = createWorld(CFG, 5);
  const index = waveWith(kind);
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  return world;
}

function need<T>(s: T | null | undefined, kind: string): T {
  if (s === null || s === undefined) throw new Error(`the ${kind} wave stood no boss`);
  return s;
}

const around = (points: readonly { x: number; y: number }[], r: number) =>
  need(spread(points, r), "points");

const WANT: Record<string, (w: World) => Aim> = {
  baton: (w) => {
    const s = need(batonBoss(w), "baton");
    return capsule(
      around(
        s.sockets.map((_, i) => socketPoint(L, CFG, s, i)),
        socketReach(L),
      ),
    );
  },
  curtain: (w) => {
    const body = need(curtainBody(w, need(curtainBoss(w), "curtain")), "curtain");
    const span = need(curtainSheetSpan(L, CFG, drawnCol(body, 0)), "curtain");
    const row = tileCY(L, CFG.curtainRow);
    return capsule(
      sides(
        span.left,
        span.right,
        row - L.tile * CURTAIN_RAIL_RISE,
        row + L.tile * CURTAIN_HEM_DROP,
      ),
    );
  },
  gorge: (w) => capsule(gorgeSackBox(L, CFG, need(gorgeBoss(w), "gorge"), 1)),
  hive: () => {
    const b = hiveBox(L, CFG);
    return capsule(sides(b.left, b.right, b.top, b.bottom));
  },
  keel: (w) => {
    const segs = keelSegs(L, CFG, need(keelBoss(w), "keel"), 0, 0);
    return capsule(
      around(
        segs.map((s) => s.centre),
        keelPlateHalf(L),
      ),
    );
  },
  lead: (w) => {
    const s = need(leadBoss(w), "lead");
    const foot = leadFoot(L, CFG, s);
    const tip = leadAlong(foot, leadAskedAngle(s, L.role), leadStalkLength(L, s));
    const ridge = leadRidgeY(L, CFG);
    return { x: tip.x, y: tip.y, r: ridge.bottom - ridge.top, ax: foot.x, ay: foot.y };
  },
  ledger: (w) => {
    const s = need(ledgerBoss(w), "ledger");
    return capsule(ledgerBodyBox(L, CFG, s, ledgerGap(L, CFG, s, 0, 0)));
  },
  ratchet: (w) => {
    need(ratchetBoss(w), "ratchet");
    const lock = ratchetLock(L, CFG);
    const rails = ratchetRails(L, CFG);
    return capsule(sides(rails.left, rails.right, lock.y - lock.half, rails.bottom));
  },
  scuttle: (w) => capsule(scuttleFrameBox(L, CFG, need(scuttleBoss(w), "scuttle"), 0, 0)),
  taster: (w) => capsule(tasterFanBox(L, need(tasterBoss(w), "taster"))),
  throat: (w) =>
    capsule(around(throatGullet(L, CFG, need(throatBoss(w), "throat"), 0, 0), L.tile * GULLET_PAD)),
  sling: (w) => {
    const s = need(slingBoss(w), "sling");
    const home = slingHome(L, CFG, slingGone(s, CFG, 0, 0));
    const out = slingArrived(s, CFG, 0, 0);
    const parts = [
      { x: 0, y: 0 },
      slingTip(L, 0, out),
      slingHandle(L, 0, slingTension(w, s, 0, 0, 0)),
      slingTip(L, 1, out),
      slingHandle(L, 1, slingTension(w, s, 1, 0, 0)),
    ];
    return capsule(
      around(
        parts.map((p) => ({ x: home.x + p.x, y: home.y + p.y })),
        slingCupRadius(L),
      ),
    );
  },
  davit: (w) => {
    const angle = davitAngle(need(davitBoss(w), "davit"), CFG, 0);
    const mast = davitMast(L, CFG);
    const parts = [{ x: 0, y: 0 }, davitTip(L, angle), davitHook(L, angle, DAVIT_SAG)];
    return capsule(
      around(
        parts.map((p) => ({ x: mast.x + p.x, y: mast.y + p.y })),
        davitHookRadius(L),
      ),
    );
  },
  antiphon: (w) => {
    need(antiphonBoss(w), "antiphon");
    const b = antiphonBox(L, CFG);
    return capsule(sides(b.left, b.right, b.top, b.bottom));
  },
};

/**
 * Bosses whose body is rooted in the hull, so the whole of it reaches down to
 * the ship: THE THROAT's gullet stands where the cannon would, fixed to the
 * ship the way the cannon is (`throat-shape.ts`).
 */
const ROOTED = new Set(["throat"]);

describe("THE SLOW's aim at a boss, page three", () => {
  it.each(Object.keys(WANT))("stands round THE %s's whole body, over the field", (kind) => {
    const world = stood(kind as Parameters<typeof waveWith>[0]);
    const at = aim(world, L, 0, 0);
    expect(at).toEqual((WANT[kind] as (w: World) => Aim)(world));
    if (!ROOTED.has(kind)) expect(Math.max(at.y, at.ay)).toBeLessThan(L.hullY - 2 * L.tile);
  });

  it("stands along THE UNDERTOW's lobes, and at the cannon with none up", () => {
    const world = stood("undertow");
    const u = need(undertowBoss(world), "undertow");
    expect(u.lobes).toEqual([]);
    const cannon = aim(world, L, 0, 0);
    expect(cannon.y).toBeGreaterThan(L.hullY - 2 * L.tile);
    u.lobes.push(
      { col: 1, stage: "standing", stageBeat: 0, answer: "maw" },
      { col: 4, stage: "bowing", stageBeat: 0, answer: "shield" },
    );
    const edge = need(undertowEdgeBox(L, CFG, u, u.lobes, 0, 0), "undertow");
    expect(aim(world, L, 0, 0)).toEqual(capsule(edge));
  });

  it("runs a capsule the long way of its box, as thick as the short way", () => {
    expect(capsule({ x: 100, y: 50, rx: 40, ry: 10 })).toEqual({
      x: 70,
      y: 50,
      r: 10,
      ax: 130,
      ay: 50,
    });
    expect(capsule({ x: 100, y: 50, rx: 10, ry: 40 })).toEqual({
      x: 100,
      y: 20,
      r: 10,
      ax: 100,
      ay: 80,
    });
    expect(capsule({ x: 5, y: 5, rx: 3, ry: 3 })).toEqual({ x: 5, y: 5, r: 3, ax: 5, ay: 5 });
  });
});
