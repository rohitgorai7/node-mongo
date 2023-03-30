require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const { DB_NAMES, PRODUCTS_MESSAGES } = require('./consts');
const Product = require('./models/productModel');

//to use ObjectId in mongoose find
const ObjectId = mongoose.Types.ObjectId;

//to use json in post, put
app.use(express.json());
//to use form data in post, put
app.use(express.urlencoded({extended: false}));
//routes

app.get('/', (req, res) => {
    res.send('hello node');
});

app.get('/blog', (req, res) => {
    res.send('hello blogs');
});

//products routes
//get all products
app.get('/get-products',async (req, res) => {
    try {
        const products = await Product.find({});
        const response = {
            products: products,
            message: PRODUCTS_MESSAGES.GET_PRODUCTS
        }
        res.status(200).json(response);        
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});
//get product by id
app.get('/get-product/:id',async (req, res) => {
    try {
        const { id } = req.params;
        const o_id = new ObjectId(id);
        const product = await Product.findOne({_id: o_id});
        if(!product) {
            res.status(404).json({message: `Cannot find the product`});
        } else {
            const response = {
                product: product,
                message: PRODUCTS_MESSAGES.GET_PRODUCTS
            }
            res.status(200).json(response);
        }
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});
// add single product
app.post('/add-product',async (req, res) => {
    try {
        await Product.create(req.body);
        res.status(200).json({message: PRODUCTS_MESSAGES.ADD_PRODUCT});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({message: error.message});
    }
});
//update a product by id
app.put('/update-product/:id',async (req, res) => {
    try {
        const { id } = req.params;
        const  product = await Product.findByIdAndUpdate(id, req.body);
        if(!product) {
            return res.status(404).json({message: `cannot find product with id - ${id}`});
        }
        const o_id = new ObjectId(id);
        const updatedProduct = await Product.findOne({_id: o_id}); 
        res.status(200).json({message: `Product-${updatedProduct} updated successfully`});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({message: error.message});
    }
});

mongoose.set('strictQuery', false);

mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@${process.env.DB_CLUSTER}/${DB_NAMES.node}?retryWrites=true&w=majority`)
.then(() => {
    console.log(`connected to mongoDB on "${DB_NAMES.node}"-db`);

    app.listen(3000, () => {
        console.log('listening app on 3000');
    });    
}).catch((e) => {
    console.log(e);
});