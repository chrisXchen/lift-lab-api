/*
  PURPOSE:
    This script is adding a "slug" field to each object in
    the allworkouts collection
*/
const mongoose = require('mongoose');
const AllWorkouts = require('../models/AllWorkouts');
require('dotenv').config({ path: '../.env' });

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

const generateSlug = (name) => {
  return name.toLowerCase().split(' ').join('-');
};

const updateAllWorkoutsSlug = async () => {
  try {
    const allWorkouts = await AllWorkouts.find({});

    const updatePromises = allWorkouts.map((workout) => {
      const slug = generateSlug(workout.name);
      return AllWorkouts.updateOne(
        { _id: workout._id },
        { $set: { slug } }
      ).exec();
    });

    await Promise.all(updatePromises);

    console.log('Updated all workouts with slug field');
  } catch (error) {
    console.error('Error updating workouts with slug:', error);
  } finally {
    mongoose.connection.close();
  }
};

const init = async () => {
  await connectToMongoDB();
  await updateAllWorkoutsSlug();
};

init()
