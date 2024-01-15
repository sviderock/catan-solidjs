import { For } from "solid-js";
import { Limit, ResourceIcon } from "./constants";

type Props = {
  stats: Stats;
};

export default function Stats(props: Props) {
  return (
    <div class="flex gap-4 bg-dark p-2 text-[0.8rem] font-bold">
      <For each={props.stats}>
        {(playerStats) => (
          <div class="flex h-full flex-col gap-2" style={{ color: playerStats.player.color }}>
            <span class="flex justify-between gap-4">
              {playerStats.player.name}: <strong>{playerStats.points} points</strong>
            </span>

            <div class="flex items-center justify-between text-[1rem]">
              <span>
                {ResourceIcon.brick} {playerStats.player.resources().brick}
              </span>
              <span>
                {ResourceIcon.lumber} {playerStats.player.resources().lumber}
              </span>
              <span>
                {ResourceIcon.wool} {playerStats.player.resources().wool}
              </span>
              <span>
                {ResourceIcon.grain} {playerStats.player.resources().grain}
              </span>
              <span>
                {ResourceIcon.ore} {playerStats.player.resources().ore}
              </span>
            </div>

            <div>
              <div class="flex flex-col items-start">
                <span>
                  Roads: {playerStats.roads} ({Limit.Roads - playerStats.roads})
                </span>
                <span class="text-center">
                  Settlements: {playerStats.settlements} (
                  {Limit.Settlements - playerStats.settlements})
                </span>
                <span class="text-end">
                  Cities: {playerStats.cities} ({Limit.Cities - playerStats.cities})
                </span>
              </div>
            </div>
          </div>
        )}
      </For>
    </div>
  );
}
