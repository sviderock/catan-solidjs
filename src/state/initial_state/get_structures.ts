import { getNeighbourHex } from "@/utils/neighbour";
import type { GetHexes } from "./get_hexes";
import { type GetStructureId, getStructureId, idx } from "@/utils";
import { createSignal } from "solid-js";

export type GetStructures = ReturnType<typeof getStructures>;

export default function getStructures(hexes: GetHexes) {
  let townIdx = 0;
  let roadIdx = 0;

  const structures = hexes.array.reduce(
    (acc, hex) => {
      [0, 1, 2, 3, 4, 5].forEach((sideIdx) => {
        const leftHex = getNeighbourHex({ neighbourIdx: idx(sideIdx - 1), ...hex });
        const rightHex = getNeighbourHex({ neighbourIdx: idx(sideIdx), ...hex });

        const townHexes: Town["hexes"] = [{ hex, townIdx: sideIdx }];
        const roadHexes: Road["hexes"] = [{ hex, roadIdx: sideIdx }];

        if (leftHex) {
          townHexes.push({ hex: hexes.byId[leftHex.id]!, townIdx: leftHex.townToTown[sideIdx]! });
        }
        if (rightHex) {
          townHexes.push({ hex: hexes.byId[rightHex.id]!, townIdx: rightHex.townToTown[sideIdx]! });
          roadHexes.push({ hex: hexes.byId[rightHex.id]!, roadIdx: rightHex.road });
        }

        const townIds = getStructureId({ type: "town", hexes: townHexes });
        const roadIds = getStructureId({ type: "road", hexes: roadHexes });
        const town = createTown(townIds, townIdx, townHexes);
        const road = createRoad(roadIds, roadIdx, roadHexes);

        if (!acc.byId[townIds.id]) {
          acc.byId[townIds.id] = town;
          acc.array.push(town);
          acc.keys.towns.push(townIds.id);
          townIds.separatedIds.forEach((id) => {
            acc.bySeparateId[id] ||= {} as any;
            acc.bySeparateId[id]!.town = town;
          });
          townIdx++;
        }
        if (!acc.byId[roadIds.id]) {
          acc.byId[roadIds.id] = road;
          acc.array.push(road);
          acc.keys.roads.push(roadIds.id);
          roadIds.separatedIds.forEach((id) => {
            acc.bySeparateId[id] ||= {} as any;
            acc.bySeparateId[id]!.road = road;
          });
          roadIdx++;
        }

        hex.towns.push(town);
        hex.roads.push(road);
      });

      return acc;
    },
    {
      array: [] as Structure[],
      byId: {} as StructureMap,
      bySeparateId: {} as StructureSeparateIdMap,
      keys: {
        towns: [] as TownId[],
        roads: [] as RoadId[]
      }
    }
  );

  structures.array.forEach((structure) => {
    if (structure.type === "town") {
      processClosestTowns(structure, structures.keys.towns, structures.byId);
    }

    if (structure.type === "road") {
      processBetweenTowns(structure, structures.keys.towns, structures.byId);
      structure.towns.forEach((town) => town.roads.push(structure));
    }
  });

  structures.array.forEach((structure) => {
    if (structure.type === "road") {
      const roads = structure.towns
        .flatMap((town) => town.roads)
        .filter((road) => road.id !== structure.id);
      structure.roads.push(...roads);
    }
  });

  return structures;
}

function createTown(ids: GetStructureId<"town">, idx: number, hexes: Town["hexes"]): Town {
  const [level, setLevel] = createSignal<TownLevel>("settlement");
  const [pos, setPos] = createSignal<TownPos>(
    { x: null, y: null, centerY: null, centerX: null },
    { equals: (prev, next) => prev.x === next.x && prev.y === next.y }
  );

  return {
    type: "town",
    id: ids.id,
    idx,
    closestTowns: [],
    roads: [],
    hexes,
    pos,
    setPos,
    level,
    setLevel
  };
}

function createRoad(ids: GetStructureId<"road">, idx: number, hexes: Road["hexes"]): Road {
  const [pos, setPos] = createSignal<RoadPos>(
    { x: null, y: null, angle: null },
    { equals: (prev, next) => prev.x === next.x && prev.y === next.y && prev.angle === next.angle }
  );

  return {
    type: "road",
    id: ids.id,
    idx,
    towns: [],
    roads: [],
    hexes,
    pos,
    setPos
  };
}

function processClosestTowns(
  town: Town,
  townKeys: TownId[],
  byId: { [key: Structure["id"]]: Structure }
) {
  const townsIdx = town.hexes.flatMap((hex) => [
    `${hex.hex.id}-${idx(hex.townIdx - 1)}`,
    `${hex.hex.id}-${idx(hex.townIdx + 1)}`
  ]);

  town.closestTowns = townKeys
    .filter((townKey) => townsIdx.some((townIdx) => townKey.includes(townIdx)))
    .reduce<Town["closestTowns"]>((acc, townId) => {
      acc.push(byId[townId]! as Town);
      return acc;
    }, []);
}

function processBetweenTowns(
  road: Road,
  townKeys: TownId[],
  byId: { [key: Structure["id"]]: Structure }
) {
  const roadsIdx = road.hexes.flatMap((hex) => [
    `${hex.hex.id}-${idx(hex.roadIdx)}`,
    `${hex.hex.id}-${idx(hex.roadIdx + 1)}`
  ]);

  road.towns = townKeys
    .filter((townKey) => roadsIdx.some((townIdx) => townKey.includes(townIdx)))
    .reduce<Road["towns"]>((acc, townId) => {
      acc.push(byId[townId]! as Town);
      return acc;
    }, []);
}
