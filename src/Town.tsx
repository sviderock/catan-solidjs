import { type Ref } from "solid-js";
import { shadeHexColor } from "./utils";
import { twMerge } from "tailwind-merge";

export type TownProps = Town & {
  ref: Ref<HTMLDivElement>;
  canBuild: boolean;
  occupiedBy?: Player;
  currentPlayer: Player;
  harbor?: Harbor;
  debug?: boolean;
  onClick: () => void;
};

// [--town-size:calc(var(--hex-size)/7.5)]
export default function Town(props: TownProps) {
  return (
    <div
      ref={props.ref}
      data-after={props.debug ? props.idx : ""}
      class={twMerge(
        "absolute h-[--town-size] w-[--town-size] cursor-pointer rounded-full transition hover:scale-110",

        props.debug &&
          "flex items-center justify-center border-[length:--town-border-width] border-green-900 bg-green-100 opacity-60 before:absolute before:h-[1px] before:w-[100%] before:bg-yellow-600 before:content-[''] after:absolute after:top-0 after:flex after:h-[100%] after:w-[1px] after:items-center after:justify-center after:bg-yellow-700 after:content-[attr(data-after)]",

        props.canBuild &&
          !props.occupiedBy &&
          "border-[length:--town-border-width] border-green-900 bg-green-100 opacity-60",

        !props.canBuild &&
          !props.occupiedBy &&
          !props.debug &&
          "pointer-events-none cursor-default border-transparent opacity-0",

        !!props.occupiedBy &&
          "border-[length:--town-border-width] border-[color:--town-border-color] bg-[--town-color] opacity-100",

        props.level() === "city" && "border-[length:--city-border-width] opacity-100",

        props.occupiedBy && props.occupiedBy !== props.currentPlayer && "cursor-default"
      )}
      style={{
        top: `${props.pos().y}px`,
        left: `${props.pos().x}px`,
        "--town-size": "calc(var(--hex-size) * 0.1333)",
        "--town-color": props.occupiedBy?.color,
        "--town-border-width": "calc(var(--town-size) * 0.15)",
        "--city-border-width": "calc(var(--town-size) * 0.3)",
        "--town-border-color": props.occupiedBy?.color
          ? shadeHexColor(props.occupiedBy!.color, -0.5)
          : ""
      }}
      onMouseOver={() => {
        if (!props.canBuild) return;
        props.hexes.forEach(({ hex }) => hex.setHovered(true));
      }}
      onMouseOut={() => {
        if (!props.canBuild) return;
        props.hexes.forEach(({ hex }) => hex.setHovered(false));
      }}
      onClick={() => {
        if (!props.canBuild) return;
        props.onClick();
      }}
    />
  );
}
