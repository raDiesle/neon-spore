import { type InstarState, instarStep, type World } from "@neon-spore/sim";
import { instarFlight } from "./instar-flight.js";
import { drawFront } from "./instar-front.js";
import type { InstarFx } from "./instar-fx.js";
import { drawInstarMarks } from "./instar-marks.js";
import { instarAt, instarHeadAt } from "./instar-place.js";
import type { Look } from "./instar-plate.js";
import { drawProfile } from "./instar-profile.js";
import { instarFade, instarMorphAt, instarThreat } from "./instar-shape.js";
import { instarBody } from "./instar-sway.js";
import type { Layout } from "./layout.js";

/**
 * **THE INSTAR**: a living dragon of a ship, the size of the field (§11.32).
 * The owner, 25 September 2026: *change boss so it looks more like a dragon
 * alien space ship living*.
 *
 * It comes in small, far off, and grows at the screen as it flies in
 * (`instar-flight.ts`); it stands face-on over the ship with its jaws wide
 * and the fire turning in the mouth (`instar-front.ts`, `instar-head.ts`);
 * it flies off and passes and comes back side-on, the nests on its back
 * (`instar-profile.ts`, `instar-eggs.ts`); it crosses out and in from the
 * other side and swings its tail at the ship (`instar-tail.ts`). Between the
 * two views the body turns, which is a crossfade by the figure's `side`.
 *
 * Read off the world every frame; what outlives a frame — the jolt of a
 * landing, the flinch at a wrong thumb, the strike of a part not stopped —
 * is `effects.boss.instar` (`instar-fx.ts`). Its health is its script: every
 * pose is one the pair has to undo, and after the last it sags, shuts its
 * eyes and fades over `instarOutBeats`.
 *
 * **The flight is a transform, and it is over before the marks are.** The
 * marks are drawn at the script's places outside it, and they only grow in
 * over the last of the morph, after the flight ends (`INSTAR_FLIGHT_ENDS`),
 * so the thumb never meets a mark the body is somewhere else than.
 *
 * **Both screens see the same body.** This is the one boss whose split is
 * not in the eyes but in the hands: what a seat is told is which of the
 * marks on the body are its own (`view-role-clocks-b.ts`), so no predicate
 * reaches into the body itself.
 */
export function drawInstar(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: InstarState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: InstarFx,
): void {
  const cfg = world.cfg;
  const fade = instarFade(s, cfg, beat, beatPhase);
  if (fade <= 0) return;
  const { f, sway } = instarBody(s, cfg, beat, beatPhase);
  const morph = instarMorphAt(s, beat, beatPhase);
  const threat = instarThreat(s, beat, beatPhase);
  const { head, r } = instarHeadAt(l, f);
  const breath = instarStep(s)?.pose === "breath";
  const fire =
    f.flame *
    (s.phase === "act" && breath
      ? 0.3 + 0.7 * threat
      : s.phase === "morph" && breath
        ? 0.3 * morph
        : 0);

  ctx.save();
  const shake = fx.flinch * l.tile * 0.25 * Math.sin(time * 40) + fx.hurt.shakeX(time, l.tile);
  ctx.translate(shake, -fx.jolt * l.tile);
  const flight = instarFlight(s, beat, beatPhase);
  if (flight.scale !== 1 || flight.dxMilli !== 0 || flight.dyMilli !== 0) {
    const c = instarAt(l, 500, 380);
    ctx.translate(
      c.x + (flight.dxMilli * l.gridWidth) / 1000,
      c.y + (flight.dyMilli * l.gridHeight) / 1000,
    );
    ctx.scale(flight.scale, flight.scale);
    ctx.translate(-c.x, -c.y);
  }
  const hurt = fx.hurt.value;
  const look: Look = {
    f,
    head,
    r,
    time,
    fade,
    hurt,
    threat,
    fire,
    harden: fx.strike.harden,
    shoveUp: fx.shove.up,
    shoveDown: fx.shove.down,
  };
  if (f.side < 0.99) drawFront(ctx, l, { ...look, fade: fade * (1 - f.side) });
  if (f.side > 0.01) drawProfile(ctx, l, { ...look, fade: fade * f.side });
  ctx.restore();
  fx.place(l, s, sway, threat, head, r);
  drawInstarMarks(ctx, l, s, cfg, beat, beatPhase, time, morph, l.role, fx.verdicts);
}
