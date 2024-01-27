import { Resource, SandColor } from "@/constants";
import { debug, refs, state } from "@/state";
import { shadeHexColor } from "@/utils";
import { For, type Ref } from "solid-js";

export default function Harbors() {
  return (
    <For each={state.harbors.array}>
      {(harbor) => (
        <>
          <Dock ref={refs[harbor.dockIds[0]]!} pos={harbor.pos().dock1} />
          <Dock ref={refs[harbor.dockIds[1]]!} pos={harbor.pos().dock2} />
          <Harbor
            debug={debug()}
            {...harbor}
            ref={refs[harbor.id]!}
            dock1Ref={refs[harbor.dockIds[0]]!}
            dock2Ref={refs[harbor.dockIds[1]]!}
          />
        </>
      )}
    </For>
  );
}

type Props = Harbor & {
  ref: Ref<HTMLDivElement>;
  dock1Ref: Ref<HTMLDivElement>;
  dock2Ref: Ref<HTMLDivElement>;
  debug?: boolean;
};

function Harbor(props: Props) {
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

function Dock(props: { ref: Ref<HTMLDivElement>; pos: HarborPos["dock1"] }) {
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
