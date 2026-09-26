import { MECHANICS } from "@neon-spore/content";
import { BOSS_KINDS } from "@neon-spore/sim";
import { BOSS_STATES, type BossKind, bossTitle } from "./boss-states.js";
import type { Pose, PoseGroup } from "./pose-kit.js";
import { CLOCK_BOSS_POSES } from "./poses-bosses-clocks.js";
import { FIRST_BOSS_POSES } from "./poses-bosses-first.js";
import { BEAT_HAND_POSES } from "./poses-bosses-hands-beats.js";
import { CLOCK_HAND_POSES } from "./poses-bosses-hands-clocks.js";
import { FIELD_HAND_POSES } from "./poses-bosses-hands-field.js";
import { HANDLE_HAND_POSES } from "./poses-bosses-hands-handles.js";
import { NETTLE_POSES } from "./poses-bosses-hands-nettle.js";
import { RATCHET_POSES } from "./poses-bosses-hands-ratchet.js";
import { SHOT_HAND_POSES } from "./poses-bosses-hands-shots.js";
import { TAKE_HAND_POSES } from "./poses-bosses-hands-takes.js";
import { QUEEN_POSES } from "./poses-bosses-queen.js";
import { ROUND_BOSS_POSES } from "./poses-bosses-rounds.js";
import { ROUND_BOSS_POSES_B } from "./poses-bosses-rounds-b.js";

/**
 * **The BOSSES category of the STATES sheet**: one group per boss, in the
 * order the simulation numbers them, every pose in it a state off
 * `BOSS_STATES`.
 *
 * The owner asked for it on 18 September 2026 — every boss's states,
 * documented, in a category of their own, and kept in step with the bosses.
 * The poses live in files by how a state is reached: the queen's, the
 * rounds' (a whole screen the field has stopped being), the clock bosses'
 * (a body over the field with a beat count), and the states a hand on the
 * controls earns — by shot, by beat, on the field's bosses and on the
 * clocks', by a taking and by a handle (`poses-bosses-hands-*.ts`). A boss
 * is a group here whether or not a pose has been written for it yet: a group
 * with no cards and a note saying which states are owed is the honest
 * picture of where the documentation stands, and `test/boss-states.test.ts`
 * is what shrinks the list of owed states to nothing.
 *
 * The group's note is the boss's one-sentence mechanic, the same sentence
 * the bestiary and the wave editor give it (`content/mechanics-table.ts`).
 */
export const BOSS_POSES: Pose[] = [
  ...QUEEN_POSES,
  ...ROUND_BOSS_POSES,
  ...ROUND_BOSS_POSES_B,
  ...CLOCK_BOSS_POSES,
  ...FIRST_BOSS_POSES,
  ...SHOT_HAND_POSES,
  ...BEAT_HAND_POSES,
  ...FIELD_HAND_POSES,
  ...CLOCK_HAND_POSES,
  ...TAKE_HAND_POSES,
  ...HANDLE_HAND_POSES,
  ...RATCHET_POSES,
  ...NETTLE_POSES,
];

/** The states of this boss no pose carries yet — what the category still owes. */
export function statesOwed(kind: BossKind): string[] {
  const posed = new Set(BOSS_POSES.filter((p) => p.boss?.kind === kind).map((p) => p.boss?.state));
  return BOSS_STATES[kind].filter((s) => !posed.has(s));
}

function group(kind: BossKind): PoseGroup {
  const what = (MECHANICS as Record<string, { what: string }>)[kind]?.what ?? "";
  const owed = statesOwed(kind);
  const states = `states: ${BOSS_STATES[kind].join(", ")}`;
  const missing = owed.length ? ` — not posed yet: ${owed.join(", ")}` : "";
  return {
    title: bossTitle(kind),
    note: `${what} ${states}${missing}`.trim(),
    poses: BOSS_POSES.filter((p) => p.boss?.kind === kind),
  };
}

export const BOSS_GROUPS: PoseGroup[] = BOSS_KINDS.map(group);
