import { type Accessor, type Setter } from "solid-js";

declare global {
  type Id = `${number}.${number}`;
  type IndexedId = SingleIndexedId | MultiIndexedId;
  type SingleIndexedId = `${Id}-${number}`;
  type MultiIndexedId =
    | `${SingleIndexedId}|${SingleIndexedId}`
    | `${SingleIndexedId}|${SingleIndexedId}|${SingleIndexedId}`;
  type ConstructedIdOfType<T extends string> = `${T}:${IndexedId}`;

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
    siblings: Array<Hex | null>;
    towns: Town[];
    roads: Road[];
    hovered: Accessor<boolean>;
    setHovered: Setter<boolean>;
    calc: Accessor<HexCalculations>;
    setCalc: Setter<HexCalculations>;
  };

  type TownType = "town";
  type RoadType = "road";

  type TownLevel = "settlement" | "city";

  type TownId = ConstructedIdOfType<TownType>;
  type RoadId = ConstructedIdOfType<RoadType>;

  type TownPos = { x: number | null; y: number | null };
  type RoadPos = { x: number | null; y: number | null; angle: number | null };

  type Town = {
    id: TownId;
    type: TownType;
    hexes: Array<{ hex: Hex; townIdx: number; roadIdx?: never }>;
    closestTowns: Town[];
    roads: Road[];
    towns?: never;
    pos: Accessor<TownPos>;
    setPos: Setter<TownPos>;
    level: Accessor<TownLevel>;
    setLevel: Setter<TownLevel>;
  };

  type Road = {
    id: RoadId;
    type: RoadType;
    hexes: Array<{ hex: Hex; townIdx?: never; roadIdx: number }>;
    towns: Town[];
    roads: Road[];
    pos: Accessor<RoadPos>;
    setPos: Setter<RoadPos>;
  };

  type Structure = Town | Road;
  type StructureMap = { [key: Structure["id"]]: Structure };

  type Player = {
    name: string;
    color: string;
    towns: Accessor<Town[]>;
    setTowns: Setter<Town[]>;
    roads: Accessor<Road[]>;
    setRoads: Setter<Road[]>;
  };

  type Stats = Array<{
    roads: number;
    settlements: number;
    cities: number;
    points: number;
  }>;

  type State = {
    hexes: {
      array: Hex[];
      byId: { [hexId: Hex["id"]]: Hex };
      layout: Hex[][];
    };
    structures: {
      array: Structure[];
      byId: StructureMap;
      keys: { towns: TownId[]; roads: RoadId[] };
    };
    game: {
      phase: "setup" | "game" | "won";
      currentPlayer: number;
      players: Player[];
    };
  };
}
