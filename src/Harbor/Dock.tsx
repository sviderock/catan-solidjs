import { type Ref } from "solid-js";
import { SandColor } from "../constants";
import { shadeHexColor } from "../utils";

interface Props {
  ref: Ref<HTMLDivElement>;
  pos: HarborPos["dock1"];
}

export default function Dock(props: Props) {
  return (
    <div
      ref={props.ref}
      class="absolute h-[--height] w-[60px] rounded-sm bg-[--color]"
      style={{
        top: `${props.pos.y}px`,
        left: `${props.pos.x}px`,
        rotate: `${props.pos.angle}deg`,
        "--color": shadeHexColor(SandColor, -0.1),
        "--height": "calc(var(--hex-size) * 0.075)"
      }}
    />
  );
}
