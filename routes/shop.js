var express = require('express');
var router = express.Router();
var request = require('request');
var moment = require('moment');
var bodyParser = require('body-parser');
require('dotenv').config()
const Mpesa = require('mpesa-node')

const multer = require('multer');
const User = require("../models").users;
const Category = require("../models").category;
const Product = require("../models").products;
const Cart = require("../models").cart;
const Order = require("../models").order;
const Delivery = require("../models").delivery;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads/products')
    },
    filename: function (req, file, cb) {      
      cb(null, file.originalname)
    }
});

var upload = multer({storage: storage})


function isAuthenticated(req, res, next) {
  if (req.user){
    return next();      
  }
  else{
    req.session.redirectTo = req.originalUrl; 
    req.flash('success','Please Sign In if you have an Account'),            
    res.redirect('/users/signup');     
  }
}

// gets******************************************************************************
router.get('/form',isAuthenticated, async(req, res) => {
    let category = await Category.findAll()
    let cart = await Cart.findOne(
      {include: [{model: Order,as: 'Cart',include: [{model:Product,as:'Product'}]}],
      where:{userId:req.user.id,ordered:false}})        
    res.render('prodpost', { title: 'Post',category:category,cart:cart});
});

router.get('/cartform/:id',isAuthenticated, async(req, res) => {  
  let product = await Product.findByPk(req.params.id,{include: [{model: Category,as: 'Category',}]})  
  let cart = await Cart.findOne(
    {include: [{model: Order,as: 'Cart',include: [{model:Product,as:'Product'}]}],
      where:{userId:req.user.id,ordered:false}})    
  let item = await Order.findOne({where:{cartId:cart.id,productId:product.id,paid:false}})        
  res.render('addtocart', { title: 'Update Cart',product:product,cart:cart,item:item});
});

router.get('/ordersummary',isAuthenticated, async(req, res) => {    
  let cart = await Cart.findOne(
    {include: [{model:Delivery,as:'Delivery'},{model: Order,as: 'Cart',include: [{model:Product,as:'Product'}]}],
      where:{userId:req.user.id,ordered:false}})        
      
  let deliveries = await Delivery.findAll()      
  res.render('ordersummary', { title: 'Order Summary',cart:cart,deliveries:deliveries});
});

router.get('/remove/from/cart/:id',isAuthenticated, async(req, res) => {  
  let product = await Product.findByPk(req.params.id)    
  let usercart = await Cart.findOne({where: {userId:req.user.id,ordered:false}})  
  let orderitem = await Order.findOne({where:{productId:req.params.id,cartId:usercart.id,paid:false}})  
  
  let deducted = parseInt(product.price)*parseInt(orderitem.quantity)
  let newsum = parseInt(usercart.total)-deducted
  usercart.total=newsum

  usercart.save()
  orderitem.destroy()  
  
  req.flash('success','Successfully removed that item from cart'),
  res.redirect('/')                                      
});

router.get('/remove/delivery/:id',isAuthenticated, async(req, res) => {  
  let place = await Delivery.findByPk(req.params.id)    
  let usercart = await Cart.findOne({where: {userId: req.user.id,ordered:false}})  

  let deducted = parseInt(usercart.total)-parseInt(place.cost)
  usercart.total=deducted
  usercart.deliveryId=null
  usercart.save()
  req.flash('success','Succesfully removed that delivery place from your order')
  res.redirect('/shop/ordersummary')                                          
});


// posts******************************************************************************
router.post('/update/item/cart/',isAuthenticated, async function(req, res) {
  var product = await Product.findByPk(req.body.productId)
  let usercart = await Cart.findOne({where: {userId: req.user.id,ordered:false}})  
  let orderitem = await Order.findOne({where: {cartId: usercart.id,productId:product.id,paid:false}})  
  
  if(parseInt(req.body.quantity)<1){
    req.flash('error','You chose a negative quantity or 0 quantity!')
    res.redirect('/shop/ordersummary')  
  }
  else if(parseInt(orderitem.quantity)===parseInt(req.body.quantity)){
    req.flash('success','Quantity of item never changed')
    res.redirect('/shop/ordersummary')  
  }
  else if(parseInt(orderitem.quantity)>parseInt(req.body.quantity)){
    let minused= parseInt(orderitem.quantity)-parseInt(req.body.quantity)
    let todeducted=parseInt(product.price)*parseInt(minused)
    let reminder = parseInt(usercart.total)-todeducted
    
    usercart.total=reminder
    usercart.save()    

    orderitem.quantity=parseInt(req.body.quantity)
    orderitem.save()  
    req.flash('success','Succesfully Updated that item')
    res.redirect('/shop/ordersummary')                                          
  }
  else{
    let added_x= parseInt(req.body.quantity)-parseInt(orderitem.quantity)
    let toadded=parseInt(product.price)*parseInt(added_x)
    let sumed = parseInt(usercart.total)+toadded
    
    usercart.total=sumed
    usercart.save()    

    orderitem.quantity=parseInt(req.body.quantity)
    orderitem.save()  
    req.flash('success','Succesfully Updated that item')
    res.redirect('/shop/ordersummary')      
  }
});

router.post('/update/cart/',isAuthenticated, async function(req, res) {
  if (req.body.deliveryId==0){
    req.flash('error','Select a delivery place first!')
    res.redirect('/shop/ordersummary')                                          
  }
  else{
    let place = await Delivery.findByPk(req.body.deliveryId)    
    let usercart = await Cart.findOne({where: {userId: req.user.id,ordered:false}})  
  
    let sum=parseInt(place.cost)+parseInt(usercart.total)
  
    usercart.total=sum
    usercart.deliveryId=place.id
    usercart.save()
  
    req.flash('success','Succesfuly added a delivery place to your order')
    res.redirect('/shop/ordersummary')                                          
  }
});

router.get('/add/to/cart/:id',isAuthenticated, async(req, res) => {    
  var product = await Product.findByPk(req.params.id)

  let existingcart = await Cart.findOne({include: [{model: Order,as: 'Cart',include: [{model:Product,as:'Product'}]}],
      where:{userId:req.user.id,ordered:false}})        
    
  if (existingcart){
    let multiple = parseInt(product.price)*parseInt(1)
    var sum= existingcart.total+parseInt(multiple)
    existingcart.total=sum
    existingcart.save()

    let orderitem_x = await Order.findOne({where: {cartId: existingcart.id,productId:product.id,paid:false}})  
    if(orderitem_x){
      let newqt_x=parseInt(orderitem_x.quantity)+1
      orderitem_x.quantity=newqt_x
      orderitem_x.save()
      req.flash('success','Successfully updated item quantity and cart'),
      res.redirect('/')                                      
    }
    else{
      let neworder = await Order.build({productId:product.id,cartId:existingcart.id,quantity:1})
      neworder.save()
      req.flash('success','Successfully added to cart'),
      res.redirect('/')                                      
    }
  }
  else{
    let newcart = await Cart.create({userId:req.user.id})

    let prevcart = await Cart.findOne({where: {userId:req.user.id,ordered:false}})
        
    let multiple = parseInt(product.price)*parseInt(1)

    var sum=prevcart.total+parseInt(multiple)
    prevcart.total=sum
    prevcart.save()

    let neworder = await Order.build({productId:product.id,cartId:prevcart.id,quantity:1})
    neworder.save()

    req.flash('success','Successfully added to cart'),
    res.redirect('/')                                      
  }  
});

router.post('/add/category',isAuthenticated, function(req, res) {
    const name = req.body.name;  
    return Category.create({ name:name}).then(
        req.flash('success','Added a Category'),
        res.redirect('/shop/form')                                      
      ).catch(error => res.status(400).send(error));                  
});

router.post('/add/delivery',isAuthenticated, function(req, res) {
  const name = req.body.name;  
  const cost = req.body.cost;  
  return Delivery.create({ name:name, cost:cost}).then(
      req.flash('success','Added a delivery place'),
      res.redirect('/shop/form')                                      
    ).catch(error => res.status(400).send(error));                  
});

router.post('/add/product',upload.single('photo'),isAuthenticated, async(req, res) => {
    const name = req.body.name;  
    const image = req.file.filename
    const price = req.body.price;  
    const description = req.body.description;
    const categoryid = req.body.categoryid

    return Product.create({ name:name,image:image,price:price,description:description,categoryId:categoryid}).then(
        req.flash('success','Successfully an product'),
        res.redirect('/shop/form')                                      
      ).catch(error => res.status(400).send(error));                              
});

// function mpesaauth(req,res,next) {
//   let url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
  
//   const MPESA_CONSUMER=process.env.MPESA_CONSUMER
//   const MPESA_SECRET_KEY=process.env.MPESA_SECRET_KEY

//   let auth = Buffer.from(MPESA_CONSUMER+":"+MPESA_SECRET_KEY).toString('base64')  
//   request(
//     {
//     url:url,
//     headers:{
//       "Authorization":"Basic "+ auth
//     }      
//   },
//   (error,response,body) => {
//     if(error){
//       console.log(error)
//     }
//     else{         
//       if (body){
//         mpesa.
//         req.access_token= JSON.parse(body).access_token      
//         next()
//       }   
//       else{
//         req.flash('error','Authentication failed. Please try again to pay. If problem persists inform us.'),
//         res.redirect('/shop/ordersummary')                                       
//       }
//     }
//   }
//   )
// }

router.post('/mpesa/stk',isAuthenticated, async (req,res) => {

  const MPESA_CONSUMER=process.env.MPESA_CONSUMER
  const MPESA_SECRET_KEY=process.env.MPESA_SECRET_KEY

  var hostname = req.headers.host;    
  const callback = "https://"+hostname+"/shop/pimpandride_stk_callback"      
  let numberphone=req.body.phone
  const mpesaphone =numberphone.toString() 
  let timestamp = moment().format('YYYYMMDDHHmmss')     

  const mpesaApi = new Mpesa({consumerKey:MPESA_CONSUMER,consumerSecret:MPESA_SECRET_KEY})
  const {    
    lipaNaMpesaOnline,
    lipaNaMpesaQuery,    
    transactionStatus 
  } = mpesaApi

  const password= Buffer.from("174379"+process.env.MPESA_AUTH+timestamp).toString('base64')

  const testMSISDN = mpesaphone
  const amount = 1
  const accountRef = "Pimp and Ride Order Payment"
  const transactionDesc = 'Lipa na mpesa online'
  const transactionType = 'CustomerPayBillOnline'
  const shortCode = "174379" 
  const passKey = process.env.MPESA_AUTH
  
  mpesaApi.lipaNaMpesaOnline(testMSISDN, amount, callback, accountRef,transactionDesc,transactionType,shortCode,passKey).then( async (result)=> {    
    const resultcode=result.data.ResponseCode
    const MerchantID=result.data.MerchantRequestID    
    if(resultcode==0){
      let merchant_id = MerchantID
      let usercart = await Cart.findOne({where: {userId: req.user.id,ordered:false}})            
      //update cart         
      usercart.MerchantRequestID=merchant_id                     
      usercart.paymentmethod="Mpesa"
      usercart.ordered=true
      usercart.phoneno=mpesaphone                                  
      let orderupdate= await Order.update({ paid : true },{ where : { cartId : usercart.id,paid:false }});        
      usercart.save()          
      req.flash('success','Request accepted for processing. Please check your phone for password prompt.'),
      res.redirect('/')  
    }
    else{
      req.flash('error','Request not sent. Make sure your number is in the formart 2547*********'),
      res.redirect('/')                                       
    }       

  }).catch((error) => {
    console.log("**********************************************************")
    console.log(error)
    console.log("**********************************************************")
    req.flash('error','Request not sent. Please check your Internet connection or make sure your number is in the formart 2547*********'+MPESA_SECRET_KEY),
    res.redirect('/')   
  })  
})

router.post('/pimpandride_stk_callback', async (req,res) => {
  // amount=req.body.stkCallback.CallbackMetadata.Item[0].Value
  console.log("________________________________")
  console.log(req.body.stkCallback)
  console.log("________________________________")
  let resultcode = req.body.stkCallback.ResultCode
  if(resultcode==0){

    let merchant_id=req.body.stkCallback.MerchantRequestID          
    let usercart = await Cart.findOne({where: {MerchantRequestID: merchant_id,ordered:false}})    
    usercart.mpesa_confirm=true              
    usercart.save()    
    res.status(200)
  }
  else{
    console.log("**********************************")
    console.log("Error processing callback")
    console.log("**********************************")
    res.status(400) 
  }  
})

module.exports = router;