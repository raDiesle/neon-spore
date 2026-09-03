import { describe, expect, test } from "bun:test";
import { CHROME_CANDIDATES, pickChrome } from "../chrome.js";

/**
 * The one thing worth asserting about a list of paths: that a machine carrying
 * exactly one of them finds it. The owner alternates Windows and macOS and
 * every picture-taking script comes through `findChrome`, so a platform missing
 * from the list is six commands throwing at once — and nothing but a row here
 * notices, because the machine running the test only ever has its own browser.
 */

/** A disk with exactly one browser on it. */
function only(path: string): (candidate: string) => boolean {
  return (candidate) => candidate === path;
}

const MACHINES: [string, string][] = [
  ["Windows, Chrome", "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"],
  ["Windows, Edge", "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"],
  ["macOS, Chrome", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"],
  ["macOS, Chromium", "/Applications/Chromium.app/Contents/MacOS/Chromium"],
  ["macOS, Edge", "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"],
  ["Linux", "/usr/bin/google-chrome"],
  ["the cloud sandbox", "/opt/pw-browsers/chromium"],
];

describe("pickChrome over the shipped candidates", () => {
  for (const [machine, path] of MACHINES) {
    test(`finds the browser on ${machine}`, () => {
      expect(pickChrome(CHROME_CANDIDATES, only(path))).toBe(path);
    });
  }
});
