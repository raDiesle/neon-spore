import { describe, expect, test } from "bun:test";
import { keepDays } from "../idle.js";

describe("keepDays", () => {
  test("unset is the default window", () => {
    expect(keepDays(undefined)).toBe(5);
    expect(keepDays("")).toBe(5);
  });

  test("a number is taken as given, zero included", () => {
    expect(keepDays("14")).toBe(14);
    expect(keepDays("0")).toBe(0);
  });

  test("a typo falls back rather than reading as sweep-everything-now", () => {
    expect(keepDays("soon")).toBe(5);
    expect(keepDays("-3")).toBe(5);
  });
});
