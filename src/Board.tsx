import { Index, type JSX, createEffect, createSignal } from "solid-js";
import Hexagon from "./Hexagon";
import { regularBoard } from "./boardArrays";

type TownKey = `${number},${number}`;
export type TownState = { [rowColIdx: TownKey]: number };

export type HexHighlghted = {
  x: number | null;
  y: number | null;
};

export default function Board() {
  const [hexRows] = createSignal(regularBoard);
  const [townsHovered, setTownsHovered] = createSignal<TownState>({});
  const [townsActive, setTownsActive] = createSignal<TownState>({});
  const [highlighted, setHighlighted] = createSignal<HexHighlghted>({ x: null, y: null });

  function getPrevRowTotal(rowIdx: number) {
    return rowIdx - 1 < 0 ? null : hexRows()[rowIdx - 1].length;
  }

  function getNextRowTotal(rowIdx: number) {
    return rowIdx + 1 >= hexRows().length ? null : hexRows()[rowIdx + 1].length;
  }

  function getHoveredTown(rowIdx: number, colIdx: number) {
    return townsHovered()[`${rowIdx},${colIdx}`] ?? null;
  }

  // TODO
  function toggleTown(data: TownState) {}

  return (
    <ZoomContainer class="flex flex-col items-center justify-center gap-1">
      <Index each={hexRows()}>
        {(hexRow, rowIdx) => (
          <div class="my-[-15px] flex gap-1">
            <Index each={hexRow()}>
              {(hex, colIdx) => (
                <Hexagon
                  type={hex().type}
                  x={rowIdx}
                  y={colIdx}
                  rowLen={hexRow().length}
                  prevRowLen={getPrevRowTotal(rowIdx)}
                  nextRowLen={getNextRowTotal(rowIdx)}
                  highlighted={highlighted().x === rowIdx && highlighted().y === colIdx}
                  townHovered={getHoveredTown(rowIdx, colIdx)}
                  onRoadHover={setHighlighted}
                  onTownHover={setTownsHovered}
                  onTownClick={toggleTown}
                >
                  {rowIdx},{colIdx}
                </Hexagon>
              )}
            </Index>
          </div>
        )}
      </Index>
    </ZoomContainer>
  );
}

function ZoomContainer(props: JSX.HTMLAttributes<HTMLDivElement>) {
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
