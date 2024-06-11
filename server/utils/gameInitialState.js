const { hexes } = require('./gameInitialHexes')
const { roads } = require('./gameInitialRoads')
const { settlements } = require('./gameInitialSettlements')
const { ports } = require('./gameInitialPorts')

const gameInitialState = {
    messages: [
        {author: "system",
        body: "creating new game",
        timestamp: Date.now()},
    ],
    host: "",
    createdOn: Date.now(),
    isAlive: true,
    isInInitialSetup: false,
    isInGame: false,
    //TODO maybe create isWaitingForPlayerRoll to precisely track state for reloading
    currentTurn: "",
    dice: [
        {src: '/images/dice/1.png', 
        alt: '1'},
        {src: '/images/dice/1.png', 
        alt: '1'}
    ],
    numSeats: 4, // seats assigned by host during setup
    seats: [],  // array of seated users' usernames
    players: [], // seated users become players on startGame
    hexes: hexes,
    settlements: settlements,
    roads: roads,
    ports: ports,
    devCards: [
        "Knight","Knight","Knight","Knight","Knight","Knight","Knight","Knight","Knight","Knight","Knight","Knight","Knight","Knight",
        "Road Building","Road Building",
        "Year of Plenty","Year of Plenty",
        "Monopoly","Monopoly",
        "Victory Point","Victory Point","Victory Point","Victory Point","Victory Point",
    ],
}

function playerGenerator () {
    return {
        username: "",
        seat: "",
        color: "",
        initialRoll: 0,
        initialOrder: "",
        inventory: {
            roads: 15,
            settlements: 5,
            cities: 4,
            brick: 0,
            lumber: 0,
            sheep: 0,
            wheat: 0,
            ore: 0,
            knight: 0,
            roadBuilding: 0,
            yearOfPlenty: 0,
            monopoly: 0,
            victoryPoint: 0,
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
    }
}

module.exports = { gameInitialState, playerGenerator}