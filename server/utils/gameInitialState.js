const gameInitialState = {
    id: "",
    messages: [
        {author: "system",
        body: "creating new game",
        timestamp: Date.now},
    ],
    host: "",
    isAlive: "true",
    isStarted: "false", // false = still waiting for host to start game
    numSeats: 4, // number of seats assigned by host during setup
    dice: [], // two dice values as array, e.g.,: [0,0]
    current_turn: "",
    players: {
        id: "",
        seat: "",
        color: "",
        inventory: {
            roads: 15,
            settlements: 5,
            cites: 4,
            brick: 0,
            lumber: 0,
            sheep: 0,
            wheat: 0,
            ore: 0,
            knight: 0,
            roadBuilding: 0,
            yearOfPlenty: 0,
            monopoly: 0,
        },
        points: {
            settlements: 0,
            cities: 0,
            longestRoad: 0,
            largestArmy: 0,
            victoryPoints: 0,
        },
        roadLength: 0,
        knightCount: 0,
    },
    hexes: [],
    nodes: [],
    roads: [],
    ports: [],
    devCards: [
        "Knight","Knight","Knight","Knight","Knight","Knight","Knight", "Knight","Knight","Knight","Knight","Knight","Knight","Knight",
        "Road Building", "Road Building",
        "Year of Plenty","Year of Plenty",
        "Monopoly","Monopoly",
        "Victory Point","Victory Point","Victory Point","Victory Point",
        "Victory Point",
    ],
}

module.exports = gameInitialState;