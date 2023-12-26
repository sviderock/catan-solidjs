import { createEffect, createSignal, type JSX } from "solid-js";

export default function ZoomContainer(props: JSX.HTMLAttributes<HTMLDivElement>) {
  let ref: HTMLDivElement | undefined;
  const [scale, setScale] = createSignal(1.25);

  createEffect(() => {
    if (ref) {
      ref.style.transform = `scale(${scale()})`;
    }
  });

  return (
    <div
      {...props}
      ref={ref}
      onWheel={(e: WheelEvent) => {
        e.preventDefault();
        const newScale = scale() + e.deltaY * -0.01;
        setScale(Math.min(Math.max(1, newScale), 2.3));
      }}
    />
  );
}
