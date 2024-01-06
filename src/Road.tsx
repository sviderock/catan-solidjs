import { type Ref } from "solid-js";

type RoadProps = Road & {
  ref: Ref<HTMLDivElement>;
  onClick: () => void;
};

export default function Road(props: RoadProps) {
  return (
    <div
      ref={props.ref}
      class="absolute h-[--road-height] w-[calc(var(--hex-size)/3.4285)] cursor-pointer rounded-[calc(var(--road-height)*0.1)] border-[calc(var(--road-height)*0.2)] [--road-height:calc(var(--hex-size)/12)] hover:scale-110"
      style={{
        top: `${props.pos().y}px`,
        left: `${props.pos().x}px`,
        rotate: `${props.pos().angle}deg`
      }}
      classList={{
        "opacity-0 invisible": !props.available(),
        "!bg-indigo-300 !border-indigo-500 !opacity-100 ": props.active(),
        "bg-green-100 border-green-900 opacity-60 hover:bg-indigo-500 hover:border-indigo-900":
          props.available()
      }}
      onMouseOver={() => props.hexes.forEach(({ hex }) => hex.setHovered(true))}
      onMouseOut={() => props.hexes.forEach(({ hex }) => hex.setHovered(false))}
      onClick={() => props.onClick()}
    />
  );
}
