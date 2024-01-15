import { createSignal } from "solid-js";
import { Colors } from "../constants";
import { Boards } from "../constants/boards";
import { getNeighbourHex } from "./neighbour";
import { getStructureId, type GetStructureId } from "./utils";

function idx(i: number) {
  if (i > 5) return 0;
  if (i < 0) return 5;
  return i;
}

function getHexes(): State["hexes"] {
  const hexes = Boards.A.reduce<State["hexes"]>(
    (acc, hexRow, rowIdx, arr) => {
      hexRow.forEach(({ type, value }, colIdx) => {
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
          type,
          value,
          idx: rowIdx + colIdx,
          row: rowIdx,
          col: colIdx,
          rowLen: hexRow.length,
          prevRowLen: rowIdx - 1 < 0 ? null : arr[rowIdx - 1]!.length,
          nextRowLen: rowIdx + 1 >= arr.length ? null : arr[rowIdx + 1]!.length,
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
        acc.valueMap[hex.value] ||= [];
        acc.valueMap[hex.value]!.push(hex);
      });
      return acc;
    },
    { array: [], byId: {}, layout: [], valueMap: {} }
  );

  hexes.array.forEach((hex) => {
    hex.siblings = [0, 1, 2, 3, 4, 5].map((idx) => {
      const neighbour = getNeighbourHex({ neighbourIdx: idx, ...hex });
      return neighbour ? hexes.byId[neighbour.id]! : null;
    });
  });

  return hexes;
}

function createTown(ids: GetStructureId<"town">, idx: number, hexes: Town["hexes"]): Town {
  const [level, setLevel] = createSignal<TownLevel>("settlement");
  const [pos, setPos] = createSignal<TownPos>(
    { x: null, y: null },
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

function getStructures(hexes: ReturnType<typeof getHexes>) {
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
          townIdx++;
        }

        if (!acc.byId[roadIds.id]) {
          acc.byId[roadIds.id] = road;
          acc.array.push(road);
          acc.keys.roads.push(roadIds.id);
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

function generatePlayer(idx: number, withResources?: boolean) {
  const [towns, setTowns] = createSignal<Town[]>([]);
  const [roads, setRoads] = createSignal<Road[]>([]);
  const [resources, setResources] = createSignal<PlayerResources>({
    brick: withResources ? 100 : 0,
    grain: withResources ? 100 : 0,
    lumber: withResources ? 100 : 0,
    ore: withResources ? 100 : 0,
    wool: withResources ? 100 : 0
  });
  return {
    name: `Player ${idx + 1}`,
    color: Colors[idx]!,
    resources,
    setResources,
    towns,
    setTowns,
    roads,
    setRoads
  };
}

function generatePlayers(count: number, withResources?: boolean) {
  return new Array(count).fill(undefined).map((_, idx) => generatePlayer(idx, withResources));
}

function getSetupGame(): SetupPhase {
  return {
    phase: "setup",
    players: generatePlayers(4),
    turn: {
      order: "first",
      player: 0,
      town: null,
      road: null
    }
  };
}

function getHalfSetup(structures: ReturnType<typeof getStructures>): SetupPhase {
  const players: Player[] = generatePlayers(4, true);

  const towns = structures.array.filter((s): s is Town => s.type === "town");
  const roads = structures.array.filter((s): s is Road => s.type === "road");

  players[0]!.setTowns([towns[14]!]);
  players[0]!.setRoads([roads[16]!]);
  players[1]!.setTowns([towns[13]!]);
  players[1]!.setRoads([roads[24]!]);
  players[2]!.setTowns([towns[38]!]);
  players[2]!.setRoads([roads[49]!]);
  players[3]!.setTowns([towns[47]!]);
  players[3]!.setRoads([roads[62]!]);

  return {
    phase: "setup",
    players,
    turn: {
      player: 3,
      order: "second",
      road: null,
      town: null
    }
  };
}

function getStartedGame(structures: ReturnType<typeof getStructures>): State["game"] {
  const players: Player[] = generatePlayers(4, true);
  const towns = structures.array.filter((s): s is Town => s.type === "town");
  const roads = structures.array.filter((s): s is Road => s.type === "road");

  players[0]!.setTowns([towns[14]!, towns[9]!]);
  players[0]!.setRoads([roads[16]!, roads[9]!]);
  players[1]!.setTowns([towns[13]!, towns[34]!]);
  players[1]!.setRoads([roads[24]!, roads[43]!]);
  players[2]!.setTowns([towns[38]!, towns[25]!]);
  players[2]!.setRoads([roads[49]!, roads[31]!]);
  players[3]!.setTowns([towns[47]!, towns[21]!]);
  players[3]!.setRoads([roads[62]!, roads[39]!]);

  return {
    phase: "game",
    players,
    turn: {
      player: 0
    }
  };
}

export function getInitialState(phase?: "game" | "half"): State {
  console.time("state");
  const hexes = getHexes();
  const structures = getStructures(hexes);

  const game =
    phase === "game"
      ? getStartedGame(structures)
      : phase === "half"
        ? getHalfSetup(structures)
        : getSetupGame();
  console.timeEnd("state");
  return { hexes, structures, game };
}
