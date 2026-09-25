import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  createWorld,
  MALFUNCTION_KINDS,
  type Malfunction,
  type MalfunctionKind,
  type SpawnEntry,
  startWave,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { FAULT_LABEL } from "../src/fault-label.js";
import type { ViewRole } from "../src/view-role.js";
import type { TextBox } from "./canvas-stub.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  VIEWPORT,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Every fault says what it is doing, beside the lantern** (`fault-label.ts`),
 * on the screens it is meant for and on no other: THE CODEX on the pilot's,
 * THE FLIP on the turned one.
 */

const TPB = ticksPerBeat(CFG);

beforeAll(installCanvasGlobals);

const slick = (col: number): SpawnEntry => ({ beat: 0, col, kind: "slick", color: "red" });

function shape(kind: MalfunctionKind): Malfunction {
  if (kind === "cannon") return { kind, color: "red" };
  if (kind === "flip") return { kind, seat: 1 };
  return { kind } as Malfunction;
}

function faulted(kind: MalfunctionKind): World {
  const world = createWorld(CFG, 3);
  startWave(world, 0, [slick(3), slick(5)], [], null, false, 0, [
    { ...shape(kind), at: 0, beats: 0 },
  ]);
  return world;
}

function words(kind: MalfunctionKind, role: ViewRole): TextBox[] {
  const texts: TextBox[] = [];
  runFrames(faulted(kind), role, TPB * 2, { onCanvas: (ctx) => (ctx.texts = texts) });
  return texts.filter((t) => t.text === FAULT_LABEL[kind]);
}

describe("the fault label", () => {
  for (const kind of MALFUNCTION_KINDS) {
    const role: ViewRole = kind === "flip" || kind === "codex" ? "p1" : "p2";
    it(`is drawn for ${kind}, inside the screen`, () => {
      const drawn = words(kind, role);
      expect(drawn.length).toBeGreaterThan(0);
      for (const t of drawn) {
        expect(t.x).toBeGreaterThanOrEqual(0);
        expect(t.x + t.w).toBeLessThanOrEqual(VIEWPORT.width * VIEWPORT.dpr);
      }
    });
  }

  it("is kept from the navigator under THE CODEX", () => {
    expect(words("codex", "p2")).toHaveLength(0);
  });

  it("is kept from the true screen under THE FLIP", () => {
    expect(words("flip", "p2")).toHaveLength(0);
  });
});
