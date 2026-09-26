import * as look from "../../../../packages/render/src/slow-look.js";
import type { Variant } from "../../../versus/variant.js";
import { patch } from "../../../versus/variant.js";
import type { Pose } from "../pose-kit.js";
import { SLOW_RUNS_OUT_POSE } from "../poses-slow.js";
import { arriveWindow } from "./slow-light/arrive.js";
import { freezeWindow } from "./slow-light/freeze.js";
import { horizonWindow } from "./slow-light/horizon.js";
import { streamsWindow } from "./slow-light/streams.js";

/**
 * EFFECTS — whole effects the game draws or drew, kept to build boss effects
 * from, on GRAPHICS → EFFECTS.
 *
 * The LIBRARY keeps looks for *bodies*, each on a card at one size and one
 * clock. An effect is not a body: it belongs to a moment of a fight — THE
 * SLOW's window, a strike — and only reads on the field it was made for, at
 * the rate it runs at. So an effect is never drawn on the list; each one opens
 * a page of its own (`versus.html?effect=…`, `../effects-page.ts`) with one
 * phone on it, running the pose it was judged on, and the effect patched into
 * the game's own record for the length of one draw — the VERSUS mechanism
 * with one side mounted.
 *
 * The first group is `slow:light`, closed 26 September 2026: the owner took
 * CRAWL into the game and asked for every other answer, and the streams it
 * replaced, to be kept here for the boss effects to come.
 */

export interface Effect {
  /** `group/name`, the page's address. */
  readonly id: string;
  /** Upper-case, as VERSUS spelled it. */
  readonly label: string;
  /** Which fight it belongs to, and where it was judged. */
  readonly group: string;
  /** Set when the game draws this today. */
  readonly inGame?: boolean;
  /** What it is, in plain words. */
  readonly claim: string;
  /** Where it came from and what happened to it. */
  readonly note: string;
  /** The pose it runs on. */
  readonly pose: Pose;
  /** The one-sided VERSUS variant that puts it on the phone. */
  readonly variant: Variant;
}

/** Heading for the one group so far. */
export const SLOW_LIGHT = "THE SLOW · SLOW:LIGHT";

/** `SLOW_LOOK.paint`, patched to `paint` — how every `slow:light` effect is put on the phone. */
function slowLight(name: string, paint: look.SlowLook["paint"]): Variant {
  return {
    slot: "effect:slow-light",
    name,
    sentence: name,
    dir: "tools/director/src/effects/slow-light",
    patches: [
      patch({
        target: look.SLOW_LOOK,
        reached: () => look.SLOW_LOOK,
        where: { file: "packages/render/src/slow-look.ts", symbol: "SLOW_LOOK", type: "SlowLook" },
        fields: { paint },
      }),
    ],
  };
}

function slow(
  name: string,
  paint: look.SlowLook["paint"] | null,
  e: Pick<Effect, "claim" | "note" | "inGame">,
): Effect {
  return {
    id: `slow-light/${name}`,
    label: name.toUpperCase(),
    group: SLOW_LIGHT,
    pose: SLOW_RUNS_OUT_POSE,
    // In the game means no patch at all: the page draws exactly what ships.
    variant: slowLight(name, paint ?? look.SLOW_LOOK.paint),
    ...e,
  };
}

export const EFFECTS: readonly Effect[] = [
  slow("crawl", null, {
    inGame: true,
    claim:
      "Sparks leave the edge of the screen as long cold streaks and slow as they near, shortening to points and warming to red, until they bank up into a rim a tenth of a body off the skin.",
    note: "Taken from VERSUS on 26 September 2026 in place of the streams (packages/render/src/slow-crawl.ts).",
  }),
  slow("streams", streamsWindow, {
    claim:
      "Light runs in round the boss at one speed, from the edge of the screen to the skin, as the window burns.",
    note: "In the game from 22 to 26 September 2026, under the prism; CRAWL replaced it.",
  }),
  slow("arrive", arriveWindow, {
    claim:
      "A warp jump run backwards: on every slowed downbeat the light round the boss is streaked out from its skin like stars at light speed, and each streak shrinks, fast and then slower, into a still point at its far end.",
    note: "Stood against CRAWL on 26 September 2026 — the answer shaped like the boss arriving out of a jump.",
  }),
  slow("freeze", freezeWindow, {
    claim:
      "Four times a beat a ring of cold light falls in from beyond the screen and slows to a standstill just off the skin, reddening and fading there, so the rings bank up at the boss like light that never lands.",
    note: "Stood against CRAWL on 26 September 2026.",
  }),
  slow("horizon", horizonWindow, {
    claim:
      "Three rings of light circle the boss; on every slowed downbeat they are flung round it as long cold arcs, and across the beat they brake to points and warm to red, the ring nearest the boss slowing first.",
    note: "Stood against CRAWL on 26 September 2026.",
  }),
];

/** The effect at `id`, or undefined for a stale link. */
export function effectById(id: string | null): Effect | undefined {
  return EFFECTS.find((e) => e.id === id);
}

/** Where an effect's own page is. Relative, with the extension — `versus-open.ts` says why. */
export function effectUrl(effect: Effect): string {
  return `versus.html?${new URLSearchParams({ effect: effect.id }).toString()}`;
}
