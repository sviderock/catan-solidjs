import { Index, createSignal } from "solid-js";
import Hexagon, { type HexagonProps } from "./Hexagon";

function getRandomType() {
  const hexTypes: HexagonProps["type"][] = ["brick", "grain", "lumber", "ore", "wool"];
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
  const [hexRows] = createSignal([
    [
      { type: getRandomType(), t1: null, t2: null, t3: null, t4: null, t5: null, t6: null },
      { type: getRandomType(), t1: null, t2: null, t3: null, t4: null, t5: null, t6: null },
      { type: getRandomType(), t1: null, t2: null, t3: null, t4: null, t5: null, t6: null }
    ],
    [
      { type: getRandomType(), t1: null, t2: null, t3: null, t4: null, t5: null, t6: null },
      { type: getRandomType(), t1: null, t2: null, t3: null, t4: null, t5: null, t6: null },
      { type: getRandomType(), t1: null, t2: null, t3: null, t4: null, t5: null, t6: null },
      { type: getRandomType(), t1: null, t2: null, t3: null, t4: null, t5: null, t6: null }
    ],
    [
      { type: getRandomType(), t1: null, t2: null, t3: null, t4: null, t5: null, t6: null },
      { type: getRandomType(), t1: null, t2: null, t3: null, t4: null, t5: null, t6: null },
      { type: getRandomType(), t1: null, t2: null, t3: null, t4: null, t5: null, t6: null },
      { type: getRandomType(), t1: null, t2: null, t3: null, t4: null, t5: null, t6: null },
      { type: getRandomType(), t1: null, t2: null, t3: null, t4: null, t5: null, t6: null }
    ],
    [
      { type: getRandomType(), t1: null, t2: null, t3: null, t4: null, t5: null, t6: null },
      { type: getRandomType(), t1: null, t2: null, t3: null, t4: null, t5: null, t6: null },
      { type: getRandomType(), t1: null, t2: null, t3: null, t4: null, t5: null, t6: null },
      { type: getRandomType(), t1: null, t2: null, t3: null, t4: null, t5: null, t6: null }
    ],
    [
      { type: getRandomType(), t1: null, t2: null, t3: null, t4: null, t5: null, t6: null },
      { type: getRandomType(), t1: null, t2: null, t3: null, t4: null, t5: null, t6: null },
      { type: getRandomType(), t1: null, t2: null, t3: null, t4: null, t5: null, t6: null }
    ]
  ]);

  const [active, setActive] = createSignal<{ x: number | null; y: number | null }>({
    x: null,
    y: null
  });

  return (
    <div class="flex scale-150 flex-col items-center justify-center gap-1">
      <Index each={hexRows()}>
        {(hexRow, rowIdx) => (
          <div class="my-[-15px] flex gap-1">
            <Index each={hexRow()}>
              {(hex, colIdx) => (
                <Hexagon
                  type={hex().type}
                  x={rowIdx}
                  y={colIdx}
                  onHover={setActive}
                  active={active().x === rowIdx && active().y === colIdx}
                  rowLen={hexRow().length}
                  prevRowLen={rowIdx - 1 < 0 ? null : hexRows()[rowIdx - 1].length}
                  nextRowLen={rowIdx + 1 >= hexRows().length ? null : hexRows()[rowIdx + 1].length}
                >
                  {rowIdx},{colIdx}
                </Hexagon>
              )}
            </Index>
          </div>
        )}
      </Index>
    </div>
  );
}
