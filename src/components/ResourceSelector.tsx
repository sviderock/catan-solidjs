import { Button } from "@/components/ui/button";
import { RESOURCES, Resource } from "@/constants";
import { cn } from "@/utils";
import { AiTwotoneMinusCircle, AiTwotonePlusCircle } from "solid-icons/ai";
import { Index, createSignal } from "solid-js";

interface Props {
  resources: PlayerResources;
  onChange: (resources: PlayerResources) => void;
}

export default function ResourceSelector(props: Props) {
  const [selectedResources, setSelectedResources] = createSignal<PlayerResources>({
    brick: 0,
    grain: 0,
    lumber: 0,
    ore: 0,
    wool: 0
  });

  return (
    <div>
      <Index each={RESOURCES}>
        {(res) => (
          <div class="flex h-6 w-full items-center justify-between gap-5">
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                const newCount = selectedResources()[res()] - (e.shiftKey ? 10 : 1);
                if (newCount < 0) return;
                setSelectedResources((resources) => ({ ...resources, [res()]: newCount }));
                props.onChange(selectedResources());
              }}
            >
              <AiTwotoneMinusCircle />
            </Button>

            <div class="flex justify-between gap-2">
              <span>{Resource[res()].icon}</span>
              <span class={cn(selectedResources()[res()] === 0 && "opacity-30")}>
                {selectedResources()[res()]}
              </span>
              <span class="opacity-70">({props.resources[res()]})</span>
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                const newCount = selectedResources()[res()] + (e.shiftKey ? 10 : 1);
                if (newCount > props.resources[res()]) return;
                setSelectedResources((resources) => ({ ...resources, [res()]: newCount }));
                props.onChange(selectedResources());
              }}
            >
              <AiTwotonePlusCircle />
            </Button>
          </div>
        )}
      </Index>
    </div>
  );
}