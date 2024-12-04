require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { celebrate, Joi, isCelebrateError } = require("celebrate");
const cors = require("cors");
const { login, register } = require("./controllers/users");
const usersRoutes = require("./routes/users");
const productRoutes = require("./routes/product");
const productsRoutes = require("./routes/products");
const categoryRoutes = require("./routes/category");
const categoriesRoutes = require("./routes/categories");
const orderRoutes = require("./routes/order");
const ordersRoutes = require("./routes/orders");
const chartRoutes = require("./routes/chart");
const auth = require("./middlewares/auth");
const checkAdmin = require("./middlewares/checkAdmin");
const multer = require("multer");

const MONGO_URI = process.env.MONGODB_URI;
mongoose.connect(MONGO_URI);

const port = 3000;

const app = express();

const originListString = process.env.ALLOWED_ORIGIN;
const originList = originListString.split(',');
const corsOption = {
  origin: originList,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOption));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/register", upload.single("file"), register);
app.post("/login", login);

app.use("/users", usersRoutes);
app.use("/product", productRoutes);
app.use("/products", productsRoutes);
app.use("/category", auth, categoryRoutes);
app.use("/categories", categoriesRoutes);
app.use("/order", orderRoutes);
app.use("/orders", ordersRoutes);
app.use("/chart", auth, checkAdmin, chartRoutes)

app.get("*", (req, res) => {
  res.send({ message: "Sumber daya yang diminta tidak ada" });
});

app.use((err, req, res, next) => {
  let { statusCode, message } = err;
  if (isCelebrateError(err)) {
    statusCode = 400;
    message = err.message;
  }
  if (!statusCode) {
    statusCode = 500;
  }
  res.status(statusCode).send({
    message: statusCode === 500 ? "Terjadi kesalahan pada server" : message,
  });
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
