import { coverPage } from "./cover.js";
import { placeLab } from "./session.js";

/**
 * **Where a lab stands** — THE PULL LAB, THE HOLD LAB and THE COMBO LAB
 * (`pull-lab.ts`, `hold-lab.ts`, `combo-lab.ts`) keep their bar, their
 * canvas and their rule; this is the rest: putting one up, running its
 * frames, and taking it down.
 *
 * A lab stands **on CONTROLS › ON THE FIELD**, a card in the gesture grid
 * beside the generic gesture it is the bare form of (`field-action-cards.ts`)
 * — the owner, 12 October 2026: *show all labs not on a separate page, but
 * directly on the "on the field" related page, right next to the generic
 * gesture explanation card*. There it draws only while some of it is on the
 * screen, writes nothing into the URL, and has no ✕: the page is its place.
 *
 * Without a `host` it is the window over everything it was before — one at a
 * time, the page under it hidden (`cover.ts`), shut by ✕ or Escape, and kept
 * in the URL (`place.ts`'s `lab`) so `bun run shot` can photograph it.
 */

export interface LabParts {
  bar: HTMLElement;
  like: HTMLElement;
  room: HTMLElement;
  /** Cut the canvas to its room, again on every change of the room's size. */
  fit(): void;
  /** One frame; called once a display frame while the lab can be seen. */
  frame(now: number): void;
  /** Anything the lab holds beyond its elements, let go when it is shut. */
  dispose?(): void;
}

export interface LabShell {
  shade: HTMLElement;
  /** Aborted when the lab is shut: its listeners are added under it. */
  signal: AbortSignal;
  /** Where the lab is, into the URL — only the window over everything has a place. */
  place(lab: { shape: string; sheet: boolean } | null): void;
  /** Puts the lab up and starts its frames. */
  mount(parts: LabParts): void;
  shut(): void;
}

/** The window over everything, shut by the next one — there is only ever one. */
let shutOpen: (() => void) | null = null;

export function labShell(host?: HTMLElement): LabShell {
  if (!host) shutOpen?.();
  const shade = document.createElement("div");
  shade.className = host ? "pull-lab lab-inline" : "pic-zoom try pull-lab";
  const life = new AbortController();
  let undo = (): void => {};
  const shut = (): void => {
    if (life.signal.aborted) return;
    life.abort();
    undo();
  };

  const mount = (p: LabParts): void => {
    shade.append(p.bar, p.like, p.room);
    // The readout takes a line more or less as it changes: the field fits what is left.
    const resized = new ResizeObserver(p.fit);
    let seen = !host;
    let queued = false;
    const loop = (now: number): void => {
      queued = false;
      if (life.signal.aborted || !seen) return;
      p.frame(now);
      queued = true;
      requestAnimationFrame(loop);
    };
    const go = (): void => {
      if (queued || !seen || life.signal.aborted) return;
      queued = true;
      requestAnimationFrame(loop);
    };
    if (host) {
      host.appendChild(shade);
      const watch = new IntersectionObserver(([entry]) => {
        seen = entry?.isIntersecting ?? false;
        go();
      });
      watch.observe(shade);
      undo = () => {
        watch.disconnect();
        resized.disconnect();
        p.dispose?.();
        shade.remove();
      };
    } else {
      // Caught on the way down and stopped: a sheet under the lab closes on
      // Escape too (`session.ts`), and one press should shut only the lab.
      const onKey = (e: KeyboardEvent): void => {
        if (e.key !== "Escape") return;
        e.stopPropagation();
        shut();
      };
      document.addEventListener("keydown", onKey, { capture: true });
      document.body.appendChild(shade);
      const uncover = coverPage(shade);
      shutOpen = shut;
      undo = () => {
        shutOpen = null;
        placeLab(null);
        document.removeEventListener("keydown", onKey, { capture: true });
        resized.disconnect();
        p.dispose?.();
        shade.remove();
        uncover();
      };
    }
    p.fit();
    resized.observe(p.room);
    go();
  };

  return {
    shade,
    signal: life.signal,
    place: (lab) => {
      if (!host) placeLab(lab);
    },
    mount,
    shut,
  };
}
