import { type Ref } from "solid-js";

export type TownProps = Town & {
  ref: Ref<HTMLDivElement>;
  game: Game;
  onClick: () => void;
};

export default function Town(props: TownProps) {
  const isAvailable = () => props.available() && !props.disabled();

  return (
    <div
      ref={props.ref}
      class="absolute h-[--town-size] w-[--town-size] cursor-pointer rounded-full border-[calc(var(--town-size)*0.125)] [--town-size:calc(var(--hex-size)/7.5)] hover:scale-110"
      classList={{
        "!bg-indigo-500 !border-indigo-900 !border-[calc(var(--town-size)*0.35)]":
          props.level() === "city",
        "!bg-indigo-500 !border-indigo-900 !opacity-100": props.active(),
        "opacity-0 invisible": !isAvailable(),
        "!bg-green-100 border-green-900 opacity-60 hover:bg-indigo-500 hover:border-indigo-900":
          isAvailable()
      }}
      style={{ top: `${props.pos().y}px`, left: `${props.pos().x}px` }}
      onMouseOver={() => {
        if (!isAvailable()) return;
        props.hexes.forEach(({ hex }) => hex.setHovered(true));
      }}
      onMouseOut={() => props.hexes.forEach(({ hex }) => hex.setHovered(false))}
      onClick={() => props.onClick()}
    />
  );
}
