function findAngle(x1: number, y1: number, x2: number, y2: number) {
  let atan = Math.atan2(y2 - y1, x2 - x1); // find arctangent
  // we don't want negative angles
  if (atan < 0) atan += Math.PI * 2; // make negative angles positive by adding 360 degrees
  return atan * (180 / Math.PI); // convert angle from radians to degrees;
}

function anglesAndEdges<
  T extends Pick<HexCalculations, "center" | "sizeToAngle" | "sizeToEdge" | "heightSection">,
  R extends Pick<HexCalculations, "angles" | "edges">
>({ center, sizeToAngle, sizeToEdge, heightSection }: T): R {
  const angles: HexCalculations["angles"] = [
    { x: center.x, y: center.y - sizeToAngle },
    { x: center.x + sizeToEdge, y: center.y - heightSection },
    { x: center.x + sizeToEdge, y: center.y + heightSection },
    { x: center.x, y: center.y + sizeToAngle },
    { x: center.x - sizeToEdge, y: center.y + heightSection },
    { x: center.x - sizeToEdge, y: center.y - heightSection }
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

  return { angles, edges } as R;
}

// https://www.redblobgames.com/grids/hexagons/#basics
export function calculateHexWithRect(rect: DOMRectReadOnly): HexCalculations {
  const sizeToAngle = rect.height / 2;
  const sizeToEdge = (sizeToAngle * Math.sqrt(3)) / 2;
  const heightSection = rect.height / 4;
  const center = { x: (rect.left + rect.right) / 2, y: (rect.top + rect.bottom) / 2 };
  const { angles, edges } = anglesAndEdges({ center, sizeToAngle, sizeToEdge, heightSection });
  return { center, sizeToAngle, sizeToEdge, heightSection, angles, edges };
}

export function calculateHex(target: HTMLDivElement): HexCalculations {
  const heightSection = target.offsetHeight / 4;
  const sizeToAngle = target.offsetHeight / 2;
  const sizeToEdge = (sizeToAngle * Math.sqrt(3)) / 2;
  const left = target.offsetLeft;
  const right = target.offsetLeft + target.offsetWidth;
  const top = target.offsetTop;
  const bottom = target.offsetTop + target.offsetHeight;
  const center = { x: (left + right) / 2, y: (top + bottom) / 2 };
  const { angles, edges } = anglesAndEdges({ center, sizeToAngle, sizeToEdge, heightSection });
  return { center, sizeToAngle, sizeToEdge, heightSection, angles, edges };
}
