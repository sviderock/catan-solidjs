import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { currentPlayer, exachange as exchange, setState, state } from "@/state";
import { shuffle } from "@/utils";
import { Index, batch } from "solid-js";

export default function StealResourceDialog(props: { playerIdx: number }) {
  const shuffledCards = () => {
    const res = Object.entries(state.game.players[props.playerIdx]!.resources()).reduce<Resource[]>(
      (acc, [res, count]) => {
        acc.push(...Array(count).fill(res));
        return acc;
      },
      []
    );

    return shuffle(res);
  };

  function stealCard(res: Resource) {
    batch(() => {
      exchange([
        { idx: currentPlayer().idx, add: { [res]: 1 } },
        { idx: props.playerIdx, remove: { [res]: 1 } }
      ]);
      setState("robber", "status", "placed");
    });
  }

  return (
    <Dialog defaultOpen>
      <DialogContent class="max-w-[36rem] gap-5">
        <span class="col-span-full text-center text-[1.5rem]">Pick a card</span>
        <div class="grid grid-cols-5 gap-1">
          <Index each={shuffledCards()}>
            {(res) => (
              <Button
                onClick={() => stealCard(res())}
                class="flex h-[100px] w-[100px] items-center justify-center rounded-sm border-2 border-blue-300"
              >
                ?
              </Button>
            )}
          </Index>
        </div>
      </DialogContent>
    </Dialog>
  );
}
