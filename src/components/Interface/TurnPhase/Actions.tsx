import { Button } from "@/components/ui/button";
import { endTurn, lastRoll, roll, state } from "@/state";
import { FaRegularCircleCheck } from "solid-icons/fa";
import { IoDice } from "solid-icons/io";
import { Show } from "solid-js";
import BuyDevelopmentCardButton from "./BuyDevelopmentCardButton";
import MaritimeTradeButton from "./MaritimeTradeButton";
import TradeButton from "./TradeButton";

export default function Actions() {
  return (
    <div class="grid grid-rows-[auto_auto_1fr] gap-4">
      <h3>Actions</h3>

      <div class="flex gap-4 text-xs">
        <RollButton />
        <BuyDevelopmentCardButton />
        <TradeButton />
        <MaritimeTradeButton />
        <EndTurnButton />
      </div>

      <Show when={state.game.rollStatus !== "not_rolled"}>
        <div class="flex items-center justify-center gap-2 text-5xl">
          <span>{state.game.rollStatus === "rolling" ? "Rolling..." : "Rolled"}</span>
          <span>{state.game.rollStatus === "rolling" ? null : lastRoll()}</span>
        </div>
      </Show>
    </div>
  );
}

function RollButton() {
  return (
    <div class="flex flex-col items-center gap-2">
      <Button
        size="iconButton"
        disabled={
          state.game.rollStatus === "rolled" ||
          (state.game.rollStatus === "not_rolled" &&
            state.game.playedDevelopmentCard &&
            state.robber.status !== "placed")
        }
        onClick={() => roll()}
      >
        <IoDice classList={{ "animate-dice-roll": state.game.rollStatus === "rolling" }} />
      </Button>
      Roll
    </div>
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
