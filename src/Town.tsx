import { type Ref } from "solid-js";
import { shadeHexColor } from "./utils/utils";
import { twMerge } from "tailwind-merge";

export type TownProps = Town & {
  ref: Ref<HTMLDivElement>;
  unoccupied: boolean;
  player?: Player;
  debug?: boolean;
  onClick: () => void;
};

// [--town-size:calc(var(--hex-size)/7.5)]
export default function Town(props: TownProps) {
  return (
    <div
      ref={props.ref}
      class={twMerge(
        "absolute h-[--town-size] w-[--town-size] cursor-pointer rounded-full border-[length:--town-border-width] opacity-100 transition hover:scale-110",
        !props.unoccupied && !props.player && "cursor-default border-transparent opacity-0",
        props.unoccupied && "border-green-900 bg-green-100 opacity-60",
        !!props.player && "border-[color:--town-border-color] bg-[--town-color] opacity-100",
        props.level() === "city" && "border-[length:--city-border-width]",
        props.debug &&
          "flex items-center justify-center before:absolute before:h-[1px] before:w-[100%] before:bg-yellow-600 before:content-[''] after:absolute after:top-0 after:h-[100%] after:w-[1px] after:bg-yellow-700 after:content-['']"
      )}
      style={{
        top: `${props.pos().y}px`,
        left: `${props.pos().x}px`,
        "--town-size": "calc(var(--hex-size) * 0.1333)",
        "--town-color": props.player?.color,
        "--town-border-width": "calc(var(--town-size) * 0.15)",
        "--city-border-width": "calc(var(--town-size) * 0.3)",
        "--town-border-color": props.player?.color ? shadeHexColor(props.player!.color, -0.5) : ""
      }}
      onMouseOver={() => {
        if (!props.unoccupied) return;
        props.hexes.forEach(({ hex }) => hex.setHovered(true));
      }}
      onMouseOut={() => {
        if (!props.unoccupied) return;
        props.hexes.forEach(({ hex }) => hex.setHovered(false));
      }}
      onClick={() => props.onClick()}
    />
  );
}
