// require("dotenv").config();
// const express = require("express");
// const { mongoose } = require("mongoose");

// const app = express();

// app.use(express.json());

// let isConnected = false;

// async function connectToMongoDB(){
//     try {
//         await mongoose.connect(process.env.MONGO_URL, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true
//         });
//         isConnected = true;
//         console.log('connected to MongoDB')
//     } catch (error) {
//         console.error(error);
//     }
// }

// app.use((req, res, next) => {
//     if(!isConnected){
//         connectToMongoDB();
//     }
//     next();
// })

// app.get("/", (req, res) => {
//     res.send("hello world");
// })

// module.exports = app;

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Express API is running on Vercel");
});

app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "API working" });
});

app.get("/health", async (req, res) => {
  try {
    await connectDB();

    res.status(200).json({
      success: true,
      message: "DB connected successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "DB connection failed",
      error: error.message,
    });
  }
});

module.exports = app; 