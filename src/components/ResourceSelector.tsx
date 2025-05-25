import { Button } from "@/components/ui/button";
import { EMPTY_RESOURCES, RESOURCES, Resource } from "@/constants";
import { cn, resourceCount } from "@/utils";
import { AiTwotoneMinusCircle, AiTwotonePlusCircle } from "solid-icons/ai";
import {
  Index,
  Show,
  createContext,
  createSignal,
  splitProps,
  useContext,
  type Component,
  type ComponentProps,
  type Context,
  type JSX,
} from "solid-js";

type Props = {
  resources: PlayerResources;
  onChange?: (resources: PlayerResources) => void;
  requiredCount?: number;
  children?: JSX.Element;
  disabled?: boolean;
};

type RSContextProps = ReturnType<typeof makeRSContext>;
function makeRSContext(props: Props) {
  const [selectedResources, setSelectedResources] = createSignal(EMPTY_RESOURCES);
  return {
    resources: () => props.resources,
    onChange: () => props.onChange?.(selectedResources()),
    disabled: () => props.disabled,
    allSelected: () => {
      return (
        props.requiredCount === undefined ||
        resourceCount(selectedResources()) === props.requiredCount
      );
    },
    leftToSelect: () => {
      if (props.requiredCount === undefined) return null;
      return props.requiredCount - resourceCount(selectedResources());
    },
    addDisabled: () => props.requiredCount === resourceCount(selectedResources()),
    subtractDisabled: (res: Resource) => selectedResources()[res] === 0,
    selectedResources,
    setSelectedResources,
  };
}

const RSContext = createContext() as Context<RSContextProps>;

function useRSContext(): RSContextProps {
  const context = useContext(RSContext);
  if (context === undefined) {
    throw new Error(
      "[ResourceSelector]: `useContext` must be used within a `ResourceSelector` component"
    );
  }
  return context;
}

export function ResourceSelector(props: Props) {
  const context = makeRSContext(props);
  return (
    <RSContext.Provider value={context}>
      {props.children ?? <ResourceSelectorContent />}
    </RSContext.Provider>
  );
}

export function ResourceSelectorContent() {
  const context = useRSContext();
  return (
    <div>
      <Index each={RESOURCES}>
        {(res) => (
          <div class="flex h-6 w-full items-center justify-between gap-5">
            <Button
              size="icon"
              variant="ghost"
              disabled={context.subtractDisabled(res()) || context.disabled()}
              onClick={(e) => {
                const newCount = context.selectedResources()[res()] - (e.shiftKey ? 10 : 1);
                if (newCount < 0) return;
                context.setSelectedResources((resources) => ({ ...resources, [res()]: newCount }));
                context.onChange();
              }}
            >
              <AiTwotoneMinusCircle />
            </Button>

            <div class="flex justify-between gap-2">
              <span>{Resource[res()].icon}</span>
              <span class={cn(context.selectedResources()[res()] === 0 && "opacity-30")}>
                {context.selectedResources()[res()]}
              </span>
              <span class="opacity-70">({context.resources()[res()]})</span>
            </div>

            <Button
              size="icon"
              variant="ghost"
              disabled={context.addDisabled() || context.disabled()}
              onClick={(e) => {
                const newCount = context.selectedResources()[res()] + (e.shiftKey ? 10 : 1);
                if (newCount > context.resources()[res()]) return;
                context.setSelectedResources((resources) => ({ ...resources, [res()]: newCount }));
                context.onChange();
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

type RSButtonProps = Omit<ComponentProps<"button">, "onClick"> & {
  onClick: (resources: PlayerResources) => void;
};
export const ResourceSelectorButton: Component<RSButtonProps> = (props) => {
  const [, rest] = splitProps(props, ["onClick", "disabled"]);
  const context = useRSContext();
  const disabled = () => !context.allSelected() || context.disabled() || props.disabled;
  return (
    <Button
      onClick={() => props.onClick(context.selectedResources())}
      disabled={disabled()}
      {...rest}
    />
  );
};

type RSErrorProps = {
  children: (leftToSelect: number) => JSX.Element;
  successFallback?: JSX.Element;
};
export const ResourceSelectorError: Component<RSErrorProps> = (props) => {
  const context = useRSContext();
  return (
    <Show when={!context.allSelected() && !context.disabled()} fallback={props.successFallback}>
      {props.children(context.leftToSelect()!)}
    </Show>
  );
};
