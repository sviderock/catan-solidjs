import { createMemo } from "solid-js";
import { usePlayer } from "./use_player";
import { useResources } from "./use_resources";
import { Limit } from "../constants";

export default function useStructures(state: State) {
  const { currentPlayer, stats } = usePlayer(state);
  const { haveResourcesFor } = useResources(state);

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

  const buildableStructures = createMemo(() => {
    const { turn } = state.game;

    if (state.game.phase === "setup") {
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

  const townHarbors = createMemo(() =>
    state.harbors.reduce<{ [townId: TownId]: Harbor }>((acc, harbor) => {
      harbor.towns.forEach((town) => (acc[town.id] = harbor));
      return acc;
    }, {})
  );

  function harbor(id: TownId) {
    return townHarbors()[id];
  }

  return {
    occupiedStructures,
    occupied,
    occupiedBy,

    disabledStructures,
    disabled,

    buildableStructures,
    buildableStructureIds,
    canBuild,

    townHarbors,
    harbor
  };
}
