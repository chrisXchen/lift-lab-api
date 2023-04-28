const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true,
    unique: false,
  },
  phoneNumber: {
    type: String,
    required: false
  },
  recordedWorkouts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecordedWorkout',
    default: []
  }],
  preferredWorkouts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AllWorkout',
    default: []
  }]
});

UserSchema.plugin(passportLocalMongoose, { usernameField: 'username' });
UserSchema.index({ username: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema);
