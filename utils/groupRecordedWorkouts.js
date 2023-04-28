/*
  PURPOSE:
    groups a user's recorded workouts by date and workoutname
*/
function groupRecordedWorkouts(recordedWorkouts) {
  const groupedData = {};

  recordedWorkouts.forEach(workout => {
    const date = workout.date;
    const workoutName = workout.workout.name;

    if (!groupedData[date]) {
      groupedData[date] = {};
    }

    if (!groupedData[date][workoutName]) {
      groupedData[date][workoutName] = [];
    }

    groupedData[date][workoutName].push(workout);
  });

  return groupedData;
}

module.exports = groupRecordedWorkouts;
