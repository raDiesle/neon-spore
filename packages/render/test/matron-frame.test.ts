import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type MatronState,
  matronBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { rgba } from "../src/hex.js";
import { computeLayout, tileCY, type ViewRole } from "../src/layout.js";
import { MATRON_LOBE_TILES, matronBodyAt, matronEggs } from "../src/matron-place.js";
import { MATRON_RIM } from "../src/matron-tint.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE MATRON, drawn (`render/src/matron-draw.ts`): her body on all three
 * screens, a lobe down to every pod she holds and none to one shot loose, an
 * egg inside her for every pod still to come, her rear between clutches, and
 * her beaten — set rather than played to; `sim/test/matron.test.ts` proves
 * the rules.
 */

const TPB = ticksPerBeat(CFG);
const L = computeLayout(VIEWPORT, CFG, "test");
const RIM = rgba(MATRON_RIM, 0.85);
const EGG = rgba(PALETTE.podRim, 0.55);

/** The wave's own mother, down and her first clutch hung. */
function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("matron");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * (CFG.matronEnterBeats + 1); i++) step(world, []);
  return world;
}

function matron(world: World): MatronState {
  const s = matronBoss(world);
  if (s === null) throw new Error("the finale hung no mother");
  return s;
}

/** The frames of a pose, joined, the world held where it was posed. */
function frame(role: ViewRole, arrange: (world: World, s: MatronState) => void = () => {}): string {
  const world = hung();
  arrange(world, matron(world));
  const log: string[] = [];
  runFrames(world, role, 3, {
    every: 1,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return log.join("|");
}

const count = (text: string, colour: string): number => text.split(colour).length - 1;

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) frame(role);
});

describe("THE MATRON", () => {
  it.each(ROLES)("hangs over the field on %s", (role) => {
    expect(count(frame(role), RIM)).toBeGreaterThan(0);
  });

  it.each(ROLES)(
    "reaches a lobe down to every pod she holds, and none to one shot loose, on %s",
    (role) => {
      const holding = count(frame(role), RIM);
      const loose = count(
        frame(role, (w) => {
          for (const p of w.pods) p.loose = true;
        }),
        RIM,
      );
      expect(holding).toBeGreaterThan(loose);
    },
  );

  it("hangs her belly a lobe's length over the pods", () => {
    const s = matron(hung());
    const b = matronBodyAt(L, CFG, s, s.phaseBeat, 0);
    const row = tileCY(L, CFG.matronPodRow);
    expect(b.y + b.ry).toBeCloseTo(row - MATRON_LOBE_TILES * L.tile, 0);
  });

  it("carries an egg inside her for every pod of the clutches to come", () => {
    const s = matron(hung());
    expect(matronEggs(s)).toBe(s.steps.slice(1).reduce((n, st) => n + st.pods.length, 0));
    const first = count(frame("p1"), EGG);
    const last = count(
      frame("p1", (_, st) => {
        st.cursor = st.steps.length - 1;
      }),
      EGG,
    );
    expect(first).toBeGreaterThan(last);
  });

  it("rears back between clutches, and comes down again", () => {
    const s = matron(hung());
    const hanging = matronBodyAt(L, CFG, s, s.phaseBeat, 0).y;
    s.phase = "rear";
    const midway = matronBodyAt(L, CFG, s, s.phaseBeat + CFG.matronRearBeats / 2, 0).y;
    const done = matronBodyAt(L, CFG, s, s.phaseBeat + CFG.matronRearBeats, 0).y;
    expect(midway).toBeLessThan(hanging);
    expect(done).toBeCloseTo(hanging, 3);
  });

  it.each(ROLES)("greys and sags away once beaten, on %s", (role) => {
    const spent = frame(role, (w, s) => {
      s.phase = "spent";
      s.phaseBeat = w.beat;
      w.pods = [];
    });
    expect(count(spent, rgba(PALETTE.dim, 0.8))).toBeGreaterThan(0);
    expect(count(spent, RIM)).toBe(0);
  });
});
