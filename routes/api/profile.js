const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//Load Profile Model
const Profile = require('../../models/Profile');
//Load User Profile
const User = require('../../models/User');

//Load Validation
const validateProfileInput = require('../../validation/profile');

//when we are creating routes, instead of commands like app.get etc, we use router.get. We use app.get etc in server.js file

//@route GET api/posts/test
//@desc Tests profile route
//@access Public
router.get('/test', (req, res) => res.json({msg: 'Profile Works'})); //res.json is similar to res.send just it outputs json.


//@route GET api/profile
//@desc Tests profile route
//@access Private
router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.user.id })
    .populate('user', ['name', 'avatar'])  //to fetch user element and display name and avatar in the profile.
    .then(profile => {
      if(!profile) {
        errors.noprofile = 'There is no profile for this user';
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

//@route GET api/profile/all
//@desc Get all profiles for listing
//@access Public
router.get('/all', (req, res) => {
  Profile.find()
  .populate('user', ['name', 'avatar'])
  .then(profiles => {
    if(!profiles) {
      errors.noprofile = 'There are no profiles';
      return res.status(404).json(errors);
    }

    res.json(profiles);
})  .catch(err => res.status(404).json({profile: 'There are no profiles'}));
})

//@route GET api/profile/handle/:handle
//@desc Create or edit user profile
//@access Private
router.get('/handle/:handle',(req,res) => {
  const errors = {};

  Profile.findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if(!profile) {
        errors.noprofile = 'There is no profile for this user';
        res.status(404).json(errors);
      }

      //if profile is found ->
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});
 
//@route GET api/profile/user/:user_id
//@desc Get profile by user ID
//@access Public
router.get('/user/:user_id',(req,res) => {
  const errors = {};

  Profile.findOne({ handle: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if(!profile) {
        errors.noprofile = 'There is no profile for this user';
        res.status(404).json(errors);
      }

      //if profile is found ->
      res.json(profile);
    })
    .catch(err => res.status(404).json({profile: 'There is no profile for this user'})
    );
});


//@route POST api/profile
//@desc Create or Edit user profile
//@access Private
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {

  const {errors, isValid} = validateProfileInput(req.body);

  //Check Validation
  if(!isValid) {
    //Return any errors with 400 status
    return res.status(400).json(errors);
  }

  //Get Fields
  const profileFields = {};
  profileFields.user = req.user.id;
  if(req.body.handle) profileFields.handle = req.body.handle;
  if(req.body.company) profileFields.company = req.body.company;
  if(req.body.location) profileFields.location = req.body.location;
  if(req.body.bio) profileFields.bio = req.body.bio;
  if(req.body.status) profileFields.status = req.body.status;
  if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;

  //Skills - Split into array
  if(typeof req.body.skills !== 'undefined') {
    profileFields.skills = req.body.skills.split(','); //split when comma comes
  }

  //Social
  profileFields.social = {};
  if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
  if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
  if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
  if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
  if(req.body.instagram) profileFields.social.instagram = req.body.instagram;

  Profile.findOne({user: req.user.id})
    .then(profile => {
      if(profile) {
        //update the profile since it already exists
        Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true })
        .then(profile => res.json(profile)); //it will update the profile database with all the new responses coming in and then respond with the updated profile
      } else {
        //Create

        //Check if a handle exists
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if(profile) {
            errors.handle = 'That handle already exists';
            res.status(400).json(errors);
          }

          //Save Profile if the handle is new
          new Profile(profileFields).save().then(profile => res.json(profile));
        });
      }
    })

});

module.exports = router;
