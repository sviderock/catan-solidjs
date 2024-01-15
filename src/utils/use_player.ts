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

  return { currentPlayer, nextPlayerIdx, stats, currentPlayerStats };
}
