import { RESOURCES } from "@/constants";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function getRandomType() {
  const hexTypes: Hex["type"][] = ["brick", "grain", "lumber", "ore", "wool"];
  const idx = Math.floor(Math.random() * hexTypes.length);
  return hexTypes[idx]!;
}

export function matches<S extends T, T = unknown>(e: T, predicate: (e: T) => e is S): S | false {
  return predicate(e) ? e : false;
}

export type GetStructureId<T extends Structure["type"]> = ReturnType<typeof getStructureId<T>>;
export function getStructureId<
  T extends Structure["type"],
  R = { id: T extends TownType ? TownId : RoadId; separatedIds: SingleIndexedId[] }
>(params: { type: T; hexes: Omit<Structure["hexes"][number], "indexedId">[] }): R {
  const concatenated = [...params.hexes]
    .sort((a, b) => +a.hex.id - +b.hex.id)
    .map((hex) => `${hex.hex.id}-${hex.roadIdx ?? hex.townIdx}` as SingleIndexedId)
    .join("|") as IndexedId;

  return {
    id: `${params.type}:${concatenated}`,
    separatedIds: params.hexes.map((hex) => `${hex.hex.id}-${hex.roadIdx ?? hex.townIdx}`)
  } as R;
}

export function shadeHexColor(color: string, percent: number) {
  var f = parseInt(color.slice(1), 16),
    t = percent < 0 ? 0 : 255,
    p = percent < 0 ? percent * -1 : percent,
    R = f >> 16,
    G = (f >> 8) & 0x00ff,
    B = f & 0x0000ff;
  return (
    "#" +
    (
      0x1000000 +
      (Math.round((t - R) * p) + R) * 0x10000 +
      (Math.round((t - G) * p) + G) * 0x100 +
      (Math.round((t - B) * p) + B)
    )
      .toString(16)
      .slice(1)
  );
}

export function rollDice(prevRoll?: number): { a: number; b: number; roll: number } {
  const a = Math.floor(Math.random() * 6) + 1;
  const b = Math.floor(Math.random() * 6) + 1;
  const roll = a + b;
  return prevRoll === roll ? rollDice(prevRoll) : { a, b, roll };
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function idx(i: number) {
  if (i > 5) return 0;
  if (i < 0) return 5;
  return i;
}

export const backgroundImageSvg = (iconCode: string, opacity = 1) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><text x="0" y="40" font-size="40" fill-opacity="${opacity}" fill="black">${iconCode.replace("#", "%23")}</text></svg>`;
  return `url('data:image/svg+xml,${svg}')`;
};

export function hexToRgb(color: string) {
  const r = color.slice(1, 3);
  const g = color.slice(3, 5);
  const b = color.slice(5, 7);
  return `rgb(${parseInt(r, 16)} ${parseInt(g, 16)} ${parseInt(b, 16)} / var(--tw-bg-opacity))`;
}

export function resourceCount(resources: Partial<PlayerResources>) {
  return RESOURCES.reduce((acc, res) => acc + (resources[res] || 0), 0);
}

// https://bost.ocks.org/mike/shuffle/
export function shuffle<T>(array: T[]) {
  let m = array.length;
  let i: number;
  let t: T;
  // While there remain elements to shuffle…
  while (m) {
    i = Math.floor(Math.random() * m--); // Pick a remaining element…
    // And swap it with the current element.
    t = array[m]!;
    array[m] = array[i]!;
    array[i] = t;
  }

  return array;
}
