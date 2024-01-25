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

export const backgroundImageSvg = (iconCode: string, size = 40, viewBoxSize = 100) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${viewBoxSize}" height="${viewBoxSize}" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}"><text x="0" y="40" font-size="${size}" fill="black">${iconCode.replace("#", "%23")}</text></svg>`;
  return `url('data:image/svg+xml,${svg}')`;
};
