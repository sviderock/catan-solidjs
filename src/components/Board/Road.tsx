import { type Ref } from "solid-js";
import { shadeHexColor, cn } from "@/utils";

type RoadProps = Road & {
  ref: Ref<HTMLDivElement>;
  canBuild: boolean;
  occupiedBy?: Player;
  debug?: boolean;
  currentPlayer: Player;
  onClick: () => void;
};

export default function Road(props: RoadProps) {
  return (
    <div
      ref={props.ref}
      data-after={props.debug ? props.idx : ""}
      onClick={() => {
        if (!props.canBuild) return;
        props.onClick();
      }}
      class={cn(
        "absolute h-[--road-height] w-[--road-width] cursor-pointer rounded-[--road-border-round] border-[length:--road-border-width] transition hover:scale-105",

        props.debug &&
          "flex items-center justify-center border-green-900 bg-green-100 opacity-60  after:absolute after:flex after:items-center after:justify-center after:content-[attr(data-after)]",

        props.canBuild && !props.occupiedBy && "border-green-900 bg-green-100 opacity-60",

        !props.canBuild &&
          !props.occupiedBy &&
          "pointer-events-none cursor-default border-transparent opacity-0",

        !!props.occupiedBy && "border-[color:--road-border-color] bg-[--road-color] opacity-100",

        props.occupiedBy && props.occupiedBy !== props.currentPlayer && "cursor-default"
      )}
      style={{
        top: `${props.pos().y}px`,
        left: `${props.pos().x}px`,
        rotate: `${props.pos().angle}deg`,
        "--road-height": "calc(var(--hex-size) * 0.08)",
        "--road-width": "calc(var(--hex-size) * 0.33)",
        "--road-color": props.occupiedBy?.color,
        "--road-border-width": "calc(var(--road-height) * 0.2)",
        "--road-border-round": "calc(var(--road-height) * 0.1)",
        "--road-border-color": props.occupiedBy?.color
          ? shadeHexColor(props.occupiedBy!.color, -0.5)
          : ""
      }}
    />
  );
}
