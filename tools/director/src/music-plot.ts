/**
 * A theme drawn: the whole piece on one axis, time across, frequency up.
 *
 * It is the same picture `sound-plot.ts` makes of one sound, at the scale of
 * half a minute — and it is here for the same reason. The question a candidate
 * piece of music has to answer is not "is it nice", it is "does it sit on top
 * of the pair talking", and that is visible: everything should be above the
 * red stripe or below it, and the stripe should be empty from end to end.
 *
 * The vertical axis comes from `hzAxis`, the one the sound plots use, so a
 * theme and a sound can be compared by holding them next to each other.
 */

import { SPEECH_BAND, spectrumAt, type ThemePlan } from "@neon-spore/audio";
import { hzAxis, svgEl } from "./sound-plot.js";

const W = 720;
const H = 96;
const y = hzAxis(H);
/** Points along a voice. A theme is mostly short notes; four is a shape. */
const STEPS = 4;

export function plotTheme(plan: ThemePlan, bpm: number): SVGElement {
  const svg = svgEl("svg", {
    viewBox: `0 0 ${W} ${H}`,
    class: "roll",
    preserveAspectRatio: "none",
    role: "img",
  });
  svg.appendChild(svgEl("rect", { x: 0, y: 0, width: W, height: H, fill: "#0A0719" }));

  const seconds = Math.max(plan.duration, plan.loopSeconds, 0.001);
  const x = (t: number): number => (t / seconds) * W;

  // A bar line every four beats — 240/bpm seconds. Music is the one thing in
  // this director with a metre, and without them a roll is a scatter of dots.
  const bar = 240 / bpm;
  for (let t = 0; t < seconds; t += bar) {
    svg.appendChild(
      svgEl("line", {
        x1: x(t),
        y1: 0,
        x2: x(t),
        y2: H,
        stroke: "#2a2350",
        "stroke-width": 0.6,
      }),
    );
  }

  const top = y(SPEECH_BAND.high);
  const bottom = y(SPEECH_BAND.low);
  svg.appendChild(
    svgEl("rect", {
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
      svgEl("line", {
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

  // The loop point, if the piece runs past it. Where it comes back to the top.
  if (plan.duration > plan.loopSeconds) {
    svg.appendChild(
      svgEl("line", {
        x1: x(plan.loopSeconds),
        y1: 0,
        x2: x(plan.loopSeconds),
        y2: H,
        stroke: "#F2C14E",
        "stroke-opacity": 0.5,
        "stroke-dasharray": "3 3",
        "stroke-width": 0.8,
      }),
    );
  }

  for (const { start, plan: sound } of plan.plans) {
    for (const v of sound.voices) {
      const life = v.attack + v.hold + v.release;
      const top: string[] = [];
      const bottom: string[] = [];
      for (let i = 0; i <= STEPS; i++) {
        const t = i / STEPS;
        const s = spectrumAt(v, t);
        const px = x(start + v.start + life * t);
        top.push(`${px.toFixed(1)},${y(s.high).toFixed(1)}`);
        bottom.push(`${px.toFixed(1)},${y(s.low).toFixed(1)}`);
      }
      bottom.reverse();
      const loud = Math.min(1, v.gain / 0.25);
      svg.appendChild(
        svgEl("polygon", {
          points: [...top, ...bottom].join(" "),
          fill: "#2FE0F0",
          "fill-opacity": (0.2 + loud * 0.45).toFixed(2),
          stroke: "#BFF6FF",
          "stroke-opacity": (0.25 + loud * 0.45).toFixed(2),
          "stroke-width": 1.1,
        }),
      );
    }
  }
  return svg;
}
