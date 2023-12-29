import { Index, Match, Show, Switch, createSignal, type JSX, type Ref } from "solid-js";

const HexType = {
  brick: { color: "text-red-400", icon: "🧱" },
  lumber: { color: "text-yellow-900", icon: "🪵" },
  ore: { color: "text-slate-400", icon: "🪨" },
  grain: { color: "text-yellow-400", icon: "🌾" },
  wool: { color: "text-lime-600", icon: "🐑" }
} satisfies Record<HexagonProps["type"], { color: string; icon: string }>;

export type HexagonProps = Hex & {
  debug?: boolean;
  ref: Ref<HTMLDivElement | undefined>;
  children?: JSX.Element;
  onNeighbourHover: (neighbour: Id, hovered: boolean) => void;
};

export default function Hexagon(props: HexagonProps) {
  const [settlements] = createSignal<number[]>(new Array(6).fill(0));

  return (
    <div ref={props.ref} class="relative">
      <div
        class={`${
          HexType[props.type].color
        } flex h-[120px] w-[calc(0.8658*120px)] flex-col items-center justify-center bg-current transition [clip-path:_polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)] `}
      >
        <span
          class="rounded-full p-2 text-[40px] leading-none text-white"
          classList={{ "transition scale-105 border-2": props.hovered() }}
        >
          <Switch fallback={HexType[props.type].icon}>
            <Match when={props.debug}>{props.id}</Match>
          </Switch>
        </span>
      </div>

      <Show when={props.debug}>
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
                  idx === 5
              }}
            >
              {idx}
            </div>
          )}
        </Index>

        <Index each={props.neighbours}>
          {(neighbour, idx) => (
            <Show when={neighbour()}>
              <div
                class="absolute z-10 flex h-[10px] w-[10px] cursor-pointer items-center justify-center rounded-full text-[10px] transition"
                classList={{
                  "top-[20%] left-[72%] translate-y-[-50%] translate-x-[-50%]": idx === 0,
                  "top-[50%] left-[92%] translate-y-[-50%] translate-x-[-50%]": idx === 1,
                  "top-[80%] left-[72%] translate-y-[-50%] translate-x-[-50%]": idx === 2,
                  "top-[80%] left-[28%] translate-y-[-50%] translate-x-[-50%]": idx === 3,
                  "top-[50%] left-[8%] translate-y-[-50%] translate-x-[-50%]": idx === 4,
                  "top-[20%] left-[28%] translate-y-[-50%] translate-x-[-50%]": idx === 5
                }}
                onMouseOver={() => props.onNeighbourHover(neighbour()!.id, true)}
                onMouseOut={() => props.onNeighbourHover(neighbour()!.id, false)}
              >
                {neighbour()!.id}
              </div>
            </Show>
          )}
        </Index>
      </Show>
    </div>
  );
}
