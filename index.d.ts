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

  type Resource = "brick" | "lumber" | "ore" | "grain" | "wool";

  type HexNeighbour = Pick<Hex, "id" | "row" | "col"> & {
    towns: number[];
    townToTown: { [hexTown: number]: number };
    road: number;
  };

  type Hex = {
    type: Resource | "desert";
    idx: number;
    id: Id;
    row: number;
    col: number;
    rowLen: number;
    value: number;
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
    idx: number;
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
    idx: number;
    type: RoadType;
    hexes: Array<{ hex: Hex; townIdx?: never; roadIdx: number }>;
    towns: Town[];
    roads: Road[];
    pos: Accessor<RoadPos>;
    setPos: Setter<RoadPos>;
  };

  type Structure = Town | Road;
  type StructureMap = { [key: Structure["id"]]: Structure };

  type PlayerResources = Record<Resource, number>;
  type Player = {
    name: string;
    color: string;
    resources: Accessor<PlayerResources>;
    setResources: Setter<PlayerResources>;
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
    player: Player;
  }>;

  type SetupPhase = {
    players: Player[];
    phase: "setup";
    turn: {
      player: number;
      order: "first" | "second";
      town: Town | null;
      road: Road | null;
    };
  };

  type GamePhase = {
    players: Player[];
    phase: "game";
    turn: {
      player: number;
      order?: never;
      town?: never;
      road?: never;
    };
  };

  type State = {
    hexes: {
      array: Hex[];
      byId: { [hexId: Hex["id"]]: Hex };
      layout: Hex[][];
      valueMap: { [value: number]: Hex[] };
    };
    structures: {
      array: Structure[];
      byId: StructureMap;
      keys: { towns: TownId[]; roads: RoadId[] };
    };
    game: SetupPhase | GamePhase;
  };

  type Roll = {
    a: number;
    b: number;
    roll: number;
  };

  type ResourceSummary = Record<Hex["type"], number>;
  type PlayerResourceSummary = { [diceValue: number]: ResourceSummary };
  type PlayerResourceSummaryIterative = {
    [diceValue: number]: Array<[Hex["type"], resourceCount: number]>;
  };
}
