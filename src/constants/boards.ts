type Board = Pick<Hex, "type" | "value">[][];

export const Boards: Record<"A" | "B", { board: Board; harbors: BoardHarbor[] }> = {
  A: {
    board: [
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
    // town indecies must be provided left-to-right
    harbors: [
      {
        type: "all",
        towns: [
          { hex: 0, town: 5 },
          { hex: 0, town: 0 }
        ]
      },
      {
        type: "grain",
        towns: [
          { hex: 1, town: 0 },
          { hex: 1, town: 1 }
        ]
      },
      {
        type: "ore",
        towns: [
          { hex: 6, town: 0 },
          { hex: 6, town: 1 }
        ]
      },
      {
        type: "all",
        towns: [
          { hex: 11, town: 1 },
          { hex: 11, town: 2 }
        ]
      },
      {
        type: "wool",
        towns: [
          { hex: 15, town: 2 },
          { hex: 15, town: 3 }
        ]
      },
      {
        type: "all",
        towns: [
          { hex: 17, town: 2 },
          { hex: 17, town: 3 }
        ]
      },
      {
        type: "all",
        towns: [
          { hex: 16, town: 3 },
          { hex: 16, town: 4 }
        ]
      },
      {
        type: "brick",
        towns: [
          { hex: 12, town: 4 },
          { hex: 12, town: 5 }
        ]
      },
      {
        type: "lumber",
        towns: [
          { hex: 3, town: 4 },
          { hex: 3, town: 5 }
        ]
      }
    ]
  },
  B: {
    board: [
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
    ],
    harbors: []
  }
};
