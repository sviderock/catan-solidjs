import { type Ref } from "solid-js";
import { Resource } from "../constants";

type Props = Harbor & {
  ref: Ref<HTMLDivElement>;
  dock1Ref: Ref<HTMLDivElement>;
  dock2Ref: Ref<HTMLDivElement>;
  debug?: boolean;
};

export default function Harbor(props: Props) {
  const icon = () => {
    if (props.type === "all") {
      return <span class="text-[1.5rem]">3:1</span>;
    }

    return (
      <div
        data-before="2:1"
        class="rounded-full border-4 border-[--border-color] bg-[--color] p-[6px] text-[1.5rem] leading-none before:absolute before:-top-1/2 before:left-1/2 before:-translate-x-1/2 before:text-[1rem] before:content-[attr(data-before)]"
        style={{
          "--color": Resource[props.type].color,
          "--border-color": Resource[props.type].borderColor
        }}
      >
        {Resource[props.type].icon}
      </div>
    );
  };

  return (
    <div
      ref={props.ref}
      class="absolute flex select-none items-center justify-center leading-none"
      style={{
        top: `${props.pos().y}px`,
        left: `${props.pos().x}px`
      }}
    >
      <span class="text-[1.5rem]">{icon()}</span>
    </div>
  );
}
