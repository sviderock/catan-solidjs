type Intersection = { left: number; right: number; top: number; bottom: number; angle: number };

function roadsIntersection(road: Road) {
  const intersection = road.hexes.reduce<Intersection>(
    (acc, hex) => {
      const roadPos = hex.hex.calc().edges[hex.roadIdx]!;
      acc.left = acc.left === -1 ? roadPos.centerX : Math.min(acc.left, roadPos.centerX);
      acc.right = acc.right === -1 ? roadPos.centerX : Math.max(acc.right, roadPos.centerX);
      acc.top = acc.top === -1 ? roadPos.centerY : Math.min(acc.top, roadPos.centerY);
      acc.bottom = acc.bottom === -1 ? roadPos.centerY : Math.max(acc.bottom, roadPos.centerY);
      acc.angle = acc.angle === -1 ? roadPos.angle : acc.angle;
      return acc;
    },
    { left: -1, right: -1, top: -1, bottom: -1, angle: -1 }
  );

  return {
    centerX: (intersection.left + intersection.right) / 2,
    centerY: (intersection.top + intersection.bottom) / 2,
    angle: intersection.angle
  };
}

export function calculateRoadWithRect(road: Road, rect: DOMRectReadOnly): RoadPos {
  const roadHalfWidth = rect.width / 2;
  const roadHalfHeight = rect.height / 2;
  const intersection = roadsIntersection(road);
  return {
    x: intersection.centerX - roadHalfWidth,
    y: intersection.centerY - roadHalfHeight,
    angle: intersection.angle
  };
}

export function calculateRoad(road: Road, target: HTMLDivElement): RoadPos {
  const roadHalfWidth = target.offsetWidth / 2;
  const roadHalfHeight = target.offsetHeight / 2;
  const intersection = roadsIntersection(road);
  return {
    x: intersection.centerX - roadHalfWidth,
    y: intersection.centerY - roadHalfHeight,
    angle: intersection.angle
  };
}
