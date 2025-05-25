import ResourceIcon from "@/components/ResourceIcon";
import { RESOURCES } from "@/constants";
import { Index } from "solid-js";

type Selected<Multiple extends boolean | undefined> = Multiple extends true
  ? Partial<Record<Resource, boolean | number>>
  : Resource | null;

export type ResourcePickerProps<Multiple extends boolean | undefined = undefined> = {
  multiple?: Multiple;
  selected?: Selected<Multiple>;
  disabled?: Partial<Record<Resource, boolean>>;
  onPick: (res: Resource) => void;
  onMouseOver?: (res: Resource) => void;
  onMouseOut?: () => void;
};

export default function ResourcePicker<Multiple extends boolean | undefined = undefined>(
  props: ResourcePickerProps<Multiple>
) {
  function getSelected(res: Resource) {
    if (!props.multiple) return props.selected === res;
    return !!(props.selected as Selected<true>)[res];
  }

  function getCount(res: Resource) {
    if (!props.multiple || !props.selected) return undefined;
    const selected = (props.selected as Selected<true>)[res]!;
    return typeof selected === "number" ? selected : undefined;
  }

  return (
    <div class="flex gap-1">
      <Index each={RESOURCES}>
        {(res) => (
          <ResourceIcon
            type={res()}
            aria-selected={getSelected(res())}
            aria-disabled={props.disabled?.[res()]}
            onClick={() => props.onPick(res())}
            onMouseOver={() => props.onMouseOver?.(res())}
            onMouseOut={props.onMouseOut}
            count={getCount(res())}
            class="cursor-pointer transition-colors hover:border-white aria-disabled:pointer-events-none aria-disabled:opacity-30 aria-selected:border-indigo-500"
          />
        )}
      </Index>
    </div>
  );
}
