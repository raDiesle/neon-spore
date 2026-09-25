import {
  type CurtainState,
  curtainBody,
  curtainCoreBare,
  gripsCreature,
  type World,
} from "@neon-spore/sim";
import { curtainHemLift, curtainSheetMidX, drawCurtainHem } from "./curtain-grip.js";
import { drawCurtainCore, drawCurtainJam, drawCurtainSheet } from "./curtain-sheet.js";
import { drawnCol } from "./depth.js";
import { drawHandAt } from "./grip.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import type { SeatNames } from "./seat-name.js";
import { showsCurtainShadow, showsCurtainSoft } from "./view-role-clocks.js";

/**
 * THE CURTAIN, drawn: a translucent violet-grey membrane hung across seven
 * columns at `curtainRow`, weighted lobes along its hem, and behind it the
 * core — seen through the fabric as a shadow, or naked once the fabric has
 * been shoved off it or torn away (`sim/curtain.ts`).
 *
 * **Everything here is read off the world every frame.** Where the fabric
 * hangs is its body's column, carried across a shove by `drawnCol` the way
 * every creature's glide is; which lobes stand and which are soft are the
 * state's; where the core is and whether it can be seen are the state's and
 * `curtainCoreBare`. The things that outlive a frame — the sheet falling
 * off the rail, and the blow of a core hit, handed in as `hurt` — are
 * `curtain-fx.ts`'s.
 *
 * **The order is the occlusion.** The core is drawn first and the fabric
 * over it, so a covered core is a colour *through* the membrane and a bare
 * one is a body in plain sight. There is no z-order in this renderer and
 * this does not add one: the fabric is translucent, and what it covers is
 * dimmed by being drawn under it, which is the whole of what "occluded"
 * means on this field.
 *
 * **Two seats, two facts.** The pilot is shown which lobes are soft — lit,
 * the way a torch is lit — and, while the core is covered, nothing of it;
 * the navigator is shown the core's shadow and its colour through the
 * fabric, and every lobe the same grey (`showsCurtainSoft`,
 * `showsCurtainShadow`). Both see the fabric move under both hands.
 *
 * **The hand ring is drawn here, over the sheet.** The field's grip pass
 * skips a body whose hand means "pull" (`grip.ts`), for THE CAIRN's reason:
 * a ring behind a sheet seven columns wide would be a ring nobody saw. It
 * closes on the middle of whatever part of the fabric is on the field, so a
 * fabric shoved mostly off the wall still has a place to hold it by.
 *
 * **The jammed state draws two more things, and only it.** A hit holds the
 * rail for `curtainPinBeats`, and the bar laid along the rail runs down with
 * that count: it is the whole of the clock the pair work against. What gives
 * instead of the rail is the hem, and its ring — the one handle this boss has
 * — hangs in the middle of the sheet rather than over the core, because the
 * core is the navigator's to see and the pilot's own screen must not say where
 * it is (`curtain-grip.ts`).
 */
export function drawCurtain(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  c: CurtainState,
  beat: number,
  beatPhase: number,
  time: number,
  /** The two people's names, for the word under the ring (`grip.ts`). */
  names?: SeatNames,
  /** How hard the blow of a core hit still shows (`curtain-fx.ts`). */
  hurt = 0,
): void {
  if (l.tile <= 0) return;
  const { cfg } = world;
  const body = curtainBody(world, c);
  const bare = curtainCoreBare(world, c);
  const cy = tileCY(l, cfg.curtainRow);

  // The core first, so the fabric is over it: plain on both screens once it
  // is bare, a shadow on the navigator's while it is covered, and nothing on
  // the pilot's — his eyes are the hem's.
  if (bare || showsCurtainShadow(l.role)) {
    const out = c.phase === "out" ? (beat - c.phaseBeat + beatPhase) / cfg.curtainOutBeats : 0;
    const naked = c.phase === "torn";
    const x = tileCX(l, c.coreCol);
    drawCurtainCore(ctx, l, x, cy, c.coreColor, bare, naked, out, time, hurt);
  }

  if (body === undefined) return; // Torn off the rail: the core hangs alone.
  const at = drawnCol(body, beatPhase);
  const x0 = tileCX(l, at) - l.tile * 0.5;
  // The hem trails the rail through a shove: what a sheet does when it is
  // carried by its top edge.
  const lag = ((body.fromCol ?? body.col) - at) * l.tile * 0.35;
  const soft = showsCurtainSoft(l.role) ? c.soft : [];
  const lift = curtainHemLift(l, cfg, c);
  drawCurtainSheet(ctx, l, x0, cy, c.lobes, soft, lag, lift, time, hurt);

  // The jam, over the sheet's own rail, and the hem's ring over the sheet: both
  // are the `pinned` state and nothing else, and both draw on both screens —
  // the bar is the clock they are working against and the ring is the gauge she
  // fires on (`curtain-grip.ts`).
  if (c.phase === "pinned") {
    const gone = (beat - c.phaseBeat + beatPhase) / Math.max(1, cfg.curtainPinBeats);
    drawCurtainJam(ctx, l, x0, cy, Math.max(0, Math.min(1, 1 - gone)));
  }
  drawCurtainHem(ctx, l, cfg, c, body, beatPhase, time);

  const p1 = gripsCreature(world, 1, body.id);
  const p2 = gripsCreature(world, 2, body.id);
  if (!p1 && !p2) return;
  // The ring closes on the part of the sheet that is on the field.
  const mid = curtainSheetMidX(l, cfg, at);
  if (mid === null) return;
  drawHandAt(ctx, l, world, body, "pull", p1, p2, mid, cy, l.tile * 0.8, time, names);
}
