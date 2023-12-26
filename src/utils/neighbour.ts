/* eslint-disable solid/reactivity */
type BaseProps = {
  x: number;
  y: number;
  rowLen: number;
  prevRowLen: number | null;
  nextRowLen: number | null;
};

export type GetNeighbourProps = BaseProps & {
  neighbourIdx: number;
};

function getCalc(x: number, y: number): HexPosition {
  const pos = `${x}.${y}` as const;
  const num = +pos;
  const numFixed = num.toFixed(2);
  return { x, y, pos, num, numFixed };
}

/**
 * - 0 neighbour = prevRowLen < rowLen ? (x+1, y) : (x-1, y)
 * - 1 neighbour = (x, y+1)
 * - 2 neighbour = nextRowLen < rowLen ? (x+1, y) : (x+1, y+1)
 * - 3 neighbour = nextRowLen < rowLen ? (x+1, y+1) : (x+1, y)
 * - 4 neighbour = (x, y-1)
 * - 5 neighbour = prevRowLen < rowLen ? (x-1, y) : (x-1, y-1)
 */
export function getNeighbourHex(props: GetNeighbourProps): HexPosition | null {
  switch (props.neighbourIdx) {
    case 0: {
      if (props.prevRowLen === null) return null;
      const y = props.prevRowLen > props.rowLen ? props.y + 1 : props.y;

      if (y >= props.prevRowLen) return null;
      return getCalc(props.x - 1, y);
    }
    case 1: {
      const y = props.y + 1;
      if (y >= props.rowLen) return null;
      return getCalc(props.x, y);
    }
    case 2: {
      if (props.nextRowLen === null) return null;
      const y = props.nextRowLen < props.rowLen ? props.y : props.y + 1;

      if (y >= props.nextRowLen) return null;
      return getCalc(props.x + 1, y);
    }
    case 3: {
      if (props.nextRowLen === null) return null;
      const y = props.nextRowLen < props.rowLen ? props.y - 1 : props.y;

      if (y < 0) return null;
      return getCalc(props.x + 1, y);
    }
    case 4: {
      const y = props.y - 1;
      if (y < 0) return null;
      return getCalc(props.x, y);
    }
    case 5: {
      if (props.prevRowLen === null) return null;
      const y = props.prevRowLen > props.rowLen ? props.y : props.y - 1;

      if (y < 0) return null;
      return getCalc(props.x - 1, y);
    }

    default:
      return null;
  }
}

export function getAllNeighbours(props: BaseProps) {
  return [0, 1, 2, 3, 4, 5].map((idx) => {
    const neighbour = getNeighbourHex({ ...props, neighbourIdx: idx });
    return neighbour
      ? {
          x: neighbour.x,
          y: neighbour.y,
          num: +`${neighbour.x}.${neighbour.y}`
        }
      : null;
  });
}
