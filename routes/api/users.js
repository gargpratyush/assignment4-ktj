const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

//Load input Validation
const validateRegisterInput = require('../../validation/register');


//Load User Model
const User = require('../../models/User');
const { session } = require('passport');

//when we are creating routes, instead of commands like app.get etc, we use router.get. We use app.get etc in server.js file

//@route GET api/posts/test
//@desc Tests users route
//@access Public
router.get('/test', (req, res) => res.json({msg: 'Users Works'})); //res.json is similar to res.send just it outputs json.

//@route GET api/users/register
//@desc Register user
//@access Public
router.post('/register', (req, res) => {
  const {errors, isValid} = validateRegisterInput(req.body); //req.body requests everything which is sent to this route, ie, name, email, password.

  //if isValid is false, that means there are errors.
  if(!isValid) {
    return res.status(400).json(errors);
  }



  User.findOne({ email: req.body.email }) //to use req.body, you need the middleware 'Body Parser'
    .then(user => {
       //to find if the email user is trying to register with is already registered or not
      if(user) {   //If such a user with already registered email is found then change the http status to 400 (error)
        errors.email = 'Email already exists';
        return res.status(400).json(errors);
      } else {
        const avatar = gravatar.url(req.body.email, {
          s: '200', //size
          r: 'pg', //rating (nudity allowed or not)
          d: 'mm' //Default
        });

        //Store the information in a constant named newUser.
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          avatar: avatar,
          password: req.body.password
        });

        bcrypt.genSalt(10, (err, salt) => { //10 character salt is added. Err and salt are the two parameters genSalt will generate
          bcrypt.hash(newUser.password, salt, (err, hash) => { //this will generate the hash for the password+salt combination and if we have any error, we 'throw' it otherwise we update the user password in our database with the newly generated hash and save it.
            if(err) throw err;
            newUser.password = hash;
            newUser.save()
              .then(user => res.json(user) //sends back a successful response for that user
              .catch(err => console.log(err)));
          } )
        })
      }
    })     
 
});

//@route GET api/users/login
//@desc Login user / Returning JWT token
//@access Public
router.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  //here we are logging in the user, ie, if the email id password combination is correct then he is allowed to go the website.
  //Find user by email
  User.findOne({email})
    .then(user=> {
      //Check for user
      if(!user) {
        return res.status(404).json({email: 'User not found'});
      }
    
    //Check password
    bcrypt.compare(password, user.password)
      .then(isMatch => {
        if(isMatch) {
          //User matched
          const payload = { id: user.id, name: user.name, avatar: user.avatar } //Create JWT Payload


          //Sign token
          
          jwt.sign(
            payload, 
            keys.secretOrKey, 
            {expiresIn: 3600 }, 
            (err, token) => {
              res.json({
                success: true,
                token: 'Bearer ' + token
              })
          }); //token expires if unused for an hour
        } else {
          return res.status(400).json({password: 'Password incorrect'});
        }

      })
    })
})


//@route GET api/users/current
//@desc return current user
//@access Private
router.get(
  '/current', 
  passport.authenticate('jwt', {session : false}), //Session: false because user cannot access this route.
  (req, res) => { //if a request comes, we respond by giving back a json object consisting id, name, and email (we don't send password back, otherwise we could have just wrote, "res.json(req.user);").
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.name
    }); 
    
});

module.exports = router;