var express = require('express');
var router = express.Router();
const Product = require("../models").products;
const Category = require("../models").category;
const Cart = require("../models").cart;
const Order = require("../models").order;

/* GET home page. */
router.get('/', async(req, res) => {  
  let products = await Product.findAll({include: [{model: Category,as: 'Category',}]})  
  var cart=null
  if (req.user){
    cart = await Cart.findOne(
      {include: [{model: Order,as: 'Cart',include: [{model:Product,as:'Product'}]}]},    
      {where:{userId:req.user.id}})        
  }
  res.render('index', { title: 'BetMac',products:products,cart:cart});
});

router.get('/about', async(req, res) => {
  var cart=null
  if (req.user){
    cart = await Cart.findOne(
      {include: [{model: Order,as: 'Cart',include: [{model:Product,as:'Product'}]}]},    
      {where:{userId:req.user.id}})        
  }
  res.render('about', { title: 'About',cart:cart});
});

module.exports = router;
