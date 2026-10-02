import type { BossState } from "./boss-union.js";
import { installBurgee } from "./burgee-step.js";
import { installCapstan } from "./capstan-step.js";
import { installCyst } from "./cyst-step.js";
import { installDavit } from "./davit-step.js";
import { installFlue } from "./flue-step.js";
import { installGall } from "./gall-step.js";
import { installGovernor } from "./governor-step.js";
import { installGrindstone } from "./grindstone-step.js";
import { installHalter } from "./halter-step.js";
import { installLamprey } from "./lamprey-step.js";
import { installMimic } from "./mimic-step.js";
import { installOculus } from "./oculus-step.js";
import { installPlumb } from "./plumb-step.js";
import { installRime } from "./rime-step.js";
import { installSeam } from "./seam-step.js";
import { installSling } from "./sling-step.js";
import { installTrivet } from "./trivet-step.js";
import { installVise } from "./vise-step.js";
import type { BossEntry, World } from "./world.js";

/**
 * **The clock bosses that install a script and nothing else** — THE SEAM and
 * every one after it, cut out of `wave-boss-clocks.ts` on 27 September 2026
 * when THE CAPSTAN's branch found that page at 250 lines exactly.
 *
 * The seam is the one the page already drew with a comment: all of these
 * leave the same nothing on the field — no creature, no row, a body over the
 * middle column and the script its wave authored (each one's
 * `<kind>-step.ts`) — so one comment covers the family and every branch is
 * one line. The next such boss goes on the end of the list and the chain.
 */

/** The kinds this file installs. Appended, like every list of boss kinds. */
export const SCRIPTED_KINDS = [
  "seam",
  "oculus",
  "vise",
  "rime",
  "trivet",
  "plumb",
  "sling",
  "grindstone",
  "cyst",
  "davit",
  "halter",
  "capstan",
  "gall",
  "burgee",
  "flue",
  "governor",
  "lamprey",
  "mimic",
] as const;

export type ScriptedEntry = Extract<BossEntry, { kind: (typeof SCRIPTED_KINDS)[number] }>;

export function isScriptedEntry(boss: BossEntry): boss is ScriptedEntry {
  return (SCRIPTED_KINDS as readonly string[]).includes(boss.kind);
}

export function installScripted(world: World, boss: ScriptedEntry): BossState {
  if (boss.kind === "seam") return installSeam(world, boss.steps);
  if (boss.kind === "oculus") return installOculus(world, boss.steps);
  if (boss.kind === "vise") return installVise(world, boss.steps);
  if (boss.kind === "rime") return installRime(world, boss.steps);
  if (boss.kind === "trivet") return installTrivet(world, boss.steps);
  if (boss.kind === "plumb") return installPlumb(world, boss.steps);
  if (boss.kind === "sling") return installSling(world, boss.steps);
  if (boss.kind === "grindstone") return installGrindstone(world, boss.steps);
  if (boss.kind === "cyst") return installCyst(world, boss.steps);
  if (boss.kind === "davit") return installDavit(world, boss.steps);
  if (boss.kind === "halter") return installHalter(world, boss.steps);
  if (boss.kind === "capstan") return installCapstan(world, boss.steps);
  if (boss.kind === "gall") return installGall(world, boss.steps);
  if (boss.kind === "burgee") return installBurgee(world, boss.steps);
  if (boss.kind === "flue") return installFlue(world, boss.steps);
  if (boss.kind === "governor") return installGovernor(world, boss.steps);
  if (boss.kind === "lamprey") return installLamprey(world, boss.steps);
  return installMimic(world, boss.steps);
}
