import {
  type TrapezeState,
  type TrapezeStep,
  trapezeCaller,
  trapezeLitStep,
  trapezeLocked,
  trapezeOpenZone,
  trapezeSwiping,
  type World,
} from "@neon-spore/sim";
import type { BoltStops } from "./bolt-stop.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawTrapezeAlien } from "./trapeze-alien.js";
import { drawTrapezeArc, drawTrapezeGong } from "./trapeze-arc.js";
import type { TrapezeFx } from "./trapeze-fx.js";
import { trapezeAlienCircle } from "./trapeze-grip.js";
import { drawTrapezeZone, trapezeZone } from "./trapeze-marks.js";
import {
  drawTrapezeFlash,
  drawTrapezeGongRing,
  drawTrapezeLockRing,
  drawTrapezeWord,
} from "./trapeze-receipts.js";
import {
  trapezeAnchor,
  trapezeDeg,
  trapezeGongPx,
  trapezeGongR,
  trapezeOnArc,
  trapezeSpeed,
} from "./trapeze-shape.js";
import { trapezeStopper } from "./trapeze-stop.js";
import { drawTrapezeMarkFeedback } from "./trapeze-verdicts.js";
import { showsTrapezeHand } from "./view-role-clocks-c.js";

/** How far above its place the swing starts as it comes down, in tiles. */
const ARRIVE = 6;
/** How far down the field the ropes start, and how far they take to fade in, in tiles. */
const ROPE_CLEAR = 0.6;
const ROPE_FADE = 2.5;
/** How far behind the near rope the far one hangs, in tiles. */
const FAR_ROPE = 0.12;
/** How far the head lags the swing, in degrees at its fastest. */
const HEAD_LAG = 10;

/**
 * **THE TRAPEZE**: an alien on a swing hung from long ropes over the middle,
 * pushed higher by the pair until it kicks the gong (§11.56,
 * `bosses-choreographed.md` §39, the owner's rework of 7 October 2026).
 *
 * **Both screens are drawn the same swing**, because the push is timed off
 * it and either seat may be the one called; what differs is how loud a zone
 * is — full for the seat that pushes there, faint for its partner
 * (`showsTrapezeHand`).
 *
 * From the back: the zones in a swipe level (`trapeze-marks.ts`), the arc
 * the seat runs on with how high it goes now and the gong it has to reach
 * (`trapeze-arc.ts`), the ropes seen from the side, and the alien on its
 * seat, pumping (`trapeze-alien.ts`). The swing's place is the simulation's
 * own every tick (`trapeze-shape.ts`); nothing is eased but the alien turning
 * round. What outlives a frame is `fx` (`trapeze-fx.ts`).
 */
export function drawTrapeze(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: TrapezeState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: TrapezeFx,
  stops?: BoltStops,
): void {
  const cfg = world.cfg;
  const deg = trapezeDeg(cfg, s);
  const speed = trapezeSpeed(cfg, s);
  const since = beat - s.phaseBeat + beatPhase;
  const arrive = s.phase === "enter" ? Math.min(1, since / Math.max(1, cfg.trapezeEnterBeats)) : 1;
  const gone = s.phase === "spent" ? Math.min(1, since / Math.max(1, cfg.trapezeSpentBeats)) : 0;
  const off = { x: fx.hurt.shakeX(time, l.tile), y: -(1 - arrive) * ARRIVE * l.tile };
  stops?.aim(trapezeStopper(l, world, s, off));

  ctx.save();
  ctx.globalAlpha = 1 - gone;
  if (trapezeSwiping(s)) drawZones(ctx, l, world, s, fx, beatPhase);
  const step = trapezeLitStep(s) ?? s.steps[s.cursor] ?? null;
  drawTrapezeArc(ctx, l, cfg, s, step, trapezeLitStep(s) !== null);
  if (step !== null) drawTrapezeGong(ctx, l, cfg, step, s, trapezeLitStep(s) !== null);
  const rung: TrapezeStep | undefined = s.steps[fx.ringStep];
  if (rung !== undefined && fx.ring > 0 && rung !== step)
    drawTrapezeGong(ctx, l, cfg, rung, s, false, fx.ring, time);
  if (rung !== undefined)
    drawTrapezeGongRing(ctx, trapezeGongPx(l, cfg, rung), trapezeGongR(l), fx.ring, s.gongs);

  ctx.translate(off.x, off.y);
  drawSwing(ctx, l, world, deg);
  fx.face = step?.gongSide ?? fx.face;
  const body = drawTrapezeAlien(
    ctx,
    l.tile,
    {
      at: trapezeOnArc(l, cfg, deg),
      deg,
      facing: fx.facing,
      forward: Math.sign(fx.facing) * speed,
      kick: fx.kick,
      lag: (-HEAD_LAG * speed * Math.PI) / 180,
    },
    time,
    fx.hurt.value,
  );
  drawTrapezeFlash(ctx, body, fx.flash);
  if (trapezeLocked(s)) drawTrapezeLockRing(ctx, trapezeAlienCircle(l, cfg, s), fx.snap, beatPhase);
  ctx.translate(-off.x, -off.y);
  drawTrapezeMarkFeedback(ctx, l, cfg, s, time, 1 - gone, fx.verdicts);
  drawTrapezeWord(ctx, l, cfg, fx.word);
  ctx.restore();
}

/** Both zones: lit while the swing comes back over one, badged with the seat that pushes there. */
function drawZones(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: TrapezeState,
  fx: TrapezeFx,
  beatPhase: number,
): void {
  const open = trapezeOpenZone(world.cfg, s);
  for (const side of [-1, 1] as const) {
    const seat = trapezeCaller(s, side) === 0 ? 1 : 2;
    const pulse = Math.max(
      fx.push[side < 0 ? 0 : 1],
      0.5 + 0.5 * Math.cos(beatPhase * Math.PI * 2),
    );
    const z = trapezeZone(l, world.cfg, side);
    drawTrapezeZone(ctx, l, z, side, seat, open === side, showsTrapezeHand(l.role, seat), pulse);
  }
}

/**
 * The ropes, seen from the side: the near one to the seat and the far one a
 * shade darker just behind it. They hang from above the screen, so they fade
 * in down the top of the field from nothing: no boss touches the top of the
 * screen, where the phone's bar and the seat switcher stand
 * (`test/boss-top.test.ts`). The seat is the alien's to draw, in its frame.
 */
function drawSwing(ctx: CanvasRenderingContext2D, l: Layout, world: World, deg: number): void {
  const a = trapezeAnchor(l, world.cfg);
  const seat = trapezeOnArc(l, world.cfg, deg);
  const top = l.gridTop + ROPE_CLEAR * l.tile;
  const fade = (hex: string) => {
    const g = ctx.createLinearGradient(0, top, 0, top + ROPE_FADE * l.tile);
    g.addColorStop(0, rgba(hex, 0));
    g.addColorStop(1, rgba(hex, 1));
    return g;
  };
  ctx.save();
  const below = new Path2D();
  below.rect(l.gridLeft - l.tile * 4, top, l.cols * l.tile + l.tile * 8, l.hullY - top);
  ctx.clip(below);
  ctx.lineCap = "round";
  const back = FAR_ROPE * l.tile;
  const far = new Path2D();
  far.moveTo(a.x + back, a.y);
  far.lineTo(
    seat.x + back * Math.cos((deg * Math.PI) / 180),
    seat.y - back * Math.sin((deg * Math.PI) / 180),
  );
  ctx.lineWidth = STROKE.outline * 1.4;
  ctx.strokeStyle = fade(PALETTE.trapezeRopeDark);
  ctx.stroke(far);
  const near = new Path2D();
  near.moveTo(a.x, a.y);
  near.lineTo(seat.x, seat.y);
  ctx.lineWidth = STROKE.outline * 1.8;
  ctx.strokeStyle = fade(PALETTE.trapezeRopeDark);
  ctx.stroke(near);
  ctx.lineWidth = STROKE.inner * 1.4;
  ctx.strokeStyle = fade(PALETTE.trapezeRope);
  ctx.stroke(near);
  ctx.restore();
}
