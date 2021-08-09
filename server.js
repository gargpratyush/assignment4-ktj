const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

const app = express(); //creating an express app

// Body Parser middleware : to use bodyParser in users.js in routes
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//DB Config
const db = require('./config/keys').mongoURI;

//Connect to Mongo DB
mongoose
  .connect(db)
  .then(() => console.log('MongoDB Connected!')) //.then signifies successful connection to mongodb, ie, what to do when it successfully connects to mongoDB
  .catch(err => console.log(err)); //.catch tells what to do when there is an error.

//Passport Middleware
app.use(passport.initialize());

//Passport Config
require('./config/passport')(passport);

//Use Routes
app.use('/api/profile', profile);
app.use('/api/posts', posts);
app.use('/api/users', users);

const port = process.env.PORT || 5000; //for running it locally on port 5000

app.listen(port, () => console.log(`Server running on port ${port}`));

