import { For } from "solid-js";
import { Portal } from "solid-js/web";
import { Limit } from "./constants";

type Props = {
  stats: Stats;
};

export default function Stats(props: Props) {
  return (
    <Portal>
      <div class="fixed left-0 top-0 flex flex-col gap-2 bg-blue-100 p-2 text-[1rem] font-bold">
        <For each={props.stats}>
          {(player) => (
            <div class="flex">
              <span>
                Roads: {player.roads} ({Limit.Roads - player.roads} left)
              </span>
              <span>
                Settlements: {player.settlements} ({Limit.Settlements - player.settlements} left)
              </span>
              <span>
                Cities: {player.cities} ({Limit.Cities - player.cities} left)
              </span>
              <span>Points: {player.points} points</span>
            </div>
          )}
        </For>
      </div>
    </Portal>
  );
}
