import { Index, type JSX, createSignal } from "solid-js";
import { getNeighbourHex } from "./utils/neighbour";
import getTown from "./utils/getTowns";
import { type HexHighlghted } from "./Board";

const HexType = {
  brick: { color: "text-red-400", icon: "🧱" },
  lumber: { color: "text-yellow-900", icon: "🪵" },
  ore: { color: "text-slate-400", icon: "🪨" },
  grain: { color: "text-yellow-400", icon: "🌾" },
  wool: { color: "text-lime-600", icon: "🐑" }
} satisfies Record<HexagonProps["type"], { color: string; icon: string }>;

interface Position {
  x: number;
  y: number;
}

export interface HexagonProps {
  type: Hex["type"];
  children?: JSX.Element;
  x: number;
  y: number;
  highlighted?: boolean;
  townHovered: number | null;
  rowLen: number;
  prevRowLen: number | null;
  nextRowLen: number | null;
  onRoadHover: (data: HexHighlghted) => void;
  onTownHover: (data: TownState) => void;
  onTownClick: (data: TownState) => void;
}

export default function Hexagon(props: HexagonProps) {
  const [settlements] = createSignal<number[]>(new Array(6).fill(0));
  const [roads] = createSignal<number[]>(new Array(6).fill(0));

  function getPosition(pos: { x: number; y: number }) {
    return `${pos.x}.${pos.y}`;
  }

  function getNeighbour(idx: number): Position | null {
    return getNeighbourHex({
      neighbourIdx: idx,
      x: props.x,
      y: props.y,
      rowLen: props.rowLen,
      prevRowLen: props.prevRowLen,
      nextRowLen: props.nextRowLen
    });
  }

  function getSettlement(idx: number): TownState {
    return getTown({
      townIdx: idx,
      x: props.x,
      y: props.y,
      rowLen: props.rowLen,
      prevRowLen: props.prevRowLen,
      nextRowLen: props.nextRowLen
    });
  }

  return (
    <div class="relative" classList={{ "transition scale-[102%]": props.highlighted }}>
      <div
        class={`${
          HexType[props.type].color
        } flex h-[120px] w-[calc(0.8658*120px)] flex-col items-center justify-center bg-current [clip-path:_polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)] `}
      >
        <span class="text-[40px] text-white">{props.children || HexType[props.type].icon}</span>
      </div>

      <Index each={settlements()}>
        {(_, idx) => (
          <div
            class="absolute z-10 flex h-[20px] w-[20px] cursor-pointer items-center justify-center rounded-full transition"
            classList={{
              "bg-blue-100 border-2 border-black top-0 left-2/4 translate-y-[5px] translate-x-[-50%]":
                idx === 0,
              "bg-blue-100 border-2 border-black top-1/4 left-full translate-y-[0] translate-x-[-110%]":
                idx === 1,
              "bg-blue-100 border-2 border-black top-3/4 left-full translate-y-[-100%] translate-x-[-110%]":
                idx === 2,
              "bg-blue-100 border-2 border-black top-full left-2/4 translate-y-[calc(-100%-5px)] translate-x-[-50%]":
                idx === 3,
              "bg-blue-100 border-2 border-black top-3/4 left-0 translate-y-[-100%] translate-x-[2px]":
                idx === 4,
              "bg-blue-100 border-2 border-black top-1/4 left-0 translate-y-[0] translate-x-[2px]":
                idx === 5,
              "scale-125": props.townHovered === idx
            }}
            onMouseOver={() => props.onTownHover(getSettlement(idx))}
            onMouseOut={() => props.onTownHover({})}
            onClick={() => props.onTownClick(getSettlement(idx))}
          >
            {idx}
          </div>
        )}
      </Index>

      <Index each={roads()}>
        {(_, idx) => {
          const neighbour = getNeighbour(idx);
          return (
            <div
              class="absolute z-10 flex h-[10px] w-[10px] cursor-pointer items-center justify-center rounded-full text-[10px] transition hover:scale-125"
              classList={{
                "top-[20%] left-[72%] translate-y-[-50%] translate-x-[-50%]": idx === 0,
                "top-[50%] left-[92%] translate-y-[-50%] translate-x-[-50%]": idx === 1,
                "top-[80%] left-[72%] translate-y-[-50%] translate-x-[-50%]": idx === 2,
                "top-[80%] left-[28%] translate-y-[-50%] translate-x-[-50%]": idx === 3,
                "top-[50%] left-[8%] translate-y-[-50%] translate-x-[-50%]": idx === 4,
                "top-[20%] left-[28%] translate-y-[-50%] translate-x-[-50%]": idx === 5
              }}
              onMouseOver={() => props.onRoadHover(neighbour || { x: null, y: null })}
              onMouseOut={() => props.onRoadHover({ x: null, y: null })}
            >
              {neighbour ? getPosition(neighbour) : null}
            </div>
          );
        }}
      </Index>
    </div>
  );
}
