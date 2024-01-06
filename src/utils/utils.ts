export function getRandomType() {
  const hexTypes: Hex["type"][] = ["brick", "grain", "lumber", "ore", "wool"];
  const idx = Math.floor(Math.random() * hexTypes.length);
  return hexTypes[idx]!;
}

export function matches<S extends T, T = unknown>(e: T, predicate: (e: T) => e is S): S | false {
  return predicate(e) ? e : false;
}

export type GetStructureId<T extends Structure["type"]> = ReturnType<typeof getStructureId<T>>;
export function getStructureId<
  T extends Structure["type"],
  R = { id: T extends TownType ? TownId : RoadId; indexedId: IndexedId }
>(params: { type: T; hexes: Omit<Structure["hexes"][number], "indexedId">[] }): R {
  const concatenated = [...params.hexes]
    .sort((a, b) => +a.hex.id - +b.hex.id)
    .map((hex) => `${hex.hex.id}-${hex.roadIdx ?? hex.townIdx}` as SingleIndexedId)
    .join("|") as IndexedId;

  return {
    id: `${params.type}:${concatenated}`,
    indexedId: concatenated
  } as R;
}

export function extractFirstId(data: Structure["id"]) {
  const [, indexedId] = data.split("|")[0]!.split(":");
  const [id, idx] = indexedId!.split("-");
  return { id: id!, idx: +idx! };
}
