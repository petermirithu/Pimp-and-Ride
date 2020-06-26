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
      {include: [{model: Order,as: 'Cart',include: [{model:Product,as:'Product'}]}],
      where:{userId:req.user.id,ordered:false}})        
  }
  res.render('index---2', { title: 'Pimp & Ride',products:products,cart:cart});
});

router.get('/products/:category', async(req, res) => {  
  category_x= await Category.findOne({ where:{name:req.params.category}})  
  let products = await Product.findAll({ where:{categoryId:category_x.id},include: [{model: Category,as: 'Category',}]})  
  var cart=null
  if (req.user){
    cart = await Cart.findOne(
      {include: [{model: Order,as: 'Cart',include: [{model:Product,as:'Product'}]}],
      where:{userId:req.user.id,ordered:false}})        
  }
  res.render('ourproducts', { title: category_x.name ,products:products,cart:cart});
});

router.get('/about', async(req, res) => {
  var cart=null
  if (req.user){
    cart = await Cart.findOne(
      {include: [{model: Order,as: 'Cart',include: [{model:Product,as:'Product'}]}],
      where:{userId:req.user.id,ordered:false}})        
  }
  res.render('about---2', { title: 'About Us',cart:cart});
});

router.get('/contact', async(req, res) => {
  var cart=null
  if (req.user){
    cart = await Cart.findOne(
      {include: [{model: Order,as: 'Cart',include: [{model:Product,as:'Product'}]}],
      where:{userId:req.user.id,ordered:false}})        
  }
  res.render('contact', { title: 'Contact Us',cart:cart});
});

module.exports = router;
