import { PALETTE, STROKE } from "@neon-spore/render";
import type { Holder, HolderContext } from "./types.js";

/**
 * THE CRANE — the owner's own suggestion: an arm holds the rock out and lets
 * go of it.
 *
 * Two segments and a claw. The argument for it over the collar is **time**: an
 * arm has a pose, so it can be further out on the beat before a drop than it
 * was four beats earlier, and the picture starts telling the pair *when*
 * instead of only *where*. A collar cannot do that; it looks the same all
 * cycle.
 *
 * The argument against it is that the queen is a body, not a machine. Her
 * shell is angular rock and her torches are made of the same stuff, but she
 * herself is a blob with lobes — and a hinged arm is the first mechanism
 * anywhere on a creature in this game. That is the thing to look at rather
 * than to reason about, which is why it is a card and not a commit.
 */

/** Where the elbow sits between shoulder and wrist, and how far it lifts. */
const ELBOW_ALONG = 0.52;
const ELBOW_LIFT = 0.72;
/** How far the arm reaches past the rock as it lets go. */
const EXTEND = 0.3;

function joint(c: HolderContext, x: number, y: number, r: number): void {
  const { ctx } = c;
  ctx.fillStyle = PALETTE.background;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

export const CRANE: Holder = {
  id: "crane",
  name: "CRANE",
  claim: "An arm carries the rock out, and opens.",
  note:
    "Your own suggestion. What it buys over the collar is time: an arm has a pose, so it can stand further out on the beat before a drop than it did four beats earlier, and the picture starts saying when as well as where. The claw opening is a real release — you can see the rock become free rather than simply stop being attached. " +
    "Against it: the queen is a body and this is the first mechanism on any creature in the game. Her shell is angular rock and so are her torches, but she herself is a blob with lobes, and a hinged elbow may read as a different species bolted to her flank. That is the thing to look at rather than argue about.",

  draw(c, f) {
    const { ctx } = c;
    const reach = f.release * c.rockR * EXTEND;

    const sx = c.bodyX + c.bodyR * 0.62;
    const sy = c.bodyY + c.rockR * 0.1;
    const wx = c.rockX - c.rockR * 0.18 + reach;
    const wy = c.rockY;

    // The elbow lifts less as the arm extends: straightening is what "letting
    // go" looks like in an arm, and a bent arm that merely opened its fingers
    // would read as dropping something by accident.
    const ex = sx + (wx - sx) * ELBOW_ALONG;
    const ey = sy + (wy - sy) * ELBOW_ALONG - c.rockR * ELBOW_LIFT * (1 - f.release * 0.7);

    ctx.strokeStyle = PALETTE.hull;
    ctx.lineWidth = STROKE.outline * 2.6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.lineTo(wx, wy);
    ctx.stroke();

    ctx.strokeStyle = PALETTE.hullRim;
    ctx.lineWidth = STROKE.outline;
    joint(c, ex, ey, c.rockR * 0.17);
    joint(c, sx, sy, c.rockR * 0.2);

    c.drawRock();

    // Two fingers over the rock's near face, swinging apart as it lets go.
    // Drawn after the rock so they close over it — a claw behind the thing it
    // holds is a claw that has already dropped it.
    const grip = c.rockR * 1.06;
    ctx.strokeStyle = PALETTE.hullRim;
    ctx.lineWidth = STROKE.outline * 2;
    for (const side of [-1, 1] as const) {
      const a = side * (0.62 + f.release * 0.75);
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.quadraticCurveTo(
        wx + Math.cos(a) * grip * 0.7,
        wy + Math.sin(a) * grip * 0.7,
        c.rockX + Math.cos(a) * grip,
        c.rockY + Math.sin(a) * grip,
      );
      ctx.stroke();
    }
    ctx.lineCap = "butt";
  },
};
