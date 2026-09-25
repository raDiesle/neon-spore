import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { type SceneId, WAVES, type WaveGuide, waveGuideSteps } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, startWave, type World } from "@neon-spore/sim";
import { drawProsePage } from "../src/guide-prose.js";
import { GuideStage } from "../src/guide-scene.js";
import { computeLayout } from "../src/layout.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * A HOST MAY SAY WHAT GUIDE A WAVE HAS, INSTEAD OF BEING LOOKED UP.
 *
 * `world.wave` is a bare index and it means two different things depending on
 * who is holding the world: for the shipped game it indexes `WAVES`, and for
 * the director it indexes a draft that has not shipped. Until 16 September
 * 2026 the words and the rehearsal were the last things on that stage still
 * read off the list on disk, so typing into the three GUIDE fields changed the
 * fields and nothing else — while the page count beside them, which does come
 * off the draft, counted the pages of the wave being typed. The two could
 * disagree about the same wave.
 *
 * `ViewState.guide` closes it the way `ViewState.controls` closed the panel:
 * unset means *ask `WAVES`*, and a host that knows better says so. `null` is
 * the third answer and the one a fallback would swallow — **this draft has no
 * guide** — which is what an author who has just emptied the fields means.
 */

const CFG = { ...DEFAULT_CONFIG, briefings: true };
const PHONE = { width: 390, height: 844, dpr: 1 };
/** A wave with words to be drawn instead of. */
const WITH_WORDS = WAVES.findIndex((w) => w.guide !== undefined && w.guide.scene === undefined);

beforeAll(installCanvasGlobals);

function guided(waveIndex: number): World {
  const world = createWorld(CFG, 3);
  startWave(world, waveIndex, [], [], null, true, waveGuideSteps(waveIndex));
  return world;
}

/** Every word one page of prose writes. */
function words(world: World, guide?: WaveGuide | null): string[] {
  const { ctx } = stubCanvas();
  ctx.texts = [];
  drawProsePage(ctx as never, computeLayout(PHONE, CFG, "p1"), world, {
    role: "p1",
    page: 0,
    pages: 2,
    guide,
  });
  return (ctx.texts ?? []).map((t) => t.text);
}

const DRAFT: WaveGuide = {
  both: "A SENTENCE NO SHIPPED WAVE CARRIES",
  p1: "PLAYER ONE'S HALF, TYPED",
  p2: "PLAYER TWO'S HALF, TYPED",
};

describe("a stated guide", () => {
  it("has a shipped wave to be different from", () => {
    expect(WITH_WORDS, "no wave carries a guide at all").toBeGreaterThanOrEqual(0);
  });

  it("is drawn instead of the shipped wave's, at the same index", () => {
    const world = guided(WITH_WORDS);
    const said = words(world, DRAFT).join(" ");
    expect(said).toContain("NO SHIPPED WAVE CARRIES");
    expect(words(world).join(" ")).not.toContain("NO SHIPPED WAVE CARRIES");
  });

  it("falls back to the shipped wave when nothing is said", () => {
    const world = guided(WITH_WORDS);
    const shipped = WAVES[WITH_WORDS]?.guide?.both ?? "";
    expect(shipped.length, "the wave picked carries no BOTH block").toBeGreaterThan(0);
    // The block is wrapped to the phone's width, so the whole sentence is not
    // one recorded word — the first of it is enough to tell the two apart.
    const head = shipped.split(" ").slice(0, 3).join(" ");
    expect(words(world).join(" ")).toContain(head);
  });

  it("draws nothing at all when the host says the draft has no guide", () => {
    const world = guided(WITH_WORDS);
    expect(words(world, null)).toEqual([]);
    // And that is not the same as saying nothing, which draws the shipped one.
    expect(words(world).length).toBeGreaterThan(0);
  });
});

describe("a stated guide with a rehearsal", () => {
  const SCENED = WAVES.findIndex((w) => w.guide?.scene !== undefined);

  it("plays the scene the host names, on a wave that ships another", () => {
    expect(SCENED, "no wave carries a rehearsal").toBeGreaterThanOrEqual(0);
    const world = guided(SCENED);
    const stage = new GuideStage();
    stage.update(world, 1 / CFG.tickHz, "p1");
    expect(stage.active, "the shipped wave's own rehearsal did not come up").toBe(true);

    // The same world, told the wave has no guide: the film goes.
    const bare = new GuideStage();
    bare.update(world, 1 / CFG.tickHz, "p1", { guide: null });
    expect(bare.active).toBe(false);
  });

  it("plays the new film when the host swaps one scene for another mid-play", () => {
    const scenes = [...new Set(WAVES.map((w) => w.guide?.scene).filter(Boolean))];
    expect(scenes.length, "only one rehearsal exists to swap between").toBeGreaterThan(1);
    const [mine, other] = scenes as [SceneId, SceneId];
    const world = guided(SCENED);
    const stage = new GuideStage();
    const play = (scene: SceneId): void => {
      stage.update(world, 1 / CFG.tickHz, "p1", { guide: { scene } });
    };
    // Far enough that the first film has run out and is standing on its last
    // frame, which is the state a stale run would be caught in.
    for (let i = 0; i < 4000 && !stage.finished; i++) play(mine);
    expect(stage.finished, "the first rehearsal never played out").toBe(true);
    play(other);
    // The world has not changed and neither has the wave, which is the whole
    // point: a run kept on those two alone would go on standing on the last
    // frame of the film that has just been replaced.
    expect(stage.active).toBe(true);
    expect(stage.finished, "the film outlived the scene it was swapped for").toBe(false);
  });

  it("puts a rehearsal away when the host takes the scene off mid-play", () => {
    const world = guided(SCENED);
    const stage = new GuideStage();
    const scene = WAVES[SCENED]!.guide!.scene!;
    for (let i = 0; i < 30; i++) stage.update(world, 1 / CFG.tickHz, "p1", { guide: { scene } });
    expect(stage.active).toBe(true);
    stage.update(world, 1 / CFG.tickHz, "p1", { guide: { both: "", p1: "", p2: "" } });
    expect(stage.active, "the film outlived the scene that was deleted").toBe(false);
  });
});
