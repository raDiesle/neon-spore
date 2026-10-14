import { expect } from "bun:test";
import { join } from "node:path";
import { CREATURES } from "@neon-spore/content";
import { POSE_GROUPS } from "../src/poses.js";

/**
 * **What `versus-pose.test.ts` reads its slots and poses with**: a pose by
 * its name, the rows of `SLOT_POSE`, and which body a VERSUS slot is about —
 * the slots whose pose has to put one creature on the field, and the ones
 * that are not about one body. Split from the test for length, so the test
 * file holds tests and `NOT_ONE_BODY` can grow as slots open.
 */

/**
 * The creature a slot's pose has to put on the field, or `null` where the slot
 * is not about one body.
 *
 * **Derived, because the hand-kept version exempted whatever nobody
 * remembered.** This check began as a literal `Record` of four slots, and a
 * slot missing from it was not a failure and not a warning — it was simply not
 * checked, so the guard for the owner's complaint that every slot showed a
 * slick covered whichever slots somebody had added and silently let the rest
 * through. The list was extended by hand twice before it was written down.
 *
 * A slot is `area:thing`, and both halves are read: an area that names a body
 * (`crawler:pulse`, `warden:plates`) is that body, and the area `creature`
 * hands the question to the thing (`creature:meteor`). `CREATURES` is the
 * roster and is keyed by every `CreatureKind`, so "is this a body" is asked of
 * the bestiary rather than of a second list kept here.
 */
export const NOT_ONE_BODY: Record<string, null> = {
  // A skin every living body wears, and a break every living body comes apart
  // into. Both are `creature:` slots whose second half is a *material* rather
  // than a kind, so there is no one creature a pose could be asked for — and
  // they are written here rather than left to fall through, because falling
  // through is the defect this whole function replaces.
  "creature:skin": null,
  "creature:break": null,
  // And the two halves of a break asked separately, which are a *fall* and a
  // *shower* rather than a body: `creature:debris` is what the pieces do after
  // the cut, and `creature:splinters` is what comes off the faces it opened.
  // Both are judged on the pose the break was, and that pose kills a slick.
  "creature:debris": null,
  "creature:splinters": null,
  // And what a hit takes *out* of a body, which is damage rather than a kind.
  // It is judged on `METEOR · CRATERED`, because the rock is the only body in
  // the game that survives a hit and is still on the field to show one.
  "creature:bite": null,
  // And the interior every blob without one of its own draws — a count, a
  // box, a throb, a dart — which is a record shared by kinds, not a kind.
  "creature:body-interior": null,
};

function isKind(name: string): boolean {
  return Object.hasOwn(CREATURES, name);
}

export function subjectOf(slot: string): string | null {
  if (Object.hasOwn(NOT_ONE_BODY, slot)) return null;
  const [area, thing] = slot.split(":");
  if (area !== undefined && isKind(area)) return area;
  if (area !== "creature") return null;
  // A `creature:` slot names its body in the second half, and one that does
  // not has to say so above. Handing back the word unresolved is deliberate:
  // no creature has that kind, so the assertion fails naming the slot.
  return thing ?? null;
}

/** A pose by its name, for the tests about a pose whose slot has closed. */
export function poseNamed(name: string) {
  const pose = POSE_GROUPS.flatMap((g) => g.poses).find((p) => p.name === name);
  if (!pose) throw new Error(`no pose called ${name}`);
  return pose;
}

/** The rows of `SLOT_POSE`, read off the source rather than the module: the
 * map is not exported, and the literal is what the two tests below are about. */
export async function slotPoseRows(): Promise<string[]> {
  const source = await Bun.file(join(import.meta.dirname, "..", "src", "versus-pose.ts")).text();
  const start = source.indexOf("const SLOT_POSE");
  expect(start).toBeGreaterThan(-1);
  // Every slot decided leaves `{}` on the one line — no rows at all, the state
  // the map has been in since 12 September 2026.
  if (/const SLOT_POSE: Record<string, string> = \{\};/.test(source)) return [];
  const end = source.indexOf("\n};", start);
  expect(end).toBeGreaterThan(start);
  return source.slice(start, end).split("\n").slice(1);
}
