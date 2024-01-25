import { type InterfaceProps } from "@/components/Interface/Interface";
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
import { RESOURCES, Resource } from "@/constants";
import { currentPlayer, opponents, state } from "@/state";
import { cn } from "@/utils";
import { AiTwotoneMinusCircle, AiTwotonePlusCircle } from "solid-icons/ai";
import { FaSolidAnglesLeft, FaSolidAnglesRight, FaSolidArrowRightArrowLeft } from "solid-icons/fa";
import { IoClose } from "solid-icons/io";
import {
  For,
  Index,
  Match,
  Show,
  Switch,
  batch,
  createMemo,
  createSignal,
  type Accessor,
  type Setter
} from "solid-js";

export type TradeSide = Array<[Resource, count: number]>;

const initialTrade = () => RESOURCES.map((res): [Resource, count: number] => [res, 0]);

export default function Trade(props: InterfaceProps) {
  const [popoverOpen, setPopoverOpen] = createSignal(false);
  const [playerSelected, setPlayerSelected] = createSignal("");
  const [give, setGive] = createSignal(initialTrade());
  const [take, setTake] = createSignal(initialTrade());
  const giveFiltered = () => give().filter((i) => i[1] > 0);
  const takeFiltered = () => take().filter((i) => i[1] > 0);

  function reset() {
    batch(() => {
      setPlayerSelected("");
      setGive(initialTrade());
      setTake(initialTrade());
    });
  }

  function finishTrade() {
    const trade = { give: {}, take: {} } as Parameters<typeof props.onTrade>[1];
    give().forEach(([res, count]) => (trade.give[res] = count));
    take().forEach(([res, count]) => (trade.take[res] = count));

    batch(() => {
      props.onTrade(+playerSelected(), trade);
      setPopoverOpen(false);
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

  const tradeIdentical = createMemo(() =>
    give().every((giveItem, idx) => {
      const takeItem = take()[idx]!;
      return giveItem[0] === takeItem[0] && giveItem[1] === takeItem[1];
    })
  );

  const joke = () => oneResourceDifferentCount() || tradeIdentical();

  const disabled = createMemo(() => {
    return give().every((i) => i[1] === 0) || take().every((i) => i[1] === 0);
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
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
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
                <ResourceSelector {...props} resources={give} setResources={setGive} />
                <Badge
                  variant="outline"
                  class="w-full justify-between gap-2 bg-[--current-player-color] text-[1rem] text-[color:--current-player-color-text]"
                >
                  {currentPlayer().name} <FaSolidAnglesRight size={16} />
                </Badge>
              </div>

              <div class="flex w-full flex-col items-center justify-between gap-3">
                <ResourceSelector {...props} resources={take} setResources={setTake} />
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
                  <Button class="bg-green-500 hover:bg-green-600" onClick={finishTrade}>
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

type ResourceSelectorProps = InterfaceProps & {
  resources: Accessor<TradeSide>;
  setResources: Setter<TradeSide>;
};
function ResourceSelector(props: ResourceSelectorProps) {
  return (
    <div>
      <Index each={RESOURCES}>
        {(res, idx) => (
          <div class="flex h-6 w-full items-center justify-between gap-5">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                const [resource, count] = props.resources()[idx]!;
                if (count <= 0) return;
                props.setResources((trade) => trade.with(idx, [resource, count - 1]));
              }}
            >
              <AiTwotoneMinusCircle />
            </Button>

            <div class="flex justify-between gap-2">
              <span>{Resource[res()].icon}</span>
              <span class={cn(props.resources()[idx]![1] === 0 && "opacity-30")}>
                {props.resources()[idx]![1]}
              </span>
              <span class="opacity-70">({currentPlayer().resources()[res()]})</span>
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                const [resource, count] = props.resources()[idx]!;
                if (count >= currentPlayer().resources()[res()]) return;
                props.setResources((trade) => trade.with(idx, [resource, count + 1]));
              }}
            >
              <AiTwotonePlusCircle />
            </Button>
          </div>
        )}
      </Index>
    </div>
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
