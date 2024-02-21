import CurrentPlayerTitle from "@/components/Interface/CurrentPlayerTitle";
import { Button } from "@/components/ui/button";
import { currentPlayer, endTurn } from "@/state";

export default function SetupPhase(props: { game: SetupPhase }) {
  return (
    <div class="flex h-full justify-between">
      <div class="flex flex-col gap-4 rounded-tl-lg  p-4 text-[1rem] text-blue-100">
        <div class="flex flex-col gap-2">
          <CurrentPlayerTitle />

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
