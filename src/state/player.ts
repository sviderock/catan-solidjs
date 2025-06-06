import { createMemo, createRoot } from "solid-js";
import { state } from "./initial_state";
import { EMPTY_RESOURCES } from "@/constants";

export type Stats = ReturnType<typeof stats>;

export const {
  currentPlayer,
  opponents,
  nextPlayerIdx,
  stats,
  currentPlayerStats,
  playersResourceSummary
} = createRoot(() => {
  const currentPlayer = createMemo(() => state.game.players[state.game.currentPlayer]!);

  const opponents = createMemo(() =>
    state.game.players.filter((_, idx) => idx !== state.game.currentPlayer)
  );

  const nextPlayerIdx = createMemo(() =>
    state.game.currentPlayer === state.game.players.length - 1 ? 0 : state.game.currentPlayer + 1
  );

  const stats = createMemo(() => {
    return state.game.players.map((player) => {
      const roads = player.roads().length;
      const settlements = player.towns().filter((town) => town.level() === "settlement").length;
      const cities = player.towns().filter((town) => town.level() === "city").length;
      const victoryPointsFromDC = player.developmentCards.filter(
        (card) => card.type === "victory_point"
      ).length;
      const points = victoryPointsFromDC + settlements + cities * 2;
      const harbors = player.towns().reduce<Harbor[]>((acc, town) => {
        const harbor = state.harbors.townToHarbor[town.id];
        if (harbor) acc.push(harbor);
        return acc;
      }, []);

      return { roads, settlements, cities, points, player, harbors } as const;
    });
  });

  const currentPlayerStats = createMemo(() => stats()[state.game.currentPlayer]!);

  function countPotentialResources(towns: Town[], playerSummary: PlayerResourceSummary) {
    towns.forEach((town) => {
      town.hexes.forEach(({ hex }) => {
        playerSummary[hex.value] ||= { ...EMPTY_RESOURCES, desert: 0 };
        playerSummary[hex.value]![hex.type] += town.level() === "city" ? 2 : 1;
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

  return { currentPlayer, opponents, nextPlayerIdx, stats, currentPlayerStats, playersResourceSummary };
});
