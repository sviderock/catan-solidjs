import { For, Match, Switch, batch, createEffect, createMemo, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import Hexagon from "./Hexagon";
import Road from "./Road";
import Stats from "./Stats";
import Town from "./Town";
import { calculateHex, calculateRoad, calculateTown } from "./utils/calculations";
import { getInitialState } from "./utils/state";
import { matches } from "./utils/utils";
import { Limit } from "./constants";

export default function Board() {
  const refs = {} as Record<Hex["id"] | Structure["id"], HTMLDivElement | undefined>;
  const [state] = createStore(getInitialState());

  const points = () => {
    return state.structures.array
      .filter((s): s is Town => s.active() && s.type === "town")
      .reduce((acc, s) => {
        acc += s.level() === "city" ? 2 : 1;
        return acc;
      }, 0);
  };

  const stats = () => {
    return state.structures.array.reduce(
      (acc, structure) => {
        if (!structure.active()) return acc;

        const type: keyof Stats =
          structure.type === "town"
            ? structure.level() === "city"
              ? "cities"
              : "settlements"
            : "roads";

        acc[type] += 1;
        return acc;
      },
      { roads: 0, cities: 0, settlements: 0 } as Stats
    );
  };

  const phase = createMemo(() => {
    if (stats().settlements < 2 || stats().roads < 2) {
      return "setup";
    }

    if (points() >= 10) {
      return "won";
    }

    return "game";
  });

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

  function toggleRoadAvailable(road: Road) {
    if (!road.active() && stats().roads === Limit.Roads) {
      road.setAvailable(false);
      return;
    }

    road.setAvailable(true);
  }

  function toggleTownAvailable(town: Town) {
    if (!town.active() && stats().settlements === Limit.Settlements) {
      town.setAvailable(false);
      return;
    }

    if (!town.disabled()) {
      town.setAvailable(true);
    }
  }

  onMount(() => {
    console.log(state);
    recalculate();
  });

  createEffect(() => {
    if (phase() === "setup") {
      console.time("setup");

      if (stats().settlements === 0 && stats().roads === 0) {
        state.structures.array.forEach((structure) => {
          if (structure.type === "town") structure.setAvailable(true);
        });
      }

      if (stats().settlements === 1 && stats().roads === 0) {
        state.structures.array.forEach((structure) => {
          if (!structure.active()) {
            structure.setAvailable(false);
          }
        });
        state.structures.array
          .reduce<Structure[]>((acc, structure) => {
            if (structure.active()) acc.push(structure);
            return acc;
          }, [])
          .forEach((structure) => {
            if (structure.type === "town") {
              structure.closestTowns.forEach((closeTown) => closeTown.setDisabled(true));
              structure.roads.forEach((road) => road.setAvailable(true));
              return;
            }
          });
      }

      if (stats().settlements === 1 && stats().roads === 1) {
        state.structures.array.forEach((structure) => {
          if (structure.type === "town" && !structure.active() && !structure.disabled()) {
            structure.setAvailable(true);
            return;
          }

          if (structure.type === "road" && !structure.active()) {
            structure.setAvailable(false);
          }
        });
      }

      if (stats().settlements === 2 && stats().roads === 1) {
        state.structures.array.forEach((structure) => {
          if (structure.type === "town") {
            if (!structure.active()) {
              structure.setAvailable(false);
              return;
            }

            structure.closestTowns.forEach((closeTown) => closeTown.setDisabled(true));
            if (structure.roads.some((road) => road.active())) {
              return;
            }

            structure.roads.forEach((road) => road.setAvailable(true));
          }
        });
      }

      console.timeEnd("setup");
      return;
    }

    if (phase() === "game") {
      console.time("game");
      state.structures.array
        .reduce<Structure[]>((acc, structure) => {
          if (structure.active()) acc.push(structure);
          return acc;
        }, [])
        .forEach((structure) => {
          if (structure.type === "town") {
            structure.closestTowns.forEach((closeTown) => closeTown.setDisabled(true));
            structure.roads.forEach(toggleRoadAvailable);
            return;
          }

          structure.roads.forEach(toggleRoadAvailable);
          structure.towns.forEach(toggleTownAvailable);
        });

      console.timeEnd("game");
      return;
    }

    // state.structures.array.forEach((structure) => {
    //   if (structure.type === "town" && structure.active()) {
    //     structure.closestTowns.forEach((closeTown) => closeTown.setDisabled(true));
    //     structure.roads.forEach((road) => road.setAvailable(true));
    //   }
    // });
  });

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
                  game={stats()}
                  ref={refs[town().id]!}
                  onClick={() => {
                    if (!town().available() || town().disabled()) return;

                    batch(() => {
                      const allTownsBuilt = stats().settlements === Limit.Settlements;
                      const canBuildCity =
                        town().active() &&
                        town().level() === "settlement" &&
                        stats().cities < Limit.Cities;

                      if (canBuildCity) {
                        town().setLevel(() => "city");
                        return;
                      }

                      if (allTownsBuilt) {
                        return;
                      }

                      if (!town().active()) {
                        town().setActive(true);
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
                  onClick={() => {
                    if (!road().available() || road().active()) return;
                    if (stats().roads === Limit.Roads) return;
                    road().setActive(true);
                  }}
                />
              )}
            </Match>
          </Switch>
        )}
      </For>

      <Stats {...stats()} points={points()} />

      {/* <Show when={phase() === 'won'}>
        <Portal>
          <div class="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-green-500 text-[3rem]">
            Game won!
          </div>
        </Portal>
      </Show> */}
    </div>
  );
}
