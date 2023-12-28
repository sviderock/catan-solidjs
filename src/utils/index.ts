/* eslint-disable solid/reactivity */
import { type HexagonProps } from "../Hexagon";

export function getRandomType() {
  const hexTypes: HexagonProps["type"][] = ["brick", "grain", "lumber", "ore", "wool"];
  const idx = Math.floor(Math.random() * hexTypes.length);
  return hexTypes[idx]!;
}

export function matches<S extends T, T = unknown>(e: T, predicate: (e: T) => e is S): S | false {
  return predicate(e) ? e : false;
}
