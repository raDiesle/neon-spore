import {
  type BastionLayer,
  type BastionState,
  bastionCharging,
  bastionFrontGun,
  bastionGone,
  bastionLitStep,
  bastionNext,
  type World,
} from "@neon-spore/sim";
import { drawBastionCage, type NodeMark } from "./bastion-cage.js";
import type { BastionFx } from "./bastion-fx.js";
import { drawBastionHandles } from "./bastion-handles.js";
import { drawBastionCore, drawBastionHull, type PortMark } from "./bastion-hull.js";
import { drawBastionPlates } from "./bastion-plates.js";
import { type BastionPose, bastionPose } from "./bastion-pose.js";
import { drawBastionArcs, drawBastionFlung } from "./bastion-receipts.js";
import { bastionGuns, drawRingBack, drawRingFront } from "./bastion-ring.js";
import {
  type At,
  BASTION_CORE_TILES,
  BASTION_SHELL_TILES,
  bastionNodeAt,
  bastionPortAt,
  bastionReach,
} from "./bastion-shape.js";
import { drawBastionRegrow, drawBastionShed } from "./bastion-shed.js";
import { drawBastionHalos, drawBastionVerdicts } from "./bastion-verdicts.js";
import { drawHurt } from "./boss-hurt.js";
import type { Layout } from "./layout.js";
import { showsBastionPort } from "./view-role-clocks-c.js";

/**
 * **THE BASTION** (§11.62): a metal moon hung over the field in four shells,
 * each its own metal and its own machine, drawn inside out so every shell
 * still on shows through the gaps in the one over it — the core's glow
 * through the cage, the cage over the hull, the gun ring round both, and the
 * armour over the lot.
 *
 * **Both screens draw the one moon**; only the ports differ, shown to the
 * navigator alone (`showsBastionPort`).
 *
 * **Progress is read off the moon, never a bar**: every piece off is gone
 * from its shell — a slab torn and flying, a gun a stump, a node black, a
 * port a crater — and every shell off leaves the moon a size smaller, with
 * the shell flung apart in a green shockwave (`bastion-shed.ts`).
 *
 * Everything is read off `world` each frame but its receipts — the plates in
 * flight, the lightning, the shudder and the blow (`bastion-fx.ts`, drawn by
 * `bastion-receipts.ts`) — and the knobs the thumbs take it apart by, with
 * what they say back (`bastion-handles.ts`, `bastion-verdicts.ts`).
 */
export function drawBastion(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: BastionState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: BastionFx,
): void {
  const p = bastionPose(l, world.cfg, s, beat, beatPhase);
  fx.note(s);
  const c = p.c;
  const reach = bastionReach(l, s);
  ctx.save();
  ctx.translate(fx.hurt.shakeX(time, l.tile), 0);
  if (p.near < 1) {
    // Out of deep space: small and dim, coming on to its full size.
    const k = 0.12 + 0.88 * p.near;
    ctx.translate(c.x, c.y);
    ctx.scale(k, k);
    ctx.translate(-c.x, -c.y);
    ctx.globalAlpha = 0.3 + 0.7 * p.near;
  }
  drawShells(ctx, l, world, s, p, time);
  const body = new Path2D();
  body.arc(c.x, c.y, reach, 0, Math.PI * 2);
  drawHurt(ctx, body, fx.hurt.value);
  ctx.restore();
  if (p.shed !== null) drawBastionShed(ctx, l, c, p.shed.layer, p.shed.k, reach);
  const growing = s.phase === "regrow" ? s.steps[s.cursor]?.layer : undefined;
  if (growing !== undefined) drawBastionRegrow(ctx, l, c, growing, p.grow, p.pulse);
  drawBastionFlung(ctx, l, c, fx.flung);
  drawBastionArcs(ctx, fx.arcs, time);
  drawBastionHalos(ctx, l, world.cfg, s, time);
  drawBastionHandles(ctx, l, world.cfg, s, time);
  drawBastionVerdicts(ctx, l, world.cfg, s, time, fx.marks.verdicts);
}

function drawShells(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: BastionState,
  p: BastionPose,
  time: number,
): void {
  const c = p.c;
  const lit = bastionLitStep(s)?.layer ?? null;
  const ringStep = stepOf(s, "ring");
  const guns =
    ringStep === null
      ? []
      : bastionGuns(l, c, s, ringStep, lit === "ring", bastionFrontGun(world, s));
  const yaw = (s.yawMilli / 1000) * (Math.PI / 180);
  const growing = s.phase === "regrow" ? (s.steps[s.cursor]?.layer ?? null) : null;
  const shell = (layer: BastionLayer, draw: () => void) => {
    if (stepOf(s, layer) === null) return;
    grown(ctx, c, layer === growing ? p.grow : 1, draw);
  };
  shell("ring", () => drawRingBack(ctx, l, c, guns, yaw, p.pulse));
  drawBastionCore(ctx, c, BASTION_CORE_TILES * l.tile, p.blow, p.pulse);
  shell("port", () =>
    drawBastionHull(
      ctx,
      c,
      BASTION_SHELL_TILES.port * l.tile,
      time,
      ports(l, world, s, c, lit === "port"),
      p.pulse,
    ),
  );
  shell("lattice", () =>
    drawBastionCage(
      ctx,
      c,
      BASTION_SHELL_TILES.lattice * l.tile,
      time,
      nodes(l, world, s, c, lit === "lattice"),
      p.charge,
    ),
  );
  shell("ring", () => drawRingFront(ctx, l, c, guns, yaw, p.pulse));
  shell("plates", () =>
    drawBastionPlates(ctx, l, c, s, lit === "plates", world.cfg.bastionPullMilli, p.pulse),
  );
}

/** A shell growing back is drawn smaller, filling out to where it stands. */
function grown(ctx: CanvasRenderingContext2D, c: At, grow: number, draw: () => void): void {
  if (grow >= 1) {
    draw();
    return;
  }
  const k = 0.7 + 0.3 * grow;
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.scale(k, k);
  ctx.translate(-c.x, -c.y);
  draw();
  ctx.restore();
}

/** The step of `layer` still on the moon, or null once it is off or was never scripted. */
function stepOf(s: BastionState, layer: BastionLayer) {
  for (let j = s.cursor; j < s.steps.length; j++) {
    const step = s.steps[j];
    if (step?.layer === layer) return step;
  }
  return null;
}

function ports(l: Layout, world: World, s: BastionState, c: At, lit: boolean): PortMark[] {
  const offsets = stepOf(s, "port")?.offsets ?? [];
  const shown = showsBastionPort(l.role);
  const next = lit ? bastionNext(s) : -1;
  const out: PortMark[] = [];
  offsets.forEach((offset, i) => {
    const at = bastionPortAt(l, world.cfg, c, offset);
    if (lit && bastionGone(s, i)) out.push({ ...at, state: "blown" });
    else if (shown) out.push({ ...at, state: i === next ? "open" : "shut" });
  });
  return out;
}

function nodes(l: Layout, world: World, s: BastionState, c: At, lit: boolean): NodeMark[] {
  const offsets = stepOf(s, "lattice")?.offsets ?? [];
  const charging = bastionCharging(s) ? bastionNext(s) : -1;
  return offsets.map((offset, i) => {
    const at = bastionNodeAt(l, world.cfg, c, offset);
    const state = lit && bastionGone(s, i) ? "burst" : i === charging ? "charging" : "idle";
    return { ...at, state };
  });
}
