import type { ControlSet } from "@neon-spore/content";
import { batonBoss, batonLocked, type World } from "@neon-spore/sim";
import { seamTop } from "./band-seam.js";
import { bandLobes, type Layout, showsCannon, showsShield } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * The band, put out — the whole of it, or one seat's half.
 *
 * Cut out of `band.ts` when THE BATON's lockout took that file over its
 * 250-line limit, and along the seam that was there already: next door is
 * *what is on the panel and where*, and this is *what is drawn over it when a
 * boss has taken it away*. Two bosses do that now, differently. THE MIRROR
 * holds every control on both screens while it shows its pattern; THE BATON
 * holds one seat for one beat, the seat that just acted, so the pair can only
 * keep the bead moving by taking turns (`sim/batonLocks`).
 *
 * Both are scrims over the finished drawing rather than an alpha set before
 * it: every button in here reaches for `halo` or `reticle`, and both of those
 * set `globalAlpha` outright. Canvas alpha does not multiply, so anything set
 * up front is simply overwritten by the first child that has an opinion —
 * which is why the strips dimmed and the buttons did not.
 *
 * **A dead button is still drawn.** A control that quietly does nothing is
 * indistinguishable from a control that is broken, and the pair has to be
 * able to see which of the two they are looking at — so neither scrim hides
 * a button, it dims it and says why (`malfunction-look.ts` makes the same
 * argument for a fault).
 */
export function drawLock(ctx: CanvasRenderingContext2D, l: Layout): void {
  const y = l.bandTop + l.bandHeight / 2;
  ctx.save();
  ctx.fillStyle = "rgba(7,4,15,.78)";
  ctx.fillRect(0, seamTop(l), l.width, l.bandTop + l.bandHeight - seamTop(l));
  ctx.fillStyle = "rgba(7,4,15,.72)";
  ctx.fillRect(0, y - 15, l.width, 30);
  ctx.strokeStyle = PALETTE.red;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, y - 15);
  ctx.lineTo(l.width, y - 15);
  ctx.moveTo(0, y + 15);
  ctx.lineTo(l.width, y + 15);
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.red;
  ctx.font = '700 12px "Courier New",monospace';
  ctx.fillText("LOCKED — WATCH", l.width / 2, y + 4);
  ctx.restore();
  ctx.textAlign = "left";
}

/**
 * THE BATON's grey panel: the seat that just acted, greyed for a beat.
 *
 * This is the whole of the fight's presentation and it is deliberately
 * nothing new — THE WARDEN's clamp and THE MALFUNCTION's fault already made
 * the case that a control taken away is drawn dead rather than removed
 * (`docs/spec/bosses-choreographed.md` §10). What is new is that it is a
 * *seat* and a *beat* rather than a control and a wave: a pair alternating
 * at tempo watches their own band switch off and on like a metronome, and
 * that picture is the rhythm they are being asked to keep.
 *
 * Grey and not red, and no rule across the plate: this is not THE MIRROR's
 * "watch", it is *their turn*, and it clears on the next beat by itself. On a
 * phone the seat is the whole band, so the whole band greys. On the test
 * screen, which carries both seats, only the locked seat's strip and lobes
 * do — a scrim over the whole plate there would say both hands were dead.
 */
export function drawBatonGrey(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  set: ControlSet,
): void {
  const b = batonBoss(world);
  if (b === null) return;
  const solo = l.role !== "test";
  for (const seat of [1, 2] as const) {
    if (seat === 1 ? !showsCannon(l.role) : !showsShield(l.role)) continue;
    if (!batonLocked(b, seat, world.beat)) continue;
    ctx.save();
    ctx.fillStyle = "rgba(60,63,73,.62)";
    if (solo) {
      ctx.fillRect(0, seamTop(l), l.width, l.bandTop + l.bandHeight - seamTop(l));
    } else {
      const strip = seat === 1 ? l.cannonStrip : l.shieldStrip;
      ctx.fillRect(0, strip.y - strip.height * 0.85, l.width, strip.height * 1.7);
      for (const lobe of bandLobes(l, set, seat)) {
        const { x, y, r } = lobe.circle;
        ctx.beginPath();
        ctx.arc(x, y, r * 1.25, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
}
