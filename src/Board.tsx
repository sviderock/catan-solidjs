import { For, Match, Show, Switch, batch, createMemo, createSignal, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { Portal } from "solid-js/web";
import Hexagon from "./Hexagon";
import Road from "./Road";
import Stats from "./Stats";
import Town from "./Town";
import { Limit } from "./constants";
import { calculateHex, calculateRoad, calculateTown } from "./utils/calculations";
import { getInitialState } from "./utils/state";
import { matches } from "./utils/utils";
import Die from "./Die";

export default function Board() {
  const refs = {} as Record<Hex["id"] | Structure["id"], HTMLDivElement | undefined>;
  const [state, setState] = createStore(getInitialState());
  const [disableTowns, setDisableTowns] = createSignal(false);

  const occupiedStructuresByPlayer = createMemo(() => {
    return state.game.players.map((player) => [...player.roads(), ...player.towns()]);
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
    if (disableTowns()) {
      return state.structures.array
        .filter((s): s is Town => s.type === "town")
        .filter((town) => !occupied(town.id));
    }

    return occupiedStructuresByPlayer().map((playerStructures) =>
      playerStructures
        .filter((s): s is Town => s.type === "town")
        .flatMap((town) => town.closestTowns)
    );
  });
  const disabledTowns = createMemo(() => disabledTownsByPlayer().flat());
  const disabledTownsIds = createMemo(() => disabledTowns().map((town) => town.id));
  const disabled = (id: Town["id"]) => disabledTownsIds().includes(id);
  const availableStructuresOnSetup = createMemo(() => {
    return state.structures.array.reduce<Structure[]>((acc, s) => {
      if (s.type !== "town") return acc;

      const townOccupied = occupied(s.id);
      const townDisabled = disabled(s.id);
      const roadPlaced = s.roads.some((r) => occupied(r.id));
      if (townOccupied && !roadPlaced) acc.push(...s.roads);
      if (!townOccupied && !townDisabled) acc.push(s);

      return acc;
    }, []);
  });

  const availableStructuresIdsOnSetup = createMemo(() =>
    availableStructuresOnSetup().map((s) => s.id)
  );

  const availableStructuresByPlayer = createMemo(() => {
    return occupiedStructuresByPlayer().map((playerStructures, playerIdx) => {
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
    if (state.game.phase === "setup") return availableStructuresIdsOnSetup().includes(id);
    return availableStructuresIdsByPlayer()[state.game.currentPlayer]!.includes(id);
  };

  const currentPlayer = () => state.game.players[state.game.currentPlayer]!;

  const stats = (): Stats => {
    return state.game.players.map((player) => {
      const roads = player.roads().length;
      const settlements = player.towns().filter((town) => town.level() === "settlement").length;
      const cities = player.towns().filter((town) => town.level() === "city").length;
      const points = settlements + cities * 2;
      return { roads, settlements, cities, points };
    });
  };

  const currentPlayerStats = () => stats()[state.game.currentPlayer]!;

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
    setState("game", (game) => {
      const player = game.players[game.currentPlayer]!;
      const isFirstPlayer = game.currentPlayer === 0;
      const lastPlayer = game.players.length - 1;
      const isLastPlayer = game.currentPlayer === game.players.length - 1;

      if (game.phase === "setup") {
        // last player (but first in order) placed last road
        if (player.roads().length === 2 && isFirstPlayer) {
          return { phase: "game" };
        }

        // placing second road
        if (player.roads().length === 2 && game.currentPlayer <= lastPlayer) {
          return { currentPlayer: game.currentPlayer - 1 };
        }

        // keep turn on last user in order to start placing second settlement
        return { currentPlayer: isLastPlayer ? lastPlayer : game.currentPlayer + 1 };
      }

      return { currentPlayer: isLastPlayer ? 0 : game.currentPlayer + 1 };
    });
  }

  onMount(() => recalculate());

  return (
    <div class="relative flex scale-[1.3] flex-col flex-wrap items-center justify-center bg-[#f6d7b0] p-12 [clip-path:_polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]">
      <For each={state.hexes.layout}>
        {(hexRow) => (
          <div class="-my-[calc(var(--hex-size)/8)] flex">
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
                  available={available(town().id)}
                  player={occupiedBy(town().id)}
                  onClick={() => {
                    batch(() => {
                      if (state.game.phase === "setup") {
                        addTown(town());
                        setDisableTowns(true);
                        return;
                      }

                      const allTownsBuilt = currentPlayerStats().settlements === Limit.Settlements;
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
                  available={available(road().id)}
                  player={occupiedBy(road().id)}
                  onClick={() => {
                    batch(() => {
                      if (state.game.phase === "setup") {
                        addRoad(road());
                        setDisableTowns(false);
                        endTurn();
                        return;
                      }

                      if (occupied(road().id) && occupiedBy(road().id) !== currentPlayer()) return;

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

      <Show when={true}>
        <Portal>
          <div class="fixed right-0 top-0 flex w-[250px] flex-col gap-2 rounded-bl-lg bg-blue-100 p-4 text-[1rem]">
            <div class="flex w-full justify-between">
              <span>Current Player:</span>
              <strong>{currentPlayer()?.name}</strong>
            </div>
            <div class="flex w-full justify-end">
              <button
                type="button"
                onClick={() => endTurn()}
                class="rounded-lg border border-purple-700 px-4 py-1 text-center text-sm font-medium text-purple-700 hover:bg-purple-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-purple-300 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-500 dark:hover:text-white dark:focus:ring-purple-900"
              >
                Next player
              </button>
            </div>
          </div>
        </Portal>
      </Show>

      {/* <Show when={phase() === 'won'}>
        <Portal>
          <div class="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-green-500 text-[3rem]">
            Game won!
          </div>
        </Portal>
      </Show> */}

      <Portal>
        <div class="fixed bottom-[200px] right-[200px]">
          <Die />
        </div>
      </Portal>
    </div>
  );
}
