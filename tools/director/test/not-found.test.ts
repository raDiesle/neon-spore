import { describe, expect, it } from "bun:test";
import { notFound } from "../src/not-found.js";

/** The director's last route (`src/not-found.ts`): a source asked for by path says restart. */
describe("the director's not-found answer", () => {
  it("tells a page asking for a source by path to restart the director", () => {
    const answer = notFound("/tools/director/src/director.css");
    expect(answer.status).toBe(404);
    expect(answer.body).toContain("Stop and start the director");
  });

  it("is a plain not found for anything else", () => {
    expect(notFound("/nothing-here")).toEqual({ status: 404, body: "not found" });
  });
});
