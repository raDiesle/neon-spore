import {
  type HiveState,
  hiveNext,
  hiveOpen,
  hiveSwelling,
  hiveTwins,
  hiveWrungAt,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import type { BoltStops } from "./bolt-stop.js";
import { drawHurt } from "./boss-hurt.js";
import type { HiveFx } from "./hive-fx.js";
import { hiveClenchRise, hivePinchPhase } from "./hive-hold.js";
import { hiveBox, hiveFade, hiveMassPath, hiveSite, hiveSwellPhase } from "./hive-shape.js";
import { drawBreach, drawLobe, drawScar, drawSwell } from "./hive-sites.js";
import { type HiveHang, hiveStopper } from "./hive-stop.js";
import { paintWax } from "./hive-wax.js";
import type { Layout } from "./layout.js";
import { showsHiveColor, showsHiveSwell } from "./view-role-clocks-b.js";

/**
 * **THE HIVE**: a waxen mass hung over the top of the field, down into its top rows,
 * nearly the width of it, its underside scalloped into a row of hanging
 * lobes with a site in the belly of each — shut, swelling, open, or
 * scarred over — and, on one screen, every open breach in the colour a
 * shot has to be (§11.14).
 *
 * Read off the world every frame and drawn in the order the eye reads it:
 * the mass, then every site in column order (`hive-sites.ts`). Its health is its underside:
 * a site opened is a breach, a breach sealed is a scar, and when every lobe
 * is scarred the mass closes in on its middle and fades over
 * `hiveOutBeats`. What outlives a frame — the clench of a wrong colour, the
 * jolt of a seal — is `effects.boss.hive` (`hive-fx.ts`).
 *
 * **Each seat is shown the one fact it cannot act on.** On the pilot's
 * screen an open breach is in its colour and nothing swells; on the
 * navigator's every open breach is the same wax-grey and the next site to
 * open bulges through the beats before it does — both of them, once the
 * openings come in pairs (`view-role-clocks-b.ts`).
 *
 * **The two states each seat answers are drawn on both**, and they have to
 * be: the pair's whole conversation under this boss is one of them saying
 * what the other cannot see, and neither *a clench* nor *the next one is
 * wrung* would be worth saying if the seat that has to act on it could not
 * see what it was acting on. So the clench draws the mass up on every screen
 * (`hive-hold.ts`), and a wrung breach wears its collar on every screen —
 * what stays split is only which thumb is offered a ring (`hive-grip.ts`).
 */
export function drawHive(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: HiveState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: HiveFx,
  stops?: BoltStops,
): void {
  const cfg = world.cfg;
  const fade = hiveFade(s, cfg, beat, beatPhase);
  if (fade <= 0) return;
  const open = fade * (1 - fx.clench);
  const coloured = showsHiveColor(l.role);
  const swelling = showsHiveSwell(l.role) && hiveSwelling(s, cfg, beat);
  const swell = swelling ? hiveSwellPhase(s, cfg, beat, beatPhase) : 0;
  const next = hiveNext(s);
  const twin = hiveTwins(s, cfg) && next >= 0 && next + 1 < s.cols.length ? next + 1 : -1;
  const pinch = hivePinchPhase(s, cfg, beat, beatPhase);
  const rise = hiveClenchRise(s, cfg, beat, beatPhase);

  const shift = { x: fx.hurt.shakeX(time, l.tile), y: -(fx.jolt + rise) * l.tile };
  const hangs: HiveHang[] = [];
  ctx.save();
  ctx.translate(shift.x, shift.y);
  drawMass(ctx, l, cfg, s, open, time, fade, fx.hurt.value);
  for (let i = 0; i < s.cols.length; i++) {
    const c = hiveSite(l, s, i);
    if (s.sealed[i]) drawScar(ctx, l, c, open, fade);
    else if (hiveOpen(s, i)) {
      const wrung = hiveWrungAt(s, i);
      const color = wrung || !coloured ? null : (s.colors[i] ?? "red");
      drawBreach(ctx, l, c, color, open, time, fade, wrung);
    } else if (swelling && (i === next || i === twin))
      hangs[i] = drawSwell(ctx, l, c, swell, open, time, fade, i === s.pinch ? pinch : -1);
    else drawLobe(ctx, l, c, 0, open, fade);
  }
  ctx.restore();
  stops?.aim(hiveStopper(l, world, s, shift, open, hangs));
}

/** The mass: wax, pressed with comb, closing in on its middle on its way out (`hive-wax.ts`). */
function drawMass(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: HiveState,
  open: number,
  time: number,
  fade: number,
  hurt: number,
): void {
  const box = hiveBox(l, cfg);
  const mid = (box.left + box.right) * 0.5;
  const hw = (box.right - box.left) * 0.5 * open;
  const wax = { ...box, left: mid - hw, right: mid + hw, tile: l.tile };
  const path = hiveMassPath(l, cfg, s, open, time);
  paintWax(ctx, path, wax, fade);
  drawHurt(ctx, path, hurt * fade);
}
