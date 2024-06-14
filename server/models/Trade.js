const mongoose = require('mongoose');
const { Schema } = mongoose;

const tradeSchema = new Schema({
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: true,
    },
    offer: {
        type: Object,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    accepted: {
        type: Boolean, 
        default: false,
    }
});

// Toggle accepted field for concurrency control
tradeSchema.pre('save', function (next) {
    if (!this.isNew) {
      this.accepted = true;
    }
    next();
});

const Trade = mongoose.model('Trade', tradeSchema);
module.exports = Trade;
