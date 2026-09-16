import { rgba } from "./hex.js";

/**
 * The living top: three sheets of fluid lying over each other, each with its
 * own drift, and slow bodies moving under them.
 *
 * **What it replaces.** RIBBON put diagonal tape across the top and drifted
 * it sideways, and the owner liked *that the top has some fancy animation* and
 * asked for one that *should look more alien living creature fluid like*. Tape
 * is the opposite of that: it is straight, it is man-made, and it says
 * "cordoned off". So the band keeps a moving top and loses the stripes.
 *
 * **Why it reads as fluid rather than as a wave.** One sine is a wave and
 * three summed at frequencies that do not divide each other is a surface that
 * never repeats inside a page. Each sheet drifts at its own speed, so the
 * edges cross and part; the amplitude of each breathes on a fourth, slower
 * clock, so the whole thing swells and settles. Nothing here is random: the
 * argument is `age` in seconds, so both phones draw the same surface and a
 * frame test is reproducible.
 *
 * **Why it reads as alive.** The meniscus — one bright line along the front
 * sheet's edge only — is what a liquid has and a gradient does not, and the
 * lobes creeping under the sheets are the tell that the band contains
 * something rather than being something.
 */

/** The three sheets: how fast each drifts, how deep it hangs, how strong. */
const SHEETS = [
  { speed: 0.09, drop: 0.48, amp: 13, alpha: 0.14 },
  { speed: -0.15, drop: 0.71, amp: 10.5, alpha: 0.17 },
  { speed: 0.23, drop: 0.93, amp: 8, alpha: 0.22 },
] as const;

/**
 * The three frequencies of one sheet's edge, per screen width.
 *
 * None of them divides another, which is the whole of why the surface does not
 * repeat: 1.7 and 3.4 would be one wave with a bump on it, and the eye finds
 * the period of that inside a second.
 */
const WAVES = [1.7, 2.9, 4.3, 7.1] as const;

/** How many points the edge is walked in. Twenty-eight is smooth at 380 px. */
const STEPS = 28;

/** One sheet's edge height above its own baseline, at `t` across the screen. */
function edge(t: number, phase: number, amp: number, breath: number): number {
  let y = 0;
  for (const [i, f] of WAVES.entries()) {
    const k = i === WAVES.length - 1 ? 0.22 : 1 - i * 0.24;
    y += Math.sin(t * f * Math.PI * 2 + phase * (1 + i * 0.7)) * amp * k * breath;
    // The fourth is a ripple rather than a wave: at a quarter weight it wets
    // the edge without moving it, which is the difference between a surface
    // and a curve.
  }
  return y;
}

/**
 * The band's fluid, drawn into a box. `hex` is the seat's colour and `warm`
 * the amber the chrome's writing is in — the two are mixed across the sheets
 * so the surface has a colour that turns rather than one flat tint.
 */
export function membrane(
  ctx: CanvasRenderingContext2D,
  box: { x: number; y: number; w: number; h: number },
  hex: string,
  warm: string,
  age: number,
): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(box.x, box.y, box.w, box.h);
  ctx.clip();
  // Darker than the field it sits over, so the sheets read as light in a
  // liquid rather than as a pale band laid on the picture.
  ctx.fillStyle = "rgba(4,3,12,.985)";
  ctx.fillRect(box.x, box.y, box.w, box.h);

  lobes(ctx, box, warm, age);

  for (const [i, s] of SHEETS.entries()) {
    const breath = 0.72 + 0.28 * Math.sin(age * 0.37 + i * 1.9);
    const base = box.y + box.h * s.drop;
    const g = ctx.createLinearGradient(0, box.y, 0, base);
    g.addColorStop(0, rgba(i === 1 ? warm : hex, s.alpha * 0.25));
    g.addColorStop(1, rgba(i === 1 ? warm : hex, s.alpha));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(box.x, box.y - 2);
    for (let k = 0; k <= STEPS; k++) {
      const t = k / STEPS;
      ctx.lineTo(box.x + t * box.w, base + edge(t, age * s.speed * 6.3, s.amp, breath));
    }
    ctx.lineTo(box.x + box.w, box.y - 2);
    ctx.closePath();
    ctx.fill();
    // Every sheet gets its own thin edge, not only the front one. Three filled
    // shapes at these alphas stack into one mass and the whole thing reads as
    // a hill; three *lines* crossing and parting is what says there are three
    // of them and that they are sliding over each other.
    ctx.strokeStyle = rgba(i === 1 ? warm : hex, 0.3 + 0.12 * i);
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // The meniscus: the front sheet's edge alone, bright, the way the surface of
  // a liquid catches a light and the body of it does not.
  const front = SHEETS[2];
  const breath = 0.72 + 0.28 * Math.sin(age * 0.37 + 3.8);
  const base = box.y + box.h * front.drop;
  ctx.strokeStyle = rgba(warm, 0.75);
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  for (let k = 0; k <= STEPS; k++) {
    const t = k / STEPS;
    const y = base + edge(t, age * front.speed * 6.3, front.amp, breath);
    if (k === 0) ctx.moveTo(box.x, y);
    else ctx.lineTo(box.x + t * box.w, y);
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * What is under the sheets: three soft bodies creeping across, each on its own
 * clock, squashing as they go. Drawn before the sheets, so they are seen
 * *through* the fluid and never on top of it — which is the whole of why the
 * band reads as something with an inside.
 */
function lobes(
  ctx: CanvasRenderingContext2D,
  box: { x: number; y: number; w: number; h: number },
  hex: string,
  age: number,
): void {
  for (let i = 0; i < 3; i++) {
    const speed = 0.055 + i * 0.03;
    // Wrapped with a margin either side, so a body walks off one edge and on
    // at the other rather than popping out of nothing.
    const span = box.w + 120;
    const x = box.x - 60 + ((age * speed * span + i * span * 0.41) % span);
    const y = box.y + box.h * (0.4 + 0.22 * Math.sin(age * 0.5 + i * 2.2));
    const r = 26 + 10 * Math.sin(age * 0.8 + i);
    ctx.fillStyle = rgba(hex, 0.26);
    ctx.beginPath();
    ctx.ellipse(
      x,
      y,
      r * 1.5,
      r * (0.62 + 0.18 * Math.sin(age * 1.1 + i * 1.6)),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}
