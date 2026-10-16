import { describe, expect, it } from "bun:test";
import { closeBrowser } from "../browser.js";

/**
 * **A launch that never finished fails once.** Under load the `beforeAll` in
 * `page-said.test.ts` ran out of its 120 s before the browser came up, and its
 * `afterAll` then threw on `browser.close` of `undefined` — one timeout read
 * as two failures, the second hiding the first (`docs/queue.md`, 16 October
 * 2026).
 */
describe("closing a browser that never came", () => {
  it("does nothing, and does not throw", async () => {
    await expect(closeBrowser(undefined)).resolves.toBeUndefined();
  });
});
