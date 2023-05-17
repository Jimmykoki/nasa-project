const { response } = require('../app');
const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');
const axios = require('axios');

const DEFAULT_FLIGHT_NUMBER = 100;

//const launches = new Map();
// const launch = {
//   flightNumber: 100,
//   mission: 'Kepler Exploration X',
//   rocket: 'Explorer IS1',
//   launchDate: new Date('December 27, 2030'),
//   target: 'Kepler-442 b',
//   customers: ['ZTM', 'NASA'],
//   upcoming: true,
//   success: true,
// };

// saveLaunch(launch);

const SPACE_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populatLaunches() {
  console.log('Load Launch Data');
  const response = await axios.post(SPACE_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1,
          },
        },
        {
          path: 'payloads',
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.log('Problem downloading launch data');
    throw new Error('Launch data download failed');
  }

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const playloads = launchDoc['payloads'];
    const customes = playloads.flatMap((payload) => {
      return payload['customers'];
    });

    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customers: customes,
    };

    console.log(`${launch.flightNumber} ${launch.mission}`);
    await saveLaunch(launch);
  }
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    mission: 'FalconSat',
    rocket: 'Falcon 1',
  });
  if (firstLaunch) {
    console.log('Launch data already loaded!');
    return;
  } else {
    await populatLaunches();
  }
}

async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter);
}

async function existsLaunchWithId(launchId) {
  return await findLaunch({
    flightNumber: launchId,
  });
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase.findOne({}).sort('-flightNumber');
  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
  return await launchesDatabase
    .find(
      {},
      {
        _id: 0,
        __v: 0,
      }
    )
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

// async function saveLaunch(launch) {
//   const planet = await planets.findOne({
//     keplerName: launch.target,
//   });

//   if (!planet) {
//     throw new Error('No matching planet was found');
//   }

//   const newFlightNumber = await getLatestFlightNumber() + 1;

//   await launchesDatabase.updateOne(
//     {
//       flightNumber: launch.flightNumber,
//     },
//     launch,
//     { upsert: true }
//   );

//   saveLaunch(launch);
// }

async function saveLaunch(launch) {
  await launchesDatabase.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });

  if (!planet) {
    throw new Error('No matching planet was found');
  }

  const newFlightNumber = (await getLatestFlightNumber()) + 1;

  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ['Zero to Mastery', 'NASA'],
    flightNumber: newFlightNumber,
  });

  await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
  const aborted = await launchesDatabase.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );

  return aborted.modifiedCount === 1;
}

module.exports = {
  loadLaunchData,
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
};

// using these model files here to act as the data acceess layer that controls how data is stored and retrieved from the database
