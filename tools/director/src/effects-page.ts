import { el } from "./dom.js";
import { EFFECTS, type Effect, effectById } from "./effects/index.js";
import { picker, RATES, toggle } from "./versus-controls.js";
import { startPair } from "./versus-pair.js";
import type { ShotParams } from "./versus-shot.js";

/**
 * `versus.html?effect=…` — one kept effect, alone, live, at phone size.
 *
 * The VERSUS pair with one side mounted: one world stepped on the pose the
 * effect was judged on, and the effect patched into the game's own record for
 * the length of the draw (`effects/index.ts`). The unpatched side is still
 * built, because `startPair` steps one world for two renderers, but it is
 * never shown — there is nothing here to compare, only the effect to watch.
 *
 * The bar is pause, rate and zoom. BLINK is VERSUS's and flips to a side this
 * page does not show.
 */
export function routeEffect(mount: HTMLElement, id: string | null, shot: ShotParams): void {
  const effect = effectById(id);
  if (!effect) {
    document.title = "Neon Spore — EFFECTS";
    mount.appendChild(el("h1", "", "NOTHING TO SHOW"));
    mount.appendChild(
      el(
        "p",
        "note",
        `No kept effect is called ${id}. The effects kept now are ` +
          `${EFFECTS.map((e) => e.id).join(", ")} — GRAPHICS → EFFECTS lists them.`,
      ),
    );
    return;
  }
  document.title = `Neon Spore — ${effect.group} · ${effect.label}`;
  mount.appendChild(renderEffect(effect, shot));
}

function renderEffect(effect: Effect, shot: ShotParams): HTMLElement {
  const row = el("div", "versus-row");
  row.appendChild(
    el("h2", "", `${effect.group} · ${effect.label}${effect.inGame ? " — IN THE GAME" : ""}`),
  );
  row.appendChild(el("p", "versus-name", effect.claim));
  row.appendChild(el("p", "versus-look", effect.note));
  row.appendChild(el("p", "versus-showing", `WHAT IS ON SCREEN — ${effect.pose.name}`));
  row.appendChild(el("p", "versus-blink-note", effect.pose.note));

  const stage = el("div", "versus-stage");
  const side = el("div", "versus-side");
  // The same hook VERSUS gives a screen, so `bun run shot` can grab this one.
  side.dataset.versusKey = `effect/${effect.id}`;
  const pair = startPair(
    {
      pose: effect.pose,
      role: effect.pose.role ?? "p1",
      variant: effect.variant,
      freezeSeconds: shot.freezeSeconds,
    },
    { onSettled: () => {}, onBlink: () => {} },
  );
  side.appendChild(pair.right);
  stage.appendChild(side);

  const bar = el("div", "versus-bar");
  bar.append(
    toggle("⏸", (paused) => pair.setRunning(!paused)),
    picker(RATES, (r) => `${r}×`, pair.setRate, RATES.indexOf(1), "versus-rate"),
    toggle("2× — NOT TRUE SIZE", (on) => pair.setZoom(on ? 2 : 1), "versus-zoom"),
  );
  row.append(stage, bar);
  return row;
}
