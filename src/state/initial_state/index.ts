import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import getGame from "./get_game";
import getHarbors from "./get_harbors";
import getHexes from "./get_hexes";
import getStructures from "./get_structures";

export function getInitialState(phase?: "game" | "half"): State {
  console.time("state");
  const hexes = getHexes();
  const structures = getStructures(hexes);
  const harbors = getHarbors(hexes, structures);
  const game = getGame(structures, phase);
  console.timeEnd("state");

  return { hexes, structures, harbors, game };
}

export const [debug, setDebug] = createSignal(false);
export const [state, setState] = createStore(getInitialState("game"));
