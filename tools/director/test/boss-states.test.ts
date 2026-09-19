import { describe, expect, test } from "bun:test";
import { BOSS_KINDS } from "@neon-spore/sim";
import { BOSS_STATES, type BossKind, bossTitle } from "../src/boss-states.js";
import type { Pose } from "../src/pose-kit.js";
import { POSE_GROUPS } from "../src/poses.js";
import { BOSS_GROUPS, BOSS_POSES, statesOwed } from "../src/poses-bosses.js";
import { BEAT_HAND_POSES } from "../src/poses-bosses-hands-beats.js";
import { CLOCK_HAND_POSES } from "../src/poses-bosses-hands-clocks.js";
import { FIELD_HAND_POSES } from "../src/poses-bosses-hands-field.js";
import { HANDLE_HAND_POSES } from "../src/poses-bosses-hands-handles.js";
import { SHOT_HAND_POSES } from "../src/poses-bosses-hands-shots.js";
import { TAKE_HAND_POSES } from "../src/poses-bosses-hands-takes.js";

/**
 * **The BOSSES category is held to the bosses.**
 *
 * The owner's rule, 18 September 2026: whenever something of a boss changes,
 * the STATES sheet's documentation of it changes too. Nobody remembers a
 * rule like that; a test does. Four things are checked, and each one is a
 * way a boss could drift away from its cards:
 *
 * - every kind on `BOSS_KINDS` names its states — the thirty-fourth boss
 *   cannot land without a row in `BOSS_PHASES` or `BY_HAND`;
 * - every boss-tagged pose names a state its boss has — a state renamed in
 *   the simulation orphans its card here;
 * - every state has a card, except the ones on `OWED` — a phase added to a
 *   table is a red test until its pose is written;
 * - `OWED` names nothing a pose already covers — an allowance is spent the
 *   moment the card exists, so the list can only shrink.
 *
 * `OWED` is the same list `docs/parked.md` carries under the lanes that owe
 * them: the states the pair's commands have to reach — a plate narrowed, a
 * strand held, a straw fed — which the first lane of this work did not pose.
 */

const OWED: Partial<Record<BossKind, readonly string[]>> = {
  // THE HIVE's down: a breach that has spilled once cannot be sealed, so
  // the hand cannot bring it on (`docs/queue.md`, the HIVE item).
  hive: ["down"],
  // SNAKE's second and third bodies (18 September 2026). `gorge` is two points
  // eaten and `shed` is four, and round one authors three — so `shed` is not
  // reachable at all until the third round, which means winning the two before
  // it. Both want an autopilot that can drive the body onto a point with the
  // mouth open, which is a lane of its own (`docs/queue.md`, the SNAKE item).
  snake: ["gorge", "shed"],
  // THE SCOUT's second and third loads, the same week and the same shape.
  // `laden` is four motes aboard and `heavy` five, and no hand flies the
  // little ship to a mote at all (`docs/queue.md`, the SCOUT item).
  scout: ["laden", "heavy"],
};

describe("the BOSSES category", () => {
  test("names the states of every boss the simulation knows", () => {
    for (const kind of BOSS_KINDS) {
      expect(BOSS_STATES[kind].length, `${kind} has no states named`).toBeGreaterThan(0);
      const seen = new Set<string>();
      for (const s of BOSS_STATES[kind]) {
        expect(s, `${kind} · ${s}`).toMatch(/^[a-z]+$/);
        expect(seen.has(s), `${kind} names ${s} twice`).toBe(false);
        seen.add(s);
      }
    }
  });

  test("has one group per boss, in the simulation's order, on the sheet", () => {
    expect(BOSS_GROUPS.map((g) => g.title)).toEqual(BOSS_KINDS.map(bossTitle));
    for (const g of BOSS_GROUPS) expect(POSE_GROUPS).toContain(g);
  });

  test("every boss-tagged pose names a state its boss has, and sits in its group", () => {
    for (const pose of BOSS_POSES) {
      expect(pose.boss, pose.name).toBeDefined();
      if (!pose.boss) continue;
      const { kind, state } = pose.boss;
      expect(BOSS_STATES[kind], `${pose.name}: ${kind} has no state ${state}`).toContain(state);
      expect(pose.name).toBe(`${bossTitle(kind)} · ${state.toUpperCase()}`);
      const group = BOSS_GROUPS.find((g) => g.title === bossTitle(kind));
      expect(group?.poses, pose.name).toContain(pose);
    }
    // Every pose in a boss's group is a boss pose; nothing else creeps in.
    for (const g of BOSS_GROUPS) for (const p of g.poses) expect(BOSS_POSES).toContain(p);
  });

  test("every state has a card, or is on the list of what is owed", () => {
    for (const kind of BOSS_KINDS) {
      const owed = new Set(OWED[kind] ?? []);
      const missing = statesOwed(kind).filter((s) => !owed.has(s));
      expect(missing, `${kind}: states with no pose and no allowance`).toEqual([]);
    }
  });

  test("owes nothing a pose already covers, and nothing a boss does not have", () => {
    for (const kind of BOSS_KINDS) {
      const owed = statesOwed(kind);
      for (const s of OWED[kind] ?? []) {
        expect(BOSS_STATES[kind], `${kind} owes ${s}, which it does not have`).toContain(s);
        expect(owed, `${kind} · ${s} is posed; strike it from OWED`).toContain(s);
      }
    }
  });
});

/**
 * **The cards a hand earns are written to the owner's form** (19 September
 * 2026): one short sentence of state, then what each seat does, named as P1
 * and P2. Two players who may not share a language read these, so a card is
 * short words and no prose — a state that asks nothing of a seat still says
 * so in two ("P2 waits").
 *
 * `IN_FORM` is the half of the category rewritten so far — the six
 * `poses-bosses-hands-*.ts` files. The second lane rewrites the queen's, the
 * rounds' and the clock bosses' cards, then widens this test to `BOSS_POSES`
 * and strikes the constant (`docs/queue.md`). Like `OWED`, it can only
 * shrink.
 */
const IN_FORM: Pose[] = [
  ...SHOT_HAND_POSES,
  ...FIELD_HAND_POSES,
  ...BEAT_HAND_POSES,
  ...CLOCK_HAND_POSES,
  ...TAKE_HAND_POSES,
  ...HANDLE_HAND_POSES,
];

const NOTE_LIMIT = 120;

describe("the cards a hand earns", () => {
  test("say what each seat does, in short words", () => {
    for (const pose of IN_FORM) {
      const note = pose.note ?? "";
      expect(
        note.length,
        `${pose.name} is ${note.length} characters; the limit is ${NOTE_LIMIT}`,
      ).toBeLessThanOrEqual(NOTE_LIMIT);
      expect(note, `${pose.name} does not say what P1 does`).toContain("P1");
      expect(note, `${pose.name} does not say what P2 does`).toContain("P2");
    }
  });

  test("is every pose in the six files a hand poses", () => {
    expect(IN_FORM.length).toBe(69);
    for (const pose of IN_FORM) expect(BOSS_POSES, pose.name).toContain(pose);
  });
});
