import { Icons } from "@/constants";
import { refs, state } from "@/state";
import { cn } from "@/utils";
import { Show, batch, createSignal, onCleanup, onMount, splitProps, type JSX } from "solid-js";

type Rect = { left: number; right: number; top: number; bottom: number };
function collisionDetected(a: Rect, b: Rect) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

// https://github.com/clauderic/dnd-kit/blob/master/packages/core/src/utilities/coordinates/distanceBetweenPoints.ts#L6
function distanceBetween(p1: Pos, p2: Pos) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

export default function Robber() {
  const [newPos, setNewPos] = createSignal({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = createSignal(false);
  const [newHexId, setNewHexId] = createSignal<Hex["id"] | null>(null);

  const prognosedNewPos = () => {
    const robberRef = refs[state.robber.id];
    return {
      x: state.hexes.byId[newHexId()!]!.calc().center.x - robberRef!.offsetWidth / 2,
      y: state.hexes.byId[newHexId()!]!.calc().center.y - robberRef!.offsetHeight / 2
    };
  };

  function findClosest(robberPos: Pos & Rect): Hex["id"] {
    console.time();
    const collisions = state.hexes.array.filter((hex) =>
      collisionDetected(robberPos, hex.calc().absolute)
    );
    const distances = collisions.reduce(
      (acc, hex) => {
        const distanceToHex = distanceBetween(
          { x: hex.calc().absolute.centerX, y: hex.calc().absolute.centerY },
          robberPos
        );

        if (acc.distance === null || acc.distance > distanceToHex) {
          acc.distance = distanceToHex;
          acc.hexId = hex.id;
        }
        return acc;
      },
      { distance: null as number | null, hexId: null as Hex["id"] | null }
    );
    console.timeEnd();
    return distances.hexId!;
  }

  onMount(() => {
    const robberRef = refs[state.robber.id]!;
    const widthOffset = robberRef.offsetWidth / 2;
    const heightOffset = robberRef.offsetWidth / 2;

    function onMouseDown(e: MouseEvent) {
      if (e.target === refs[state.robber.id]) {
        batch(() => {
          setIsDragging(true);
          setNewPos({ x: e.x - widthOffset, y: e.y - heightOffset });
        });
      }
    }

    function onMouseMove(e: MouseEvent) {
      if (!isDragging()) return;
      const centerX = e.x - widthOffset;
      const centerY = e.y - heightOffset;

      const newPos: Pos & Rect = {
        x: centerX,
        y: centerY,
        left: e.x - widthOffset,
        right: e.x + widthOffset,
        top: e.y - heightOffset,
        bottom: e.y + heightOffset
      };

      batch(() => {
        setNewPos(newPos);
        const closestHexId = findClosest(newPos);
        setNewHexId(closestHexId);
      });
    }

    function onMouseUp() {
      batch(() => {
        setIsDragging(false);
        setNewPos({ x: 0, y: 0 });
      });
    }

    document.body.addEventListener("mousedown", onMouseDown);
    document.body.addEventListener("mousemove", onMouseMove);
    document.body.addEventListener("mouseup", onMouseUp);

    onCleanup(() => {
      document.body.removeEventListener("mousedown", onMouseDown);
      document.body.removeEventListener("mousedown", onMouseMove);
      document.body.removeEventListener("mouseup", onMouseUp);
    });
  });

  return (
    <>
      <RobberCircle
        ref={refs["robber"]}
        pos={state.robber.pos()}
        classList={{ "opacity-50": isDragging() }}
        // onMouseUp={() => console.log("up")}
      />

      <Show when={isDragging() && newHexId() && newHexId() !== state.robber.hex.id}>
        <RobberCircle pos={prognosedNewPos()} class="bg-blue-500 bg-opacity-80" />
      </Show>

      <Show when={isDragging()}>
        <RobberCircle pos={newPos()} class="fixed" />
      </Show>
    </>
  );
}

type Props = JSX.HTMLAttributes<HTMLDivElement> & { pos: { x: number; y: number } };

function RobberCircle(props: Props) {
  const [, rest] = splitProps(props, ["pos", "class"]);
  return (
    <div
      class={cn(
        "absolute select-none rounded-full border-2 bg-dark p-3 text-[2rem] leading-none",
        props.class
      )}
      style={{
        top: `${props.pos.y}px`,
        left: `${props.pos.x}px`
      }}
      {...rest}
    >
      {Icons.robber.emoji}
    </div>
  );
}
