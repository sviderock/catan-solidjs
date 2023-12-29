function townsIntersection(town: Town) {
  const intersection = town.hexes.reduce<{
    left: number;
    right: number;
    top: number;
    bottom: number;
  }>(
    (acc, hex) => {
      const townPos = hex.hex.calc().angles[hex.townIdx]!;
      acc.left = acc.left === -1 ? townPos.x : Math.min(acc.left, townPos.x);
      acc.right = acc.right === -1 ? townPos.x : Math.max(acc.right, townPos.x);
      acc.top = acc.top === -1 ? townPos.y : Math.min(acc.top, townPos.y);
      acc.bottom = acc.bottom === -1 ? townPos.y : Math.max(acc.bottom, townPos.y);
      return acc;
    },
    { left: -1, right: -1, top: -1, bottom: -1 }
  );

  return {
    centerX: (intersection.left + intersection.right) / 2,
    centerY: (intersection.top + intersection.bottom) / 2
  };
}

export function calculateTownWithRect(town: Town, rect: DOMRectReadOnly): TownPos {
  const townHalfWidth = rect.width / 2;
  const townHalfHeight = rect.height / 2;
  const intersection = townsIntersection(town);
  return { x: intersection.centerX - townHalfWidth, y: intersection.centerY - townHalfHeight };
}

export function calculateTown(town: Town, target: HTMLDivElement): TownPos {
  const townHalfWidth = target.offsetWidth / 2;
  const townHalfHeight = target.offsetHeight / 2;
  const intersection = townsIntersection(town);
  return { x: intersection.centerX - townHalfWidth, y: intersection.centerY - townHalfHeight };
}
