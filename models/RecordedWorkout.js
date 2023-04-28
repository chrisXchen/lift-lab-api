const mongoose = require('mongoose');
const { Schema } = mongoose;

const RecordedWorkoutSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  UUID: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  workout: {
    type: Schema.Types.ObjectId,
    ref: 'AllWorkout',
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  reps: {
    type: Number,
    required: true,
  },
});

const RecordedWorkout = mongoose.model('RecordedWorkout', RecordedWorkoutSchema);

module.exports = RecordedWorkout;
