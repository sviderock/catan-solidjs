import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import getGame from "./get_game";
import getHarbors from "./get_harbors";
import getHexes, { type GetHexes } from "./get_hexes";
import getStructures from "./get_structures";

declare global {
  type State = ReturnType<typeof getInitialState>;
}

function getRobber(hexes: GetHexes): Robber {
  const [pos, setPos] = createSignal<RobberPos>({ x: 0, y: 0 });
  return { id: "robber", status: "placed", hex: hexes.desert, pos, setPos };
}

export function getInitialState(phase?: "game" | "half") {
  console.time("state");
  const hexes = getHexes();
  const structures = getStructures(hexes);
  const harbors = getHarbors(hexes, structures);
  const game = getGame(hexes, structures, phase);
  const robber = getRobber(hexes);
  console.timeEnd("state");

  return { hexes, structures, harbors, robber, game };
}

export const [debug, setDebug] = createSignal(false);
export const [state, setState] = createStore(getInitialState("game"));
export const refs = {} as Record<string, HTMLDivElement | undefined>;
