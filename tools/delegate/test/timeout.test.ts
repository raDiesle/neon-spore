import { describe, expect, test } from "bun:test";
import { ceilingMs } from "../timeout.js";

describe("ceilingMs", () => {
  test("unset returns default", () => {
    expect(ceilingMs({})).toBe(480000);
  });

  test("empty string returns default", () => {
    expect(ceilingMs({ DELEGATE_TIMEOUT_MIN: "" })).toBe(480000);
  });

  test("whole number", () => {
    expect(ceilingMs({ DELEGATE_TIMEOUT_MIN: "2" })).toBe(120000);
  });

  test("fractional number", () => {
    expect(ceilingMs({ DELEGATE_TIMEOUT_MIN: "0.5" })).toBe(30000);
  });

  test("non-numeric returns default", () => {
    expect(ceilingMs({ DELEGATE_TIMEOUT_MIN: "abc" })).toBe(480000);
  });

  test("zero returns default", () => {
    expect(ceilingMs({ DELEGATE_TIMEOUT_MIN: "0" })).toBe(480000);
  });

  test("negative returns default", () => {
    expect(ceilingMs({ DELEGATE_TIMEOUT_MIN: "-3" })).toBe(480000);
  });
});
