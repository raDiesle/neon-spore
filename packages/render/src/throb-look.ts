import { pores } from "./throb-pores.js";

/**
 * THE ONE RECORD A CANDIDATE THROB LOOK PATCHES.
 *
 * `magnet-look.ts`, `dart-look.ts` and `crawler-look.ts` are the three files
 * this is the fourth of, and it is here rather than at the bottom of
 * `throb.ts` for their reason: the record needs the paint and the caller needs
 * the record, so the two would import each other.
 */

/**
 * A throb's far half, as everything a surface on it could want.
 *
 * `turn` is the field the shipped paint does not use and a placed surface
 * cannot do without. The context arrives **already rotated** by it — that is
 * how the shipped half is carried round for free — so a candidate that wants
 * to treat this body as a ball rather than as a disc has to know how far the
 * transform has turned in order to undo it. It is the throb's own spin and not
 * `rot`: the own-motion lean on top of it is a *pose*, and a pose is exactly
 * what must stay on the silhouette (`docs/style-guide.md`, Depth).
 */
export interface ThrobHalf {
  readonly ctx: CanvasRenderingContext2D;
  /** The body's contour, in the body's own space. */
  readonly body: Path2D;
  readonly rx: number;
  readonly ry: number;
  readonly isBulb: boolean;
  /** The **other** ammunition colour — the half the cannon is not looking at. */
  readonly tint: { readonly rim: string; readonly hex: string; readonly dark: string };
  /** The two colours mixed, which is neither of them. The cut is drawn in it. */
  readonly seamHue: string;
  /** A line width already divided by the body's scale. */
  readonly lw: number;
  /** How far `throbTurnMilli` has turned the context, in radians. */
  readonly turn: number;
  /**
   * Everything the context has been rotated by — the turn plus the body's own
   * lean. Both, because they answer two different questions: `turn` says where
   * the surface has got to, and `rot` says which way *up* the picture is, which
   * is what a fixed light has to be undone against (`key-light.ts`'s `spin`).
   */
  readonly rot: number;
}

export interface ThrobLook {
  half(h: ThrobHalf): void;
}

/** The shipped throb — PORES, the owner's pick from `creature:throb` on
 * 12 September 2026: the far colour bounded by its own meridian, and seven
 * pores pinned on that hemisphere and carried round by the turn
 * (`throb-pores.ts`). GLOBE, the paint before it, is gone with the slot. */
export const THROB_LOOK: ThrobLook = { half: pores };
