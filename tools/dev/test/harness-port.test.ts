import { describe, expect, test } from "bun:test";
import { harnessPort } from "../harness-port.js";

describe("harnessPort", () => {
  test("takes the port the harness set for an autoPort entry", () => {
    expect(harnessPort({ PORT: "3000" })).toBe(3000);
  });

  test("gives nothing outside the harness, or for a PORT that is no port", () => {
    for (const PORT of [undefined, "", "0", "-1", "65536", "3000.5", "http"]) {
      expect(harnessPort({ PORT })).toBeUndefined();
    }
  });
});
