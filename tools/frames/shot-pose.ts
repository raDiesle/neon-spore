import type { Page } from "playwright-core";
import { POSE_GROUPS } from "../director/src/poses.js";
import { MARK, nearest } from "./shot-row.js";
import { Unreachable } from "./shot-state.js";

/**
 * `--pose "BLISTER · UP FOR A TAP"`: **one STATES card by its pose's name,
 * its group filled and the card scrolled to, with the selector looked for
 * inside it.**
 *
 * A pose no ON THE FIELD row names had no route at all. THE BLISTER's TAP
 * pose is the one that found it (15 October 2026): with `blister:tap` taken
 * off VERSUS, `versus:shot` no longer reached it, `--row "THE BLISTER"`
 * photographed SWIPE's card, and `--path "/?sheet=states" --click
 * '[data-group="COMPARED LOOKS"] h2'` answered *no element matches* — the
 * sheet opens on WORDINGS, and STATES draws its groups only when its own tab
 * is pressed (`states-page.ts`). A group's cards are drawn only when the
 * group is seen or its heading clicked (`states-section.ts`), so the group is
 * looked up here, where the list is, and its heading pressed in the page.
 */

/** DOCUMENTATION opened on its STATES room (`tools/director/src/place.ts`). */
export const STATES_PATH = "/?sheet=states&inner=states";

/** A pose and the STATES group it is drawn in. */
export interface PoseRoute {
  name: string;
  group: string;
}

/** Which group draws the pose `name`; throws with the nearest names on none. */
export function poseRoute(name: string): PoseRoute {
  const group = POSE_GROUPS.find((g) => g.poses.some((p) => p.name === name));
  if (group) return { name, group: group.title };
  const near = nearest(
    name,
    POSE_GROUPS.flatMap((g) => g.poses.map((p) => p.name)),
  );
  const sentence = `--pose: no pose is named ${JSON.stringify(name)}`;
  throw new Error(near.length === 0 ? sentence : `${sentence}. Nearest: ${near.join(" · ")}`);
}

/** Fills the pose's group, marks its card for `inRow`, and scrolls it to the top. */
export async function reachPose(page: Page, route: PoseRoute): Promise<void> {
  const heading = page.locator(`[data-group=${JSON.stringify(route.group)}] > h2`);
  if ((await heading.count()) === 0) {
    throw new Unreachable(`no STATES group ${JSON.stringify(route.group)} on the page`, 2);
  }
  await heading.first().click();
  const card = page.locator(`[data-pose=${JSON.stringify(route.name)}]`).first();
  await card.waitFor({ state: "attached" });
  await card.evaluate((el, mark) => {
    el.setAttribute(mark, "");
    el.scrollIntoView({ block: "start" });
  }, MARK);
}
