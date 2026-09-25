import { type Field, type Hold, type Layout, touchDown } from "@neon-spore/render";
import type { Command, TimedCommand } from "@neon-spore/sim";

/**
 * **The autopilot's finger, drawn where a thumb would be.** The hands send
 * commands, not points, so a hand playing a seat moves the world and shows
 * no finger doing it — the owner, 25 September 2026: *I cannot see full
 * animation of movement, like player would swipe away in some speed.*
 *
 * **The point is found by the game's own hit test, run backwards.** A drag
 * reports how far the finger has come from where it grabbed, in thousandths
 * of a tile (`render/touch.ts` `touchMove`), and where it grabbed is the
 * `Hold`'s origin. So at a grab the field is swept with `touchDown` for that
 * seat until a press answers with a hold on the same target, and from then on
 * the finger is that origin plus the carry — the inverse of what a device
 * does, with no second table of where each boss keeps its handles. A press
 * that is not a drag is found the same way and drawn as a tap.
 *
 * A handle that is *turned* rather than carried — the crank, the rings, a
 * seam or a rim — reports an angle, and its finger stays on the grab.
 */

type Sent = Omit<TimedCommand, "tick">;

interface Thumb {
  /** What it is on: a drag's target and id, or a press's kind. */
  key: string;
  originX: number;
  originY: number;
  x: number;
  y: number;
  turns: boolean;
  /** Down on a drag. False for a tap, or a drag let go of. */
  held: boolean;
  /** The tick it last had a command, and the tick a tap went down. */
  seen: number;
  tap: number;
  /** The carry the last command reported, so a re-grab is noticed. */
  carried: boolean;
}

/** How finely the field is swept for a grab, in tiles. */
const SWEEP = 0.5;

const TURNED = new Set(["crank", "gimbalOuter", "gimbalInner"]);

function keyOf(c: Command): string {
  if (c.kind !== "drag") return c.kind;
  return `drag:${c.target}:${c.id ?? ""}`;
}

/** Where a press on this field would take hold of what `c` is sent to. */
function sweep(l: Layout, field: Field, c: Command): Hold | { x: number; y: number } | null {
  const step = Math.max(4, l.tile * SWEEP);
  for (let y = step / 2; y < l.height; y += step) {
    for (let x = step / 2; x < l.width; x += step) {
      const t = touchDown(l, x, y, field);
      if (!t) continue;
      if (c.kind === "drag") {
        const h = t.hold;
        if (h?.kind === "drag" && h.target === c.target && (c.id === undefined || h.id === c.id))
          return h;
      } else if (t.command?.kind === c.kind) {
        return { x, y };
      }
    }
  }
  return null;
}

/** One of the autopilot's thumbs, as a test or a reader sees it. */
export interface Finger {
  seat: 1 | 2;
  x: number;
  y: number;
  held: boolean;
}

export class AutopilotGhosts {
  private readonly thumbs = new Map<1 | 2, Thumb>();
  /** A sweep that found nothing, not tried again for the same thing until a
   * beat has gone by — a thousand hit tests a tick is not a finger. */
  private readonly missed = new Map<string, number>();

  fingers(): Finger[] {
    return [...this.thumbs].map(([seat, t]) => ({ seat, x: t.x, y: t.y, held: t.held }));
  }

  clear(): void {
    this.thumbs.clear();
    this.missed.clear();
  }

  private find(l: Layout, field: Field, seat: 1 | 2, tick: number, c: Command, tpb: number) {
    const key = `${seat}|${keyOf(c)}`;
    const at = this.missed.get(key);
    if (at !== undefined && tick - at < tpb && tick >= at) return null;
    const found = sweep(l, field, c);
    if (found) this.missed.delete(key);
    else this.missed.set(key, tick);
    return found;
  }

  /** One tick of what the autopilot sent, read into where its thumbs are. */
  observe(
    l: Layout,
    field: (seat: 1 | 2) => Field,
    tick: number,
    ticksPerBeat: number,
    sent: readonly Sent[],
  ): void {
    for (const seat of [1, 2] as const) {
      const mine = sent.filter((s) => s.player === seat);
      const c = mine.find((s) => s.command.kind === "drag")?.command ?? mine[0]?.command;
      if (c) this.one(l, field(seat), seat, tick, ticksPerBeat, c);
    }
  }

  private one(l: Layout, field: Field, seat: 1 | 2, tick: number, tpb: number, c: Command): void {
    const was = this.thumbs.get(seat);
    const key = keyOf(c);
    if (c.kind === "drag") {
      if (!c.on) {
        if (was) Object.assign(was, { held: false, seen: tick });
        return;
      }
      const dx = c.fromMilli;
      const dy = c.fromYMilli ?? 0;
      const carried = dx !== 0 || dy !== 0;
      const grab = !was || was.key !== key || !was.held || (was.carried && !carried);
      let thumb = was;
      if (grab || !thumb) {
        const h = this.find(l, field, seat, tick, c, tpb);
        if (!h || !("kind" in h) || h.kind !== "drag") return;
        const turns =
          TURNED.has(h.target) || h.turns === true || h.well !== undefined || h.rim !== undefined;
        thumb = {
          key,
          originX: h.originX,
          originY: h.originY,
          x: h.originX,
          y: h.originY,
          turns,
          held: true,
          seen: tick,
          tap: -1,
          carried,
        };
        this.thumbs.set(seat, thumb);
      }
      thumb.seen = tick;
      thumb.carried = carried;
      thumb.x = thumb.turns ? thumb.originX : thumb.originX + (dx * l.tile) / 1000;
      thumb.y = thumb.turns ? thumb.originY : thumb.originY + (dy * l.tile) / 1000;
      return;
    }
    // A press. Swept once per kind and then left where it was found, so a
    // command sent every tick costs one sweep and not one a tick.
    if (was && was.key === key && !was.held) {
      was.seen = tick;
      return;
    }
    const at = this.find(l, field, seat, tick, c, tpb);
    if (!at || "kind" in at) return;
    this.thumbs.set(seat, {
      key,
      originX: at.x,
      originY: at.y,
      x: at.x,
      y: at.y,
      turns: false,
      held: false,
      seen: tick,
      tap: tick,
      carried: false,
    });
  }

  /** In the layout's own coordinates — the caller has moved the context onto the stage. */
  paint(ctx: CanvasRenderingContext2D, l: Layout, tick: number, ticksPerBeat: number): void {
    for (const [seat, t] of this.thumbs) {
      const idle = (tick - t.seen) / ticksPerBeat;
      // A drag still down stays; anything else fades over half a beat.
      const fade = t.held ? 1 : Math.max(0, 1 - idle * 2);
      if (fade <= 0) {
        this.thumbs.delete(seat);
        continue;
      }
      const r = l.tile * 0.42;
      ctx.globalAlpha = 0.85 * fade;
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.strokeStyle = seat === 1 ? "#ffd166" : "#7ee7ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (t.tap >= 0) {
        const grow = Math.min(1, (tick - t.tap) / (ticksPerBeat / 2));
        ctx.globalAlpha = 0.85 * (1 - grow);
        ctx.beginPath();
        ctx.arc(t.x, t.y, r * (1 + grow), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = fade;
      ctx.fillStyle = ctx.strokeStyle;
      ctx.font = `bold ${Math.round(l.tile * 0.32)}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      // P1 over its disc and P2 under it: the two thumbs are often a tile
      // apart on one line, and two labels on one side overprint.
      ctx.textBaseline = seat === 1 ? "bottom" : "top";
      ctx.fillText(`AUTO P${seat}`, t.x, seat === 1 ? t.y - r - 2 : t.y + r + 2);
    }
    ctx.globalAlpha = 1;
  }
}
