require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const { DB_NAMES, PRODUCTS_MESSAGES, ACTIONS, USERS_MESSAGES } = require('./consts');
const Product = require('./models/productModel');
const User = require('./models/userModel');

app.use(cors());

//to use ObjectId in mongoose find
const ObjectId = mongoose.Types.ObjectId;

//to use json in post, put
app.use(express.json());
//to use form data in post, put
app.use(express.urlencoded({ extended: false }));
//routes

app.get('/', (req, res) => {
    res.send('hello node');
});

app.get('/blog', (req, res) => {
    res.send('hello blogs');
});

//main routes

//signup
app.post('/signup', async (req, res) => {
    try {
        let users = await User.find({username: req.body.username});
        if(users.length) {
            return res.status(404).json({message: "Username already exists"});
        } else {
            users = await User.find({email: req.body.email});
            if(users.length) {
                return res.status(404).json({message: "Email already exists"});
            }
        }
        if(!(req.body.name && req.body.username && req.body.password && req.body.email)) {
            return res.status(404).json({message: "All fields are required"});
        }
        const encryptedPass = await bcrypt.hash(req.body.password, 10);
        const userToBeCreated = {
            name: req.body.name,
            username: req.body.username,
            email: req.body.email.toLowerCase(),
            password: encryptedPass,
        }
        const token = jwt.sign(
            userToBeCreated,
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: "1h",
            }
        )
        await User.create(
            {
                ...userToBeCreated,
                token: token
            }
        );
        res.status(201).json({message: USERS_MESSAGES.ADD_USER});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }
});
//get users
app.get('/get-users', async (req, res) => {
    try {
        const users = await User.find({});
        const response = {
            users: users,
            message: USERS_MESSAGES.GET_USERS
        }
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }
});

//products routes
//get all products
app.get('/get-products', async (req, res) => {
    try {
        const products = await Product.find({});
        const response = {
            products: products,
            message: PRODUCTS_MESSAGES.GET_PRODUCTS
        }
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
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
        console.log(error);
        res.status(500).json({message: error.message});
    }
});
// add single product
app.post('/add-product',async (req, res) => {
    try {
        await Product.create(req.body);
        res.status(200).json({message: PRODUCTS_MESSAGES.ADD_PRODUCT});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }
});
//update and delete a product by id ++ commented code
// app.post('/update-product/:id',async (req, res) => {
//     try {
//         const { id } = req.params;
//         const action = req.body.action;
//         let product;
//         if(action === ACTIONS.UPDATE) {
//             const payload = {
//                 name: req.body.name,
//                 quantity: req.body.quantity,
//                 price: req.body.price,
//                 image: req.body.image
//             }
//             product = await Product.findByIdAndUpdate(id, payload);
//         } else if(action === ACTIONS.DELETE) {
//             product = await Product.findByIdAndDelete(id);
//         } else {
//             return res.status(404).json({message: 'Unidentified action'});
//         }
//         if(!product) {
//             return res.status(404).json({message: `cannot find product with id - ${id}`});
//         }
//         const o_id = new ObjectId(id);
//         const updatedProduct = await Product.findOne({_id: o_id});
//         const response = {
//             ...(action === ACTIONS.UPDATE ? { message: `Product updated successfully`, product: updatedProduct } : action === ACTIONS.DELETE ? { message: `Product deleted successfully` } : {})
//         }
//         res.status(200).json(response);
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({message: error.message});
//     }
// });
app.post('/update-product',async (req, res) => {
    try {
        const id = req.body._id;
        const action = req.body.action;
        let product;
        if(action === ACTIONS.UPDATE) {
            const payload = {
                name: req.body.name,
                quantity: req.body.quantity,
                price: req.body.price,
                image: req.body.image
            }
            product = await Product.findByIdAndUpdate(id, payload);
        } else if(action === ACTIONS.DELETE) {
            product = await Product.findByIdAndDelete(id);
        } else {
            return res.status(404).json({message: 'Unidentified action'});
        }
        if(!product) {
            return res.status(404).json({message: `cannot find product with id - ${id}`});
        }
        const o_id = new ObjectId(id);
        const updatedProduct = await Product.findOne({_id: o_id});
        const response = {
            ...(action === ACTIONS.UPDATE ? { message: `Product updated successfully`, product: updatedProduct } : action === ACTIONS.DELETE ? { message: `Product deleted successfully` } : {})
        }
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
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