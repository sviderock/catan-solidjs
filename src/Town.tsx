import { type Ref } from "solid-js";
import { shadeHexColor } from "./utils/utils";

export type TownProps = Town & {
  ref: Ref<HTMLDivElement>;
  available: boolean;
  player?: Player;
  debug?: boolean;
  onClick: () => void;
};

const townSize = "[--town-size:calc(var(--hex-size)*0.1333)]";
const settlementBorder = "border-[calc(var(--town-size)*0.15)]";
const cityBorder = "!border-[calc(var(--town-size)*0.3)]";

// [--town-size:calc(var(--hex-size)/7.5)]
export default function Town(props: TownProps) {
  const debugClasses = () => {
    const classes =
      "before:absolute before:h-[1px] before:w-[100%] flex before:bg-yellow-600 before:content-[''] items-center justify-center after:content-[''] after:absolute after:bg-yellow-700 after:h-[100%] after:top-0 after:w-[1px]";
    return props.debug ? classes : "";
  };

  return (
    <div
      ref={props.ref}
      class={`absolute h-[--town-size] w-[--town-size] cursor-pointer rounded-full  border-[color:--town-border-color] bg-[--town-color] opacity-100 ${townSize} ${settlementBorder} transition hover:scale-110 ${debugClasses()}`}
      classList={{
        [cityBorder]: props.level() === "city",
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
