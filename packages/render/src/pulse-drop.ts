import {
  type PulseState,
  pulseLaneIndex,
  pulseNoteAt,
  pulseNoteTick,
  pulseVeiled,
} from "@neon-spore/sim";
import { halo } from "./glow.js";
import type { SurfaceY } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawPulseArrow } from "./pulse-arrow.js";
import type { PulseField } from "./pulse-lane.js";
import { pulseLaneColor, pulseLaneRim } from "./pulse-shape.js";
import type { ViewState } from "./renderer.js";

/**
 * An arrow nobody answered falls into the ship.
 *
 * The owner asked for it in one line — *let the arrows who were incorrect, not
 * in time, fall inside the ship like meteors do* — and it is the thing that
 * turns a drained bar into a picture. Until this, a dropped arrow simply
 * stopped being drawn and a number somewhere went down; now it goes past the
 * line at the speed it was already falling, buries its point in the hull and
 * burns out there. **The arrow itself**, keeping its lane's colour the whole
 * way: an impact in this game is drawn in the colour of the thing that made
 * it, never a generic damage red.
 *
 * **It costs the hull nothing, and that is the owner's call.** The shared
 * meter is still the accounting — empty it and the ship pays
 * (`sim/pulse-round.ts`) — so nothing here reaches the simulation, and the
 * round is exactly as hard as it was.
 *
 * **There is no state in this file and there must not be.** A drop is worked
 * out from the world alone: a note this seat has judged as a miss expired on a
 * tick the chart already fixes, so where it is now is a function of
 * `world.tick` and nothing else. That is what keeps two devices showing the
 * same fall — and it is also why a round that restarts cannot leave one
 * hanging in the air, which is the trap anything remembered across a frame
 * falls into here (`render-state.ts`).
 */

/** How long a drop is on the screen after it expires, in ticks. About a beat. */
const LIFE = 70;

/** How much of the fade is spent still falling, at most. The rest is burning
 * out in the skin: a drop that faded to nothing mid-air would read as an arrow
 * this seat got away with. */
const FADE_FROM = 0.55;

export function drawPulseDrops(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  boss: PulseState,
  field: PulseField,
  seat: 1 | 2,
  skinAt: SurfaceY,
): void {
  const cfg = view.world.cfg;
  const tick = view.world.tick;
  const judged = seat === 1 ? boss.judged1 : boss.judged2;
  const from = seat === 1 ? boss.from1 : boss.from2;
  const r = Math.min(field.lanes[0]?.w ?? 40, 72) * 0.42;
  // Backwards from the cursor: everything below it is resolved, and the notes
  // are in step order, so the walk stops at the first one too old to show.
  for (let i = from - 1; i >= 0; i--) {
    const note = boss.notes[i];
    if (note === undefined) continue;
    // The tick `pulseExpire` gives up on it: one past the end of its own
    // window. Called out of the chart's own two numbers rather than guessed —
    // a drop that started a tick early would start above the line.
    const gone = pulseNoteTick(cfg, boss.startTick, note) + cfg.pulseGoodTicks + 1;
    const age = tick - gone;
    if (age > LIFE) break;
    if (judged[i] !== 3 || age < 0) continue;

    const veiled = pulseVeiled(note, seat);
    const x = veiled
      ? (field.lanes[1]?.x ?? 0) / 2 + (field.lanes[2]?.x ?? 0) / 2
      : (field.lanes[pulseLaneIndex(note.lane)]?.x ?? 0);
    // The same fall it was already making, continued: `pulseNoteAt` keeps
    // counting past the line on purpose, so the arrow does not change speed at
    // the moment nobody pressed it.
    const at = pulseNoteAt(cfg, boss.startTick, note, tick);
    const y = field.topY + (field.lineY - field.topY) * at;
    const skin = skinAt(x);
    // **It goes *into* the ship rather than resting on it**, which is the
    // owner's own word for what should happen. The fall is never clamped: the
    // arrow keeps coming at the speed it always had, and the part of it below
    // the skin is simply not drawn — so what the eye sees is a body being
    // swallowed by the hull rather than one parked on the surface. Nothing
    // else in the game can do this: a rock is round and sits in the hole it
    // made (`rock-impact.ts`), and an arrow has a point.
    const struck = y + r >= skin;
    if (y - r > skin) continue;
    const life = age / LIFE;
    const fade = life < FADE_FROM ? 1 : Math.max(0, 1 - (life - FADE_FROM) / (1 - FADE_FROM));

    ctx.save();
    if (struck) {
      ctx.beginPath();
      ctx.rect(0, 0, l.width, skin);
      ctx.clip();
    }
    ctx.globalAlpha = fade;
    drawPulseArrow(ctx, {
      x,
      y,
      r,
      lane: note.lane,
      time: view.time,
      near: 1,
      // Whatever it was on the way down it is legible now: an arrow that hit
      // the ship has stopped being a question.
      veiled: false,
    });
    ctx.restore();
    if (struck) burn(ctx, x, skin, r, note.lane, fade);
  }
}

/**
 * Where it went in: the hull scorched in the arrow's own colour, and the light
 * of it going out.
 *
 * Two marks and neither of them is a ring. The hot one is the light the
 * impact throws, in the lane's rim colour, and under it a dark bloom sitting
 * *on* the skin that the hull's own sheen shows through — which is what makes
 * it read as the ship being marked rather than as a sticker on it. Both fade
 * with the arrow, because the owner asked for the fall and the damage, not for
 * a hull that collects a hundred permanent holes over a minute of music.
 */
function burn(
  ctx: CanvasRenderingContext2D,
  x: number,
  skin: number,
  r: number,
  lane: Parameters<typeof pulseLaneColor>[0],
  fade: number,
): void {
  const scorch = ctx.createRadialGradient(x, skin, 0, x, skin, r * 1.5);
  scorch.addColorStop(0, PALETTE.background);
  scorch.addColorStop(0.55, `${pulseLaneColor(lane)}55`);
  scorch.addColorStop(1, `${pulseLaneColor(lane)}00`);
  ctx.save();
  ctx.globalAlpha = 0.7 * fade;
  ctx.fillStyle = scorch;
  ctx.beginPath();
  ctx.ellipse(x, skin, r * 1.5, r * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  halo(ctx, x, skin, r * 2.2, pulseLaneRim(lane), 0.5 * fade);
}
