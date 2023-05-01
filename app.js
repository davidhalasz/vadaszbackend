const express = require("express");
const dotenv = require("dotenv");
const userRouter = require("./src/routes/user.routes");
const productRouter = require("./src/routes/product.routes");
const app = express();
const cors = require("cors");
const session = require("express-session");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const cookieParser = require('cookie-parser');

dotenv.config({debug: true, path: __dirname + '/.env'});

mongoose.set("strictQuery", true);
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;

try {
  connection.once("open", () => {
    console.log("database connected successfully...");
  });
} catch (error) {
  console.log("connection failed...");
}


let store = new MongoStore({
  mongoUrl: process.env.MONGO_URL,
  collection: "sessions",
});

app.use(
  session({
    secret: process.env.SESS_SECREET,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
      secure: "auto",
    },
  })
);

app.use(
  cors({
    credentials: true,
    origin: ["https://vadaszhirdeto.hu", "http://localhost:3000"],
  })
);
app.use(cookieParser());
app.use("/uploads", express.static(path.join("uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/user", userRouter);
app.use("/api", productRouter);
const PORT = process.env.PORT || 5000;

if(process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/*', (req, res) => {
    res.sendFile(
      path.resolve(__dirname, 'public', 'index.html')
    )
  }
  );
} else {
  app.get('/', (req, res) => res.send('Please set to production'));
}

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured!" });
});

app.listen(PORT, () =>
  console.log(`Example app listening on port ${process.env.PORT}!`)
);
