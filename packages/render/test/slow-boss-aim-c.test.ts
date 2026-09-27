import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  batonBoss,
  createWorld,
  curtainBody,
  curtainBoss,
  gorgeBoss,
  keelBoss,
  leadBoss,
  ledgerBoss,
  startWave,
  type World,
} from "@neon-spore/sim";
import { socketPoint, socketReach } from "../src/baton-socket-draw.js";
import { curtainSheetSpan } from "../src/curtain-grip.js";
import { CURTAIN_HEM_DROP, CURTAIN_RAIL_RISE } from "../src/curtain-sheet.js";
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
import { capsule } from "../src/slow-boss-aim-c.js";
import { type Aim, aim } from "../src/slow-intake-aim.js";
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

const edges = (left: number, right: number, top: number, bottom: number) => ({
  x: (left + right) / 2,
  y: (top + bottom) / 2,
  rx: (right - left) / 2,
  ry: (bottom - top) / 2,
});

function around(points: readonly { x: number; y: number }[], r: number) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  return edges(Math.min(...xs) - r, Math.max(...xs) + r, Math.min(...ys) - r, Math.max(...ys) + r);
}

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
      edges(
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
    return capsule(edges(b.left, b.right, b.top, b.bottom));
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
    const ridge = leadRidgeY(L);
    return { x: tip.x, y: tip.y, r: ridge.bottom - ridge.top, ax: foot.x, ay: foot.y };
  },
  ledger: (w) => {
    const s = need(ledgerBoss(w), "ledger");
    return capsule(ledgerBodyBox(L, CFG, s, ledgerGap(L, CFG, s, 0, 0)));
  },
};

describe("THE SLOW's aim at a boss, page three", () => {
  it.each(Object.keys(WANT))("stands round THE %s's whole body, over the field", (kind) => {
    const world = stood(kind as Parameters<typeof waveWith>[0]);
    const at = aim(world, L, 0, 0);
    expect(at).toEqual((WANT[kind] as (w: World) => Aim)(world));
    expect(Math.max(at.y, at.ay)).toBeLessThan(L.hullY - 2 * L.tile);
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
