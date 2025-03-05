const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const PORT = 3000;
const Mongoose =require('mongoose');
// const url="mongodb://127.0.0.1:27017/login_apis"
const url = 'mongodb+srv://gokul:sankar@mern.sqrvp1s.mongodb.net/?retryWrites=true&w=majority&appName=mern'
const router=require("./controller/user_login_controller")
// For Node.js + Express
const cors = require("cors");
app.use(cors());


app.use(bodyParser.json());
app.use(express.json());

 function loginDetails() {
    Mongoose.connect(url) 
    // Mongoose.connection.once('open',() => {
    //     console.log('connected success');
        const db = Mongoose.connection;
        db.on('error', console.error.bind(console, 'MongoDB connection error:'));
        db.once('open', () => {
        console.log('Connected to MongoDB');
});       
}

loginDetails();

app.get('/', (req, res) => {
    res.send('Hello, World!....');
});

app.use('/user',router)


// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
