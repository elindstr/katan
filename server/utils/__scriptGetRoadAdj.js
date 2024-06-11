// roadAdjacency.js
const { roadData } = require('./scriptRoadPointData');

const MAX_DISTANCE = 50; // Maximum distance to consider points as "close"

// Helper function to calculate the Euclidean distance between two points
function calculateDistance(point1, point2) {
    return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
}

// Function to find adjacent roads
function findAdjacentRoads(roadData) {
    const adjacencies = {};

    roadData.forEach(road => {
        adjacencies[road.id] = new Set();
        road.points.forEach(point => {
            roadData.forEach(otherRoad => {
                if (road.id !== otherRoad.id) {
                    otherRoad.points.forEach(otherPoint => {
                        if (calculateDistance(point, otherPoint) <= MAX_DISTANCE) {
                            adjacencies[road.id].add(otherRoad.id);
                        }
                    });
                }
            });
        });
    });

    // Convert sets to arrays
    for (const key in adjacencies) {
        adjacencies[key] = Array.from(adjacencies[key]);
    }

    return adjacencies;
}

const roadAdjacencies = findAdjacentRoads(roadData);
console.log(roadAdjacencies);

// Export the result if needed elsewhere
module.exports = { roadAdjacencies };
