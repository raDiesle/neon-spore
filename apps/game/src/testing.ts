import type { SimConfig, World } from "@neon-spore/sim";

/**
 * The prototype's test rig: pause, jump between waves, and sliders for the
 * numbers worth arguing about.
 *
 * This exists because of docs/decisions.md — a tunable is a named field of
 * `SimConfig`, and the point of naming them is that they can be moved while
 * two people are playing, instead of being described to each other afterwards.
 * The guard window in particular is still a guess (spec 15.3): it decides
 * whether the shared defence feels precise or mean, and only playing tells you.
 */
export interface TestBindings {
  world: World;
  jumpToWave: (wave: number) => void;
  isRunning: () => boolean;
  setRunning: (running: boolean) => void;
}

interface SliderSpec {
  key: keyof SimConfig;
  label: string;
  min: number;
  max: number;
  s: number;
  unit: string;
}

const SLIDERS: SliderSpec[] = [
  { key: "bpm", label: "Tempo", min: 40, max: 200, s: 2, unit: " BPM" },
  { key: "bulletTilesPerBeat", label: "Shot speed", min: 2, max: 20, s: 1, unit: " tiles/beat" },
  { key: "fireEveryBeats", label: "Fire pause", min: 0.15, max: 2, s: 0.05, unit: " beats" },
  { key: "radarLead", label: "Radar lead", min: 1, max: 8, s: 1, unit: " beats" },
  { key: "guardWindowMs", label: "Guard window", min: 80, max: 900, s: 10, unit: " ms" },
  { key: "hullRegenPerSecond", label: "Hull regen/s", min: 0, max: 30, s: 1, unit: "" },
  { key: "bandPct", label: "Control band", min: 24, max: 44, s: 1, unit: " %" },
];

export function bindTestControls({ world, jumpToWave, isRunning, setRunning }: TestBindings): void {
  const el = (id: string): HTMLElement | null => document.getElementById(id);
  const panel = el("panel");
  const pauseBtn = el("pauseBtn");
  const waveLabel = el("waveLabel");

  // Paused by hand is not the same as paused because the tab went away. Only
  // the first survives coming back to the game.
  let pausedByHand = false;
  const panelOpen = (): boolean => panel?.style.display === "block";

  const refreshWave = (): void => {
    if (waveLabel) waveLabel.textContent = `W${world.wave + 1}`;
  };
  const paint = (): void => {
    if (pauseBtn) pauseBtn.textContent = isRunning() ? "⏸" : "▶";
  };
  const apply = (): void => {
    setRunning(!pausedByHand && !panelOpen() && !document.hidden);
    paint();
  };

  pauseBtn?.addEventListener("click", () => {
    if (panelOpen()) return;
    pausedByHand = !pausedByHand;
    apply();
  });

  el("gear")?.addEventListener("click", () => {
    if (panel) panel.style.display = "block";
    apply();
  });
  el("close")?.addEventListener("click", () => {
    if (panel) panel.style.display = "none";
    pausedByHand = false;
    apply();
  });

  for (const btn of document.querySelectorAll<HTMLElement>("#waveSkip button")) {
    btn.addEventListener("click", () => {
      jumpToWave(world.wave + Number(btn.dataset.d ?? 0));
      refreshWave();
    });
  }

  // The beat has to divide the tick rate exactly, so tempo cannot move freely:
  // a fractional tick count would let two devices drift apart on the beat
  // itself, which is the one thing lockstep cannot survive.
  const rows = el("sliders");
  if (rows) {
    for (const spec of SLIDERS) {
      rows.appendChild(sliderRow(world, spec));
    }
  }

  // Pausing when the tab goes away keeps a returning player from being buried
  // under a burst of catch-up ticks — and coming back resumes on its own,
  // unless the pause was deliberate.
  document.addEventListener("visibilitychange", apply);

  refreshWave();
  apply();
  window.setInterval(refreshWave, 250);
}

function sliderRow(world: World, spec: SliderSpec): HTMLElement {
  const row = document.createElement("div");
  row.className = "row";

  const label = document.createElement("label");
  label.textContent = spec.label;

  const input = document.createElement("input");
  input.type = "range";
  input.min = String(spec.min);
  input.max = String(spec.max);
  input.step = String(spec.s);
  input.value = String(world.cfg[spec.key]);

  const value = document.createElement("span");
  const show = (): void => {
    value.textContent = `${world.cfg[spec.key]}${spec.unit}`;
  };
  show();

  input.addEventListener("input", () => {
    const next = Number(input.value);
    const previous = world.cfg[spec.key];
    world.cfg[spec.key] = next;
    try {
      // `ticksPerBeat` throws on a tempo that does not divide evenly. Rejecting
      // the value here is the whole reason it throws.
      if ((world.cfg.tickHz * 60) % world.cfg.bpm !== 0) throw new Error("uneven beat");
    } catch {
      world.cfg[spec.key] = previous;
      input.value = String(previous);
    }
    show();
  });

  row.append(label, input, value);
  return row;
}
