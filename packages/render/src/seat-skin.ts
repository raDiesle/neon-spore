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
 * It is the **ship** and **everything the control panel is made of**: the hull,
 * the chamber under it, the tissue's own cells and veins, the light that spills
 * off the membrane, the slime that hangs from it, the socket a button stands
 * in, the body of a button that is not lit, and the trough a strip runs along.
 * The owner asked for exactly that reach, in one line — *the control set must
 * be also fully in this golden design colour set* — and it is the honest one:
 * the panel is the ship seen from inside, so anything that is the ship's own
 * flesh is the seat's colour and nothing else on the panel is.
 *
 * It is **not** the ammunition, the strips' own signal colour or what is drawn
 * on a control's face. Red is red and cyan is cyan on both screens, the
 * cannon's rail is the cannon's colour and the shield's is the shield's — those
 * say *which control*, and a pair that had to translate them per seat would be
 * a pair with two vocabularies for one game (`docs/spec/controls.md`'s whole
 * argument).
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
  /**
   * The chamber under the hull, nearest the ship first.
   *
   * **The first stop is the hull's own deepest body colour, and that is the
   * whole point of it.** The panel used to open on `#150D33` under a violet
   * hull ending in `#150632`, with a lit membrane ruled between them — a step
   * in value, a step in hue and a line drawn over the join, which is three
   * separate ways of saying *the ship stops here and a box begins*. The owner
   * asked for none of them: *remove the line … there is no visual change that
   * the ship might look disconnected from the control panel*. Carrying the
   * hull's last colour into the panel's first is what makes the join have
   * nothing in it to see (`band-ground.ts`, `band-seam.ts`).
   */
  ground: readonly [string, string, string, string];
  /**
   * The tissue's own light, brightest first: a cell near the seam, a vein, and
   * the deep mass everything down there is made of.
   */
  flesh: readonly [string, string, string];
  /**
   * A control's body when it is carrying no light of its own: an unlit action
   * button first, then the plainest thing on any panel — player two's arrows,
   * which are told nothing and must not look as though they were.
   */
  dead: readonly [string, string];
  /**
   * The body of a control that carries a colour on its face.
   *
   * The fire buttons alone, and it exists because of what the owner asked for
   * there: *around the enemy shape in the circle we need another colour,
   * otherwise it is the same as the enemy*. The creature inside is drawn the
   * way the field draws it — dark body, bright rim — so the button it sits on
   * cannot be the ammunition colour without swallowing it. It is the panel's
   * own flesh instead, lifted enough to read as a raised button rather than a
   * hole (`controls.ts`).
   */
  face: string;
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
  ground: ["#150632", "#0E0921", "#080513", "#04020A"],
  flesh: ["#A666F8", "#7E4ADE", "#6042C0"],
  dead: ["#2A1F4E", "#1A1338"],
  face: "#3A2A62",
};

export const P2_SKIN: SeatSkin = {
  hull: {
    // The last stop is a shade deeper than the amber hull shipped with, and it
    // is the one place this skin's ship was changed: it is `ground[0]` as well
    // now, so it is what the panel opens on, and `#241000` under a gold rim was
    // a lit band across the top of the chamber where player one has a dark one.
    body: ["#FFC46B", "#D2761A", "#5E2A05", "#1C0A02"],
    rim: "#FFAE3D",
    edge: "#FFF1D8",
    muzzle: "#2A0F08",
  },
  tint: "#FFAE3D",
  rim: "#FFF1D8",
  lip: ["rgba(250,196,120,0.3)", "rgba(206,140,50,0.07)", "rgba(98,58,20,0.24)"],
  ground: ["#1C0A02", "#150903", "#0B0502", "#040201"],
  // **Matched to player one's by value, not by hex.** Gold at the same energy
  // as violet is a far lighter colour — `#F8B65A` against `#A666F8` is 189
  // against 126 in luminance — and the first pass of this made player two's
  // chamber a lit brown field where player one's is a dark violet one. Every
  // stop below sits within a couple of points of the violet it stands opposite,
  // so the two seats differ in hue and in nothing else.
  flesh: ["#C87F22", "#96590F", "#7A4A14"],
  dead: ["#33250B", "#201705"],
  face: "#4A3410",
};

export function seatSkin(role: ViewRole): SeatSkin {
  return role === "p2" ? P2_SKIN : P1_SKIN;
}
