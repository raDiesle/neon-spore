import { catmullRomToBezierPath, type StuddedOpts, studdedContour } from "@neon-spore/content";
import type { Subject } from "../contour.js";

/**
 * A body whose whole rim is broken by the same feature repeated: knobs, spines
 * or hairs.
 *
 * Drawn to convert what other games put on a falling enemy. Almost every one
 * of them lands on the same picture — a plain body wearing a fringe — and the
 * fringe is doing the work our lobes do: it is how you tell one kind from
 * another at the size a phone actually draws them. `bloom` in `radial.ts` is
 * the nearest thing we had and is a different claim: a few long arms, each
 * running its own clock, so the silhouette *is* a set of readings. This is the
 * opposite — many short features, all alike, saying one word about the whole
 * body rather than several about its parts.
 *
 * One function rather than three, because the difference between a knob, a
 * spine and a hair is three numbers and it is worth being able to see that.
 *
 * **`width` and `blunt` are separate on purpose, and the first draft got this
 * wrong.** It had one parameter doing both, so asking for a blunt feature also
 * widened it, and a body meant to wear clubs on necks came out as a cog: wide
 * teeth with no gap between them. They are independent claims. `width` is how
 * much of the gap between two features the feature occupies — small is a thing
 * standing off the body, large is a scallop cut into it. `blunt` is what
 * happens at the tip — 0 comes to a point, 1 rounds it over into a cap. A
 * spine is narrow and sharp, and a lobe is wide and blunt, which is what the
 * game already draws and is why nothing here asks for it.
 *
 * **What no setting of `blunt` can give you is a neck, and `blunt: 1` is not
 * a club.** It rounds a tip; it cannot narrow the waist under one, and the
 * reason is the machinery rather than the tuning. This is a radius function —
 * one radius per angle — and a ball on a stalk has two at the same angle, the
 * near side of the cap and the far side. The near one is the one there is
 * nowhere to put, so the waist closes, the features run together into a
 * continuous spiky rim, and what comes back is a sea urchin rather than a
 * mace. THE BURR is that conversion, made before this paragraph existed to
 * warn against it. Anything wearing balls on stalks — a mace, a club, a
 * pommel, a morning star — belongs to `clubbed.ts` instead, which walks the
 * contour rather than sampling it and can therefore carry a waist.
 */
/**
 * The numbers, and the rim they make, live in `@neon-spore/content`
 * (`studded.ts` there) since the rind put this form on: a package cannot
 * import a tool, and one arithmetic for the card and the creature is the
 * point. What is here is the subject the sheet draws.
 */
export type { StuddedOpts } from "@neon-spore/content";

export function studded(name: string, note: string, o: StuddedOpts): Subject {
  return { name, note, open: false, pointsAt: studdedContour(o), path: catmullRomToBezierPath };
}
