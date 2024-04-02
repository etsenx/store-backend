const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { celebrate, Joi, isCelebrateError } = require("celebrate");
const { login, register } = require("./controllers/users");
const usersRoutes = require("./routes/users");
const productRoutes = require("./routes/product");
const productsRoutes = require("./routes/products");
const categoryRoutes = require("./routes/category");
const categoriesRoutes = require("./routes/categories");
const auth = require("./middlewares/auth");

const MONGO_URI = "mongodb://127.0.0.1:27017/tripleshop";
mongoose.connect(MONGO_URI);

const port = 3000;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/register", register);
app.post("/login", login);

app.use("/users", auth, usersRoutes);
app.use("/product", productRoutes);
app.use("/products", productsRoutes);
app.use("/category", categoryRoutes);
app.use("/categories", categoriesRoutes);

app.get("*", (req, res) => {
  res.send({ message: "Sumber daya yang diminta tidak ada" });
});

app.use((err, req, res, next) => {
  let { statusCode, message } = err;
  if (isCelebrateError(err)) {
    statusCode = 400;
    message = err.message;
  }
  res.status(statusCode).send({
    message: statusCode === 500 ? "Terjadi kesalahan pada server" : message,
  });
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
