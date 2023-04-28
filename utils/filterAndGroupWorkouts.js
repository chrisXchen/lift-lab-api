const groupRecordedWorkouts = require('./groupRecordedWorkouts');

function filterAndGroupWorkouts(recordedWorkouts, workoutSlug, userId) {
  const filteredWorkouts = recordedWorkouts.filter((rw) =>
    rw.user._id.toString() === userId && rw.workout.slug === workoutSlug
  );
  return groupRecordedWorkouts(filteredWorkouts);
}

module.exports = filterAndGroupWorkouts;
