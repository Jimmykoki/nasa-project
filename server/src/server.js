const http = require('http');

const app = require('./app');

const mongoose = require('mongoose');

const { loadPlanetsData } = require('./models/planets.model');
const PORT = process.env.PORT || 8000;

const MONGO_URL = `mongodb+srv://nasa-api:gUIdAf9lQq9AR94O@nasacluster.le4jxec.mongodb.net/nasa2?retryWrites=true&w=majority`;

const server = http.createServer(app);

mongoose.connection.once('connected', () => {
  console.log('MongoDB connection established successfully!');
});

mongoose.connection.on('error', (err) => {
  console.log(`MongoDB connection error: ${err}`);
  process.exit(-1);
});

async function startServer() {
  await mongoose.connect(MONGO_URL);
  await loadPlanetsData();
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
