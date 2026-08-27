/**
 * A sound drawn: time across, frequency up, the speech band shaded.
 *
 * The picture exists because the rule this catalogue is built on is invisible
 * otherwise. `packages/audio/src/band.ts` keeps sounds out of 300–3000 Hz so
 * they do not cover a voice, and a number saying `band 0.000s` is a claim you
 * have to believe. A plot with the band shaded across it is the same fact,
 * checkable at a glance: the sound either goes through the red or it goes
 * around it, and the shape of most of this catalogue is a low half and a high
 * half with the stripe clear between them.
 *
 * Every value comes from `spectrumAt`, the function the band rule itself
 * measures with. Nothing here works out where a voice sits a second time.
 */

import { type Plan, type PlannedVoice, SPEECH_BAND, spectrumAt } from "@neon-spore/audio";

const NS = "http://www.w3.org/2000/svg";
const W = 190;
const H = 52;
/** The plotted range. Below 40 Hz and above 16 kHz nothing in the game lives. */
const LOW = 40;
const HIGH = 16_000;
/** Points sampled along a voice. Enough for a swept filter to read as a curve. */
const STEPS = 12;

const y = (hz: number): number => {
  const t = Math.log(Math.max(LOW, Math.min(HIGH, hz)) / LOW) / Math.log(HIGH / LOW);
  return H - t * H;
};

function el<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number>,
): SVGElementTagNameMap[K] {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

/**
 * One voice as a filled ribbon between its own low and high edge. A pure tone
 * comes out a hairline, a band of noise comes out a stripe, and a sweep bends
 * — which is the whole of what there is to see.
 */
function ribbon(v: PlannedVoice, duration: number): SVGElement {
  const x = (t: number): number => ((v.start + (v.attack + v.hold + v.release) * t) / duration) * W;
  const top: string[] = [];
  const bottom: string[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    const s = spectrumAt(v, t);
    top.push(`${x(t).toFixed(1)},${y(s.high).toFixed(1)}`);
    bottom.push(`${x(t).toFixed(1)},${y(s.low).toFixed(1)}`);
  }
  bottom.reverse();
  return el("polygon", {
    points: [...top, ...bottom].join(" "),
    fill: "#2FE0F0",
    // Loud voices read solid, the quiet ones that sit under a voice barely at
    // all — which is exactly how the band rule weights them.
    "fill-opacity": (0.14 + Math.min(1, v.gain / 0.3) * 0.4).toFixed(2),
    stroke: "#BFF6FF",
    "stroke-opacity": (0.1 + Math.min(1, v.gain / 0.3) * 0.35).toFixed(2),
    "stroke-width": 0.7,
  });
}

/**
 * The key, drawn once above the list. Putting the axis on all 190 plots would
 * cost more ink than the plots themselves, and the question "which way is up"
 * only has to be answered once per page.
 */
export function plotLegend(): SVGElement {
  const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, class: "plot" });
  svg.appendChild(el("rect", { x: 0, y: 0, width: W, height: H, fill: "#0A0719" }));
  const top = y(SPEECH_BAND.high);
  svg.appendChild(
    el("rect", {
      x: 0,
      y: top,
      width: W,
      height: y(SPEECH_BAND.low) - top,
      fill: "#FF3B6B",
      "fill-opacity": 0.1,
    }),
  );
  const mark = (hz: number, text: string, colour: string): void => {
    const label = el("text", {
      x: 3,
      y: Math.min(H - 2, Math.max(8, y(hz) + 3)),
      fill: colour,
      "font-size": 7,
      "font-family": "monospace",
    });
    label.textContent = text;
    svg.appendChild(label);
  };
  mark(13_000, "16k — sparkle lives up here", "#7A6FA8");
  mark(1000, "300–3k · THE VOICE", "#FF8AA3");
  mark(52, "40Hz — bodies live down here", "#7A6FA8");
  const time = el("text", {
    x: W - 3,
    y: H - 3,
    fill: "#4d4478",
    "font-size": 7,
    "font-family": "monospace",
    "text-anchor": "end",
  });
  time.textContent = "time →";
  svg.appendChild(time);
  return svg;
}

export function plotSound(plan: Plan): SVGElement {
  const svg = el("svg", {
    viewBox: `0 0 ${W} ${H}`,
    width: W,
    height: H,
    class: "plot",
    role: "img",
  });
  svg.appendChild(el("rect", { x: 0, y: 0, width: W, height: H, fill: "#0A0719" }));

  // The speech band, behind everything. Anything crossing it is costing the
  // pair a sentence, and this is where you see it happen. Two hairlines at its
  // edges as well as the wash: without them the wash reads as a background
  // colour rather than as a region with a top and a bottom.
  const top = y(SPEECH_BAND.high);
  const bottom = y(SPEECH_BAND.low);
  svg.appendChild(
    el("rect", {
      x: 0,
      y: top,
      width: W,
      height: bottom - top,
      fill: "#FF3B6B",
      "fill-opacity": 0.1,
    }),
  );
  for (const edge of [top, bottom]) {
    svg.appendChild(
      el("line", {
        x1: 0,
        y1: edge,
        x2: W,
        y2: edge,
        stroke: "#FF3B6B",
        "stroke-opacity": 0.45,
        "stroke-width": 0.6,
      }),
    );
  }

  const duration = Math.max(plan.duration, 0.001);
  for (const v of plan.voices) svg.appendChild(ribbon(v, duration));
  return svg;
}
