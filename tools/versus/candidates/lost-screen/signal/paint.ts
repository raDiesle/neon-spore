import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import { signedHash } from "../../../../../packages/render/src/hash.js";
import type { LostPaint } from "../../../../../packages/render/src/lost-look.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { drop } from "../../../../../packages/render/src/text-drop.js";

/**
 * The picture itself fails: the whole screen breaks into torn horizontal bands
 * that slip sideways against each other, and one band is missing over the
 * column the ship was hit in, so the field shows through there at full
 * strength.
 *
 * **What it argues** is that the loudest thing available is the medium rather
 * than the message. Both other answers in this slot put something *on* the
 * screen — a shaft of dark, a pair of plates — and this one claims the screen
 * is what broke. It is also the only one whose picture keeps moving: the bands
 * re-tear on a clock of their own, so the screen never settles into a card.
 */

/** How many bands the picture tears into. */
const BANDS = 14;

/** How far a band slips sideways, as a share of the screen. */
const SLIP = 0.05;

/** Times a second the tear is thrown again. Fast enough to read as a fault,
 * slow enough that the words under it stay readable. */
const TEAR_HZ = 6;

const DARK = "rgba(6,5,12,.9)";

export function veil(ctx: CanvasRenderingContext2D, p: LostPaint): void {
  const tear = Math.floor(p.age * TEAR_HZ);
  const h = p.l.height / BANDS;
  // Which band the breach shows through — the one the hull's own line is in,
  // so what is uncovered is the place it went in rather than a strip of sky.
  const open = p.breachX === null ? -1 : Math.floor(p.hullY / h);

  for (let i = 0; i < BANDS; i++) {
    if (i === open) continue;
    const slip = signedHash(i, 1, tear) * p.l.width * SLIP;
    ctx.fillStyle = DARK;
    ctx.fillRect(slip, i * h, p.l.width, h + 1);
    // Every band ends in a bright line where it was torn from the next one.
    const seam = new Path2D();
    seam.moveTo(slip, (i + 1) * h);
    seam.lineTo(slip + p.l.width, (i + 1) * h);
    strokeGlow(ctx, seam, PALETTE.hull, 1, 0.25);
  }

  if (open >= 0 && p.breachX !== null) {
    // The open band is not clear across its whole width: only the part of it
    // the column occupies, with the rest of the band closed like the others.
    const half = p.l.tile * 1.8;
    const slip = signedHash(open, 1, tear) * p.l.width * SLIP;
    ctx.fillStyle = DARK;
    ctx.fillRect(slip, open * h, p.breachX - half - slip, h + 1);
    ctx.fillRect(p.breachX + half, open * h, p.l.width, h + 1);
    const cut = new Path2D();
    cut.moveTo(p.breachX - half, open * h);
    cut.lineTo(p.breachX - half, (open + 1) * h);
    cut.moveTo(p.breachX + half, open * h);
    cut.lineTo(p.breachX + half, (open + 1) * h);
    strokeGlow(ctx, cut, PALETTE.ember, Math.max(1, p.l.tile * 0.035), 1);
  }
}

export function words(ctx: CanvasRenderingContext2D, p: LostPaint): void {
  const mid = p.l.width / 2;
  const jitter = signedHash(0, 2, Math.floor(p.age * TEAR_HZ)) * 3;
  ctx.textAlign = "center";
  let y = p.l.playHeight * 0.15;
  drop(ctx, mid + jitter, y, p.age, 0, 0, () => {
    ctx.font = '700 34px "Courier New",monospace';
    ctx.fillStyle = PALETTE.red;
    ctx.fillText("WAVE LOST", 0, 0);
  });
  y += 24;
  drop(ctx, mid, y, p.age, 1, 0, () => {
    ctx.font = '600 12px "Courier New",monospace';
    ctx.fillStyle = PALETTE.pod;
    ctx.fillText(`WAVE ${p.wave} · TRY ${p.tries} · AGAIN`, 0, 0);
  });
  y += 22;
  drop(ctx, mid, y, p.age, 2, 0, () => {
    ctx.font = '13px "Courier New",monospace';
    ctx.fillStyle = PALETTE.dim;
    ctx.fillText("The band that is still there is where it hit.", 0, 0);
  });
  ctx.textAlign = "left";
}
