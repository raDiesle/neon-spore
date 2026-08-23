import { buildQueue } from "@neon-spore/content";
import { Canvas2DRenderer } from "@neon-spore/render";
import { createWorld, DEFAULT_CONFIG, hullPercent, step, ticksPerBeat } from "@neon-spore/sim";
import { bindControls, InputBuffer } from "./input.js";
import { startLoop } from "./loop.js";

const canvas = document.getElementById("stage") as HTMLCanvasElement | null;
if (!canvas) throw new Error("canvas #stage missing");

const cfg = DEFAULT_CONFIG;
const world = createWorld(cfg, 0);
world.queue = buildQueue(0, cfg.cols);

const renderer = new Canvas2DRenderer(canvas);
const buffer = new InputBuffer();
bindControls({ cols: cfg.cols, buffer });

const resize = (): void =>
  renderer.resize({
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
  });
window.addEventListener("resize", resize);
resize();

const hullEl = document.getElementById("hull");
const beatEl = document.getElementById("beat");
const guardEl = document.getElementById("guardStat");
const tpb = ticksPerBeat(cfg);

startLoop(
  cfg.tickHz,
  () => step(world, buffer.drain(world.tick)),
  () => {
    renderer.draw({ world, beatPhase: (world.tick % tpb) / tpb, player: 1 });
    if (hullEl) hullEl.textContent = hullPercent(world).toFixed(0);
    if (beatEl) beatEl.textContent = String(world.beat);
    if (guardEl) guardEl.textContent = `${world.guard.deflected}/${world.guard.tries}`;
  },
);
