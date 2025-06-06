import { PlayerColours } from "@/constants";
import { createSignal } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { type GetHexes } from "./get_hexes";
import { type GetStructures } from "./get_structures";

function generatePlayer(idx: number, withResources?: boolean): Player {
  const [towns, setTowns] = createSignal<Town[]>([]);
  const [roads, setRoads] = createSignal<Road[]>([]);
  const [developmentCards, setDevelopmentCards] = createStore<DevelopmentCard[]>([]);
  const [resources, setResources] = createSignal<PlayerResources>({
    brick: withResources ? 3 : 0,
    grain: withResources ? 3 : 0,
    lumber: withResources ? 3 : 0,
    ore: withResources ? 3 : 0,
    wool: withResources ? 3 : 0
  });

  return {
    idx,
    name: `Player ${idx + 1}`,
    color: PlayerColours[idx]!,
    resources,
    setResources,
    towns,
    setTowns,
    roads,
    setRoads,
    developmentCards,
    setDevelopmentCards
  };
}

function generatePlayers(count: number, withResources?: boolean) {
  return Array.from({ length: count }).map((_, idx) => generatePlayer(idx, withResources));
}

function getSetupGame(hexes: GetHexes): SetupPhase {
  return {
    phase: "setup",
    players: generatePlayers(4),
    robber: hexes.desert.id,
    currentPlayer: 0,
    order: "first",
    town: null,
    road: null
  };
}

function getHalfSetup(hexes: GetHexes, structures: GetStructures): SetupPhase {
  const players: Player[] = generatePlayers(4, true);
  const towns = structures.array.filter((s): s is Town => s.type === "town");
  const roads = structures.array.filter((s): s is Road => s.type === "road");

  players[0]!.setTowns([towns[14]!]);
  players[0]!.setRoads([roads[16]!]);
  players[1]!.setTowns([towns[13]!]);
  players[1]!.setRoads([roads[24]!]);
  players[2]!.setTowns([towns[38]!]);
  players[2]!.setRoads([roads[49]!]);
  players[3]!.setTowns([towns[47]!]);
  players[3]!.setRoads([roads[62]!]);

  return {
    phase: "setup",
    players,
    robber: hexes.desert.id,
    currentPlayer: 3,
    order: "second",
    road: null,
    town: null
  };
}

function getStartedGame(hexes: GetHexes): TurnPhase {
  const players: Player[] = generatePlayers(4, true);

  players[0]!.setDevelopmentCards(
    produce((cards) => {
      cards.push(
        { type: "knight", status: "available" },
        { type: "monopoly", status: "available" },
        { type: "road_building", status: "available" },
        { type: "victory_point", status: "available" },
        { type: "year_of_plenty", status: "available" },
        { type: "knight", status: "ready_next_turn" },
        { type: "monopoly", status: "ready_next_turn" },
        { type: "knight", status: "played" }
      );
    })
  );

  return {
    phase: "turn",
    players,
    currentPlayer: 0,
    rolls: [],
    rollStatus: "not_rolled",
    robber: hexes.desert.id,
    playedDevelopmentCard: false
  };
}

export default function getGame(
  hexes: GetHexes,
  structures: GetStructures,
  phase?: "game" | "half"
): SetupPhase | TurnPhase {
  if (phase === "game") return getStartedGame(hexes);
  if (phase === "half") return getHalfSetup(hexes, structures);
  return getSetupGame(hexes);
}
