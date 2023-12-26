/* eslint-disable solid/reactivity */
import { getNeighbourHex, type GetNeighbourProps } from "./neighbour";

interface GetTownProps {
  x: number;
  y: number;
  townIdx: number;
  rowLen: number;
  prevRowLen: number | null;
  nextRowLen: number | null;
}

export default function getTown({ townIdx, ...props }: GetTownProps): TownState {
  const towns: TownState = { [`${props.x},${props.y}`]: townIdx };
  switch (townIdx) {
    case 0:
      return {
        ...towns,
        ...getNeighbourTownState(2, { neighbourIdx: 5, ...props }),
        ...getNeighbourTownState(4, { neighbourIdx: 0, ...props })
      };

    case 1:
      return {
        ...towns,
        ...getNeighbourTownState(3, { neighbourIdx: 0, ...props }),
        ...getNeighbourTownState(5, { neighbourIdx: 1, ...props })
      };

    case 2:
      return {
        ...towns,
        ...getNeighbourTownState(4, { neighbourIdx: 1, ...props }),
        ...getNeighbourTownState(0, { neighbourIdx: 2, ...props })
      };

    case 3:
      return {
        ...towns,
        ...getNeighbourTownState(5, { neighbourIdx: 2, ...props }),
        ...getNeighbourTownState(1, { neighbourIdx: 3, ...props })
      };

    case 4:
      return {
        ...towns,
        ...getNeighbourTownState(0, { neighbourIdx: 3, ...props }),
        ...getNeighbourTownState(2, { neighbourIdx: 4, ...props })
      };

    case 5:
      return {
        ...towns,
        ...getNeighbourTownState(1, { neighbourIdx: 4, ...props }),
        ...getNeighbourTownState(3, { neighbourIdx: 5, ...props })
      };

    default:
      return towns;
  }
}

function getNeighbourTownState(townIdx: number, hexProps: GetNeighbourProps): TownState {
  const neighbour = getNeighbourHex(hexProps);
  return neighbour ? { [`${neighbour.x},${neighbour.y}`]: townIdx } : {};
}
