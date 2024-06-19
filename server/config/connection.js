const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/katan');
console.log(`db connected to ${(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/katan')};`)
module.exports = mongoose.connection;
