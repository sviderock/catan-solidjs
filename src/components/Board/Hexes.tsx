import { DESERT_VALUE, Resource, SandColor } from "@/constants";
import { debug, refs, state } from "@/state";
import { backgroundImageSvg, cn } from "@/utils";
import { For, Index, Show, type JSX, type Ref } from "solid-js";

export default function Hexes() {
  return (
    <For each={state.hexes.layout}>
      {(hexRow) => (
        <div class="flex">
          <For each={hexRow}>
            {(hex) => (
              <Hex
                debug={debug()}
                {...hex}
                ref={refs[hex.id]}
                onNeighbourHover={(id, hovered) => state.hexes.byId[id]!.setHovered(hovered)}
              />
            )}
          </For>
        </div>
      )}
    </For>
  );
}

export type HexProps = Hex & {
  debug?: boolean;
  ref: Ref<HTMLDivElement | undefined>;
  children?: JSX.Element;
  onNeighbourHover: (neighbour: Id, hovered: boolean) => void;
};

function Hex(props: HexProps) {
  const desert = () => props.value === DESERT_VALUE;
  const opacity = () => (state.robber.hex.id === props.id ? 0.3 : 1);

  return (
    <div ref={props.ref} class="relative mx-[-0.5px] my-[calc(var(--hex-size)*0.125*-1)]">
      <HexDiv style={{ color: SandColor }}>
        <HexDiv
          style={{
            color: Resource[props.type].borderColor,
            "--size": "calc(var(--hex-size) * 0.85)"
          }}
        >
          <HexDiv
            class={cn("select-none bg-[image:--bg]", state.robber.hex.id === props.id && "*:hidden")}
            style={{
              color: Resource[props.type].color,
              "--size": "calc(var(--hex-size) * 0.8)",
              "--bg": !desert() ? backgroundImageSvg(Resource[props.type].iconCode, opacity()) : ""
            }}
          >
            <Show
              when={!desert()}
              fallback={
                <span class="text-[length:calc((var(--size)*0.6))]">{Resource[props.type].icon}</span>
              }
            >
              <span
                class="flex h-[--circle-size] w-[--circle-size] items-center justify-center rounded-full border border-[color:#262322] text-[length:calc((var(--size)/3.5))] leading-none shadow-xl [--circle-size:calc((var(--size)/2.5))]"
                classList={{ "transition scale-110": props.hovered() }}
                style={{
                  "background-color": SandColor,
                  color: props.value === 6 || props.value === 8 ? "#C6362F" : "#262322"
                }}
              >
                {props.value}
              </span>
            </Show>
          </HexDiv>
        </HexDiv>
      </HexDiv>

      <HexDebug
        debug={props.debug}
        siblings={props.siblings}
        onNeighbourHover={props.onNeighbourHover}
      />
    </div>
  );
}

function HexDiv(props: JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      class={`flex h-[--size] w-[calc(0.8658*var(--size))] flex-col items-center justify-center bg-current bg-opacity-50 bg-[length:calc(var(--size)*0.5)] bg-[left_calc(var(--size)*0.08333)_top_calc(var(--size)*0.125)] bg-repeat transition [--size:--hex-size] [clip-path:_polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)] ${props.class}`}
    />
  );
}

function HexDebug(props: Pick<HexProps, "debug" | "siblings" | "onNeighbourHover">) {
  const settlements = new Array(6).fill(0);
  return (
    <Show when={props.debug}>
      <Index each={settlements}>
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

      <Index each={props.siblings}>
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
  );
}
