require("dotenv").config();
const express = require("express");
const { mongoose } = require("mongoose");

const app = express();

app.use(express.json());

let isConnected = false;

async function connectToMongoDB(){
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        isConnected = true;
        console.log('connected to MongoDB')
    } catch (error) {
        console.error(error);
    }
}

app.use((req, res, next) => {
    if(!isConnected){
        connectToMongoDB();
    }
    next();
})

app.get("/", (req, res) => {
    res.send("hello world");
})

module.exports = app;