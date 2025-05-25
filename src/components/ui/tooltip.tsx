import { splitProps, useContext, type Component } from "solid-js";

import { Tooltip as TooltipPrimitive } from "@kobalte/core";

import { cn } from "@/utils";

const Tooltip: Component<TooltipPrimitive.TooltipRootProps> = (props) => {
  return <TooltipPrimitive.Root gutter={4} openDelay={100} {...props} />;
};

const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipArrow = TooltipPrimitive.Arrow;

const TooltipContent: Component<TooltipPrimitive.TooltipContentProps> = (props) => {
  const [, rest] = splitProps(props, ["class", "children"]);
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        class={cn(
          "z-50 origin-(--kb-popover-content-transform-origin) rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
          props.class
        )}
        {...rest}
      >
        <TooltipPrimitive.Arrow />
        {props.children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
};

export { Tooltip, TooltipTrigger, TooltipContent, TooltipArrow };
