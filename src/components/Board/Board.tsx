import Interface from "@/components/Interface/Interface";
import { refs, state } from "@/state";
import {
  calculateHarbor,
  calculateHex,
  calculateRoad,
  calculateRobber,
  calculateTown
} from "@/utils/calculations";
import { onMount } from "solid-js";
import Robber from "../Robber/Robber";
import Harbors from "./Harbors";
import Hexes from "./Hexes";
import Structures from "./Structures";

export default function Board() {
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

    state.harbors.array.forEach((harbor) => {
      const pos = calculateHarbor(harbor, refs);
      harbor.setPos(pos);
    });

    const pos = calculateRobber(state.robber, refs);
    state.robber.setPos(pos);

    console.timeEnd("calculations");
  }

  onMount(() => {
    recalculate();
  });

  // [clip-path:_polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]
  return (
    <div class="grid h-full max-h-full w-full grid-cols-1 grid-rows-[1fr_auto] flex-col justify-between gap-8">
      <div
        class="flex h-full w-full flex-col items-center justify-center"
        style={{ background: "radial-gradient(closest-side, #60a5fa 60%, #2463eb 100%)" }}
      >
        <div class="relative flex flex-col flex-wrap items-center justify-center p-[5rem]">
          <Hexes />
          <Structures />
          <Harbors />
          <Robber />
        </div>
      </div>

      <Interface />
    </div>
  );
}
