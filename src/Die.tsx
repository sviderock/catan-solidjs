import { createSignal, onCleanup, onMount } from "solid-js";

const color1 = "#373F51";
const color2 = "#E43F6F";
const dotColor = "#FAFFD8";

// https://github.com/YusukeNakaya/css-cube-gen/blob/master/src/components/CubeGen.vue
export default function Die() {
  const [rotation, setRotation] = createSignal({ x: 0, y: 0 });
  const shadowRatio = 1;
  const opacity = 1;
  const r = parseInt(color1.substring(1, 3), 16);
  const g = parseInt(color1.substring(3, 5), 16);
  const b = parseInt(color1.substring(5, 7), 16);

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
          "background-color": `rgba(${r - 5 * shadowRatio}, ${g - 5 * shadowRatio}, ${
            b - 5 * shadowRatio
          }, ${opacity})`
        }}
      />
      <span
        class="absolute h-[100px] w-[100px] [transform:translate(-50%,-50%)_rotateY(90deg)_translateZ(50px)]"
        style={{
          "background-color": `rgba(${r - 10 * shadowRatio}, ${g - 10 * shadowRatio}, ${
            b - 10 * shadowRatio
          }, ${opacity})`
        }}
      />
      <span
        class="absolute h-[100px] w-[100px] [transform:translate(-50%,-50%)_rotateX(90deg)_translateZ(50px)]"
        style={{
          "background-color": `rgba(${r}, ${g}, ${b}, ${opacity})`
        }}
      />
      <span
        class="absolute h-[100px] w-[100px] [transform:translate(-50%,-50%)_rotateX(-90deg)_translateZ(50px)]"
        style={{
          "background-color": `rgba(${r - 20 * shadowRatio}, ${g - 20 * shadowRatio}, ${
            b - 20 * shadowRatio
          }, ${opacity})`
        }}
      />
      <span
        class="absolute h-[100px] w-[100px] [transform:translate(-50%,-50%)_rotateY(-90deg)_translateZ(50px)]"
        style={{
          "background-color": `rgba(${r - 10 * shadowRatio}, ${g - 10 * shadowRatio}, ${
            b - 10 * shadowRatio
          }, ${opacity})`
        }}
      />
      <span
        class="absolute h-[100px] w-[100px] [transform:translate(-50%,-50%)_rotateY(180deg)_translateZ(50px)]"
        style={{
          "background-color": `rgba(${r - 15 * shadowRatio}, ${g - 15 * shadowRatio}, ${
            b - 15 * shadowRatio
          }, ${opacity})`
        }}
      />
    </div>
  );
}
