/**
 * THE ONE RECORD A CANDIDATE **ECHO** PATCHES.
 *
 * `ghost-look.ts`'s kind, and the same reasons: a record rather than a named
 * function, so a candidate look is a field patched onto it for the length of
 * one `draw()` and the call site never learns anything about it
 * (`docs/versus.md`).
 *
 * **One field, and it is the seam.** What an echo *is* — a slick or a bulb at
 * six tenths, pulling itself in two — is `echo.ts`, and the strain is read
 * off the simulation's own phase and asserted by `echo-strain.test.ts`; none
 * of that is in question. What the pair is being asked about is the
 * **furrow**: the mark that says *this one is about to come apart, and this
 * way*. It shipped as one dark line across the body — a scratch on a flat
 * picture — and a line is the one thing on this creature a light has never
 * touched, which is why it is the field a look is offered on.
 *
 * **The shipped `furrow` came through here with not one pixel moved.** The
 * numbers are the ones `echo.ts` carried inline, and the caller still decides
 * whether there is a seam at all: it reads the axis and the phase and hands
 * them over, so a look cannot draw a parting on a body that has finished.
 */

/** Everything the seam is drawn from, in the body's own scaled frame. */
export interface SeamDraw {
  readonly ctx: CanvasRenderingContext2D;
  /** The axis the halves will step along, in the body's frame — the seam is
   * cut *across* it. */
  readonly angle: number;
  /** How far the strain has gathered, 0..1, already squared so it lands in
   * the beat before the division (`echo.ts`). */
  readonly phase: number;
  /** The contour's own half-extents, before the strain. */
  readonly rx: number;
  readonly ry: number;
  /** The rotation the frame already carries — the pose's lean — so a look
   * that lights the seam can take it back out and find `KEY` (`key-light.ts`
   * makes the same correction for a whole body). */
  readonly rot: number;
  /** The body's dark, its colour and its rim, hazed for distance already. */
  readonly dark: string;
  readonly hex: string;
  readonly rim: string;
}

/** The furrow's darkness, standing and at full strain. The floor is the part
 * that never goes away: it is what makes the seam a *marking* on this
 * creature rather than an animation that happens to it. */
const SEAM_MIN = 0.22;
const SEAM_MAX = 0.85;

/** The furrow's width across the body, as a share of the radius it cuts. */
const SEAM_WIDTH = 0.16;

/**
 * The seam as it ships: one dark stroke across the axis, cut deeper as the
 * beat comes, long enough to leave the contour at both ends — a furrow that
 * stopped short would read as a scratch rather than a parting.
 */
export function furrow(d: SeamDraw): void {
  const { ctx, angle, phase, rx, ry, dark } = d;
  const reach = Math.max(rx, ry) * 1.05;
  ctx.save();
  ctx.rotate(angle);
  ctx.globalAlpha = SEAM_MIN + (SEAM_MAX - SEAM_MIN) * phase;
  ctx.strokeStyle = dark;
  ctx.lineCap = "round";
  ctx.lineWidth = Math.min(rx, ry) * SEAM_WIDTH * (1 + phase);
  ctx.beginPath();
  ctx.moveTo(0, -reach);
  ctx.lineTo(0, reach);
  ctx.stroke();
  ctx.restore();
}

export interface EchoLook {
  /** The mark across the body where it will part. */
  readonly seam: (d: SeamDraw) => void;
}

export const ECHO_LOOK: EchoLook = { seam: furrow };
