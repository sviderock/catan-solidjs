import { For, createEffect, createSignal } from "solid-js";
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

function findAngle(x1: number, y1: number, x2: number, y2: number) {
  let calc_angle = Math.atan2(y2 - y1, x2 - x1);
  if (calc_angle < 0) {
    calc_angle += Math.PI * 2;
  }
  return calc_angle * (180 / Math.PI);
  // convert angle from radians to degrees then log
}
// notice sin is y and cos is x

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
        sizeToEdge: -1,
        edges: []
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
    (acc, { row, col, id: hexId, type, rowLen, prevRowLen, nextRowLen, calc, setHovered }) => {
      ORDERED_NEIGHBOURS_ARRAY.forEach(([leftIdx, rightIdx], townIdx) => {
        const left = getNeighbourHex({ neighbourIdx: leftIdx!, row, col, rowLen, prevRowLen, nextRowLen });
        const right = getNeighbourHex({ neighbourIdx: rightIdx!, row, col, rowLen, prevRowLen, nextRowLen });

        const hexes: Town["hexes"] = [
          { id: hexId, townIdx, calc, setHovered },
          left
            ? ({
                id: left.id,
                townIdx: left?.townToTown[townIdx]!,
                calc: hexById[left.id]!.calc,
                setHovered: hexById[left.id]!.setHovered
              } satisfies TownHex)
            : null,
          right
            ? ({
                id: right.id,
                townIdx: right?.townToTown[townIdx]!,
                calc: hexById[right.id]!.calc,
                setHovered: hexById[right.id]!.setHovered
              } satisfies TownHex)
            : null
        ].filter((item): item is TownHex => !!item);

        const id =
          hexes.length === 1
            ? (`${hexId}-${townIdx}` as SingleTownId)
            : (`${hexes
                .map((hex) => hex.id)
                .sort((a, b) => +a - +b)
                .join(",")}` as ConcatenatedTownIds);

        if (!acc[id]) {
          const [pos, setPos] = createSignal<TownPos>(
            { x: null, y: null },
            { equals: (prev, next) => prev.x === next.x && prev.y === next.y }
          );
          acc[id] = {
            id,
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

function getRoads(hexes: ReturnType<typeof getHexes>) {
  const hexById = getHexesById(hexes);
  return hexes.reduce<{ [key: Road["id"]]: Road }>(
    (acc, { id: hexId, row, col, rowLen, prevRowLen, nextRowLen, calc, setHovered }) => {
      [0, 1, 2, 3, 4, 5].forEach((neighbourIdx, roadIdx) => {
        const neighbour = getNeighbourHex({ neighbourIdx, row, col, rowLen, prevRowLen, nextRowLen });
        const hexes: Road["hexes"] = [
          { id: hexId, roadIdx, calc, setHovered },
          neighbour
            ? {
                id: neighbour.id,
                roadIdx: neighbour.road,
                calc: hexById[neighbour.id]!.calc,
                setHovered: hexById[neighbour.id]?.setHovered
              }
            : null
        ].filter((item): item is RoadHex => !!item);

        const id =
          hexes.length === 1
            ? (`${hexId}-${roadIdx}` as SingleRoadId)
            : (`${hexes
                .map((hex) => hex?.id)
                .sort((a, b) => +a - +b)
                .join(",")}` as ConcatenatedRoadIds);

        if (!acc[id]) {
          const [pos, setPos] = createSignal<RoadPos>(
            { x: null, y: null, angle: null },
            { equals: (prev, next) => prev.x === next.x && prev.y === next.y && prev.angle === next.angle }
          );

          acc[id] = {
            id,
            active: false,
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
  console.time("state");
  const hexes = getHexes();
  const towns = getTowns(hexes);
  const roads = getRoads(hexes);
  console.timeEnd("state");
  return { hexes, towns, roads };
}

export default function Board() {
  const hexRefs = {} as Record<Hex["id"], HTMLDivElement | undefined>;
  const townRefs = {} as Record<Town["id"], HTMLDivElement | undefined>;
  const roadRefs = {} as Record<Road["id"], HTMLDivElement | undefined>;
  const [state] = createSignal(getInitialState());

  const townsArray = () => Object.values(state().towns);
  const roadsArray = () => Object.values(state().roads);

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
    console.time("hexes_calcs");
    state().hexes.forEach((hex) => {
      const rect = hexRefs[hex.id]!.getBoundingClientRect();
      const sizeToAngle = rect.height / 2;
      const sizeToEdge = (sizeToAngle * Math.sqrt(3)) / 2;
      const heightSection = rect.height / 4;
      const center = { x: (rect.left + rect.right) / 2, y: (rect.top + rect.bottom) / 2 };
      const angles: HexCalculations["angles"] = [
        { x: center.x, y: center.y - sizeToAngle },
        { x: center.x + sizeToEdge, y: center.y - heightSection },
        { x: center.x + sizeToEdge, y: center.y + heightSection },
        { x: center.x, y: center.y + sizeToAngle },
        { x: center.x - sizeToEdge, y: center.y + heightSection },
        { x: center.x - sizeToEdge, y: center.y - heightSection }
      ];

      const edges: HexCalculations["edges"] = Array.from({ length: 6 }).map((_, idx, arr) => {
        const idx1 = idx;
        const idx2 = idx + 1 >= arr.length ? 0 : idx + 1;

        /**
         * 0 =
         */
        return {
          x1: angles[idx1]!.x,
          y1: angles[idx1]!.y,
          x2: angles[idx2]!.x,
          y2: angles[idx2]!.y,
          centerX: (angles[idx1]!.x + angles[idx2]!.x) / 2,
          centerY: (angles[idx1]!.y + angles[idx2]!.y) / 2,
          angle: findAngle(angles[idx1]!.x, angles[idx1]!.y, angles[idx2]!.x, angles[idx2]!.y)
        };
      });

      hex.setCalc(() => ({
        center,
        sizeToAngle,
        sizeToEdge,
        heightSection,
        angles,
        edges
      }));
    });
    console.timeEnd("hexes_calcs");
  });

  createEffect(() => {
    console.time("towns_calcs");
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
    console.timeEnd("towns_calcs");
  });

  createEffect(() => {
    console.time("roads_calcs");
    roadsArray().forEach((road) => {
      const intersectedRoadsPos = road.hexes.reduce<{
        left: number;
        right: number;
        top: number;
        bottom: number;
        angle: number;
      }>(
        (acc, hex) => {
          const roadPos = hex.calc().edges[hex.roadIdx]!;
          acc.left = acc.left === -1 ? roadPos.centerX : Math.min(acc.left, roadPos.centerX);
          acc.right = acc.right === -1 ? roadPos.centerX : Math.max(acc.right, roadPos.centerX);
          acc.top = acc.top === -1 ? roadPos.centerY : Math.min(acc.top, roadPos.centerY);
          acc.bottom = acc.bottom === -1 ? roadPos.centerY : Math.max(acc.bottom, roadPos.centerY);
          acc.angle = acc.angle === -1 ? roadPos.angle : acc.angle;
          return acc;
        },
        { left: -1, right: -1, top: -1, bottom: -1, angle: -1 }
      );

      const roadRect = roadRefs[road.id]!.getBoundingClientRect();
      const roadHalfWidth = roadRect.width / 2;
      const roadHalfHeight = roadRect.height / 2;
      const intersectionCenterX = (intersectedRoadsPos.left + intersectedRoadsPos.right) / 2;
      const intersectionCenterY = (intersectedRoadsPos.top + intersectedRoadsPos.bottom) / 2;

      road.setPos({
        x: intersectionCenterX - roadHalfWidth,
        y: intersectionCenterY - roadHalfHeight,
        angle: intersectedRoadsPos.angle
      });
    });
    console.timeEnd("roads_calcs");
  });

  return (
    <div class="flex scale-150 flex-col flex-wrap items-center justify-center gap-1">
      <For each={hexRows()}>
        {(hexRow) => (
          <div class="my-[-15px] flex gap-1">
            <For each={hexRow}>
              {(hex) => (
                <Hexagon
                  {...hex}
                  ref={hexRefs[hex.id]}
                  onNeighbourHover={(id, hovered) => {
                    state()
                      .hexes.find((hexItem) => hexItem.id === id)
                      ?.setHovered(hovered);
                  }}
                />
              )}
            </For>
          </div>
        )}
      </For>

      <Portal>
        <For each={townsArray()}>
          {(town) => (
            <div
              ref={townRefs[town.id]}
              class="absolute h-[30px] w-[30px] cursor-pointer rounded-full border-4 border-red-600 bg-black transition hover:scale-110"
              style={{ top: `${town.pos().y}px`, left: `${town.pos().x}px` }}
              onMouseOver={() => town.hexes.forEach((hex) => hex.setHovered(true))}
              onMouseOut={() => town.hexes.forEach((hex) => hex.setHovered(false))}
            />
          )}
        </For>

        <For each={roadsArray()}>
          {(road) => (
            <div
              ref={roadRefs[road.id]}
              class="absolute h-[15px] w-[50px] cursor-pointer rounded-sm border-4 border-black bg-red-500 transition hover:scale-110"
              style={{
                top: `${road.pos().y}px`,
                left: `${road.pos().x}px`,
                rotate: `${road.pos().angle}deg`
              }}
              onMouseOver={() => road.hexes.forEach((hex) => hex.setHovered(true))}
              onMouseOut={() => road.hexes.forEach((hex) => hex.setHovered(false))}
            />
          )}
        </For>
      </Portal>
    </div>
  );
}
