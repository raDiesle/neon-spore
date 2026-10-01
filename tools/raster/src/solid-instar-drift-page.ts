import { buildBoss, buildQueue, INSTAR_SCRIPT, WAVES } from "@neon-spore/content";
import { Canvas2DRenderer } from "../../../packages/render/src/canvas2d.js";
import { INSTAR_DRIFT } from "../../../packages/render/src/instar-drift.js";
import { instarSway } from "../../../packages/render/src/instar-sway.js";
import {
  beatSeconds,
  createWorld,
  DEFAULT_CONFIG,
  type InstarState,
  instarBoss,
  NO_BEARING,
  NOT_DONE,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "../../../packages/sim/src/index.js";
import { INSTAR_DRIFT_TURN } from "../../versus/candidates/instar-drift/turn/index.js";
import { apply, restore } from "../../versus/variant.js";

/**
 * The INSTAR drift strip (`bun run solid --instar-drift`): the game's own
 * renderer drawing THE INSTAR's wave, the body acting a side-on step, at
 * eight moments across ten seconds, four to a row — the shipped body still
 * above, VERSUS's drift below it (`tools/versus/candidates/instar-drift/turn`). Each
 * frame is windowed to the band the body is drawn in, so the turn can be seen.
 */

const CFG = DEFAULT_CONFIG;
const VIEW = { width: 900, height: 1600, dpr: 1 };
/** The band of the frame the body is drawn in, as parts of its height. */
const BAND = [0.04, 0.5] as const;
const FRAMES = 8;
const SECONDS = 10;
const CELL = 450;
/** Frames to a row: the eight in two rows of four, shipped above drift each time. */
const COLS = 4;

/** The wave hung, a few beats in — `packages/render/test/instar-kit.ts`'s `hung`. */
function hung(): World {
  const world = createWorld(CFG, 3);
  const index = WAVES.findIndex((w) => w.boss?.kind === "instar");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < ticksPerBeat(CFG) * 4; i++) step(world, []);
  return world;
}

/** The body acting step `cursor` from `beat`, its marks untouched. */
function acting(world: World, cursor: number, beat: number): InstarState {
  const s = instarBoss(world);
  if (s === null) throw new Error("the instar wave hung no body");
  s.cursor = cursor;
  s.phase = "act";
  s.phaseBeat = beat;
  const n = s.steps[cursor]?.marks.length ?? 0;
  s.progress = Array.from({ length: n }, () => 0);
  s.doneBeat = Array.from({ length: n }, () => NOT_DONE);
  s.ref = Array.from({ length: n }, () => NO_BEARING);
  s.thumbs = Array.from({ length: n }, () => 0);
  return s;
}

/** The first step acted side-on, where the drift is whole. */
function sideOn(world: World): number {
  const was = INSTAR_DRIFT.amount;
  INSTAR_DRIFT.amount = 1;
  try {
    for (let cursor = 0; cursor < INSTAR_SCRIPT.length; cursor++) {
      const s = acting(world, cursor, world.beat);
      const d = instarSway(s, CFG, world, world.beat + 2, 0).drift;
      if (d !== undefined && d.headYaw !== 0) return cursor;
    }
  } finally {
    INSTAR_DRIFT.amount = was;
  }
  throw new Error("no step of the script is acted side-on");
}

function draw(): string {
  const frame = document.createElement("canvas");
  const renderer = new Canvas2DRenderer(frame);
  renderer.resize(VIEW);
  const band = { y: VIEW.height * BAND[0], h: VIEW.height * (BAND[1] - BAND[0]) };
  const cellH = Math.round((CELL * band.h) / VIEW.width);
  const sheet = document.createElement("canvas");
  sheet.width = CELL * COLS;
  sheet.height = cellH * 2 * (FRAMES / COLS);
  const ctx = sheet.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  const world = hung();
  const cursor = sideOn(world);
  const start = world.beat;
  ["shipped", "turn"].forEach((name, row) => {
    const applied = row === 1 ? apply(INSTAR_DRIFT_TURN) : null;
    try {
      for (let k = 0; k < FRAMES; k++) {
        const t = (k * SECONDS) / (FRAMES - 1);
        const at = start + t / beatSeconds(CFG);
        world.beat = Math.floor(at);
        // The step starts afresh each frame, so it is acted, never run out.
        acting(world, cursor, world.beat);
        renderer.draw({
          world,
          beatPhase: at - world.beat,
          role: "p1",
          time: t,
          dt: 1 / CFG.tickHz,
          events: [],
          running: true,
        });
        const x = (k % COLS) * CELL;
        const y = (Math.floor(k / COLS) * 2 + row) * cellH;
        ctx.drawImage(frame, 0, band.y, VIEW.width, band.h, x, y, CELL, cellH);
        ctx.strokeStyle = "#241B4F";
        ctx.strokeRect(x + 0.5, y + 0.5, CELL - 1, cellH - 1);
        ctx.fillStyle = "#B8AEE0";
        ctx.font = "18px monospace";
        ctx.fillText(`${name}  ${t.toFixed(1)} s`, x + 10, y + 24);
      }
    } finally {
      if (applied) restore(applied);
    }
  });
  return sheet.toDataURL("image/png");
}

(window as unknown as { __sheet: string }).__sheet = draw();
