import { mix32 } from "./hash.js";

/**
 * What every sky behind the field is drawn from (`skies.ts`): a hash in
 * place of `Math.random`, a hex colour with an alpha, and the act's tint.
 * None of it is stored anywhere — every value is a pure function of an
 * index or of `wave` (world state, already identical on both screens), so
 * there is nothing here for `Effects.reset()` to ever have to forget.
 *
 * The sea the field used to sit in — a wash, light shafts, a horizon band,
 * two depths of dust and a light in the corner — went on 16 October 2026,
 * when the owner called it *boring and empty* and asked for the skies.
 */

/** A pure bit-mixing hash — not `Math.random`. The same index always gives
 * the same value, on both screens, on every frame: a star's place is looked
 * up here, never rolled. */
export function hash01(seed: number): number {
  return mix32((seed * 0x9e3779b1) >>> 0, 15) / 4294967296;
}

export function withAlpha(hex: string, alpha: number): string {
  const byte = Math.round(Math.max(0, Math.min(1, alpha)) * 255);
  return `${hex}${byte.toString(16).padStart(2, "0")}`;
}

/**
 * A handful of dark, desaturated tints — one per act. There is no `Act` type
 * yet (the wave is the finest-grained thing the world tracks), so `wave` is
 * the closest stand-in: cheap and correct today, worth swapping for a real
 * act index if acts ever get named as their own thing.
 */
const WASH_TINTS = ["#241B4F", "#152A45", "#3A1B45", "#123B2E", "#402313"] as const;

export function tintFor(wave: number): string {
  const i = ((wave % WASH_TINTS.length) + WASH_TINTS.length) % WASH_TINTS.length;
  return WASH_TINTS[i]!;
}
