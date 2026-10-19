import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { controlSetForWave, WAVES } from "@neon-spore/content";
import { handoverLeft, step } from "@neon-spore/sim";
import { captionBox } from "../src/guide-tide-caption-box.js";
import { handedRole } from "../src/handover.js";
import { handoverPlateBox } from "../src/handover-look.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { HINT_BEATS, hinting, waveHint } from "../src/wave-hint.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";
import { CFG, SIZES, started } from "./wave-hint-world.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE HANDOVER's countdown plate and the tutorial plate over its field.**
 *
 * The countdown sits on the lip of the band, and a plate anchored on what is
 * under that lip stood over it: the rehearsal's fourth page drew PLAYER 2
 * MOVES THE CANNON straight over THEIR PANEL — BACK IN 3 (photographed 13
 * September 2026). The film went on 19 October 2026 and the wave teaches on its
 * own field (`hints/faults.ts`), where the line on the fire button found the
 * other way out: under its ring and off the foot of the screen. Held on the
 * box, not the words, because the plate is an opaque fill
 * (`guide-tide-caption-box.ts`).
 */

const WAVE = WAVES.findIndex((w) => w.name === "THE HANDOVER");
const ROLES: ViewRole[] = ["p1", "p2", "test"];

beforeAll(installCanvasGlobals);

describe("THE HANDOVER's countdown and a hint's plate", () => {
  it("share no room, and the plate stays on the screen, on every seat and size", () => {
    const world = started(WAVE);
    const { ctx } = stubCanvas();
    const c = ctx as unknown as CanvasRenderingContext2D;
    const set = controlSetForWave(WAVE);
    // Traded, not warned of: the plate says so before the trade as well.
    const ready = () => handoverLeft(world) > 0 && hinting(world) && world.creatures.length > 0;
    for (let i = 0; i < 20000 && !ready(); i++) step(world, []);
    expect(ready(), "the panels never traded with a body to teach on").toBe(true);
    let seen = 0;
    for (const size of SIZES) {
      for (const role of ROLES) {
        const l = computeLayout(size, CFG, handedRole(role, world));
        const plate = handoverPlateBox(c, l, world);
        if (plate === null) continue;
        // Under the body and away from it, each line its turn.
        for (let turn = 0; turn < 4 * CFG.cols; turn++) {
          world.cannonCol = turn % CFG.cols;
          world.beat = Math.floor(turn / CFG.cols) * HINT_BEATS;
          const hint = waveHint(l, world, 0.5, set);
          if (hint === null) continue;
          const page = { tick: 0, seat: hint.seat, text: hint.text, anchor: hint.anchor };
          const box = captionBox(c, l, hint.world, set, page, 0.5);
          if (box === null) continue;
          seen++;
          const at = `${size.width} ${role} "${hint.text}" at ${Math.round(box.y)}`;
          const crosses =
            box.x < plate.x + plate.w &&
            box.x + box.w > plate.x &&
            box.y < plate.y + plate.h &&
            box.y + box.h > plate.y;
          expect(crosses, `${at}: over the countdown`).toBe(false);
          expect(box.y + box.h, `${at}: off the screen`).toBeLessThanOrEqual(l.height);
        }
      }
    }
    expect(seen, "no hint stood beside the countdown").toBeGreaterThan(0);
  });
});
