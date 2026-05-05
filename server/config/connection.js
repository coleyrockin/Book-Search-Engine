const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/googlebooks';

mongoose.set('sanitizeFilter', true);

mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

module.exports = {
  connection: mongoose.connection,
  connectDb: () => mongoose.connect(mongoUri),
};
