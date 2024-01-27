import { Boards } from "@/constants/boards";
import { getNeighbourHex } from "@/utils/neighbour";
import { createSignal } from "solid-js";

export type GetHexes = ReturnType<typeof getHexes>;

export default function getHexes() {
  let idx = 0;
  const hexes = Boards.A.board.reduce(
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
          idx,
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

        if (type === "desert") {
          acc.desert = hex;
        }

        acc.array.push(hex);
        acc.byId[hex.id] = hex;
        acc.byIdx[hex.idx] = hex;
        acc.layout[rowIdx] ||= [];
        acc.layout[rowIdx]![colIdx] = hex;
        acc.valueMap[hex.value] ||= [];
        acc.valueMap[hex.value]!.push(hex);
        idx++;
      });
      return acc;
    },
    {
      array: [] as Hex[],
      byId: {} as { [hexId: Hex["id"]]: Hex },
      byIdx: {} as { [hexIdx: Hex["idx"]]: Hex },
      layout: [] as Hex[][],
      valueMap: {} as { [value: number]: Hex[] },
      desert: {} as Hex
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
