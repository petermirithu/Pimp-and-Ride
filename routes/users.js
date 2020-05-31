var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const multer = require('multer');
const User = require("../models").users;
const Profile = require("../models").profiles;
const Cart = require("../models").cart;
const Order = require("../models").order;
const Product = require("../models").products;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/profile')
  },
  filename: function (req, file, cb) {      
    cb(null, file.originalname)
  }
});
var upload = multer({storage: storage})

/* GET users . */
router.get('/signup',async function(req, res) {
  var cart=null
  if (req.user){
    cart = await Cart.findOne(
      {include: [{model: Order,as: 'Cart',include: [{model:Product,as:'Product'}]}]},    
      {where:{userId:req.user.id}})        
  }
  res.render('signup', { title: 'Sign Up',cart:cart });
});
router.get('/signin', async function(req, res) {
  var cart=null
  if (req.user){
    cart = await Cart.findOne(
      {include: [{model: Order,as: 'Cart',include: [{model:Product,as:'Product'}]}]},    
      {where:{userId:req.user.id}})        
  }
  res.render('signin', { title: 'Sign In',cart:cart });
});

router.get('/profile',async(req,res) => {
  let profile= await Profile.findOne({where: {userId: req.user.id}})
  let cart = await Cart.findOne(
    {include: [{model: Order,as: 'Cart',include: [{model:Product,as:'Product'}]}]},    
    {where:{userId:req.user.id}})        
  res.render('profile',{title:'Profile',profile:profile,cart:cart})
})

router.get('/update/profile', async function(req, res) {
  let cart = await Cart.findOne(
    {include: [{model: Order,as: 'Cart',include: [{model:Product,as:'Product'}]}]},    
    {where:{userId:req.user.id}})        
  res.render('updateprofile', { title: 'Update Profile',cart:cart });
});

// posts
router.post('/update/profile/pic', upload.single('photo') , async(req, res) => {    
  try {
    return Profile
      .update(        
        { profile_pic: req.file.filename},        
        { where: { id: parseInt(req.user.id)} 
      })
      .then(
        req.flash('success','Profile picture has been updated'),        
        res.redirect('/users/profile'))

  } catch(error){
      res.status(400).send(error)                  
  }        
});

router.post('/profile', async(req, res) => {           
  try {
    return Profile
      .update({ firstname: req.body.fname,lastname: req.body.lname,about: req.body.about},
        { where: {userId: parseInt(req.user.id) } 
      })
      .then(
        req.flash('success','Your Profile has been updated'),        
        res.redirect('/users/profile'))

  } catch(error){    
    res.status(400).send(error)                  
  }
})

router.post('/register',function(req,res){
  const username = req.body.username;  
  const email = req.body.email;  
  const password = req.body.password;
  const password2 = req.body.password2;

  req.checkBody('username', 'Username is *required').notEmpty();  
  req.checkBody('email', 'Email is *required').notEmpty();
  req.checkBody('password', 'Password is *required').notEmpty();
  req.checkBody('password2', 'Confirm password is *required').notEmpty();
  req.checkBody('password2', 'Passwords do not *match. Try again!').equals(req.body.password);

  let errors = req.validationErrors();

  if(errors){    
    req.flash('error',errors[0].msg,)          
    res.redirect('/users/signup')                                          
  }else{
    
    bcrypt.genSalt(10, function(err,salt){
      bcrypt.hash(password, salt, function(err,hash){
        if(err){
          console.log(err);
        }               
        const hashedpwd=hash
        return User.create({ username:username, email:email, password:hashedpwd}).then(
          req.flash('success','You are now registered and can Log in'),
          res.redirect('/users/signin')                                      
        );                          
      })
    })    
  }
});

router.post('/login',function(req,res,next){
  passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/users/signin',
    failureFlash:true,
  })(req,res,next);    
});

router.get('/logout',function(req,res){
  req.logOut();
  req.flash('success', ' Your Logged Out!');
  res.redirect('/')
})

module.exports = router;
