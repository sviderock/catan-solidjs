import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { currentPlayer, currentPlayerStats, endTurn, lastRoll, roll, state } from "@/state";
import { As } from "@kobalte/core";
import { TbShip } from "solid-icons/tb";
import { Index, Match, Switch } from "solid-js";
import { Limit, RESOURCES, Resource } from "../../constants";
import { matches } from "../../utils";
import BuildingCosts from "./BuildingCosts";
import Trade from "./Trade";

export default function Interface() {
  return (
    <div>
      <Switch>
        <Match when={matches(state.game, (game): game is SetupPhase => game.phase === "setup")}>
          {(game) => <SetupPhase game={game()} />}
        </Match>
        <Match when={matches(state.game, (game): game is TurnPhase => game.phase === "turn")}>
          {(game) => <TurnPhase game={game()} />}
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

const SetupPhase = (props: { game: SetupPhase }) => {
  return (
    <div class="flex justify-between bg-dark">
      <div class="flex flex-col gap-4 rounded-tl-lg bg-dark p-4 text-[1rem] text-blue-100">
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

          <button
            type="button"
            disabled={!props.game.town || !props.game.road}
            onClick={() => endTurn()}
            class="w-full rounded-lg border border-[--current-player-color] bg-[--current-player-color] px-4 py-1 text-center text-sm font-medium text-blue-100 transition-colors hover:border-[color:--current-player-color-darker] hover:bg-[--current-player-color-darker] hover:text-white disabled:pointer-events-none disabled:bg-[--current-player-color-darker] disabled:opacity-25"
          >
            End Turn
          </button>
        </div>
      </div>
    </div>
  );
};

const TurnPhase = (props: { game: TurnPhase }) => {
  const rollText = () => {
    if (props.game.rollStatus === "not_rolled") return "Click to roll";
    if (props.game.rollStatus === "rolling") return "Rolling production...";
    return (
      <div class="flex items-center justify-between">
        <span>
          Rolled <strong>{lastRoll()}</strong>!
        </span>
      </div>
    );
  };

  return (
    <div class="flex bg-dark p-4 text-[1rem] text-blue-100">
      <div class="flex w-full justify-between gap-2">
        <div class="flex flex-col justify-between gap-2">
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

        <div class="grid grid-cols-2 gap-4">
          <h3>Actions</h3>

          <Button
            class="col-span-full bg-green-500 hover:bg-green-600"
            disabled={props.game.rollStatus === "rolled"}
            onClick={() => roll()}
          >
            {rollText()}
          </Button>

          <Trade />

          <Tooltip placement="right" disabled={!!currentPlayerStats().harbors.length}>
            <TooltipTrigger asChild>
              <As component="span" tabIndex={0} class="flex">
                <Button
                  class="gap-2 bg-blue-500 hover:bg-blue-600"
                  disabled={!currentPlayerStats().harbors.length}
                >
                  Maritime Trade <TbShip size={20} />
                </Button>
              </As>
            </TooltipTrigger>

            <TooltipContent>You don't have any harbors</TooltipContent>
          </Tooltip>

          <Tooltip placement="right">
            <TooltipTrigger
              class="col-span-full rounded-lg border px-4 py-1 disabled:opacity-50"
              disabled={!currentPlayer().developmentCards.length}
            >
              Play Development Card
            </TooltipTrigger>

            <TooltipContent>No development cards available</TooltipContent>
          </Tooltip>

          <button
            type="button"
            onClick={() => endTurn()}
            disabled={props.game.rollStatus !== "rolled" || state.robber.status !== "placed"}
            class="col-span-full rounded-lg border border-[--current-player-color] bg-[--current-player-color] px-4 py-1 text-center text-sm font-medium text-[--current-player-color-text] transition-colors hover:border-[color:--current-player-color-darker] hover:bg-[--current-player-color-darker] hover:text-white disabled:pointer-events-none disabled:bg-[--current-player-color-darker] disabled:opacity-25"
          >
            End Turn
          </button>
        </div>

        <BuildingCosts />
      </div>
    </div>
  );
};
