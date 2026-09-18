import { afterEach, describe, expect, test } from "bun:test";
import { type BossType, WAVES } from "@neon-spore/content";
import { bindBossTypeField } from "../src/boss-type-field.js";
import { FakeEl, installDom } from "./fake-dom.js";

/**
 * The BOSS TYPE row: what the director shows for a wave that carries a boss,
 * and what it shows for the eighty-nine that do not.
 *
 * The owner asked to see the type of boss for every boss wave (18 September
 * 2026), so the two halves that matter are that a boss wave's own answer comes
 * back into the picker — a row that always read NORMAL would be a field
 * nobody could trust — and that a wave with no boss has no row at all, because
 * `Wave.bossType` exists only on a wave with a boss and `waves.test.ts` holds
 * both directions.
 */

let undo: (() => void) | null = null;

afterEach(() => {
  undo?.();
  undo = null;
});

function mounted(): FakeEl {
  const mount = new FakeEl();
  const dom = installDom();
  undo = () => dom.restore();
  return mount;
}

const picker = (mount: FakeEl): FakeEl => {
  const found = mount.children.find((c) => c.id === "fBossType");
  if (!found) throw new Error("no picker was built");
  return found;
};

const SPECIAL = WAVES.find((w) => w.bossType === "special");
const NORMAL = WAVES.find((w) => w.bossType === "normal");
const NEITHER = WAVES.find((w) => !w.boss);

describe("the BOSS TYPE row", () => {
  test("offers both kinds and nothing else", () => {
    const mount = mounted();
    bindBossTypeField(mount as unknown as HTMLElement);
    expect(
      picker(mount)
        .children.map((o) => o.value)
        .sort(),
    ).toEqual(["normal", "special"]);
  });

  test("shows each boss wave its own answer", () => {
    const mount = mounted();
    const field = bindBossTypeField(mount as unknown as HTMLElement);
    for (const wave of [SPECIAL, NORMAL]) {
      expect(wave, "no wave of one of the two kinds").toBeDefined();
      field.render(wave);
      expect(mount.hidden, `${wave?.name}: the row is hidden on a boss wave`).toBe(false);
      expect(picker(mount).value, wave?.name).toBe(wave?.bossType as string);
    }
  });

  test("is not drawn at all on a wave with no boss", () => {
    const mount = mounted();
    const field = bindBossTypeField(mount as unknown as HTMLElement);
    expect(NEITHER, "every wave carries a boss").toBeDefined();
    field.render(NEITHER);
    expect(mount.hidden).toBe(true);
  });

  test("hands the picked kind back, once, as the author picks it", () => {
    const mount = mounted();
    const field = bindBossTypeField(mount as unknown as HTMLElement);
    const said: BossType[] = [];
    field.onChange((type) => said.push(type));
    field.render(SPECIAL);
    picker(mount).value = "normal";
    picker(mount).fire("change");
    expect(said).toEqual(["normal"]);
  });
});
