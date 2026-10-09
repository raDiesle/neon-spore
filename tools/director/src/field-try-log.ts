import { Mixer } from "@neon-spore/audio";
import type { ViewRole } from "@neon-spore/render";
import type { Command, SimEvent, World } from "@neon-spore/sim";
import { text } from "./gestures-page.js";

/**
 * **What a hand said, and what the game said back**, under a TRY view
 * (`field-try.ts`): the commands the mouse sent, the events the simulation
 * reported for them — a refusal, a slip, a count — and the sounds the game's
 * own mixer played, which are heard as well as listed unless SOUND is off.
 * Newest first, each with its tick.
 *
 * The owner, 9 October 2026, choosing one look per control: what it does
 * when it refuses, and what it sounds like, are half of how it feels. The
 * mixer is the game's (`@neon-spore/audio`'s `Mixer`, as `apps/game/src/audio.ts`
 * holds it); this only listens to what it plays.
 */

/** Lines kept in each column. */
const KEEP = 8;
/** Said every beat by every wave, so it says nothing about the control. */
const EVERY_BEAT = new Set<SimEvent["type"]>(["beat"]);

function say(c: Command): string {
  const { kind, ...rest } = c as Command & Record<string, unknown>;
  const parts = Object.entries(rest).map(([k, v]) => `${k} ${String(v)}`);
  return [kind, ...parts].join(" · ");
}

interface Line {
  line: string;
  tick: number;
  times: number;
}

interface Column {
  el: HTMLElement;
  lines: Line[];
  last: Line | null;
}

/** The game's mixer, with an ear on it. */
class HeardMixer extends Mixer {
  constructor(private readonly heard: (id: string) => void) {
    super();
  }
  override play(id: string, pan?: number, pitch?: number, gain = 1, delay = 0): void {
    this.heard(id);
    super.play(id, pan, pitch, gain, delay);
  }
}

export class TryLog {
  readonly element: HTMLElement;
  private readonly columns: Record<"sent" | "said" | "heard", Column>;
  private readonly mixer: HeardMixer;
  private tick = 0;

  constructor() {
    this.element = document.createElement("div");
    this.element.className = "try-log";
    const column = (title: string) => {
      const box = document.createElement("div");
      box.appendChild(text("h5", title));
      const el = text("pre", "");
      box.appendChild(el);
      this.element.appendChild(box);
      return { el, lines: [], last: null };
    };
    this.columns = {
      sent: column("THE HAND SENT"),
      said: column("THE GAME SAID"),
      heard: column("THE GAME PLAYED"),
    };
    this.mixer = new HeardMixer((id) => this.add("heard", id));
  }

  /** A line said again straight after itself — a drag says one every tick —
   * is counted on the line it repeats rather than pushing the others out. */
  private add(which: keyof TryLog["columns"], line: string): void {
    const c = this.columns[which];
    if (c.last?.line === line) c.last.times++;
    else {
      c.last = { line, tick: this.tick, times: 1 };
      c.lines.unshift(c.last);
      c.lines.length = Math.min(c.lines.length, KEEP);
    }
    c.el.textContent = c.lines
      .map((l) => `${l.tick}  ${l.line}${l.times > 1 ? `  ×${l.times}` : ""}`)
      .join("\n");
  }

  sent(player: 1 | 2, command: Command): void {
    this.add("sent", `P${player} ${say(command)}`);
  }

  /** One drawn frame: what the simulation reported since the last, sounded
   * as the drawn screen's phone would sound it — a cue only one seat hears
   * (`Mixer.setSeat`) is silent on TEST's screen, as on an unseated phone. */
  frame(world: World, events: readonly SimEvent[], role: ViewRole): void {
    this.tick = world.tick;
    this.mixer.setSeat(role === "p1" ? 1 : role === "p2" ? 2 : null);
    for (const e of events) if (!EVERY_BEAT.has(e.type)) this.add("said", e.type);
    this.mixer.frame(world, events);
  }

  /** A press is what lets a browser play sound at all. */
  unlock(): void {
    this.mixer.unlock();
  }

  setSound(on: boolean): void {
    this.mixer.setMuted(!on);
  }

  /** A fresh world: the mixer's memory of the last one is forgotten. */
  reset(): void {
    this.mixer.reset();
    for (const c of Object.values(this.columns)) {
      c.lines = [];
      c.last = null;
      c.el.textContent = "";
    }
  }

  dispose(): void {
    this.mixer.dispose();
  }
}
