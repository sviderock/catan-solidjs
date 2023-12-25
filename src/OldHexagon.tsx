export interface OldHexagonProps {
  type: 'brick' | 'lumber' | 'ore' | 'grain' | 'wool';
}

const HexType = {
  brick: { color: 'text-red-400', icon: '🧱' },
  lumber: { color: 'text-yellow-900', icon: '🪵' },
  ore: { color: 'text-slate-400', icon: '🪨' },
  grain: { color: 'text-yellow-400', icon: '🌾' },
  wool: { color: 'text-lime-600', icon: '🐑' }
} satisfies Record<OldHexagonProps['type'], { color: string; icon: string }>;

export default function OldHexagon(props: OldHexagonProps) {
  return (
    <div class={`flex flex-col ${HexType[props.type].color}`}>
      <div class=" border-x-[52px] border-b-[30px] border-current border-x-transparent" />
      <div class="flex h-[60px] w-[104px] items-center justify-center bg-current text-[40px]">
        <span>{HexType[props.type].icon}</span>
      </div>
      <div class="border-x-[52px] border-t-[30px] border-current border-x-transparent bg-transparent" />
    </div>
  );
}
