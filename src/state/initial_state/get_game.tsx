import { PlayerColours } from "@/constants";
import { createSignal } from "solid-js";
import { type GetStructures } from "./get_structures";

export default function getGame(structures: GetStructures, phase?: "game" | "half") {
  if (phase === "game") return getStartedGame(structures);
  if (phase === "half") return getHalfSetup(structures);
  return getSetupGame();
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

function getSetupGame(): SetupPhase {
  return {
    phase: "setup",
    players: generatePlayers(4),
    turn: {
      order: "first",
      player: 0,
      town: null,
      road: null
    }
  };
}

function getHalfSetup(structures: GetStructures): SetupPhase {
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
    turn: {
      player: 3,
      order: "second",
      road: null,
      town: null
    }
  };
}

function getStartedGame(structures: GetStructures): State["game"] {
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
    phase: "game",
    rolls: [],
    players,
    turn: {
      player: 0,
      rolledProduction: false,
      playedDevelopmentCard: false
    }
  };
}
