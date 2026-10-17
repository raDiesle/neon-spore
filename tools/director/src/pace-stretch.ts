import { fastSlides, PACE_REST_BEATS, paceBeats, type Wave, waveCols } from "@neon-spore/content";

/**
 * **A wave's fast slides stretched out**: every arrival after one that comes
 * too soon for the columns it is from the last (`wave-pace.ts`) moves later
 * by what it is short, and so does everything behind it; one slide the wave
 * may keep (`allowed`) is left fast, and the gap after it is stretched to a
 * rest. Columns, kinds and order stay as they were — only time is added — so
 * a wave keeps its picture and loses only its rush. What `bun run waves:pace`
 * does to a wave written before the rule.
 */
export function stretchPace(wave: Wave, allowed: number): Wave {
  let out = wave;
  // One slide at a time: a stretch moves every beat behind it, which can
  // change the next slide's gap only by making it longer.
  for (let guard = 0; guard < 64; guard++) {
    const slides = fastSlides(out.entries, waveCols(out));
    const keep = slides.slice(0, Math.min(allowed, slides.length));
    const tired = keep.find((s) => s.rest !== undefined && s.rest < PACE_REST_BEATS);
    const fix = slides[keep.length];
    if (tired) out = pushFrom(out, tired.beat + tired.gap + 1, PACE_REST_BEATS - (tired.rest ?? 0));
    else if (fix) out = pushFrom(out, fix.beat + 1, paceBeats(fix.cols) - fix.gap);
    else break;
  }
  return out;
}

/** The wave with everything on or after `beat` moved `by` beats later. */
function pushFrom(wave: Wave, beat: number, by: number): Wave {
  const move = <T extends { beat: number }>(x: T): T =>
    x.beat >= beat ? { ...x, beat: x.beat + by } : x;
  return {
    ...wave,
    entries: wave.entries.map(move),
    ...(wave.pods ? { pods: wave.pods.map(move) } : {}),
    ...(wave.faults
      ? {
          faults: wave.faults.map((f) =>
            (f.at ?? 0) >= beat ? { ...f, at: (f.at ?? 0) + by } : f,
          ),
        }
      : {}),
  };
}
