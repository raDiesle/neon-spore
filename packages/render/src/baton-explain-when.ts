import {
  type BatonBead,
  type BatonLevel,
  type BatonState,
  batonArmDark,
  batonDark,
  batonLaunchable,
  batonLead,
  batonLevel,
  batonWaiting,
  type SimConfig,
} from "@neon-spore/sim";

/**
 * **What THE BATON is about to bring in, and what it is running now** — the
 * owner, 6 October 2026: *explain in game, two or three beats on screen
 * before the new part happens, and while it is happening what the players
 * need to do.* The words are `baton-explain.ts`; this is only when.
 *
 * Every answer is read off the arm, so it keeps nothing between frames and a
 * restart cannot show this fight the last one's banner. **Each part is
 * explained on the level it first comes in on and no other** — the owner's
 * *first time per wave* — which the level alone says: the swing and the shed
 * arrive on `single`, the second bead, the draw and the crossing on `twin`,
 * and the second arm and the arm across are their levels.
 *
 * "Coming" is the handover before the part: the arm is one dark socket short
 * of it, or the beads are one step from the draw or the crossing, or the arm
 * is still unfolding into it. That is a flight and a sit, which on this arm is
 * between three beats and seven.
 */
export type BatonPart = "swing" | "shed" | "twin" | "merge" | "crossing" | "pair" | "across";

/** The level each part is explained on: the first it appears on. */
export const PART_LEVEL: Record<BatonPart, BatonLevel> = {
  swing: "single",
  shed: "single",
  twin: "twin",
  merge: "twin",
  crossing: "twin",
  pair: "pair",
  across: "across",
};

/** The handovers a new arm is explained for, once it is passing. */
const FIRST_HANDOVERS = 2;

/** How many dark sockets past its start a part is explained for. */
const RUNNING_DARK = 2;

function on(b: BatonState, part: BatonPart): boolean {
  return batonLevel(b) === PART_LEVEL[part];
}

/** The part the next handover or two brings in, or null. */
export function batonComing(cfg: SimConfig, b: BatonState): BatonPart | null {
  const dark = batonDark(b);
  if (b.stage === "unfolding") {
    if (on(b, "pair")) return "pair";
    if (on(b, "across")) return "across";
    return null;
  }
  if (b.stage !== "passing") return null;
  if (on(b, "swing") && batonArmDark(cfg, b, 0) === cfg.batonSwingAfter - 1) return "swing";
  if (on(b, "shed") && b.shedBeat < 0 && b.swellSocket < 0 && dark === cfg.batonShedAfter - 1)
    return "shed";
  if (on(b, "twin") && b.beads.length === 1 && !b.merged && dark === cfg.batonTwinAfter - 1)
    return "twin";
  if (on(b, "merge") && b.beads.length === 2 && b.beads.some((x) => batonWaiting(cfg, b, x)))
    return "merge";
  const last = b.beads[0];
  if (on(b, "crossing") && b.merged && last !== undefined && !last.flying) return "crossing";
  return null;
}

/** The part running now that the pair has not been told how to answer yet, or null. */
export function batonRunning(cfg: SimConfig, b: BatonState): BatonPart | null {
  const dark = batonDark(b);
  if (b.stage === "merging") return on(b, "merge") ? "merge" : null;
  if (b.stage === "crossing") return on(b, "crossing") ? "crossing" : null;
  if (b.stage !== "passing") return null;
  if (on(b, "shed") && b.swellSocket >= 0 && b.shedBeat < 0) return "shed";
  if (on(b, "pair") && b.handovers < FIRST_HANDOVERS) return "pair";
  if (on(b, "across") && b.handovers < FIRST_HANDOVERS) return "across";
  const armDark = batonArmDark(cfg, b, 0);
  if (
    on(b, "swing") &&
    armDark >= cfg.batonSwingAfter &&
    armDark < cfg.batonSwingAfter + RUNNING_DARK
  )
    return "swing";
  if (on(b, "twin") && b.beads.length === 2 && dark < cfg.batonTwinAfter + RUNNING_DARK)
    return "twin";
  return null;
}

/**
 * The bead a running part's words stand beside: the second one, the moment
 * it is the new thing; otherwise the one in the air for a shot, or the one
 * the next tap sends, or the one furthest down.
 */
export function batonFocus(cfg: SimConfig, b: BatonState, part: BatonPart): BatonBead | null {
  if (part === "twin") return b.beads[1] ?? null;
  const flying = b.beads.find((x) => x.flying && !x.struck);
  return flying ?? batonLaunchable(cfg, b) ?? batonLead(b);
}
