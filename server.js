require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const { DB_NAMES, PRODUCTS_MESSAGES, ACTIONS, USERS_MESSAGES, USER_STATUS, MESSAGES } = require('./consts');
const Product = require('./models/productModel');
const User = require('./models/userModel');
const ClientWhite = require('./models/clientWhite');
const ClientBlack = require('./models/clientBlack');
const auth = require('./middleware');
const Chat = require('./models/chat');
// const nodeMailer = require('./controllers/mailer');
app.use(cors());

//to use ObjectId in mongoose find
const ObjectId = mongoose.Types.ObjectId;

//to use json in post, put
app.use(express.json());
//to use form data in post, put
app.use(express.urlencoded({ extended: false }));
//routes

app.get('/', auth, (req, res) => {
    res.send('hello node');
});

app.get('/blog', auth,  (req, res) => {
    res.send('hello blogs');
});

// app.get('/mail', nodeMailer);

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
        const passwordBuff = Buffer.from(req.body.password, 'base64').toString();
        const encryptedPass = await bcrypt.hash(passwordBuff, 10);
        const user = await User.create({
            name: req.body.name,
            username: req.body.username,
            email: req.body.email.toLowerCase(),
            password: encryptedPass,
            userType: 'user',
        });
        res.status(201).json({message: USERS_MESSAGES.ADD_USER, username: user.username});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }
});
//login
app.post('/login', async (req, res) => {
    try {
        const {username, password} = req.body;
        if(!(username && password)) {
            res.status(400).json({message: "All inputs are required"});
        }
        const user = await User.findOne({username: username, status: USER_STATUS.ACTIVE});
        if(!user) {
            return res.status(400).json({message: "Username incorrect, try again"});
        }
        const passwordBuff = Buffer.from(password, 'base64').toString();
        if(user && (await bcrypt.compare(passwordBuff, user.password))) {
            try {
                const token = jwt.sign(
                    {_id: user._id, username: user.username, userType: user.userType},
                    process.env.JWT_SECRET_KEY,
                    {
                    expiresIn: "2h",
                    }
                );
                user.token = token;
            } catch (error) {
                return res.status(400).json({message: "Invalid token"});
            }
            await User.updateOne({username: username}, {$set: {isLoggedIn: true}});
            const checkWhite = await ClientWhite.findOneAndDelete({username: username});
            if(checkWhite && (checkWhite.token !== user.token)) {
                const payload = {
                    username: checkWhite.username,
                    email: checkWhite.email,
                    token: checkWhite.token,
                    userId: checkWhite.userId
                }
                await ClientBlack.create(payload);
            }
            await ClientWhite.create({
                username: user.username,
                email: user.email,
                token: user.token,
                userId: user._id
            });
            const response = {
                name: user.name,
                email: user.email,
                username: user.username,
                token: user.token,
                userId: user._id,
                userType: user.userType,
                isLoggedIn: true
            }
            return res.status(200).json({message:"Login successfull", user: {...response}});
        }
        return res.status(400).json({message: "Invalid password"});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }
});

//get user data
app.get('/get-user-data', auth, async (req, res) => {
    try {
        if(req.query.cached) {
            const userData = await ClientWhite.findOne({token: req.body.token || req.query.token || req.headers["x-access-token"] || req.headers["token"]});
            if(!userData) {
                return res.status(401).json({message: "Unauthorized"});
            }
            const user = await User.findOne({username: userData.username}, {name: 1, userType: 1});
            if(user) {
                const response = {
                    name: user.name,
                    userType: user.userType,
                    email: userData.email,
                    username: userData.username,
                    token: userData.token,
                    userId: userData.userId,
                    isLoggedIn: userData.isLoggedIn
                }
                return res.status(200).json(response);
            }
        }
        return res.status(401).json({message: "Something went wrong"});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }
});

//logout
app.post('/logout', auth, async (req, res) => {
    try {
        const {user} = req;
        const logoutUser = await ClientWhite.findOneAndDelete({username: user.username});
        await User.updateOne({username: user.username}, {$set: {isLoggedIn: false}});
        const payload = {
            username: logoutUser.username,
            email: logoutUser.email,
            token: logoutUser.token,
            userId: logoutUser._id
        }
        await ClientBlack.create(payload);
        const response = {
            message: "Logout successfull"
        }
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }
});

//update user

app.post('/update-user', auth, async (req, res) => {
    try {
        const id = req.body._id;
        const action = req.body.action;
        let user;
        if(action === ACTIONS.STATUS) {
            if(req.user.userType !== 'management') {
                return res(404).json({message: "Unauthorized action"});
            }
            const payload = {
                status: req.body.status
            }
            user = await User.findByIdAndUpdate(id, payload);
        // } else if(action === ACTIONS.DELETE) {
        //     product = await Product.findByIdAndDelete(id);
        } else {
            return res.status(404).json({message: 'Unidentified action'});
        }
        if(!user) {
            return res.status(404).json({message: `cannot find user with id - ${id}`});
        }
        const response = {
            message: 'User updated successfully'
        }
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }
});

//get users
app.get('/get-users', auth, async (req, res) => {
    try {
        const projection = {
            createdAt: 1,
            email: 1,
            name: 1,
            username: 1,
            status: 1,
            isLoggedIn: 1
        }
        const users = await User.find({}, projection);
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
app.get('/get-products', auth, async (req, res) => {
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
app.get('/get-product/:id', auth, async (req, res) => {
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
app.post('/add-product', auth, async (req, res) => {
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
app.post('/update-product', auth, async (req, res) => {
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

//send sms

app.post('/verify-user', async (req, res) => {
    try {
        const message = require('./controllers/message');
        const to = req.body.to;
        const text = '1234';
        try {
            message(to, text);
            res.status(200).json({message: 'sent'});
        } catch (error) {
            res.status(404).json({message: 'error'});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }
});

app.get('/get-chat-users', auth, async (req, res) => {
    try {
        const projection = {
            _id: 1,
            createdAt: 1,
            email: 1,
            name: 1,
            username: 1,
            status: 1,
            isLoggedIn: 1
        }
        let users = await User.find({}, projection);
        const filterUsers = users.filter(user => user._id.toString() !== req.user._id);
        const messages = await Chat.find({});
        const response = {
            users: filterUsers.map(user => {
                const getChat = messages.find(message => ((user._id.toString() === message.participants[0] && req.user._id === message.participants[1]) || (user._id.toString() === message.participants[1] && req.user._id === message.participants[0])));
                const data = {...user._doc, lastMessage: getChat ? getChat.lastMessage : {}};
                return data;
            }),
            message: USERS_MESSAGES.GET_USERS
        }
        return res.status(200).json(response);
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: error.message});
    }
});

app.get('/get-messages', auth, async (req, res) => {
    try {
        const {to} = req.query;
        const user = await User.findOne({_id: to});
        const {name} = user ? user : '';
        const data = {};
        if(name) {
            const {_id} = req.user;
            const chats = await Chat.find({});
            const chat = chats.find(chat => chat.participants?.includes(to) && chat.participants?.includes(_id));
            if(chat?.participants){
                data._id = chat._id;
                data.participants = chat.participants;
                data.messages = chat.messages;
                data.createdAt = chat.createdAt;
                data.updatedAt = chat.updatedAt;
                data.toFrom = to+','+_id;
            }
        }        
        data.name = name;
        const response = {
            data,
            message: MESSAGES.GET_MESSAGES
        }
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
});

app.post('/send-chat', auth, async (req, res) => {
    try {
        const {to, message, messageType} = req.body;
        if(to && message && messageType) {
            const from = req.user._id;
            const chats = await Chat.find({});
            const  chat = chats.find(chat => chat.participants?.includes(to) && chat.participants?.includes(from));
            const msg = {
                message: message,
                messageType: messageType,
                sender: from,
                receiver: to
            }
            if(chat?.participants){
                const msgs = chat.messages;
                msgs.push(msg);
                await Chat.findByIdAndUpdate(chat._id, {messages: msgs, lastMessage: {...msg, createdAt: new Date(Date.now())}});
                return res.status(200).json({message:'Send successfully'});
            }
            await Chat.create({participants: [from, to], messages: [msg], lastMessage: {...msg, createdAt: new Date(Date.now())}});
            return res.status(200).json({message:'Send successfully'});
        } else {
            res.status(404).json({message: 'message required'});
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: error.message});
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