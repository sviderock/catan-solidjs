import { createSignal } from "solid-js";
import { regularBoard } from "../boardArrays";
import { getNeighbourHex } from "./neighbour";
import { getSingleStructureId, getStructureId } from "./structureId";

const ORDERED_NEIGHBOURS_ARRAY = [
  [5, 0],
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5]
] as const;

const CLOSEST_OWN_TOWNS_IDX: Record<number, number[]> = {
  0: [5, 1],
  1: [0, 2],
  2: [1, 3],
  3: [2, 4],
  4: [3, 5],
  5: [4, 0]
};

function getHexes() {
  return regularBoard.reduce(
    (acc, hexRow, rowIdx) => {
      hexRow.forEach(({ type }, colIdx) => {
        const id = `${rowIdx}.${colIdx}` as const;
        const prevRowLen = rowIdx - 1 < 0 ? null : regularBoard[rowIdx - 1]!.length;
        const nextRowLen =
          rowIdx + 1 >= regularBoard.length ? null : regularBoard[rowIdx + 1]!.length;
        const rowLen = hexRow.length;
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
          row: rowIdx,
          col: colIdx,
          idx: rowIdx + colIdx,
          id: id,
          type: type,
          rowLen: hexRow.length,
          prevRowLen: rowIdx - 1 < 0 ? null : regularBoard[rowIdx - 1]!.length,
          nextRowLen: rowIdx + 1 >= regularBoard.length ? null : regularBoard[rowIdx + 1]!.length,
          hovered,
          setHovered,
          calc,
          setCalc,
          neighbours: [0, 1, 2, 3, 4, 5].map((idx) => {
            return getNeighbourHex({
              neighbourIdx: idx,
              row: rowIdx,
              col: colIdx,
              rowLen,
              prevRowLen,
              nextRowLen
            });
          })
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
}

function getStructures(hexes: ReturnType<typeof getHexes>) {
  const structures = hexes.array.reduce(
    (acc, hex) => {
      ORDERED_NEIGHBOURS_ARRAY.forEach(([leftIdx, rightIdx], townIdx) => {
        const leftHex = getNeighbourHex({ neighbourIdx: leftIdx!, ...hex });
        const rightHex = getNeighbourHex({ neighbourIdx: rightIdx!, ...hex });

        const townHexes: Town["hexes"] = [{ hex, townIdx }];
        const roadHexes: Road["hexes"] = [{ hex, roadIdx: rightIdx! }];

        if (leftHex) {
          townHexes.push({ hex: hexes.byId[leftHex.id]!, townIdx: leftHex.townToTown[townIdx]! });
        }
        if (rightHex) {
          townHexes.push({ hex: hexes.byId[rightHex.id]!, townIdx: rightHex.townToTown[townIdx]! });
          roadHexes.push({ hex: hexes.byId[rightHex.id]!, roadIdx: rightHex.road });
        }

        const townId = getStructureId({
          type: "town",
          hexId: hex.id,
          idx: townIdx,
          hexes: townHexes
        });
        const roadId = getStructureId({
          type: "road",
          hexId: hex.id,
          idx: rightIdx!,
          hexes: roadHexes
        });

        if (!acc.byId[townId]) {
          const [active, setActive] = createSignal(false);
          const [disabled, setDisabled] = createSignal(false);
          const [pos, setPos] = createSignal<TownPos>(
            { x: null, y: null },
            { equals: (prev, next) => prev.x === next.x && prev.y === next.y }
          );

          const town: Town = {
            type: "town",
            level: "settlement",
            id: townId,
            hexes: townHexes,
            closestTowns: [],
            pos,
            setPos,
            active,
            setActive,
            disabled,
            setDisabled
          };

          acc.byId[townId] = town;
          acc.array.push(town);
        }

        if (!acc.byId[roadId]) {
          const [active, setActive] = createSignal(false);
          const [pos, setPos] = createSignal<RoadPos>(
            { x: null, y: null, angle: null },
            {
              equals: (prev, next) =>
                prev.x === next.x && prev.y === next.y && prev.angle === next.angle
            }
          );

          const road: Road = {
            type: "road",
            id: roadId,
            hexes: roadHexes,
            pos,
            setPos,
            active,
            setActive
          };

          acc.byId[roadId] = road;
          acc.array.push(road);
        }
      });

      return acc;
    },
    {
      array: [] as Structure[],
      byId: {} as { [key: Structure["id"]]: Structure }
    }
  );

  const townKeys = Object.keys(structures.byId).filter((key) => key.startsWith("town"));
  structures.array.forEach((structure) => {
    if (structure.type !== "town") return;

    const townsIdx = structure.hexes.flatMap((hex) => {
      return CLOSEST_OWN_TOWNS_IDX[hex.townIdx]?.map((idx) => {
        return getSingleStructureId({ type: "town", hexId: hex.hex.id, idx });
      });
    });

    structure.closestTowns = townKeys
      .filter((townKey) => {
        return townsIdx.some((townIdx) => townKey.includes(townIdx as string));
      })
      .reduce<Town["closestTowns"]>((acc, townId) => {
        acc.push(structures.byId[townId as TownId] as Town);
        return acc;
      }, []);
  });

  return structures;
}

export function getInitialState() {
  console.time("state");
  const hexes = getHexes();
  const structures = getStructures(hexes);
  console.timeEnd("state");
  return { hexes, structures };
}
