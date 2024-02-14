import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem, RadioGroupItemLabel } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Icons } from "@/constants";
import { currentPlayer, exachange, refs, setState, state } from "@/state";
import { cn } from "@/utils";
import { calculateRobber } from "@/utils/calculations";
import { As } from "@kobalte/core";
import { AiFillWarning } from "solid-icons/ai";
import {
  For,
  Match,
  Show,
  Switch,
  batch,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  splitProps,
  type JSX
} from "solid-js";
import { produce } from "solid-js/store";
import DropResourcesDialog from "./DropResourcesDialog";
import StealResourceDialog from "./StealResourceDialog";

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
  const [initialHexId, setInitialHexId] = createSignal(state.robber.hex.id);
  const [newHexId, setNewHexId] = createSignal<Hex["id"] | null>(null);
  const [selectedPlayer, setSelectedPlayer] = createSignal("");

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

  const prognosedNewPos = (): RobberPos => {
    const robberRef = refs[state.robber.id];
    return {
      x: state.hexes.byId[newHexId()!]!.calc().center.x - robberRef!.offsetWidth / 2,
      y: state.hexes.byId[newHexId()!]!.calc().center.y - robberRef!.offsetHeight / 2
    };
  };

  const robberPos = (): RobberPos => {
    if (newHexId() === state.robber.hex.id) return state.robber.pos();
    if (newHexId() && isDragging()) return state.robber.pos();
    if (!newHexId() || newHexId() === state.robber.hex.id) return state.robber.pos();
    return prognosedNewPos();
  };

  const stealFrom = createMemo(() => {
    if (!newHexId()) return { blockingYourself: false, players: [] };
    const townIds = state.hexes.byId[newHexId()!]!.towns.map((t) => t.id);
    const players = state.game.players.filter((player) =>
      player.towns().some((t) => townIds.includes(t.id))
    );
    return {
      blockingYourself: !!players.find((player) => player === currentPlayer()),
      players: players.filter((player) => player !== currentPlayer())
    };
  });

  function resetState() {
    setInitialHexId(state.robber.hex.id);
    setNewHexId(null);
    setSelectedPlayer("");
  }

  return (
    <>
      <Tooltip placement="right" open={state.robber.status === "select_hex_and_player" && !isDragging()}>
        <TooltipTrigger asChild>
          <As
            component={RobberCircle}
            ref={refs[state.robber.id]}
            pos={robberPos()}
            classList={{ "opacity-50": isDragging() }}
          />
        </TooltipTrigger>

        <TooltipContent>
          <Switch>
            <Match when={initialHexId() === state.robber.hex.id}>Move me to different hex</Match>
            <Match when={initialHexId() !== state.robber.hex.id}>
              <div class="flex flex-col gap-2">
                <Show when={stealFrom().blockingYourself}>
                  <span class="flex items-center justify-between gap-2 text-orange-500">
                    <AiFillWarning size={16} />
                    You're blocking yourself
                  </span>
                </Show>

                <RadioGroup
                  class={cn(
                    "flex justify-between",
                    stealFrom().players.length === 1 && "justify-center"
                  )}
                  value={selectedPlayer()}
                  onChange={setSelectedPlayer}
                >
                  <For each={stealFrom().players}>
                    {(player) => (
                      <RadioGroupItem
                        value={`${player.idx}`}
                        class="text-[--color]"
                        style={{ "--color": `var(--player-color-${player.idx})` }}
                      >
                        <RadioGroupItemLabel class="text-[color:--color]">
                          <span>{player.name}</span>
                        </RadioGroupItemLabel>
                      </RadioGroupItem>
                    )}
                  </For>
                </RadioGroup>
                <Show when={selectedPlayer() || !stealFrom().players.length}>
                  <Button
                    variant="success"
                    onClick={() => {
                      batch(() => {
                        if (selectedPlayer()) {
                          return setState("robber", "status", "stealing_resource");
                        }
                        setState("robber", "status", "placed");
                        resetState();
                      });
                    }}
                  >
                    Confirm
                  </Button>
                </Show>
              </div>
            </Match>
          </Switch>
        </TooltipContent>
      </Tooltip>

      <Show when={isDragging() && newHexId() && newHexId() !== state.robber.hex.id}>
        <Tooltip placement="right" open={isDragging() && newHexId() === initialHexId()}>
          <TooltipTrigger asChild>
            <As component={RobberCircle} pos={prognosedNewPos()!} class="bg-blue-500 bg-opacity-80" />
          </TooltipTrigger>

          <TooltipContent>Move me to different hex</TooltipContent>
        </Tooltip>
      </Show>

      <Show when={isDragging()}>
        <RobberCircle pos={newPos()} class="fixed" />
      </Show>

      <Show when={state.robber.status === "drop_resources"}>
        <DropResourcesDialog />
      </Show>

      <Show when={state.robber.status === "stealing_resource" && selectedPlayer()}>
        <StealResourceDialog
          playerIdx={+selectedPlayer()!}
          onSteal={(playerIdx, res) => {
            batch(() => {
              exachange([
                { idx: currentPlayer().idx, add: { [res]: 1 } },
                { idx: playerIdx, remove: { [res]: 1 } }
              ]);
              setState("robber", "status", "placed");
              resetState();
            });
          }}
        />
      </Show>
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
