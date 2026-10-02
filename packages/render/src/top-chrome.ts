/**
 * **How far down from the top of the stage the game's own chrome reaches**, in
 * CSS pixels: under the ≡ button and the link chip, which reach 40 px down
 * (`apps/game/src/game.css`), and the seat switcher above them. No boss is
 * drawn above it (`boss-top.test.ts`, the owner, 29 September 2026).
 *
 * THE REPRISE's sac hangs under it (`reprise-draw.ts`), and THE SINEW's crown
 * is cut along it (`sinew-crown.ts`) — one number, so the two bosses that
 * reach for the top of the screen stop at the same line. THE SLOW's fuse
 * stood here until it moved under the body on 27 September 2026.
 */
export const TOP_CHROME_PX = 50;
