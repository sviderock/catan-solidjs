import { ROBBER_ROLL } from "@/constants";
import { rollDice } from "@/utils";
import { batch, createRoot } from "solid-js";
import { produce } from "solid-js/store";
import { setState, state } from "./initial_state";
import { currentPlayer, nextPlayerIdx, playersResourceSummary } from "./player";
import { occupied, occupiedBy } from "./structures";
import { haveResourcesFor } from "@/state/resources";

export const {
  dropResources,
  buyDevelopmentCard,
  build,
  trade,
  exachange,
  endTurn,
  isSetupPhase,
  lastRoll,
  roll,
  playDevelopmentCard
} = createRoot(() => {
  const isSetupPhase = () => state.game.phase === "setup";

  const lastRoll = () => state.game.rolls?.at(-1)?.roll;

  function roll() {
    if (state.game.rollStatus !== "not_rolled") return;
    setState("game", "rollStatus", "rolling");
    setTimeout(() => {
      batch(() => {
        const newRoll = rollDice(state.game.rolls?.at(-1)?.roll);
        const isRobberRoll = newRoll.roll === ROBBER_ROLL;

        setState(
          produce((state) => {
            state.game.rolls?.push(newRoll);
            state.game.rollStatus = "rolled";

            if (isRobberRoll) {
              state.robber.status = "drop_resources";
            }
          })
        );

        if (isRobberRoll) return;
        playersResourceSummary().forEach((player, playerIdx) => {
          if (!player[newRoll.roll]) return;
          const newResources = player[newRoll.roll]!;
          state.game.players[playerIdx]!.setResources((resources) => ({
            brick: resources.brick + newResources.brick,
            lumber: resources.lumber + newResources.lumber,
            ore: resources.ore + newResources.ore,
            grain: resources.grain + newResources.grain,
            wool: resources.wool + newResources.wool
          }));
        });
      });
    }, 1000);
  }

  function calculateResources(player: ResourceExchange): PlayerResources {
    const res = state.game.players[player.idx]!.resources();
    return {
      brick: res.brick + (player.add?.brick || 0) - (player.remove?.brick || 0),
      lumber: res.lumber + (player.add?.lumber || 0) - (player.remove?.lumber || 0),
      wool: res.wool + (player.add?.wool || 0) - (player.remove?.wool || 0),
      grain: res.grain + (player.add?.grain || 0) - (player.remove?.grain || 0),
      ore: res.ore + (player.add?.ore || 0) - (player.remove?.ore || 0)
    };
  }

  function dropResources(resourcesByPlayer: Array<[playerIdx: number, PlayerResources]>) {
    batch(() => {
      resourcesByPlayer.forEach(([playerIdx, resourcesToDrop]) => {
        const newResources = calculateResources({ idx: playerIdx, remove: resourcesToDrop });
        state.game.players[playerIdx]!.setResources(newResources);
      });
    });
  }

  function exachange(players: ResourceExchange[]) {
    batch(() => {
      players.forEach((player) => {
        const newRes = calculateResources(player);
        state.game.players[player.idx]!.setResources(newRes);
      });
    });
  }

  function trade<T extends Partial<PlayerResources>>(playerIdx: number, trade: { give: T; take: T }) {
    batch(() => {
      const newRes = calculateResources({
        idx: currentPlayer().idx,
        add: trade.take,
        remove: trade.give
      });
      currentPlayer().setResources(newRes);

      const newOpponentRes = calculateResources({
        idx: playerIdx,
        add: trade.give,
        remove: trade.take
      });
      state.game.players[playerIdx]!.setResources(newOpponentRes);
    });
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
        s.setLevel(() => "city");
        currentPlayer().setResources((resources) => ({
          ...resources,
          grain: resources.grain - 2,
          ore: resources.ore - 3
        }));
      }
    });
  }

  function buyDevelopmentCard() {
    if (!haveResourcesFor("development_card")) return;
    batch(() => {
      let card: DevelopmentCard | undefined;
      setState(
        "developmentCards",
        produce((cards) => {
          card = cards.pop();
        })
      );

      if (!card) return;

      currentPlayer().setResources((resources) => ({
        ...resources,
        wool: resources.wool - 1,
        grain: resources.grain - 1,
        ore: resources.ore - 1
      }));
      currentPlayer().setDevelopmentCards((cards) => [
        ...cards,
        { type: card!.type, status: card!.type === "victory_point" ? "played" : "ready_next_turn" }
      ]);
    });
  }

  function playDevelopmentCard(type: PlayableDevelopmentCard["type"]) {
    batch(() => {
      currentPlayer().setDevelopmentCards(
        produce((cards) => {
          const card = cards.find((c) => c.type === type && c.status === "available");
          if (card) card.status = "played";
        })
      );
      setState(
        produce((state) => {
          state.game.playedDevelopmentCard = type;
        })
      );
    });
  }

  function endTurn() {
    if (state.game.rollStatus !== "rolled") return;

    batch(() => {
      if (state.game.phase === "setup") {
        if (!state.game.road || !state.game.town) return;

        build(state.game.town);
        build(state.game.road);

        const setupFinished =
          state.game.order === "second" &&
          state.game.currentPlayer === 0 &&
          state.game.road &&
          state.game.town;

        if (setupFinished) {
          setState("game", (game) => ({
            phase: "turn",
            players: game.players,
            currentPlayer: game.currentPlayer,
            rolls: [],
            rollStatus: "not_rolled",
            playedDevelopmentCard: false,
            robber: state.hexes.desert.id,
            order: undefined,
            town: undefined,
            road: undefined
          }));
          return;
        }

        const isLastPlayer = state.game.currentPlayer === state.game.players.length - 1;
        if (isLastPlayer && state.game.order === "first") {
          setState("game", { order: "second", town: null, road: null });
          return;
        }

        setState("game", (game) => ({
          player: game.order === "first" ? game.currentPlayer + 1 : game.currentPlayer - 1,
          town: null,
          road: null
        }));
        return;
      }

      setState("game", {
        currentPlayer: nextPlayerIdx(),
        rollStatus: "not_rolled",
        playedDevelopmentCard: false
      });
    });
  }

  return {
    dropResources,
    buyDevelopmentCard,
    build,
    trade,
    exachange,
    endTurn,
    isSetupPhase,
    lastRoll,
    roll,
    playDevelopmentCard
  };
});
