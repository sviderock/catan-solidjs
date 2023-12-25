import { Index, type JSX, createSignal } from "solid-js";

const HexType = {
  brick: { color: "text-red-400", icon: "🧱" },
  lumber: { color: "text-yellow-900", icon: "🪵" },
  ore: { color: "text-slate-400", icon: "🪨" },
  grain: { color: "text-yellow-400", icon: "🌾" },
  wool: { color: "text-lime-600", icon: "🐑" }
} satisfies Record<HexagonProps["type"], { color: string; icon: string }>;

export interface HexagonProps {
  type: "brick" | "lumber" | "ore" | "grain" | "wool";
  children?: JSX.Element;
  x: number;
  y: number;
  onHover: (data: { x: number | null; y: number | null }) => void;
  active?: boolean;
  rowLen: number;
  prevRowLen: number | null;
  nextRowLen: number | null;
}

export default function Hexagon(props: HexagonProps) {
  const [settlements] = createSignal<number[]>(new Array(6).fill(0));
  const [roads] = createSignal<number[]>(new Array(6).fill(0));

  /**
   * 0 neighbour = x-1, y     |   x+1  if (prevRowLen < rowLen)
   * 1 neighbour = x,   y+1   |
   * 2 neighbour = x+1, y+1   |   y    if (nextRowLen < rowLen)
   * 3 neighbour = x+1, y     |   y+1  if (nextRowLen < rowLen)
   * 4 neighbour = x,   y-1   |
   * 5 neighbour = x-1, y-1   |   y    if (prevRowLen < rowLen)
   */
  function calculateNeighbour(idx: number) {
    // prettier-ignore
    switch (idx) {
      case 0: return { x: props.x - 1,  y: props.prevRowLen > props.rowLen ? props.y + 1 : props.y };
      case 1: return { x: props.x,      y: props.y + 1 };
      case 2: return { x: props.x + 1,  y: props.nextRowLen < props.rowLen ? props.y : props.y + 1 };
      case 3: return { x: props.x + 1,  y: props.nextRowLen < props.rowLen ? props.y - 1 : props.y };
      case 4: return { x: props.x,      y: props.y - 1 };
      case 5: return { x: props.x - 1,  y: props.prevRowLen > props.rowLen ? props.y : props.y - 1 };
    }
  }

  function getPosition(pos: { x: number; y: number }) {
    return `${pos.x},${pos.y}`;
  }

  return (
    <div class="relative" classList={{ "transition scale-[102%]": props.active }}>
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
            class="absolute z-10 flex h-[20px] w-[20px] cursor-pointer items-center justify-center rounded-full transition hover:scale-125"
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
                idx === 5
            }}
          >
            {idx}
          </div>
        )}
      </Index>

      <Index each={roads()}>
        {(_, idx) => {
          const neighbour = calculateNeighbour(idx);
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
              onMouseOver={() => props.onHover(neighbour)}
              onMouseOut={() => props.onHover({ x: null, y: null })}
            >
              {getPosition(neighbour)}
            </div>
          );
        }}
      </Index>
      {/* <Index each={roads()}>
        {(road, idx) => (
          <div
            class="absolute z-10 flex h-[10px] w-[10px] cursor-pointer items-center justify-center rounded-full text-[10px] transition hover:scale-125"
            classList={{
              "bg-white border border-black top-[20%] left-[72%] translate-y-[-50%] translate-x-[-50%]":
                idx === 0,
              "bg-white border border-black top-[50%] left-[92%] translate-y-[-50%] translate-x-[-50%]":
                idx === 1,
              "bg-white border border-black top-[80%] left-[72%] translate-y-[-50%] translate-x-[-50%]":
                idx === 2,
              "bg-white border border-black top-[80%] left-[28%] translate-y-[-50%] translate-x-[-50%]":
                idx === 3,
              "bg-white border border-black top-[50%] left-[8%] translate-y-[-50%] translate-x-[-50%]":
                idx === 4,
              "bg-white border border-black top-[20%] left-[28%] translate-y-[-50%] translate-x-[-50%]":
                idx === 5
            }}
          />
        )}
      </Index> */}
    </div>
  );
}
