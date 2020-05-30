var express = require('express');
var router = express.Router();
const Product = require("../models").products;
const Category = require("../models").category;

/* GET home page. */
router.get('/', async(req, res) => {  
  let products = await Product.findAll({include: [{model: Category,as: 'Category',}]})
  res.render('index', { title: 'BetMac',products:products});
});

router.get('/about', function(req, res) {
  res.render('about', { title: 'About'});
});

module.exports = router;
