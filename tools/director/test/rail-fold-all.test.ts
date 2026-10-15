import { expect, test } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { bindRail } from "../src/rail.js";
import { FakeEl, installDom } from "./fake-dom.js";

/** OPEN ALL draws every wave; FOLD ALL draws the heads alone again. */
test("OPEN ALL opens every group and FOLD ALL folds them", () => {
  const list = new FakeEl();
  const host = new FakeEl();
  const dom = installDom({
    ids: {
      waveList: list,
      waveFilter: new FakeEl(),
      waveFilterNote: new FakeEl(),
      waveFoldAll: host,
    },
  });
  try {
    bindRail(
      { waves: WAVES.map((w) => ({ ...w })), index: 0, dirty: false },
      () => {},
      () => {},
    );
    const [open, fold] = host.children;
    const heads = WAVES.filter((w) => !w.variant).length;
    expect(heads).toBeLessThan(WAVES.length);
    expect(list.children.length).toBe(heads);
    open?.click();
    expect(list.children.length).toBe(WAVES.length);
    fold?.click();
    expect(list.children.length).toBe(heads);
  } finally {
    dom.restore();
  }
});
