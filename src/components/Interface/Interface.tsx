import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Limit, RESOURCES, Resource } from "@/constants";
import {
  buyDevelopmentCard,
  currentPlayer,
  currentPlayerStats,
  endTurn,
  haveResourcesFor,
  lastRoll,
  roll,
  state
} from "@/state";
import { matches } from "@/utils";
import { As } from "@kobalte/core";
import { CgCardClubs } from "solid-icons/cg";
import { FaSolidCircleCheck } from "solid-icons/fa";
import { IoDice } from "solid-icons/io";
import { Index, type JSX, Match, Switch, onCleanup, onMount } from "solid-js";
import { Dynamic } from "solid-js/web";
import DevelopmentCards from "./DevelopmentCards";
import MaritimeTradeButton from "./MaritimeTradeButton";
import TradeButton from "./TradeButton";

export default function Interface() {
  return (
    <div class="h-[270px] bg-dark">
      <Switch>
        <Match when={matches(state.game, (game): game is SetupPhase => game.phase === "setup")}>
          {(game) => <SetupPhase game={game()} />}
        </Match>
        <Match when={matches(state.game, (game): game is TurnPhase => game.phase === "turn")}>
          <TurnPhase />
        </Match>
      </Switch>
    </div>
  );
}

const CurrentPlayer = () => {
  return (
    <div class="flex gap-4">
      <span>Current Player:</span>
      <strong class="text-[--current-player-color]">{currentPlayer().name}</strong>
    </div>
  );
};

function SetupPhase(props: { game: SetupPhase }) {
  return (
    <div class="flex h-full justify-between">
      <div class="flex flex-col gap-4 rounded-tl-lg  p-4 text-[1rem] text-blue-100">
        <div class="flex flex-col gap-2">
          <CurrentPlayer />

          <div class="flex flex-col">
            <span>
              Town Placed: <strong>{props.game.town ? "Yes" : "No"}</strong>
            </span>
            <span>
              Road Placed: <strong>{props.game.road ? "Yes" : "No"}</strong>
            </span>
          </div>

          <Button
            disabled={!props.game.town || !props.game.road}
            onClick={() => endTurn()}
            color={currentPlayer().color}
          >
            End Turn
          </Button>
        </div>
      </div>
    </div>
  );
}

function TurnPhase() {
  onMount(() => {
    function onKeyUp(e: KeyboardEvent) {
      if (e.code === "Space") endTurn();
      if (e.key === "r") roll();
    }

    document.addEventListener("keyup", onKeyUp);
    onCleanup(() => document.removeEventListener("keyup", onKeyUp));
  });

  return (
    <div class="flex h-full p-4 text-[1rem] text-blue-100">
      <div class="grid w-full grid-cols-3 justify-between gap-8">
        <div class="flex flex-col justify-between gap-2 justify-self-start">
          <div>
            <CurrentPlayer />

            <div class="flex items-center justify-between text-[1.5rem]">
              <Index each={RESOURCES}>
                {(res) => (
                  <div class="flex flex-col">
                    <span>{Resource[res()].icon}</span>
                    <span>{currentPlayer().resources()[res()]}</span>
                  </div>
                )}
              </Index>
            </div>

            <div class="flex flex-col items-start">
              <div class="flex w-full items-center justify-between">
                <span>Roads</span>
                <span>
                  {currentPlayerStats().roads} ({Limit.Roads - currentPlayerStats().roads})
                </span>
              </div>
              <div class="flex w-full items-center justify-between">
                <span>Settlements</span>
                <span>
                  {currentPlayerStats().settlements} (
                  {Limit.Settlements - currentPlayerStats().settlements})
                </span>
              </div>
              <div class="flex w-full items-center justify-between">
                <span>Cities</span>
                <span>
                  {currentPlayerStats().cities} ({Limit.Cities - currentPlayerStats().cities})
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between leading-none">
            <span class="text-[2.5rem]">Points:</span>
            <strong class="flex h-[40px] w-[40px] items-center justify-center rounded-full border-2 border-white bg-[--current-player-color] text-[2rem] leading-none">
              {currentPlayerStats().points}
            </strong>
          </div>
        </div>

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

        <DevelopmentCards />
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
        <FaSolidCircleCheck />
      </Button>
      End turn
    </div>
  );
}
