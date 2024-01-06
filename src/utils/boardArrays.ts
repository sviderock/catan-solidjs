import { getRandomType } from "./utils";

export const regularBoard: Pick<Hex, "type">[][] = [
  [{ type: getRandomType() }, { type: getRandomType() }, { type: getRandomType() }],
  [
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() }
  ],
  [
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() }
  ],
  [
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() }
  ],
  [{ type: getRandomType() }, { type: getRandomType() }, { type: getRandomType() }]
];

export const bigBoard: Pick<Hex, "type">[][] = [
  [{ type: getRandomType() }, { type: getRandomType() }, { type: getRandomType() }],
  [
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() }
  ],
  [
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() }
  ],
  [
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() }
  ],
  [
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() }
  ],
  [
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() }
  ],
  [
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() }
  ],
  [
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() }
  ],
  [
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() }
  ],
  [
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() }
  ],
  [
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() }
  ],
  [
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() },
    { type: getRandomType() }
  ],
  [{ type: getRandomType() }, { type: getRandomType() }, { type: getRandomType() }]
];
