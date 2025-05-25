import { type Accessor, type Setter } from "solid-js";
import { SetStoreFunction, Store, StoreSetter } from "solid-js/store";

declare global {
  type Id = `${number}.${number}`;
  type IndexedId = SingleIndexedId | MultiIndexedId;
  type SingleIndexedId = `${Id}-${number}`;
  type MultiIndexedId =
    | `${SingleIndexedId}|${SingleIndexedId}`
    | `${SingleIndexedId}|${SingleIndexedId}|${SingleIndexedId}`;
  type ConstructedIdOfType<T extends string> = `${T}:${IndexedId}`;
  type Pos = { x: number; y: number };
  type Rect = { left: number; right: number; top: number; bottom: number };

  type HexCalculations = {
    absolute: {
      centerX: number;
      centerY: number;
      left: number;
      right: number;
      top: number;
      bottom: number;
    };
    center: { x: number; y: number };
    height: number;
    width: number;
    left: number;
    right: number;
    top: number;
    bottom: number;
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
    idx: number;
    name: string;
    color: string;
    resources: Accessor<PlayerResources>;
    setResources: Setter<PlayerResources>;
    developmentCards: Store<DevelopmentCard[]>;
    setDevelopmentCards: SetStoreFunction<DevelopmentCard[]>;
    towns: Accessor<Town[]>;
    setTowns: Setter<Town[]>;
    roads: Accessor<Road[]>;
    setRoads: Setter<Road[]>;
  };

  type BasePhaseProps = {
    players: Player[];
    currentPlayer: number;
    robber: Hex["id"];
  };

  type SetupPhase = BasePhaseProps & {
    phase: "setup";
    order: "first" | "second";
    town: Town | null;
    road: Road | null;

    rolls?: never;
    rollStatus?: never;
    playedDevelopmentCard?: never;
  };

  type TurnPhase = BasePhaseProps & {
    phase: "turn";
    rolls: Roll[];
    rollStatus: RollStatus;
    playedDevelopmentCard: PlayableDevelopmentCard["type"] | false;

    order?: never;
    town?: never;
    road?: never;
  };

  type Roll = { a: number; b: number; roll: number };
  type RollStatus = "not_rolled" | "rolling" | "rolled";

  type RobberPos = { x: number; y: number };
  type Robber = {
    id: "robber";
    status: "drop_resources" | "select_hex_and_player" | "stealing_resource" | "placed";
    hex: Hex;
    pos: Accessor<RobberPos>;
    setPos: Setter<RobberPos>;
  };

  type ResourceSummary = Record<Hex["type"], number>;
  type PlayerResourceSummary = { [diceValue: number]: ResourceSummary };
  type PlayerResourceSummaryIterative = {
    [diceValue: number]: Array<[Hex["type"], resourceCount: number]>;
  };

  type DevelopmentCard = PlayableDevelopmentCard | VictoryPointCard;
  type DevelopmentCardStatus = "deck" | "ready_next_turn" | "available" | "played";
  type VictoryPointCard = { type: "victory_point"; status: DevelopmentCardStatus };
  type PlayableDevelopmentCard =
    | { type: "knight"; status: DevelopmentCardStatus }
    | { type: "monopoly"; status: DevelopmentCardStatus }
    | { type: "road_building"; status: DevelopmentCardStatus }
    | { type: "year_of_plenty"; status: DevelopmentCardStatus };

  type ResourceExchange = {
    idx: number;
    add?: Partial<PlayerResources>;
    remove?: Partial<PlayerResources>;
  };
}
