import { type PulseState, pulseNoteTick } from "@neon-spore/sim";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawPulseArrival } from "./pulse-body.js";
import { arrivalBox, bodyRadius } from "./pulse-fall.js";
import type { PulseField } from "./pulse-lane.js";
import { pulseLaneColor, pulseLaneRim } from "./pulse-shape.js";
import type { ViewState } from "./renderer.js";

/**
 * A body nobody answered falls into the ship.
 *
 * The owner asked for it in one line — *let the arrows who were incorrect, not
 * in time, fall inside the ship like meteors do* — and it is the thing that
 * turns a drained bar into a picture. Until this, a dropped one simply stopped
 * being drawn and a number somewhere went down; now it goes past its socket at
 * the speed it was already falling, sinks through the skin, and leaves a mark
 * in its own colour. **An impact is drawn in the colour of the thing that made
 * it**, never a generic damage red — the rule the rest of the game already
 * follows.
 *
 * **A meteor is what this was written for and a pod is the awkward one.** Three
 * of the four are things that should never have reached the hull, so a crater
 * is the honest mark. A pod is a *gift* the pair failed to catch, and a pod
 * that punched a hole in the ship would be teaching the opposite of every wave
 * it appears on. The owner was asked and chose: it **smashes** — the same
 * drain, drawn as a spill spreading on the skin rather than a pit in it.
 *
 * **It costs the hull nothing, and that is the owner's call too.** The shared
 * meter is still the accounting — empty it and the ship pays
 * (`sim/pulse-round.ts`) — so nothing here reaches the simulation, and the
 * round is exactly as hard as it was.
 *
 * **There is no state in this file and there must not be.** A drop is worked
 * out from the world alone: a note this seat has judged as a miss expired on a
 * tick the chart already fixes, so where it is now is a function of
 * `world.tick` and nothing else. That is what keeps two devices showing the
 * same fall — and it is also why a round that restarts cannot leave one
 * hanging in the air, which is the trap anything remembered across a frame
 * falls into here (`render-state.ts`).
 *
 * **And it is the one part of the round that does not take the picture's
 * lead.** The arrows fall `ViewState.leadTicks` ahead of the simulation so a
 * thumb landing on the line produces a command landing on the note
 * (`pulse-fall.ts`), and a drop cannot: it starts on the tick a body was given
 * up on, and *given up on* is a verdict this device only holds once the tick
 * has run. So a body rests in its socket for the length of the lead on top of
 * its own grace period, and then goes through — which is the honest picture,
 * because for that stretch nobody has decided anything about it yet.
 */

/** How long a drop is on the screen after it expires, in ticks. About a beat. */
const LIFE = 70;

/** How much of a drop's life is spent at full strength before it starts going
 * out. The rest is the mark fading: a drop that faded to nothing mid-air would
 * read as a body this seat got away with. */
const FADE_FROM = 0.55;

export function drawPulseDrops(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  boss: PulseState,
  field: PulseField,
  seat: 1 | 2,
): void {
  const cfg = view.world.cfg;
  const tick = view.world.tick;
  const judged = seat === 1 ? boss.judged1 : boss.judged2;
  const from = seat === 1 ? boss.from1 : boss.from2;
  const r = bodyRadius(field);
  // Backwards from the cursor: everything below it is resolved, and the notes
  // are in step order, so the walk stops at the first one too old to show.
  for (let i = from - 1; i >= 0; i--) {
    const note = boss.notes[i];
    if (note === undefined) continue;
    // The tick `pulseExpire` gives up on it: one past the end of its own
    // window. Called out of the chart's own two numbers rather than guessed —
    // a drop that started a tick early would start above its socket.
    const gone = pulseNoteTick(cfg, boss.startTick, note) + cfg.pulseGoodTicks + 1;
    const age = tick - gone;
    if (age > LIFE) break;
    if (judged[i] !== 3 || age < 0) continue;
    const box = arrivalBox(field, note, seat);
    if (box === undefined) continue;

    // **It sinks from the socket it was resting in**, at the speed it fell at,
    // so the moment nobody dealt with it is the moment it goes through. The
    // part of the body below the skin is simply not drawn, and what the eye
    // sees is a thing being swallowed by the hull rather than one parked on
    // the surface — the owner's own word for what should happen.
    const speed = (box.landY - field.topY) / Math.max(1, cfg.pulseLeadTicks);
    const y = box.landY + age * speed;
    if (y - r > box.landY) continue;
    const life = age / LIFE;
    const fade = life < FADE_FROM ? 1 : Math.max(0, 1 - (life - FADE_FROM) / (1 - FADE_FROM));

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, l.width, box.landY);
    ctx.clip();
    ctx.globalAlpha = fade;
    drawPulseArrival(ctx, {
      x: box.x,
      y,
      r,
      lane: note.lane,
      seed: i,
      time: view.time,
      near: 1,
      // Whatever it was on the way down it is legible now: a body that hit the
      // ship has stopped being a question.
      veiled: false,
    });
    ctx.restore();
    mark(ctx, box.x, box.landY, r, note.lane, fade);
  }
}

/**
 * Where it went in: the hull marked in the body's own colour, and the light of
 * the impact going out.
 *
 * Two marks and neither of them is a ring. The hot one is the light the impact
 * throws, in the body's rim colour; under it a bloom sitting *on* the skin
 * that the hull's own sheen shows through, which is what makes it read as the
 * ship being marked rather than as a sticker on it. A **pod spills** instead —
 * wider, flatter and with no dark core, because nothing was driven into
 * anything: a lamp broke open on the plating and ran. Both fade with the body,
 * because the owner asked for the fall and the damage, not for a hull that
 * collects a hundred permanent holes over a minute of music.
 */
function mark(
  ctx: CanvasRenderingContext2D,
  x: number,
  skin: number,
  r: number,
  lane: Parameters<typeof pulseLaneColor>[0],
  fade: number,
): void {
  const spill = lane === "pod";
  const rx = r * (spill ? 2.4 : 1.5);
  const ry = r * (spill ? 0.42 : 0.7);
  const wash = ctx.createRadialGradient(x, skin, 0, x, skin, rx);
  wash.addColorStop(0, spill ? pulseLaneRim(lane) : PALETTE.background);
  wash.addColorStop(0.55, `${pulseLaneColor(lane)}55`);
  wash.addColorStop(1, `${pulseLaneColor(lane)}00`);
  ctx.save();
  ctx.globalAlpha = (spill ? 0.55 : 0.7) * fade;
  ctx.fillStyle = wash;
  ctx.beginPath();
  ctx.ellipse(x, skin, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  halo(ctx, x, skin, r * 2.2, pulseLaneRim(lane), 0.5 * fade);
}
