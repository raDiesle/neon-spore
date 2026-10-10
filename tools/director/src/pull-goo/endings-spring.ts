import { smoothstep } from "@neon-spore/render";
import { drop } from "./body.js";
import { type Ending, halo, intoPlace, landed, paintDrop, wave } from "./ending.js";
import { RETURN } from "./moment.js";
import { clamp01, settle } from "./noise.js";
import { lengthOf } from "./parts.js";
import { homeward, type Scene } from "./scene.js";
import { paintTail, tailPath } from "./strand.js";

/**
 * Two GOO endings in which the drop stays whole: SLING, held in the place by
 * its own tail and flung home on it, and BLOOM, opening in the place like a
 * flower and rolling home once it has closed.
 */

/** How long the way home is, in field pixels. */
const homeLength = (s: Scene): number => lengthOf(s.t) * Math.abs(s.origin - s.goal) || 1;

export const SLING: Ending = {
  name: "sling",
  sentence:
    "counted, the drop presses into the place and green rings roll out of it; let go, its tail draws it back like a sling and flings it home, past the start and back, wobbling",
  arrive(s, a) {
    const e = smoothstep(a);
    halo(s, s.place, s.r * 2.2, 0.3 * e);
    wave(s, s.place, (s.m.age - 0.2) / 0.8, 2.2);
    wave(s, s.place, (s.m.age - 0.45) / 0.8, 2.2);
    const press = 0.3 * e + 0.25 * settle(Math.max(0, s.m.age - 0.3), 6, 16);
    paintDrop(s, drop(intoPlace(s, a), s.r, { squash: 1 + press }), 0.75 * e);
  },
  back(s, b) {
    const sec = b * RETURN;
    const way = homeward(s, 0);
    const cock = smoothstep(clamp01(b / 0.25));
    const fly = clamp01((b - 0.25) / 0.3);
    const pull = s.r * 0.7 * cock * (1 - fly) ** 2;
    const off = { x: -way.dx * pull, y: -way.dy * pull };
    const over = (s.r * 1.1) / homeLength(s);
    const green = 0.75 * (1 - fly);
    if (fly >= 1) {
      const since = sec - 0.55 * RETURN;
      const swing = settle(since, 7, 12);
      const q = homeward(s, 1 + over * swing);
      const body = drop(q, s.r, {
        lean: { x: q.dx, y: q.dy },
        stretch: 0.35 * Math.abs(swing),
        squash: 1 + 0.35 * s.style.jiggle * settle(since, 6, 18),
      });
      return paintDrop(s, body, 0);
    }
    const u = fly * fly * (1 + over);
    const k = s.goal + (s.origin - s.goal) * Math.min(1, u);
    const run = { t: s.t, origin: s.origin, at: k, off };
    if (u < 0.95) paintTail(s.ctx, tailPath(run, s.r, s.time, cock), s.style, 0, 1);
    const q = homeward(s, u);
    const at = { x: q.x + off.x, y: q.y + off.y };
    const lean = fly > 0 ? { x: q.dx, y: q.dy } : { x: -way.dx, y: -way.dy };
    const stretch = fly > 0 ? 1.1 * Math.sin(Math.PI * fly) : 0.45 * cock;
    paintDrop(s, drop(at, s.r * (1 - 0.15 * cock), { lean, stretch, point: 6 }), green);
  },
};

export const BLOOM: Ending = {
  name: "bloom",
  sentence:
    "counted, the drop opens in the place into a turning green flower of lobes, lit from under; let go, it closes back into a drop and rolls home along the path, its lumps turning as it goes",
  arrive(s, a) {
    const e = smoothstep(a);
    const open = 0.5 * smoothstep(clamp01((s.m.age - 0.15) / 0.35));
    halo(s, s.place, s.r * 3, 0.45 * e);
    wave(s, s.place, (s.m.age - 0.15) / 0.7, 1.6);
    const body = drop(intoPlace(s, a), s.r * (1 + 0.15 * open), {
      petals: { n: 5, depth: open },
      spin: s.time * 0.8,
    });
    paintDrop(s, body, 0.85 * e);
  },
  back(s, b) {
    const sec = b * RETURN;
    const open = 0.5 * (1 - smoothstep(clamp01(b / 0.3)));
    if (b >= 0.85) return landed(s, sec - 0.85 * RETURN, 0);
    const v = smoothstep(clamp01((b - 0.1) / 0.75));
    const q = homeward(s, v);
    halo(s, q, s.r * 3, 0.45 * (1 - v));
    const body = drop(q, s.r * (1 + 0.15 * open), {
      petals: { n: 5, depth: open },
      spin: s.time * 0.8 + (v * homeLength(s)) / s.r,
    });
    paintDrop(s, body, 0.85 * (1 - v));
  },
};
