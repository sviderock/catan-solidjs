import { type Accessor, type Setter } from "solid-js";

declare global {
  type Id = `${number}.${number}`;

  type HexCalculations = {
    center: { x: number; y: number };
    sizeToAngle: number;
    sizeToEdge: number;
    heightSection: number;
    angles: Array<{ x: number; y: number }>;
    edges: Array<{
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      centerX: number;
      centerY: number;
      angle: number;
    }>;
  };

  type HexNeighbour = Pick<Hex, "id" | "row" | "col"> & {
    towns: number[];
    townToTown: { [hexTown: number]: number };
    road: number;
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
  type TownPos = { x: number | null; y: number | null };
  type Town = {
    id: SingleTownId | ConcatenatedTownIds;
    active: boolean;
    disabled: boolean;
    type: Hex["type"];
    hexes: TownHex[];
    pos: Accessor<TownPos>;
    setPos: Setter<TownPos>;
  };

  type SingleRoadId = Id;
  type ConcatenatedRoadIds = `${SingleRoadId},${SingleRoadId}`;
  type RoadHex = { id: Hex["id"]; roadIdx: number; calc: Accessor<HexCalculations> };
  type RoadPos = { x: number | null; y: number | null; angle: number | null };
  type Road = {
    id: SingleRoadId | ConcatenatedRoadIds;
    active: boolean;
    hexes: RoadHex[];
    pos: Accessor<RoadPos>;
    setPos: Setter<RoadPos>;
  };
}
