import { For, Match, Switch, batch, createEffect, createMemo, createSignal, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import Hexagon from "./Hexagon/Hexagon";
import Road from "./Road";
import Stats from "./Stats";
import Town from "./Town";
import { Limit, ResourceIcon } from "./constants";
import { debug } from "./state";
import { calculateHex, calculateRoad, calculateTown } from "./utils/calculations";
import { getInitialState } from "./utils/initial_state";
import { matches, rollDice, shadeHexColor } from "./utils/utils";
import { usePlayer } from "./utils/use_player";
import { useResources } from "./utils/use_resources";

export default function Board() {
  const refs = {} as Record<Hex["id"] | Structure["id"], HTMLDivElement | undefined>;
  const [state, setState] = createStore(getInitialState("game"));
  const [diceRolls, setDiceRolls] = createSignal<Roll[]>([]);
  const { haveResourcesFor } = useResources(state);
  const { currentPlayer, nextPlayerIdx, stats, currentPlayerStats } = usePlayer(state);

  const occupiedStructures = createMemo(() => {
    return state.game.players.reduce(
      (acc, player, playerIdx) => {
        const structures = [...player.roads(), ...player.towns()];

        if (state.game.phase === "setup" && player === currentPlayer()) {
          if (state.game.turn.town) structures.push(state.game.turn.town!);
          if (state.game.turn.road) structures.push(state.game.turn.road!);
        }

        acc.byPlayer[playerIdx] = structures;
        acc.list.push(...structures);
        acc.listByPlayer.push(structures);
        structures.forEach((s) => {
          acc.byId[s.id] = state.game.players[playerIdx]!;
        });

        return acc;
      },
      {
        list: [] as Structure[],
        byPlayer: {} as { [playerIdx: number]: Structure[] },
        listByPlayer: [] as Array<Structure[]>,
        byId: {} as { [structureId: Structure["id"]]: Player }
      }
    );
  });

  function occupied(id: Structure["id"]): boolean {
    return !!occupiedStructures().byId[id];
  }

  function occupiedBy(id: Structure["id"]) {
    return occupiedStructures().byId[id];
  }

  const disabledStructures = createMemo(() => {
    return occupiedStructures().list.reduce(
      (acc, s) => {
        if (s.type === "town") {
          s.closestTowns.forEach((town) => (acc[town.id] = true));
          return acc;
        }

        const myRoad = occupiedBy(s.id) === currentPlayer();
        const occupiedTownNearby = s.towns.find(
          (town) => occupied(town.id) && occupiedBy(town.id) !== currentPlayer()
        );
        const nextRoadsNearOccupiedTown = s.roads.filter(
          (r) => !occupied(r.id) && r.towns.some((t) => t === occupiedTownNearby)
        );

        if (myRoad && nextRoadsNearOccupiedTown.length) {
          nextRoadsNearOccupiedTown.forEach((r) => (acc[r.id] = true));
        }

        return acc;
      },
      {} as { [structureId: Structure["id"]]: boolean }
    );
  });

  function disabled(id: Structure["id"]): boolean {
    return !!disabledStructures()[id];
  }

  function townValue(town: Town) {
    return town.level() === "city" ? 2 : 1;
  }

  function countPotentialResources(towns: Town[], playerSummary: PlayerResourceSummary) {
    towns.forEach((town) => {
      town.hexes.forEach(({ hex }) => {
        playerSummary[hex.value] ||= { brick: 0, grain: 0, desert: 0, lumber: 0, wool: 0, ore: 0 };
        playerSummary[hex.value]![hex.type] += townValue(town);
      });
    });
  }

  const playersResourceSummary = createMemo(() => {
    return state.game.players.reduce<PlayerResourceSummary[]>((acc, player, playerIdx) => {
      acc[playerIdx] ||= {};
      countPotentialResources(player.towns(), acc[playerIdx]!);
      return acc;
    }, []);
  });

  const buildableStructures = createMemo(() => {
    const { phase, turn } = state.game;

    if (phase === "setup") {
      if (turn.town) {
        const roads = turn.road ? [turn.road] : turn.town.roads;
        return [turn.town, ...roads];
      }

      return state.structures.array.reduce<Structure[]>((acc, s) => {
        // No roads are available on setup phase until you place a settlement
        if (s.type === "road") return acc;

        // Skip if trying to place settlement occupied by someone NOT current player
        if (occupiedBy(s.id) && occupiedBy(s.id) !== currentPlayer()) return acc;

        // Skip if trying to place second settlement on the place of the first
        if (occupiedBy(s.id) === currentPlayer() && state.game.turn.order === "second") return acc;

        // Skip if town is disabled due to 2-roads distance rule
        if (disabled(s.id)) return acc;

        acc.push(s);
        return acc;
      }, []);
    }

    return occupiedStructures().byPlayer[turn.player]!.flatMap((s) => {
      const structures: Structure[] = [];

      const noMoreRoads = stats()[turn.player]!.roads === Limit.Roads;
      if (!noMoreRoads && haveResourcesFor("road")) {
        const roads = noMoreRoads
          ? []
          : s.roads.filter((road) => !occupied(road.id) && !disabled(road.id));
        structures.push(...roads);
      }

      const noMoreSettlements = stats()[turn.player]!.settlements === Limit.Settlements;
      if (!noMoreSettlements && haveResourcesFor("settlement")) {
        const towns =
          noMoreSettlements || !s.towns
            ? []
            : s.towns.filter((road) => !occupied(road.id) && !disabled(road.id));
        structures.push(...towns);
      }

      if (s.type === "town" && s.level() === "settlement" && haveResourcesFor("city")) {
        structures.push(s);
      }

      return structures;
    });
  });

  const buildableStructureIds = createMemo(() => buildableStructures().map((s) => s.id));

  function canBuild(s: Structure): boolean {
    return buildableStructureIds().includes(s.id);
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

  createEffect(() => {
    const lastRoll = diceRolls().at(-1);
    if (!lastRoll) return;

    playersResourceSummary().forEach((player, playerIdx) => {
      if (!player[lastRoll.roll]) return;

      const newResources = player[lastRoll.roll]!;
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
          background: "radial-gradient(closest-side, #fde68a 40%, #60a5fa 65%, #2463eb 100%)"
        }}
      >
        <div class="relative flex scale-[1] flex-col flex-wrap items-center justify-center">
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
                      onClick={() => {
                        batch(() => {
                          if (state.game.phase === "setup") {
                            return setState("game", "turn", {
                              town: state.game.turn.town === town() ? null : town(),
                              road: state.game.turn.town ? null : state.game.turn.road
                            });
                          }

                          const canBuildCity =
                            occupiedBy(town().id) === currentPlayer() &&
                            town().level() === "settlement" &&
                            currentPlayerStats().cities < Limit.Cities;

                          if (canBuildCity) {
                            town().setLevel(() => "city");
                            return;
                          }

                          if (!occupied(town().id)) {
                            build(town());
                          }
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
                        // if (!unoccupied(road().id)) return;
                        // if (state.game.phase === "game" && occupied(road().id)) return;
                        // if (occupiedBy(road().id) && currentPlayer() !== occupiedBy(road().id)) return;

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
        </div>
      </div>

      <div class="flex justify-between bg-dark">
        <div>
          <div class="flex flex-col gap-4 rounded-tl-lg bg-dark p-4 text-[1rem] text-blue-100">
            <div class="flex flex-col gap-2">
              <div class="flex w-full justify-between">
                <span>Current Player:</span>
                <strong style={{ color: currentPlayer().color }}>{currentPlayer().name}</strong>
              </div>

              <Switch>
                <Match when={matches(state.game, (game): game is SetupPhase => game.phase === "setup")}>
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
                <Match when={matches(state.game, (game): game is GamePhase => game.phase === "game")}>
                  {(game) => (
                    <div class="flex flex-col gap-4">
                      <div class="flex flex-col gap-1 divide-y rounded-sm border bg-gray-800 px-4 py-1">
                        <span class="text-[1.2rem]">Building Costs</span>
                        <div class="flex items-center justify-between py-1">
                          <span>Road</span>
                          <span>
                            {ResourceIcon.lumber}
                            {ResourceIcon.brick}
                          </span>
                        </div>
                        <div class="flex items-center justify-between py-1">
                          <span>Settlement</span>
                          <span>
                            {ResourceIcon.lumber}
                            {ResourceIcon.brick}
                            {ResourceIcon.grain}
                            {ResourceIcon.wool}
                          </span>
                        </div>
                        <div class="flex items-center justify-between py-1">
                          <span>City</span>
                          <span>
                            {ResourceIcon.grain}
                            {ResourceIcon.grain}
                            {ResourceIcon.ore}
                            {ResourceIcon.ore}
                            {ResourceIcon.ore}
                          </span>
                        </div>
                        <div class="flex items-center justify-between py-1">
                          <span>Development Card</span>
                          <span>
                            {ResourceIcon.grain}
                            {ResourceIcon.wool}
                            {ResourceIcon.ore}
                          </span>
                        </div>
                      </div>

                      <div class="flex justify-between gap-2">
                        <button
                          class="rounded-lg border px-4 py-1"
                          onClick={() => {
                            setDiceRolls((rolls) => [...rolls, rollDice(rolls.at(-1)?.roll)]);
                          }}
                        >
                          Roll Dice: <strong>{diceRolls().at(-1)?.roll}</strong>
                        </button>

                        <button
                          type="button"
                          onClick={() => endTurn()}
                          style={{
                            "--color": currentPlayer().color,
                            "--color-hover": shadeHexColor(currentPlayer().color, -0.25)
                          }}
                          class="rounded-lg border border-[--color] bg-[--color] px-4 py-1 text-center text-sm font-medium text-blue-100 transition-colors hover:border-[color:--color-hover] hover:bg-[--color-hover] hover:text-white disabled:pointer-events-none disabled:bg-[--color-hover] disabled:opacity-25"
                        >
                          End Turn
                        </button>
                      </div>
                    </div>
                  )}
                </Match>
              </Switch>
            </div>
          </div>
        </div>

        <Stats stats={stats()} />
      </div>
    </div>
  );
}
