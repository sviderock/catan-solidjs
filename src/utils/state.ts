import { createSignal } from "solid-js";
import { regularBoard } from "./boardArrays";
import { getNeighbourHex } from "./neighbour";
import { getStructureId, type GetStructureId } from "./utils";

function idx(i: number) {
  if (i > 5) return 0;
  if (i < 0) return 5;
  return i;
}

function getHexes() {
  const hexes = regularBoard.reduce(
    (acc, hexRow, rowIdx) => {
      hexRow.forEach(({ type }, colIdx) => {
        const id: Hex["id"] = `${rowIdx}.${colIdx}`;
        const [hovered, setHovered] = createSignal(false);
        const [calc, setCalc] = createSignal<HexCalculations>({
          angles: [],
          center: { x: -1, y: -1 },
          heightSection: -1,
          sizeToAngle: -1,
          sizeToEdge: -1,
          edges: []
        });
        const hex: Hex = {
          id,
          idx: rowIdx + colIdx,
          type,
          row: rowIdx,
          col: colIdx,
          rowLen: hexRow.length,
          prevRowLen: rowIdx - 1 < 0 ? null : regularBoard[rowIdx - 1]!.length,
          nextRowLen: rowIdx + 1 >= regularBoard.length ? null : regularBoard[rowIdx + 1]!.length,
          siblings: [],
          towns: [],
          roads: [],
          hovered,
          setHovered,
          calc,
          setCalc
        };

        acc.array.push(hex);
        acc.byId[hex.id] = hex;
        acc.layout[rowIdx] ||= [];
        acc.layout[rowIdx]![colIdx] = hex;
      });
      return acc;
    },
    {
      array: [] as Hex[],
      byId: {} as { [hexId: Hex["id"]]: Hex },
      layout: [] as Hex[][]
    }
  );

  hexes.array.forEach((hex) => {
    hex.siblings = [0, 1, 2, 3, 4, 5].map((idx) => {
      const neighbour = getNeighbourHex({ neighbourIdx: idx, ...hex });
      return neighbour ? hexes.byId[neighbour.id]! : null;
    });
  });

  return hexes;
}

function createTown(ids: GetStructureId<"town">, hexes: Town["hexes"]): Town {
  const [active, setActive] = createSignal(false);
  const [disabled, setDisabled] = createSignal(false);
  const [available, setAvailable] = createSignal(false);
  const [level, setLevel] = createSignal<TownLevel>("settlement");
  const [pos, setPos] = createSignal<TownPos>(
    { x: null, y: null },
    { equals: (prev, next) => prev.x === next.x && prev.y === next.y }
  );

  return {
    type: "town",
    id: ids.id,
    closestTowns: [],
    roads: [],
    hexes,
    pos,
    setPos,
    active,
    setActive,
    level,
    setLevel,
    disabled,
    setDisabled,
    available,
    setAvailable
  };
}

function createRoad(ids: GetStructureId<"road">, hexes: Road["hexes"]): Road {
  const [active, setActive] = createSignal(false);
  const [available, setAvailable] = createSignal(false);
  const [pos, setPos] = createSignal<RoadPos>(
    { x: null, y: null, angle: null },
    { equals: (prev, next) => prev.x === next.x && prev.y === next.y && prev.angle === next.angle }
  );

  return {
    type: "road",
    id: ids.id,
    towns: [],
    roads: [],
    hexes,
    pos,
    setPos,
    active,
    setActive,
    available,
    setAvailable
  };
}

function getStructures(hexes: ReturnType<typeof getHexes>) {
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
        const town = createTown(townIds, townHexes);
        const road = createRoad(roadIds, roadHexes);

        if (!acc.byId[townIds.id]) {
          acc.byId[townIds.id] = town;
          acc.array.push(town);
          acc.keys.towns.push(townIds.id);
        }

        if (!acc.byId[roadIds.id]) {
          acc.byId[roadIds.id] = road;
          acc.array.push(road);
          acc.keys.roads.push(roadIds.id);
        }

        hex.towns.push(town);
        hex.roads.push(road);
      });

      return acc;
    },
    {
      array: [] as Structure[],
      byId: {} as StructureMap,
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

export function getInitialState() {
  console.time("state");
  const hexes = getHexes();
  const structures = getStructures(hexes);
  console.timeEnd("state");
  return { hexes, structures };
}
