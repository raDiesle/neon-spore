import { describe, expect, test } from "bun:test";
import { FIELD_ACTIONS, userOf } from "../src/field-actions.js";
import { FIELD_CONTROLS } from "../src/field-controls-page.js";
import { momentsOf, stillTicks, takeMoments, takeTick } from "../src/field-stills.js";
import { poseNamed } from "../src/poses.js";

/**
 * A card's ▤ STILLS are six moments found by playing its pose with AUTO's
 * hand (`field-stills.ts`). They run in order, and the cards AUTO cannot
 * play are named here — so a hand that learns one, or forgets one, says so.
 */

const NOT_PLAYED = [
  "THE ANTIPHON'S ORGAN",
  "THE BALLOON'S LEFT HANDLE",
  "THE BALLOON'S RIGHT HANDLE",
  "THE CHOIR'S RUB",
  "THE GAUGE'S BAND",
  "THE LEAD'S STALK",
  "THE LEDGER'S FOOT",
  "THE LEDGER'S HAUL",
  "THE LEDGER'S PLUG",
  "THE LEDGER'S PULL",
  "THE LID'S CORD",
  "THE LIGHT",
  "THE MAZE'S STRING",
  "THE MIRROR'S LOBES",
  "THE PULSE'S ARREST",
  "THE PULSE'S BRACE",
  "THE TASTER'S PIN",
  "THE TASTER'S WIPE",
];

const byName = new Map(FIELD_CONTROLS.map((c) => [c.name, c]));
const cards = new Map<string, string[]>();
for (const name of FIELD_ACTIONS.flatMap((a) => a.types.flatMap((t) => t.rows))) {
  const row = byName.get(name);
  if (row)
    cards.set(`${userOf(name)}|${row.pose}`, [
      ...(cards.get(`${userOf(name)}|${row.pose}`) ?? []),
      name,
    ]);
}

describe("a card's stills", () => {
  const unplayed: string[] = [];
  for (const [key, names] of cards) {
    const rows = names.flatMap((n) => byName.get(n) ?? []);
    const [first] = rows;
    if (!first) continue;
    const moments = stillTicks(poseNamed(first.pose).build(), rows);
    if (!moments) {
      unplayed.push(...names);
      continue;
    }
    test(`${key} runs in order`, () => {
      const at = moments.map((m) => m.at);
      expect(at).toEqual([...at].sort((a, b) => a - b));
      expect(moments).toHaveLength(6);
    });
  }

  // A creature has no hand (THE GUM), and a hand reaches what its
  // boss needs within the reach, not every control it has. Each of these
  // cards says so and points at ▶ TRY IT.
  test("the rows AUTO does not play", () => {
    expect([...new Set(unplayed)].sort()).toEqual(NOT_PLAYED);
  });
});

describe("a take's stills", () => {
  const tpb = 12;
  const stalk = byName.get("THE LEAD'S STALK");
  if (!stalk) throw new Error("THE LEAD'S STALK");
  const drag = (tick: number, on: boolean) => ({
    tick,
    player: 2 as const,
    command: { kind: "drag" as const, target: "leadStalk" as const, on, fromMilli: 0 },
  });
  const aim = (tick: number) => ({
    tick,
    player: 1 as const,
    command: { kind: "cannonCol" as const, col: 3 },
  });

  test("are the press and the lift the mouse sent, from the pose's tick", () => {
    const sent = [aim(102), drag(110, true), drag(130, false)];
    const moments = takeMoments(sent, 100, 200, [stalk], tpb);
    expect(moments?.map((m) => m.at)).toEqual([0, 10, 20, 30, 42, 66]);
    expect(moments?.map((m) => m.label)).toEqual(momentsOf(10, 30, false, tpb).map((m) => m.label));
  });

  test("wait for a lift, and call a thumb two beats down STILL HELD", () => {
    expect(takeMoments([aim(102)], 100, 400, [stalk], tpb)).toBeNull();
    expect(takeMoments([drag(110, true)], 100, 110 + 2 * tpb - 1, [stalk], tpb)).toBeNull();
    const held = takeMoments([drag(110, true)], 100, 110 + 2 * tpb, [stalk], tpb);
    expect(held?.[3]?.label).toBe("STILL HELD");
  });

  test("replay on the pose's own ticks", () => {
    const pose = poseNamed(stalk.pose);
    const w = pose.build();
    const sent = [drag(w.tick + 1, true)];
    expect(takeTick(w, sent)).toEqual([]);
    expect(takeTick(w, sent)).toEqual(sent);
  });
});
