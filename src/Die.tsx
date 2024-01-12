import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { DiceColors } from "./constants";

interface Props {
  color: 0 | 1;
}

// https://github.com/YusukeNakaya/css-cube-gen/blob/master/src/components/CubeGen.vue
export default function Die(props: Props) {
  const [rotation, setRotation] = createSignal({ x: 0, y: 0 });
  const [opacity, setOpacity] = createSignal(1);
  const [shadowRatio, setShadowRatio] = createSignal(1);

  const rgb = createMemo(() => ({
    r: parseInt(DiceColors.dice[props.color]!.substring(1, 3), 16),
    g: parseInt(DiceColors.dice[props.color]!.substring(3, 5), 16),
    b: parseInt(DiceColors.dice[props.color]!.substring(5, 7), 16)
  }));

  function onMouseMove(e: MouseEvent) {
    setRotation(() => ({
      x: (e.clientY - window.innerWidth / 2) / 5,
      y: ((e.clientX - window.innerHeight / 2) / 5) * -1
    }));
  }

  onMount(() => window.addEventListener("mousemove", onMouseMove));
  onCleanup(() => window.removeEventListener("mousemove", onMouseMove));

  return (
    <div
      class="absolute [transform-style:preserve-3d]"
      style={{ transform: `rotateX(${rotation().x}deg) rotateY(${rotation().y}deg)` }}
    >
      <span
        class="absolute h-[100px] w-[100px] [transform:translate(-50%,-50%)_rotateY(0deg)_translateZ(50px)]"
        style={{
          "background-color": `rgba(${rgb().r - 5 * shadowRatio()}, ${
            rgb().g - 5 * shadowRatio()
          }, ${rgb().b - 5 * shadowRatio()}, ${opacity()})`
        }}
      />
      <span
        class="absolute h-[100px] w-[100px] [transform:translate(-50%,-50%)_rotateY(90deg)_translateZ(50px)]"
        style={{
          "background-color": `rgba(${rgb().r - 10 * shadowRatio()}, ${
            rgb().g - 10 * shadowRatio()
          }, ${rgb().b - 10 * shadowRatio()}, ${opacity()})`
        }}
      />
      <span
        class="absolute h-[100px] w-[100px] [transform:translate(-50%,-50%)_rotateX(90deg)_translateZ(50px)]"
        style={{
          "background-color": `rgba(${rgb().r}, ${rgb().g}, ${rgb().b}, ${opacity()})`
        }}
      />
      <span
        class="absolute h-[100px] w-[100px] [transform:translate(-50%,-50%)_rotateX(-90deg)_translateZ(50px)]"
        style={{
          "background-color": `rgba(${rgb().r - 20 * shadowRatio()}, ${
            rgb().g - 20 * shadowRatio()
          }, ${rgb().b - 20 * shadowRatio()}, ${opacity()})`
        }}
      />
      <span
        class="absolute h-[100px] w-[100px] [transform:translate(-50%,-50%)_rotateY(-90deg)_translateZ(50px)]"
        style={{
          "background-color": `rgba(${rgb().r - 10 * shadowRatio()}, ${
            rgb().g - 10 * shadowRatio()
          }, ${rgb().b - 10 * shadowRatio()}, ${opacity()})`
        }}
      />
      <span
        class="absolute h-[100px] w-[100px] [transform:translate(-50%,-50%)_rotateY(180deg)_translateZ(50px)]"
        style={{
          "background-color": `rgba(${rgb().r - 15 * shadowRatio()}, ${
            rgb().g - 15 * shadowRatio()
          }, ${rgb().b - 15 * shadowRatio()}, ${opacity()})`
        }}
      />
    </div>
  );
}
