import { describe, expect, test } from "bun:test";
import { BOSS_KINDS } from "@neon-spore/sim";
import { BOSS_STATES, type BossKind, bossTitle } from "../src/boss-states.js";
import { POSE_GROUPS } from "../src/poses.js";
import { BOSS_GROUPS, BOSS_POSES, statesOwed } from "../src/poses-bosses.js";

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
  // THE MANTLE's simulation lane has landed with no look yet, so none of its
  // five phases has a pose to draw them from (`docs/spec/bosses-choreographed.md`
  // §23). Struck the day the look lane lands.
  mantle: ["still", "pull", "spark", "heartbeat", "dark"],
  // THE KEEL the same, §24: its eight.
  keel: ["still", "joint", "rest", "split", "socket", "rigid", "rock", "straight"],
  // THE VALVE the same, §25: its six.
  valve: ["still", "turn", "hold", "frozen", "list", "open"],
  // THE SEAM the same, §26: its four.
  seam: ["still", "lit", "rest", "split"],
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
 * **Every card in the category is written to the owner's form** (19 September
 * 2026): one short sentence of state, then what each seat does, named as P1
 * and P2. Two players who may not share a language read these, so a card is
 * short words and no prose — a state that asks nothing of a seat still says
 * so in two ("P2 waits").
 *
 * It ran first over the cards a hand earns and over nothing else, with the
 * other eighty-two still in prose behind an `IN_FORM` allowance. That
 * allowance is spent: the second lane rewrote them and the test is the whole
 * of `BOSS_POSES`, so a card that comes in long is this test red.
 */
const NOTE_LIMIT = 120;

describe("every card in the BOSSES category", () => {
  test("says what each seat does, in short words", () => {
    for (const pose of BOSS_POSES) {
      const note = pose.note ?? "";
      expect(
        note.length,
        `${pose.name} is ${note.length} characters; the limit is ${NOTE_LIMIT}`,
      ).toBeLessThanOrEqual(NOTE_LIMIT);
      expect(note, `${pose.name} does not say what P1 does`).toContain("P1");
      expect(note, `${pose.name} does not say what P2 does`).toContain("P2");
    }
  });
});
