import { circleSubpath } from "@neon-spore/content";
import { type VaneState, vaneColor, vaneOpen, vaneOpeningNow, type World } from "@neon-spore/sim";
import type { BossHurt } from "./boss-hurt.js";
import { strokeGlow } from "./glow.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawBearing } from "./vane-bearing.js";
import { drawVaneGrips, vaneHubAt, vaneTipPoint } from "./vane-grip.js";
import { drawArm } from "./vane-spar.js";

/**
 * THE VANE, drawn: an arm sweeping the top of the field, and the bearing it
 * turns on.
 *
 * **A mechanism, and never a body.** That was one open stroke of even width
 * until 20 September 2026, on the reading that a shape enclosing an area starts
 * to look like something holding a weapon; what it actually looked like was a
 * line with a circle on the end. It is a made thing now, cut from one metal and
 * lit by one ramp: a mount across three columns, a hub with the pins in a bolt
 * circle round it (`vane-bearing.ts`), and a tapered spar with a lattice
 * through it and a fork on the end (`vane-spar.ts`). None of it is a creature —
 * there is no skin, no socket and no slime on the whole boss — and a vane is
 * still the thing that turns when something pushes it.
 *
 * The pivot is not decoration — it is the only part of the boss that can be
 * reached, and it hangs above row 0 where nothing else in the game is, so a
 * shot answers it by leaving the field entirely (`vane.ts`). The casing around
 * it wears the pins, and a pin gone is a gap that never fills: the arm reaches
 * a phase further out for it, so the silhouette says how far in the pair are by
 * getting *longer*, which is the same bargain the Bulb Queen makes by sinking.
 *
 * Nothing here is held between frames. Everything it draws comes off the world
 * and the beat, so there is no way for a restart to show this fight the last
 * one's arm. The one thing handed in is the blow of a knocked-out pin, which
 * shakes the whole mechanism and reddens the hub and the spar
 * (`boss-blows.ts`).
 */

/** Beats a throw's streak takes to go out. Short — it is a flick, not a trail. */
const THROW_FADE = 1.4;

export function drawVane(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  b: VaneState,
  beatPhase: number,
  time: number,
  hurt: BossHurt,
): void {
  ctx.save();
  ctx.translate(hurt.shakeX(time, l.tile), 0);
  drawMechanism(ctx, l, world, b, beatPhase, time, hurt.value);
  ctx.restore();
}

function drawMechanism(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  b: VaneState,
  beatPhase: number,
  time: number,
  hurt: number,
): void {
  const cfg = world.cfg;
  const { x: px, y: py, r: hub } = vaneHubAt(l, cfg);

  // Where the arm stands between two beats — `vane-grip.ts`'s answer, because
  // the pilot's thumb is answered at exactly this point and a picture that
  // worked it out a second time is a control answered where it is not drawn.
  // Pinned, the arm has stopped and the fold line holds the column the thumb
  // landed it in; sweeping, it is read a beat ahead off the cycle so it
  // travels along the grid the pair is naming, the same number on both screens.
  const tip = vaneTipPoint(l, cfg, b, world.beat, world.waveBeat, beatPhase);
  const tx = tip.x;
  const ty = tip.y;
  // Lag against the direction of travel, so a held arm hangs straight and a
  // sweeping one trails. `lead` is columns per beat, which is exactly how hard
  // it is being swung.
  const whip = tip.lead * l.tile * 0.18 + Math.sin(time * 1.7) * l.tile * 0.03;

  // The colour is the cycle's in every phase (`docs/spec/bosses.md` §11.5): the
  // housing has worn it since the arm stopped, so `vaneOpeningNow` names it even
  // while the cycle's own openings have stopped, from VEER on.
  const opening = vaneOpeningNow(world.waveBeat);
  const open = vaneOpen(world);
  const hex = vaneColor(opening) === "red" ? PALETTE.red : PALETTE.cyan;
  const rim = hex === PALETTE.red ? PALETTE.redRim : PALETTE.cyanRim;

  drawBearing(ctx, l, world, b, px, py, hub, open, hex, rim, hurt);
  drawArm(ctx, l, px, py, hub, tx, ty, whip, hurt);
  // The two hands, under the tip so the ring circles it rather than covering
  // it, and over the spar so a thumb is never behind the thing it is on
  // (`vane-grip.ts`).
  drawVaneGrips(ctx, l, cfg, b, world.beat, tip, time);

  // The tip, which is the fold line and the only column anybody has to watch.
  // The last thing filled in the whole picture, and `vane-pin-frame.test.ts`
  // reads the drawn column back off it.
  const dot = new Path2D(circleSubpath(tx, ty, l.tile * 0.11));
  ctx.save();
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill(dot);
  ctx.restore();
  strokeGlow(ctx, dot, PALETTE.rock, STROKE.inner, 0.9);

  drawThrow(ctx, l, b, world.beat, beatPhase, tx, ty);
}

/**
 * The flick the arm leaves when it throws an arrival: a line from the tip to
 * the column the body came down in, going out over about a beat. It is the one
 * moment the fold is a picture rather than an arithmetic, so it is drawn even
 * though the body it threw is already standing in its new column.
 */
function drawThrow(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  b: VaneState,
  beat: number,
  beatPhase: number,
  tx: number,
  ty: number,
): void {
  if (b.throwBeat === -1 || b.throwCol === -1) return;
  const since = beat - b.throwBeat + beatPhase;
  if (since < 0 || since > THROW_FADE) return;
  const fade = 1 - since / THROW_FADE;
  const cx = tileCX(l, b.throwCol);
  const cy = tileCY(l, 0);
  const streak = new Path2D(
    `M ${tx.toFixed(2)} ${ty.toFixed(2)} L ${cx.toFixed(2)} ${cy.toFixed(2)}`,
  );
  strokeGlow(ctx, streak, PALETTE.rock, STROKE.inner, 0.9, fade);
}
