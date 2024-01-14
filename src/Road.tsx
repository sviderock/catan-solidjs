import { type Ref } from "solid-js";
import { shadeHexColor } from "./utils/utils";
import { twMerge } from "tailwind-merge";

type RoadProps = Road & {
  ref: Ref<HTMLDivElement>;
  unoccupied: boolean;
  player?: Player;
  onClick: () => void;
};

export default function Road(props: RoadProps) {
  return (
    <div
      ref={props.ref}
      onClick={() => props.onClick()}
      class={twMerge(
        "absolute h-[--road-height] w-[--road-width] cursor-pointer rounded-[--road-border-round] border-[length:--road-border-width] transition hover:scale-105",
        !props.unoccupied && "cursor-default border-transparent opacity-0",
        props.unoccupied && "border-green-900 bg-green-100 opacity-60",
        !!props.player && "border-[color:--road-border-color] bg-[--road-color] opacity-100"
      )}
      style={{
        top: `${props.pos().y}px`,
        left: `${props.pos().x}px`,
        rotate: `${props.pos().angle}deg`,
        "--road-height": "calc(var(--hex-size) * 0.08)",
        "--road-width": "calc(var(--hex-size) * 0.33)",
        "--road-color": props.player?.color,
        "--road-border-width": "calc(var(--road-height) * 0.2)",
        "--road-border-round": "calc(var(--road-height) * 0.1)",
        "--road-border-color": props.player?.color ? shadeHexColor(props.player!.color, -0.5) : ""
      }}
    />
  );
}
