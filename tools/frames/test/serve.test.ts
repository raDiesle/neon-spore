import { describe, expect, it } from "bun:test";
import { portPatience, previewUrlFrom } from "../serve.js";

/**
 * The server's port read off its own stdout, and the sentence when there is
 * none.
 *
 * No process: the two streams are made from strings, because what is under
 * test is the reading and the wording. The wording was wrong for a day — a
 * worktree without its `bun install` made `preview:once` die in the build,
 * and `bun run frames` said only *exited before printing its port* while the
 * line naming the missing package sat on a stderr nobody read. `serve.ts` has
 * the rest.
 */

const encoder = new TextEncoder();

/** A stream that yields each chunk in turn and then closes. */
function chunks(...parts: string[]): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      for (const part of parts) controller.enqueue(encoder.encode(part));
      controller.close();
    },
  });
}

/** A stream that never yields and never closes: a build printing nothing. */
function silence(): ReadableStream<Uint8Array> {
  return new ReadableStream({ start() {} });
}

describe("previewUrlFrom", () => {
  it("reads the URL off the line the server prints", async () => {
    const stdout = chunks("$ vite preview --port 0\n  preview (built) on http://127.0.0.1:41733\n");
    expect(await previewUrlFrom(stdout, chunks())).toBe("http://127.0.0.1:41733");
  });

  it("reads a URL split across two chunks", async () => {
    const stdout = chunks("preview (bui", "lt) on http://127.0.0.1:4", "1733\n");
    expect(await previewUrlFrom(stdout, chunks())).toBe("http://127.0.0.1:41733");
  });

  it("carries stderr's last lines when the server exits without a port", async () => {
    const stderr = chunks(
      "$ vite build\n",
      'error: Could not resolve: "@firebase/app". Maybe you need to "bun install"?\n',
      'error: script "build" exited with code 1\n',
    );
    const failed = previewUrlFrom(chunks("$ bun run build\n"), stderr);
    await expect(failed).rejects.toThrow(
      'preview:once exited before printing its port:\n$ vite build\nerror: Could not resolve: "@firebase/app". Maybe you need to "bun install"?\nerror: script "build" exited with code 1',
    );
  });

  it("keeps only the last twelve lines of a long stderr", async () => {
    const lines = Array.from({ length: 20 }, (_, i) => `line ${i + 1}`);
    const failed = previewUrlFrom(chunks(), chunks(`${lines.join("\n")}\n`));
    await expect(failed).rejects.toThrow(/port:\nline 9\n(?:.*\n){10}line 20$/);
  });

  it("adds nothing after the sentence when stderr is empty", async () => {
    const failed = previewUrlFrom(chunks("nothing useful\n"), chunks("  \n"));
    await expect(failed).rejects.toThrow(/^preview:once exited before printing its port$/);
  });

  it("gives up on a server that prints nothing, rather than waiting on the read", async () => {
    const failed = previewUrlFrom(silence(), silence(), 50);
    await expect(failed).rejects.toThrow("preview:once never printed its port");
  });
});

describe("portPatience", () => {
  it("waits the flat figure on a machine with a core to spare", () => {
    expect(portPatience(0.3)).toBe(30_000);
    expect(portPatience(1)).toBe(30_000);
  });

  it("waits longer the more each core is running", () => {
    expect(portPatience(2.5)).toBe(75_000);
  });

  it("stops stretching at two minutes, which is a hung build and not a slow one", () => {
    expect(portPatience(40)).toBe(120_000);
  });

  it("says how long it waited and at what load when the port never comes", async () => {
    const failed = previewUrlFrom(silence(), silence(), 50);
    await expect(failed).rejects.toThrow(
      /in 0 s \(the wait scales with the load, \d+\.\d a core now\)/,
    );
  });
});
