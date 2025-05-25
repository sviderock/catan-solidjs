import { Switch } from "@/components/ui/switch";
import { PlayerColours } from "@/constants";
import { shadeHexColor } from "@/utils";
import { createEffect } from "solid-js";
import Board from "./components/Board/Board";
import { currentPlayer, debug, setDebug } from "./state";

export default function App() {
  createEffect(() => {
    document.body.setAttribute(
      "style",
      `
        --current-player-color: ${currentPlayer().color};
        --current-player-color-darker: ${shadeHexColor(currentPlayer().color, -0.25)};
        --current-player-color-text: ${shadeHexColor(currentPlayer().color, -0.5)};
        --player-color-0: ${PlayerColours[0]};
        --player-color-darker-0: ${shadeHexColor(PlayerColours[0]!, -0.25)};
        --player-color-text-0: ${shadeHexColor(PlayerColours[0]!, -0.5)};
        --player-color-1: ${PlayerColours[1]};
        --player-color-darker-1: ${shadeHexColor(PlayerColours[1]!, -0.25)};
        --player-color-text-1: ${shadeHexColor(PlayerColours[1]!, -0.5)};
        --player-color-2: ${PlayerColours[2]};
        --player-color-darker-2: ${shadeHexColor(PlayerColours[2]!, -0.25)};
        --player-color-text-2: ${shadeHexColor(PlayerColours[2]!, -0.5)};
        --player-color-3: ${PlayerColours[3]};
        --player-color-darker-3: ${shadeHexColor(PlayerColours[3]!, -0.25)};
        --player-color-text-3: ${shadeHexColor(PlayerColours[3]!, -0.5)};
      `
    );
  });

  return (
    <main class="flex h-full w-full items-center justify-center bg-blue-600">
      <Board />
      <Switch checked={debug()} onChange={setDebug} class="absolute left-10 top-10 " />
    </main>
  );
}
