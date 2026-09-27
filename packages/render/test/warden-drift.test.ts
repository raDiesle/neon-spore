import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  createWorld,
  NO_TETHER,
  startWave,
  step,
  ticksPerBeat,
  WARDEN_PHASES,
  type WardenState,
  type World,
} from "@neon-spore/sim";
import { hitCircle, hitReach } from "../src/hit.js";
import { computeLayout } from "../src/layout.js";
import { outlineShift } from "../src/outline-drift.js";
import type { Field } from "../src/touch.js";
import { wardenRadius } from "../src/warden.js";
import { wardenPose, wardenPosed, wardenPosedCircle } from "../src/warden-drift.js";
import { wardenGripCircle, wardenGripUnder } from "../src/warden-grip.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE WARDEN's rock (`warden-drift.ts`): big enough to be seen at the top of
 * the ring, small at its foot where the throat and the rope are, and a thumb
 * is taken on the eye where the rocked ring draws it rather than where it
 * stands at rest.
 */

const l = computeLayout(VIEWPORT, CFG, "p2");
const NARROW = WARDEN_PHASES[0]!.above;

function opened(): { world: World; b: WardenState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("warden");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const b = world.boss;
  if (b === null || b.kind !== "warden") throw new Error("the warden's wave installed no warden");
  b.plates = NARROW;
  let guard = 0;
  while (b.tetherId === NO_TETHER && guard++ < 60 * ticksPerBeat(CFG)) step(world, []);
  return { world, b };
}

const body = (world: World, b: WardenState) => {
  const c = world.creatures.find((c) => c.id === b.creatureId);
  if (c === undefined) throw new Error("the warden has no body");
  return c;
};

/** Every quarter beat of `beats`, each with how far the pose carries `q` there, in tiles. */
function carried(
  world: World,
  b: WardenState,
  q: (root: { x: number; y: number }) => {
    x: number;
    y: number;
  },
): { beat: number; phase: number; tiles: number }[] {
  const out: { beat: number; phase: number; tiles: number }[] = [];
  for (let quarter = 0; quarter < 4 * 240; quarter++) {
    const beat = Math.floor(quarter / 4);
    const phase = (quarter % 4) / 4;
    const p = wardenPose(l, CFG, body(world, b), beat, phase);
    const rest = q(p.root);
    const at = wardenPosed(p, rest);
    out.push({ beat, phase, tiles: Math.hypot(at.x - rest.x, at.y - rest.y) / l.tile });
  }
  return out;
}

describe("THE WARDEN rocks on its foot", () => {
  it("leans the top of the ring by more than half a tile, and never past its cap", () => {
    const { world, b } = opened();
    const r = wardenRadius(l);
    const top = carried(world, b, (root) => ({ x: root.x, y: root.y - 2 * r }));
    const widest = Math.max(...top.map((s) => s.tiles));
    expect(widest).toBeGreaterThan(0.5);
    expect(widest).toBeLessThanOrEqual(outlineShift("warden"));
  });

  it("keeps its foot, where the shot comes in and the rope leaves, within a fifth of a tile", () => {
    const { world, b } = opened();
    const foot = carried(world, b, (root) => root);
    expect(Math.max(...foot.map((s) => s.tiles))).toBeLessThan(0.2);
  });

  it("takes a thumb on the eye where it is drawn, past the reach of the eye at rest", () => {
    const { world, b } = opened();
    const r = wardenRadius(l);
    const eye = carried(world, b, (root) => ({ x: root.x, y: root.y - r }));
    const most = eye.reduce((a, s) => (s.tiles > a.tiles ? s : a));
    expect(most.tiles).toBeGreaterThan(0.2);

    const shut = wardenGripCircle(l, body(world, b), b);
    const pose = wardenPose(l, CFG, body(world, b), most.beat, most.phase);
    const drawn = wardenPosedCircle(pose, shut);
    // Just inside the drawn eye's reach, on the far side from where it rests.
    const d = Math.hypot(drawn.x - shut.x, drawn.y - shut.y);
    const reach = hitReach(drawn.r) * 0.98;
    const x = drawn.x + ((drawn.x - shut.x) / d) * reach;
    const y = drawn.y + ((drawn.y - shut.y) / d) * reach;
    expect(hitCircle(shut, x, y)).toBe(false);

    const field: Field = {
      creatures: world.creatures,
      cannonCol: 4,
      shieldCol: 4,
      beatPhase: most.phase,
      skinY: null,
      beat: most.beat,
      waveBeat: world.waveBeat,
      tick: world.tick,
      seat: 2,
      cfg: CFG,
      boss: world.boss,
      controls: controlSet("default"),
      faults: [],
      well: false,
    };
    expect(wardenGripUnder(l, x, y, field)?.command).toMatchObject({ target: "wardenEye" });
  });
});
