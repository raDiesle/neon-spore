import { describe, expect, it } from "bun:test";
import { byPackage, parseJunit, report } from "../profile-report.js";

/**
 * A report bun actually wrote, cut down to two files: the shape the regexes
 * in `profile-report.ts` are written against, backslashes and entities
 * included, because that is what a Windows run puts in the file.
 */
const XML = String.raw`<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="bun test" tests="3" assertions="5" failures="0" skipped="0" time="10.5">
  <testsuite name="packages\render\test\slow.test.ts" file="packages\render\test\slow.test.ts" tests="2" assertions="4" failures="0" skipped="0" time="9.25" hostname="">
    <testsuite name="a walk" file="packages\render\test\slow.test.ts" line="10" tests="2" assertions="4" failures="0" skipped="0" time="0" hostname="">
      <testcase name="draws it for p1" classname="a walk" time="7.0" file="packages\render\test\slow.test.ts" line="11" assertions="2" />
      <testcase name="draws the lane&apos;s other half" classname="a walk" time="2.25" file="packages\render\test\slow.test.ts" line="21" assertions="2" />
    </testsuite>
  </testsuite>
  <testsuite name="tools/check/test/quick.test.ts" file="tools/check/test/quick.test.ts" tests="1" assertions="1" failures="0" skipped="0" time="0.01" hostname="">
    <testcase name="is quick" classname="" time="0.01" file="tools/check/test/quick.test.ts" line="3" assertions="1" />
  </testsuite>
</testsuites>
`;

describe("reading bun's JUnit report", () => {
  const profile = parseJunit(XML);

  it("finds every file, slowest first, with forward slashes", () => {
    expect(profile.files.map((f) => f.file)).toEqual([
      "packages/render/test/slow.test.ts",
      "tools/check/test/quick.test.ts",
    ]);
    expect(profile.files[0]).toEqual({
      file: "packages/render/test/slow.test.ts",
      tests: 2,
      seconds: 9.25,
    });
  });

  /** The inner `describe` suites carry no `file="` of their own name and must not count as files. */
  it("does not mistake a describe block for a file", () => {
    expect(profile.files).toHaveLength(2);
  });

  it("finds every case, slowest first, with its entities unescaped", () => {
    expect(profile.cases.map((c) => c.name)).toEqual([
      "draws it for p1",
      "draws the lane's other half",
      "is quick",
    ]);
  });

  it("reads the run's own total", () => {
    expect(profile.total).toBe(10.5);
  });

  it("sums a package", () => {
    expect(byPackage(profile.files)).toEqual([
      ["packages/render", 9.25],
      ["tools/check", 0.01],
    ]);
  });
});

describe("the report", () => {
  const lines = report(parseJunit(XML), 1);

  it("leads with the whole run, and says when files do not add up to it", () => {
    expect(lines[0]).toContain("2 files, 3 cases, 10.5s in all");
    expect(lines[0]).toContain("9.3s inside files");
  });

  it("names the slowest file with its share of the run", () => {
    const line = lines.find((l) => l.includes("slow.test.ts") && l.includes("88%"));
    expect(line).toBeDefined();
  });

  it("cuts both lists at the top asked for", () => {
    expect(lines.filter((l) => l.includes("test.ts"))).toHaveLength(2);
  });
});
