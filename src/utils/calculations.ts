function findAngle(x1: number, y1: number, x2: number, y2: number) {
  let atan = Math.atan2(y2 - y1, x2 - x1); // find arctangent
  // we don't want negative angles
  if (atan < 0) atan += Math.PI * 2; // make negative angles positive by adding 360 degrees
  return atan * (180 / Math.PI); // convert angle from radians to degrees;
}

// https://www.redblobgames.com/grids/hexagons/#basics
export function calculateHex(target: HTMLDivElement): HexCalculations {
  const heightSection = target.offsetHeight / 4;
  const sizeToAngle = target.offsetHeight / 2;
  const sizeToEdge = (sizeToAngle * Math.sqrt(3)) / 2;
  const left = target.offsetLeft;
  const right = target.offsetLeft + target.offsetWidth;
  const top = target.offsetTop;
  const bottom = target.offsetTop + target.offsetHeight;
  const center = { x: (left + right) / 2, y: (top + bottom) / 2 };
  const angles: HexCalculations["angles"] = [
    { x: center.x, y: Math.round(center.y - sizeToAngle) },
    { x: Math.round(center.x + sizeToEdge), y: Math.round(center.y - heightSection) },
    { x: Math.round(center.x + sizeToEdge), y: Math.round(center.y + heightSection) },
    { x: center.x, y: Math.round(center.y + sizeToAngle) },
    { x: Math.round(center.x - sizeToEdge), y: Math.round(center.y + heightSection) },
    { x: Math.round(center.x - sizeToEdge), y: Math.round(center.y - heightSection) }
  ];

  const edges: HexCalculations["edges"] = Array.from({ length: 6 }).map((_, idx, arr) => {
    const idx1 = idx;
    const idx2 = idx + 1 >= arr.length ? 0 : idx + 1;
    return {
      x1: angles[idx1]!.x,
      y1: angles[idx1]!.y,
      x2: angles[idx2]!.x,
      y2: angles[idx2]!.y,
      centerX: (angles[idx1]!.x + angles[idx2]!.x) / 2,
      centerY: (angles[idx1]!.y + angles[idx2]!.y) / 2,
      angle: findAngle(angles[idx1]!.x, angles[idx1]!.y, angles[idx2]!.x, angles[idx2]!.y)
    };
  });

  return { center, sizeToAngle, sizeToEdge, heightSection, angles, edges };
}

export function calculateRoad(road: Road, target: HTMLDivElement): RoadPos {
  const roadHalfWidth = target.offsetWidth / 2;
  const roadHalfHeight = target.offsetHeight / 2;
  const intersection = road.hexes.reduce(
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

  const centerX = (intersection.left + intersection.right) / 2;
  const centerY = (intersection.top + intersection.bottom) / 2;

  return {
    x: centerX - roadHalfWidth,
    y: centerY - roadHalfHeight,
    angle: intersection.angle
  };
}

export function calculateTown(town: Town, target: HTMLDivElement): TownPos {
  const townHalfWidth = target.offsetWidth / 2;
  const townHalfHeight = target.offsetHeight / 2;
  const intersection = town.hexes.reduce(
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

  const centerX = (intersection.left + intersection.right) / 2;
  const centerY = (intersection.top + intersection.bottom) / 2;

  return {
    centerX,
    centerY,
    x: centerX - townHalfWidth,
    y: centerY - townHalfHeight
  };
}

export function calculateHarbor(
  harbor: Harbor,
  refs: Record<string, HTMLDivElement | undefined>
): HarborPos {
  const target = refs[harbor.id]!;
  const dock1Ref = refs[harbor.dockIds[0]];
  const dock2Ref = refs[harbor.dockIds[1]];
  const harborHalfWidth = target.offsetWidth / 2;
  const harborHalfHeight = target.offsetHeight / 2;
  const ax = harbor.towns[0].pos().centerX!;
  const ay = harbor.towns[0].pos().centerY!;
  const bx = harbor.towns[1].pos().centerX!;
  const by = harbor.towns[1].pos().centerY!;
  const x = (bx + ax) / 2 + (Math.sqrt(3) / 2) * (by - ay);
  const y = (by + ay) / 2 - (Math.sqrt(3) / 2) * (bx - ax);

  const dock1: HarborPos["dock1"] = {
    x: (ax + x) / 2 - (dock1Ref?.offsetWidth || 0) / 2,
    y: (ay + y) / 2 - (dock1Ref?.offsetHeight || 0) / 2,
    angle: findAngle(ax, ay, x, y)
  };
  const dock2: HarborPos["dock2"] = {
    x: (bx + x) / 2 - (dock2Ref?.offsetWidth || 0) / 2,
    y: (by + y) / 2 - (dock2Ref?.offsetHeight || 0) / 2,
    angle: findAngle(bx, by, x, y)
  };

  return {
    x: x - harborHalfWidth,
    y: y - harborHalfHeight,
    dock1,
    dock2
  };
}

export function calculateRobber(
  robber: Robber,
  refs: Record<string, HTMLDivElement | undefined>
): RobberPos {
  const target = refs[robber.id]!;
  const robberHalfWidth = target.offsetWidth / 2;
  const robberHalfHeight = target.offsetHeight / 2;
  return {
    x: robber.hex.calc().center.x - robberHalfWidth,
    y: robber.hex.calc().center.y - robberHalfHeight
  };
}
