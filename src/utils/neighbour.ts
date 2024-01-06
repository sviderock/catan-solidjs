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
>(params: T): HexNeighbour | null {
  switch (params.neighbourIdx) {
    case 0: {
      if (params.prevRowLen === null) return null;
      const col = params.prevRowLen > params.rowLen ? params.col + 1 : params.col;
      const row = params.row - 1;

      if (col >= params.prevRowLen) return null;
      return {
        col,
        row,
        id: `${row}.${col}` as const,
        towns: [4, 3],
        townToTown: { 0: 4, 1: 3 },
        road: 3
      };
    }

    case 1: {
      const col = params.col + 1;
      const row = params.row;
      if (col >= params.rowLen) return null;
      return {
        col,
        row,
        id: `${row}.${col}` as const,
        towns: [5, 4],
        townToTown: { 1: 5, 2: 4 },
        road: 4
      };
    }

    case 2: {
      if (params.nextRowLen === null) return null;
      const col = params.nextRowLen < params.rowLen ? params.col : params.col + 1;
      const row = params.row + 1;

      if (col >= params.nextRowLen) return null;
      return {
        col,
        row,
        id: `${row}.${col}` as const,
        towns: [0, 5],
        townToTown: { 2: 0, 3: 5 },
        road: 5
      };
    }

    case 3: {
      if (params.nextRowLen === null) return null;
      const col = params.nextRowLen < params.rowLen ? params.col - 1 : params.col;
      const row = params.row + 1;

      if (col < 0) return null;
      return {
        col,
        row,
        id: `${row}.${col}` as const,
        towns: [1, 0],
        townToTown: { 3: 1, 4: 0 },
        road: 0
      };
    }

    case 4: {
      const col = params.col - 1;
      const row = params.row;
      if (col < 0) return null;
      return {
        col,
        row,
        id: `${row}.${col}` as const,
        towns: [2, 1],
        townToTown: { 4: 2, 5: 1 },
        road: 1
      };
    }

    case 5: {
      if (params.prevRowLen === null) return null;
      const col = params.prevRowLen > params.rowLen ? params.col : params.col - 1;
      const row = params.row - 1;

      if (col < 0) return null;
      return {
        col,
        row,
        id: `${row}.${col}` as const,
        towns: [3, 2],
        townToTown: { 5: 3, 0: 2 },
        road: 2
      };
    }

    default:
      return null;
  }
}
