// prettier-ignore
const data = [
  [ [0,1,2,3,4,5],  [6,7,8,9],  [10,11,12,13] ], // 14 nodes
  [ [14,15,16,17],  [18,19,20], [21,22,23],   [24,25,26] ], // 13 nodes
  [ [27,28,29,30],  [31,32,33], [34,35,36],   [37,38,39], [40,41,42] ], // 16 nodes
  [ [43,44,45],     [46,47],    [48,49],      [50,51] ], // 9 nodes
  [ [52,53,54],     [55,54],    [57,58] ] // 7nodes
];

// if(currentRow !== 0)
//  - next row with +1 hex will have (currentRow + 3)
//  -  next row with -1 hex will have (currentRow - 2)

const data2 = [
  [{ town1: 5, town2: {} }, {}, {}],
  [{ town1: {}, town2: {} }, {}, {}],
  [{ town1: {}, town2: {} }, {}, {}],
  [{ town1: {}, town4: 5 }, {}, {}]
];

const player1 = {
  towns: [0, 1, 2, 3, 4]
};

const player2 = {
  towns: [5, 6, 7, 8, 9]
};

/**
 * 1st neighbour = x-1, y
 * 2nd neighbour = x,   y+1
 * 3rd neighbour = x+1, y+1
 * 4th neighbour = x+1, y
 * 5th neighbour = x,   y-1
 * 6th neighbour = x-1, y-1
 *
 *
 * * For 2,2
 *  1,2 -> x+1,y -> changed
 *  2,3 -> x,y+1
 *  3,2 -> x+1,y -> changed
 *  3,1 -> x+1,y-1 -> changed
 *  2,1 -> x,y-1
 *  1,1 -> x-1,y-1
 *
 */

/**
 *
 * –––––––––– ROW 1 ––––––––––
 *
 * For 0,0
 *  null
 *  0,1 -> x,y+1
 *  1,1 -> x+1,y+1
 *  1,0 -> x+1,y
 *  null
 *  null
 *
 * For 0,1
 *  null
 *  0,2 -> x,y+1
 *  1,2 -> x+1,y+1
 *  1,1 -> x+1,y
 *  0,0 -> x,y-1
 *  null
 *
 * For 0,2
 *  null
 *  null
 *  1,3 -> x+1,y+1
 *  1,2 -> x+1,y
 *  0,1 -> x,y-1
 *  null
 *
 *
 * * –––––––––– ROW 2 ––––––––––
 *
 * For 1,0
 *  0,0 -> x-1,y
 *  1,1 -> x,y+1
 *  2,1 -> x+1,y+1
 *  2,0 -> x+1,y
 *  null
 *  null
 *
 * For 1,1
 *  0,1 -> x-1,y
 *  1,2 -> x,y+1
 *  2,2 -> x+1,y+1
 *  2,1 -> x+1,y
 *  1,0 -> x,y-1
 *  0,0 -> x-1,y-1
 *
 * For 1,2
 *  0,2 -> x-1,y
 *  1,3 -> x,y+1
 *  2,3 -> x+1,y+1
 *  2,2 -> x+1,y
 *  1,1 -> x,y-1
 *  0,1 -> x-1,y-1
 *
 * For 1,3
 *  null
 *  null
 *  2,4 -> x+1,y+1
 *  2,3 -> x+1,y
 *  1,2 -> x,y-1
 *  0,2 -> x-1,y-1
 *
 *
 *
 * * –––––––––– ROW 3 ––––––––––
 *
 *
 * For 2,2
 *  1,2 -> x+1,y
 *  2,3 -> x,y+1
 *  3,2 -> x+1,y
 *  3,1 -> x+1,y-1
 *  2,1 -> x,y-1
 *  1,1 -> x-1,y-1
 *
 */
