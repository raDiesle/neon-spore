import {
  type BatonState,
  batonDrawAsks,
  batonStripAsks,
  type SimConfig,
  type SimEvent,
} from "@neon-spore/sim";
import { batonDrawRest, batonSwellRest } from "./baton-grip.js";
import { socketPoint } from "./baton-socket-draw.js";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import { handleRadius } from "./handle-draw.js";
import type { Layout } from "./layout.js";
import { drawMarkHalo } from "./mark-feedback.js";
import { showsCannon, showsShield, type ViewRole } from "./view-role.js";

/**
 * **THE BATON's arm answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*).
 *
 * Two marks, and both already stand on one screen at a time
 * (`baton-grip.ts`): the shell's ring on the locked seat's, the draw's rings
 * one on each. **The halo stands under whichever of them asks this seat for a
 * thumb** — the shell while the locked seat's thumb is off it, since every
 * strip is a fresh press, and a bead until its own seat's thumb is down
 * (`sim/baton-hand.ts` `batonStripAsks`, `batonDrawAsks`).
 *
 * **No partner's clock.** The strip is one seat's and nobody waits on it but
 * the shell; the draw does wait on the other thumb, but whether it is down is
 * the one sentence this fight makes the pair say, and a clock on it would say
 * it for them.
 *
 * A strip, a thumb landing on its bead and the two beads becoming one wash
 * their socket green (`batonStripped`, `batonHeld`, `batonMerged`); a press the
 * simulation refuses — the unlocked seat on the shell, a thumb on the
 * partner's bead — washes it red (`batonRefused`). Keys are the socket. Held
 * in `BossBlows`, the fx class of the bosses with none of their own
 * (`boss-blows.ts`).
 */
export class BatonMarks {
  /** Was the last touch on each socket right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "batonStripped" || e.type === "batonHeld" || e.type === "batonMerged") {
        this.verdicts.mark(e.socket, true);
      }
      if (e.type === "batonRefused") this.verdicts.mark(e.socket, false);
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}

/** Whether this role is that seat's screen. The director's `both` is both. */
function seatShows(role: ViewRole, player: 1 | 2): boolean {
  return player === 1 ? showsCannon(role) : showsShield(role);
}

/** The halo under each ring that asks this screen's seat, drawn before the rings. */
export function drawBatonAsked(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: BatonState,
  beat: number,
  time: number,
): void {
  for (const player of [1, 2] as const) {
    if (!seatShows(l.role, player)) continue;
    const rest =
      b.stage === "merging"
        ? batonDrawAsks(b, player)
          ? batonDrawRest(l, cfg, b, player)
          : null
        : batonStripAsks(b, player, beat)
          ? batonSwellRest(l, cfg, b)
          : null;
    if (rest !== null) drawMarkHalo(ctx, rest.x, rest.y, rest.r, time);
  }
}

/**
 * The verdict round each socket, last of all. Not held to the ring still being
 * offered: the last strip sheds the shell and the merge ends the draw on the
 * very tick they are made, and that green is the one worth seeing.
 */
export function drawBatonVerdicts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: BatonState,
  verdicts: GripVerdicts,
): void {
  if (b.stage !== "passing" && b.stage !== "merging" && b.stage !== "crossing") return;
  const r = handleRadius(l, cfg);
  for (let socket = 0; socket < b.sockets.length; socket++) {
    const v = verdicts.at(socket);
    if (v === null) continue;
    const at = socketPoint(l, cfg, b, socket);
    drawVerdictRing(ctx, at.x, at.y, r, v);
  }
}
