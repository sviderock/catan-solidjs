import { createRoot } from "solid-js";
import { currentPlayer } from "./player";

export const { haveResourcesFor } = createRoot(() => {
  function haveResourcesForRoad(resources: PlayerResources): boolean {
    return resources.brick >= 1 && resources.lumber >= 1;
  }

  function haveResourcesForSettlement(resources: PlayerResources): boolean {
    return resources.brick >= 1 && resources.lumber >= 1 && resources.wool >= 1 && resources.grain >= 1;
  }

  function haveResourcesForCity(resources: PlayerResources): boolean {
    return resources.grain >= 2 && resources.ore >= 3;
  }

  function haveResourcesForTown(resources: PlayerResources): boolean {
    return haveResourcesForSettlement(resources) || haveResourcesForCity(resources);
  }

  function haveResourcesFormDC(resources: PlayerResources): boolean {
    return resources.wool >= 1 && resources.grain >= 1 && resources.ore >= 1;
  }

  function haveResourcesFor(type: Structure["type"] | TownLevel | "development_card"): boolean {
    switch (type) {
      case "road":
        return haveResourcesForRoad(currentPlayer().resources());

      case "settlement":
        return haveResourcesForSettlement(currentPlayer().resources());

      case "city":
        return haveResourcesForCity(currentPlayer().resources());

      case "town":
        return haveResourcesForTown(currentPlayer().resources());

      case "development_card":
        return haveResourcesFormDC(currentPlayer().resources());
    }
  }

  return { haveResourcesFor };
});
