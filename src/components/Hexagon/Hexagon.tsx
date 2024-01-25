import { Show, type JSX, type Ref } from "solid-js";
import { Resource, SandColor } from "../../constants";
import HexDebug from "./HexDebug";
import { backgroundImageSvg } from "@/utils";

export type HexagonProps = Hex & {
  debug?: boolean;
  ref: Ref<HTMLDivElement | undefined>;
  children?: JSX.Element;
  onNeighbourHover: (neighbour: Id, hovered: boolean) => void;
};

export default function Hexagon(props: HexagonProps) {
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
            class="select-none bg-[image:--bg]"
            style={{
              color: Resource[props.type].color,
              "--size": "calc(var(--hex-size) * 0.8)",
              "--bg": props.value !== 7 ? backgroundImageSvg(Resource[props.type].iconCode) : ""
            }}
          >
            <Show
              when={props.value !== 7}
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
