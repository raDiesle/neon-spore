import type { Circle } from "@neon-spore/render";
import { type SimEvent, setBossRound, step, type World } from "@neon-spore/sim";
import type { AutoMode, GameAutopilot } from "./autopilot.js";
import { pressVerbs } from "./handle-press.js";
import type { InputBuffer } from "./input.js";
import { runPerfPage } from "./perf-page.js";
import type { PerfHandle } from "./perf-sweep.js";

/**
 * `window.neonSpore` — the handle a headless check drives the game by.
 *
 * A hidden tab suspends `requestAnimationFrame`, so a check that wants a
 * picture has to be able to ask for one, and a check that wants a hundred
 * ticks cannot wait for a hundred frames to go past. Both verbs are here, and
 * neither of them is on the loop.
 *
 * It moved out of `main.ts` when that file hit the 250-line ceiling —
 * CLAUDE.md says split rather than grow. It is a good seam: everything below
 * is *about being driven from outside*, which is a different subject from
 * wiring the game up, and `tools/frames` and the sandbox's own browser checks
 * are the only callers.
 */
export interface HandleParts {
  world: World;
  buffer: InputBuffer;
  jumpToWave: (wave: number) => void;
  /**
   * The field's own two answers to a caller with no thumbs: a guide waits for
   * two of them, and a grab circle is where one would go (`field-input.ts`).
   */
  input: { dismissBriefing: () => void; shipGrab: (on: "cannon" | "shield") => Circle };
  /** A point in the frame, as the `clientX`/`clientY` a pointer would carry
   * to land on it (`viewport.ts`). */
  toClient: (p: { x: number; y: number }) => { clientX: number; clientY: number };
  /** Runs the wave-opening clock, and folds any events a tick produced. */
  progression: { tickOpening: (seconds: number) => void; handle: (e: SimEvent[]) => void };
  /**
   * The frame loop's two verbs: where a tick's events are collected for the
   * next frame, and the frame itself. One object rather than two callbacks,
   * for the reason `renderer` below is one — `startFrames` returns exactly
   * this pair and `main.ts` was spelling both out.
   */
  frames: {
    collect(events: readonly SimEvent[]): void;
    paint(dt: number): void;
  };
  /**
   * The three answers that are **render state and no part of the world**: this
   * page of a rehearsal played again, whether it has played out, and whether
   * the wave is still arriving.
   *
   * Passed as the renderer rather than as three callbacks, because they are
   * one fact about one object and were three lines in `main.ts` for it.
   * Structural, so nothing here has to import a renderer to name one.
   */
  renderer: {
    replayGuide(): void;
    /** Whether that page has played out and is standing on its last frame. */
    readonly guideFinished: boolean;
    /** A frame-clock animation over the whole field, which a caller stepping
     * ticks can neither see nor wait out. */
    readonly launching: boolean;
  };
  /** AUTO, the same one the TEST panel switches (`autopilot.ts`), so a caller
   * stepping ticks gets the hands a thumb-less phone plays with. */
  auto: Pick<GameAutopilot, "setMode" | "press">;
}

/**
 * Installs the handle and hands it back, so a caller inside the app can drive
 * the game by the same verbs an outside one does — `?perf=1` sweeps every wave
 * through `advance` and `paint` exactly as `tools/perf` does over a wire
 * (`perf-sweep.ts`).
 */
export function installTestingHandle(parts: HandleParts): PerfHandle {
  const { world, buffer, progression } = parts;
  const handle = {
    world,
    jumpToWave: parts.jumpToWave,
    dismissBriefing: parts.input.dismissBriefing,
    /**
     * Where a swelling on the ship is, as a place on the **screen** a real
     * pointer can be put down: the grab circle's centre in `clientX`/`clientY`
     * and its radius in the same pixels.
     *
     * The one thing on the screen `send` cannot reach is the ring under this
     * phone's own finger (`render/ship-hand.ts`): it is the input layer's, not
     * the world's, so no command lands it. Rather than expose the ring's
     * setter — a picture taken by writing a field is a picture of a state the
     * game cannot reach, which is `send`'s rule too — this answers *where to
     * press*, and `bun run frames --hand` presses there with the browser's own
     * mouse, through the same listeners a thumb goes through. Flat hull or
     * THE WELL, by which one this screen is drawing.
     */
    shipGrab(on: "cannon" | "shield") {
      const c = parts.input.shipGrab(on);
      const { clientX, clientY } = parts.toClient({ x: c.x, y: c.y });
      const { clientX: edge } = parts.toClient({ x: c.x + c.r, y: c.y });
      return { clientX, clientY, r: edge - clientX };
    },
    /**
     * The introduction passes on a timer this world does not read
     * (`briefing.ts` on why), so a headless caller cannot wait it out and
     * cannot press it away either — it is explicitly not the guide's dismiss.
     * This drives the same clock `progression.tickOpening` drives every frame,
     * in one jump: pass a small number to sit on the introduction on purpose
     * and photograph it mid-count, or enough to exhaust `INTRO_SECONDS` to let
     * it go. Either way it only pushes the acks into the buffer — `advance`
     * still has to run a tick for them to land, exactly as a dismissed guide
     * already does.
     */
    advanceOpening(seconds: number) {
      progression.tickOpening(seconds);
    },
    // `send`, and `wouldHear` to ask first (`handle-press.ts`).
    ...pressVerbs(world, buffer),
    /**
     * Stand the installed boss on a numbered round.
     *
     * `jumpToWave` puts one on the field at its opening round and the only
     * thing that moves it on is *winning*, which nothing headless can do — so
     * only the first of THE MAZE's five sheets could ever be photographed, and
     * the first sheet is the one with a single way in. SNAKE, PINBALL and THE
     * MIRROR had the same hole.
     *
     * It goes through the fight's own way into a round (`setBossRound`), so
     * what is reached here is the round the pair would have reached by winning
     * rather than a field with a number written into it. False for a boss with
     * no rounds, and for no boss at all, so a caller is told rather than shown
     * an unchanged picture.
     */
    bossRound(round: number) {
      return setBossRound(world, round);
    },
    /**
     * Switch AUTO for the ticks `advance` steps. `advance` is not the frame
     * loop, so AUTO pressed nothing under it and a boss's receipt — a run of
     * correct presses deep — could not be photographed (`bun run frames
     * --auto`). Off is every capture from before it, and presses nothing.
     */
    setAuto(mode: AutoMode) {
      parts.auto.setMode(mode);
    },
    advance(ticks: number) {
      for (let i = 0; i < ticks; i++) {
        // Where the loop presses it: after the keys, before the tick drains.
        parts.auto.press(world, buffer);
        step(world, buffer.drain(world.tick));
        if (world.events.length) {
          parts.frames.collect(world.events);
          progression.handle(world.events);
        }
      }
    },
    /**
     * One frame, and **how much time it is worth**.
     *
     * The default is a sixtieth, which is what every caller wanted while the
     * only things on the frame clock were fades and shimmer: paint enough of
     * them and the words arrive. A **rehearsal** is different in kind — it is
     * a run of the simulation drawn off this same clock, one tick per
     * `dt * tickHz` (`render/guide-play.ts`) — so a caller photographing a
     * film needs to say how far to move it, in the film's own ticks, rather
     * than count sixtieths and hope.
     *
     * It is also the difference between a strip of a page and four pictures of
     * its last frame. A page plays once and then *holds*, and a settle counted
     * in sixtieths ran a whole second of film before the first photograph — so
     * `--opening guide --frames 6 --stride 30` came back as six copies of
     * whatever the page ended on. With a dt and `replayGuide` below, a strip is
     * taken from the page's own first tick, which is the film.
     */
    paint: (dt = 1 / 60) => parts.frames.paint(dt),
    /**
     * This page of the rehearsal again, from its first tick — the middle
     * button on the guide's own bar (`render/guide-nav.ts`).
     *
     * A page that has played out stands on its last frame and nothing on the
     * frame clock moves it, so this is the only way back to a known point in a
     * film. `SceneRun.restart` rebuilds the rehearsal's world and runs the
     * ticks before this page silently, which is why what it opens on is what
     * those ticks really left rather than a pose built to look like one.
     */
    replayGuide: () => parts.renderer.replayGuide(),
    /**
     * Whether the page showing has played out and is holding on its last
     * frame.
     *
     * The one thing about a film a camera cannot see and an eye can. A held
     * page is the same picture however many frames are taken of it, so a tool
     * asked for a strip has no way to tell "the film is over" from "this page
     * is a still" — and the answer decides whether what it wrote is a strip or
     * six copies of one frame (`tools/frames/run.ts`).
     */
    guideFinished: () => parts.renderer.guideFinished,
    /**
     * Whether the wave is still arriving.
     *
     * The rings a crossed gate throws are drawn off the *frame* clock, so a
     * caller that steps the simulation and paints once per picture advances
     * them by a sixtieth of a second per photograph and never gets past them:
     * `bun run frames` took every capture it ever took through them, still
     * there 2500 ticks into a wave. Painting is what moves them, and this is
     * how a caller knows when to stop (`tools/frames/launch.ts`).
     */
    launching: () => parts.renderer.launching,
  };
  (window as unknown as { neonSpore: unknown }).neonSpore = handle;
  return handle;
}

/**
 * The handle, installed, and the one thing inside the app that drives it.
 *
 * `?perf=1` sweeps every wave through `advance` and `paint` exactly as
 * `tools/perf` does over a wire, on the device itself rather than on a
 * throttled desktop standing in for one (`perf-page.ts`). It is the only
 * caller of `installTestingHandle`'s return value, so the two are one call
 * here rather than two statements and a name in `main.ts` — which is a file
 * about wiring the game up and was over its ceiling for holding this.
 */
export function bindTesting(parts: HandleParts, href: string): void {
  void runPerfPage(href, installTestingHandle(parts));
}
