import { PlayerColours } from "@/constants";
import { createSignal } from "solid-js";
import { type GetStructures } from "./get_structures";
import { type GetHexes } from "./get_hexes";

export default function getGame(
  hexes: GetHexes,
  structures: GetStructures,
  phase?: "game" | "half"
): SetupPhase | TurnPhase {
  if (phase === "game") return getStartedGame(hexes, structures);
  if (phase === "half") return getHalfSetup(hexes, structures);
  return getSetupGame(hexes);
}

function generatePlayer(idx: number, withResources?: boolean): Player {
  const [towns, setTowns] = createSignal<Town[]>([]);
  const [roads, setRoads] = createSignal<Road[]>([]);
  const [resources, setResources] = createSignal<PlayerResources>({
    brick: withResources ? 99 : 0,
    grain: withResources ? 99 : 0,
    lumber: withResources ? 99 : 0,
    ore: withResources ? 99 : 0,
    wool: withResources ? 99 : 0
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
    developmentCards: []
  };
}

function generatePlayers(count: number, withResources?: boolean) {
  return new Array(count).fill(undefined).map((_, idx) => generatePlayer(idx, withResources));
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

function getStartedGame(hexes: GetHexes, structures: GetStructures): TurnPhase {
  const players: Player[] = generatePlayers(4, true);
  const towns = structures.array.filter((s): s is Town => s.type === "town");
  const roads = structures.array.filter((s): s is Road => s.type === "road");

  players[0]!.setTowns([towns[14]!, towns[9]!]);
  players[0]!.setRoads([roads[16]!, roads[9]!]);
  players[1]!.setTowns([towns[13]!, towns[34]!]);
  players[1]!.setRoads([roads[24]!, roads[43]!]);
  players[2]!.setTowns([towns[38]!, towns[25]!]);
  players[2]!.setRoads([roads[49]!, roads[31]!]);
  players[3]!.setTowns([towns[47]!, towns[21]!]);
  players[3]!.setRoads([roads[62]!, roads[39]!]);

  return {
    phase: "turn",
    players,
    currentPlayer: 0,
    rolls: [],
    rollStatus: "not_rolled",
    playedDevelopmentCard: false,
    robber: hexes.desert.id
  };
}
