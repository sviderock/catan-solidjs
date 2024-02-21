import CurrentPlayerTitle from "@/components/Interface/CurrentPlayerTitle";
import DevelopmentCards from "@/components/Interface/DevelopmentCards";
import Actions from "@/components/Interface/TurnPhase/Actions";
import { Limit, RESOURCES, Resource } from "@/constants";
import { currentPlayer, currentPlayerStats, endTurn, roll } from "@/state";
import { Index, onCleanup, onMount } from "solid-js";

export default function TurnPhase() {
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
            <CurrentPlayerTitle />

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

        <Actions />
        <DevelopmentCards />
      </div>
    </div>
  );
}
