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
    id: Id;
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

  type SingleStructureId<T extends TownType | RoadType> = `${T}-${Id}-${number}`;
  type ConcatenatedStructureIds<T extends TownType | RoadType> =
    | `${SingleStructureId<T>}|${SingleStructureId<T>}`
    | `${SingleStructureId<T>}|${SingleStructureId<T>}|${SingleStructureId<T>}`;

  type StructureHex<T extends TownType | RoadType> = T extends TownType
    ? { hex: Hex; townIdx: number; roadIdx?: never }
    : { hex: Hex; townIdx?: never; roadIdx: number };

  type TownType = "town";
  type RoadType = "road";

  type TownId = SingleStructureId<TownType> | ConcatenatedStructureIds<TownType>;
  type RoadId = SingleStructureId<RoadType> | ConcatenatedStructureIds<RoadType>;

  type TownPos = { x: number | null; y: number | null };
  type RoadPos = { x: number | null; y: number | null; angle: number | null };

  type TownHex = StructureHex<"town">;
  type RoadHex = StructureHex<"road">;

  type BaseStructureProps = { active: boolean };

  type Town = BaseStructureProps & {
    id: TownId;
    type: TownType;
    disabled: boolean;
    level: "settlement" | "city";
    hexes: TownHex[];
    pos: Accessor<TownPos>;
    setPos: Setter<TownPos>;
  };

  type Road = BaseStructureProps & {
    id: RoadId;
    type: RoadType;
    hexes: RoadHex[];
    pos: Accessor<RoadPos>;
    setPos: Setter<RoadPos>;
  };

  type Structure = Town | Road;
}
