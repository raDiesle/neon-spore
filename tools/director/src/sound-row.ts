import { type Engine, judgeBand, planSound, type SoundDef } from "@neon-spore/audio";
import { subjectArt } from "./sound-art.js";
import { NO_SUBJECT, subjectFor, triggerFor } from "./sound-link.js";
import { plotSound } from "./sound-plot.js";

/**
 * **One sound, as a row of the catalogue sheet.**
 *
 * Its own file beside `sound-page.ts`, split when that one reached the
 * 250-line ceiling. The seam is the one the sheet already has on screen: next
 * door is the *page* — which family is showing, which status filter is on, the
 * tabs across the top, the legend, and what a rebuild costs — and this is one
 * of the things it lists. Neither half reads the other's reasoning.
 */

/** A `<p>` with a class and a line in it. Exported because the page prints
 * its own three notes the same way, and a helper this small living on the
 * page would have the row importing it back the wrong way round. */
export function line(cls: string, text: string): HTMLParagraphElement {
  const p = document.createElement("p");
  p.className = cls;
  p.textContent = text;
  return p;
}

/** `soft()` multiplies a gain, so a layer's own number can arrive as 0.0559999. */
const round = (n: number): string => String(Math.round(n * 1000) / 1000);

/** The recipe as the numbers that make it — the whole sound is this line. */
function recipe(def: SoundDef): string {
  return def.layers
    .map((l) => {
      const to = l.toFreq && l.toFreq !== l.freq ? `→${Math.round(l.toFreq)}` : "";
      const bits = [`${l.source} ${Math.round(l.freq)}${to}Hz`, `g${round(l.gain)}`];
      if (l.filter) bits.push(`${l.filter.type} ${Math.round(l.filter.freq)}`);
      if (l.ring) bits.push(`ring ${Math.round(l.ring.freq)}`);
      if (l.wobble) bits.push(`wob ${l.wobble.rate}`);
      if (l.repeat) bits.push(`×${l.repeat.times}`);
      return bits.join(" ");
    })
    .join("   ·   ");
}

/**
 * One sound's row: its picture, the PLAY button, what it is for, what it
 * costs the conversation, its recipe as numbers and its plot.
 *
 * The `Engine` arrives as an argument rather than being read off the module.
 * A row is a thing the page builds; which engine it plays through is the
 * page's business, and a row that reached for a module-level one could only
 * ever be played through that one — which is what kept this inside
 * `sound-page.ts` when nothing about it is a page.
 */
export function row(def: SoundDef, engine: Engine): HTMLElement {
  const bound = def.status === "bound";
  const el = document.createElement("div");
  el.className = bound ? "sound is-built" : "sound";

  el.appendChild(subjectArt(subjectFor(def), bound, NO_SUBJECT[def.id]));

  const body = document.createElement("div");
  body.className = "sound-body";

  const head = document.createElement("div");
  head.className = "head";
  const play = document.createElement("button");
  play.type = "button";
  play.className = "playbtn";
  play.textContent = "▶";
  play.title = "play";
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
  stamp.textContent = bound ? "BOUND" : "SPARE";
  head.appendChild(stamp);
  body.appendChild(head);

  body.appendChild(line("note", def.blurb));
  body.appendChild(line("use", triggerFor(def)));
  if (def.pierce) body.appendChild(line("pierce", `COVERS A VOICE — ${def.pierce}`));

  const plan = planSound(def);
  const band = judgeBand(def, plan);
  body.appendChild(
    line(
      "kind",
      `${plan.duration.toFixed(2)}s · ${plan.voices.length} voices · costs the conversation ${band.seconds.toFixed(3)}s`,
    ),
  );

  const code = document.createElement("code");
  code.className = "recipe";
  code.textContent = recipe(def);
  body.appendChild(code);

  el.appendChild(body);
  el.appendChild(plotSound(plan));
  return el;
}
