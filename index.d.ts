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

  type BoardHarbor = {
    type: Harbor["type"];
    towns: [{ hex: number; town: number }, { hex: number; town: number }];
  };

  type HarborPos = {
    x: number | null;
    y: number | null;
    dock1: { x: number | null; y: number | null; angle: number | null };
    dock2: { x: number | null; y: number | null; angle: number | null };
  };

  type Harbor = {
    id: number | string;
    idx: number;
    type: Resource | "all";
    towns: [Town, Town];
    dockIds: [string, string];
    pos: Accessor<HarborPos>;
    setPos: Setter<HarborPos>;
  };

  type TownType = "town";
  type RoadType = "road";

  type TownLevel = "settlement" | "city";

  type TownId = ConstructedIdOfType<TownType>;
  type RoadId = ConstructedIdOfType<RoadType>;

  type TownPos = { x: number | null; y: number | null; centerX: number | null; centerY: number | null };
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
  type StructureSeparateIdMap = { [key: SingleIndexedId]: { road: Road; town: Town } };

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
    developmentCards: Array<{
      card: DevelopmentCard;
      played: boolean;
    }>;
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
    rolls?: never;
    turn: {
      player: number;
      order: "first" | "second";
      town: Town | null;
      road: Road | null;
      rolledProduction?: never;
      playedDevelopmentCard?: never;
    };
  };

  type GamePhase = {
    players: Player[];
    phase: "game";
    rolls: Roll[];
    turn: {
      player: number;
      order?: never;
      town?: never;
      road?: never;
      rolledProduction: boolean;
      playedDevelopmentCard: boolean;
    };
  };

  type Roll = {
    a: number;
    b: number;
    roll: number;
  };

  type State = {
    hexes: {
      array: Hex[];
      byId: { [hexId: Hex["id"]]: Hex };
      byIdx: { [hexIdx: Hex["idx"]]: Hex };
      layout: Hex[][];
      valueMap: { [value: number]: Hex[] };
    };
    structures: {
      array: Structure[];
      byId: StructureMap;
      keys: { towns: TownId[]; roads: RoadId[] };
    };
    harbors: Harbor[];
    game: SetupPhase | GamePhase;
  };

  type ResourceSummary = Record<Hex["type"], number>;
  type PlayerResourceSummary = { [diceValue: number]: ResourceSummary };
  type PlayerResourceSummaryIterative = {
    [diceValue: number]: Array<[Hex["type"], resourceCount: number]>;
  };

  type DevelopmentCard = {
    type: "knight" | "victory_point" | "monopoly" | "road_building" | "year_of_plenty";
  };
}
