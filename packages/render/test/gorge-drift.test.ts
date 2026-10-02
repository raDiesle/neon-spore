import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet, GORGE_LEVELS } from "@neon-spore/content";
import { createWorld, type GorgeState, gorgeBoss, gorgeBottom, startWave } from "@neon-spore/sim";
import { gorgePose, gorgePosed } from "../src/gorge-drift.js";
import { gorgeGripCircle, gorgeGripUnder } from "../src/gorge-grip.js";
import { gorgeBubbleAt } from "../src/gorge-place.js";
import { hitCircle, hitReach } from "../src/hit.js";
import { computeLayout } from "../src/layout.js";
import { outlineShift } from "../src/outline-drift.js";
import type { Field } from "../src/touch.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE GORGE's lean (`gorge-drift.ts`): a lobe's top leans by more than half a
 * tile and never past its cap, its intake stays where a shot meets it, no
 * two lobes lean in step, and the tap is taken on the lobe where it is drawn
 * rather than where it hangs at rest.
 */

const l = computeLayout(VIEWPORT, CFG, "p1");

/** The wave's sack, on its first level: a row. */
function staged(): GorgeState {
  const world = createWorld(CFG, 5);
  const index = waveWith("gorge");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const g = gorgeBoss(world);
  if (!g) throw new Error("the gorge wave installed no sack");
  return g;
}

/** A sack on the third level, the first ring, so the pilot's tap has a ring on it. */
function ringed(): GorgeState {
  const world = createWorld(CFG, 5);
  startWave(world, waveWith("gorge"), [], [], { kind: "gorge", levels: GORGE_LEVELS.slice(2) });
  const g = gorgeBoss(world);
  if (!g) throw new Error("no sack");
  return g;
}

/** Every quarter beat of 240, with how far lobe `i`'s pose carries a point `up` tiles above its intake, in tiles. */
function carried(
  g: GorgeState,
  i: number,
  up: number,
): { beat: number; phase: number; tiles: number }[] {
  const root = gorgeBubbleAt(l, CFG, g, i);
  const rest = { x: root.x, y: root.y - up * l.tile };
  const out: { beat: number; phase: number; tiles: number }[] = [];
  for (let quarter = 0; quarter < 4 * 240; quarter++) {
    const beat = Math.floor(quarter / 4);
    const phase = (quarter % 4) / 4;
    const at = gorgePosed(gorgePose(l, CFG, root, i, beat, phase), rest);
    out.push({ beat, phase, tiles: Math.hypot(at.x - rest.x, at.y - rest.y) / l.tile });
  }
  return out;
}

const widest = (s: { tiles: number }[]) => Math.max(...s.map((q) => q.tiles));

describe("THE GORGE's lobes lean on their intakes", () => {
  it("leans a lobe's top by more than half a tile, and never past its cap", () => {
    const g = staged();
    for (const i of [0, 1, 2, 3]) {
      const top = widest(carried(g, i, 1));
      expect(top).toBeGreaterThan(0.5);
      expect(top).toBeLessThanOrEqual(outlineShift("gorge"));
    }
  });

  it("keeps each intake, where the shot goes in, within a fifth of a tile", () => {
    const g = staged();
    for (const i of [0, 3]) expect(widest(carried(g, i, 0))).toBeLessThan(0.2);
  });

  it("leans no two lobes in step", () => {
    const g = staged();
    const a = carried(g, 1, 1);
    const b = carried(g, 3, 1);
    expect(Math.max(...a.map((s, i) => Math.abs(s.tiles - (b[i]?.tiles ?? 0))))).toBeGreaterThan(
      0.3,
    );
  });

  it("takes the tap on the lobe where it is drawn, past the reach of the ring at rest", () => {
    const g = ringed();
    const i = gorgeBottom(g);
    const most = carried(g, i, 0.5).reduce((a, s) => (s.tiles > a.tiles ? s : a));
    const rest = gorgeBubbleAt(l, CFG, g, i);
    const shut = { x: rest.x, y: rest.y - l.tile * 0.5 };
    const drawn = gorgeGripCircle(l, CFG, g, i, most.beat, most.phase);
    const d = Math.hypot(drawn.x - shut.x, drawn.y - shut.y);
    expect(d / l.tile).toBeGreaterThan(0.2);
    // Just inside the drawn ring's reach, on the far side from where it rests.
    const reach = hitReach(drawn.r) * 0.98;
    const x = drawn.x + ((drawn.x - shut.x) / d) * reach;
    const y = drawn.y + ((drawn.y - shut.y) / d) * reach;
    expect(hitCircle({ ...shut, r: drawn.r }, x, y)).toBe(false);

    const field: Field = {
      creatures: [],
      cannonCol: 4,
      shieldCol: 4,
      beatPhase: most.phase,
      skinY: null,
      beat: most.beat,
      waveBeat: most.beat,
      tick: 0,
      seat: 1,
      cfg: CFG,
      boss: g,
      controls: controlSet("default"),
      faults: [],
      well: false,
    };
    expect(gorgeGripUnder(l, x, y, field)?.command).toMatchObject({ target: "gorgeLobe", id: i });
  });
});
