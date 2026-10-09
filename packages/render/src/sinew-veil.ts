/**
 * How opaque the strings are while THE SLOW is open. The candidate offered
 * 0.45; the owner, 9 October 2026, asked for them *some less transparent*.
 */
const VEIL = 0.7;

/** The surface the strings are painted on before they are laid down veiled. */
let scratch: HTMLCanvasElement | null = null;

/**
 * **The fibres veiled while THE SLOW is open**: the strings painted on a
 * layer of their own and laid down at `VEIL`, so every stroke in them fades
 * together — their own paint sets its alpha outright in places (`glow.ts`),
 * so a fade set around it would not reach. A held breath between the crown
 * and the mass, and the mass and its handles read through it. Taken from
 * VERSUS's `sinew:fibres` slot (`tools/versus/DECIDED.md`).
 *
 * The scratch surface is kept between frames only as memory to draw into,
 * never as a picture: every call clears it before it paints (`slow-lens.ts`'
 * arrangement).
 */
export function layVeiled(
  ctx: CanvasRenderingContext2D,
  slow: boolean,
  paint: (on: CanvasRenderingContext2D) => void,
): void {
  // A page with no layers to give (the tests' stub canvas) paints them whole.
  if (!slow || typeof document === "undefined") {
    paint(ctx);
    return;
  }
  const src = ctx.canvas;
  if (scratch === null) scratch = document.createElement("canvas");
  if (scratch.width !== src.width || scratch.height !== src.height) {
    scratch.width = src.width;
    scratch.height = src.height;
  }
  const on = scratch.getContext("2d");
  if (on === null) {
    paint(ctx);
    return;
  }
  on.setTransform(1, 0, 0, 1, 0, 0);
  on.clearRect(0, 0, scratch.width, scratch.height);
  const m = ctx.getTransform();
  on.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
  paint(on);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha *= VEIL;
  ctx.drawImage(scratch, 0, 0);
  ctx.restore();
}
