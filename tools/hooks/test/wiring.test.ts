import { describe, expect, it } from "bun:test";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * `.claude/settings.json` says how each hook is run, and nothing read it.
 *
 * That is the whole of how four hooks stopped working without anyone noticing:
 * every one was invoked as `bash .claude/hooks/<name>.sh`, and a session whose
 * shell has no `bash` on PATH — every PowerShell one on this machine — got no
 * formatting after an edit, no typecheck on stop and no automatic landing. The
 * scripts were fine. The line that named them was not, and it was the one line
 * no test looked at.
 *
 * So this reads the file the harness reads. It cannot prove a hook does the
 * right thing — that is what the other files here are for — but it does prove
 * the harness can start it at all, which is the failure that actually happened.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

interface Settings {
  hooks?: Record<string, { matcher?: string; hooks?: { type?: string; command?: string }[] }[]>;
}

async function settings(): Promise<Settings> {
  return JSON.parse(await Bun.file(join(ROOT, ".claude", "settings.json")).text()) as Settings;
}

async function commands(): Promise<string[]> {
  const found: string[] = [];
  for (const group of Object.values((await settings()).hooks ?? {})) {
    for (const entry of group) {
      for (const hook of entry.hooks ?? []) {
        if (hook.command !== undefined) found.push(hook.command);
      }
    }
  }
  return found;
}

describe("the hooks settings.json actually starts", () => {
  it("runs every one through bun, never through a shell that may not be there", async () => {
    const found = await commands();
    expect(found.length).toBeGreaterThan(0);
    for (const command of found) expect(command).toMatch(/^bun tools\/hooks\/[\w-]+\.ts$/);
  });

  it("names a file that exists, for every one of them", async () => {
    for (const command of await commands()) {
      const rel = command.slice("bun ".length);
      expect({ command, exists: existsSync(join(ROOT, ...rel.split("/"))) }).toEqual({
        command,
        exists: true,
      });
    }
  });

  /**
   * The same failure one line further along: the guard's matcher named `Bash`,
   * and on Windows the session's primary shell is the separate PowerShell tool.
   * Every rule the guard holds was unenforced the moment the command was typed
   * into the other one, silently, which is the only way these break.
   */
  it("puts the guard in front of both shells, not just Bash", async () => {
    const entries = (await settings()).hooks?.PreToolUse ?? [];
    const guard = entries.filter((entry) =>
      entry.hooks?.some((hook) => hook.command?.includes("guard.ts")),
    );
    expect(guard.length).toBe(1);
    for (const tool of ["Bash", "PowerShell"]) {
      expect({ tool, matched: new RegExp(guard[0]?.matcher ?? "$^").test(tool) }).toEqual({
        tool,
        matched: true,
      });
    }
  });

  it("leaves no shell script behind in .claude/hooks", async () => {
    // The directory is gone with the last of them. If one comes back, it is
    // either wired through `bash` again or wired to nothing at all.
    expect(existsSync(join(ROOT, ".claude", "hooks"))).toBe(false);
  });
});
