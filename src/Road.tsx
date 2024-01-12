import { type Ref } from "solid-js";
import { shadeHexColor } from "./utils/utils";

type RoadProps = Road & {
  ref: Ref<HTMLDivElement>;
  available: boolean;
  player?: Player;
  onClick: () => void;
};

const roadHeight = "[--road-height:calc(var(--hex-size)*0.08)]";
const roadWidth = "w-[calc(var(--hex-size)*0.33)]";
const roadBorder = "border-[calc(var(--road-height)*0.2)]";
const roadRounding = "rounded-[calc(var(--road-height)*0.1)]";

export default function Road(props: RoadProps) {
  return (
    <div
      ref={props.ref}
      class={`absolute ${roadHeight} h-[--road-height] ${roadWidth} cursor-pointer ${roadRounding} ${roadBorder} border-[color:--road-border-color] bg-[--road-color] transition hover:scale-105`}
      classList={{
        "opacity-0 invisible pointer-events-none": !props.available && !props.player,
        "!bg-green-100 !border-green-900 opacity-60 hover:bg-indigo-500 hover:border-indigo-900":
          props.available && !props.player
      }}
      style={{
        top: `${props.pos().y}px`,
        left: `${props.pos().x}px`,
        rotate: `${props.pos().angle}deg`,
        "--road-color": props.player?.color,
        "--road-border-color": props.player?.color ? shadeHexColor(props.player!.color, -0.55) : ""
      }}
      onMouseOver={() => props.hexes.forEach(({ hex }) => hex.setHovered(true))}
      onMouseOut={() => props.hexes.forEach(({ hex }) => hex.setHovered(false))}
      onClick={() => props.onClick()}
    />
  );
}
