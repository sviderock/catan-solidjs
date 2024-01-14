import { For } from "solid-js";
import { Portal } from "solid-js/web";
import { Limit } from "./constants";

type Props = {
  stats: Stats;
};

export default function Stats(props: Props) {
  return (
    <Portal>
      <div class="fixed bottom-0 left-0 flex flex-col gap-4 bg-dark p-2 text-[0.8rem] font-bold">
        <For each={props.stats}>
          {(playerStats) => (
            <div
              class="grid grid-flow-row-dense grid-cols-3 flex-col"
              style={{ color: playerStats.player.color }}
            >
              <span class="col-span-3 flex gap-4">
                {playerStats.player.name}: <strong>{playerStats.points} points</strong>
              </span>
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
          )}
        </For>
      </div>
    </Portal>
  );
}
