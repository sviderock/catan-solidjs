import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { state } from "@/state";
import { shuffle } from "@/utils";
import { Index } from "solid-js";

export default function StealResourceDialog(props: {
  playerIdx: number;
  onSteal: (playerIdx: number, res: Resource) => void;
}) {
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

  return (
    <Dialog defaultOpen>
      <DialogContent
        class="max-w-xl gap-5"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <span class="col-span-full text-center text-[1.5rem]">Pick a card</span>
        <div class="grid grid-cols-5 gap-1">
          <Index each={shuffledCards()}>
            {(res) => (
              <Button
                onClick={() => props.onSteal(props.playerIdx, res())}
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
