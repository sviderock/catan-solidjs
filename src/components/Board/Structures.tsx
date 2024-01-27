import { Limit } from "@/constants";
import {
  build,
  canBuild,
  currentPlayer,
  currentPlayerStats,
  debug,
  harbor,
  occupied,
  occupiedBy,
  refs,
  setState,
  state
} from "@/state";
import { matches } from "@/utils";
import { For, Match, Switch, batch } from "solid-js";
import Road from "./Road";
import Town from "./Town";

export default function Structures() {
  return (
    <For each={state.structures.array}>
      {(structure) => (
        <Switch>
          <Match when={matches(structure, (s): s is Town => s.type === "town")}>
            {(town) => (
              <Town
                debug={debug()}
                {...town()}
                ref={refs[town().id]!}
                occupiedBy={occupiedBy(town().id)}
                canBuild={canBuild(town())}
                currentPlayer={currentPlayer()}
                harbor={harbor(town().id)}
                onClick={() => {
                  batch(() => {
                    if (state.game.phase === "setup") {
                      return setState("game", {
                        town: state.game.town === town() ? null : town(),
                        road: state.game.town ? null : state.game.road
                      });
                    }

                    build(town());
                  });
                }}
              />
            )}
          </Match>

          <Match when={matches(structure, (s): s is Road => s.type === "road")}>
            {(road) => (
              <Road
                debug={debug()}
                {...road()}
                ref={refs[road().id]!}
                canBuild={canBuild(road())}
                occupiedBy={occupiedBy(road().id)}
                currentPlayer={currentPlayer()}
                onClick={() => {
                  batch(() => {
                    if (state.game.phase === "setup") {
                      return setState("game", {
                        road: state.game.road ? null : road()
                      });
                    }

                    if (occupied(road().id) && occupiedBy(road().id) !== currentPlayer()) return;

                    if (currentPlayerStats().roads === Limit.Roads) return;
                    build(road());
                  });
                }}
              />
            )}
          </Match>
        </Switch>
      )}
    </For>
  );
}
