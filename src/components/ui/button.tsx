import type { Component, ComponentProps } from "solid-js";
import { splitProps } from "solid-js";

import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { cn, shadeHexColor } from "@/utils";

const buttonVariants = cva(
  "ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-30 disabled:select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-input hover:bg-accent hover:text-accent-foreground border",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-green-500 hover:bg-green-600 text-white"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "",
        iconButton: "h-10 w-10 *:text-[24px] rounded-full"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps extends ComponentProps<"button">, VariantProps<typeof buttonVariants> {}

const Button: Component<ButtonProps> = (props) => {
  const [, rest] = splitProps(props, ["variant", "size", "class", "color", "style"]);
  return (
    <button
      class={cn(
        buttonVariants({ variant: props.variant, size: props.size }),
        props.color && "bg-(--color) text-(--color-text) hover:bg-(--color-darker)",
        props.class
      )}
      style={{
        "--color": props.color ?? undefined,
        "--color-darker": props.color ? shadeHexColor(props.color, -0.25) : undefined,
        "--color-text": props.color ? "#373F51" : undefined,
        ...(typeof props.style === "string" ? {} : props.style)
      }}
      {...rest}
    />
  );
};

export { Button, buttonVariants };
