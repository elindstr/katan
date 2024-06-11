const mongoose = require('mongoose');
const { Schema } = mongoose;

const gameSchema = new Schema({
  state: {
    type: Object,
    required: true,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
});

const Game = mongoose.model('Game', gameSchema);
module.exports = Game;
