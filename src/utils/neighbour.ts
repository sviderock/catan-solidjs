/* eslint-disable solid/reactivity */

/**
 * - 0 neighbour = prevRowLen < rowLen ? (row+1, col) :   (row-1, col)
 * - 1 neighbour =                                        (row,   col+1)
 * - 2 neighbour = nextRowLen < rowLen ? (row+1, col) :   (row+1, col+1)
 * - 3 neighbour = nextRowLen < rowLen ? (row+1, col+1) : (row+1, col)
 * - 4 neighbour =                                        (row,   col-1)
 * - 5 neighbour = prevRowLen < rowLen ? (row-1, col) :   (row-1, col-1)
 */
export function getNeighbourHex<
  T extends Pick<Hex, "row" | "col" | "rowLen" | "prevRowLen" | "nextRowLen"> & {
    neighbourIdx: number;
  }
>(props: T): HexNeighbour | null {
  switch (props.neighbourIdx) {
    case 0: {
      if (props.prevRowLen === null) return null;
      const col = props.prevRowLen > props.rowLen ? props.col + 1 : props.col;

      if (col >= props.prevRowLen) return null;
      return { ...getCalc(props.row - 1, col), towns: [4, 3], townToTown: { 0: 4, 1: 3 }, road: 3 };
    }
    case 1: {
      const col = props.col + 1;
      if (col >= props.rowLen) return null;
      return { ...getCalc(props.row, col), towns: [5, 4], townToTown: { 1: 5, 2: 4 }, road: 4 };
    }
    case 2: {
      if (props.nextRowLen === null) return null;
      const col = props.nextRowLen < props.rowLen ? props.col : props.col + 1;

      if (col >= props.nextRowLen) return null;
      return { ...getCalc(props.row + 1, col), towns: [0, 5], townToTown: { 2: 0, 3: 5 }, road: 5 };
    }
    case 3: {
      if (props.nextRowLen === null) return null;
      const col = props.nextRowLen < props.rowLen ? props.col - 1 : props.col;

      if (col < 0) return null;
      return { ...getCalc(props.row + 1, col), towns: [1, 0], townToTown: { 3: 1, 4: 0 }, road: 0 };
    }
    case 4: {
      const col = props.col - 1;
      if (col < 0) return null;
      return { ...getCalc(props.row, col), towns: [2, 1], townToTown: { 4: 2, 5: 1 }, road: 1 };
    }
    case 5: {
      if (props.prevRowLen === null) return null;
      const col = props.prevRowLen > props.rowLen ? props.col : props.col - 1;

      if (col < 0) return null;
      return { ...getCalc(props.row - 1, col), towns: [3, 2], townToTown: { 5: 3, 0: 2 }, road: 2 };
    }

    default:
      return null;
  }
}

function getCalc(row: number, col: number): Omit<HexNeighbour, "towns" | "townToTown" | "road"> {
  const id = `${row}.${col}` as const;
  return { row, col, id };
}
