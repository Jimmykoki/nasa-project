const mongoose = require('mongoose');
const MONGO_URL = `mongodb+srv://nasa-api:gUIdAf9lQq9AR94O@nasacluster.le4jxec.mongodb.net/nasa2?retryWrites=true&w=majority`; 

mongoose.connection.once('connected', () => {
    console.log('MongoDB connection established successfully!');
  });
  
  mongoose.connection.on('error', (err) => {
    console.log(`MongoDB connection error: ${err}`);
    process.exit(-1);
  });

  async function mongoConnect() {
    await mongoose.connect(MONGO_URL);
  }

  async function mongoDisconnect() {
    await mongoose.disconnect();
  }

  module.exports = { mongoConnect, mongoDisconnect };