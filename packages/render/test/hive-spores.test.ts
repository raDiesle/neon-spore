import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { drawHiveSpores } from "../src/hive-spores.js";
import { PALETTE } from "../src/palette.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE HIVE's swarm round an open breach (`hive-spores.ts`). It is drawn on
 * both screens, and which colour a breach wants is what one of them keeps
 * from the other — so the swarm may never be in a fire button's colour.
 */

beforeAll(installCanvasGlobals);

function draw(time: number, fade = 1): string[] {
  const { ctx } = stubCanvas();
  const log: string[] = [];
  ctx.log = log;
  drawHiveSpores(ctx as unknown as CanvasRenderingContext2D, 100, 100, 40, time, fade);
  ctx.log = undefined;
  return log;
}

describe("THE HIVE's spores", () => {
  it("swarm in the hive's own bile and never a fire button's colour", () => {
    for (const time of [0, 0.7, 3.1]) {
      const text = draw(time).join("\n");
      expect(text).toContain(PALETTE.bile);
      for (const fire of [PALETTE.red, PALETTE.cyan, PALETTE.redRim, PALETTE.cyanRim])
        expect(text).not.toContain(fire);
    }
  });

  it("move from one moment to the next", () => {
    expect(draw(0).join("\n")).not.toBe(draw(0.5).join("\n"));
  });

  it("draw nothing once the mass has faded out", () => {
    expect(draw(1, 0)).toEqual([]);
  });
});
