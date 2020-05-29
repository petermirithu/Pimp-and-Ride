var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/signup', function(req, res) {
  res.render('signup', { title: 'Sign Up' });
});
router.get('/signin', function(req, res) {
  res.render('signin', { title: 'Sign In' });
});
module.exports = router;
