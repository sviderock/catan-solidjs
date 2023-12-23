import { Component, For, Index, JSX, createSignal, onCleanup } from 'solid-js';

function getRandomType() {
  const hexTypes: HexagonProps['type'][] = ['brick', 'grain', 'lumber', 'ore', 'wool'];
  const idx = Math.floor(Math.random() * hexTypes.length);
  return hexTypes[idx];
}

export default function App() {
  return (
    <main class="flex h-full w-full items-center justify-center bg-blue-600">
      <Board />
    </main>
  );
}

function Board() {
  return (
    <div class="flex flex-col items-center justify-center gap-1">
      <HexagonRow count={3} />
      <HexagonRow count={4} />
      <HexagonRow count={5} />
      <HexagonRow count={4} />
      <HexagonRow count={3} />
    </div>
  );
}

function HexagonRow(props: { count: number }) {
  const range = new Array(props.count).fill('').map(() => getRandomType());
  return (
    <div class="my-[-15px] flex gap-1">
      <Index each={range}>{(item) => <Hexagon type={item()} />}</Index>
    </div>
  );
}

interface HexagonProps {
  type: 'brick' | 'lumber' | 'ore' | 'grain' | 'wool';
}

const HexType = {
  brick: { color: 'text-red-400', icon: '🧱' },
  lumber: { color: 'text-yellow-900', icon: '🪵' },
  ore: { color: 'text-slate-400', icon: '🪨' },
  grain: { color: 'text-yellow-400', icon: '🌾' },
  wool: { color: 'text-lime-600', icon: '🐑' }
} satisfies Record<HexagonProps['type'], { color: string; icon: string }>;

function Hexagon(props: HexagonProps) {
  const { color } = HexType[props.type];
  return (
    <div
      class={`${color} flex h-[120px] w-[calc(0.8658*120px)]  flex-col items-center justify-center bg-current [clip-path:_polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)] `}
    >
      <span class="text-[40px]">{HexType[props.type].icon}</span>
    </div>
  );
}

function OldHexagon(props: HexagonProps) {
  const { color } = HexType[props.type];
  return (
    <div class={`flex flex-col ${color}`}>
      <div class=" border-x-[52px] border-b-[30px] border-current border-x-transparent" />
      <div class="flex h-[60px] w-[104px] items-center justify-center bg-current text-[40px]">
        <span>{HexType[props.type].icon}</span>
      </div>
      <div class="border-x-[52px] border-t-[30px] border-current border-x-transparent bg-transparent" />
    </div>
  );
}
