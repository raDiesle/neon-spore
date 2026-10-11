import { describe, expect, test } from "bun:test";
import type { Wave } from "@neon-spore/content";
import { WAVES } from "@neon-spore/content";
import { bossStretches, moveWithGroup, waveGroups } from "../src/rail-groups.js";
import { renderRows } from "../src/rail-list.js";
import type { Store } from "../src/state.js";
import { FakeEl, installDom } from "./fake-dom.js";

/**
 * Waves folded under the wave above them, and the stretch before each boss
 * (`rail-groups.ts`): who a variant belongs to, where a dragged group lands,
 * what a folded group hides, and what each boss's line counts.
 */

const BOSS = WAVES.find((w) => w.boss)?.boss;

/** A list of waves from a pattern: `H` a head, `v` a variant, `B` a boss. */
function waves(pattern: string): Wave[] {
  return [...pattern].map((c, i) => ({
    id: `w${i}`,
    name: `${c}${i}`,
    entries: [],
    ...(c === "v" ? { variant: true as const } : {}),
    ...(c === "B" ? { boss: BOSS } : {}),
  }));
}

const store = (pattern: string, index = 0): Store => ({
  waves: waves(pattern),
  index,
  dirty: false,
});
const order = (s: Store): string => s.waves.map((w) => w.id.slice(1)).join(",");

describe("waveGroups", () => {
  test("a variant belongs to the nearest wave above it that is not one", () => {
    const g = waveGroups(waves("HvvHvB"));
    expect(g.head).toEqual([-1, 0, 0, -1, 3, -1]);
    expect(g.size).toEqual([2, 0, 0, 1, 0, 0]);
  });

  test("a boss and the first wave are heads whatever they say", () => {
    const list = waves("vHB");
    list[2]!.variant = true;
    expect(waveGroups(list).head).toEqual([-1, -1, -1]);
  });

  test("the shipped campaign holds no variant the rail would ignore", () => {
    for (const [i, wave] of WAVES.entries()) {
      if (!wave.variant) continue;
      expect(i).toBeGreaterThan(0);
      expect(wave.boss).toBeUndefined();
    }
  });
});

describe("moveWithGroup", () => {
  const open = (): boolean => false;
  const shut = (): boolean => true;

  test("a head carries its group, and lands after the group it was dropped on", () => {
    const s = store("HvHvvH");
    moveWithGroup(s, 0, 3, open);
    expect(order(s)).toBe("2,3,4,0,1,5");
  });

  test("dragged up into a group, a head lands before that group", () => {
    const s = store("HvvHv");
    moveWithGroup(s, 3, 2, open);
    expect(order(s)).toBe("3,4,0,1,2");
  });

  test("a variant travels alone and joins the group it lands in", () => {
    const s = store("HvHv");
    moveWithGroup(s, 1, 3, open);
    expect(order(s)).toBe("0,2,3,1");
    expect(waveGroups(s.waves).head[3]).toBe(1);
  });

  test("dropped below a folded head, a variant goes after the group it hides", () => {
    const s = store("HvHvvH");
    moveWithGroup(s, 1, 2, shut);
    expect(order(s)).toBe("0,2,3,4,1,5");
    const shown = store("HvHvvH");
    moveWithGroup(shown, 1, 2, open);
    expect(order(shown)).toBe("0,2,1,3,4,5");
  });

  test("carried to the top, a variant stops being one", () => {
    const s = store("HHv");
    moveWithGroup(s, 2, 0, open);
    expect(s.waves[0]?.variant).toBeUndefined();
  });

  test("the open wave stays open", () => {
    const s = store("HvH", 2);
    moveWithGroup(s, 0, 2, open);
    expect(s.waves[s.index]?.id).toBe("w2");
  });
});

describe("bossStretches", () => {
  test("each boss counts the waves since the last, and the groups among them", () => {
    const stretches = bossStretches(waves("HvvHBBHv"));
    expect(stretches.get(4)).toEqual({ waves: 4, groups: 2 });
    expect(stretches.has(5)).toBe(false);
    expect(stretches.get(7)).toEqual({ waves: 2, groups: 1 });
  });
});

describe("the list", () => {
  function draw(s: Store, folded: boolean): FakeEl {
    const list = new FakeEl();
    const dom = installDom({ ids: { waveList: list } });
    try {
      renderRows(
        list as unknown as HTMLElement,
        s,
        () => true,
        () => {},
        undefined,
        { folded: () => folded, toggle: () => {} },
      );
    } finally {
      dom.restore();
    }
    return list;
  }

  test("a folded group draws its head alone, with how many it hides", () => {
    const list = draw(store("HvvHB"), true);
    expect(list.children.length).toBe(3);
    const fold = list.children[0]!.children.find((c) => c.classList.contains("fold"));
    expect(fold?.textContent).toBe("▸ 2");
  });

  test("the wave being edited is drawn though its group is folded", () => {
    const list = draw(store("HvvHB", 2), true);
    expect(list.children.length).toBe(4);
    expect(list.children[1]!.classList.contains("variant")).toBe(true);
  });

  test("an open group draws every variant stepped in", () => {
    const list = draw(store("HvvHB"), false);
    expect(list.children.length).toBe(5);
    expect(list.children[4]!.dataset.stretch).toBe("4 waves · 2 new");
  });
});
