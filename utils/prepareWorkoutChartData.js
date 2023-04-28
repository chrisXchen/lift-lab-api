const moment = require('moment');

function prepareWorkoutChartData(groupedWorkouts) {
  const chartData = [];

  for (const date in groupedWorkouts) {
    for (const workoutName in groupedWorkouts[date]) {
      const weight = groupedWorkouts[date][workoutName].reduce((maxWeight, workout) => {
        return Math.max(maxWeight, workout.weight);
      }, 0);

      chartData.unshift({
        date: moment(date).format('MM/DD/YY'),
        workoutName: workoutName,
        weight: weight,
        });
    }
  }

  return chartData;
}

module.exports = prepareWorkoutChartData;
