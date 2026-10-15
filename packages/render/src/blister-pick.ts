/**
 * Which of a gesture's bodies a blister wears, `0` to `count - 1`, read off its
 * id so both screens of the pair draw the same one and it does not change while
 * the blister is up. The id is mixed first, so neighbours spawned in a row do
 * not step through the bodies in order. COMBO's BUD or CURL
 * (`blister-combo.ts`), HOLD's PALM or HUG (`drawHoldBody`, which mixes the
 * tile in too), RUB's URCHIN, WASHBOARD or PURR (`blister-rub.ts`) and SWIPE's SLUG or ZIP
 * (`blister-swipe-body.ts`).
 */
export function blisterBodyOf(id: number, count: number): number {
  return Math.floor(((Math.imul(id, 0x9e3779b1) >>> 0) * count) / 2 ** 32);
}
