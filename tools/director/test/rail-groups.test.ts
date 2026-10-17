import { describe, expect, test } from "bun:test";
import type { Wave } from "@neon-spore/content";
import { WAVES, waveIntroduces } from "@neon-spore/content";
import { introducedBrush } from "../src/brush-intro.js";
import { dropWave, waveGroups } from "../src/rail-groups.js";
import { renderRows } from "../src/rail-list.js";
import type { Store } from "../src/state.js";
import { FakeEl, installDom } from "./fake-dom.js";

/**
 * Waves folded under the wave a drag put them in (`rail-groups.ts`): who a
 * variant belongs to, where a dragged wave or group lands and whether it is a
 * child there, and what a folded group hides.
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
    const g = waveGroups(waves("HvvHvH"));
    expect(g.head).toEqual([-1, 0, 0, -1, 3, -1]);
    expect(g.size).toEqual([2, 0, 0, 1, 0, 0]);
  });

  test("a boss closes the group above it, with no flag to say so", () => {
    const g = waveGroups(waves("HvvBHB"));
    expect(g.head).toEqual([-1, 0, 0, 0, -1, 4]);
    expect(g.size).toEqual([3, 0, 0, 0, 1, 0]);
  });

  test("the first wave is a head whatever it says, a boss too", () => {
    const list = waves("BvH");
    list[0]!.variant = true;
    expect(waveGroups(list).head).toEqual([-1, 0, -1]);
  });

  test("the shipped campaign holds no variant the rail would ignore", () => {
    for (const [i, wave] of WAVES.entries()) {
      if (!wave.variant) continue;
      expect(i).toBeGreaterThan(0);
      expect(wave.boss).toBeUndefined();
    }
  });
});

describe("dropWave", () => {
  const open = (): boolean => false;
  const shut = (): boolean => true;
  const pattern = (s: Store): string =>
    waveGroups(s.waves)
      .head.map((h) => (h === -1 ? "H" : "v"))
      .join("");

  test("dropped into a wave, a wave becomes its child at the end of its group", () => {
    const s = store("HvHH");
    dropWave(s, 3, 0, "into", shut);
    expect(order(s)).toBe("0,1,3,2");
    expect(pattern(s)).toBe("HvvH");
  });

  test("dropped into a child, a wave joins that child's group", () => {
    const s = store("HHvv");
    dropWave(s, 0, 2, "into", open);
    expect(order(s)).toBe("1,2,3,0");
    expect(pattern(s)).toBe("Hvvv");
  });

  test("a head dropped into another brings its children, all children there", () => {
    const s = store("HHvH");
    dropWave(s, 1, 3, "into", shut);
    expect(order(s)).toBe("0,3,1,2");
    expect(pattern(s)).toBe("HHvv");
  });

  test("a boss dropped into a group closes it, and carries no flag", () => {
    const s = store("HvHB");
    dropWave(s, 3, 0, "into", shut);
    expect(order(s)).toBe("0,1,3,2");
    expect(pattern(s)).toBe("HvvH");
    expect(s.waves[2]?.variant).toBeUndefined();
  });

  test("a wave is never put into itself", () => {
    const s = store("HHv");
    dropWave(s, 1, 2, "into", open);
    expect(order(s)).toBe("0,1,2");
    expect(pattern(s)).toBe("HHv");
  });

  test("dropped on an edge between two groups, a child stands on its own", () => {
    const s = store("HvvH");
    dropWave(s, 1, 3, "before", open);
    expect(order(s)).toBe("0,2,1,3");
    expect(pattern(s)).toBe("HvHH");
  });

  test("dropped on an edge between two children, a wave is a child there", () => {
    const s = store("HHvv");
    dropWave(s, 0, 2, "after", open);
    expect(order(s)).toBe("1,2,0,3");
    expect(pattern(s)).toBe("Hvvv");
  });

  test("a head carries its group, and below a folded head lands after its group", () => {
    const s = store("HvHvvH");
    dropWave(s, 0, 2, "after", shut);
    expect(order(s)).toBe("2,3,4,0,1,5");
    expect(pattern(s)).toBe("HvvHvH");
  });

  test("a boss dropped on an edge inside a group stays in it", () => {
    const s = store("BHvv");
    dropWave(s, 0, 2, "after", open);
    expect(order(s)).toBe("1,2,0,3");
    expect(pattern(s)).toBe("Hvvv");
    expect(s.waves[2]?.variant).toBeUndefined();
  });

  test("carried to the top, a child stops being one", () => {
    const s = store("HHv");
    dropWave(s, 2, 0, "before", open);
    expect(s.waves[0]?.variant).toBeUndefined();
  });

  test("the open wave stays open", () => {
    const s = store("HvH", 2);
    dropWave(s, 0, 2, "after", open);
    expect(s.waves[s.index]?.id).toBe("w2");
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

  test("a folded group draws its head alone, and no count beside the fold", () => {
    const list = draw(store("HvvHB"), true);
    expect(list.children.length).toBe(2);
    const fold = list.children[0]!.children.find((c) => c.classList.contains("fold"));
    expect(fold?.textContent).toBe("▸");
  });

  test("the wave being edited is drawn though its group is folded", () => {
    const list = draw(store("HvvHB", 2), true);
    expect(list.children.length).toBe(3);
    expect(list.children[1]!.classList.contains("variant")).toBe(true);
  });

  test("an open group draws every variant stepped in, and its boss", () => {
    const list = draw(store("HvvHB"), false);
    expect(list.children.length).toBe(5);
    expect(list.children[2]!.classList.contains("variant")).toBe(true);
    expect(list.children[4]!.classList.contains("variant")).toBe(true);
  });

  test("the lines leave an open head and stop at its last child drawn", () => {
    const list = draw(store("HvvHBH"), false);
    const marked = (c: string) =>
      list.children.flatMap((row, i) => (row.classList.contains(c) ? [i] : []));
    expect(marked("open")).toEqual([0, 3]);
    expect(marked("last")).toEqual([2, 4]);
  });

  test("no row carries a pressure", () => {
    const list = draw(store("HvvHB"), false);
    for (const row of list.children) {
      const button = row.children[0]!;
      expect(button.children.some((c) => c.classList.contains("pressure"))).toBe(false);
    }
  });

  test("a head ends on the brushes it is first to carry, and a variant on none", () => {
    const s: Store = { waves: [...WAVES], index: 0, dirty: false };
    const list = draw(s, false);
    const art = (i: number) =>
      list.children[i]!.children[0]!.children.filter((c) => c.classList.contains("intro-art"));
    let shown = 0;
    for (const [i, wave] of WAVES.entries()) {
      const variant = list.children[i]!.classList.contains("variant");
      const brushes = new Set(
        waveIntroduces(WAVES, i).flatMap((t) => introducedBrush(t, wave) ?? []),
      );
      expect([wave.name, art(i).length]).toEqual([wave.name, variant ? 0 : brushes.size]);
      shown += art(i).length;
    }
    expect(shown).toBeGreaterThan(0);
  });
});
