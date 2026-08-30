import { BLISTERS, crest, el, ellipse, INSIDE, place } from "./chamber-packing.js";
import { auraPass, clipGroup, fillPass, rimPass } from "./parts.js";
import { streamFor } from "./seed.js";
import type { Skin, SkinContext } from "./types.js";

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

export const CHAMBER: Skin<"chamber"> = {
  id: "chamber",
  label: "CHAMBER",
  hint: "compartments with their own levels, and blisters over them",
  build(ctx: SkinContext) {
    const rnd = streamFor(ctx.name);
    const R = ctx.reach * INSIDE;

    const pool = el("linearGradient", {
      id: `${ctx.uid}-pool`,
      x1: "0",
      y1: "0",
      x2: "0",
      y2: "1",
    });
    for (const [offset, alpha] of [
      ["0%", "0.42"],
      ["18%", "0.44"],
      ["45%", "0.26"],
      ["100%", "0.08"],
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
      // Each compartment clips its own level. Without this the wave spans the
      // whole body and every mass shares one horizon — a waterline in a jar,
      // which is the first of the three failures above and the one that came
      // back: the scratch drawing had this clip and the skin was written
      // without it, so the picture that was judged and the picture that
      // shipped were not the same picture. That is the whole argument for
      // `bun run shapes:still` existing.
      const clip = el("clipPath", { id: `${ctx.uid}-ch${i}` });
      clip.appendChild(ellipse(c, R, {}));
      ctx.defs.appendChild(clip);

      const g = el("g", {
        opacity: c.alpha.toFixed(2),
        "clip-path": `url(#${ctx.uid}-ch${i})`,
      });
      g.appendChild(ellipse(c, R, { fill: ctx.colour, "fill-opacity": "0.1" }));
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
    //
    // Clipped to the contour like the compartments are. They were not, and on
    // a body whose rim stands off — THE POMMEL — half of them landed on the
    // clubs instead of in the body, which reads as a fringe that has come off
    // rather than as an interior.
    const over = clipGroup(ctx, "blisters");
    const vents: SVGCircleElement[] = [];
    for (let i = 0; i < BLISTERS; i++) {
      const a = -Math.PI + (i + 0.5) * (Math.PI / BLISTERS) + (rnd() - 0.5) * 0.3;
      const r = (0.2 + rnd() * 0.4) * R;
      const s = (0.07 + rnd() * 0.09) * R;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r * 0.94;
      over.appendChild(
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
      over.appendChild(dot);
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
