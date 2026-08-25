import { DEFAULT_CONFIG, type SimConfig } from "@neon-spore/sim";

/**
 * The numbers a wave is judged against, movable while it plays.
 *
 * A wave is not separable from the tempo it arrives at — `THE WALL` is a
 * different wave at 70 BPM than at 96 — so the editor carries the sliders too.
 * They belong to the run and never to the wave: nothing here is written to
 * waves.ts.
 *
 * The named presets answer decision #10, which wanted a second guard window
 * comparable side by side instead of edited into the source.
 */
type NumericKey = {
  [K in keyof SimConfig]: SimConfig[K] extends number ? K : never;
}[keyof SimConfig];

interface SliderSpec {
  key: NumericKey;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}

const SLIDERS: SliderSpec[] = [
  { key: "bpm", label: "Tempo", min: 40, max: 200, step: 2, unit: " BPM" },
  { key: "bulletTilesPerBeat", label: "Shot speed", min: 2, max: 20, step: 1, unit: " t/beat" },
  { key: "fireEveryBeats", label: "Fire pause", min: 0.15, max: 2, step: 0.05, unit: " beats" },
  { key: "guardWindowMs", label: "Guard window", min: 80, max: 1600, step: 20, unit: " ms" },
  { key: "intakeWindowMs", label: "Maw window", min: 80, max: 1600, step: 20, unit: " ms" },
  { key: "podFallTilesPerBeat", label: "Pod fall", min: 0.5, max: 4, step: 0.1, unit: " t/beat" },
  { key: "podDriftTilesPerBeat", label: "Pod drift", min: 0, max: 2, step: 0.1, unit: " t/beat" },
  { key: "podHomeTiles", label: "Pod home range", min: 0, max: 5, step: 1, unit: " tiles" },
  {
    key: "podHomeTilesPerBeat",
    label: "Pod home speed",
    min: 0,
    max: 6,
    step: 0.5,
    unit: " t/beat",
  },
  { key: "radarLead", label: "Radar lead", min: 1, max: 8, step: 1, unit: " beats" },
  { key: "hullRegenPerSecond", label: "Hull regen/s", min: 0, max: 30, step: 1, unit: "" },
  { key: "bandPct", label: "Control band", min: 24, max: 44, step: 1, unit: " %" },
];

type Preset = Partial<Record<NumericKey, number>>;

/** The two the repository already argues about. Decision #10, as a button. */
const BUILT_IN: { name: string; preset: Preset }[] = [
  { name: "DEFAULT", preset: pick(DEFAULT_CONFIG) },
  { name: "GUARD 260", preset: { ...pick(DEFAULT_CONFIG), guardWindowMs: 260 } },
];

const STORE_KEY = "neon-spore.director.presets";

export function bindTuning(cfg: SimConfig, onChange: () => void): void {
  const rows = document.getElementById("sliders");
  const bar = document.getElementById("presets");
  const inputs = new Map<NumericKey, HTMLInputElement>();
  const values = new Map<NumericKey, HTMLElement>();

  const show = (spec: SliderSpec): void => {
    const el = values.get(spec.key);
    if (el) el.textContent = `${cfg[spec.key]}${spec.unit}`;
    const input = inputs.get(spec.key);
    if (input) input.value = String(cfg[spec.key]);
  };

  if (rows) {
    for (const spec of SLIDERS) {
      const row = document.createElement("div");
      row.className = "row";

      const label = document.createElement("label");
      label.textContent = spec.label;

      const input = document.createElement("input");
      input.type = "range";
      input.min = String(spec.min);
      input.max = String(spec.max);
      input.step = String(spec.step);
      input.value = String(cfg[spec.key]);
      inputs.set(spec.key, input);

      const value = document.createElement("span");
      values.set(spec.key, value);

      input.addEventListener("input", () => {
        apply(cfg, spec.key, Number(input.value));
        show(spec);
        onChange();
      });

      row.append(label, input, value);
      rows.appendChild(row);
      show(spec);
    }
  }

  const renderPresets = (): void => {
    if (!bar) return;
    bar.replaceChildren();
    for (const { name, preset } of [...BUILT_IN, ...load()]) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = name;
      button.addEventListener("click", () => {
        for (const [key, v] of Object.entries(preset)) apply(cfg, key as NumericKey, v);
        for (const spec of SLIDERS) show(spec);
        onChange();
      });
      bar.appendChild(button);
    }
    const save = document.createElement("button");
    save.type = "button";
    save.textContent = "+ SAVE";
    save.addEventListener("click", () => {
      const name = window.prompt("Preset name")?.trim();
      if (!name) return;
      const kept = load().filter((p) => p.name !== name);
      kept.push({ name, preset: pick(cfg) });
      window.localStorage.setItem(STORE_KEY, JSON.stringify(kept));
      renderPresets();
    });
    bar.appendChild(save);
  };

  renderPresets();
}

/**
 * `ticksPerBeat` throws on a tempo that does not divide the tick rate evenly,
 * and rejecting the value here is the whole reason it throws: a fractional
 * tick count lets two devices drift apart on the beat itself.
 */
function apply(cfg: SimConfig, key: NumericKey, next: number): void {
  const previous = cfg[key];
  cfg[key] = next;
  if ((cfg.tickHz * 60) % cfg.bpm !== 0) cfg[key] = previous;
}

function pick(cfg: SimConfig): Preset {
  const out: Preset = {};
  for (const spec of SLIDERS) out[spec.key] = cfg[spec.key];
  return out;
}

function load(): { name: string; preset: Preset }[] {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as { name: string; preset: Preset }[]) : [];
  } catch {
    return [];
  }
}
