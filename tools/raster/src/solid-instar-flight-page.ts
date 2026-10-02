import { Canvas2DRenderer } from "../../../packages/render/src/canvas2d.js";
import { INSTAR_FLIGHT_ENDS } from "../../../packages/render/src/instar-shape.js";
import { beatSeconds, DEFAULT_CONFIG } from "../../../packages/sim/src/index.js";
import { acting, hung } from "./instar-world.js";

/**
 * The INSTAR flight strip (`bun run solid --instar-flight`): the game's own
 * renderer drawing THE INSTAR flying one pass of its script, at eight moments
 * from take-off to landing, four to a row, swimming as it flies
 * (`instar-serpent.ts`). Each frame is windowed to
 * the band the body flies through.
 */

const CFG = DEFAULT_CONFIG;
const VIEW = { width: 900, height: 1600, dpr: 1 };
/** The band of the frame the body flies through, as parts of its height. */
const BAND = [0.02, 0.56] as const;
const FRAMES = 8;
const CELL = 450;
/** Frames to a row: the eight in two rows of four. */
const COLS = 4;

function draw(): string {
  const frame = document.createElement("canvas");
  const renderer = new Canvas2DRenderer(frame);
  renderer.resize(VIEW);
  const band = { y: VIEW.height * BAND[0], h: VIEW.height * (BAND[1] - BAND[0]) };
  const cellH = Math.round((CELL * band.h) / VIEW.width);
  const sheet = document.createElement("canvas");
  sheet.width = CELL * COLS;
  sheet.height = cellH * (FRAMES / COLS);
  const ctx = sheet.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  const world = hung();
  const s = acting(world, 0, world.beat);
  const cursor = s.steps.findIndex((st) => st.arrive === "passes");
  if (cursor < 0) throw new Error("no step of the script passes");
  const flight = (s.steps[cursor]?.morphBeats ?? 0) * INSTAR_FLIGHT_ENDS;
  const start = world.beat;
  for (let k = 0; k < FRAMES; k++) {
    // From just after take-off to just before the landing.
    const into = (flight * (k + 0.5)) / FRAMES;
    const at = start + into;
    world.beat = Math.floor(at);
    acting(world, cursor, start);
    s.phase = "morph";
    renderer.draw({
      world,
      beatPhase: at - world.beat,
      role: "p1",
      time: into * beatSeconds(CFG),
      dt: 1 / CFG.tickHz,
      events: [],
      running: true,
    });
    const x = (k % COLS) * CELL;
    const y = Math.floor(k / COLS) * cellH;
    ctx.drawImage(frame, 0, band.y, VIEW.width, band.h, x, y, CELL, cellH);
    ctx.strokeStyle = "#241B4F";
    ctx.strokeRect(x + 0.5, y + 0.5, CELL - 1, cellH - 1);
    ctx.fillStyle = "#B8AEE0";
    ctx.font = "18px monospace";
    ctx.fillText(`beat ${into.toFixed(1)}`, x + 10, y + 24);
  }
  return sheet.toDataURL("image/png");
}

(window as unknown as { __sheet: string }).__sheet = draw();
