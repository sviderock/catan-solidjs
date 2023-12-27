import { type Accessor, type Setter } from "solid-js";

declare global {
  type Id = `${number}.${number}`;

  type HexCalculations = {
    angles: Array<{ x: number; y: number }>;
    center: { x: number; y: number };
    sizeToAngle: number;
    sizeToEdge: number;
    heightSection: number;
  };

  type HexNeighbour = Pick<Hex, "id" | "row" | "col"> & {
    towns: number[];
    townToTown: { [hexTown: number]: number };
  };

  type Hex = {
    type: "brick" | "lumber" | "ore" | "grain" | "wool";
    idx: number;
    id: `${number}.${number}`;
    row: number;
    col: number;
    rowLen: number;
    prevRowLen: number | null;
    nextRowLen: number | null;
    neighbours: (HexNeighbour | null)[];
    hovered: Accessor<boolean>;
    setHovered: Setter<boolean>;
    calc: Accessor<HexCalculations>;
    setCalc: Setter<HexCalculations>;
  };

  type SingleTownId = Id;
  type ConcatenatedTownIds =
    | `${SingleTownId},${SingleTownId}`
    | `${SingleTownId},${SingleTownId},${SingleTownId}`;

  type TownHex = { id: Hex["id"]; townIdx: number; calc: Accessor<HexCalculations> };

  type Town = {
    id: SingleTownId | ConcatenatedTownIds;
    idx?: number;
    active: boolean;
    disabled: boolean;
    type: Hex["type"];
    hexes: TownHex[];
    pos: Accessor<{ x: number | null; y: number | null }>;
    setPos: Setter<{ x: number | null; y: number | null }>;
  };
}
