type BaseProps<T extends Structure["type"]> = { type: T; hexId: Hex["id"] };
type SingleProps<T extends Structure["type"]> = BaseProps<T> & { idx: number };
type ConcatenatedProps<T extends Structure["type"]> = BaseProps<T> & { hexes: StructureHex<T>[] };

type Props<T extends Structure["type"]> = SingleProps<T> & ConcatenatedProps<T>;

function getSingleStructureId<
  T extends Structure["type"],
  P extends SingleProps<T>,
  R = T extends TownType ? SingleStructureId<TownType> : SingleStructureId<RoadType>
>(params: P): R {
  return `${params.type}-${params.hexId}-${params.idx}` as R;
}

function getConcatenatedStructureIds<
  T extends Structure["type"],
  P extends Props<T>,
  R = T extends TownType ? ConcatenatedStructureIds<TownType> : ConcatenatedStructureIds<RoadType>
>(params: P): R {
  return [...params.hexes]
    .sort((a, b) => +a.hex.id - +b.hex.id)
    .map((hex) =>
      getSingleStructureId({
        hexId: hex.hex.id,
        type: params.type,
        idx: hex.roadIdx ?? hex.townIdx
      })
    )
    .join("|") as R;
}

export function getStructureId<T extends Structure["type"]>(
  params: Props<T>
): T extends TownType ? TownId : RoadId {
  if (params.hexes.length === 1) {
    return getSingleStructureId(params);
  }
  return getConcatenatedStructureIds(params);
}
