import { expect, test } from "bun:test";
import type { WavesDoc } from "../src/waves-doc-api.js";
import { wavesDocState } from "../src/waves-doc-api.js";

/** DOCUMENTATION › WAVES reads both documents, the measured table included. */
test("/api/waves-doc answers the guide and the measured waves", async () => {
  const res = await wavesDocState();
  expect(res.ok).toBe(true);
  const doc = (await res.json()) as WavesDoc;
  expect(doc.guide).toContain("# Generated waves");
  expect(doc.today).toContain("## Every wave");
  expect(doc.today).toContain("## The whole game");
});
