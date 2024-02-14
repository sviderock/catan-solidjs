import { HarborIcon } from "@/components/Board/Harbors";
import { Button } from "@/components/ui/button";
import { Popover, PopoverArrow, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RESOURCES } from "@/constants";
import { currentPlayer, currentPlayerStats, exachange } from "@/state";
import { As } from "@kobalte/core";
import { TbShip } from "solid-icons/tb";
import { For, Index, Show, batch, createMemo, createSignal } from "solid-js";

export default function MaritimeTradeButton() {
  const [tooltipOpen, setTooltipOpen] = createSignal(false);

  function isTradeDisabled(harborType: Harbor["type"]) {
    return harborType === "all"
      ? Object.values(currentPlayer().resources()).every((resCount) => resCount < 3)
      : currentPlayer().resources()[harborType] / 2 < 1;
  }

  return (
    <Show when={currentPlayerStats().harbors.length} fallback={<DisabledTradeButton />}>
      <Popover placement="top">
        <PopoverTrigger>
          <TradeButton />
        </PopoverTrigger>
        <PopoverContent class="w-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
          <PopoverArrow />

          <div class="flex items-center justify-between gap-4">
            <For each={currentPlayerStats().harbors}>
              {(harbor) => (
                <div class="flex flex-col items-center gap-1">
                  <Show
                    when={harbor.type !== "all"}
                    fallback={<span class="text-[2rem] leading-none">*</span>}
                  >
                    <HarborIcon type={harbor.type} />
                  </Show>

                  <span class="text-[1.5rem]">{harbor.type === "all" ? "3:1" : "2:1"}</span>

                  <Tooltip open={tooltipOpen()} placement="right">
                    <TooltipTrigger>
                      <Button
                        variant={tooltipOpen() ? "default" : "outline"}
                        disabled={isTradeDisabled(harbor.type)}
                        onClick={() => setTooltipOpen(!tooltipOpen())}
                      >
                        Trade
                      </Button>
                    </TooltipTrigger>

                    <TooltipContent>
                      <Show
                        when={harbor.type === "all"}
                        fallback={
                          <PickResource
                            onPick={(res) => {
                              batch(() => {
                                setTooltipOpen(false);
                                exachange([
                                  {
                                    idx: currentPlayer().idx,
                                    add: { [res]: 1 },
                                    remove: { [harbor.type]: 2 }
                                  }
                                ]);
                              });
                            }}
                          />
                        }
                      >
                        <ThreeToOnePicker
                          onPick={(get, give) => {
                            batch(() => {
                              setTooltipOpen(false);
                              exachange([
                                { idx: currentPlayer().idx, add: { [get]: 1 }, remove: { [give]: 3 } }
                              ]);
                            });
                          }}
                        />
                      </Show>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </For>
          </div>
        </PopoverContent>
      </Popover>
    </Show>
  );
}

const DisabledTradeButton = () => (
  <Tooltip placement="right">
    <TooltipTrigger asChild>
      <As component="span" tabIndex={0} class="flex">
        <TradeButton />
      </As>
    </TooltipTrigger>

    <TooltipContent>You don't have any harbors</TooltipContent>
  </Tooltip>
);

const TradeButton = () => (
  <Button class="gap-2 bg-blue-500 hover:bg-blue-600" disabled={!currentPlayerStats().harbors.length}>
    Maritime Trade <TbShip size={20} />
  </Button>
);

const ThreeToOnePicker = (props: { onPick: (get: Resource, give: Resource) => void }) => {
  const [selected, setSelected] = createSignal<Resource | null>(null);
  const [hovered, setHovered] = createSignal<Resource | null>(null);

  const disabled = createMemo(() =>
    Object.entries(currentPlayer().resources()).reduce<Record<Resource, boolean>>(
      (acc, [res, count]) => {
        acc[res as Resource] = count < 3;
        return acc;
      },
      {} as Record<Resource, boolean>
    )
  );

  return (
    <div class="flex flex-col gap-2">
      <div class="flex flex-col gap-1">
        <span>
          Exachange 3 items of{" "}
          <Show when={selected() && currentPlayer().resources()[selected()!]}>{selected()}</Show>
        </span>
        <PickResource
          selected={selected()}
          disabled={disabled()}
          onPick={(res) => setSelected(selected() === res ? null : res)}
        />
      </div>
      <Separator />
      <div class="flex flex-col gap-1">
        <span>
          For 1 item of <Show when={hovered()}>{hovered()}</Show>
        </span>
        <PickResource
          disabled={selected() ? { [selected()!]: true } : undefined}
          onMouseOver={setHovered}
          onMouseOut={() => setHovered(null)}
          onPick={(res) => {
            if (!selected()) return;
            props.onPick(res, selected()!);
          }}
        />
      </div>
    </div>
  );
};

const PickResource = (props: {
  selected?: Resource | null;
  disabled?: Partial<Record<Resource, boolean>>;
  onPick: (res: Resource) => void;
  onMouseOver?: (res: Resource) => void;
  onMouseOut?: () => void;
}) => (
  <div class="flex gap-1">
    <Index each={RESOURCES}>
      {(res) => (
        <HarborIcon
          type={res()}
          aria-selected={props.selected === res()}
          aria-disabled={props.disabled?.[res()]}
          onClick={() => props.onPick(res())}
          onMouseOver={() => props.onMouseOver?.(res())}
          onMouseOut={props.onMouseOut}
          class="cursor-pointer transition-colors hover:border-white aria-disabled:pointer-events-none aria-disabled:opacity-30 aria-selected:border-indigo-500"
        />
      )}
    </Index>
  </div>
);
