import { Index, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import Hexagon from "./Hexagon";
import { regularBoard } from "./boardArrays";
import { getNeighbourHex } from "./utils/neighbour";

export type HexHighlghted = HexPosition | { x: null; y: null };

function getInitialState() {
  const towns = regularBoard
    .flatMap((hexRow, x) =>
      hexRow.map((hex, y) => {
        const pos = `${x}.${y}` as const;
        const prevRowLen = x - 1 < 0 ? null : regularBoard[x - 1].length;
        const nextRowLen = x + 1 >= regularBoard.length ? null : regularBoard[x + 1].length;
        return [x, y, pos, +pos, hex.type, hexRow.length, prevRowLen, nextRowLen] as const;
      })
    )
    .reduce((acc, [x, y, pos, num, type, rowLen, prevRowLen, nextRowLen]) => {
      const first = getNeighbourHex({ neighbourIdx: 0, x, y, rowLen, prevRowLen, nextRowLen });
      const second = getNeighbourHex({ neighbourIdx: 1, x, y, rowLen, prevRowLen, nextRowLen });
      const third = getNeighbourHex({ neighbourIdx: 2, x, y, rowLen, prevRowLen, nextRowLen });
      const fourth = getNeighbourHex({ neighbourIdx: 3, x, y, rowLen, prevRowLen, nextRowLen });
      const fifth = getNeighbourHex({ neighbourIdx: 4, x, y, rowLen, prevRowLen, nextRowLen });
      const sixth = getNeighbourHex({ neighbourIdx: 5, x, y, rowLen, prevRowLen, nextRowLen });

      const towns = [
        {
          townCoefficient: (num + (sixth?.num || 0) + (first?.num || 0)).toFixed(2),
          neighbours: [sixth?.pos, first?.pos].filter((hex): hex is HexPosition["pos"] => !!hex)
        },
        {
          townCoefficient: (num + (first?.num || 0) + (second?.num || 0)).toFixed(2),
          neighbours: [first?.pos, second?.pos].filter((hex): hex is HexPosition["pos"] => !!hex)
        },
        {
          townCoefficient: (num + (second?.num || 0) + (third?.num || 0)).toFixed(2),
          neighbours: [second?.pos, third?.pos].filter((hex): hex is HexPosition["pos"] => !!hex)
        },
        {
          townCoefficient: (num + (third?.num || 0) + (fourth?.num || 0)).toFixed(2),
          neighbours: [third?.pos, fourth?.pos].filter((hex): hex is HexPosition["pos"] => !!hex)
        },
        {
          townCoefficient: (num + (fourth?.num || 0) + (fifth?.num || 0)).toFixed(2),
          neighbours: [fourth?.pos, fifth?.pos].filter((hex): hex is HexPosition["pos"] => !!hex)
        },
        {
          townCoefficient: (num + (fifth?.num || 0) + (sixth?.num || 0)).toFixed(2),
          neighbours: [fifth?.pos, sixth?.pos].filter((hex): hex is HexPosition["pos"] => !!hex)
        }
      ].map((town, townIdx) => {
        let townCoefficient = town.neighbours.length ? town.townCoefficient : `${pos}-${townIdx}`;

        if (!acc[townCoefficient]) {
          acc[townCoefficient] = {
            active: false,
            disabled: false,
            hexes: [pos, ...town.neighbours] as const
          };
        }
        return townCoefficient;
      });

      console.log(pos, towns);

      return acc;
    }, {} as any);

  console.log(towns);
  // const towns = regularBoard.reduce<any>(
  //   (acc, hexRow, x) => {
  //     hexRow.forEach((hex, y) => {
  //       const num = +`${x}.${y}`;
  //       const rowLen = hexRow.length;
  //       const prevRowLen = x - 1 < 0 ? null : regularBoard[x - 1].length;
  //       const nextRowLen = x + 1 >= regularBoard.length ? null : regularBoard[x + 1].length;
  //       const neighbours = getAllNeighbours({ x, y, rowLen, prevRowLen, nextRowLen });

  //       // console.log(+`${x}.${y}`, neighbours);
  //     });
  //     return acc;
  //   },
  //   {
  //     placedxTowns: {} as any
  //   }
  // );

  return {
    hexRows: regularBoard,
    towns
  };
}

export default function Board() {
  const [store, setStore] = createStore(getInitialState());
  const [hexRows] = createSignal(regularBoard);
  const [townsHovered, setTownsHovered] = createSignal<TownState>({});
  const [townsActive, setTownsActive] = createSignal<TownState>({});
  const [highlighted, setHighlighted] = createSignal<HexHighlghted>({ x: null, y: null });

  function getPrevRowTotal(rowIdx: number) {
    return rowIdx - 1 < 0 ? null : hexRows()[rowIdx - 1].length;
  }

  function getNextRowTotal(rowIdx: number) {
    return rowIdx + 1 >= hexRows().length ? null : hexRows()[rowIdx + 1].length;
  }

  function getHoveredTown(rowIdx: number, colIdx: number) {
    return townsHovered()[`${rowIdx},${colIdx}`] ?? null;
  }

  // TODO
  function toggleTown(data: TownState) {}

  return (
    <div class="flex scale-150 flex-col items-center justify-center gap-1">
      <Index each={hexRows()}>
        {(hexRow, rowIdx) => (
          <div class="my-[-15px] flex gap-1">
            <Index each={hexRow()}>
              {(hex, colIdx) => (
                <Hexagon
                  type={hex().type}
                  x={rowIdx}
                  y={colIdx}
                  rowLen={hexRow().length}
                  prevRowLen={getPrevRowTotal(rowIdx)}
                  nextRowLen={getNextRowTotal(rowIdx)}
                  highlighted={highlighted().x === rowIdx && highlighted().y === colIdx}
                  townHovered={getHoveredTown(rowIdx, colIdx)}
                  onRoadHover={setHighlighted}
                  onTownHover={setTownsHovered}
                  onTownClick={toggleTown}
                >
                  {rowIdx}.{colIdx}
                </Hexagon>
              )}
            </Index>
          </div>
        )}
      </Index>
    </div>
  );
}
