const express = require('express');
const router = express.Router();

//when we are creating routes, instead of commands like app.get etc, we use router.get. We use app.get etc in server.js file

//@route GET api/posts/test
//@desc Tests post route
//@access Public
router.get('/test', (req, res) => res.json({msg: 'Posts Works'})); //res.json is similar to res.send just it outputs json.

module.exports = router;