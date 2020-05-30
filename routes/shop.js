var express = require('express');
var router = express.Router();

const multer = require('multer');
const User = require("../models").users;
const Profile = require("../models").profiles;
const Category = require("../models").category;
const Product = require("../models").products;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads/products')
    },
    filename: function (req, file, cb) {      
      cb(null, file.originalname)
    }
});

var upload = multer({storage: storage})

router.get('/form', async(req, res) => {
    let category = await Category.findAll()
    res.render('prodpost', { title: 'Post',category:category});
});

router.post('/add/category', function(req, res) {
    const name = req.body.name;  
    return Category.create({ name:name}).then(
        req.flash('success','Added a Category'),
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