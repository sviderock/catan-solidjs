import {
  ResourceSelector,
  ResourceSelectorButton,
  ResourceSelectorContent,
  ResourceSelectorError
} from "@/components/ResourceSelector";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { dropResources, setState, state } from "@/state";
import { resourceCount } from "@/utils";
import { AiOutlineCheck } from "solid-icons/ai";
import { For, Show, batch, createSignal, onMount } from "solid-js";

export default function DropResourcesDialog() {
  const [playerStatus, setPlayerStatus] = createSignal(
    state.game.players.map((player) => {
      console.log(resourceCount(player.resources()));
      const needToDrop = resourceCount(player.resources()) > 7;
      return {
        allGood: !needToDrop,
        resourcesToDrop: (needToDrop ? null : {}) as PlayerResources | null
      };
    })
  );

  function drop(playerIdx: number, res: PlayerResources) {
    setPlayerStatus((status) => status.with(playerIdx, { allGood: true, resourcesToDrop: res }));

    const allDropped = playerStatus().every((status) => status.allGood);
    if (!allDropped) return;

    batch(() => {
      const drop: Parameters<typeof dropResources>[0] = playerStatus().map(
        ({ resourcesToDrop }, idx) => [idx, resourcesToDrop!]
      );
      dropResources(drop);
      setState("robber", "status", "select_hex_and_player");
    });
  }

  onMount(() => {
    const allGood = playerStatus().every((status) => status.allGood);
    if (allGood) {
      setState("robber", "status", "select_hex_and_player");
    }
  });

  return (
    <Dialog defaultOpen>
      <DialogContent class="grid max-w-[36rem] grid-cols-2 gap-5">
        <span class="col-span-full text-center text-[1.5rem]">Waiting for players...</span>

        <For each={state.game.players}>
          {(player, idx) => (
            <div class="flex flex-col justify-between gap-4 rounded-sm bg-dark p-4">
              <ResourceSelector
                resources={player.resources()}
                requiredCount={Math.floor(resourceCount(player.resources()) / 2)}
                disabled={playerStatus()[idx()]?.allGood}
              >
                <div class="flex flex-col gap-4">
                  <span
                    class="rounded-sm bg-[--bg] px-2 text-center text-[color:--color]"
                    style={{
                      "--color": `var(--player-color-text-${idx()})`,
                      "--bg": `var(--player-color-${idx()})`
                    }}
                  >
                    {player.name}
                  </span>

                  <ResourceSelectorContent />
                </div>

                <ResourceSelectorError>
                  {(leftToSelect) => (
                    <span class="text-center text-red-500">Drop {leftToSelect} more resources</span>
                  )}
                </ResourceSelectorError>

                <Show
                  when={playerStatus()[idx()]?.allGood}
                  fallback={
                    <ResourceSelectorButton
                      class="bg-blue-500 text-white hover:bg-blue-600"
                      onClick={(resources) => drop(idx(), resources)}
                    >
                      Drop Resources
                    </ResourceSelectorButton>
                  }
                >
                  <span class="flex items-center justify-between text-green-500">
                    All good!
                    <AiOutlineCheck class="fill-current" size={20} />
                  </span>
                </Show>
              </ResourceSelector>
            </div>
          )}
        </For>
      </DialogContent>
    </Dialog>
  );
}
