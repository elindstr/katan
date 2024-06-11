// hexes.js
const hexes = [
  { id: 0, x: 1.5, y: 0.5, value: '2', resource: "wood", hasRobber: false, adjacentNodes: [3, 0, 4, 8, 12, 7] },
  { id: 1, x: 2.5, y: 0.5, value: '3', resource: "wood", hasRobber: false, adjacentNodes: [4, 1, 5, 9, 13, 8]  },
  { id: 2, x: 3.5, y: 0.5, value: '3', resource: "wood", hasRobber: false, adjacentNodes: [5, 2, 6, 10, 14, 9] },
  { id: 3, x: 1, y: 1.25, value: '4', resource: "wood", hasRobber: false, adjacentNodes: [11, 7, 12, 17, 22, 16] },
  { id: 4, x: 2, y: 1.25, value: '4', resource: "brick", hasRobber: false, adjacentNodes: [12, 8, 13, 18, 23, 17] },
  { id: 5, x: 3, y: 1.25, value: '5', resource: "brick", hasRobber: false, adjacentNodes: [13, 9, 14, 19, 24, 18] },
  { id: 6, x: 4, y: 1.25, value: '5', resource: "brick", hasRobber: false, adjacentNodes: [14, 10, 15, 20, 25, 19] },
  { id: 7, x: 0.5, y: 2, value: '6', resource: "sheep", hasRobber: false, adjacentNodes: [21, 16, 22, 28, 33, 27] },
  { id: 8, x: 1.5, y: 2, value: '6', resource: "sheep", hasRobber: false, adjacentNodes: [22, 17, 23, 29, 34, 28] },
  { id: 9, x: 2.5, y: 2, value: '8', resource: "sheep", hasRobber: false, adjacentNodes: [23, 18, 24, 30, 35, 29] },
  { id: 10, x: 3.5, y: 2, value: '8', resource: "sheep", hasRobber: false, adjacentNodes: [24, 19, 25, 31, 36, 30] },
  { id: 11, x: 4.5, y: 2, value: '9', resource: "wheat", hasRobber: false, adjacentNodes: [25, 20, 26, 32, 37, 31] },
  { id: 12, x: 1, y: 2.75, value: '9', resource: "wheat", hasRobber: false, adjacentNodes: [33, 28, 34, 39, 43, 38] },
  { id: 13, x: 2, y: 2.75, value: '10', resource: "wheat", hasRobber: false, adjacentNodes: [34, 29, 35, 40, 44, 39] },
  { id: 14, x: 3, y: 2.75, value: '10', resource: "wheat", hasRobber: false, adjacentNodes: [35, 30, 36, 41, 45, 40] },
  { id: 15, x: 4, y: 2.75, value: '11', resource: "ore", hasRobber: false, adjacentNodes: [36, 31, 37, 42, 46, 41] },
  { id: 16, x: 1.5, y: 3.5, value: '11', resource: "ore", hasRobber: false, adjacentNodes: [43, 39, 44, 48, 51, 47] },
  { id: 17, x: 2.5, y: 3.5, value: '12', resource: "ore", hasRobber: false, adjacentNodes: [44, 40, 45, 49, 52, 48] },
  { id: 18, x: 3.5, y: 3.5, value: '', resource: "desert", hasRobber: true, adjacentNodes: [45, 41, 46, 50, 53, 49] }
];

module.exports = { hexes };
