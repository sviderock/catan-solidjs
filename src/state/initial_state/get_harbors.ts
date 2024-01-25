import { createSignal } from "solid-js";
import { type GetHexes } from "./get_hexes";
import { type GetStructures } from "./get_structures";
import { Boards } from "@/constants/boards";

export default function getHarbors(hexes: GetHexes, structures: GetStructures) {
  return Boards.A.harbors.reduce<State["harbors"]>(
    (acc, { towns, type }, idx) => {
      const [townA, townB] = towns;
      const [pos, setPos] = createSignal<HarborPos>({
        x: null,
        y: null,
        dock1: { x: null, y: null, angle: null },
        dock2: { x: null, y: null, angle: null }
      });
      const id = `harbor:${idx}`;
      const hexIdA = hexes.byIdx[townA.hex]!.id;
      const hexIdB = hexes.byIdx[townB.hex]!.id;
      const townRefA = structures.bySeparateId[`${hexIdA}-${townA.town}`]!.town;
      const townRefB = structures.bySeparateId[`${hexIdB}-${townB.town}`]!.town;

      const harbor: Harbor = {
        id,
        idx,
        dockIds: [`dock:${id}-0`, `dock:${id}-1`],
        type: type,
        towns: [townRefA, townRefB],
        pos,
        setPos
      };

      acc.array.push(harbor);
      acc.byId[harbor.id] = harbor;
      acc.townToHarbor[townRefA.id] = harbor;
      acc.townToHarbor[townRefB.id] = harbor;
      return acc;
    },
    { array: [], byId: {}, townToHarbor: {} }
  );
}
