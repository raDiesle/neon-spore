import {
  DEMONSTRATIONS,
  demonstrationConfig,
  demonstrationWave,
  MECHANIC_IDS,
  type MechanicId,
  mechanic,
} from "@neon-spore/content";
import type { SimConfig } from "@neon-spore/sim";
import type { Store } from "./state.js";

/**
 * DEMOS — one wave and one set of switches per mechanic, opened in one click.
 * A tab of GAME MECHANICS (`states-page.ts` owns the sheet itself) rather
 * than a sheet of its own, to save a topbar button. Its own
 * Escape/backdrop/CLOSE routes went with the sheet: the outer
 * one already covers all three, since a tab has nothing of its own to close.
 *
 * `DEMONSTRATIONS` (`packages/content/src/waves-demo.ts`) is total over
 * `MECHANIC_IDS`, so this panel renders that table rather than restating it: a
 * mechanic added to the sim gets a row here for free the moment
 * `waves-demo.ts` says where it lives, and nothing in this file needs editing
 * when that happens.
 *
 * `demonstrationWave` throws when a demonstration's name has fallen out of
 * `WAVES`. That throw is not swallowed into an empty row — a broken entry
 * marks the row itself broken (red, `OPEN` disabled) both at render and, in
 * case a wave is deleted while the tab is open, again on the click that would
 * have opened it. The mechanic stays visible either way: a demo that cannot
 * be opened is a defect on screen, not a hole in the list.
 *
 * `cfg` is the one the stage already plays, the same object `bindPairPanel`
 * and `bindTuning` mutate in place — opening a demo is switching that same
 * run's dials and then asking the stage to replay under them, not a separate
 * config for a separate stage.
 */
export interface DemoPanel {
  render(): void;
}

function el(tag: string, cls = "", text = ""): HTMLElement {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text) node.textContent = text;
  return node;
}

/**
 * `onOpen` lands the demo's wave and config on the stage the same way any
 * other jump to a wave does; `closeMechanics` then dismisses GAME MECHANICS
 * entirely — the one thing this tab's own CLOSE button used to do, now that
 * it has none of its own. `states-page.ts`'s `closeMechanicsSheet` is what
 * `main.ts` passes in.
 */
export function bindDemoPanel(
  store: Store,
  cfg: SimConfig,
  onOpen: () => void,
  closeMechanics: () => void,
): DemoPanel {
  const body = document.getElementById("demosBody");
  const tab = document.querySelector<HTMLButtonElement>('#statesTabs button[data-tab="demos"]');

  function openDemo(id: MechanicId): void {
    const wave = demonstrationWave(id); // throws if the name has gone missing
    const index = store.waves.findIndex((w) => w.name === wave.name);
    if (index === -1) {
      throw new Error(
        `${id} names wave "${wave.name}", which is in WAVES but not in this director's copy`,
      );
    }
    Object.assign(cfg, demonstrationConfig(id, cfg));
    store.index = index;
    onOpen();
    closeMechanics();
  }

  function render(): void {
    if (!body) return;
    body.replaceChildren();

    for (const id of MECHANIC_IDS) {
      const demo = DEMONSTRATIONS[id];
      let broken: string | null = null;
      try {
        demonstrationWave(id);
      } catch (err) {
        broken = String(err);
      }

      const row = el("div", broken ? "demo broken" : "demo");
      const head = el("div", "demo-head");
      head.append(el("span", "mark", broken ? "✗" : "▸"), el("span", "id", id));
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = broken ? "BROKEN" : "▶ OPEN";
      button.disabled = broken !== null;
      button.addEventListener("click", () => openDemo(id));
      head.append(button);
      row.append(head);
      row.append(el("p", "wave", `wave — ${demo.wave}`));
      row.append(el("p", "what", broken ?? mechanic(id).what));
      body.append(row);
    }
  }

  // Lazy like `backlog-page.ts`'s SHAPES tab and `controlsets-page.ts`'s own
  // `bindControlSetsTab`: the list is cheap here, but the tab is still built
  // on first sight of it rather than at load, so every such room follows the
  // one rule rather than three near-identical exceptions to it. A restore
  // straight to this tab (`?sheet=states&inner=demos`) fires the same click
  // `mountSheet` already drives for every inner tab.
  tab?.addEventListener("click", render);

  return { render };
}
