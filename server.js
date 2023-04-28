const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const groupRecordedWorkouts = require('./utils/groupRecordedWorkouts');
const filterAndGroupWorkouts = require('./utils/filterAndGroupWorkouts');
const prepareWorkoutChartData = require('./utils/prepareWorkoutChartData');

const User = require('./models/User');
const AllWorkouts = require('./models/AllWorkouts');
const RecordedWorkout = require('./models/RecordedWorkout');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


// configuring sessions + user auth with Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// connecting to db
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


// Configuring User Info Handling routes
// POST - Register new user
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, firstName } = req.body;
    console.log(username, password, firstName);
    const user = new User({ username, firstName });
    const registeredUser = await User.register(user, password);
    passport.authenticate('local')(req, res, () => {
      res.status(201).json(registeredUser);
      console.log('User registered');
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.log('Failed to register user');
  }
});


// POST - Login user
app.post('/api/login', passport.authenticate('local'), (req, res) => {
  res.status(200).json(req.user);
  console.log('User logged in');
});

// GET - Logout user
app.get('/api/logout', async (req, res) => {
  await new Promise((resolve) => req.logout(resolve));
  res.send('User logged out');
  console.log('User logged out');
});

// GET - grab user information
app.get('/api/user', (req, res) => {
  if (req.user) {
    res.json({ _id: req.user._id, username: req.user.username });
    console.log('User info gotten');
  } else {
    res.status(401).json({ message: 'Unauthorized access' });
    console.log('Failed to get user info');
  }
});


// Configuring routes for allworkouts collection
// GET - list all allworkouts
app.get('/api/all-workouts', async (req, res) => {
  try {
    const allWorkouts = await AllWorkouts.find();
    res.json(allWorkouts);
    console.log('All workouts gotten');
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log('Failed to get workouts');
  }
});

// GET - search allworkouts collection for a regex name value
app.get('/api/search-all-workouts', async (req, res) => {
  try {
    const searchInput = req.query.search.toLowerCase();
    const workouts = await AllWorkouts.find({ name: { $regex: searchInput } });
    res.status(200).json(workouts);
    console.log("Found specific workouts");
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.log('Failed to search workouts');
  }
});

// GET - search allworkouts collection for a specific workout slug
app.get('/api/slug-search-all-workouts', async (req, res) => {
  try {
    const searchInput = req.query.search.toLowerCase();
    const workout = await AllWorkouts.find({ slug: searchInput });
    res.status(200).json(workout);
    console.log("Found the specific workout from the slug!");
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.log("Failed to find the specific workout from slug");
  }
})

// Configuring routes for recordedworkouts collection
// GET - list all recordedworkouts for a user
app.get('/api/recorded-workouts', async (req, res) => {
  const userId = req.query.userId;

  try {
    const user = await User.findById(userId).populate({
      path: 'recordedWorkouts',
      populate: { path: 'workout' },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      console.log("User not even found");
    } else {
      const groupedData = groupRecordedWorkouts(user.recordedWorkouts);
      res.json(groupedData);
      console.log("User's recorded workouts found and grouped")
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("Error getting user's recorded workouts");
  }
});

// GET - filter and group recorded workouts for a user by workout slug
app.get('/api/filter-recorded-workouts', async (req, res) => {
  const { workoutSlug, userId } = req.query;
  try {
    const recordedWorkouts = await RecordedWorkout.find().populate('user').populate('workout');
    const filteredGroupedWorkouts = filterAndGroupWorkouts(recordedWorkouts, workoutSlug, userId);
    res.json(filteredGroupedWorkouts);
    console.log("User's recorded workouts found, filtered, and grouped");
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// GET - workout chart data for a user by workout slug
app.get('/api/workout-chart-data', async (req, res) => {
  const { workoutSlug, userId } = req.query;

  try {
    const recordedWorkouts = await RecordedWorkout.find().populate('user').populate('workout');
    const filteredGroupedWorkouts = filterAndGroupWorkouts(recordedWorkouts, workoutSlug, userId);
    const chartData = prepareWorkoutChartData(filteredGroupedWorkouts);
    res.json(chartData);
    console.log("User's workout chart data found, filtered, and grouped");
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});


// POST - add a RecordedWorkout for a user
app.post('/api/recorded-workouts', async (req, res) => {
  const { user, UUID, date, workout, weight, reps } = req.body;

  const newRecordedWorkout = new RecordedWorkout({
    user, // user._id
    UUID,
    date,
    workout, // workout._id
    weight,
    reps
  });

  try {
    const savedRecordedWorkout = await newRecordedWorkout.save();

    // Update the USER's recordedWorkouts field
    await User.findByIdAndUpdate(user, {
      $push: { recordedWorkouts: savedRecordedWorkout._id },
    });

    res.status(201).json(savedRecordedWorkout);
    console.log('Added workout to recorded workouts');
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.log('Failed to add workout');
  }
});

// Configuring routes for preferredWorkouts handling
// GET - list preferred workouts for a user
app.get('/api/preferred-workouts', async (req, res) => {
  const userId = req.query.userId;

  try {
    const user = await User.findById(userId).populate('preferredWorkouts');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.json(user.preferredWorkouts);
      console.log("User's preferred workouts found");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("Error getting user's preferred workouts");
  }
});

// POST - add a workout to the user's preferred workouts
app.post('/api/preferred-workouts', async (req, res) => {
  const { userId, workoutId } = req.body;

  try {
    const user = await User.findById(userId);
    const workout = await AllWorkouts.findById(workoutId);

    if (!user || !workout) {
      res.status(404).json({ message: 'User or workout not found' });
      console.log('Failed to add preferred workout');
    } else {
      if (user.preferredWorkouts.includes(workout._id)) {
        res.status(400).json({ message: 'Workout is already in the preferred workouts list' });
        console.log('Workout is already in the preferred workouts list');
      } else {
        user.preferredWorkouts.push(workout._id);
        await user.save();
        res.status(201).json(workout);
        console.log('Workout added to preferred workouts');
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log('Error adding workout to preferred workouts');
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
