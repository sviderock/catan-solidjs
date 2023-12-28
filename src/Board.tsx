import { For, Match, type Ref, Switch, createEffect, createSignal } from "solid-js";
import { Portal } from "solid-js/web";
import Hexagon from "./Hexagon";
import { regularBoard } from "./boardArrays";
import { getNeighbourHex } from "./utils/neighbour";
import { getStructureId } from "./utils/structureId";
import { matches } from "./utils";

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
  let atan = Math.atan2(y2 - y1, x2 - x1); // find arctangent
  // we don't want negative angles
  if (atan < 0) atan += Math.PI * 2; // make negative angles positive by adding 360 degrees
  return atan * (180 / Math.PI); // convert angle from radians to degrees;
}

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

function getInitialState() {
  console.time("state");
  const hexes = getHexes();
  const structures = getStructures(hexes);
  console.timeEnd("state");
  return { hexes, structures };
}

export default function Board() {
  const refs = {} as Record<Hex["id"] | Structure["id"], HTMLDivElement | undefined>;
  const [state] = createSignal(getInitialState());

  // https://www.redblobgames.com/grids/hexagons/#basics
  createEffect(() => {
    console.time("hexes_calcs");
    state().hexes.array.forEach((hex) => {
      const rect = refs[hex.id]!.getBoundingClientRect();
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
    console.time("structures_calcs");
    state().structures.array.forEach((structure) => {
      const structureRect = refs[structure.id]!.getBoundingClientRect();
      const structureHalfWidth = structureRect.width / 2;
      const structureHalfHeight = structureRect.height / 2;
      if (structure.type === "town") {
        const intersectedTownsPos = structure.hexes.reduce<{
          left: number;
          right: number;
          top: number;
          bottom: number;
        }>(
          (acc, hex) => {
            const townPos = hex.hex.calc().angles[hex.townIdx]!;
            acc.left = acc.left === -1 ? townPos.x : Math.min(acc.left, townPos.x);
            acc.right = acc.right === -1 ? townPos.x : Math.max(acc.right, townPos.x);
            acc.top = acc.top === -1 ? townPos.y : Math.min(acc.top, townPos.y);
            acc.bottom = acc.bottom === -1 ? townPos.y : Math.max(acc.bottom, townPos.y);
            return acc;
          },
          { left: -1, right: -1, top: -1, bottom: -1 }
        );

        const intersectionCenterX = (intersectedTownsPos.left + intersectedTownsPos.right) / 2;
        const intersectionCenterY = (intersectedTownsPos.top + intersectedTownsPos.bottom) / 2;

        structure.setPos({
          x: intersectionCenterX - structureHalfWidth,
          y: intersectionCenterY - structureHalfHeight
        });
        return;
      }

      if (structure.type === "road") {
        const intersectedRoadsPos = structure.hexes.reduce<{
          left: number;
          right: number;
          top: number;
          bottom: number;
          angle: number;
        }>(
          (acc, hex) => {
            const roadPos = hex.hex.calc().edges[hex.roadIdx]!;
            acc.left = acc.left === -1 ? roadPos.centerX : Math.min(acc.left, roadPos.centerX);
            acc.right = acc.right === -1 ? roadPos.centerX : Math.max(acc.right, roadPos.centerX);
            acc.top = acc.top === -1 ? roadPos.centerY : Math.min(acc.top, roadPos.centerY);
            acc.bottom =
              acc.bottom === -1 ? roadPos.centerY : Math.max(acc.bottom, roadPos.centerY);
            acc.angle = acc.angle === -1 ? roadPos.angle : acc.angle;
            return acc;
          },
          { left: -1, right: -1, top: -1, bottom: -1, angle: -1 }
        );

        const intersectionCenterX = (intersectedRoadsPos.left + intersectedRoadsPos.right) / 2;
        const intersectionCenterY = (intersectedRoadsPos.top + intersectedRoadsPos.bottom) / 2;

        structure.setPos({
          x: intersectionCenterX - structureHalfWidth,
          y: intersectionCenterY - structureHalfHeight,
          angle: intersectedRoadsPos.angle
        });
      }
    });
    console.timeEnd("structures_calcs");
  });

  return (
    <div class="flex scale-150 flex-col flex-wrap items-center justify-center gap-1">
      <For each={state().hexes.layout}>
        {(hexRow) => (
          <div class="my-[-15px] flex gap-1">
            <For each={hexRow}>
              {(hex) => (
                <Hexagon
                  {...hex}
                  ref={refs[hex.id]}
                  onNeighbourHover={(id, hovered) => state().hexes.byId[id]!.setHovered(hovered)}
                />
              )}
            </For>
          </div>
        )}
      </For>

      <Portal>
        <For each={state().structures.array}>
          {(structure) => (
            <Switch>
              <Match when={matches(structure, (s): s is Town => s.type === "town")}>
                {(town) => <Town ref={refs[town().id]!} {...town()} />}
              </Match>
              <Match when={matches(structure, (s): s is Road => s.type === "road")}>
                {(road) => <Road ref={refs[road().id]!} {...road()} />}
              </Match>
            </Switch>
          )}
        </For>
      </Portal>
    </div>
  );
}

function Town(props: Town & { ref: Ref<HTMLDivElement> }) {
  return (
    <div
      ref={props.ref}
      class="absolute h-[30px] w-[30px] cursor-pointer rounded-full border-4 border-red-600 bg-black transition hover:scale-110"
      style={{ top: `${props.pos().y}px`, left: `${props.pos().x}px` }}
      onMouseOver={() => props.hexes.forEach(({ hex }) => hex.setHovered(true))}
      onMouseOut={() => props.hexes.forEach(({ hex }) => hex.setHovered(false))}
    />
  );
}

function Road(props: Road & { ref: Ref<HTMLDivElement> }) {
  return (
    <div
      ref={props.ref}
      class="absolute h-[15px] w-[50px] cursor-pointer rounded-sm border-4 border-black bg-red-500 transition hover:scale-110"
      style={{
        top: `${props.pos().y}px`,
        left: `${props.pos().x}px`,
        rotate: `${props.pos().angle}deg`
      }}
      onMouseOver={() => props.hexes.forEach(({ hex }) => hex.setHovered(true))}
      onMouseOut={() => props.hexes.forEach(({ hex }) => hex.setHovered(false))}
    />
  );
}
