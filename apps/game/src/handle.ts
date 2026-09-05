import { type Command, type SimEvent, setBossRound, step, type World } from "@neon-spore/sim";
import type { InputBuffer } from "./input.js";

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
  /** A headless check has no thumbs, and a guide waits for two of them. */
  dismissBriefing: () => void;
  /** Runs the wave-opening clock, and folds any events a tick produced. */
  progression: { tickOpening: (seconds: number) => void; handle: (e: SimEvent[]) => void };
  /** Where a frame's events are collected for the next `paint`. */
  collect: (events: readonly SimEvent[]) => void;
  paint: (dt: number) => void;
  /** Whether the wave is still arriving — a frame-clock animation over the
   * whole field, which a caller stepping ticks can neither see nor wait out. */
  launching: () => boolean;
}

export function installTestingHandle(parts: HandleParts): void {
  const { world, buffer, progression } = parts;
  (window as unknown as { neonSpore: unknown }).neonSpore = {
    world,
    jumpToWave: parts.jumpToWave,
    dismissBriefing: parts.dismissBriefing,
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
    /**
     * One press, into the same buffer the canvas pushes to.
     *
     * Without it a headless caller has every verb a *wave* needs and none a
     * **held control** needs, so the four mechanics whose whole picture is a
     * thumb that is down — THE LID's plates parted, THE WARDEN's hatch, THE
     * MAZE's wheel mid-turn, THE LANCE's full lobe — could only ever be
     * photographed released.
     *
     * It goes through the buffer rather than into `world`, and that is the
     * point of it: a picture taken by writing a field is a picture of a state
     * the game cannot reach. `drain(tick)` stamps it on the next tick
     * `advance` runs, exactly as it stamps a finger's, so a `drag` sent here
     * arrives the same way and through the same rules — including the seat
     * check the round does on it.
     */
    send(player: 1 | 2, command: Command) {
      buffer.push(player, command);
    },
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
    advance(ticks: number) {
      for (let i = 0; i < ticks; i++) {
        step(world, buffer.drain(world.tick));
        if (world.events.length) {
          parts.collect(world.events);
          progression.handle(world.events);
        }
      }
    },
    paint: () => parts.paint(1 / 60),
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
    launching: parts.launching,
  };
}
