import { halo, PALETTE } from "@neon-spore/render";
import type { QueenVariant } from "./queen-shared.js";
import { drawQueenShell, queenGeom } from "./queen-shell.js";

/**
 * UNDERGLOW — the shell stays whole; what changes is the light through it.
 *
 * The middle of the same axis `hairline.ts` states: how much of her condition
 * the body itself admits before the row of petals or the sinking confirm it.
 * Here the outline never changes — the rock she is armoured in reads
 * identically at full health and at one petal — but a light inside her
 * brightens and widens as she is hurt, the way an ember shows through a
 * cracked coal without the coal itself needing to crack. Health becomes a
 * temperature, not a shape.
 *
 * Against it: it is the quietest of the three under bright ambient light —
 * a glow reads worst exactly where the game is often played, outdoors on a
 * phone — and it says nothing about *where* she was hit, only how much.
 */

export const UNDERGLOW: QueenVariant = {
  id: "underglow",
  name: "UNDERGLOW",
  claim: "The shell stays whole; a light behind it burns hotter as she is hurt.",
  note:
    "The outline never changes — full health and one petal wear the same rock — but an inner light brightens and spreads as she takes hits, an ember behind coal rather than a crack in it. Marks, sockets and the petal row are all untouched; the only thing this adds sits behind the shell CRADLE and the marks are already drawn in front of. " +
    "Against it: a glow is the first thing bright ambient light washes out, and it reports a quantity, not a place — it cannot say which side took the last hit the way a crack could.",

  draw(ctx, w, h, cycle) {
    drawQueenShell(ctx, queenGeom(w, h, cycle), cycle, {
      // The ember: bigger and brighter the fewer petals are left, drawn before
      // the shell so it reads as coming from inside rather than sitting on top.
      behind(c, { cx, cy, rx, ry, hurt }) {
        if (hurt <= 0) return;
        halo(
          c,
          cx,
          cy,
          Math.min(rx, ry * 2.2) * (0.4 + hurt * 1.1),
          PALETTE.ember,
          0.15 + hurt * 0.45,
        );
      },
      rim: ({ hurt }) => ({
        style: hurt > 0.6 ? PALETTE.ember : PALETTE.rock,
        alpha: 0.7 + hurt * 0.3,
      }),
    });
  },
};
