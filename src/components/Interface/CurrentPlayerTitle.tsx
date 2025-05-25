import { currentPlayer } from "@/state";

export default function CurrentPlayerTitle() {
  return (
    <div class="flex gap-4">
      <span>Current Player:</span>
      <strong class="text-(--current-player-color)">{currentPlayer().name}</strong>
    </div>
  );
}
