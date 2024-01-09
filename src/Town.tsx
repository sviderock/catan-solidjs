import { type Ref } from "solid-js";
import { shadeHexColor } from "./utils/utils";

export type TownProps = Town & {
  ref: Ref<HTMLDivElement>;
  available: boolean;
  player?: Player;
  onClick: () => void;
};

export default function Town(props: TownProps) {
  return (
    <div
      ref={props.ref}
      class={`absolute h-[--town-size] w-[--town-size] cursor-pointer rounded-full border-[calc(var(--town-size)*0.125)] border-[color:--town-border-color] bg-[--town-color] opacity-100 [--town-size:calc(var(--hex-size)/7.5)] hover:scale-110`}
      classList={{
        "!border-[calc(var(--town-size)*0.3)]": props.level() === "city",
        "opacity-0 invisible pointer-events-none": !props.available && !props.player,
        "!bg-green-100 !border-green-900 !opacity-60": props.available && !props.player
      }}
      style={{
        top: `${props.pos().y}px`,
        left: `${props.pos().x}px`,
        "--town-color": props.player?.color,
        "--town-border-color": props.player?.color ? shadeHexColor(props.player!.color, -0.55) : ""
      }}
      onMouseOver={() => props.hexes.forEach(({ hex }) => hex.setHovered(true))}
      onMouseOut={() => props.hexes.forEach(({ hex }) => hex.setHovered(false))}
      onClick={() => props.onClick()}
    />
  );
}
