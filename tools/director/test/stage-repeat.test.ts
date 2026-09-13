import { describe, expect, it } from "bun:test";
import { bindStageRepeat } from "../src/stage-repeat.js";

/**
 * A CLEARED WAVE STOPS AND ASKS; A CLICK ANYWHERE RUNS IT AGAIN.
 *
 * The stage used to rebuild on `needWave` before the author had seen the
 * wave clear. Now `ask()` pauses and shows the veil, a click anywhere — heard
 * on whatever `doc` is handed, `document` in the browser — takes the veil
 * down, rebuilds and plays, and that click reaches nothing under it. While
 * the veil is down a click is nobody's business here. Dependency-injected the
 * way `stage-afterrun.ts` is, so this runs without a DOM; whether the veil
 * reads as grey over the field is a browser question and unverified here.
 */

type Click = { stopPropagation: () => void };
type Listener = (e: Click) => void;

function rig() {
  const listeners: { capture: boolean; fn: Listener }[] = [];
  const veil = { hidden: true } as HTMLElement;
  const calls: string[] = [];
  const handle = bindStageRepeat({
    veil,
    doc: {
      addEventListener: ((type: string, fn: Listener, capture?: boolean) => {
        if (type === "click") listeners.push({ capture: capture === true, fn });
      }) as Document["addEventListener"],
    },
    rebuild: () => calls.push("rebuild"),
    setRunning: (r) => calls.push(r ? "run" : "pause"),
    paintPlay: () => calls.push("paint"),
  });
  const click = (): boolean => {
    let stopped = false;
    for (const l of listeners) l.fn({ stopPropagation: () => (stopped = true) });
    return stopped;
  };
  return { veil, calls, handle, click, listeners };
}

describe("REPEAT WAVE?", () => {
  it("pauses the stage and puts the veil up when asked", () => {
    const { veil, calls, handle } = rig();
    handle.ask();
    expect(veil.hidden).toBe(false);
    expect(handle.asking()).toBe(true);
    expect(calls).toEqual(["pause", "paint"]);
  });

  it("answers a click anywhere by rebuilding and playing, and spends the click", () => {
    const { veil, calls, handle, click, listeners } = rig();
    // Heard in the capture phase, so the answer is read before anything under
    // the pointer is.
    expect(listeners.every((l) => l.capture)).toBe(true);
    handle.ask();
    calls.length = 0;
    expect(click()).toBe(true);
    expect(veil.hidden).toBe(true);
    expect(handle.asking()).toBe(false);
    expect(calls).toEqual(["rebuild", "run", "paint"]);
  });

  it("leaves a click alone while the veil is down", () => {
    const { calls, click } = rig();
    expect(click()).toBe(false);
    expect(calls).toEqual([]);
  });

  it("is answered by the play toggle too, since the PAUSED line under it names P", () => {
    const { veil, calls, handle } = rig();
    handle.ask();
    calls.length = 0;
    handle.answer();
    expect(veil.hidden).toBe(true);
    expect(calls).toEqual(["rebuild", "run", "paint"]);
  });

  it("is taken down by a rebuild from elsewhere without being answered", () => {
    const { veil, calls, handle } = rig();
    handle.ask();
    calls.length = 0;
    handle.hide();
    expect(veil.hidden).toBe(true);
    expect(calls).toEqual([]);
  });
});
