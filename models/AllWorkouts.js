const mongoose = require('mongoose');

const AllWorkoutSchema = new mongoose.Schema({
  bodyPart: {
    type: String,
    required: false
  },
  equipment: {
    type: String,
    required: false
  },
  gifUrl: {
    type: String,
    required: false
  },
  id: {
    type: String,
    required: false
  },
  name: {
    type: String,
    required: true
  },
  target: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  videoLink: {
    type: String,
    required: false
  },
  slug: {
    type: String,
    required: true,
    unique: true
  }
});

const AllWorkouts = mongoose.model('AllWorkout', AllWorkoutSchema);
module.exports = AllWorkouts;
