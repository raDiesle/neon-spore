/** How many bars the voice meter has, and how they sit. */
const BARS = 5;
const PITCH = 2.6;
const BAR_W = 1.6;
/** Each bar's own rate, in radians a second — no two alike, so the meter
 * jumps like a voice rather than rolling like a wave. */
const RATES = [11, 17, 13, 19, 9] as const;

/**
 * **A voice meter and a pair of headphones.** The talker's mark is the bars a
 * phone shows while it records you — five of them jumping out of step, the
 * one picture that means *your voice is the thing being taken now*. The
 * listener's is a headset, the sign for *you are the one hearing*, nodding
 * gently to a beat it is being played.
 */
export function barsSpeak(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ink: string,
  time: number,
): void {
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.lineWidth = BAR_W;
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let i = 0; i < BARS; i++) {
    const bx = x + (i - (BARS - 1) / 2) * PITCH;
    const level =
      Math.abs(Math.sin(time * RATES[i]! + i * 1.7)) *
      (0.55 + 0.45 * Math.abs(Math.sin(time * 3.1)));
    // The middle bars reach furthest, as a meter's do.
    const reach = 1 + (4.6 - Math.abs(i - 2) * 1.1) * level;
    ctx.moveTo(bx, y - reach);
    ctx.lineTo(bx, y + reach);
  }
  ctx.stroke();
  ctx.restore();
}

export function barsListen(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ink: string,
  time: number,
): void {
  const nod = 0.7 * Math.abs(Math.sin(time * 4));
  const cy = y + 1 + nod;
  ctx.save();
  ctx.globalAlpha = 0.95;
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.lineWidth = 1.3;
  ctx.lineCap = "round";
  // The band over the top of the head.
  ctx.beginPath();
  ctx.arc(x, cy, 4.8, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();
  // The two cups.
  ctx.beginPath();
  ctx.roundRect(x - 6.2, cy - 1.2, 2.8, 4.6, 1.2);
  ctx.roundRect(x + 3.4, cy - 1.2, 2.8, 4.6, 1.2);
  ctx.fill();
  ctx.restore();
}
