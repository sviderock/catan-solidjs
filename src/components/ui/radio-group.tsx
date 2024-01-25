import type { Component } from "solid-js";
import { splitProps } from "solid-js";

import { RadioGroup as RadioGroupPrimitive } from "@kobalte/core";
import { TbCircle } from "solid-icons/tb";

import { cn } from "@/utils";

const RadioGroup: Component<RadioGroupPrimitive.RadioGroupRootProps> = (props) => {
  const [, rest] = splitProps(props, ["class"]);
  return <RadioGroupPrimitive.Root class={cn("grid gap-2", props.class)} {...rest} />;
};

const RadioGroupItem: Component<RadioGroupPrimitive.RadioGroupItemProps> = (props) => {
  const [, rest] = splitProps(props, ["class", "children"]);
  return (
    <RadioGroupPrimitive.Item
      class={cn("flex cursor-pointer items-center gap-2 rounded-sm border p-2", props.class)}
      {...rest}
    >
      <RadioGroupPrimitive.ItemInput />

      {props.children}
      <RadioGroupPrimitive.ItemControl class="aspect-square h-4 w-4 rounded-full border-2 border-current text-current ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
        <RadioGroupPrimitive.ItemIndicator class="flex h-full items-center justify-center">
          <TbCircle class="h-2.5 w-2.5 fill-current text-current" />
        </RadioGroupPrimitive.ItemIndicator>
      </RadioGroupPrimitive.ItemControl>
    </RadioGroupPrimitive.Item>
  );
};

const RadioGroupItemLabel: Component<RadioGroupPrimitive.RadioGroupItemLabelProps> = (props) => {
  const [, rest] = splitProps(props, ["class"]);
  return (
    <RadioGroupPrimitive.ItemLabel
      class={cn(
        "cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        props.class
      )}
      {...rest}
    />
  );
};

export { RadioGroup, RadioGroupItem, RadioGroupItemLabel };
