// roads.js
const roads = [
  // row 1
  { id: 0, x: 1.5, y: 0.5, orient: 6, username: '', color: '', adjacentRoadsLeft: [1], adjacentRoadsRight: [11, 12] },
  { id: 1, x: 1.5, y: 0.5, orient: 1, username: '', color: '', adjacentRoadsLeft: [0], adjacentRoadsRight: [2] },
  { id: 2, x: 1.5, y: 0.5, orient: 2, username: '', color: '', adjacentRoadsLeft: [1], adjacentRoadsRight: [3, 4] },

  { id: 3, x: 2.5, y: 0.5, orient: 6, username: '', color: '', adjacentRoadsLeft: [2, 4], adjacentRoadsRight: [14, 15] },
  { id: 4, x: 2.5, y: 0.5, orient: 1, username: '', color: '', adjacentRoadsLeft: [5], adjacentRoadsRight: [2, 3] },
  { id: 5, x: 2.5, y: 0.5, orient: 2, username: '', color: '', adjacentRoadsLeft: [4], adjacentRoadsRight: [6, 7] },

  { id: 6, x: 3.5, y: 0.5, orient: 6, username: '', color: '', adjacentRoadsLeft: [5, 7], adjacentRoadsRight: [17, 18] },
  { id: 7, x: 3.5, y: 0.5, orient: 1, username: '', color: '', adjacentRoadsLeft: [8], adjacentRoadsRight: [5, 6] },
  { id: 8, x: 3.5, y: 0.5, orient: 2, username: '', color: '', adjacentRoadsLeft: [7], adjacentRoadsRight: [9] },
  { id: 9, x: 3.5, y: 0.5, orient: 3, username: '', color: '', adjacentRoadsLeft: [8], adjacentRoadsRight: [20, 21] },

  // row 2
  { id: 10, x: 1, y: 1.25, orient: 6, username: '', color: '', adjacentRoadsLeft: [11], adjacentRoadsRight: [24, 25] },
  { id: 11, x: 1, y: 1.25, orient: 1, username: '', color: '', adjacentRoadsLeft: [10], adjacentRoadsRight: [0, 12] },
  { id: 12, x: 1, y: 1.25, orient: 2, username: '', color: '', adjacentRoadsLeft: [0, 11], adjacentRoadsRight: [13, 14] },

  { id: 13, x: 2, y: 1.25, orient: 6, username: '', color: '', adjacentRoadsLeft: [28, 29], adjacentRoadsRight: [12, 14] },
  { id: 14, x: 2, y: 1.25, orient: 1, username: '', color: '', adjacentRoadsLeft: [12, 13], adjacentRoadsRight: [3, 15] },
  { id: 15, x: 2, y: 1.25, orient: 2, username: '', color: '', adjacentRoadsLeft: [3, 14], adjacentRoadsRight: [16, 17] },

  { id: 16, x: 3, y: 1.25, orient: 6, username: '', color: '', adjacentRoadsLeft: [15, 17], adjacentRoadsRight: [31, 32] },
  { id: 17, x: 3, y: 1.25, orient: 1, username: '', color: '', adjacentRoadsLeft: [15, 16], adjacentRoadsRight: [6, 18] },
  { id: 18, x: 3, y: 1.25, orient: 2, username: '', color: '', adjacentRoadsLeft: [6, 17], adjacentRoadsRight: [19, 20] },

  { id: 19, x: 4, y: 1.25, orient: 6, username: '', color: '', adjacentRoadsLeft: [18, 20], adjacentRoadsRight: [34, 35] },
  { id: 20, x: 4, y: 1.25, orient: 1, username: '', color: '', adjacentRoadsLeft: [18, 19], adjacentRoadsRight: [9, 21] },
  { id: 21, x: 4, y: 1.25, orient: 2, username: '', color: '', adjacentRoadsLeft: [22], adjacentRoadsRight: [20, 9] },
  { id: 22, x: 4, y: 1.25, orient: 3, username: '', color: '', adjacentRoadsLeft: [21], adjacentRoadsRight: [37, 38] },

  // row 3
  { id: 23, x: 0.5, y: 2, orient: 6, username: '', color: '', adjacentRoadsLeft: [24], adjacentRoadsRight: [26] },
  { id: 24, x: 0.5, y: 2, orient: 1, username: '', color: '', adjacentRoadsLeft: [23], adjacentRoadsRight: [10, 25] },
  { id: 25, x: 0.5, y: 2, orient: 2, username: '', color: '', adjacentRoadsLeft: [24, 10], adjacentRoadsRight: [27, 28] },
  { id: 26, x: 0.5, y: 2, orient: 5, username: '', color: '', adjacentRoadsLeft: [23], adjacentRoadsRight: [41, 42] },

  { id: 27, x: 1.5, y: 2, orient: 6, username: '', color: '', adjacentRoadsLeft: [25, 28], adjacentRoadsRight: [42, 43] },
  { id: 28, x: 1.5, y: 2, orient: 1, username: '', color: '', adjacentRoadsLeft: [25, 27], adjacentRoadsRight: [13, 29] },
  { id: 29, x: 1.5, y: 2, orient: 2, username: '', color: '', adjacentRoadsLeft: [13, 28], adjacentRoadsRight: [30, 31] },

  { id: 30, x: 2.5, y: 2, orient: 6, username: '', color: '', adjacentRoadsLeft: [29, 31], adjacentRoadsRight: [46, 47] },
  { id: 31, x: 2.5, y: 2, orient: 1, username: '', color: '', adjacentRoadsLeft: [29, 30], adjacentRoadsRight: [16, 32] },
  { id: 32, x: 2.5, y: 2, orient: 2, username: '', color: '', adjacentRoadsLeft: [16, 31], adjacentRoadsRight: [33, 34] },

  { id: 33, x: 3.5, y: 2, orient: 6, username: '', color: '', adjacentRoadsLeft: [32, 34], adjacentRoadsRight: [49, 50] },
  { id: 34, x: 3.5, y: 2, orient: 1, username: '', color: '', adjacentRoadsLeft: [32, 33], adjacentRoadsRight: [19, 35] },
  { id: 35, x: 3.5, y: 2, orient: 2, username: '', color: '', adjacentRoadsLeft: [34, 19], adjacentRoadsRight: [36, 37] },

  { id: 36, x: 4.5, y: 2, orient: 6, username: '', color: '', adjacentRoadsLeft: [35, 37], adjacentRoadsRight: [52, 53] },
  { id: 37, x: 4.5, y: 2, orient: 1, username: '', color: '', adjacentRoadsLeft: [35, 36], adjacentRoadsRight: [22, 38] },
  { id: 38, x: 4.5, y: 2, orient: 2, username: '', color: '', adjacentRoadsLeft: [39], adjacentRoadsRight: [22, 37] },
  { id: 39, x: 4.5, y: 2, orient: 3, username: '', color: '', adjacentRoadsLeft: [38], adjacentRoadsRight: [40] },
  { id: 40, x: 4.5, y: 2, orient: 4, username: '', color: '', adjacentRoadsLeft: [39], adjacentRoadsRight: [53, 54] },

  // row 4
  { id: 41, x: 1, y: 2.75, orient: 6, username: '', color: '', adjacentRoadsLeft: [44], adjacentRoadsRight: [26, 42] },
  { id: 42, x: 1, y: 2.75, orient: 1, username: '', color: '', adjacentRoadsLeft: [26, 41], adjacentRoadsRight: [27, 43] },
  { id: 43, x: 1, y: 2.75, orient: 2, username: '', color: '', adjacentRoadsLeft: [42, 27], adjacentRoadsRight: [45, 46] },
  { id: 44, x: 1, y: 2.75, orient: 5, username: '', color: '', adjacentRoadsLeft: [41], adjacentRoadsRight: [56, 57] },

  { id: 45, x: 2, y: 2.75, orient: 6, username: '', color: '', adjacentRoadsLeft: [43, 46], adjacentRoadsRight: [57, 58] },
  { id: 46, x: 2, y: 2.75, orient: 1, username: '', color: '', adjacentRoadsLeft: [43, 45], adjacentRoadsRight: [30, 47] },
  { id: 47, x: 2, y: 2.75, orient: 2, username: '', color: '', adjacentRoadsLeft: [30, 46], adjacentRoadsRight: [48, 49] },

  { id: 48, x: 3, y: 2.75, orient: 6, username: '', color: '', adjacentRoadsLeft: [47, 49], adjacentRoadsRight: [62, 63] },
  { id: 49, x: 3, y: 2.75, orient: 1, username: '', color: '', adjacentRoadsLeft: [47, 48], adjacentRoadsRight: [33, 50] },
  { id: 50, x: 3, y: 2.75, orient: 2, username: '', color: '', adjacentRoadsLeft: [49, 33], adjacentRoadsRight: [51, 52] },

  { id: 51, x: 4, y: 2.75, orient: 6, username: '', color: '', adjacentRoadsLeft: [50, 52], adjacentRoadsRight: [67, 68] },
  { id: 52, x: 4, y: 2.75, orient: 1, username: '', color: '', adjacentRoadsLeft: [50, 51], adjacentRoadsRight: [36, 53] },
  { id: 53, x: 4, y: 2.75, orient: 2, username: '', color: '', adjacentRoadsLeft: [36, 52], adjacentRoadsRight: [54, 40] },
  { id: 54, x: 4, y: 2.75, orient: 3, username: '', color: '', adjacentRoadsLeft: [55], adjacentRoadsRight: [53, 40] },
  { id: 55, x: 4, y: 2.75, orient: 4, username: '', color: '', adjacentRoadsLeft: [54], adjacentRoadsRight: [68, 69] },

  // row 5
  { id: 56, x: 1.5, y: 3.5, orient: 6, username: '', color: '', adjacentRoadsLeft: [60], adjacentRoadsRight: [44, 57] },
  { id: 57, x: 1.5, y: 3.5, orient: 1, username: '', color: '', adjacentRoadsLeft: [44, 56], adjacentRoadsRight: [45, 58] },
  { id: 58, x: 1.5, y: 3.5, orient: 2, username: '', color: '', adjacentRoadsLeft: [57, 45], adjacentRoadsRight: [61, 62] },
  { id: 59, x: 1.5, y: 3.5, orient: 4, username: '', color: '', adjacentRoadsLeft: [45, 57], adjacentRoadsRight: [61, 62] },
  { id: 60, x: 1.5, y: 3.5, orient: 5, username: '', color: '', adjacentRoadsLeft: [56], adjacentRoadsRight: [59] },

  { id: 61, x: 2.5, y: 3.5, orient: 6, username: '', color: '', adjacentRoadsLeft: [58, 62], adjacentRoadsRight: [59, 65] },
  { id: 62, x: 2.5, y: 3.5, orient: 1, username: '', color: '', adjacentRoadsLeft: [58, 61], adjacentRoadsRight: [48, 63] },
  { id: 63, x: 2.5, y: 3.5, orient: 2, username: '', color: '', adjacentRoadsLeft: [48, 62], adjacentRoadsRight: [66, 67] },
  { id: 64, x: 2.5, y: 3.5, orient: 4, username: '', color: '', adjacentRoadsLeft: [65], adjacentRoadsRight: [66, 71] },
  { id: 65, x: 2.5, y: 3.5, orient: 5, username: '', color: '', adjacentRoadsLeft: [64], adjacentRoadsRight: [61, 59] },

  { id: 66, x: 3.5, y: 3.5, orient: 6, username: '', color: '', adjacentRoadsLeft: [63, 67], adjacentRoadsRight: [64, 71] },
  { id: 67, x: 3.5, y: 3.5, orient: 1, username: '', color: '', adjacentRoadsLeft: [63, 66], adjacentRoadsRight: [51, 68] },
  { id: 68, x: 3.5, y: 3.5, orient: 2, username: '', color: '', adjacentRoadsLeft: [51, 67], adjacentRoadsRight: [55, 69] },
  { id: 69, x: 3.5, y: 3.5, orient: 3, username: '', color: '', adjacentRoadsLeft: [70], adjacentRoadsRight: [68, 55] },
  { id: 70, x: 3.5, y: 3.5, orient: 4, username: '', color: '', adjacentRoadsLeft: [69], adjacentRoadsRight: [71] },
  { id: 71, x: 3.5, y: 3.5, orient: 5, username: '', color: '', adjacentRoadsLeft: [70], adjacentRoadsRight: [66, 64] },
];

module.exports = { roads };
