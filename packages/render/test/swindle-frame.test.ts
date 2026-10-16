import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type SwindleState,
  startWave,
  step,
  swindleBoss,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { rgba } from "../src/hex.js";
import { computeLayout, tileCY, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  SWINDLE_SAG,
  SWINDLE_STRAND_TILES,
  swindleBodyAt,
  swindleHolding,
} from "../src/swindle-place.js";
import { SWINDLE_RIM } from "../src/swindle-tint.js";
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
 * THE SWINDLE, drawn (`render/src/swindle-draw.ts`): her body on all three
 * screens, a hood over every pod she holds and none over one let go, **the
 * pilot's frame the same whether a pod is real or fake**, a hood lifting off
 * a gliding pod, her rear between hands, and her beaten — set rather than
 * played to; `sim/test/swindle.test.ts` proves the rules.
 */

const TPB = ticksPerBeat(CFG);
const L = computeLayout(VIEWPORT, CFG, "test");
const RIM = rgba(SWINDLE_RIM, 0.85);

/** The wave's own swindle, in and her first hand hung. */
function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("swindle");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * (CFG.swindleEnterBeats + 1); i++) step(world, []);
  return world;
}

function swindle(world: World): SwindleState {
  const s = swindleBoss(world);
  if (s === null) throw new Error("the wave hung no swindle");
  return s;
}

/** The frames of a pose, joined, the world held where it was posed. */
function frame(
  role: ViewRole,
  arrange: (world: World, s: SwindleState) => void = () => {},
): string {
  const world = hung();
  arrange(world, swindle(world));
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

/** Every pod of hers turned into the other kind. */
function turnKinds(world: World, s: SwindleState): void {
  for (const p of world.pods) if (s.hung.includes(p.id)) p.kind = p.kind === "pod" ? "husk" : "pod";
}

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) frame(role);
});

describe("THE SWINDLE", () => {
  it.each(ROLES)("hangs over the field on %s", (role) => {
    expect(count(frame(role), RIM)).toBeGreaterThan(0);
  });

  it.each(ROLES)(
    "holds a hood over every pod she holds, and none over one let go, on %s",
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

  it("draws the pilot nothing that tells a fake pod from a real one", () => {
    expect(frame("p1", turnKinds)).toBe(frame("p1"));
    // And the navigator's frame does differ: the mark is the only tell.
    expect(frame("p2", turnKinds)).not.toBe(frame("p2"));
  });

  it("lifts a hood off its pod while the pod glides", () => {
    const world = hung();
    const s = swindle(world);
    const [first] = swindleHolding(world, s);
    expect(first?.lift).toBe(0);
    const pod = world.pods.find((p) => p.id === first?.pod.id);
    if (pod) pod.crossMilli = 40;
    expect(swindleHolding(world, s)[0]?.lift).toBe(1);
  });

  it("hangs her belly a strand's length over the pods", () => {
    const s = swindle(hung());
    const b = swindleBodyAt(L, CFG, s, s.phaseBeat, 0);
    const row = tileCY(L, CFG.swindlePodRow);
    expect(b.y + b.ry * (1 + SWINDLE_SAG)).toBeCloseTo(row - SWINDLE_STRAND_TILES * L.tile, 0);
  });

  it("rears back between hands, and comes down again", () => {
    const s = swindle(hung());
    const hanging = swindleBodyAt(L, CFG, s, s.phaseBeat, 0).y;
    s.phase = "rear";
    const midway = swindleBodyAt(L, CFG, s, s.phaseBeat + CFG.swindleRearBeats / 2, 0).y;
    const done = swindleBodyAt(L, CFG, s, s.phaseBeat + CFG.swindleRearBeats, 0).y;
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
