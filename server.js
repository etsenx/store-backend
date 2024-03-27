const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const MONGO_URI = 'mongodb://127.0.0.1:27017/tripleshop';
mongoose.connect(MONGO_URI);

const port = 3000;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!');
})

app.get('*', (req, res) => {
  res.send({ message: 'Sumber daya yang diminta tidak ada' });
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})