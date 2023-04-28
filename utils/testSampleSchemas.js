const mongoose = require('mongoose');
const User = require('../models/User');
const AllWorkouts = require('../models/AllWorkouts');
const RecordedWorkouts = require('../models/RecordedWorkout');
const moment = require('moment');
require('dotenv').config({ path: '../.env' });

const connectionString = process.env.MONGODB_URI;

// Connect to MongoDB
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

// Instantiate datetimestamp with moment
const now = moment();

// Create basic sample data
const sampleAllWorkout = new AllWorkouts({
  name: 'test workout',
  equipment: 'dumbbell',
  slug: 'test-workout',
});

const sampleUser = new User({
  username: 'chris@test.com',
  firstName: 'Chris',
});

// Save all the sample data to the database
async function saveSampleData() {
  try {
    await sampleAllWorkout.save();
    const savedUser = await sampleUser.save();

    const sampleRecordedWorkouts = new RecordedWorkouts({
      user: savedUser._id,
      UUID: 'test-uuid',
      date: now.format(),
      workout: sampleAllWorkout._id,
      weight: 100,
      reps: 10,
    });

    await sampleRecordedWorkouts.save();

    console.log('Sample data saved successfully');
  } catch (error) {
    console.error('Error saving sample data:', error);
  } finally {
    mongoose.connection.close();
  }
}

// First explicitly connect to mongoose THEN run actions
async function init() {
  await connectToMongoDB();
  await saveSampleData();
}

init();
