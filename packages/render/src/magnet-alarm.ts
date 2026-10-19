import { showsRadar } from "@neon-spore/content";
import type { World } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { ALARM_HEIGHT, alarmRows } from "./ship-top-rows.js";

/**
 * THE MAGNET's call, and the second alarm in this game that reads differently
 * depending on who is looking.
 *
 * It is `torch-alarm.ts`'s arrangement with the seats the other way up. There
 * the pilot has the strip and the navigator has the shield, so the one who can
 * see has to name a column for the one who can act. Here the pilot has the
 * strip **and** the hand that aims the shot, and what the navigator is holding
 * is the pair of triggers — so the sentence is not *where* but *which side*,
 * and the pilot is the one who has to say it.
 *
 * **Which is why the line is on the pilot's screen alone.** A magnet is on
 * player 1's radar (`radar: "p1"` in `creatures-held.ts`), so player 2 is not
 * warned about one at all until it is on the field. Drawing the same words on
 * both would hand the navigator a column they cannot use and take the sentence
 * out of the pilot's mouth, which is the whole of the creature.
 *
 * Derived here, not stored: the simulation gains no notion of an "alarm", only
 * a queue and a field render already reads.
 */

/** The column of the magnet the pilot has to speak about, or null: the one on
 * the field if there is one, otherwise the next one the strip is carrying. */
export function magnetCall(l: Layout, world: World): number | null {
  if (!showsRadar(l.role, "magnet")) return null;
  const here = world.creatures.find((c) => c.kind === "magnet");
  if (here) return here.col;
  const lead = world.cfg.radarLead;
  for (let i = world.spawned; i < world.queue.length; i++) {
    const q = world.queue[i];
    if (q?.kind !== "magnet") continue;
    const inBeats = q.beat - (world.waveBeat - 1);
    if (inBeats < 0 || inBeats > lead) continue;
    return q.col;
  }
  return null;
}

/** The lowest this band reaches, or null on a screen not being told to aim —
 * the navigator's, or a wave with no magnet due (`torch-alarm.ts`). Where the
 * band goes, under TORCH's own, is `ship-top-rows.ts`. */
export function magnetAlarmFoot(l: Layout, world: World): number | null {
  if (magnetCall(l, world) === null) return null;
  return alarmRows(l, world).magnet + ALARM_HEIGHT;
}

export function drawMagnetAlarm(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  time: number,
): void {
  const col = magnetCall(l, world);
  if (col === null) return;

  const top = alarmRows(l, world).magnet;
  const pulse = 0.55 + 0.45 * Math.sin(time * 7);
  const left = l.gridLeft + col * l.tile;
  const right = left + l.tile;

  ctx.save();
  // A band under the column it is standing in, the torch's picture in the
  // pod's amber rather than in rock grey: this is a thing the pair's own hand
  // is about to be put on, and amber is what the hand is already drawn in
  // (`grip.ts`, `lock-mark.ts`).
  const band = ctx.createLinearGradient(left, 0, right, 0);
  band.addColorStop(0, "rgba(255,194,74,0)");
  band.addColorStop(0.5, `rgba(255,194,74,${0.3 * pulse})`);
  band.addColorStop(1, "rgba(255,194,74,0)");
  ctx.fillStyle = band;
  ctx.fillRect(0, top, l.width, ALARM_HEIGHT);

  // No words: `TARGET ENEMY · COLUMN n` was taken off at the owner's asking,
  // 19 October 2026, with TORCH's line. The band alone says which column.
  ctx.restore();
}
