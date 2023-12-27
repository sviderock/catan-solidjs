/* eslint-disable solid/reactivity */
import { type HexagonProps } from "../Hexagon";

export function getRandomType() {
  const hexTypes: HexagonProps["type"][] = ["brick", "grain", "lumber", "ore", "wool"];
  const idx = Math.floor(Math.random() * hexTypes.length);
  return hexTypes[idx]!;
}
