var express = require('express');
var router = express.Router();

const multer = require('multer');
const User = require("../models").users;
const Category = require("../models").category;
const Product = require("../models").products;
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
    res.render('prodpost', { title: 'Post',category:category});
});

router.get('/cartform/:id', async(req, res) => {  
  let product = await Product.findByPk(req.params.id,{include: [{model: Category,as: 'Category',}]})  

  res.render('addtocart', { title: 'Add to Cart',product:product});
});

// posts******************************************************************************
router.post('/add/to/cart', async(req, res) => {  
  let product = await Product.findByPk(req.body.productId,{include: [{model: Category,as: 'Category',}]})  

  res.render('addtocart', { title: 'Add to Cart'});
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

module.exports = router;