/**
 * The film's colour arithmetic — where iridescence stops being a material and
 * starts being a rainbow. Split from `nacre.ts` because it is arithmetic with
 * no SVG in it, and because the judgement is the whole lane and deserves to be
 * read on its own.
 *
 * Nacre is not a spectrum. It is *one* colour seen through interference, and
 * the give-away of the cheap version is that it sweeps the whole wheel. So the
 * span is narrow, symmetric, and sized against a number the repo already has.
 *
 * `PALETTE.red` sits at hue 345.3° and `PALETTE.cyan` at 185.0° — 160.3° apart,
 * and that gap is the entire budget the callout owns. `HUE_SPAN` spends 26° of
 * it, ±13° either side of the body's own hue: 16%, under a sixth of the way
 * toward the other callout. A red card runs 332.3°–358.3° and a cyan card
 * 172.0°–198.0°, leaving 134.3° of daylight where there was 160.3°. It is also
 * under the ~30° between adjacent hue *names*, so a red body is still the word
 * "red" at its furthest stop — the property the field would be asking for.
 *
 * **Symmetric, and that is the argument `light.ts` sets up.** Its header
 * rejects rotating a body's own hue: a fixed rotation is warm for a red body
 * and cool for a cyan one, so the page would disagree in colour just after that
 * file stopped it disagreeing in angle. That objection is to an *offset* — a
 * direction, carried identically onto every card. A **spread** centred on the
 * body's own hue carries none: red goes as far toward orange as toward magenta,
 * cyan as far toward green as toward blue, and the two cards are doing the same
 * thing rather than being pushed the same way.
 */

/** Total hue excursion, in degrees, centred on the body's own hue. */
const HUE_SPAN = 26;
/** The film is paler and less saturated than the body: a layer on it, not a repaint. */
const SAT_MUL = 0.62;
/**
 * How far the film is lifted toward white, as a fraction of the headroom the
 * body's own lightness leaves. A flat `+0.24` was the first version and it
 * clipped: `var(--gold)` sits at lightness 0.65, so its bright stops hit the
 * ceiling and the wobble flattened on one card and not the others — a page
 * disagreeing about a material, which is the failure `light.ts` is about.
 */
const LIGHT_LIFT = 0.5;
/**
 * Lightness wobbles in quadrature with the hue, never in phase with it. In
 * phase it is a brightness stripe wearing a colour, which is exactly the thing
 * this skin exists to be different from.
 */
const LIGHT_WOBBLE = 0.07;

export interface Hsl {
  readonly h: number;
  readonly s: number;
  readonly l: number;
}

/**
 * The SHAPES panel strokes its cards `var(--cyan)`, `var(--gold)`, `var(--dim)`,
 * so a skin that only parsed hex would fall back to no shift on the exact page
 * it is judged on. Resolved once at build, never per frame.
 */
function cssValue(colour: string): string {
  const name = /^var\(\s*(--[\w-]+)\s*\)$/.exec(colour.trim())?.[1];
  if (!name) return colour.trim();
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** A colour as hue/saturation/lightness, or null if it does not resolve to a hex. */
export function toHsl(colour: string): Hsl | null {
  const digits = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(cssValue(colour))?.[1];
  if (!digits) return null;
  const wide = digits.length === 6;
  const chan = (i: number): number => {
    const d = digits[i] ?? "0";
    return Number.parseInt(wide ? digits.slice(i * 2, i * 2 + 2) : `${d}${d}`, 16) / 255;
  };
  const [r, g, b] = [chan(0), chan(1), chan(2)];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;
  if (delta < 1e-6) return { h: 0, s: 0, l };
  const h = max === r ? (g - b) / delta : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  return { h: (((h * 60) % 360) + 360) % 360, s: delta / (1 - Math.abs(2 * l - 1)), l };
}

/** One stop's colour, `u` being its place in a band cycle. */
export function film(base: Hsl, u: number): string {
  const turn = 2 * Math.PI * u;
  const h = (((base.h + (HUE_SPAN / 2) * Math.sin(turn)) % 360) + 360) % 360;
  const pale = base.l + (1 - base.l) * LIGHT_LIFT;
  const l = Math.min(0.94, Math.max(0.06, pale + LIGHT_WOBBLE * Math.cos(turn)));
  const s = Math.min(1, base.s * SAT_MUL) * 100;
  return `hsl(${h.toFixed(1)}, ${s.toFixed(1)}%, ${(l * 100).toFixed(1)}%)`;
}
