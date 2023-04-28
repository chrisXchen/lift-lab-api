const mongoose = require('mongoose');
const AllWorkouts = require('../models/AllWorkouts');
const workouts = require('./workouts.json');
const testWorkouts = require('./testWorkouts.json');
require('dotenv').config({ path: '../.env' });

/*
  REMEMBER:
    workouts.json file is from List of All Exercises endpoint at:
      https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb

    specifically:
      https://exercisedb.p.rapidapi.com/exercises
*/

const connectionString = process.env.MONGODB_URI;

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

const uploadWorkouts = async (workouts) => {
  const promises = workouts.map((workout) => {
    return AllWorkouts.updateOne(
      { name: workout.name }, // Query - finds document with matching 'name' values
      { $set: workout }, // Update - if document was found sets the document fields to the workout object
      { upsert: true } // Upsert - if no document was found it uploads the document
    ).exec();
  });

  try {
    await Promise.all(promises);
    console.log(`Upserted ${workouts.length} workouts into the AllWorkouts collection`);
  } catch (error) {
    console.error('Error upserting workouts:', error);
  } finally {
    mongoose.connection.close();
  }
};

const init = async () => {
  await connectToMongoDB();

  /*
    IMPORTANT BEFORE RUNNING:
      decide whether to use
        testWorkouts
      or
        workouts
  */
  await uploadWorkouts(testWorkouts);
};

init();
