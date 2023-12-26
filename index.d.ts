export {};

declare global {
  interface HexPosition {
    x: number;
    y: number;
    pos: `${number}.${number}`;
    num: number;
    numFixed: string;
  }

  interface TownPosition {
    x: number;
    y: number;
    townIdx: number;
  }

  type TownState = {
    [rowColIdx: `${number},${number}`]: number;
  };

  type Hex = {
    type: "brick" | "lumber" | "ore" | "grain" | "wool";
  };
}
