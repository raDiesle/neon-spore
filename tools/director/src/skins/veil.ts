import { KEY } from "./light.js";
import { fillPass, rimPass } from "./parts.js";
import { type Skin, type SkinContext, SVG } from "./types.js";

/**
 * The body stays a hole, and the **membrane around it** is what has thickness.
 *
 * It was `creature:skin` / `veil` on the ALTERNATIVES page, offered against LIT
 * — the flesh under a key light the owner took into the game on 8 September
 * 2026 — and he moved it here on 9 September rather than deciding it. That is
 * the right address for what it actually proposes. VERSUS asks *which of these
 * two for this body*, and a wall on a translucent shell is a claim about
 * **every** body in the game; this axis is the only page in the project where
 * such a claim is put to all of them at once.
 *
 * ## What it argues
 *
 * LIT says a creature should be a solid under a light, and fills it with flesh
 * to get one. VEIL says the near-background deep was *right* — it is where the
 * neon reads from, it is what `hazed` spends distance against, and it is why
 * eleven columns of bodies do not turn the field into a lamp — and that what
 * was missing is not a filled middle but a membrane with a wall.
 *
 * So the fill is left alone and the rim is given depth instead: the body's own
 * colour bleeding inward from the contour, brightest at the edge, gone by about
 * two fifths of the way in. It is the *glass and nacre* row of
 * `docs/style-guide.md`'s material table where MEMBRANE is the membrane row,
 * and the two are a real choice rather than a strength setting — one adds mass,
 * the other adds a wall, and they cannot both be right about what a spore is.
 *
 * ## The whole three-dimensional claim is one number
 *
 * The band's centre is pushed toward `KEY`, so the wall reads **thin where the
 * surface faces the light and thick where it turns away**, which is what a
 * rounded translucent shell actually does. `OFFSET` is that push and nothing
 * else here does any of the work.
 *
 * And the push is turned back by the body's own rotation every frame, so a
 * throb turning and a dart leaning move under a light that stays where it is.
 * That is the one thing this file does that `light.ts` next door does not: its
 * passes place the key in the card's own frame and let it ride round with the
 * body, which is fine for a still card and is the *light glued to a spinning
 * rock* `.claude/skills/depth` warns about the moment MOTION is on.
 *
 * ## How it can lose
 *
 * **A rim that bleeds inward is a wider, softer rim**, and `auraPass` is
 * already three passes of the same colour — the two may add up to a body
 * wearing a halo rather than a body with a wall, which is the shape of every
 * complaint about glow in this repository. Tick MEMBRANE and this one by turns
 * and watch the *edge*, not the middle. And it says **hollow**, on a roster
 * where hollow already means something: the wisp is the body you can see
 * through, and a page of bodies that all read as shells spends that.
 *
 * ## It is bigger than a wall on a big card, and that is the look and not a bug
 *
 * `bun run shapes:still veil BULB` draws one body at 320 px, and there the far
 * half of a lobed contour is nearly solid rather than walled: every valley
 * between two lobes on the dark side already sits past the gradient's middle
 * stop, so the band closes up into a mass. At the 92 px card and at the 26 px
 * a creature is actually drawn it reads as a wall, which is the size the
 * numbers were tuned at.
 *
 * The three numbers below are **the candidate's own**, unchanged, and that is
 * deliberate: a look moved here so it can be browsed has to be the look that
 * was offered, or the page is showing something nobody proposed. If the
 * closing-up is what somebody wants fixed rather than seen, `REACH_IN` is the
 * number — a shallower band never closes — and the fix belongs in a commit
 * that says it is changing the proposal.
 */

/** How far in from the rim the glow reaches, as a share of the contour's own
 * reach. Under about a third it is a second outline; over about a half the
 * body has no dark middle left and the whole claim is gone. */
const REACH_IN = 0.42;

/** How bright the rim is where the membrane is thickest. */
const INNER = 0.55;

/** How far the gradient's centre is pushed toward the light, as a share of
 * reach. See above: this is the whole of the three-dimensional read. */
const OFFSET = 0.3;

/** How far the gradient reaches past the contour, in bounding-box units where
 * 0.5 is the body's own half-width. Past 1 so the outermost stop lands on the
 * rim rather than short of it. */
const SPAN = 0.5 * 1.15;

/** Where the canvas gradient's inner edge and its middle stop fall, once the
 * ramp is measured from the centre instead of from `1 - REACH_IN`. */
const HOLLOW = ((1 - REACH_IN) * 0.5) / SPAN;
const MID = HOLLOW + (1 - HOLLOW) * 0.62;

export const VEIL: Skin<"veil"> = {
  id: "veil",
  label: "VEIL",
  hint: "the body's colour bleeding inward from the contour — a wall on a shell, thin toward the light and thick away from it",
  build(ctx: SkinContext) {
    fillPass(ctx);

    const grad = document.createElementNS(SVG, "radialGradient");
    grad.setAttribute("id", `${ctx.uid}-veil`);
    grad.setAttribute("r", SPAN.toFixed(4));
    for (const [offset, alpha] of [
      [0, 0],
      [HOLLOW, 0],
      [MID, INNER * 0.3],
      [1, INNER],
    ] as const) {
      const s = document.createElementNS(SVG, "stop");
      s.setAttribute("offset", `${(offset * 100).toFixed(2)}%`);
      s.setAttribute("stop-color", ctx.colour);
      s.setAttribute("stop-opacity", alpha.toFixed(3));
      grad.appendChild(s);
    }
    ctx.defs.appendChild(grad);

    const wall = ctx.contourPath();
    wall.setAttribute("fill", `url(#${ctx.uid}-veil)`);
    wall.setAttribute("fill-rule", "evenodd");
    wall.setAttribute("stroke", "none");
    ctx.body.appendChild(wall);

    rimPass(ctx);

    // The key, turned back by whatever the own-motion is doing to the body this
    // instant. Two `setAttribute`s and no allocation, which is the rule for
    // anything registered here (`types.ts`, `onFrame`).
    ctx.onFrame((f) => {
      const cos = Math.cos(-f.pose.rot);
      const sin = Math.sin(-f.pose.rot);
      grad.setAttribute("cx", (0.5 + OFFSET * (KEY.x * cos - KEY.y * sin)).toFixed(4));
      grad.setAttribute("cy", (0.5 + OFFSET * (KEY.x * sin + KEY.y * cos)).toFixed(4));
    });
  },
};
