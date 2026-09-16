import { afterEach, describe, expect, test } from "bun:test";
import { guideScene, WAVES } from "@neon-spore/content";
import { bindSceneNote } from "../src/guide-scene-note.js";
import { FakeEl, installDom } from "./fake-dom.js";

/**
 * What the GUIDE panel says about a wave whose guide plays a rehearsal.
 *
 * A guide with a scene never draws its three paragraphs — `render/briefing.ts`
 * hands the whole stage to the film — so a panel showing only those fields was
 * showing a reader the half the pair never meets and nothing about the four
 * pages they do. FIRST STEP is the case that found it.
 *
 * The captions are read off the scene catalogue rather than written here, so
 * an edit to a film moves this with it; what is asserted is that they arrive,
 * in order, with the seat each is written to.
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

/** Every line the note writes, flattened. */
function lines(mount: FakeEl): string[] {
  const out: string[] = [];
  const walk = (el: FakeEl): void => {
    if (el.children.length === 0) {
      if (el.textContent !== "") out.push(el.textContent);
      return;
    }
    for (const kid of el.children) walk(kid);
  };
  walk(mount);
  return out;
}

const SCENED = WAVES.find((w) => w.guide?.scene !== undefined);

describe("the rehearsal note over the GUIDE fields", () => {
  test("there is a wave whose guide plays a film", () => {
    expect(SCENED?.guide?.scene, "no wave names a scene at all").toBeDefined();
  });

  test("says the scene's name and how many pages of film it is", () => {
    const mount = mounted();
    const note = bindSceneNote(mount as unknown as HTMLElement);
    const id = SCENED?.guide?.scene;
    note.render(id);
    const said = lines(mount);
    const pages = guideScene(id as never).steps.length;
    expect(said[0]).toContain(id as string);
    expect(said[0]).toContain(`${pages} page`);
  });

  test("lists every page's caption, in order, with the seat it is written to", () => {
    const mount = mounted();
    const note = bindSceneNote(mount as unknown as HTMLElement);
    const id = SCENED?.guide?.scene;
    note.render(id);
    const steps = guideScene(id as never).steps;
    expect(lines(mount).slice(1)).toEqual(steps.map((s) => `P${s.seat} · ${s.text}`));
  });

  test("shows nothing at all for a wave that rehearses nothing", () => {
    const mount = mounted();
    const note = bindSceneNote(mount as unknown as HTMLElement);
    note.render(SCENED?.guide?.scene);
    note.render(undefined);
    // The box is hidden and emptied rather than left holding the last wave's
    // pages: a panel that keeps a stale list is the fault this closes, one
    // wave along.
    expect(lines(mount)).toEqual([]);
    const box = mount.children[0] as FakeEl;
    expect(box.hidden).toBe(true);
  });

  test("says so rather than throwing when the act file names no such scene", () => {
    const mount = mounted();
    const note = bindSceneNote(mount as unknown as HTMLElement);
    note.render("noSuchRehearsal" as never);
    expect(lines(mount)[0]).toContain("no scene of that name");
  });

  test("is a no-op without a mount, the way every binder here is", () => {
    expect(() => bindSceneNote(null).render(SCENED?.guide?.scene)).not.toThrow();
  });
});
