const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//Profile Model
const Profile = require('../../models/Profile');

//Post Model
const Post = require('../../models/Post');

//Validation
const validatePostInput = require('../../validation/post');



//when we are creating routes, instead of commands like app.get etc, we use router.get. We use app.get etc in server.js file

//@route GET api/posts/test
//@desc Tests post route
//@access Public
router.get('/test', (req, res) => res.json({msg: 'Posts Works'})); //res.json is similar to res.send just it outputs json.

//@route GET api/posts 
//@desc Get posts
//@access Public
router.get('/', (req, res) => {
  Post.find()
    .sort({date: -1}) //new posts on top
    .then(posts => res.json(posts)) 
    .catch(err => res.status(404).json({nopostsfound:'No posts found with that ID'}));
})

//@route GET api/posts:id
//@desc Get post by id
//@access Public
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .then(posts => res.json(posts)) 
    .catch(err => res.status(404).json({nopostfound:'No post found with that ID'}));
})

//@route POST api/posts 
//@desc Create post
//@access Private (we dont want just anyone to be able to create a post)
router.post('/', passport.authenticate('jwt', {session:false}), (req,res) => {
  //passport.authenticate(jwt) bcz we want to authenticate who is making the post.
  const {erros, isValid} = validatePostInput(req.body);

  // Check Validation
  if(!isValid) {
    //If any errors, then send 400 with errors objects
    return res.status(400).json(errors);
  }

  const newPost = new Post({
    text: req.body.text,
    name: req.body.name,
    avatar: req.body.avatar,
    user: req.user.id
  });

  newPost.save().then(post => res.json(post));
});

//@route Delete api/posts/:id
//@desc Delete post
//@access Private
router.delete('/:id', passport.authenticate('jwt', {session:false}), (req, res) => {
  Profile.findOne({ user: req.user.id})
    .then(profile => {
      Post.findById(req.params.id)  //we pass in req.params.id in findbyid function
      .then(post => {
        //Check for post owner
        if(post.user.toString() !== req.user.id) { 
          return res.status(401).json({notauthorized: 'User not authorised'});
        }

        //Delete
        post.remove().then(() => res.json({success: true}));
      })
      .catch(err => res.status(404).json({postnotfound: 'no post found'}));
    })
})

//@route Post api/posts/like:id
//@desc Like post
//@access Private
router.post('/like/:id', passport.authenticate('jwt', {session:false}), (req, res) => {
  Profile.findOne({ user: req.user.id})
    .then(profile => {
      Post.findById(req.params.id)  //we pass in req.params.id in findbyid function
      .then(post => {
        //If the user has already liked the post, then not letting him like it again.
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0)
          return res.status(400).json({alreadyliked: 'User already liked this post'}
          );

          //Else, Add user id to likes array
          post.likes.unshift({user: req.user.id}); //unshift adds the like to the beginning
          //this is just on the server, now we save it in the database.
          post.save().then(post => res.json(post)); 
      })
      .catch(err => res.status(404).json({postnotfound: 'no post found'}));
    })
})

//@route Post api/posts/unlike:id
//@desc Unlike post
//@access Private
router.post('/unlike/:id', passport.authenticate('jwt', {session:false}), (req, res) => {
  Profile.findOne({ user: req.user.id})
    .then(profile => {
      Post.findById(req.params.id)  //we pass in req.params.id in findbyid function
      .then(post => {
        //If the user has already liked the post, then not letting him like it again.
        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0)
          return res.status(400).json({alreadyliked: 'You have not liked this post yet'}
          );

          //Else, remove the index of the user from the like array
          const removeIndex = post.likes //set it to entire array of likes
            .map(item => item.user.toString())  //take every item and convert it to string
            .indexOf(req.user.id);  //gives us the index of the user whose like we have to remove

          //Splice out of array, ie, remove one element after that index.
          post.likes.splice(removeIndex, 1);

          //Save
          post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({postnotfound: 'no post found'}));
    })
})


// @route   POST api/posts/comment/:id
// @desc    Add comment to post
// @access  Private
router.post(
  '/comment/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check Validation
    if (!isValid) {
      // If any errors, send 400 with errors object
      return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };

        // Add to comments array
        post.comments.unshift(newComment);

        // Save
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
  }
);

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Remove comment from post
// @access  Private
router.delete(
  '/comment/:id/:comment_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        // Check to see if comment exists
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentnotexists: 'Comment does not exist' });
        }

        // Get remove index
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        // Splice comment out of array
        post.comments.splice(removeIndex, 1);

        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
  }
);


module.exports = router;