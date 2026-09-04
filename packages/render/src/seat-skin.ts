import type { HullSkin } from "./hull.js";
import type { ViewRole } from "./layout.js";

/**
 * WHICH SHIP THIS IS: player one's violet, player two's amber.
 *
 * **The two screens are not the same screen, and now they do not look alike.**
 * The pair is told whose half is whose by words — the guide's banner, the
 * labels on the panel — and words are what a player reads once and then stops
 * seeing. A colour is read every frame without being looked at, which is the
 * whole reason the owner asked for it: *give player 2 another colour of the
 * ship as well, then we can easily distinguish.*
 *
 * **Amber is not a new colour.** It is `ship:hull-skin` / `warm`, which lived in
 * `tools/versus/candidates/` as a question — *does the hull still read against
 * red ammunition* — and was never a candidate to replace violet with. It is a
 * candidate to sit *beside* it, one seat each, and the owner settled it that
 * way; the candidate is gone from VERSUS because a question that has been
 * answered is not a question.
 *
 * ## What a seat's colour reaches, and what it deliberately does not
 *
 * It is the **ship** and the **tissue the panel is made of**: the hull, the lit
 * edge of the membrane the panel hangs from, the light in a button's socket,
 * the beads that run off the seam. Those are the surfaces that say *this is
 * your ship*.
 *
 * It is **not** the ammunition, the strips or a control's own face. Red is red
 * and cyan is cyan on both screens, the cannon's strip is the cannon's colour
 * and the shield's is the shield's — those say *which control*, and a pair that
 * had to translate them per seat would be a pair with two vocabularies for one
 * game (`docs/spec/controls.md`'s whole argument).
 *
 * `test` is one person holding both seats at a desk, so it takes player one's.
 */
export interface SeatSkin {
  /** The ship, as `drawHull` takes one. */
  hull: HullSkin;
  /** The lit line along the membrane, and the halo on what drips off it. */
  tint: string;
  /** The brightest thread in that line. */
  rim: string;
  /** A socket's lip, top to bottom: catching the light, mid, and in shadow. */
  lip: readonly [string, string, string];
}

export const P1_SKIN: SeatSkin = {
  hull: {
    body: ["#B268F0", "#6C2AAE", "#33105E", "#150632"],
    rim: "#C05CFF",
    edge: "#F4E7FF",
    muzzle: "#190F2C",
  },
  tint: "#C05CFF",
  rim: "#F4E7FF",
  lip: ["rgba(190,132,250,0.3)", "rgba(126,78,206,0.07)", "rgba(52,28,98,0.24)"],
};

export const P2_SKIN: SeatSkin = {
  hull: {
    body: ["#FFC46B", "#D2761A", "#5E2A05", "#241000"],
    rim: "#FFAE3D",
    edge: "#FFF1D8",
    muzzle: "#2A0F08",
  },
  tint: "#FFAE3D",
  rim: "#FFF1D8",
  lip: ["rgba(250,196,120,0.3)", "rgba(206,140,50,0.07)", "rgba(98,58,20,0.24)"],
};

export function seatSkin(role: ViewRole): SeatSkin {
  return role === "p2" ? P2_SKIN : P1_SKIN;
}
