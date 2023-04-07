const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const Workout = require('./models/Workout');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

app.get('/', (req, res) => {
  res.send('Lift Lab API');
});

// GET - list all workouts
app.get('/api/workouts', async (req, res) => {
  try {
    const workouts = await Workout.find();
    res.json(workouts);
    console.log("Found workouts");
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("Failed to find workouts");
  }
});

// POST - add a workout to the list of all workouts
app.post('/api/workouts', async (req, res) => {
  const workout = new Workout({
    name: req.body.name,
  });

  try {
    const newWorkout = await workout.save();
    res.status(201).json(newWorkout);
    console.log("Added workout");
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.log("Failed to add workout");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
