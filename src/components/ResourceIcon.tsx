import { Resource } from "@/constants";
import { cn } from "@/utils";
import { FaSolidAsterisk } from "solid-icons/fa";
import { splitProps, type JSX } from "solid-js";

type Props = Pick<Harbor, "type"> & JSX.HTMLAttributes<HTMLDivElement> & { count?: number };

export default function ResourceIcon(props: Props) {
  const [, rest] = splitProps(props, ["class", "type", "count"]);
  return (
    <div
      class={cn(
        "border-(--border-color) bg-(--color) flex h-[44px] w-[44px] select-none items-center justify-center rounded-full border-4 p-[6px] text-[1.5rem] leading-none aria-disabled:opacity-50",
        props.count !== undefined &&
          "relative after:absolute after:bottom-[-5px] after:right-[-5px] after:flex after:h-5 after:w-5 after:items-center after:justify-center after:rounded-full after:border after:bg-blue-500 after:text-[0.6rem] after:leading-none after:content-[attr(data-after)]",
        props.class
      )}
      style={{
        "--color": props.type === "all" ? "#8b5cf6" : Resource[props.type].color,
        "--border-color": props.type === "all" ? "#6d28d9" : Resource[props.type].borderColor
      }}
      data-after={props.count === undefined ? undefined : `x${props.count}`}
      {...rest}
    >
      {props.type === "all" ? <FaSolidAsterisk /> : Resource[props.type].icon}
    </div>
  );
}
