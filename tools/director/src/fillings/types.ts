import type { SkinContext, SkinFrame } from "../skins/types.js";

/**
 * What is *inside* a body, as against what its surface is made of.
 *
 * The seventh axis on SHAPES, and the owner asked for it by name. On
 * 9 September 2026 he read eight interiors on the ALTERNATIVES page — four
 * offered to the bulb and four to the slick — took one of each into the game
 * and said of the rest: *"i like it a lot. i suggest to move to shapes page,
 * maybe new category like filling."* This is that category.
 *
 * ## Why it is its own axis and not eight more skins
 *
 * `packages/render/src/body-interior.ts` already draws the line, and it draws
 * it for the same reason: *the material around these marks is what the body is
 * made of, this is what it has in it.* Two open questions about one body are
 * allowed to exist and are not allowed to claim one field, which is why they
 * are two records in the game and two axes here. In practice the tell is what
 * a value is arguing about — SKIN's values all argue about the *wall* (a
 * membrane, a carapace, a nacre film, glass), and every value here argues
 * about the **contents**.
 *
 * It also means the two compose. NACRE with ROE in it is a legitimate picture
 * and neither axis had to know about the other.
 *
 * ## One pick, like SKIN — not a stack like GLOW
 *
 * A body has one inside. So this belongs with SKIN, MOTION and LIGHT in
 * `shapes-axes.ts` rather than with the three stacking effects next door, and
 * NONE is a real value on the row: most bodies in this game have never been
 * drawn with anything in them at all, and that is the picture every value here
 * has to beat.
 *
 * ## Two of these are the game
 *
 * `SPORES` and `BLOOM` are what a bulb and a slick wear today — the owner took
 * both into the game the same day he sent the other eight here. They carry
 * `shipped`, the switcher marks them, and they are on the axis **as controls**.
 * A proposal judged against a memory of the shipped look wins every time, which
 * is the rule `tails/types.ts` states at length and the reason CLAUDE.md's *a
 * look is offered, never replaced* means anything.
 *
 * ## Every value is placed, and none of them is posed
 *
 * All ten came from candidates written against `packages/content`'s
 * `surface.ts`, and the port keeps that: a mark is `mount`ed at a longitude and
 * a latitude and carried round by `spin`, so the ones at the back come into
 * view and the ones at the front go away. That reveal is the one cue an affine
 * cannot produce at any setting (`.claude/skills/depth`), and it is most of why
 * these are worth browsing rather than describing.
 *
 * The **two-sac** values — the four written for the slick — place their marks
 * in two clusters either side of the middle, because a slick is two sacs joined
 * at a waist. On a round body that reads as two colonies rather than one, which
 * is a fair thing to see: this axis puts every value to every body, the way
 * every other axis on the page does.
 */
export type FillingContext = SkinContext;

/** The moment a filling is drawn at. The skin's frame, like every axis. */
export type FillingFrame = SkinFrame;

/** One filling: its name in the switcher, and how it draws. */
export interface Filling<Id extends string = string> {
  readonly id: Id;
  readonly label: string;
  readonly hint: string;
  /**
   * Where the game already draws this, or absent if it is a proposal.
   *
   * Not decoration: it is what separates *what we do* from *what we could do*
   * on a row where both are drawn the same way. The switcher marks it and
   * `docs/shipped-looks.md` is the long version.
   */
  readonly shipped?: string;
  build(ctx: FillingContext): void;
}
