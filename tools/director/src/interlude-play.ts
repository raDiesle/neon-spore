import type { GaugeState, InterludeEntry, SimConfig, World } from "@neon-spore/sim";
import { GAUGE_FULL, interludeHeard, startInterlude } from "@neon-spore/sim";
import { pickButton } from "./interlude-panel.js";

/**
 * The half of the interlude panel that plays a round rather than editing its
 * table entry — split out of `interlude-panel.ts` on line count, the same
 * reason `boss-cycles.ts` sits beside `boss.ts`.
 *
 * `stageWorld()` returns the same `World` the stage's own loop is stepping
 * every frame — `stage.ts` exposes it for the balance sheet already — so
 * calling `startInterlude` on it opens the round in place, and the renderer
 * draws it on the next frame for the reason `docs/decisions.md` #20 gives: an
 * interlude is a mode `World` enters, not a second kind of round the stage
 * would have to learn to draw. `interludeHeard` is the same story for the two
 * controls: it is the exact call `packages/sim/src/world.ts`'s `step` makes
 * for a `valve` or `call` command once a round holds the world, so pressing
 * this panel's own buttons is indistinguishable to the simulation from a
 * press the stage's `keys.push` would have queued for the next tick — it just
 * lands one tick sooner, which costs nothing here: this is a browser tool,
 * not `sim` or `content`, so nothing in `purity.test.ts` has an opinion.
 */

/**
 * Turn the valve and make the call, straight into the stage's own `World`.
 * Held buttons rather than the field's `touchDown`/`touchMove`/`touchUp` —
 * this panel has no canvas geometry to hit-test against, only two verbs and a
 * seat each, which a button already is.
 */
export function playControls(
  entry: InterludeEntry,
  wave: number,
  cfg: SimConfig,
  stageWorld: () => World,
  onPairChanged: () => void,
): HTMLElement {
  const box = document.createElement("div");
  box.className = "boss-fields";

  const play = pickButton("▶ PLAY", () => {
    if (!cfg.interludes) {
      cfg.interludes = true;
      onPairChanged();
    }
    startInterlude(stageWorld(), entry, wave);
  });
  box.appendChild(play);

  const valve = (dir: -1 | 1, label: string): HTMLButtonElement => {
    const el = document.createElement("button");
    el.type = "button";
    el.textContent = label;
    const press = (): void => interludeHeard(stageWorld(), 1, { kind: "valve", on: true, dir });
    const release = (): void => interludeHeard(stageWorld(), 1, { kind: "valve", on: false, dir });
    el.addEventListener("pointerdown", press);
    el.addEventListener("pointerup", release);
    el.addEventListener("pointerleave", release);
    return el;
  };
  box.appendChild(valve(-1, "◀ VALVE"));
  box.appendChild(valve(1, "VALVE ▶"));

  const call = pickButton("CALL", () => interludeHeard(stageWorld(), 2, { kind: "call" }));
  box.appendChild(call);

  box.appendChild(statusLine(stageWorld));
  return box;
}

/** What the round is doing right now, refreshed while this element stays on the page. */
function statusLine(stageWorld: () => World): HTMLElement {
  const status = document.createElement("p");
  status.className = "note";

  const paint = (): void => {
    const w = stageWorld();
    const round = w.interlude;
    if (round === null) {
      status.textContent = "not running — ▶ PLAY opens it on the stage.";
      return;
    }
    if (round.kind !== "gauge") {
      status.textContent = `${round.phase}, beat ${w.beat - round.openBeat}.`;
      return;
    }
    const g = round as GaugeState;
    status.textContent =
      `${round.phase} — needle ${g.needleMilli}/${GAUGE_FULL}, ` +
      `band ${g.markMilli}, ${g.marks} marked, ${g.misses} missed.`;
  };
  paint();

  // Polled rather than pushed: nothing here is told when a tick lands, and a
  // round the pilot is actually turning is worth refreshing at more than the
  // rate a click would. Stopped once the element leaves the page — `render()`
  // rebuilds this whole subtree on every edit, and a poll nobody can see is a
  // leak the panel would otherwise carry until the tab closed.
  const poll = window.setInterval(paint, 200);
  const watch = new MutationObserver(() => {
    if (status.isConnected) return;
    window.clearInterval(poll);
    watch.disconnect();
  });
  watch.observe(document.body, { childList: true, subtree: true });

  return status;
}
