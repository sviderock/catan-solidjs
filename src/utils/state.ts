import { createSignal } from "solid-js";
import { regularBoard } from "../boardArrays";
import { getNeighbourHex } from "./neighbour";
import { getStructureId } from "./structureId";

const ORDERED_NEIGHBOURS_ARRAY = [
  [5, 0],
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5]
];

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
  return hexes.array.reduce(
    (acc, hex, idx) => {
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
          const [pos, setPos] = createSignal<TownPos>(
            { x: null, y: null },
            { equals: (prev, next) => prev.x === next.x && prev.y === next.y }
          );

          const town: Town = {
            type: "town",
            level: "settlement",
            id: townId,
            active: false,
            disabled: false,
            hexes: townHexes,
            pos,
            setPos
          };

          acc.byId[townId] = town;
          acc.array.push(town);
        }

        if (!acc.byId[roadId]) {
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
            active: false,
            hexes: roadHexes,
            pos,
            setPos
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
}

export function getInitialState() {
  console.time("state");
  const hexes = getHexes();
  const structures = getStructures(hexes);
  console.timeEnd("state");
  return { hexes, structures };
}
