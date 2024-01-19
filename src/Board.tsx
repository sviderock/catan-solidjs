import { For, Match, Switch, batch, createEffect, onMount } from "solid-js";
import { createStore, produce } from "solid-js/store";
import Dock from "./Harbor/Dock";
import Harbor from "./Harbor/Harbor";
import Hexagon from "./Hexagon/Hexagon";
import Interface from "./Interface/Interface";
import Road from "./Road";
import Town from "./Town";
import { Limit } from "./constants";
import { debug } from "./state";
import { calculateHarbor, calculateHex, calculateRoad, calculateTown } from "./utils/calculations";
import { getInitialState } from "./utils/initial_state";
import { usePlayer } from "./utils/use_player";
import useStructures from "./utils/use_structures";
import { matches, rollDice } from "./utils";

export default function Board() {
  const refs = {} as Record<string, HTMLDivElement | undefined>;
  const [state, setState] = createStore(getInitialState("game"));
  const { occupied, occupiedBy, canBuild, harbor } = useStructures(state);
  const { currentPlayer, nextPlayerIdx, currentPlayerStats, playersResourceSummary } = usePlayer(state);

  function roll() {
    const newRoll = rollDice(state.game.rolls?.at(-1)?.roll);
    setState(
      "game",
      "rolls",
      produce((rolls) => rolls?.push(newRoll))
    );
  }

  function build(s: Structure) {
    batch(() => {
      // Build initial structures for free cause those are the rules, you know
      if (state.game.phase === "setup") {
        if (s.type === "road") currentPlayer().setRoads([...currentPlayer().roads(), s]);
        if (s.type === "town") currentPlayer().setTowns([...currentPlayer().towns(), s]);
        return;
      }

      // Skip if trying to build a town that is already a city
      if (s.type === "town" && s.level() === "city") return;

      // Build road and take resources
      if (s.type === "road") {
        currentPlayer().setRoads([...currentPlayer().roads(), s]);
        currentPlayer().setResources((resources) => ({
          ...resources,
          brick: resources.brick - 1,
          lumber: resources.lumber - 1
        }));
        return;
      }

      // If unoccupied, build settlement and take resources
      if (s.type === "town" && !occupied(s.id)) {
        currentPlayer().setTowns([...currentPlayer().towns(), s]);
        currentPlayer().setResources((resources) => ({
          ...resources,
          brick: resources.brick - 1,
          lumber: resources.lumber - 1,
          wool: resources.wool - 1,
          grain: resources.grain - 1
        }));
        return;
      }

      // If upgrading your own settlement to city then only fetch resources from player
      if (s.type === "town" && occupied(s.id) && occupiedBy(s.id) === currentPlayer()) {
        s.setLevel(() => "city");
        currentPlayer().setResources((resources) => ({
          ...resources,
          grain: resources.grain - 2,
          ore: resources.ore - 3
        }));
      }
    });
  }

  function recalculate() {
    console.time("calculations");
    state.hexes.array.forEach((hex) => {
      const calc = calculateHex(refs[hex.id]!);
      hex.setCalc(calc);
    });

    state.structures.array.forEach((structure) => {
      switch (structure.type) {
        case "town": {
          const pos = calculateTown(structure, refs[structure.id]!);
          structure.setPos(pos);
          break;
        }

        case "road": {
          const pos = calculateRoad(structure, refs[structure.id]!);
          structure.setPos(pos);
          break;
        }
      }
    });

    state.harbors.forEach((harbor) => {
      const pos = calculateHarbor(harbor, refs);
      harbor.setPos(pos);
    });

    console.timeEnd("calculations");
  }

  function endTurn() {
    batch(() => {
      if (state.game.phase === "setup") {
        if (!state.game.turn.road || !state.game.turn.town) return;

        build(state.game.turn.town);
        build(state.game.turn.road);

        if (
          state.game.turn.player === 0 &&
          state.game.turn.order === "second" &&
          state.game.turn.road &&
          state.game.turn.town
        ) {
          setState("game", {
            phase: "game",
            turn: {
              player: state.game.turn.player,
              rolledProduction: false,
              playedDevelopmentCard: false
            }
          });
          return;
        }

        const isLastPlayer = state.game.turn.player === state.game.players.length - 1;
        if (isLastPlayer && state.game.turn.order === "first") {
          setState("game", "turn", { order: "second", town: null, road: null });
          return;
        }

        return batch(() => {
          setState("game", "turn", (turn) => ({
            player: turn.order === "first" ? turn.player + 1 : turn.player - 1,
            town: null,
            road: null
          }));
        });
      }

      setState("game", "turn", "player", nextPlayerIdx());
    });
  }

  onMount(() => recalculate());

  createEffect(() => {
    const lastRoll = state.game.rolls?.at(-1)?.roll;
    if (!lastRoll) return;

    playersResourceSummary().forEach((player, playerIdx) => {
      if (!player[lastRoll]) return;
      const newResources = player[lastRoll]!;
      state.game.players[playerIdx]!.setResources((resources) => ({
        brick: resources.brick + newResources.brick,
        lumber: resources.lumber + newResources.lumber,
        ore: resources.ore + newResources.ore,
        grain: resources.grain + newResources.grain,
        wool: resources.wool + newResources.wool
      }));
    });
  });

  // [clip-path:_polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]
  return (
    <div class="flex h-full w-full flex-col justify-between">
      <div
        class="flex h-full w-full flex-col items-center justify-center"
        style={{
          background: "radial-gradient(closest-side, #fde68a 40%, #60a5fa 60%, #2463eb 100%)"
        }}
      >
        <div class="relative flex flex-col flex-wrap items-center justify-center p-[5rem]">
          <For each={state.hexes.layout}>
            {(hexRow) => (
              <div class="flex">
                <For each={hexRow}>
                  {(hex) => (
                    <Hexagon
                      debug={debug()}
                      {...hex}
                      ref={refs[hex.id]}
                      onNeighbourHover={(id, hovered) => state.hexes.byId[id]!.setHovered(hovered)}
                    />
                  )}
                </For>
              </div>
            )}
          </For>

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
                            return setState("game", "turn", {
                              town: state.game.turn.town === town() ? null : town(),
                              road: state.game.turn.town ? null : state.game.turn.road
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
                            return setState("game", "turn", {
                              road: state.game.turn.road ? null : road()
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

          <For each={state.harbors}>
            {(harbor) => (
              <>
                <Dock ref={refs[harbor.dockIds[0]]!} pos={harbor.pos().dock1} />
                <Dock ref={refs[harbor.dockIds[1]]!} pos={harbor.pos().dock2} />
                <Harbor
                  debug={debug()}
                  {...harbor}
                  ref={refs[harbor.id]!}
                  dock1Ref={refs[harbor.dockIds[0]]!}
                  dock2Ref={refs[harbor.dockIds[1]]!}
                />
              </>
            )}
          </For>
        </div>
      </div>

      <Interface
        state={state}
        currentPlayer={currentPlayer()}
        endTurn={endTurn}
        roll={roll}
        currentPlayerStats={currentPlayerStats()}
      />
    </div>
  );
}
