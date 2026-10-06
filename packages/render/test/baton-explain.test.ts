import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  BATON_LEVELS,
  BATON_SOCKET_DARK,
  type BatonState,
  batonBoss,
  createWorld,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { batonBanner, batonJobs, wrap } from "../src/baton-explain.js";
import { batonComing, batonRunning, PART_LEVEL } from "../src/baton-explain-when.js";
import type { TextBox } from "./canvas-stub.js";
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
 * THE BATON's own words on the field (`baton-explain.ts`): a banner while a
 * part is coming, each screen's job beside it while it runs, and only on the
 * level the part first comes in on — the owner's three answers, 6 October 2026.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const N = CFG.batonSockets;

function arm(world: World): BatonState {
  const b = batonBoss(world);
  if (b === null) throw new Error("the baton wave installed no arm");
  return b;
}

/** The arm unfolded on the single level, the bead in socket `socket`, every socket above it dark. */
function at(socket: number, level = "single"): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("baton");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < (N + 1) * TPB; i++) step(world, []);
  const b = arm(world);
  b.level = BATON_LEVELS.indexOf(level as (typeof BATON_LEVELS)[number]);
  for (let i = 0; i < socket; i++) b.sockets[i] = BATON_SOCKET_DARK;
  const bead = b.beads[0];
  if (bead !== undefined) bead.socket = socket;
  return world;
}

const PARTS = ["swing", "shed", "twin", "merge", "crossing", "pair", "across"] as const;
/** Every line the explanation can draw. */
const OURS = new Set(
  PARTS.flatMap((part) => [
    batonBanner(part),
    ...[
      ...batonJobs(part, true, 1),
      ...batonJobs(part, false, 1),
      ...batonJobs(part, false, 2),
    ].flatMap(wrap),
  ]),
);

/** Every word a screen drew over two frames, and whether each stayed on the screen. */
function text(world: World, role: (typeof ROLES)[number]): string {
  const texts: TextBox[] = [];
  runFrames(world, role, 2, {
    every: 1,
    onCanvas: (c) => {
      c.texts = texts;
    },
  });
  // The explanation's own words, which are the ones this file put there.
  for (const box of texts.filter((t) => OURS.has(t.text))) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.w).toBeLessThanOrEqual(VIEWPORT.width * VIEWPORT.dpr);
  }
  return texts.map((box) => box.text).join("|");
}

describe("THE BATON's words on the field", () => {
  it("says the swing is coming one dark socket before it, and only on the first level", () => {
    expect(batonComing(CFG, arm(at(CFG.batonSwingAfter - 1)))).toBe("swing");
    expect(batonComing(CFG, arm(at(CFG.batonSwingAfter - 2)))).toBeNull();
    expect(batonComing(CFG, arm(at(CFG.batonSwingAfter - 1, "twin")))).toBeNull();
  });

  it("tells each screen its job while the swing runs, and stops after two sockets", () => {
    expect(batonRunning(CFG, arm(at(CFG.batonSwingAfter)))).toBe("swing");
    expect(batonRunning(CFG, arm(at(CFG.batonSwingAfter + 2)))).toBeNull();
  });

  it("says a new arm is coming while it unfolds, on its own level only", () => {
    const world = at(0, "pair");
    arm(world).stage = "unfolding";
    expect(batonComing(CFG, arm(world))).toBe("pair");
    arm(world).level = BATON_LEVELS.indexOf("twin");
    expect(batonComing(CFG, arm(world))).toBeNull();
  });

  it("explains every part on a level the wave has", () => {
    for (const level of Object.values(PART_LEVEL)) expect(BATON_LEVELS).toContain(level);
  });

  it("gives each screen its own job, and the test screen both", () => {
    expect(batonJobs("crossing", false, 1)).toEqual(["TAP, THEN WAIT FOR P2."]);
    expect(batonJobs("crossing", false, 2)).toEqual(["FIRE AFTER EACH P1 TAP."]);
    expect(batonJobs("crossing", true, 1)).toHaveLength(2);
  });

  it("breaks a label at the spaces, never over a line's letters", () => {
    for (const line of wrap("MOVE ONE COLUMN RIGHT EACH TIME."))
      expect(line.length).toBeLessThanOrEqual(15);
  });

  for (const role of ROLES) {
    it(`draws the banner while the swing is coming, and the job while it runs, for ${role}`, () => {
      expect(text(at(CFG.batonSwingAfter - 1), role)).toContain(batonBanner("swing"));
      const job = batonJobs("swing", role === "test", role === "p2" ? 2 : 1)[0] ?? "";
      expect(text(at(CFG.batonSwingAfter), role)).toContain(wrap(job)[0] ?? "");
    });
  }
});
