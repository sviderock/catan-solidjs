import { cn } from "@/utils";
import { Collapsible as CollapsiblePrimitive } from "@kobalte/core";
import { splitProps, type Component } from "solid-js";

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.Trigger;

const CollapsibleContent: Component<CollapsiblePrimitive.CollapsibleContentProps> = (props) => {
  const [, rest] = splitProps(props, ["class"]);
  return (
    <CollapsiblePrimitive.Content
      class={cn(
        "data-[expanded]:animate-slide-down data-[closed]:animate-slide-up overflow-hidden",
        props.class
      )}
      {...rest}
    />
  );
};

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
