import { For } from "solid-js";
import { Limit, Resource } from "../constants";
import { shadeHexColor } from "../utils";
import { type Stats } from "@/state";

type Props = {
  stats: Stats;
};

export default function PlayersStats(props: Props) {
  return (
    <div class="grid grid-cols-2 gap-4 bg-dark p-2 text-[0.8rem] font-bold">
      <For each={props.stats}>
        {(playerStats) => (
          <div
            class="flex h-full flex-col gap-2 rounded-sm p-3"
            style={{
              color: shadeHexColor(playerStats.player.color, -0.5),
              "background-color": playerStats.player.color
            }}
          >
            <span class="flex justify-between gap-4">
              {playerStats.player.name}: <strong>{playerStats.points} points</strong>
            </span>

            <div class="flex items-center justify-between text-[1rem]">
              <div class="flex flex-col">
                <span>{Resource.brick.icon}</span>
                <span>{playerStats.player.resources().brick}</span>
              </div>
              <div class="flex flex-col">
                <span>{Resource.lumber.icon}</span>
                <span>{playerStats.player.resources().lumber}</span>
              </div>
              <div class="flex flex-col">
                <span>{Resource.wool.icon}</span>
                <span>{playerStats.player.resources().wool}</span>
              </div>
              <div class="flex flex-col">
                <span>{Resource.grain.icon}</span>
                <span>{playerStats.player.resources().grain}</span>
              </div>
              <div class="flex flex-col">
                <span>{Resource.ore.icon}</span>
                <span>{playerStats.player.resources().ore}</span>
              </div>
            </div>

            <div>
              <div class="flex flex-col items-start">
                <div class="flex w-full items-center justify-between">
                  <span>Roads</span>
                  <span>
                    {playerStats.roads} ({Limit.Roads - playerStats.roads})
                  </span>
                </div>
                <div class="flex w-full items-center justify-between">
                  <span>Settlements</span>
                  <span>
                    {playerStats.settlements} ({Limit.Settlements - playerStats.settlements})
                  </span>
                </div>
                <div class="flex w-full items-center justify-between">
                  <span>Cities</span>
                  <span>
                    {playerStats.cities} ({Limit.Cities - playerStats.cities})
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </For>
    </div>
  );
}
