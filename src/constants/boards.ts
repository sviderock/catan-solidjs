type Board = Pick<Hex, "type" | "value">[][];

export const Boards: Record<"A" | "B", Board> = {
  A: [
    [
      { type: "ore", value: 10 },
      { type: "wool", value: 2 },
      { type: "lumber", value: 9 }
    ],
    [
      { type: "grain", value: 12 },
      { type: "brick", value: 6 },
      { type: "wool", value: 4 },
      { type: "brick", value: 10 }
    ],
    [
      { type: "grain", value: 9 },
      { type: "lumber", value: 11 },
      { type: "desert", value: 7 },
      { type: "lumber", value: 3 },
      { type: "ore", value: 8 }
    ],
    [
      { type: "lumber", value: 8 },
      { type: "ore", value: 3 },
      { type: "grain", value: 4 },
      { type: "wool", value: 5 }
    ],
    [
      { type: "brick", value: 5 },
      { type: "grain", value: 6 },
      { type: "wool", value: 11 }
    ]
  ],
  B: [
    [
      { type: "wool", value: 6 },
      { type: "grain", value: 12 },
      { type: "wool", value: 9 }
    ],
    [
      { type: "brick", value: 2 },
      { type: "ore", value: 10 },
      { type: "lumber", value: 4 },
      { type: "ore", value: 5 }
    ],
    [
      { type: "desert", value: 7 },
      { type: "lumber", value: 11 },
      { type: "grain", value: 9 },
      { type: "wool", value: 8 },
      { type: "brick", value: 3 }
    ],
    [
      { type: "brick", value: 8 },
      { type: "lumber", value: 5 },
      { type: "wool", value: 11 },
      { type: "lumber", value: 10 }
    ],

    [
      { type: "grain", value: 3 },
      { type: "ore", value: 6 },
      { type: "grain", value: 4 }
    ]
  ]
};
