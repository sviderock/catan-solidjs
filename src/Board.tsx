import { For, Match, Switch, batch, createEffect, createMemo, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { Portal } from "solid-js/web";
import Hexagon from "./Hexagon/Hexagon";
import Road from "./Road";
import Stats from "./Stats";
import Town from "./Town";
import { Limit } from "./constants";
import { calculateHex, calculateRoad, calculateTown } from "./utils/calculations";
import { getInitialState } from "./utils/initial_state";
import { matches, shadeHexColor } from "./utils/utils";

export default function Board() {
  const refs = {} as Record<Hex["id"] | Structure["id"], HTMLDivElement | undefined>;
  const [state, setState] = createStore(getInitialState({ phase: "game" }));

  const currentPlayer = () => state.game.players[state.game.turn.player]!;

  const stats = createMemo((): Stats => {
    return state.game.players.map((player) => {
      const roads = player.roads().length;
      const settlements = player.towns().filter((town) => town.level() === "settlement").length;
      const cities = player.towns().filter((town) => town.level() === "city").length;
      const points = settlements + cities * 2;
      return { roads, settlements, cities, points, player };
    });
  });

  const occupiedStructuresByPlayer = createMemo(() => {
    return state.game.players.map((player) => {
      const structures = [...player.roads(), ...player.towns()];

      if (state.game.phase === "setup" && player === currentPlayer()) {
        if (state.game.turn.town) structures.push(state.game.turn.town!);
        if (state.game.turn.road) structures.push(state.game.turn.road!);
      }

      return structures;
    });
  });

  const occupiedStructures = createMemo(() => occupiedStructuresByPlayer().flat());
  const occupiedStructuresIds = createMemo(() => occupiedStructures().map((s) => s.id));
  const occupied = (id: Structure["id"]) => occupiedStructuresIds().includes(id);
  const occupiedMap = createMemo(() => {
    return occupiedStructuresByPlayer().reduce<{ [structureId: Structure["id"]]: Player }>(
      (acc, playerStructures, idx) => {
        playerStructures.forEach((s) => {
          acc[s.id] = state.game.players[idx]!;
        });
        return acc;
      },
      {}
    );
  });

  const occupiedBy = (id: Structure["id"]) => occupiedMap()[id];

  const disabledTownsByPlayer = createMemo(() => {
    // if (state.game.phase === "setup") {
    //   if(state.game.turn.town && !state.game.turn.road) {
    //     return state.structures.array
    //     .filter((s): s is Town => s.type === "town")
    //     .filter((town) => !occupied(town.id));
    //   }

    //   return []
    // }

    return occupiedStructuresByPlayer().map((playerStructures) =>
      playerStructures
        .filter((s): s is Town => s.type === "town")
        .flatMap((town) => town.closestTowns)
    );
  });
  const disabledTowns = createMemo(() => disabledTownsByPlayer().flat());
  const disabledTownsIds = createMemo(() => disabledTowns().map((town) => town.id));
  const disabled = (id: Town["id"]) => disabledTownsIds().includes(id);

  const availableStructuresByPlayer = createMemo(() => {
    const { phase, turn } = state.game;

    return occupiedStructuresByPlayer().map((playerStructures, playerIdx) => {
      if (phase === "setup") {
        if (turn.town) {
          const roads = turn.road ? [turn.road] : turn.town.roads;
          return [turn.town, ...roads];
        }

        return state.structures.array.reduce<Structure[]>((acc, s) => {
          if (s.type !== "town") return acc;
          if (occupiedBy(s.id) && occupiedBy(s.id) !== currentPlayer()) return acc;
          if (disabled(s.id)) return acc;

          acc.push(s);
          return acc;
        }, []);
      }

      return playerStructures.flatMap((s) => {
        const noMoreRoads = stats()[playerIdx]!.roads === Limit.Roads;
        const noMoreSettlements = stats()[playerIdx]!.settlements === Limit.Settlements;
        const roads = noMoreRoads ? [] : s.roads.filter((road) => !occupied(road.id));
        const towns =
          noMoreSettlements || !s.towns
            ? []
            : s.towns?.filter((road) => !occupied(road.id) && !disabled(road.id));
        return [...roads, ...towns];
      });
    });
  });

  const availableStructuresIdsByPlayer = createMemo(() =>
    availableStructuresByPlayer().map((playerStructures) => playerStructures.map((s) => s.id))
  );

  const available = (id: Structure["id"]) => {
    return (
      availableStructuresIdsByPlayer()[state.game.turn.player]!.includes(id) ||
      occupiedBy(id) === currentPlayer()
    );
  };

  const nextPlayerIdx = createMemo(() =>
    state.game.turn.player === state.game.players.length - 1 ? 0 : state.game.turn.player + 1
  );

  const currentPlayerStats = () => stats()[state.game.turn.player]!;

  function addTown(town: Town) {
    currentPlayer().setTowns([...currentPlayer().towns(), town]);
  }

  function addRoad(road: Road) {
    currentPlayer().setRoads([...currentPlayer().roads(), road]);
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
    console.timeEnd("calculations");
  }

  function endTurn() {
    batch(() => {
      if (state.game.phase === "setup") {
        if (!state.game.turn.road || !state.game.turn.town) return;

        currentPlayer().setTowns((towns) => [...towns, state.game.turn.town!]);
        currentPlayer().setRoads((roads) => [...roads, state.game.turn.road!]);

        if (
          state.game.turn.player === 0 &&
          state.game.turn.order === "second" &&
          state.game.turn.road &&
          state.game.turn.town
        ) {
          setState("game", { phase: "game", turn: { player: state.game.turn.player } });
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

  // [clip-path:_polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]
  return (
    <div
      class="flex h-full w-full items-center justify-center"
      style={{
        background: "radial-gradient(closest-side, #fde68a 40%, #60a5fa 65%, #2463eb 100%)"
      }}
    >
      <div class="relative flex scale-[1] flex-col flex-wrap items-center justify-center ">
        <For each={state.hexes.layout}>
          {(hexRow) => (
            <div class="flex">
              <For each={hexRow}>
                {(hex) => (
                  <Hexagon
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
                    {...town()}
                    ref={refs[town().id]!}
                    unoccupied={available(town().id)}
                    player={occupiedBy(town().id)}
                    onClick={() => {
                      if (!available(town().id)) return;

                      batch(() => {
                        if (state.game.phase === "setup") {
                          return setState("game", "turn", {
                            town: state.game.turn.town === town() ? null : town(),
                            road: state.game.turn.town ? null : state.game.turn.road
                          });
                        }

                        const allTownsBuilt =
                          currentPlayerStats().settlements === Limit.Settlements;
                        const canBuildCity =
                          occupiedBy(town().id) === currentPlayer() &&
                          town().level() === "settlement" &&
                          currentPlayerStats().cities < Limit.Cities;

                        if (canBuildCity) {
                          town().setLevel(() => "city");
                          return;
                        }

                        if (allTownsBuilt) {
                          return;
                        }

                        if (!occupied(town().id)) {
                          addTown(town());
                        }
                      });
                    }}
                  />
                )}
              </Match>

              <Match when={matches(structure, (s): s is Road => s.type === "road")}>
                {(road) => (
                  <Road
                    {...road()}
                    ref={refs[road().id]!}
                    unoccupied={available(road().id)}
                    player={occupiedBy(road().id)}
                    onClick={() => {
                      if (!available(road().id)) return;
                      if (occupiedBy(road().id) && currentPlayer() !== occupiedBy(road().id))
                        return;

                      batch(() => {
                        if (state.game.phase === "setup") {
                          return setState("game", "turn", {
                            road: state.game.turn.road ? null : road()
                          });
                        }

                        if (occupied(road().id) && occupiedBy(road().id) !== currentPlayer())
                          return;

                        if (currentPlayerStats().roads === Limit.Roads) return;
                        addRoad(road());
                      });
                    }}
                  />
                )}
              </Match>
            </Switch>
          )}
        </For>

        <Stats stats={stats()} />

        <Portal>
          <div class="fixed bottom-0 right-0 flex w-[250px] flex-col gap-4 rounded-tl-lg bg-dark p-4 text-[1rem] text-blue-100">
            <div class="flex flex-col gap-2">
              <div class="flex w-full justify-between">
                <span>Current Player:</span>
                <strong style={{ color: currentPlayer().color }}>{currentPlayer().name}</strong>
              </div>

              <Switch>
                <Match
                  when={matches(state.game, (game): game is SetupPhase => game.phase === "setup")}
                >
                  {(game) => (
                    <>
                      <div class="flex flex-col">
                        <span>
                          Town Placed: <strong>{game().turn.town ? "Yes" : "No"}</strong>
                        </span>
                        <span>
                          Road Placed: <strong>{game().turn.road ? "Yes" : "No"}</strong>
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={!game().turn.town || !game().turn.road}
                        onClick={() => endTurn()}
                        style={{
                          "--color": currentPlayer().color,
                          "--color-hover": shadeHexColor(currentPlayer().color, -0.25)
                        }}
                        class="w-full rounded-lg border border-[--color] bg-[--color] px-4 py-1 text-center text-sm font-medium text-blue-100 transition-colors hover:border-[color:--color-hover] hover:bg-[--color-hover] hover:text-white disabled:pointer-events-none disabled:bg-[--color-hover] disabled:opacity-25"
                      >
                        End Turn
                      </button>
                    </>
                  )}
                </Match>
                <Match
                  when={matches(state.game, (game): game is GamePhase => game.phase === "game")}
                >
                  {(game) => (
                    <div>
                      <button
                        type="button"
                        disabled={!game().turn.town || !game().turn.road}
                        onClick={() => endTurn()}
                        style={{
                          "--color": currentPlayer().color,
                          "--color-hover": shadeHexColor(currentPlayer().color, -0.25)
                        }}
                        class="w-full rounded-lg border border-[--color] bg-[--color] px-4 py-1 text-center text-sm font-medium text-blue-100 transition-colors hover:border-[color:--color-hover] hover:bg-[--color-hover] hover:text-white disabled:pointer-events-none disabled:bg-[--color-hover] disabled:opacity-25"
                      >
                        End Turn
                      </button>
                    </div>
                  )}
                </Match>
              </Switch>
            </div>
          </div>
        </Portal>
      </div>
    </div>
  );
}
