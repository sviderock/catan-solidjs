import ResourceIcon from "@/components/ResourceIcon";
import { Button } from "@/components/ui/button";
import { Popover, PopoverArrow, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { buyDevelopmentCard, currentPlayer, state } from "@/state";
import { As } from "@kobalte/core";
import { CgCardClubs } from "solid-icons/cg";
import { FaSolidCoins } from "solid-icons/fa";
import { batch, createSignal } from "solid-js";

export default function BuyDevelopmentCardButton() {
  const [showTooltip, setShowTooltip] = createSignal(false);

  function haveRes(type: Resource) {
    return currentPlayer().resources()[type] >= 1;
  }

  return (
    <div class="flex flex-col items-center gap-2">
      <Popover placement="bottom">
        <PopoverTrigger asChild>
          <As component={Button} size="iconButton" disabled={state.game.rollStatus !== "rolled"}>
            <CgCardClubs />
          </As>
        </PopoverTrigger>

        <PopoverContent class="flex flex-col gap-2">
          <PopoverArrow />

          <div class="flex items-center justify-between gap-2">
            <span>Price:</span>
            <Tooltip placement="right" open={showTooltip()}>
              <TooltipTrigger asChild>
                <As
                  component={Button}
                  size="sm"
                  class="h-auto gap-1 bg-amber-500 px-2 py-1 text-amber-950 hover:bg-amber-600 focus:bg-amber-600"
                  onClick={() => {
                    batch(() => {
                      buyDevelopmentCard();
                      setShowTooltip(true);
                      setTimeout(() => setShowTooltip(false), 2000);
                    });
                  }}
                >
                  <FaSolidCoins /> Buy
                </As>
              </TooltipTrigger>

              <TooltipContent>Bought!</TooltipContent>
            </Tooltip>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex gap-1">
              <ResourceIcon count={1} type="wool" aria-disabled={!haveRes("wool")} />
              <ResourceIcon count={1} type="grain" aria-disabled={!haveRes("grain")} />
              <ResourceIcon count={1} type="ore" aria-disabled={!haveRes("ore")} />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <span>Buy DC</span>
    </div>
  );
}
