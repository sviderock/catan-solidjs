import { Icons } from "@/constants";
import { refs, state } from "@/state";

export default function Robber() {
  return (
    <div
      ref={refs["robber"]}
      class="absolute left-0 top-0 rounded-full border-2 bg-dark p-3 text-[2rem] leading-none"
      style={{
        top: `${state.robber.pos().y}px`,
        left: `${state.robber.pos().x}px`
      }}
    >
      {Icons.robber.emoji}
    </div>
  );
}
