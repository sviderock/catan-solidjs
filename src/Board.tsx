import { Index, createEffect, createSignal } from "solid-js";
import { Portal } from "solid-js/web";
import Hexagon from "./Hexagon";
import { regularBoard } from "./boardArrays";
import { getNeighbourHex } from "./utils/neighbour";

/**
 * HEX INTERSECTION ROAD PLACEMENTS
 * const x = (hexes.left + hexes.right) / 2 - townRect.width / 2;
 * const y = (hexes.top + hexes.bottom) / 2 - townRect.height / 2;
 */

export type HexHighlghted = Pick<Hex, "row" | "col"> | { row: null; col: null };

const ORDERED_NEIGHBOURS_ARRAY = [
  [5, 0],
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5]
];

function getHexes(): Hex[] {
  return regularBoard.flatMap((hexRow, rowIdx) =>
    hexRow.map((hex, colIdx) => {
      const id = `${rowIdx}.${colIdx}` as const;
      const prevRowLen = rowIdx - 1 < 0 ? null : regularBoard[rowIdx - 1]!.length;
      const nextRowLen = rowIdx + 1 >= regularBoard.length ? null : regularBoard[rowIdx + 1]!.length;
      const rowLen = hexRow.length;
      const [hovered, setHovered] = createSignal(false);
      const [calc, setCalc] = createSignal<HexCalculations>({
        angles: [],
        center: { x: -1, y: -1 },
        heightSection: -1,
        sizeToAngle: -1,
        sizeToEdge: -1
      });

      return {
        row: rowIdx,
        col: colIdx,
        idx: rowIdx + colIdx,
        id: id,
        type: hex.type,
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
      } satisfies Hex;
    })
  );
}

function getHexesById(hexes: Hex[]): { [hexId: Hex["id"]]: Hex } {
  return hexes.reduce<{ [hexId: Hex["id"]]: Hex }>((acc, hex) => {
    acc[hex.id] = hex;
    return acc;
  }, {});
}

function getTowns(hexes: ReturnType<typeof getHexes>) {
  const hexById = getHexesById(hexes);
  return hexes.reduce<{ [key: Town["id"]]: Town }>(
    (acc, { row, col, id: hexId, type, rowLen, prevRowLen, nextRowLen, calc }) => {
      ORDERED_NEIGHBOURS_ARRAY.forEach(([leftIdx, rightIdx], townIdx) => {
        const left = getNeighbourHex({ neighbourIdx: leftIdx!, row, col, rowLen, prevRowLen, nextRowLen });
        const right = getNeighbourHex({ neighbourIdx: rightIdx!, row, col, rowLen, prevRowLen, nextRowLen });

        const hexes: Town["hexes"] = [
          { id: hexId, townIdx, calc },
          left
            ? ({
                id: left.id,
                townIdx: left?.townToTown[townIdx]!,
                calc: hexById[left.id]!.calc
              } satisfies TownHex)
            : null,
          right
            ? ({
                id: right.id,
                townIdx: right?.townToTown[townIdx]!,
                calc: hexById[right.id]!.calc
              } satisfies TownHex)
            : null
        ].filter((item): item is TownHex => !!item);

        const isLonelyTown = hexes.length === 1;
        const id = isLonelyTown
          ? (`${hexId}-${townIdx}` as SingleTownId)
          : (`${hexes.map((hex) => hex.id).join(",")}` as ConcatenatedTownIds);

        if (!acc[id]) {
          const [pos, setPos] = createSignal<{ x: number | null; y: number | null }>(
            { x: null, y: null },
            { equals: (prev, next) => prev.x === next.x && prev.y === next.y }
          );
          acc[id] = {
            id,
            idx: isLonelyTown ? townIdx : undefined,
            active: false,
            disabled: false,
            type,
            hexes,
            pos,
            setPos
          };
        }
      });

      return acc;
    },
    {}
  );
}

function getInitialState() {
  const hexes = getHexes();
  const towns = getTowns(hexes);
  return { hexes, towns };
}

export default function Board() {
  const hexRefs = {} as Record<Hex["id"], HTMLDivElement | undefined>;
  const townRefs = {} as Record<Town["id"], HTMLDivElement | undefined>;
  const [state] = createSignal(getInitialState());

  const townsArray = () => Object.values(state().towns);

  function hexById() {
    return state().hexes.reduce<{ [hexId: Hex["id"]]: Hex }>((acc, hex) => {
      acc[hex.id] = hex;
      return acc;
    }, {});
  }

  function hexRows() {
    const rows = state().hexes;
    return rows.reduce<Array<typeof rows>>((acc, hex) => {
      if (!acc[hex.row]) acc[hex.row] = [];
      acc[hex.row]!.push(hex);
      return acc;
    }, []);
  }

  // https://www.redblobgames.com/grids/hexagons/#basics
  createEffect(() => {
    state().hexes.forEach((hex) => {
      const rect = hexRefs[hex.id]!.getBoundingClientRect();
      const sizeToAngle = rect.height / 2;
      const sizeToEdge = (sizeToAngle * Math.sqrt(3)) / 2;
      const heightSection = rect.height / 4;
      const center = { x: (rect.left + rect.right) / 2, y: (rect.top + rect.bottom) / 2 };

      hex.setCalc(() => ({
        center,
        sizeToAngle,
        sizeToEdge,
        heightSection,
        angles: [
          { x: center.x, y: center.y - sizeToAngle },
          { x: center.x + sizeToEdge, y: center.y - heightSection },
          { x: center.x + sizeToEdge, y: center.y + heightSection },
          { x: center.x, y: center.y + sizeToAngle },
          { x: center.x - sizeToEdge, y: center.y + heightSection },
          { x: center.x - sizeToEdge, y: center.y - heightSection }
        ]
      }));
    });
  });

  createEffect(() => {
    console.log(state());
    townsArray().forEach((town) => {
      const intersectedTownsPos = town.hexes.reduce<{
        left: number;
        right: number;
        top: number;
        bottom: number;
      }>(
        (acc, hex) => {
          const townPos = hex.calc().angles[hex.townIdx]!;
          acc.left = acc.left === -1 ? townPos.x : Math.min(acc.left, townPos.x);
          acc.right = acc.right === -1 ? townPos.x : Math.max(acc.right, townPos.x);
          acc.top = acc.top === -1 ? townPos.y : Math.min(acc.top, townPos.y);
          acc.bottom = acc.bottom === -1 ? townPos.y : Math.max(acc.bottom, townPos.y);
          return acc;
        },
        { left: -1, right: -1, top: -1, bottom: -1 }
      );

      const townRect = townRefs[town.id]!.getBoundingClientRect();
      const townHalfWidth = townRect.width / 2;
      const townHalfHeight = townRect.height / 2;
      const intersectionCenterX = (intersectedTownsPos.left + intersectedTownsPos.right) / 2;
      const intersectionCenterY = (intersectedTownsPos.top + intersectedTownsPos.bottom) / 2;

      town.setPos({
        x: intersectionCenterX - townHalfWidth,
        y: intersectionCenterY - townHalfHeight
      });
    });

    // townsArray().forEach((town, idx) => {
    //   const townRect = townRefs[town.id]!.getBoundingClientRect();
    //   const townCenterX = townRect.width / 2;
    //   const townCenterY = townRect.height / 2;
    //   if (idx === 0) town.setPos({ x: angle0.x - townCenterX, y: angle0.y - townCenterY });
    //   if (idx === 1) town.setPos({ x: angle1.x - townCenterX, y: angle1.y - townCenterY });
    //   if (idx === 2) town.setPos({ x: angle2.x - townCenterX, y: angle2.y - townCenterY });
    //   if (idx === 3) town.setPos({ x: angle3.x - townCenterX, y: angle3.y - townCenterY });
    //   if (idx === 4) town.setPos({ x: angle4.x - townCenterX, y: angle4.y - townCenterY });
    //   if (idx === 5) town.setPos({ x: angle5.x - townCenterX, y: angle5.y - townCenterY });
    // });
    // townsArray().forEach((town, idx) => {
    //   const townRect = townRefs[town.id]!.getBoundingClientRect();
    //   if ([0, 1, 2, 3, 4, 5].includes(idx)) {
    //     // console.log(town.hexes);
    //     // Single hex town
    //     if (town.hexes.length === 1) {
    //       const hex = town.hexes[0]!;
    //       const hexRect = hexRefs[hex.id]!.getBoundingClientRect();
    //       if (town.idx === 0) {
    //         const x = (hexRect.left + hexRect.right) / 2 - townRect.width / 2;
    //         const y = hexRect.top - townRect.height / 2;
    //         town.setPos({ x, y });
    //       }
    //     }
    //     // Multiple hexes town
    //     if (town.hexes.length > 1) {
    //       const hexesRect = town.hexes.map((hex) => hexRefs[hex.id]!.getBoundingClientRect());
    //       const hexes = hexesRect.reduce<{ left: number; right: number; top: number; bottom: number }>(
    //         (acc, hexRect) => {
    //           acc.left = acc.left === -1 ? hexRect.left : Math.min(acc.left, hexRect.left);
    //           acc.right = acc.right === -1 ? hexRect.right : Math.max(acc.right, hexRect.right);
    //           acc.top = acc.top === -1 ? hexRect.top : Math.min(acc.top, hexRect.top);
    //           acc.bottom = acc.bottom === -1 ? hexRect.bottom : Math.max(acc.bottom, hexRect.bottom);
    //           return acc;
    //         },
    //         { left: -1, right: -1, top: -1, bottom: -1 }
    //       );
    //       const x = (hexes.left + hexes.right) / 2 - townRect.width / 2;
    //       const y = (hexes.top + hexes.bottom) / 2 - townRect.height / 2;
    //       town.setPos({ x, y });
    //     }
    //   }
    // });
  });

  return (
    <div class="flex scale-150 flex-col flex-wrap items-center justify-center gap-1">
      <Index each={hexRows()}>
        {(hexRow) => (
          <div class="my-[-15px] flex gap-1">
            <Index each={hexRow()}>
              {(hex) => (
                <Hexagon
                  {...hex()}
                  ref={hexRefs[hex().id]}
                  onNeighbourHover={(id, hovered) => {
                    state()
                      .hexes.find((hexItem) => hexItem.id === id)
                      ?.setHovered(hovered);
                  }}
                >
                  {hex().id}
                </Hexagon>
              )}
            </Index>
          </div>
        )}
      </Index>

      <Portal>
        <Index each={townsArray()}>
          {(town) => (
            <div
              ref={townRefs[town().id]}
              class="absolute h-[30px] w-[30px] rounded-full border-4 border-red-600 bg-black"
              style={{ top: `${town().pos().y}px`, left: `${town().pos().x}px` }}
            />
          )}
        </Index>
      </Portal>
    </div>
  );
}
