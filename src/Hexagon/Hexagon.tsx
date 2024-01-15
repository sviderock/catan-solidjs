import { Show, type JSX, type Ref } from "solid-js";
import { ResourceIcon, SandColor } from "../constants";
import { shadeHexColor } from "../utils/utils";
import HexDebug from "./HexDebug";

const HexType = {
  brick: { color: "#A25353", icon: ResourceIcon.brick, iconCode: "&#129521;" },
  lumber: { color: "#3F923A", icon: ResourceIcon.lumber, iconCode: "&#129717;" },
  ore: { color: "#98B0C3", icon: ResourceIcon.ore, iconCode: "&#129704;" },
  grain: { color: "#fece41", icon: ResourceIcon.grain, iconCode: "&#127806;" },
  wool: { color: "#86CD82", icon: ResourceIcon.wool, iconCode: "&#128017;" },
  desert: { color: "#feb536", icon: ResourceIcon.desert, iconCode: "&#127964;" }
} satisfies Record<HexagonProps["type"], { color: string; icon: string; iconCode: string }>;

export type HexagonProps = Hex & {
  debug?: boolean;
  ref: Ref<HTMLDivElement | undefined>;
  children?: JSX.Element;
  onNeighbourHover: (neighbour: Id, hovered: boolean) => void;
};

export default function Hexagon(props: HexagonProps) {
  const icon = () => HexType[props.type].icon;
  const color = () => HexType[props.type].color;
  const borderColor = () => shadeHexColor(HexType[props.type].color, -0.3);
  const circleColor = () => (props.value === 6 || props.value === 8 ? "#C6362F" : "#262322");

  const backgroundImage = () => {
    const iconCode = HexType[props.type].iconCode.replace("#", "%23");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><text x="0" y="40" font-size="40" fill="black">${iconCode}</text></svg>`;
    return `url('data:image/svg+xml,${svg}')`;
  };

  return (
    <div ref={props.ref} class="relative mx-[-0.5px] my-[calc(var(--hex-size)*0.125*-1)]">
      <HexDiv style={{ color: SandColor }}>
        <HexDiv
          style={{
            color: borderColor(),
            "--size": "calc(var(--hex-size) * 0.85)"
          }}
        >
          <HexDiv
            class="select-none"
            style={{
              color: color(),
              "--size": "calc(var(--hex-size) * 0.8)",
              "background-image": props.value !== 7 ? backgroundImage() : ""
            }}
          >
            <Show
              when={props.value !== 7}
              fallback={<span class="text-[length:calc((var(--size)*0.6))]">{icon()}</span>}
            >
              <span
                class="flex h-[--circle-size] w-[--circle-size] items-center justify-center rounded-full border border-[color:#262322] text-[length:calc((var(--size)/3.5))] leading-none shadow-xl [--circle-size:calc((var(--size)/2.5))]"
                classList={{ "transition scale-110": props.hovered() }}
                style={{ color: circleColor(), "background-color": SandColor }}
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
