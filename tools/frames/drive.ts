import type { Page } from "playwright-core";
import type { Sent } from "./report.js";
import type { PressSpec } from "./spec.js";
import type { Fired } from "./until.js";

/**
 * **The four verbs a capture drives the page with**, and the rules each of
 * them carries.
 *
 * Cut out of `capture.ts` when the absolute-tick fix took that file past its
 * 250-line limit, along the seam it already had: everything here is one
 * `page.evaluate` and a rule about *when* it may be sent, and nothing here
 * knows about frames, crops or files. The loop that spends them is next door.
 */
export interface Driver {
  /**
   * `n` steps of whichever clock this capture is on — the world's, or a
   * rehearsal's painted one when `filmDt` was given.
   *
   * `until` is a `SimEvent.type` to stop early on: the run ends on the tick
   * that event fires and the tick comes back, or the whole `n` is spent and
   * `null` does (`until.ts`). Every event of every tick stepped is collected
   * either way, which is what makes a miss answerable.
   */
  advance(n: number, until?: string): Promise<number | null>;
  /** One press into the page, with its `pick` resolved where the field can be
   * seen and a tap held back until the beat turns over. */
  press(one: PressSpec): Promise<void>;
  /** The simulation's own clock, right now. */
  tick(): Promise<number>;
  /** Every event this driver has heard, in the order the ticks ran. */
  heard(): readonly Fired[];
  /** Every press sent, with whether the tick it landed on would have heard it
   * (`pressNote`). */
  sent(): readonly Sent[];
}

/**
 * The most simulated time one paint is told has passed, in seconds — the
 * game's own clamp (`apps/game/src/frame.ts`), called by value rather than
 * imported because this file is evaluated inside the page.
 */
const FRAME_CAP = 0.05;

/**
 * Steps of the world's clock, **painted as the game paints them.**
 *
 * Until 10 September 2026 this stepped `n` ticks and painted nothing, and the
 * frame was taken afterwards with a sixtieth of a second on the render clock.
 * Everything drawn off that clock — `Effects`, which age by the `dt` a paint
 * hands them and not by ticks — therefore stood at its first frame however far
 * the world had gone: a rock that landed six simulated seconds ago was still
 * lodged in the skin with its crater covered, and five strips of `--wave 12
 * --seat p2` across a thousand ticks all came back that way. The lane that met
 * it spent the afternoon looking for a wave where rocks *do* breach.
 *
 * So the world is stepped in runs no longer than the game's own frame cap and
 * painted once per run for exactly the time it advanced — which is what
 * `frame.ts`'s loop does with a real clock. A burst fired on the last tick gets
 * one frame of ageing, as it would in play, so a `--stride 0` strip still
 * starts on its first frame. On a rehearsal (`filmDt` given) the paint *is*
 * the clock and nothing here changes.
 */
export function makeDriver(page: Page, filmDt: number | undefined): Driver {
  const log: Fired[] = [];
  const pressed: Sent[] = [];
  const advance = async (n: number, until?: string): Promise<number | null> => {
    const said = await page.evaluate(
      ([count, dt, cap, want]) => {
        const ns = window.neonSpore;
        if (!ns) throw new Error("window.neonSpore missing mid-capture");
        const heard: { tick: number; type: string; detail?: string }[] = [];
        // **What the event said about itself, not only that it happened.**
        // Half the events in this game name a socket, a column or an id that
        // the seeded `Rng` picked, and a capture that has to aim a handle at
        // one of them cannot read it off `type@tick` (`until.ts`). Scalars
        // only: a field holding a list or a shape is the event carrying state
        // rather than naming a thing, and it belongs in a probe.
        const detailOf = (event: Record<string, unknown>): string | undefined => {
          const said: string[] = [];
          for (const key of Object.keys(event)) {
            if (key === "type") continue;
            const v = event[key];
            const kind = typeof v;
            if (kind !== "number" && kind !== "string" && kind !== "boolean") continue;
            said.push(`${key}=${String(v)}`);
          }
          return said.length > 0 ? said.join(" ") : undefined;
        };
        if (dt !== undefined) {
          for (let i = 0; i < (count as number); i++) ns.paint(dt as number);
          return { heard, at: null as number | null };
        }
        const tickHz = ns.world.cfg?.tickHz ?? 120;
        const run = Math.max(1, Math.floor((cap as number) * tickHz));
        let at: number | null = null;
        for (let left = count as number; left > 0 && at === null; left -= run) {
          const ticks = Math.min(run, left);
          // **One tick at a time, painted in runs.** `ns.advance(k)` is k
          // steps of the same loop, so splitting it changes nothing about the
          // simulation — but `world.events` is cleared at the top of every
          // step, so a run of six asked afterwards has five ticks' worth of
          // events already thrown away. The paint still covers the whole run,
          // which is what keeps a capture's frame clock the game's own.
          let stepped = 0;
          for (let i = 0; i < ticks && at === null; i++) {
            ns.advance(1);
            stepped++;
            for (const event of ns.world.events) {
              const type = (event as { type?: unknown }).type;
              if (typeof type !== "string") continue;
              heard.push({
                tick: ns.world.tick,
                type,
                detail: detailOf(event as Record<string, unknown>),
              });
              if (type === want) at = ns.world.tick;
            }
          }
          ns.paint(stepped / tickHz);
        }
        return { heard, at };
      },
      [n, filmDt, FRAME_CAP, until] as [number, number | undefined, number, string | undefined],
    );
    log.push(...said.heard);
    return said.at;
  };

  /** Advance to the next beat. The beat *counter* and not the tick one: they
   * are not the same axis, an opening advancing one and not the other
   * (`docs/queue.md`). */
  const toBeat = async (): Promise<void> => {
    const beat = (): Promise<number> => page.evaluate(() => window.neonSpore?.world.beat ?? 0);
    const was = await beat();
    for (let i = 0; i < 200; i++) {
      if ((await beat()) !== was) return;
      await advance(1);
    }
    throw new Error("--press tap: no beat arrived in two hundred ticks");
  };

  /**
   * Send one press into the page, refusing a build too old to take it. A
   * `pick`ed press has its id filled in **here**, where the field can be seen:
   * `world.nextId` is dealt as bodies arrive and a caller outside the page has
   * no way to know what it has reached, so a grip written as a number was a
   * guess dropped in silence when it is wrong (`PICKS` in `press.ts`).
   */
  const press = async (one: PressSpec): Promise<void> => {
    // **A tap waits for the beat**, so its tick means *the beat at or after
    // this one*. Every other press is answered by what is under it; this one
    // by when it arrived — and the tick line a capture walks does not start on
    // a beat, since clearing the opening leaves it wherever it finished, so a
    // tap written on a boundary landed between two and was refused.
    if (one.command.kind === "tap") await toBeat();
    const said = await page.evaluate((sent) => {
      const ns = window.neonSpore;
      if (!ns) throw new Error("window.neonSpore missing before a press");
      if (!ns.send) {
        throw new Error(
          "this build has no window.neonSpore.send — --press needs a commit at or after the " +
            "one that added it, and a before/after pair cannot press anything on its parent",
        );
      }
      let command = sent.command;
      if (sent.pick) {
        const bodies = ns.world.creatures.filter((c) => typeof c.id === "number");
        const chosen =
          sent.pick === "first"
            ? bodies[0]
            : bodies.reduce<(typeof bodies)[number] | undefined>(
                (best, c) => (best === undefined || (c.row ?? -1) > (best.row ?? -1) ? c : best),
                undefined,
              );
        if (!chosen) {
          throw new Error(
            `--press ${sent.pick}: the field is empty at tick ${ns.world.tick}. A body has to ` +
              "have arrived before a hand can take hold of it — press later, or --ticks further in",
          );
        }
        command = { ...command, id: chosen.id };
      }
      // **Asked before it is sent**, of two copies of the world: a press the
      // round refuses changes nothing and photographs as no press at all, so
      // the run says so rather than leaving the picture to (`handle-press.ts`).
      // It is asked behind whatever this tick has already queued, so a hold's
      // lift is judged with its grab and carry applied, not alone.
      // Null on a build from before the question existed.
      const heard = ns.wouldHear ? ns.wouldHear(sent.player, command) : null;
      ns.send(sent.player, command);
      return { tick: ns.world.tick, heard };
    }, one);
    pressed.push({ ...said, player: one.player, kind: one.command.kind });
  };

  const tick = (): Promise<number> => page.evaluate(() => window.neonSpore?.world.tick ?? 0);

  return { advance, press, tick, heard: () => log, sent: () => pressed };
}
