const express = require('express');
const app = express();

//routes

app.get('/', (req, res) => {
    res.send('hello node')    
})


app.listen(3000, () => {
    console.log('listening on 3000');
});