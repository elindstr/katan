// roads.js
const roads = [
  // row 1
  { id: 0, x: 1.5, y: 0.5, orient: 6, username: '', color: '', adjacentRoads: [1, 11, 12] },
  { id: 1, x: 1.5, y: 0.5, orient: 1, username: '', color: '', adjacentRoads: [1, 2] },
  { id: 2, x: 1.5, y: 0.5, orient: 2, username: '', color: '', adjacentRoads: [1, 3, 4] },

  { id: 3, x: 2.5, y: 0.5, orient: 6, username: '', color: '', adjacentRoads: [2, 4, 14, 15] },
  { id: 4, x: 2.5, y: 0.5, orient: 1, username: '', color: '', adjacentRoads: [2, 3, 5] },
  { id: 5, x: 2.5, y: 0.5, orient: 2, username: '', color: '', adjacentRoads: [4, 6, 7] },

  { id: 6, x: 3.5, y: 0.5, orient: 6, username: '', color: '', adjacentRoads: [5, 7, 17, 18] },
  { id: 7, x: 3.5, y: 0.5, orient: 1, username: '', color: '', adjacentRoads: [5, 6, 8] },
  { id: 8, x: 3.5, y: 0.5, orient: 2, username: '', color: '', adjacentRoads: [7, 9] },
  { id: 9, x: 3.5, y: 0.5, orient: 3, username: '', color: '', adjacentRoads: [8, 20, 21] },

  // row 2
  { id: 10, x: 1, y: 1.25, orient: 6, username: '', color: '', adjacentRoads: [11, 24, 25] },
  { id: 11, x: 1, y: 1.25, orient: 1, username: '', color: '', adjacentRoads: [0, 10, 12] },
  { id: 12, x: 1, y: 1.25, orient: 2, username: '', color: '', adjacentRoads: [0, 11, 13, 14] },

  { id: 13, x: 2, y: 1.25, orient: 6, username: '', color: '', adjacentRoads: [12, 14, 28, 29] },
  { id: 14, x: 2, y: 1.25, orient: 1, username: '', color: '', adjacentRoads: [12, 13, 3, 15] },
  { id: 15, x: 2, y: 1.25, orient: 2, username: '', color: '', adjacentRoads: [14, 3, 16, 17] },

  { id: 16, x: 3, y: 1.25, orient: 6, username: '', color: '', adjacentRoads: [15, 17, 31, 32] },
  { id: 17, x: 3, y: 1.25, orient: 1, username: '', color: '', adjacentRoads: [15, 16, 6, 18] },
  { id: 18, x: 3, y: 1.25, orient: 2, username: '', color: '', adjacentRoads: [6, 17, 19, 20] },

  { id: 19, x: 4, y: 1.25, orient: 6, username: '', color: '', adjacentRoads: [18, 20, 34, 35] },
  { id: 20, x: 4, y: 1.25, orient: 1, username: '', color: '', adjacentRoads: [18, 19, 9, 21] },
  { id: 21, x: 4, y: 1.25, orient: 2, username: '', color: '', adjacentRoads: [20, 9, 22] },
  { id: 22, x: 4, y: 1.25, orient: 3, username: '', color: '', adjacentRoads: [21, 37, 38] },

  // row 3
  { id: 23, x: 0.5, y: 2, orient: 6, username: '', color: '', adjacentRoads: [24, 26] },
  { id: 24, x: 0.5, y: 2, orient: 1, username: '', color: '', adjacentRoads: [23, 10, 25] },
  { id: 25, x: 0.5, y: 2, orient: 2, username: '', color: '', adjacentRoads: [24, 10, 27, 28] },
  { id: 26, x: 0.5, y: 2, orient: 5, username: '', color: '', adjacentRoads: [23, 41, 42] },

  { id: 27, x: 1.5, y: 2, orient: 6, username: '', color: '', adjacentRoads: [25, 28, 42, 43] },
  { id: 28, x: 1.5, y: 2, orient: 1, username: '', color: '', adjacentRoads: [25, 27, 13, 29] },
  { id: 29, x: 1.5, y: 2, orient: 2, username: '', color: '', adjacentRoads: [13, 28, 30, 31] },

  { id: 30, x: 2.5, y: 2, orient: 6, username: '', color: '', adjacentRoads: [29, 31, 46, 47] },
  { id: 31, x: 2.5, y: 2, orient: 1, username: '', color: '', adjacentRoads: [29, 30, 16, 32] },
  { id: 32, x: 2.5, y: 2, orient: 2, username: '', color: '', adjacentRoads: [16, 31, 33, 34] },

  { id: 33, x: 3.5, y: 2, orient: 6, username: '', color: '', adjacentRoads: [32, 34, 49, 50] },
  { id: 34, x: 3.5, y: 2, orient: 1, username: '', color: '', adjacentRoads: [32, 33, 19, 35] },
  { id: 35, x: 3.5, y: 2, orient: 2, username: '', color: '', adjacentRoads: [34, 19, 36, 37] },

  { id: 36, x: 4.5, y: 2, orient: 6, username: '', color: '', adjacentRoads: [35, 37, 52, 53] },
  { id: 37, x: 4.5, y: 2, orient: 1, username: '', color: '', adjacentRoads: [35, 36, 22, 38] },
  { id: 38, x: 4.5, y: 2, orient: 2, username: '', color: '', adjacentRoads: [22, 37, 39] },
  { id: 39, x: 4.5, y: 2, orient: 3, username: '', color: '', adjacentRoads: [38, 40] },
  { id: 40, x: 4.5, y: 2, orient: 4, username: '', color: '', adjacentRoads: [39, 53, 54] },

  // row 4
  { id: 41, x: 1, y: 2.75, orient: 6, username: '', color: '', adjacentRoads: [44, 26, 42] },
  { id: 42, x: 1, y: 2.75, orient: 1, username: '', color: '', adjacentRoads: [26, 41, 27, 43] },
  { id: 43, x: 1, y: 2.75, orient: 2, username: '', color: '', adjacentRoads: [42, 27, 45, 46] },
  { id: 44, x: 1, y: 2.75, orient: 5, username: '', color: '', adjacentRoads: [41, 56, 57] },

  { id: 45, x: 2, y: 2.75, orient: 6, username: '', color: '', adjacentRoads: [43, 46, 57, 58] },
  { id: 46, x: 2, y: 2.75, orient: 1, username: '', color: '', adjacentRoads: [43, 45, 30, 47] },
  { id: 47, x: 2, y: 2.75, orient: 2, username: '', color: '', adjacentRoads: [30, 46, 48, 49] },

  { id: 48, x: 3, y: 2.75, orient: 6, username: '', color: '', adjacentRoads: [47, 49, 62, 63] },
  { id: 49, x: 3, y: 2.75, orient: 1, username: '', color: '', adjacentRoads: [47, 48, 33, 50] },
  { id: 50, x: 3, y: 2.75, orient: 2, username: '', color: '', adjacentRoads: [49, 33, 51, 52] },

  { id: 51, x: 4, y: 2.75, orient: 6, username: '', color: '', adjacentRoads: [50, 52, 67, 68] },
  { id: 52, x: 4, y: 2.75, orient: 1, username: '', color: '', adjacentRoads: [50, 51, 36, 53] },
  { id: 53, x: 4, y: 2.75, orient: 2, username: '', color: '', adjacentRoads: [36, 52, 54, 40] },
  { id: 54, x: 4, y: 2.75, orient: 3, username: '', color: '', adjacentRoads: [53, 40, 55] },
  { id: 55, x: 4, y: 2.75, orient: 4, username: '', color: '', adjacentRoads: [54, 68, 69] },

  // row 5
  { id: 56, x: 1.5, y: 3.5, orient: 6, username: '', color: '', adjacentRoads: [44, 57, 60] },
  { id: 57, x: 1.5, y: 3.5, orient: 1, username: '', color: '', adjacentRoads: [44, 56, 45, 58] },
  { id: 58, x: 1.5, y: 3.5, orient: 2, username: '', color: '', adjacentRoads: [57, 45, 61, 62] },
  { id: 59, x: 1.5, y: 3.5, orient: 4, username: '', color: '', adjacentRoads: [45, 57, 61, 62] },
  { id: 60, x: 1.5, y: 3.5, orient: 5, username: '', color: '', adjacentRoads: [56, 59] },

  { id: 61, x: 2.5, y: 3.5, orient: 6, username: '', color: '', adjacentRoads: [58, 62, 59, 65] },
  { id: 62, x: 2.5, y: 3.5, orient: 1, username: '', color: '', adjacentRoads: [58, 61, 48, 63] },
  { id: 63, x: 2.5, y: 3.5, orient: 2, username: '', color: '', adjacentRoads: [48, 62, 66, 67] },
  { id: 64, x: 2.5, y: 3.5, orient: 4, username: '', color: '', adjacentRoads: [65, 66, 71] },
  { id: 65, x: 2.5, y: 3.5, orient: 5, username: '', color: '', adjacentRoads: [61, 59, 64] },

  { id: 66, x: 3.5, y: 3.5, orient: 6, username: '', color: '', adjacentRoads: [63, 67, 64, 71] },
  { id: 67, x: 3.5, y: 3.5, orient: 1, username: '', color: '', adjacentRoads: [63, 66, 51, 68] },
  { id: 68, x: 3.5, y: 3.5, orient: 2, username: '', color: '', adjacentRoads: [51, 67, 55, 69] },
  { id: 69, x: 3.5, y: 3.5, orient: 3, username: '', color: '', adjacentRoads: [68, 55, 70] },
  { id: 70, x: 3.5, y: 3.5, orient: 4, username: '', color: '', adjacentRoads: [71, 69] },
  { id: 71, x: 3.5, y: 3.5, orient: 5, username: '', color: '', adjacentRoads: [66, 64, 70] },
];

module.exports = { roads };
