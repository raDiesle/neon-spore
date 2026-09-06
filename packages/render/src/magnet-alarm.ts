import { showsRadar } from "@neon-spore/content";
import type { World } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { SIREN_PAD } from "./siren-seats.js";

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
 * player 1's radar (`radar: "p1"` in `creatures-table.ts`), so player 2 is not
 * warned about one at all until it is on the field. Drawing the same words on
 * both would hand the navigator a column they cannot use and take the sentence
 * out of the pilot's mouth, which is the whole of the creature.
 *
 * Derived here, not stored: the simulation gains no notion of an "alarm", only
 * a queue and a field render already reads.
 */

/** Clear of the torch alarm's own band (`torch-alarm.ts`, y = 56) — the two
 * never share a wave today and a director could still author one that does. */
const ALARM_TOP = 70;
const ALARM_HEIGHT = 12;

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

export function drawMagnetAlarm(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  time: number,
): void {
  const col = magnetCall(l, world);
  if (col === null) return;

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
  ctx.fillRect(0, ALARM_TOP, l.width, ALARM_HEIGHT);

  // Right-aligned under the siren, where the torch's line already goes: the
  // two are one sentence in the same voice — *this is the call, and here is
  // what to say* — and a second place for it would be a second thing to learn.
  ctx.font = '600 10px "Courier New",monospace';
  ctx.textAlign = "right";
  ctx.fillStyle = PALETTE.pod;
  ctx.globalAlpha = 0.6 + 0.4 * pulse;
  // 1-based, the way a column is said out loud.
  ctx.fillText(
    `TARGET ENEMY · COLUMN ${col + 1}`,
    l.width - SIREN_PAD,
    ALARM_TOP + ALARM_HEIGHT - 2,
  );
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";
  ctx.restore();
}
