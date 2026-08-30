import { auraPass, clipGroup, fillPass, rimPass } from "./parts.js";
import { streamFor } from "./seed.js";
import { type Skin, type SkinContext, SVG } from "./types.js";

/**
 * A body packed with compartments, each holding its own level, and a scatter of
 * swellings over them.
 *
 * Converted from the Galaxy Defense stage boss the same way THE BURR and THE
 * POMMEL were, and it is the half of that picture a contour cannot carry. The
 * source says almost everything with fill: a near-black shell, dark red masses
 * inside it, and pale blisters with a bright vent at the centre of each. The
 * outline conversions deliberately dropped all of it, on the correct ground
 * that none of it reaches a phone at 26 px — and then a boss is drawn several
 * times that size, which is the gap `docs/alive.md` sends to a vote and the
 * reason this is a skin rather than a change to anything.
 *
 * **Three things were got wrong first, and each is a rule now.**
 *
 * A single level straight across the body reads as a waterline in a jar: one
 * volume with a lid. The source is not one volume, it is several compartments
 * with shell showing between them, which is why it looks packed rather than
 * filled.
 *
 * Compartments with a hard edge and a bright line across them read as **lips**.
 * The edge goes back into the shell through `vignette`, so what is left is a
 * mass with a lumpy top rather than a rimmed bowl.
 *
 * And that was still not enough, because the tell was never the edge — it was
 * *symmetry*. Two masses of the same size at the same height are a mouth
 * however soft they are. `place` staggers height and size deliberately and the
 * bands it draws from never overlap.
 */

/** How many compartments. More than five is mush at card size. */
const CHAMBERS = 5;
/** How many swellings sit over them. */
const BLISTERS = 6;
/** Samples along one lumpy top. */
const CREST = 26;

interface Chamber {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rot: number;
  top: number;
  alpha: number;
}

/**
 * The compartments, in units of `reach`.
 *
 * Drawn from bands rather than freely, so a mass is never centred and two are
 * never the same height: the first is the wide one across the middle, then two
 * low ones at deliberately different sizes, then two small ones out at the
 * sides. Every number is jittered off the shape's own stream, so no two bodies
 * on the page are packed alike and each is the same on every reload.
 */
function place(rnd: () => number): Chamber[] {
  const bands: [number, number, number, number][] = [
    // cx, cy, rx, ry — the centre of each band, before jitter.
    [-0.12, 0.02, 0.68, 0.38],
    [-0.44, 0.46, 0.36, 0.3],
    [0.3, 0.58, 0.5, 0.28],
    [0.56, 0.08, 0.26, 0.22],
    [-0.62, -0.06, 0.22, 0.18],
  ];
  return bands.slice(0, CHAMBERS).map(([cx, cy, rx, ry], i) => {
    const j = (k: number): number => (rnd() - 0.5) * k;
    const y = cy + j(0.1);
    return {
      cx: cx + j(0.12),
      cy: y,
      rx: rx * (1 + j(0.24)),
      ry: ry * (1 + j(0.24)),
      rot: j(40),
      // The level sits above the centre, so the mass reads as most of the
      // compartment rather than as a puddle in the bottom of it.
      top: y - ry * 0.9,
      alpha: 0.95 - i * 0.11,
    };
  });
}

/** One lumpy top, closed downward. Wide enough that its ends are always clipped. */
function crest(c: Chamber, reach: number, freq: number, phase: number): string {
  const span = reach * 1.6;
  let d = "";
  for (let i = 0; i <= CREST; i++) {
    const x = -span + (i / CREST) * span * 2;
    const u = x / reach;
    const y =
      c.top * reach +
      (Math.sin(u * freq + phase) + Math.sin(u * freq * 2.3 + phase * 1.7) * 0.4) * reach * 0.035;
    d += `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return `${d}L ${span.toFixed(1)} ${(reach * 2).toFixed(1)} L ${(-span).toFixed(1)} ${(reach * 2).toFixed(1)} Z`;
}

function el<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string>,
): SVGElementTagNameMap[K] {
  const n = document.createElementNS(SVG, tag) as SVGElementTagNameMap[K];
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
}

function ellipse(c: Chamber, reach: number, attrs: Record<string, string>): SVGEllipseElement {
  const cx = (c.cx * reach).toFixed(1);
  const cy = (c.cy * reach).toFixed(1);
  return el("ellipse", {
    cx,
    cy,
    rx: (c.rx * reach).toFixed(1),
    ry: (c.ry * reach).toFixed(1),
    transform: `rotate(${c.rot.toFixed(1)} ${cx} ${cy})`,
    ...attrs,
  });
}

export const CHAMBER: Skin<"chamber"> = {
  id: "chamber",
  label: "CHAMBER",
  hint: "compartments with their own levels, and blisters over them",
  build(ctx: SkinContext) {
    const rnd = streamFor(ctx.name);
    const R = ctx.reach;

    const pool = el("linearGradient", {
      id: `${ctx.uid}-pool`,
      x1: "0",
      y1: "0",
      x2: "0",
      y2: "1",
    });
    for (const [offset, alpha] of [
      ["0%", "0.6"],
      ["18%", "0.62"],
      ["45%", "0.4"],
      ["100%", "0.12"],
    ] as const) {
      pool.appendChild(el("stop", { offset, "stop-color": ctx.colour, "stop-opacity": alpha }));
    }
    ctx.defs.appendChild(pool);

    // Back to the card's own dark, never to the rim colour — `corePass`'s rule,
    // for the same reason: a gradient that brightens an edge erodes it, and
    // this one exists precisely to make an edge stop being one.
    const vig = el("radialGradient", { id: `${ctx.uid}-vig` });
    vig.appendChild(el("stop", { offset: "45%", "stop-color": "#07060F", "stop-opacity": "0" }));
    vig.appendChild(el("stop", { offset: "100%", "stop-color": "#07060F", "stop-opacity": "1" }));
    ctx.defs.appendChild(vig);

    const blister = el("radialGradient", { id: `${ctx.uid}-blister`, cx: "38%", cy: "30%" });
    for (const [offset, alpha] of [
      ["0%", "0.95"],
      ["55%", "0.5"],
      ["100%", "0.14"],
    ] as const) {
      blister.appendChild(el("stop", { offset, "stop-color": ctx.colour, "stop-opacity": alpha }));
    }
    ctx.defs.appendChild(blister);

    fillPass(ctx);

    const inside = clipGroup(ctx, "chambers");
    const chambers = place(rnd);
    // Each level drifts on its own period, so the body is never a set of masses
    // that heave together — the reasoning `studded.ts` uses for a rim, which is
    // the same claim about an interior.
    const levels = chambers.map((c, i) => {
      const g = el("g", { opacity: c.alpha.toFixed(2) });
      g.appendChild(ellipse(c, R, { fill: ctx.colour, "fill-opacity": "0.16" }));
      const wave = el("path", {
        d: crest(c, R, 3.4 + i * 0.9, 0.4 + i * 1.9),
        fill: `url(#${ctx.uid}-pool)`,
      });
      g.appendChild(wave);
      g.appendChild(ellipse(c, R, { fill: `url(#${ctx.uid}-vig)` }));
      inside.appendChild(g);
      return { wave, period: 4.4 + i * 1.3, swing: R * 0.02 };
    });

    // The swellings. Upper half only: that is where the source gathers them,
    // and it is what gives the body a front at all once the light is off.
    const vents: SVGCircleElement[] = [];
    for (let i = 0; i < BLISTERS; i++) {
      const a = -Math.PI + (i + 0.5) * (Math.PI / BLISTERS) + (rnd() - 0.5) * 0.3;
      const r = (0.28 + rnd() * 0.46) * R;
      const s = (0.07 + rnd() * 0.09) * R;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r * 0.94;
      ctx.body.appendChild(
        el("circle", {
          cx: x.toFixed(1),
          cy: y.toFixed(1),
          r: s.toFixed(1),
          fill: `url(#${ctx.uid}-blister)`,
        }),
      );
      const dot = el("circle", {
        cx: (x + s * 0.06).toFixed(1),
        cy: (y + s * 0.08).toFixed(1),
        r: (s * 0.3).toFixed(1),
        fill: ctx.colour,
      });
      ctx.body.appendChild(dot);
      vents.push(dot);
    }

    auraPass(ctx);
    rimPass(ctx);

    ctx.onFrame(({ t, beat }) => {
      for (const l of levels) {
        const dy = Math.sin((t / l.period) * Math.PI * 2) * l.swing;
        l.wave.setAttribute("transform", `translate(0 ${dy.toFixed(2)})`);
      }
      // The vents brighten together on the page's beat. Together on purpose:
      // it is the one thing here that is a heartbeat, and a heartbeat only
      // reads as one because everything does it at once.
      const lit = (0.55 + 0.45 * Math.sin(beat * Math.PI * 2)).toFixed(2);
      for (const v of vents) v.setAttribute("fill-opacity", lit);
    });
  },
};
