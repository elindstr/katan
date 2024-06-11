// settlements.js
const settlements = [
  { id: 0, x: 2, y: 0.5, isCity: false, username: '', color: '', adjacentRoads: [1, 2] },
  { id: 1, x: 3, y: 0.5, isCity: false, username: '', color: '', adjacentRoads: [4, 5] },
  { id: 2, x: 4, y: 0.5, isCity: false, username: '', color: '', adjacentRoads: [7, 8] },
  
  { id: 3, x: 1.5, y: 0.75, isCity: false, username: '', color: '', adjacentRoads: [1, 0] },
  { id: 4, x: 2.5, y: 0.75, isCity: false, username: '', color: '', adjacentRoads: [2, 4, 3] },
  { id: 5, x: 3.5, y: 0.75, isCity: false, username: '', color: '', adjacentRoads: [5, 7, 6] },
  { id: 6, x: 4.5, y: 0.75, isCity: false, username: '', color: '', adjacentRoads: [8, 9] },

  { id: 7, x: 1.5, y: 1.25, isCity: false, username: '', color: '', adjacentRoads: [11, 0, 12] },
  { id: 8, x: 2.5, y: 1.25, isCity: false, username: '', color: '', adjacentRoads: [14, 3, 15] },
  { id: 9, x: 3.5, y: 1.25, isCity: false, username: '', color: '', adjacentRoads: [17, 6, 18] },
  { id: 10, x: 4.5, y: 1.25, isCity: false, username: '', color: '', adjacentRoads: [20, 9, 21] },

  { id: 11, x: 1, y: 1.5, isCity: false, username: '', color: '', adjacentRoads: [11, 10] },
  { id: 12, x: 2, y: 1.5, isCity: false, username: '', color: '', adjacentRoads: [12, 14, 13] },
  { id: 13, x: 3, y: 1.5, isCity: false, username: '', color: '', adjacentRoads: [15, 17, 16] },
  { id: 14, x: 4, y: 1.5, isCity: false, username: '', color: '', adjacentRoads: [18, 20, 19] },
  { id: 15, x: 5, y: 1.5, isCity: false, username: '', color: '', adjacentRoads: [21, 22] },

  { id: 16, x: 1, y: 2, isCity: false, username: '', color: '', adjacentRoads: [10, 25, 24] },
  { id: 17, x: 2, y: 2, isCity: false, username: '', color: '', adjacentRoads: [28, 13, 29] },
  { id: 18, x: 3, y: 2, isCity: false, username: '', color: '', adjacentRoads: [31, 16, 32] },
  { id: 19, x: 4, y: 2, isCity: false, username: '', color: '', adjacentRoads: [34, 19, 35] },
  { id: 20, x: 5, y: 2, isCity: false, username: '', color: '', adjacentRoads: [37, 22, 38] },

  { id: 21, x: 0.5, y: 2.25, isCity: false, username: '', color: '', adjacentRoads: [24, 23] },
  { id: 22, x: 1.5, y: 2.25, isCity: false, username: '', color: '', adjacentRoads: [25, 28, 27] },
  { id: 23, x: 2.5, y: 2.25, isCity: false, username: '', color: '', adjacentRoads: [29, 31, 30] },
  { id: 24, x: 3.5, y: 2.25, isCity: false, username: '', color: '', adjacentRoads: [32, 34, 33] },
  { id: 25, x: 4.5, y: 2.25, isCity: false, username: '', color: '', adjacentRoads: [35, 37, 36] },
  { id: 26, x: 5.5, y: 2.25, isCity: false, username: '', color: '', adjacentRoads: [38, 39] },

  { id: 27, x: 0.5, y: 2.75, isCity: false, username: '', color: '', adjacentRoads: [23, 26] },
  { id: 28, x: 1.5, y: 2.75, isCity: false, username: '', color: '', adjacentRoads: [42, 27, 43] },
  { id: 29, x: 2.5, y: 2.75, isCity: false, username: '', color: '', adjacentRoads: [46, 30, 47] },
  { id: 30, x: 3.5, y: 2.75, isCity: false, username: '', color: '', adjacentRoads: [49, 33, 50] },
  { id: 31, x: 4.5, y: 2.75, isCity: false, username: '', color: '', adjacentRoads: [52, 36, 53] },
  { id: 32, x: 5.5, y: 2.75, isCity: false, username: '', color: '', adjacentRoads: [40, 39] },

  { id: 33, x: 1, y: 3, isCity: false, username: '', color: '', adjacentRoads: [26, 42, 41] },
  { id: 34, x: 2, y: 3, isCity: false, username: '', color: '', adjacentRoads: [43, 46, 45] },
  { id: 35, x: 3, y: 3, isCity: false, username: '', color: '', adjacentRoads: [47, 49, 48] },
  { id: 36, x: 4, y: 3, isCity: false, username: '', color: '', adjacentRoads: [50, 52, 51] },
  { id: 37, x: 5, y: 3, isCity: false, username: '', color: '', adjacentRoads: [53, 40, 54] },

  { id: 38, x: 1, y: 3.5, isCity: false, username: '', color: '', adjacentRoads: [41, 44] },
  { id: 39, x: 2, y: 3.5, isCity: false, username: '', color: '', adjacentRoads: [57, 45, 58] },
  { id: 40, x: 3, y: 3.5, isCity: false, username: '', color: '', adjacentRoads: [48, 63, 62] },
  { id: 41, x: 4, y: 3.5, isCity: false, username: '', color: '', adjacentRoads: [51, 68, 67] },
  { id: 42, x: 5, y: 3.5, isCity: false, username: '', color: '', adjacentRoads: [54, 55] },

  { id: 43, x: 1.5, y: 3.75, isCity: false, username: '', color: '', adjacentRoads: [44, 57, 56] },
  { id: 44, x: 2.5, y: 3.75, isCity: false, username: '', color: '', adjacentRoads: [58, 62, 61] },
  { id: 45, x: 3.5, y: 3.75, isCity: false, username: '', color: '', adjacentRoads: [63, 67, 66] },
  { id: 46, x: 4.5, y: 3.75, isCity: false, username: '', color: '', adjacentRoads: [68, 55, 69] },

  { id: 47, x: 1.5, y: 4.25, isCity: false, username: '', color: '', adjacentRoads: [56, 60] },
  { id: 48, x: 2.5, y: 4.25, isCity: false, username: '', color: '', adjacentRoads: [61, 65, 59] },
  { id: 49, x: 3.5, y: 4.25, isCity: false, username: '', color: '', adjacentRoads: [66, 71, 64] },
  { id: 50, x: 4.5, y: 4.25, isCity: false, username: '', color: '', adjacentRoads: [69, 70] },

  { id: 51, x: 2, y: 4.5, isCity: false, username: '', color: '', adjacentRoads: [60, 59] },
  { id: 52, x: 3, y: 4.5, isCity: false, username: '', color: '', adjacentRoads: [65, 64] },
  { id: 53, x: 4, y: 4.5, isCity: false, username: '', color: '', adjacentRoads: [71, 70] },
];

module.exports = { settlements };
