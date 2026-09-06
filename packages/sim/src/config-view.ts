/**
 * **The numbers only the picture reads.** Every field here is taken off
 * `SimConfig` by `packages/render` — a glide, a band height, a strip, a
 * perspective — and by the simulation almost never.
 *
 * Cut out of `config.ts` when THE BARB and THE MALFUNCTION took that file past
 * its 250-line limit, and the seam is one the comments were already drawing by
 * hand: five of the seven say *Read by render/* in their own first line. What
 * is left next door is the ship and the run — the grid, the beat, the hull, the
 * score — which is what a person standing at the ship would turn a dial for.
 *
 * They are on `SimConfig` rather than in render's own module for the reason
 * they always were: a comparison screen varies one object and a replay pins one
 * object down, and a second config beside it would be a second thing to keep in
 * step. `hashWorld` leaves `cfg` out entirely, so two devices may disagree
 * about every number in this file and still agree about the world.
 *
 * `handleRadiusMilli` is the exception that proves the seam is about *reading*
 * rather than about mattering: the picture draws a handle at that radius and
 * the **rule** clamps a pull by it, which is why it is a simulation number at
 * all rather than a constant in render — see its own paragraph.
 */
export interface ViewConfig {
  /** How long a bullet takes to glide between two tiles, in ms. Read by render/. */
  bulletGlideMs: number;
  /**
   * Share of the screen height the control band takes, in percent, on a screen
   * carrying **both** halves — the desk rig and the director's TEST view, never
   * a phone. It was 37, and the owner asked why the game looked smaller there:
   * it is down to where the lobes stop being limited by the band's height and
   * start being limited by the stage's width (`layout.ts`), which is the most
   * it can give back before the buttons shrink. Read by render/.
   */
  bandPct: number;
  /** The same share when a screen carries only one player's half of the band.
   * The finished game is one role per device, so the field gets the space the
   * missing controls leave behind — see the view switch in `apps/game`. */
  bandSoloPct: number;
  /** Height of the radar strip above the grid, in CSS pixels. Read by render/. */
  radarHeightPx: number;
  /**
   * How far a handle's circle reaches from its own centre, in thousandths of a
   * tile — THE MAZE's string, THE WARDEN's rope and THE LID's cord all wear the
   * same one.
   *
   * **It is here rather than in render/ because the rule needs it.** A pull may
   * not carry a handle off the field (`handle-pull.ts`), and what has to stay on
   * is the whole circle rather than its centre — so the bound is inset by
   * exactly this, and the simulation has to know the number the picture is
   * drawn at. It was a `HANDLE_TILES` constant written out in two render files;
   * a third copy in the clamp is how a control comes to be answered somewhere
   * it is not drawn.
   */
  handleRadiusMilli: number;
  /**
   * Perspective by row: how much larger a body draws on the hull row than on
   * the top row. 1 is the flat field. Read by render/ (`depth.ts`) and by
   * nothing else — `hashWorld` leaves `cfg` out, so two devices may disagree
   * about it and still agree about the world. Never below 1: the direction is
   * a constraint, because a shrinking far row walks through the 20–26 px
   * nameability floor. `render/src/depth.ts` derives 1.125 twice, and
   * `render/test/depth.test.ts` keeps it from being raised past either.
   */
  depthNearScale: number;
  /**
   * Atmospheric perspective: how far a body on the *top* row has its colours
   * mixed toward the field's far colour, 0 to 1, falling to 0 at the hull.
   * One mix pays for dimmer, cooler and lower contrast at once. Read by
   * render/ (`depth.ts`).
   */
  depthHaze: number;
}

export const VIEW_DEFAULTS: ViewConfig = {
  bulletGlideMs: 130,
  bandPct: 31,
  bandSoloPct: 27,
  radarHeightPx: 34,
  handleRadiusMilli: 300,
  depthNearScale: 1.125,
  depthHaze: 0.3,
};
