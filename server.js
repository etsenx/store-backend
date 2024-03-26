const express = require('express');
const mongoose = require('mongoose');

const app = express();
const MONGO_URI = 'mongodb://127.0.0.1:27017/tripleshop';

const port = 3000;

mongoose.connect(MONGO_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
})

app.get('/', (req, res) => {
  res.send('Hello World!');
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})