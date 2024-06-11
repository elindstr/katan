// ports.js
const ports = [
  // row 1
  { id: 0, x: 1, y: -.25, value: '3:1', orient: 4, canHaveValue: true, adjacentNodes: [0, 3] },
  { id: 1, x: 2, y: -.25, value: '', orient: 5 },
  { id: 2, x: 2, y: -.25, value: '', orient: 4 },
  { id: 3, x: 3, y: -.25, value: '2:1B', canHaveValue: true, orient: 5, adjacentNodes: [1, 5] },
  { id: 4, x: 3, y: -.25, value: '', orient: 4 },
  { id: 5, x: 4, y: -.25, value: '', orient: 5 },

  // row 1.5
  { id: 6, x: .5, y: .5, value: '', orient: 3 },
  { id: 7, x: 4.5, y: .5, value: '2:1Wd', canHaveValue: true, orient: 6, adjacentNodes: [6, 10] },

  // row 2
  { id: 8, x: .5, y: .5, value: '', orient: 4 },
  { id: 9, x: 4.5, y: .5, value: '', orient: 5 },

  // row 2.5
  { id: 10, x: 0, y: 1.25, value: '3:1', orient: 3, canHaveValue: true, adjacentNodes: [11, 16] },
  { id: 11, x: 5, y: 1.25, value: '', orient: 6 },

  // row 3
  { id: 12, x: 0, y: 1.25, value: '', orient: 4 },
  { id: 13, x: 5, y: 1.25, value: '3:1', canHaveValue: true, orient: 5, adjacentNodes: [20, 26] },

  // row 3.5
  { id: 14, x: -.5, y: 2, value: '', orient: 3 },
  { id: 15, x: 5.5, y: 2, value: '', orient: 6 },

  // row 3.6
  { id: 16, x: 0, y: 2.75, value: '2:1S', orient: 2, canHaveValue: true, adjacentNodes: [27, 33] },
  { id: 17, x: 5, y: 2.75, value: '', orient: 1 },

  // row 4
  { id: 18, x: 0, y: 2.75, value: '', orient: 3 },
  { id: 19, x: 5, y: 2.75, value: '', orient: 6 },

  // row 4.5
  { id: 20, x: .5, y: 3.5, value: '', orient: 2 },
  { id: 21, x: 4.5, y: 3.5, value: '2:1Wt', orient: 1, canHaveValue: true, adjacentNodes: [42, 46] },

  // row 5
  { id: 22, x: .5, y: 3.5, value: '', orient: 3 },
  { id: 23, x: 4.5, y: 3.5, value: '', orient: 6 },

  // row 5.5
  { id: 24, x: 1, y: 4.25, value: '3:1', orient: 2, canHaveValue: true, adjacentNodes: [47, 51] },
  { id: 25, x: 2, y: 4.25, value: '', orient: 1 },
  { id: 26, x: 2, y: 4.25, value: '', orient: 2 },
  { id: 27, x: 3, y: 4.25, value: '2:1O', orient: 2, canHaveValue: true, adjacentNodes: [49, 53] },
  { id: 28, x: 3, y: 4.25, value: '', orient: 1 },
  { id: 29, x: 4, y: 4.25, value: '', orient: 1 },
];

module.exports = { ports };
