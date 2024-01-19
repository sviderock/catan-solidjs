import { createMemo } from "solid-js";

export function usePlayer(state: State) {
  const currentPlayer = createMemo(() => state.game.players[state.game.turn.player]!);

  const nextPlayerIdx = createMemo(() =>
    state.game.turn.player === state.game.players.length - 1 ? 0 : state.game.turn.player + 1
  );

  const stats = createMemo((): Stats => {
    return state.game.players.map((player) => {
      const roads = player.roads().length;
      const settlements = player.towns().filter((town) => town.level() === "settlement").length;
      const cities = player.towns().filter((town) => town.level() === "city").length;
      const points = settlements + cities * 2;
      return { roads, settlements, cities, points, player };
    });
  });

  const currentPlayerStats = createMemo(() => stats()[state.game.turn.player]!);

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

  return { currentPlayer, nextPlayerIdx, stats, currentPlayerStats, playersResourceSummary };
}
