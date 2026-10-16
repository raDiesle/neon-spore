/**
 * THE SWINDLE's ten, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **a slime that deals real pods and fake ones and shuffles
 * them**, and everything here is a sleight of hand in wet: the enter a low
 * heave with a riffle over it; a hand hung soft sacs filling; a swap a quick
 * slide; a shot stopped on a hood a dull tick off wet; a drop a wet release; a real pod taken a pop with a bright glint; a
 * fake refused a dull hollow knock; a hand cleared a falling moan and a ring.
 * **The hang, the swap and the drop are one sound whatever the pod is**
 * (`bind-swindle.ts`). Low and soft under the band, or short and high above
 * it, as ever (`docs/spec/audio.md` §1).
 */

import { after, air, glint, spore, sub, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_SWINDLE_SOUNDS: SoundDef[] = [
  {
    id: "boss.swindleEnter",
    family: "boss",
    blurb: "A low heave, and a riffle over it.",
    status: "bound",
    use: "THE SWINDLE coming in over the field, every hand still on her.",
    level: 0.42,
    layers: [sub(52, 0.55, 0.28), after(0.1, tick(0.12, 0, 3200)), after(0.18, tick(0.1, 0, 3600))],
  },
  {
    id: "boss.swindleHang",
    family: "boss",
    blurb: "Sacs filling: a hand of pods hung.",
    status: "bound",
    use: "A hand of THE SWINDLE's pods hung in a row, real and fake alike.",
    level: 0.34,
    layers: [spore(760, 0.3, 0.14, 30), after(0.08, spore(860, 0.3, 0.12, 30))],
  },
  {
    id: "boss.swindleSwap",
    family: "boss",
    blurb: "A quick slide: two pods trading places.",
    status: "bound",
    use: "Two of THE SWINDLE's pods begin to trade places.",
    level: 0.28,
    layers: [air(900, 1800, 0.22, 0.1, 2)],
  },
  {
    id: "boss.swindleHood",
    family: "boss",
    blurb: "A dull tick off wet: a shot stopped on a hood.",
    status: "bound",
    use: "A shot stopped on the hood of a pod THE SWINDLE still holds, real or fake alike.",
    level: 0.3,
    layers: [tick(0.12, 0, 1600), thud(360, 200, 0.03, 0.08)],
  },
  {
    id: "boss.swindleDrop",
    family: "boss",
    blurb: "A wet release: a pod let go.",
    status: "bound",
    use: "THE SWINDLE lets a pod go, real or fake — the same sound for both.",
    level: 0.32,
    layers: [thud(420, 180, 0.05, 0.14)],
  },
  {
    id: "boss.swindleTaken",
    family: "boss",
    blurb: "A pop and a glint: a real pod of hers swallowed.",
    status: "bound",
    use: "A real pod of THE SWINDLE's swallowed. Climbs as her real pods run out.",
    level: 0.42,
    layers: [tick(0.2, 0, 2200), after(0.05, glint(2800, 0.3, 0.1))],
  },
  {
    id: "boss.swindleRefused",
    family: "boss",
    blurb: "A dull hollow knock: a fake pod refused.",
    status: "bound",
    use: "A fake pod of THE SWINDLE's breaks on the shut maw, at no cost.",
    level: 0.36,
    layers: [thud(300, 140, 0.04, 0.16), after(0.04, thud(260, 120, 0.04, 0.12))],
  },
  {
    id: "boss.swindleCleared",
    family: "boss",
    blurb: "A falling moan and a bright ring: a hand cleared.",
    status: "bound",
    use: "Nothing of THE SWINDLE's lit hand left on the field; she rears back.",
    level: 0.46,
    layers: [
      air(1200, 450, 0.5, 0.14, 1.2),
      sub(54, 0.45, 0.2),
      after(0.25, glint(3000, 0.5, 0.12)),
    ],
  },
  {
    id: "boss.swindleSpent",
    family: "boss",
    blurb: "The swindle beaten: a crack, a deep fall, a long sigh.",
    status: "bound",
    use: "THE SWINDLE beaten: her last hand cleared.",
    level: 0.46,
    layers: [
      tick(0.28, 0, 2400),
      after(0.06, sub(44, 0.6, 0.34)),
      after(0.2, air(1000, 380, 0.8, 0.08, 1.4)),
    ],
  },
  {
    id: "boss.swindleOut",
    family: "boss",
    blurb: "The swindle gone, and the field clearing.",
    status: "bound",
    use: "THE SWINDLE gone — then the wave-end light.",
    level: 0.5,
    // The same shape as THE HYDRA's own out (`sounds/boss-hydra.ts`).
    layers: [
      sub(48, 0.5, 0.35),
      after(0.1, air(4000, 6800, 0.6, 0.14, 1.5)),
      after(0.4, glint(3100, 0.5, 0.14)),
      after(0.5, air(4200, 8800, 0.9, 0.16, 1.5)),
    ],
  },
];
