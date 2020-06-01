var express = require('express');
var router = express.Router();
var request = require('request');
var moment = require('moment');

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

// gets******************************************************************************
router.get('/form', async(req, res) => {
    let category = await Category.findAll()
    let cart = await Cart.findOne(
      {include: [{model: Order,as: 'Cart',include: [{model:Product,as:'Product'}]}],
      where:{userId:req.user.id,ordered:false}})        
    res.render('prodpost', { title: 'Post',category:category,cart:cart});
});

router.get('/cartform/:id', async(req, res) => {  
  let product = await Product.findByPk(req.params.id,{include: [{model: Category,as: 'Category',}]})  
  let cart = await Cart.findOne(
    {include: [{model: Order,as: 'Cart',include: [{model:Product,as:'Product'}]}],
      where:{userId:req.user.id,ordered:false}})        
  res.render('addtocart', { title: 'Add to Cart',product:product,cart:cart});
});

router.get('/ordersummary', async(req, res) => {    
  let cart = await Cart.findOne(
    {include: [{model:Delivery,as:'Delivery'},{model: Order,as: 'Cart',include: [{model:Product,as:'Product'}]}],
      where:{userId:req.user.id,ordered:false}})        
      
  let deliveries = await Delivery.findAll()      
  res.render('ordersummary', { title: 'Order Summary',cart:cart,deliveries:deliveries});
});

router.get('/remove/from/cart/:id', async(req, res) => {  
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

router.get('/remove/delivery/:id', async(req, res) => {  
  let place = await Delivery.findByPk(req.params.id)    
  let usercart = await Cart.findOne({where: {userId: req.user.id,ordered:false}})  

  let deducted = parseInt(usercart.total)-parseInt(place.cost)
  usercart.total=deducted
  usercart.deliveryId=null
  usercart.save()
  req.flash('success','Succesfuly removed that delivery place from your order')
  res.redirect('/shop/ordersummary')                                          
});


// posts******************************************************************************
router.post('/update/cart/', async function(req, res) {
  let place = await Delivery.findByPk(req.body.deliveryId)    
  let usercart = await Cart.findOne({where: {userId: req.user.id,ordered:false}})  

  let sum=parseInt(place.cost)+parseInt(usercart.total)

  usercart.total=sum
  usercart.deliveryId=place.id
  usercart.save()

  req.flash('success','Succesfuly added a delivery place to your order')
  res.redirect('/shop/ordersummary')                                          
});

router.post('/add/to/cart', async(req, res) => {    
  var product = await Product.findByPk(req.body.productId)

  let existingcart = await Cart.findOne({include: [{model: Order,as: 'Cart',include: [{model:Product,as:'Product'}]}],
      where:{userId:req.user.id,ordered:false}})        
    
  if (existingcart){
    let multiple = parseInt(product.price)*parseInt(req.body.quantity)
    var sum= existingcart.total+parseInt(multiple)
    existingcart.total=sum
    existingcart.save()

    let neworder = await Order.build({productId:req.body.productId,cartId:existingcart.id,quantity:req.body.quantity})
    neworder.save()
    req.flash('success','Successfully added to cart'),
    res.redirect('/')                                      
  }
  else{
    let newcart = await Cart.create({userId:req.user.id})

    let prevcart = await Cart.findOne({where: {userId:req.user.id,ordered:false}})
        
    let multiple = parseInt(product.price)*parseInt(req.body.quantity)

    var sum=prevcart.total+parseInt(multiple)
    prevcart.total=sum
    prevcart.save()

    let neworder = await Order.build({productId:req.body.productId,cartId:prevcart.id,quantity:req.body.quantity})
    neworder.save()

    req.flash('success','Successfully added to cart'),
    res.redirect('/')                                      
  }  
});

router.post('/add/category', function(req, res) {
    const name = req.body.name;  
    return Category.create({ name:name}).then(
        req.flash('success','Added a Category'),
        res.redirect('/shop/form')                                      
      ).catch(error => res.status(400).send(error));                  
});

router.post('/add/delivery', function(req, res) {
  const name = req.body.name;  
  const cost = req.body.cost;  
  return Delivery.create({ name:name, cost:cost}).then(
      req.flash('success','Added a delivery place'),
      res.redirect('/shop/form')                                      
    ).catch(error => res.status(400).send(error));                  
});

router.post('/add/product',upload.single('photo'), async(req, res) => {
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



function mpesaauth(req,res,next) {
  let url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
      
  let auth = Buffer.from("lAfsxS0K6VKQMfA5sM8kbIfj8bhZiAJg:JVAJcOCvzfOKZ74x").toString('base64')  

  request(
    {
    url:url,
    headers:{
      "Authorization":"Basic "+auth
    }      
  },
  (error,response,body) => {
    if(error){
      console.log(error)
    }
    else{
      req.access_token=JSON.parse(body).access_token
      next()
    }
  }
  )
}

router.post('/mpesa/stk', mpesaauth, async (req,res) => {
  var hostname = req.headers.host;    
  let callback = "https://"+hostname+"/shop/betmac_stk_callback"      
  let oauth_token = req.access_token  
  let endpoint = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
  let auth = "Bearer " + oauth_token;
  
  let timestamp = moment().format('YYYYMMDDHHmmss')  
  const password= Buffer.from("174379"+"bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"+timestamp).toString('base64')

  let numberphone=req.body.phone
  const mpesaphone =numberphone.toString()    
  request(
    {
      url: endpoint,
      method: "POST",
      headers: {
        "Authorization": auth
      },
      json : {
        "BusinessShortCode": "174379",
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": "1",
        "PartyA": mpesaphone,
        "PartyB": "174379",
        "PhoneNumber": mpesaphone,
        "CallBackURL": callback,
        "AccountReference": "BetmacOrderPayment",
        "TransactionDesc": "Process Activation"
      }
    },
    async function(error,response,body){
      if(error){        
        res.status(400).send(error);                              
      }            
      let resultcode = body.ResponseCode

      if(resultcode==0){
        let merchant_id = body.MerchantRequestID
        let usercart = await Cart.findOne({where: {userId: req.user.id,ordered:false}})            
        usercart.MerchantRequestID=merchant_id        
        
        // usercart.save()   

        //update cart         
        usercart.paymentmethod="Mpesa"
        usercart.ordered=true
        usercart.phoneno=mpesaphone
                                    
        let orderupdate= await Order.update({ paid : true },{ where : { cartId : usercart.id,paid:false }});        

        usercart.save()    
        // update cart end
        
        req.flash('success','Request accepted for processing. Please check your phone for password prompt.'),
        res.redirect('/')                                       
      }
      else{
        req.flash('error','There was a problem sending your request. Please contact the Business Owner.'),
        res.redirect('/')                                       
      }      
      // res.status(200).json(body)
    }
  )
})

router.post('/betmac_stk_callback', async (req,res) => {
  let resultcode = req.Body.stkCallback.ResultCode
  if(resultcode==0){
    // amount=req.body.stkCallback.CallbackMetadata.Item[0].Value
    let merchant_id=req.Body.stkCallback.MerchantRequestID  
    let phone_no=req.Body.stkCallback.CallbackMetadata.Item[4].Value
    let usercart = await Cart.findOne({where: {MerchantRequestID: merchant_id,ordered:false}})    
    usercart.paymentmethod="Mpesa"
    usercart.ordered=true
    usercart.phoneno=phone_no

    let orderupdate= await Order.update({ paid : true },{ where : { cartId : usercart.id,paid:false }});        
    
    usercart.save()    
    res.status(200)
  }
  else{
    res.status(400).send(error);                              
  }  
})

module.exports = router;