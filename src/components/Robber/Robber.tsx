import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Icons } from "@/constants";
import { refs, setState, state } from "@/state";
import { cn } from "@/utils";
import { calculateRobber } from "@/utils/calculations";
import { As } from "@kobalte/core";
import {
  Match,
  Show,
  Switch,
  batch,
  createEffect,
  createSignal,
  onCleanup,
  splitProps,
  type JSX
} from "solid-js";
import { produce } from "solid-js/store";
import DropResourcesDialog from "./DropResourcesDialog";

// https://github.com/clauderic/dnd-kit/blob/master/packages/core/src/utilities/coordinates/distanceBetweenPoints.ts#L6
function distanceBetween(p1: Pos, p2: Pos) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function collisionDetected(a: Rect, b: Rect) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function findClosest(robber: Pos & Rect, hexes: Hex[]): Hex["id"] {
  return hexes.reduce<{ distance: number | null; hexId: Hex["id"] | null }>(
    (acc, hex) => {
      if (!collisionDetected(robber, hex.calc().absolute)) return acc;
      const { centerX, centerY } = hex.calc().absolute;
      const distanceToHex = distanceBetween({ x: centerX, y: centerY }, robber);
      if (acc.distance === null || acc.distance > distanceToHex) {
        acc.distance = distanceToHex;
        acc.hexId = hex.id;
      }
      return acc;
    },
    { distance: null, hexId: null }
  ).hexId!;
}

export default function Robber() {
  const [newPos, setNewPos] = createSignal({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = createSignal(false);
  const [newHexId, setNewHexId] = createSignal<Hex["id"] | null>(null);

  createEffect(() => {
    const pos = calculateRobber(state.robber, refs);
    state.robber.setPos(pos);
  });

  createEffect(() => {
    const { status } = state.robber;
    if (status === "placed" || status === "drop_resources" || status === "stealing_resource") return;

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
      const newPos: Pos & Rect = {
        x: e.x - widthOffset,
        y: e.y - heightOffset,
        left: e.x - widthOffset,
        right: e.x + widthOffset,
        top: e.y - heightOffset,
        bottom: e.y + heightOffset
      };
      const closestHexId = findClosest(newPos, state.hexes.array);

      batch(() => {
        setNewPos(newPos);
        setNewHexId(closestHexId);
      });
    }

    function onMouseUp() {
      batch(() => {
        setIsDragging(false);
        setNewPos({ x: 0, y: 0 });
        setState(
          "robber",
          produce((robber) => {
            robber.hex = state.hexes.byId[newHexId()!]!;
            robber.status = "select_player";
          })
        );
      });
    }

    document.body.addEventListener("mousedown", onMouseDown);
    document.body.addEventListener("mouseup", onMouseUp);
    if (isDragging()) document.body.addEventListener("mousemove", onMouseMove);

    onCleanup(() => {
      document.body.removeEventListener("mousedown", onMouseDown);
      document.body.removeEventListener("mouseup", onMouseUp);
      document.body.removeEventListener("mousemove", onMouseMove);
    });
  });

  const tooltipDisabled = () =>
    state.robber.status === "placed" ||
    state.robber.status === "drop_resources" ||
    state.robber.status === "stealing_resource";

  const prognosedNewPos = () => {
    const robberRef = refs[state.robber.id];
    return {
      x: state.hexes.byId[newHexId()!]!.calc().center.x - robberRef!.offsetWidth / 2,
      y: state.hexes.byId[newHexId()!]!.calc().center.y - robberRef!.offsetHeight / 2
    };
  };

  return (
    <>
      <Tooltip placement="right" disabled={tooltipDisabled()}>
        <TooltipTrigger asChild>
          <As
            component={RobberCircle}
            ref={refs[state.robber.id]}
            pos={state.robber.pos()}
            classList={{ "opacity-50": isDragging() }}
          />
        </TooltipTrigger>

        <TooltipContent>
          <Switch>
            <Match when={state.robber.status === "select_hex"}>Move me to different hex</Match>
            <Match when={state.robber.status === "select_player"}>Who do you want to steal from?</Match>
          </Switch>
        </TooltipContent>
      </Tooltip>

      <Show when={isDragging() && newHexId() && newHexId() !== state.robber.hex.id}>
        <RobberCircle pos={prognosedNewPos()} class="bg-blue-500 bg-opacity-80" />
      </Show>

      <Show when={isDragging()}>
        <RobberCircle pos={newPos()} class="fixed" />
      </Show>

      <DropResourcesDialog />
    </>
  );
}

function RobberCircle(props: JSX.HTMLAttributes<HTMLDivElement> & { pos: Pos }) {
  const [, rest] = splitProps(props, ["pos", "class"]);
  return (
    <div
      class={cn(
        "absolute select-none rounded-full border-2 bg-dark p-3 text-[2rem] leading-none",
        props.class
      )}
      style={{ top: `${props.pos.y}px`, left: `${props.pos.x}px` }}
      {...rest}
    >
      {Icons.robber.emoji}
    </div>
  );
}
