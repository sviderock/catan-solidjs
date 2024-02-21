import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { buyDevelopmentCard, endTurn, haveResourcesFor, lastRoll, roll, state } from "@/state";
import { As } from "@kobalte/core";
import { CgCardClubs } from "solid-icons/cg";
import { FaRegularCircleCheck } from "solid-icons/fa";
import { IoDice } from "solid-icons/io";
import { type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import MaritimeTradeButton from "./MaritimeTradeButton";
import TradeButton from "./TradeButton";

export default function Actions() {
  return (
    <div class="flex flex-col gap-4">
      <h3>Actions</h3>

      <div class="flex gap-4 text-xs">
        <RollButton />
        <BuyDevelopmentCardButton />
        <TradeButton />
        <MaritimeTradeButton />
        <EndTurnButton />
      </div>
    </div>
  );
}

const RollLabel: Record<RollStatus, () => JSX.Element> = {
  not_rolled: () => "Roll",
  rolling: () => "Rolling...",
  rolled: () => (
    <>
      <p>You rolled</p>
      <strong class="text-2xl">{lastRoll()}</strong>
    </>
  )
};

function RollButton() {
  return (
    <div class="flex flex-col items-center gap-2">
      <Button size="iconButton" disabled={state.game.rollStatus === "rolled"} onClick={() => roll()}>
        <IoDice classList={{ "animate-dice-roll": state.game.rollStatus === "rolling" }} />
      </Button>
      <Dynamic component={RollLabel[state.game.rollStatus!]} />
    </div>
  );
}

function BuyDevelopmentCardButton() {
  return (
    <Tooltip placement="top" disabled={haveResourcesFor("development_card")}>
      <div class="flex flex-col items-center gap-2">
        <TooltipTrigger asChild>
          <As component="span" class="rounded-full" tabIndex={0}>
            <Button
              size="iconButton"
              disabled={!haveResourcesFor("development_card") || state.game.rollStatus !== "rolled"}
              onClick={() => buyDevelopmentCard()}
            >
              <CgCardClubs />
            </Button>
          </As>
        </TooltipTrigger>
        Buy DC
      </div>

      <TooltipContent>Not enough resources</TooltipContent>
    </Tooltip>
  );
}

function EndTurnButton() {
  return (
    <div class="flex flex-col items-center gap-2">
      <Button
        size="iconButton"
        onClick={() => endTurn()}
        disabled={state.game.rollStatus !== "rolled" || state.robber.status !== "placed"}
      >
        <FaRegularCircleCheck />
      </Button>
      End turn
    </div>
  );
}
