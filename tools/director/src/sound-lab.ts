/**
 * The SOUND tab: every sound in the catalogue, playable.
 *
 * It answers three questions and is worth the file for the third. What does
 * this sound like — press it. What is already wired up — the BOUND stamp,
 * which `packages/audio/test/catalogue.test.ts` keeps honest by reading the
 * binding files rather than trusting the label. And **what is built and not
 * yet spent**: a hundred-odd spare sounds, each with a line saying what it was
 * made for, so a creature or a boss that is still only a name in the spec can
 * be listened to before it is written.
 *
 * The band figure beside each one is what it costs the conversation
 * (`packages/audio/src/band.ts`) — seconds of speech-band time, weighted by how
 * loudly they are spent. Almost everything reads 0.000.
 */

import { CATALOGUE, Engine, judgeBand, planSound, type SoundDef } from "@neon-spore/audio";

const engine = new Engine({ volume: 0.8 });

interface Filters {
  family: string;
  status: string;
}

const filters: Filters = { family: "all", status: "all" };

function chip(label: string, on: boolean, onClick: () => void): HTMLButtonElement {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = label;
  b.className = on ? "on" : "";
  b.addEventListener("click", onClick);
  return b;
}

function meta(def: SoundDef): string {
  const plan = planSound(def);
  const band = judgeBand(def, plan);
  return `${plan.duration.toFixed(2)}s · ${plan.voices.length} voices · band ${band.seconds.toFixed(3)}s`;
}

/** The recipe, as the numbers that make it — the whole sound is this line. */
function recipe(def: SoundDef): string {
  return def.layers
    .map((l) => {
      const to = l.toFreq && l.toFreq !== l.freq ? `→${Math.round(l.toFreq)}` : "";
      const bits = [`${l.source} ${Math.round(l.freq)}${to}Hz`, `g${l.gain}`];
      if (l.filter) bits.push(`${l.filter.type} ${Math.round(l.filter.freq)}`);
      if (l.ring) bits.push(`ring ${Math.round(l.ring.freq)}`);
      if (l.wobble) bits.push(`wob ${l.wobble.rate}`);
      if (l.repeat) bits.push(`×${l.repeat.times}`);
      return bits.join(" ");
    })
    .join("  |  ");
}

function row(def: SoundDef): HTMLElement {
  const el = document.createElement("div");
  el.className = def.status === "bound" ? "sound is-built" : "sound";

  const head = document.createElement("div");
  head.className = "head";

  const play = document.createElement("button");
  play.type = "button";
  play.textContent = "▶";
  play.className = "playbtn";
  play.addEventListener("click", () => {
    engine.unlock();
    engine.play(def);
  });
  head.appendChild(play);

  const name = document.createElement("span");
  name.className = "name";
  name.textContent = def.id;
  head.appendChild(name);

  const stamp = document.createElement("span");
  stamp.className = "stamp";
  stamp.textContent = def.status === "bound" ? "BOUND" : "SPARE";
  head.appendChild(stamp);
  el.appendChild(head);

  const blurb = document.createElement("p");
  blurb.className = "note";
  blurb.textContent = def.blurb;
  el.appendChild(blurb);

  const use = document.createElement("p");
  use.className = "use";
  use.textContent = def.use;
  el.appendChild(use);

  if (def.pierce) {
    const pierce = document.createElement("p");
    pierce.className = "pierce";
    pierce.textContent = `COVERS A VOICE — ${def.pierce}`;
    el.appendChild(pierce);
  }

  const numbers = document.createElement("span");
  numbers.className = "kind";
  numbers.textContent = meta(def);
  el.appendChild(numbers);

  const rec = document.createElement("code");
  rec.className = "recipe";
  rec.textContent = recipe(def);
  el.appendChild(rec);

  return el;
}

export function renderSoundLab(container: HTMLElement): void {
  container.replaceChildren();

  const shown = CATALOGUE.filter(
    (s) =>
      (filters.family === "all" || s.family === filters.family) &&
      (filters.status === "all" || s.status === filters.status),
  );

  const bar = document.createElement("div");
  bar.className = "soundbar";
  const set = (key: keyof Filters, value: string) => () => {
    filters[key] = value;
    renderSoundLab(container);
  };
  bar.appendChild(chip("ALL", filters.status === "all", set("status", "all")));
  bar.appendChild(chip("BOUND", filters.status === "bound", set("status", "bound")));
  bar.appendChild(chip("SPARE", filters.status === "spare", set("status", "spare")));
  container.appendChild(bar);

  const fams = document.createElement("div");
  fams.className = "soundbar";
  fams.appendChild(chip("EVERY FAMILY", filters.family === "all", set("family", "all")));
  const seen: string[] = [];
  for (const s of CATALOGUE) if (!seen.includes(s.family)) seen.push(s.family);
  for (const family of seen) {
    const n = CATALOGUE.filter((s) => s.family === family).length;
    fams.appendChild(
      chip(`${family.toUpperCase()} ${n}`, filters.family === family, set("family", family)),
    );
  }
  container.appendChild(fams);

  const count = document.createElement("p");
  count.className = "note";
  const bound = CATALOGUE.filter((s) => s.status === "bound").length;
  count.textContent =
    `${shown.length} of ${CATALOGUE.length} sounds — ${bound} wired into the game, ` +
    `${CATALOGUE.length - bound} built and unspent. Nothing here is a recording: ` +
    "every one is a few numbers the browser synthesises when you press it.";
  container.appendChild(count);

  const all = document.createElement("button");
  all.type = "button";
  all.textContent = "PLAY THESE IN ORDER";
  all.addEventListener("click", () => {
    engine.unlock();
    let at = engine.now + 0.1;
    for (const def of shown) {
      const plan = planSound(def);
      engine.playPlan(plan, at);
      at += Math.max(0.45, plan.duration + 0.15);
    }
  });
  container.appendChild(all);

  for (const def of shown) container.appendChild(row(def));
}
