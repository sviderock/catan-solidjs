import ResourceSelector from "@/components/ResourceSelector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import {
  Popover,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem, RadioGroupItemLabel } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RESOURCES } from "@/constants";
import { currentPlayer, opponents, state, trade } from "@/state";
import { cn } from "@/utils";
import { FaSolidAnglesLeft, FaSolidAnglesRight, FaSolidArrowRightArrowLeft } from "solid-icons/fa";
import { IoClose } from "solid-icons/io";
import { For, Match, Show, Switch, batch, createMemo, createSignal } from "solid-js";

export type TradeSide = Array<[Resource, count: number]>;

const initialTrade = (): { give: PlayerResources; take: PlayerResources } => ({
  give: { brick: 0, lumber: 0, wool: 0, grain: 0, ore: 0 },
  take: { brick: 0, lumber: 0, wool: 0, grain: 0, ore: 0 }
});

export default function Trade() {
  const [finalTrade, setFinalTrade] = createSignal(initialTrade());
  const [popoverOpen, setPopoverOpen] = createSignal(false);
  const [playerSelected, setPlayerSelected] = createSignal("");

  const giveFiltered = createMemo(() =>
    RESOURCES.reduce((acc, res) => {
      const count = finalTrade().give[res];
      if (count > 0) acc.push([res, count]);
      return acc;
    }, [] as TradeSide)
  );

  const takeFiltered = createMemo(() =>
    RESOURCES.reduce((acc, res) => {
      const count = finalTrade().take[res];
      if (count > 0) acc.push([res, count]);
      return acc;
    }, [] as TradeSide)
  );

  function reset() {
    batch(() => {
      setPopoverOpen(false);
      setPlayerSelected("");
      setFinalTrade(initialTrade());
    });
  }

  const selectedPlayer = createMemo(() => {
    return playerSelected() ? state.game.players[+playerSelected()] : null;
  });

  const oneResourceDifferentCount = createMemo(() => {
    const oneResource = giveFiltered().length === 1 && takeFiltered().length === 1;
    if (!oneResource) return false;

    const [giveResource, giveCount] = giveFiltered()[0]!;
    const [takeResource, takeCount] = takeFiltered()[0]!;
    return giveResource === takeResource && giveCount !== takeCount;
  });

  const joke = createMemo(() => {
    const tradeIdentical = RESOURCES.every((res) => finalTrade().give[res] === finalTrade().take[res]);
    return tradeIdentical || oneResourceDifferentCount();
  });

  const disabled = createMemo(() => {
    const giveEmpty = RESOURCES.every((res) => finalTrade().give[res] === 0);
    const takeEmpty = RESOURCES.every((res) => finalTrade().take[res] === 0);
    return giveEmpty || takeEmpty;
  });

  return (
    <Popover
      open={popoverOpen()}
      placement="top"
      onOpenChange={(isOpen) => {
        setPopoverOpen(isOpen);
        if (!isOpen) reset();
      }}
    >
      <PopoverTrigger as={Button} class="gap-2 bg-amber-500 hover:bg-amber-600">
        Trade <FaSolidArrowRightArrowLeft size={20} />
      </PopoverTrigger>

      <PopoverContent
        class="flex w-[350px] flex-col gap-3"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <PopoverArrow />

        <PopoverTitle class="flex items-center justify-between">
          Trade
          <div class="flex items-center gap-2">
            <Button variant="ghost" size="sm" class={cn(!playerSelected() && "hidden")} onClick={reset}>
              Reset
            </Button>

            <PopoverClose>
              <IoClose size={20} />
            </PopoverClose>
          </div>
        </PopoverTitle>

        <Separator />

        <RadioGroup
          class="flex justify-between"
          value={playerSelected()}
          onChange={(value) => setPlayerSelected(value)}
        >
          <For each={opponents()}>
            {(player) => (
              <RadioGroupItem
                value={`${player.idx}`}
                class="text-[--color]"
                style={{ "--color": `var(--player-color-${player.idx})` }}
              >
                <RadioGroupItemLabel class="text-[color:--color]">{player.name}</RadioGroupItemLabel>
              </RadioGroupItem>
            )}
          </For>
        </RadioGroup>

        <Collapsible
          open={!!playerSelected()}
          onOpenChange={setPlayerSelected}
          class="data-[closed]:hidden"
        >
          <CollapsibleContent>
            <div class="flex min-w-0 items-center justify-between gap-5">
              <div class="flex w-full flex-col items-center justify-between gap-3">
                <ResourceSelector
                  resources={currentPlayer().resources()}
                  onChange={(resources) =>
                    setFinalTrade((finalTrade) => ({ ...finalTrade, give: resources }))
                  }
                />
                <Badge
                  variant="outline"
                  class="w-full justify-between gap-2 bg-[--current-player-color] text-[1rem] text-[color:--current-player-color-text]"
                >
                  {currentPlayer().name} <FaSolidAnglesRight size={16} />
                </Badge>
              </div>

              <div class="flex w-full flex-col items-center justify-between gap-3">
                <Show when={selectedPlayer()}>
                  <ResourceSelector
                    resources={selectedPlayer()!.resources()}
                    onChange={(resources) =>
                      setFinalTrade((finalTrade) => ({ ...finalTrade, take: resources }))
                    }
                  />
                </Show>
                <Badge
                  variant="outline"
                  class="w-full justify-between gap-2 bg-[--color] text-[1rem] text-[color:--text]"
                  style={{
                    "--color": `var(--player-color-${playerSelected()})`,
                    "--text": `var(--player-color-text-${playerSelected()})`
                  }}
                >
                  <FaSolidAnglesLeft size={16} />
                  {selectedPlayer()?.name}
                </Badge>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        <div class="flex w-full items-center justify-center text-[1rem]">
          <Show
            when={!disabled()}
            fallback={<span class="text-[0.8rem]">Trade involves give and take, you know</span>}
          >
            <div class="flex w-full items-center justify-between font-bold">
              <ResourceSummary tradeSide={giveFiltered()} />

              <Switch>
                <Match when={joke()}>
                  <Tooltip placement="top" open={joke()} disabled={!joke() || disabled()}>
                    <TooltipTrigger as="span" class="text-[2rem]">
                      😒
                    </TooltipTrigger>

                    <TooltipContent class="bg-white text-black">fo real?</TooltipContent>
                  </Tooltip>
                </Match>
                <Match when={!disabled()}>
                  <Button
                    class="bg-green-500 hover:bg-green-600"
                    onClick={() => {
                      batch(() => {
                        trade(+playerSelected(), finalTrade());
                        reset();
                      });
                    }}
                  >
                    <FaSolidArrowRightArrowLeft />
                  </Button>
                </Match>
              </Switch>

              <ResourceSummary tradeSide={takeFiltered()} />
            </div>
          </Show>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ResourceSummary(props: { tradeSide: TradeSide }) {
  return (
    <div class="flex flex-1 flex-col last-of-type:items-end">
      <For each={props.tradeSide}>
        {([res, count]) => (
          <span>
            {count} {res}
          </span>
        )}
      </For>
    </div>
  );
}
