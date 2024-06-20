const { hexes } = require('./gameInitialHexes')
const { roads } = require('./gameInitialRoads')
const { settlements } = require('./gameInitialSettlements')
const { ports } = require('./gameInitialPorts')

const gameInitialState = {
    messages: [],
    host: '',
    createdOn: Date.now(),
    isAlive: true,
    isInInitialSetup: false,
    isInGame: false,
    //TODO maybe create isWaitingForPlayerRoll to precisely track state for reloading
    currentTurn: "",
    dice: [
        {value: 1, src: '/images/dice/1.png', alt: 'Die: 1'},
        {value: 1, src: '/images/dice/1.png', alt: 'Die: 1'}
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
    isHandlingSeven: false,
}

function playerGenerator () {
    return {
        username: '',
        seat: '',
        color: '',
        initialState: {
            initialRoll: '',
            placedFirstSettlement: false,
            placedFirstRoad: false,
            placedSecondSettlement: false,
            placedSecondRoad: false,
          },
        turnOrder: '',
        inventory: {
            roads: 15,
            settlements: 5,
            cities: 4,
            wood: 0,
            brick: 0,
            sheep: 0,
            wheat: 0,
            ore: 0,
            knight: 0,
            roadBuilding: 0,
            yearOfPlenty: 0,
            monopoly: 0,
            victoryPoint: 0,
        },
        ports: {
            hasWood: false,
            hasBrick: false,
            hasLumber: false,
            hasSheep: false,
            hasWheat: false,
            hasOre: false,
            hasWild: false
        },
        inventoryQueue: {
            knight: 0,
            roadBuilding: 0,
            yearOfPlenty: 0,
            monopoly: 0,
            victoryPoint: 0,
        },
        roadLength: 0,
        knightCount: 0,
        longestRoad: false,
        largestArmy: false,
        points: 0,
        isHandlingSeven: false,
    }
}

module.exports = { gameInitialState, playerGenerator}